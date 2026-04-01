/* ================================================================
   VELMO ANALYTICS CLIENT — Amazon/Alibaba style
   Tracking: sessions, events, product stats, shop daily
   Device fingerprint → anonymous → linked on checkout
   ================================================================ */

const VA_SB_URL = 'https://cqpcwqqjbcgklrvnqpxr.supabase.co';
const VA_SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcGN3cXFqYmNna2xydm5xcHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzE4NDEsImV4cCI6MjA3OTI0Nzg0MX0.klx0G4gOHm_vwxIXBPSOTm-V4ax_v9RSacBpDSP3Mgs';

const VA_HEADERS = {
  'apikey': VA_SB_KEY,
  'Authorization': `Bearer ${VA_SB_KEY}`,
  'Content-Type': 'application/json',
};

// ── DEVICE ID ──────────────────────────────────────────────────
// UUID stable stocké en localStorage — survit les navigations
function getDeviceId() {
  let id = localStorage.getItem('va_did');
  if (!id) {
    id = 'dev-' + crypto.randomUUID();
    localStorage.setItem('va_did', id);
  }
  return id;
}

// ── SESSION ────────────────────────────────────────────────────
let _sessionId = null;
let _customerId = localStorage.getItem('va_cid') || null;

async function vaInitSession() {
  const deviceId = getDeviceId();
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
  const landing = window.location.href.split('?')[0];
  const referrer = document.referrer || null;

  try {
    const res = await fetch(`${VA_SB_URL}/rest/v1/velmo_sessions`, {
      method: 'POST',
      headers: { ...VA_HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        device_id: deviceId,
        customer_id: _customerId || null,
        user_agent: navigator.userAgent.substring(0, 200),
        referrer: referrer,
        landing_page: landing,
        is_mobile: isMobile,
      }),
    });
    if (res.ok) {
      const [data] = await res.json();
      _sessionId = data.id;
      _analyticsReady = true;
      localStorage.setItem('va_sid', _sessionId);
    } else if (res.status === 401 || res.status === 403) {
      _analyticsReady = false;
      console.info('[VA] Analytics inactif — migration SQL requise sur Supabase');
    }
  } catch (e) {
    // Offline → use local session ID
    _sessionId = localStorage.getItem('va_sid') || null;
  }
}

// ── EVENT QUEUE (batch pour ne pas spammer le réseau) ──────────
const VA_MAX_QUEUE = 500;    // max events en mémoire (protection OOM)
const VA_MAX_RETRIES = 3;    // tentatives max par batch
const VA_BACKOFF_MS = [2000, 5000, 15000]; // délais entre retries
let _flushRetries = 0;
let _analyticsReady = null;  // null = pas encore vérifié, true/false
let _eventQueue = [];
let _flushTimer = null;

function vaTrack(eventType, { shopId = null, productId = null, meta = {} } = {}) {
  if (!getDeviceId() || _analyticsReady === false) return;
  // Protection contre les queues trop larges (coupure réseau longue)
  if (_eventQueue.length >= VA_MAX_QUEUE) {
    _eventQueue.splice(0, Math.floor(VA_MAX_QUEUE / 4)); // drop les 25% les plus vieux
  }
  _eventQueue.push({
    session_id: _sessionId || null,
    device_id: getDeviceId(),
    customer_id: _customerId || null,
    shop_id: shopId,
    product_id: productId || null,
    event_type: eventType,
    meta,
    created_at: new Date().toISOString(),
  });

  // Also update localStorage behavior (for local recommendation engine)
  if (productId) {
    const type = eventType === 'view_product' ? 'view'
                : eventType === 'add_cart'    ? 'cart'
                : eventType === 'add_wish'    ? 'wish' : null;
    if (type && typeof trackInteraction === 'function') trackInteraction(productId, type); // from app.js (marketplace only)
  }

  // Debounce flush — envoie par batch toutes les 3s
  clearTimeout(_flushTimer);
  _flushTimer = setTimeout(vaFlush, 3000);
}

async function vaFlush() {
  if (!_eventQueue.length || _analyticsReady === false) return;
  const batch = _eventQueue.splice(0, 50); // max 50 events par batch
  try {
    const res = await fetch(`${VA_SB_URL}/rest/v1/velmo_events`, {
      method: 'POST',
      headers: VA_HEADERS,
      body: JSON.stringify(batch),
      signal: typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(10000) : undefined,
    });

    // 401/403 = tables non créées ou anon non autorisé → désactive analytics silencieusement
    if (res.status === 401 || res.status === 403) {
      _analyticsReady = false;
      _eventQueue = []; // vide la queue — inutile de garder les events
      console.info('[VA] Analytics désactivé — exécutez la migration SQL velmo_analytics_system.sql sur Supabase');
      return;
    }
    if (!res.ok && res.status >= 500) throw new Error(`HTTP ${res.status}`);
    _analyticsReady = true;
    _flushRetries = 0; // reset on success

    // Mise à jour stats journalières et stats produits en parallèle
    const shopIds = [...new Set(batch.map(e => e.shop_id).filter(Boolean))];
    const today = new Date().toISOString().split('T')[0];

    for (const sid of shopIds) {
      const shopEvents = batch.filter(e => e.shop_id === sid);
      const views = shopEvents.filter(e => e.event_type === 'view_product').length;
      const cartAdds = shopEvents.filter(e => e.event_type === 'add_cart').length;
      const shopViews = shopEvents.filter(e => e.event_type === 'view_shop').length;

      if (views > 0) vaIncrShopDaily(sid, today, 'product_views', views);
      if (cartAdds > 0) vaIncrShopDaily(sid, today, 'cart_adds', cartAdds);
      if (shopViews > 0) vaIncrShopDaily(sid, today, 'page_views', shopViews);
      vaIncrShopDaily(sid, today, 'unique_visitors', 1);
    }

    // Stats produits
    const productEvents = batch.filter(e => e.product_id);
    const pGroups = {};
    productEvents.forEach(e => {
      if (!pGroups[e.product_id]) pGroups[e.product_id] = { shopId: e.shop_id, views: 0, carts: 0, wishes: 0 };
      if (e.event_type === 'view_product') pGroups[e.product_id].views++;
      if (e.event_type === 'add_cart')     pGroups[e.product_id].carts++;
      if (e.event_type === 'add_wish')     pGroups[e.product_id].wishes++;
    });
    for (const [pid, stats] of Object.entries(pGroups)) {
      if (stats.views > 0) vaIncrProductStat(pid, stats.shopId, 'view_count', stats.views);
      if (stats.carts > 0) vaIncrProductStat(pid, stats.shopId, 'cart_add_count', stats.carts);
      if (stats.wishes > 0) vaIncrProductStat(pid, stats.shopId, 'wishlist_count', stats.wishes);
    }
  } catch (e) {
    if (_flushRetries < VA_MAX_RETRIES) {
      // Remettre en queue + retry avec backoff
      _eventQueue.unshift(...batch);
      const delay = VA_BACKOFF_MS[_flushRetries] || 15000;
      _flushRetries++;
      console.warn(`[VA] flush failed (retry ${_flushRetries}/${VA_MAX_RETRIES} dans ${delay}ms):`, e.message);
      setTimeout(vaFlush, delay);
    } else {
      // Abandonne ce batch après MAX_RETRIES — évite l'accumulation infinie
      _flushRetries = 0;
      console.warn('[VA] batch abandonné après', VA_MAX_RETRIES, 'tentatives');
    }
  }
}

// Flush avant fermeture de page
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') vaFlush();
});

// ── PRODUCT STAT INCREMENT ──────────────────────────────────────
async function vaIncrProductStat(productId, shopId, field, amount = 1) {
  if (_analyticsReady === false) return;
  try {
    await fetch(`${VA_SB_URL}/rest/v1/rpc/velmo_incr_product_stat`, {
      method: 'POST',
      headers: VA_HEADERS,
      body: JSON.stringify({ p_product_id: productId, p_shop_id: shopId, p_field: field, p_amount: amount }),
    });
  } catch (_) { }
}

// ── SHOP DAILY INCREMENT ────────────────────────────────────────
async function vaIncrShopDaily(shopId, date, field, amount = 1) {
  if (_analyticsReady === false) return;
  try {
    await fetch(`${VA_SB_URL}/rest/v1/rpc/velmo_incr_shop_daily`, {
      method: 'POST',
      headers: VA_HEADERS,
      body: JSON.stringify({ p_shop_id: shopId, p_date: date, p_field: field, p_amount: amount }),
    });
  } catch (_) { }
}

// ── CUSTOMER ACCOUNT ─────────────────────────────────────────────
async function vaLinkCustomer(phone, name) {
  if (!phone) return null;
  try {
    const res = await fetch(`${VA_SB_URL}/rest/v1/rpc/velmo_upsert_customer`, {
      method: 'POST',
      headers: VA_HEADERS,
      body: JSON.stringify({ p_phone: phone, p_name: name, p_device_id: getDeviceId() }),
    });
    if (res.ok) {
      const customerId = await res.json();
      _customerId = customerId;
      localStorage.setItem('va_cid', customerId);

      // Lier la session au customer
      if (_sessionId) {
        fetch(`${VA_SB_URL}/rest/v1/velmo_sessions?id=eq.${_sessionId}`, {
          method: 'PATCH',
          headers: VA_HEADERS,
          body: JSON.stringify({ customer_id: customerId }),
        }).catch(() => { });
      }
      return customerId;
    }
  } catch (e) { console.warn('[VA] linkCustomer failed:', e.message); }
  return null;
}

async function vaGetCustomerOrders(phone) {
  if (!phone) return [];
  try {
    const res = await fetch(
      `${VA_SB_URL}/rest/v1/customer_orders?customer_phone=eq.${encodeURIComponent(phone)}&order=created_at.desc&limit=20`,
      { cache: 'no-store', headers: { 'apikey': VA_SB_KEY, 'Authorization': `Bearer ${VA_SB_KEY}`, 'Cache-Control': 'no-cache, no-store' } }
    );
    if (res.ok) return res.json();
  } catch (_) { }
  return [];
}

// ── SEARCH TRACKING ─────────────────────────────────────────────
async function vaTrackSearch(query, resultsCount, shopId = null) {
  if (!query || query.length < 2) return;
  try {
    await fetch(`${VA_SB_URL}/rest/v1/velmo_searches`, {
      method: 'POST',
      headers: VA_HEADERS,
      body: JSON.stringify({
        session_id: _sessionId || null,
        device_id: getDeviceId(),
        shop_id: shopId,
        query: query.toLowerCase().trim(),
        results_count: resultsCount,
        created_at: new Date().toISOString(),
      }),
    });
  } catch (_) { }
}

async function vaTrackSearchClick(query, productId, shopId = null) {
  try {
    await fetch(
      `${VA_SB_URL}/rest/v1/velmo_searches?device_id=eq.${getDeviceId()}&query=eq.${encodeURIComponent(query)}&order=created_at.desc&limit=1`,
      { method: 'PATCH', headers: VA_HEADERS, body: JSON.stringify({ clicked_product_id: productId }) }
    );
  } catch (_) { }
}

// ── SHOP ANALYTICS FETCH (pour le vendeur) ──────────────────────
async function vaGetShopAnalytics(shopId, days = 30) {
  try {
    const res = await fetch(`${VA_SB_URL}/rest/v1/rpc/velmo_shop_analytics_summary`, {
      method: 'POST',
      headers: { ...VA_HEADERS, 'Cache-Control': 'no-cache' },
      body: JSON.stringify({ p_shop_id: shopId, p_days: days }),
    });
    if (res.ok) return res.json();
  } catch (_) { }
  return null;
}

async function vaGetTopProducts(shopId, days = 30, limit = 10) {
  try {
    const res = await fetch(`${VA_SB_URL}/rest/v1/rpc/velmo_top_products`, {
      method: 'POST',
      headers: { ...VA_HEADERS, 'Cache-Control': 'no-cache' },
      body: JSON.stringify({ p_shop_id: shopId, p_days: days, p_limit: limit }),
    });
    if (res.ok) return res.json();
  } catch (_) { }
  return [];
}

// ── TRENDING GLOBAL (marketplace index) ─────────────────────────
async function vaGetGlobalTrending(limit = 20) {
  try {
    const since = new Date(Date.now() - 7 * 86400000).toISOString();
    const res = await fetch(
      `${VA_SB_URL}/rest/v1/velmo_events?event_type=in.(view_product,add_cart)&created_at=gte.${since}&select=product_id,event_type`,
      { headers: { 'apikey': VA_SB_KEY, 'Authorization': `Bearer ${VA_SB_KEY}`, 'Cache-Control': 'no-cache' } }
    );
    if (!res.ok) return [];
    const events = await res.json();
    const scores = {};
    events.forEach(e => {
      if (!e.product_id) return;
      scores[e.product_id] = (scores[e.product_id] || 0) + (e.event_type === 'add_cart' ? 5 : 1);
    });
    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);
  } catch (_) { return []; }
}

// ── INIT ──────────────────────────────────────────────────────────
vaInitSession();

// Track page view after init
setTimeout(() => {
  const page = window.location.pathname.includes('shop') ? 'shop' : 'marketplace';
  vaTrack('page_view', { meta: { page, url: window.location.href } });
}, 500);
