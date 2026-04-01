/* =============================================
   VELMO-MARKETPLACE — app.js (Supabase Live)
   ============================================= */

// ===== SUPABASE CONFIG (REST direct — aucune dépendance CDN) =====
const SUPABASE_URL = 'https://cqpcwqqjbcgklrvnqpxr.supabase.co';
const SB_URL = 'https://cqpcwqqjbcgklrvnqpxr.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcGN3cXFqYmNna2xydm5xcHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzE4NDEsImV4cCI6MjA3OTI0Nzg0MX0.klx0G4gOHm_vwxIXBPSOTm-V4ax_v9RSacBpDSP3Mgs';
const STORAGE = `${SB_URL}/storage/v1/object/public/velmo-media/`;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ===== CACHE LOCALSTORAGE avec TTL =====
function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}
function cacheSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch { }
}

// ===== DEBOUNCE =====
function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// ===== LAZY IMAGE LOADER (IntersectionObserver) =====
const imgObserver = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
        imgObserver.unobserve(img);
      }
    });
  }, { rootMargin: '200px' })
  : null;

function lazyImg(src, alt, cls = '') {
  if (!src) return '';
  if (imgObserver) {
    return `<img data-src="${src}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'/%3E" alt="${alt}" class="${cls}" loading="lazy">`;
  }
  return `<img src="${src}" alt="${alt}" class="${cls}" loading="lazy">`;
}

function observeImages() {
  if (!imgObserver) return;
  document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
}

// Requête GET REST Supabase avec cache
async function sbGet(table, params = '', useCache = false) {
  const cacheKey = `velmo_cache_${table}_${params}`;
  if (useCache) {
    const cached = cacheGet(cacheKey);
    if (cached) { console.log(`⚡ [cache] ${table}`); return cached; }
  }
  const url = `${SB_URL}/rest/v1/${table}?${params}`;
  const res = await fetch(url, {
    headers: {
      'apikey': SB_KEY,
      'Authorization': `Bearer ${SB_KEY}`,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    console.error(`SB 400 [${table}]:`, body);
    throw new Error(body || res.statusText);
  }
  const data = await res.json();
  if (useCache) cacheSet(cacheKey, data);
  return data;
}

// Requête POST REST Supabase
async function sbPost(table, data) {
  const url = `${SB_URL}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`SB POST Error: ${res.statusText}`);
  return res.json();
}

// Requête PATCH REST Supabase
async function sbPatch(table, id, data) {
  const url = `${SB_URL}/rest/v1/${table}?id=eq.${id}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`SB PATCH Error: ${res.statusText}`);
  return res.json();
}

// ===== STATE =====
let PRODUCTS = [];
let SHOPS = [];
let currentSlide = 0;
let currentTab = 'all';
let wishlist = JSON.parse(localStorage.getItem('velmo_wish') || '[]');
let recentIds = JSON.parse(localStorage.getItem('velmo_recent') || '[]');
let cart = JSON.parse(localStorage.getItem('velmo_cart') || '[]');
let user = JSON.parse(localStorage.getItem('velmo_user') || null);

// ===== RECOMMENDATION ENGINE =====
const BK = 'velmo_beh'; // behavior key (compact)
function getBeh() { return JSON.parse(localStorage.getItem(BK) || '{}'); }
function trackInteraction(productId, type) {
  const b = getBeh();
  const id = String(productId);
  if (!b[id]) b[id] = { v: 0, c: 0, w: 0, t: 0 };
  if (type === 'view') b[id].v++;
  if (type === 'cart') b[id].c++;
  if (type === 'wish') b[id].w++;
  b[id].t = Date.now();
  // Garder les 150 entrées les plus récentes
  const keys = Object.keys(b);
  if (keys.length > 150) {
    keys.sort((a, bb) => (b[bb].t || 0) - (b[a].t || 0)).slice(100).forEach(k => delete b[k]);
  }
  localStorage.setItem(BK, JSON.stringify(b));
}
function productScore(id) {
  const d = getBeh()[String(id)];
  if (!d) return 0;
  return (d.v || 0) + (d.c || 0) * 5 + (d.w || 0) * 3;
}
function getPreferredCats() {
  const b = getBeh();
  const cs = {};
  Object.keys(b).forEach(id => {
    const p = PRODUCTS.find(x => String(x.id) === id);
    if (!p) return;
    cs[p.cat] = (cs[p.cat] || 0) + productScore(id);
  });
  return Object.entries(cs).sort((a, bb) => bb[1] - a[1]).map(e => e[0]);
}
function getTrending(limit = 16) {
  const prefCats = getPreferredCats();
  const scored = PRODUCTS.map(p => {
    let s = productScore(String(p.id));
    if (p.oldPrice) s += 2; // promo = boost
    const r = prefCats.indexOf(p.cat);
    if (r === 0) s += 5; else if (r === 1) s += 3; else if (r === 2) s += 1;
    return { ...p, _s: s };
  });
  const hasData = scored.some(p => p._s > 0);
  if (!hasData) {
    // Fallback: promos d'abord puis random
    const withDisc = PRODUCTS.filter(p => p.oldPrice);
    const rest = PRODUCTS.filter(p => !p.oldPrice);
    return [...withDisc, ...rest].slice(0, limit);
  }
  return scored.sort((a, bb) => bb._s - a._s).slice(0, limit);
}
function getForYou(limit = 10) {
  const prefCats = getPreferredCats();
  if (!prefCats.length) return [];
  const topCats = prefCats.slice(0, 2);
  return PRODUCTS
    .filter(p => topCats.includes(p.cat))
    .map(p => ({ ...p, _s: productScore(String(p.id)) }))
    .sort((a, bb) => bb._s - a._s)
    .slice(0, limit);
}

// ⚡ INIT PWA & DARK MODE
document.addEventListener('DOMContentLoaded', () => {
  initPremium();
});

function initPremium() {
  // Register SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => { });
  }
  initPWABanner();
}

// dark mode removed — light only
function toggleDarkMode() { }

// ─── PWA Install Banner ──────────────────────────────────────
let _pwaPrompt = null;

function initPWABanner() {
  // Ne pas afficher si déjà installée en standalone
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) return;

  // Cooldown : ne pas réafficher avant 3 jours si l'user a fermé
  const dismissed = localStorage.getItem('velmo_pwa_dismissed');
  if (dismissed && Date.now() - parseInt(dismissed) < 3 * 24 * 3600 * 1000) return;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

  // Capture l'event Chrome/Android
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _pwaPrompt = e;
    // Afficher après 4 secondes
    setTimeout(() => showPWABanner(), 4000);
  });

  // iOS : afficher manuellement après 5 secondes (pas de beforeinstallprompt)
  if (isIOS) {
    setTimeout(() => showPWABanner(true), 5000);
  }

  // Bouton Installer
  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      hidePWABanner();
      if (_pwaPrompt) {
        _pwaPrompt.prompt();
        const { outcome } = await _pwaPrompt.userChoice;
        _pwaPrompt = null;
        if (outcome === 'accepted') {
          showToast('✅ Velmo Market installé sur votre écran d\'accueil !');
        }
      } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
        openModal('modal-pwa-ios');
      }
    });
  }

  // Bouton Fermer
  const closeBtn = document.getElementById('pwa-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      hidePWABanner();
      localStorage.setItem('velmo_pwa_dismissed', Date.now().toString());
    });
  }

  // Masquer si l'app est installée
  window.addEventListener('appinstalled', () => {
    hidePWABanner();
    showToast('🎉 Velmo Market est maintenant sur votre écran d\'accueil !');
  });
}

function showPWABanner(isIOS = false) {
  const banner = document.getElementById('pwa-banner');
  if (!banner) return;
  // Adapter le texte pour iOS
  if (isIOS) {
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.textContent = 'Comment faire ?';
  }
  banner.classList.add('pwa-visible');
}

function hidePWABanner() {
  const banner = document.getElementById('pwa-banner');
  if (banner) {
    banner.style.animation = 'none';
    banner.style.transition = 'opacity 0.3s, transform 0.3s';
    banner.style.opacity = '0';
    banner.style.transform = 'translateX(-50%) translateY(80px)';
    setTimeout(() => { banner.classList.remove('pwa-visible'); banner.style.display = 'none'; }, 320);
  }
}

// ===== HELPERS =====
function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('./')) return url;
  return STORAGE + url;
}

// Mapping large : tous les synonymes mode/fashion/style → 'mode'
const CAT_ALIASES = {
  mode: ['mode', 'fashion', 'style', 'vêtement', 'vetement', 'habillement', 'textile', 'chaussure', 'bijou', 'accessoire', 'tenue', 'habit', 'lingerie', 'prêt-à-porter', 'pret-a-porter'],
  electronique: ['électron', 'electron', 'phone', 'smartphone', 'informatique', 'tv', 'audio', 'tech', 'high-tech', 'hightech', 'tablette', 'ordinateur', 'console', 'camera', 'photo'],
  beaute: ['beauté', 'beaute', 'cosmét', 'cosmet', 'parfum', 'soin', 'maquillage', 'makeup', 'skincare', 'cheveu', 'nail', 'ongles'],
  maison: ['maison', 'meuble', 'déco', 'deco', 'literie', 'cuisine équipée', 'électroménag', 'electromenag', 'ménager', 'menager', 'intérieur', 'interieur'],
  sport: ['sport', 'fitness', 'gym', 'musculation', 'yoga', 'running', 'football', 'basketball'],
  cuisine: ['aliment', 'nourriture', 'cuisine', 'épicerie', 'epicerie', 'riz', 'boisson', 'alimentaire', 'frais', 'produit local'],
};

function mapCategory(category) {
  if (!category) return 'autre';
  const c = category.toLowerCase();
  for (const [cat, keywords] of Object.entries(CAT_ALIASES)) {
    if (keywords.some(k => c.includes(k))) return cat;
  }
  return 'autre';
}

function formatPrice(n) { return Math.round(n).toLocaleString('fr-FR') + ' GNF'; }
// Génère l'URL boutique : slug en priorité, id en fallback
// Chemin RELATIF pour fonctionner en local (file://) et en prod
function shopUrl(slug, id) {
  if (slug && typeof slug === 'string' && slug.trim()) return `./shop.html?s=${encodeURIComponent(slug.trim())}`;
  if (id) return `./shop.html?id=${encodeURIComponent(id)}`;
  return `./shop.html`; // ⚡ Force absolue du clic, on retourne toujours un lien public
}
function shopLink(slug, id, label, cls = '', style = '') {
  const url = shopUrl(slug, id);
  if (!url) return `<span class="${cls}" style="opacity:.5;cursor:default;${style}">${label}</span>`;
  return `<a href="${url}" class="${cls}"${style ? ` style="${style}"` : ''}>${label}</a>`;
}
function discount(p, op) { return op && op > p ? Math.round((1 - p / op) * 100) : 0; }
function catLabel(cat) {
  const m = { electronique: 'Électronique', mode: 'Mode & Fashion', beaute: 'Beauté', maison: 'Maison', sport: 'Sport', cuisine: 'Alimentation', jouets: 'Jouets', auto: 'Auto', sante: 'Santé', livre: 'Livres', autre: 'Autre' };
  return m[cat] || cat;
}
function catColor(cat) {
  const m = { electronique: 'linear-gradient(135deg,#e8f4fd,#cce5fb)', mode: 'linear-gradient(135deg,#fef0f5,#fce4ef)', beaute: 'linear-gradient(135deg,#f5e6ff,#e8d0fa)', maison: 'linear-gradient(135deg,#fff3e6,#fde3c8)', sport: 'linear-gradient(135deg,#e6f7ef,#c4edd8)', cuisine: 'linear-gradient(135deg,#fffde6,#fff3c4)', autre: 'linear-gradient(135deg,#f0f0f0,#e0e0e0)' };
  return m[cat] || 'var(--gray)';
}
function randomRef() { return 'CMD-' + Math.random().toString(36).substr(2, 6).toUpperCase(); }
function showLoader() { const l = document.getElementById('grid-loader'); if (l) l.style.display = 'block'; }
function hideLoader() { const l = document.getElementById('grid-loader'); if (l) l.style.display = 'none'; }

const PREMIUM_IMAGES = {
  electronique: [
    './images/electronique-tech.png',
    './images/elctronique-tech.png',
  ],
  mode: [
    './images/mode-africain.png',
    './images/mode-femme-moderne.png',
    './images/mode-femme.png',
    './images/mode-jeune.png',
    './images/mode-jeune-montres.png'
  ],
  beaute: [
    './images/cometique.png',
    './images/cosmetique-me.png'
  ],
  maison: [
    './images/electromenager.png',
    './images/electromenager-f.png',
    './images/electromenager-femmes.png',
    './images/electrmenager-femme.png'
  ],
  cuisine: [
    './images/electromenager.png' // Fallback pour la cuisine
  ]
};

// ===== LOAD FROM SUPABASE (fetch REST — aucun SDK) =====
async function loadProducts() {
  showLoader();
  try {
    let shopFilter = '';
    if (SHOPS.length > 0) {
      const ids = SHOPS.map(s => s.id).join(',');
      shopFilter = `&shop_id=in.(${ids})`;
    }
    // colonnes réelles Supabase (superset du schema WatermelonDB)
    const params = `select=id,name,description,category,price_sale,price_regular,promo_price,photo_url,photo,quantity,shop_id&is_active=eq.true&is_published=eq.true&order=created_at.desc&limit=1000${shopFilter}`;
    const data = await sbGet('products', params, true); // ⚡ avec cache 5 min

    PRODUCTS = data.map((p, idx) => {
      const shop = SHOPS.find(s => s.id === p.shop_id);
      const cat = mapCategory(p.category);

      // photo_url en priorité, fallback sur photo — on garde seulement les vraies images produit
      let pUrl = p.photo_url || p.photo || null;
      const _hasRealImg = !!(pUrl && !pUrl.includes('placeholder') && !pUrl.includes('default'));
      if (_hasRealImg && !pUrl.startsWith('http') && !pUrl.startsWith('data:') && !pUrl.startsWith('./')) {
        pUrl = STORAGE + pUrl;
      }
      if (!_hasRealImg) pUrl = null;

      // promo_price = prix soldé (priorité) sinon price_regular = ancien prix barré
      const hasPromo = p.promo_price && p.promo_price > 0 && p.promo_price < p.price_sale;
      const hasRegular = p.price_regular && p.price_regular > p.price_sale;

      return {
        id: p.id,
        name: p.name,
        desc: p.description || '',
        cat: cat,
        price: hasPromo ? p.promo_price : p.price_sale,
        oldPrice: hasPromo ? p.price_sale : (hasRegular ? p.price_regular : null),
        qty_stock: p.quantity ?? null,
        photo_url: pUrl,
        _hasRealImg,
        emoji: catEmoji(cat),
        shop_name: shop?.name || 'Boutique Velmo',
        shop_slug: shop?.slug || null,
        shop_id: p.shop_id,
        is_verified: shop?.is_verified || false,
      };
    });
    // Afficher uniquement les produits avec une vraie photo
    PRODUCTS = PRODUCTS.filter(p => p._hasRealImg);
    console.log(`✅ ${PRODUCTS.length} produits avec image chargés`);
  } catch (e) {
    console.error('❌ Produits:', e.message);
    PRODUCTS = [];
  } finally {
    hideLoader();
    renderProducts();
    renderFlashDeals();
    renderShops();
  }
}

async function loadShops() {
  try {
    // is_online_active=eq.true : boutiques qui ont activé leur vitrine (is_public non requis)
    const params = 'select=id,name,slug,logo,is_verified,category,orders_count&is_active=eq.true&is_online_active=eq.true&order=orders_count.desc&limit=30';
    SHOPS = await sbGet('shops', params, true); // ⚡ avec cache 5 min
    console.log(`✅ ${SHOPS.length} boutiques chargées`);
  } catch (e) {
    console.warn('⚠️ Retry shops sans orders_count...', e.message);
    try {
      const params2 = 'select=id,name,slug,logo,is_verified,category&is_active=eq.true&is_online_active=eq.true&order=name.asc&limit=30';
      SHOPS = await sbGet('shops', params2, true);
      console.log(`✅ ${SHOPS.length} boutiques chargées (fallback)`);
    } catch (e2) {
      console.error('❌ Boutiques:', e2.message);
      SHOPS = [];
    }
  } finally {
    renderShops();
  }
}

async function submitOrder(orderData) {
  // 🛡️ SPRINT 5: SPLIT CHECKOUT - Grouper le panier par shop_id
  const byShop = {};
  orderData.items.forEach(item => {
    // Si shop_id manque, on essaie de le retrouver dans PRODUCTS, sinon fallback
    const sid = item.shop_id || PRODUCTS.find(p => p.id === item.id)?.shop_id || 'unknown';
    if (!byShop[sid]) byShop[sid] = [];
    byShop[sid].push(item);
  });

  const shopIds = Object.keys(byShop);
  console.log(`📡 [Checkout] Splitting order into ${shopIds.length} shop(s)...`);

  const refs = [];
  const errors = [];
  let globalTotal = 0;

  // 1. Envoyer les commandes boutique par boutique
  for (const [shopId, items] of Object.entries(byShop)) {
    const shopTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    globalTotal += shopTotal;
    const ref = randomRef();

    try {
      await sbPost('customer_orders', {
        shop_id: shopId,
        customer_name: orderData.name,
        customer_phone: orderData.phone,
        customer_address: orderData.address,
        delivery_method: orderData.delivery,
        notes: orderData.note || null,
        total_amount: shopTotal,
        status: 'pending',
        short_ref: ref,
        items_json: items.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.qty,
          photo_url: i.photo_url || null,
        })),
      });

      refs.push(ref);
      console.log(`✅ Commande ${ref} réussie pour boutique ${shopId}`);

      // Notify shop via Telegram (non-bloquant)
      const shopObj = SHOPS.find(s => s.id === shopId);
      notifyOrderTelegram({
        shopId, shopName: shopObj?.name || 'Boutique',
        ref, name: orderData.name, phone: orderData.phone,
        address: orderData.address, delivery: orderData.delivery,
        payment: orderData.note || 'Paiement à la livraison',
        total: shopTotal, items,
      }).catch(() => { });

    } catch (e) {
      console.error(`❌ Échec boutique ${shopId}:`, e.message);
      errors.push(`Boutique ${shopId}: ${e.message}`);

      // Fallback local
      const localOrders = JSON.parse(localStorage.getItem('velmo_orders') || '[]');
      localOrders.push({ ref: ref + '(local)', shopId, items, total: shopTotal, name: orderData.name, phone: orderData.phone, date: new Date().toISOString() });
      if (localOrders.length > 50) localOrders.splice(0, localOrders.length - 50);
      localStorage.setItem('velmo_orders', JSON.stringify(localOrders));
      refs.push(ref + '(local)');
    }
  }

  // 2. Actions de fin de processus (UNE SEULE FOIS APRÈS TOUTES LES COMMANDES)
  if (refs.length > 0) {
    // Vider le panier seulement si au moins une commande a réussi (ou été stockée localement)
    cart = [];
    saveCart();
    updateCartBadge();
    renderCart();
    closeAll();

    // Célébration !
    fireConfetti();

    // Afficher un succès global avec toutes les références
    showOrderSuccess({
      ref: refs.join(', '),
      name: orderData.name,
      total: globalTotal,
      phone: orderData.phone,
      shopCount: shopIds.length
    });
  }

  if (errors.length > 0) {
    showToast(`⚠️ Certaines commandes ont été enregistrées localement (${errors.length} erreurs réseau)`);
  }

  return refs.join(', ');
}

// ───── TELEGRAM NOTIFY (marketplace orders) ──────────────────────────────
async function notifyOrderTelegram({ shopId, shopName, ref, name, phone, address, delivery, payment, total, items }) {
  const MAX_RETRIES = 3;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Vérifier si la boutique a un abonné Telegram actif
      const subs = await sbGet('telegram_subscribers', `shop_id=eq.${shopId}&status=eq.active&select=chat_id&limit=1`);
      if (!subs || !subs.length) return; // Pas de Telegram configuré pour cette boutique

      const chatId = subs[0].chat_id;
      const delivLabel = delivery === 'pickup' ? 'Retrait boutique' : 'Livraison à domicile';
      const itemLines = items.map(i => `  • ${i.name} ×${i.qty} — ${formatPrice(i.price * i.qty)}`).join('\n');

      const text = [
        `🛒 *Nouvelle commande — ${shopName}*`,
        ``,
        `📦 Réf: \`${ref}\``,
        `👤 Client: *${name}*`,
        `📞 Tél: ${phone}`,
        ...(address ? [`📍 Adresse: ${address}`] : []),
        `🚚 ${delivLabel}`,
        `💳 ${payment}`,
        ``,
        `*Articles:*`,
        itemLines,
        ``,
        `💰 *Total: ${formatPrice(total)}*`,
        ``,
        `_Répondez au client rapidement pour confirmer._`,
      ].join('\n');

      const res = await fetch(`${SB_URL}/functions/v1/telegram-notify`, {
        method: 'POST',
        headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
      });
      if (res.ok || res.status === 400) return; // 400 = bad format, don't retry
      throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt))); // backoff: 1s, 2s
      } else {
        console.warn('[Telegram] notify failed after retries:', e.message);
      }
    }
  }
}

// ===== EMOJI HELPER =====
function catEmoji(cat) {
  const m = { electronique: '📱', mode: '👗', beaute: '💄', maison: '🏠', sport: '⚽', cuisine: '🍎', jouets: '🎮', auto: '🚗', sante: '💊', livre: '📚', autre: '📦' };
  return m[cat] || '📦';
}

// ===== PRELOAD HERO IMAGES =====
function preloadHeroImages() {
  // Précharger les 4 premières images du hero pour un démarrage instantané
  const first4 = HERO_IMAGES.slice(0, 4);
  first4.forEach(item => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = item.img;
    document.head.appendChild(link);
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  preloadHeroImages();
  updateCartBadge();
  updateWishBadge();
  startSlider();
  startCountdown();
  updateUserUI();
  renderRecent();

  // Shops + Produits en PARALLÈLE (plus rapide !)
  await Promise.all([loadShops(), loadProductsParallel()]);

  // Search listeners avec debounce (recherche en temps réel)
  const si = document.getElementById('search-input');
  const sb = document.getElementById('search-btn');
  const debouncedSearch = debounce(doSearch, 300);
  if (si) {
    si.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    si.addEventListener('input', debouncedSearch); // Recherche en temps réel !
  }
  if (sb) sb.addEventListener('click', doSearch);

  // Close mega menu outside click
  document.addEventListener('click', e => {
    const mm = document.getElementById('mega-menu');
    const btn = document.getElementById('nav-all-btn');
    if (mm && mm.classList.contains('open') && !mm.contains(e.target) && btn && !btn.contains(e.target)) {
      mm.classList.remove('open');
    }
  });

  // Lang btns
  const fr = document.getElementById('btn-fr');
  const en = document.getElementById('btn-en');
  if (fr) fr.addEventListener('click', () => { fr.classList.add('active'); en && en.classList.remove('active'); });
  if (en) en.addEventListener('click', () => {
    en.classList.add('active'); fr && fr.classList.remove('active');
    showToast('🌐 English version coming soon!');
  });

  // Handle incoming query params (Redirections from React app)
  const queryParams = new URLSearchParams(window.location.search);
  const trackId = queryParams.get('track');
  const receiptId = queryParams.get('receipt');

  if (trackId) {
    const trackInput = document.getElementById('track-ref');
    if (trackInput) {
      trackInput.value = trackId;
      openModal('modal-track');
      if (typeof trackOrder === 'function') trackOrder();
    }
  } else if (receiptId) {
    // Si c'est un reçu, on essaie de charger les détails de la commande
    showToast(`🧾 Affichage du reçu : ${receiptId}`);
    // On pourrait ici appeler une fonction spécifique pour le reçu si elle existe
    // Pour l'instant on ouvre juste le tracking qui affiche les détails
    const trackInput = document.getElementById('track-ref');
    if (trackInput) {
      trackInput.value = receiptId;
      openModal('modal-track');
      if (typeof trackOrder === 'function') trackOrder();
    }
  }
});

// Chargement produits indépendant de shops (parallel fallback)
async function loadProductsParallel() {
  // Attente shops si déjà en cours
  if (SHOPS.length === 0) {
    // petite attente pour laisser loadShops se terminer
    await new Promise(r => setTimeout(r, 600));
  }
  await loadProducts();
}

// ===== SEARCH =====
function doSearch() {
  const q = (document.getElementById('search-input')?.value || '').trim().toLowerCase();
  if (!q) { currentTab = 'all'; renderProducts(); return; }
  const results = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.cat.toLowerCase().includes(q) ||
    (p.desc || '').toLowerCase().includes(q) ||
    (p.shop_name || '').toLowerCase().includes(q)
  );
  // Search results = flat grid (not category rows)
  const grid = document.getElementById('products-grid');
  // cat-mode removed
  renderProductsData(results);
  scrollToProducts();
  if (typeof vaTrackSearch === 'function') vaTrackSearch(q, results.length, null);
}

// ===== SLIDER =====
const HERO_IMAGES = [
  { img: './images/electronique-tech.png', cat: 'electronique' },
  { img: './images/elctronique-tech.png', cat: 'electronique' },
  { img: './images/mode-femme-moderne.png', cat: 'mode' },
  { img: './images/mode-femme.png', cat: 'mode' },
  { img: './images/mode-africain.png', cat: 'mode' },
  { img: './images/mode-jeune.png', cat: 'mode' },
  { img: './images/mode-jeune-montres.png', cat: 'mode' },
  { img: './images/cometique.png', cat: 'beaute' },
  { img: './images/cosmetique-me.png', cat: 'beaute' },
  { img: './images/electromenager-femmes.png', cat: 'maison' },
  { img: './images/electromenager-f.png', cat: 'maison' },
  { img: './images/electrmenager-femme.png', cat: 'maison' },
  { img: './images/electromenager.png', cat: 'maison' }
];

function goSlide(n) {
  const slides = document.querySelectorAll('.hero-bg-slide');
  if (!slides.length) return;
  slides[currentSlide].classList.remove('active');
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
}
function nextSlide() {
  const slides = document.querySelectorAll('.hero-bg-slide');
  if (!slides.length) return;
  goSlide((currentSlide + 1) % slides.length);
}
function prevSlide() {
  const slides = document.querySelectorAll('.hero-bg-slide');
  if (!slides.length) return;
  goSlide((currentSlide - 1 + slides.length) % slides.length);
}
function startSlider() {
  const container = document.getElementById('hero-slides');
  if (container) {
    // Shuffle images dynamically
    const shuffled = [...HERO_IMAGES].sort(() => 0.5 - Math.random());
    container.innerHTML = shuffled.map((item, index) =>
      `<div class="hero-bg-slide ${index === 0 ? 'active' : ''}" style="background-image:url('${item.img}')" onclick="filterByCategory('${item.cat}');scrollToProducts();"></div>`
    ).join('');
  }
  setInterval(nextSlide, 5000);
}

// ===== COUNTDOWN =====
function startCountdown() {
  const end = new Date();
  end.setHours(end.getHours() + 11, end.getMinutes() + 59, end.getSeconds() + 59);
  const ch = document.getElementById('ch');
  const cm = document.getElementById('cm');
  const cs = document.getElementById('cs');
  if (!ch || !cm || !cs) return;
  const update = () => {
    const diff = end - new Date();
    if (diff <= 0) { ch.textContent = cm.textContent = cs.textContent = '00'; return; }
    ch.textContent = String(Math.floor(diff / 3600000)).padStart(2, '0');
    cm.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    cs.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  };
  update();
  setInterval(update, 1000);
}

// ===== MEGA MENU =====
function toggleMegaMenu() {
  document.getElementById('mega-menu')?.classList.toggle('open');
}

// ===== CATCHY PHRASES per category (Amazon/Takealot style) =====
const CAT_PHRASES = {
  electronique: { title: '📱 Le meilleur de la tech en Guinée', sub: 'Smartphones, TV, audio et accessoires', color: 'linear-gradient(135deg,#e8f4fd,#cce5fb)' },
  mode: { title: '👗 La mode qui vous ressemble', sub: 'Vêtements, chaussures et bijoux tendance', color: 'linear-gradient(135deg,#fef0f5,#fce4ef)' },
  beaute: { title: '💄 Prenez soin de vous', sub: 'Cosmétiques, parfums et soins du quotidien', color: 'linear-gradient(135deg,#f5e6ff,#e8d0fa)' },
  maison: { title: '🏠 Créez votre intérieur de rêve', sub: 'Meubles, déco et électroménager', color: 'linear-gradient(135deg,#fff3e6,#fde3c8)' },
  cuisine: { title: '🍎 Le goût de chez vous', sub: 'Épicerie, produits frais et cuisine locale', color: 'linear-gradient(135deg,#fffde6,#fff3c4)' },
  sport: { title: '⚽ Dépassez vos limites', sub: 'Équipement sportif et fitness', color: 'linear-gradient(135deg,#e6f7ef,#c4edd8)' },
  autre: { title: '📦 Découvrez nos produits', sub: 'Des trouvailles uniques rien que pour vous', color: 'linear-gradient(135deg,#f0f0f0,#e0e0e0)' },
};
const CAT_ORDER = ['electronique', 'mode', 'beaute', 'maison', 'cuisine', 'sport', 'autre'];

// ===== RENDER PRODUCTS =====
function getCatProducts(cat) {
  if (!cat || cat === 'all') return PRODUCTS;
  return PRODUCTS.filter(p => p.cat === cat);
}

function showGrid() {
  const loader = document.getElementById('products-loader');
  const grid = document.getElementById('products-grid');
  if (loader) loader.style.display = 'none';
  if (grid) grid.classList.remove('hidden');
}

function renderProducts() {
  showGrid();
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  if (currentTab === 'all') {
    renderCategoryRows(PRODUCTS, grid);
  } else {
    renderProductsData(getCatProducts(currentTab));
  }
}

function filterByCategory(rawCat) {
  if (!rawCat || rawCat === 'all') { currentTab = 'all'; renderProducts(); scrollToProducts(); return; }
  const normalised = mapCategory(rawCat);
  currentTab = normalised;
  document.querySelectorAll('.ftab').forEach(b => {
    b.classList.toggle('active',
      b.getAttribute('onclick')?.includes(`'${normalised}'`) ||
      b.getAttribute('onclick')?.includes(`"${normalised}"`) ||
      (normalised === 'all' && b.getAttribute('onclick')?.includes("'all'")));
  });
  renderProducts();
  scrollToProducts();
}

function renderProductsData(data) {
  showGrid();
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  if (!data.length) {
    const isSearch = (document.getElementById('search-input')?.value || '').trim().length > 0;
    grid.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#6b7280;grid-column:1/-1">
        <p style="font-size:3rem">${isSearch ? '🔍' : '🛍️'}</p>
        <p style="margin-top:14px;font-size:1rem;font-weight:600;color:#111827">${isSearch ? 'Aucun résultat' : 'Aucun produit disponible'}</p>
        <p style="margin-top:6px;font-size:.85rem">${isSearch ? 'Essayez avec d\'autres mots-clés' : 'Revenez bientôt !'}</p>
        ${isSearch ? `<button onclick="document.getElementById('search-input').value='';renderProducts()" style="margin-top:16px;padding:10px 20px;background:#f97316;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600">Voir tous les produits</button>` : ''}
      </div>`;
    return;
  }
  grid.innerHTML = `<div class="prod-grid">${data.map(p => productCardHTML(p)).join('')}</div>`;
  observeImages();
}

// ===== CATEGORY SECTIONS (Amazon-style vertical grid) =====
function catSectionHTML(title, prods, cat) {
  const viewAll = cat ? `<button class="see-all" onclick="filterByCategory('${cat}');scrollToProducts()">Voir tout →</button>` : '';
  return `
  <div class="cat-section">
    <div class="cat-section-header">
      <h2 class="cat-title">${title}</h2>
      ${viewAll}
    </div>
    <div class="prod-grid">${prods.map(p => productCardHTML(p)).join('')}</div>
  </div>`;
}

function renderCategoryRows(products, container) {
  if (!products.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#6b7280">
        <p style="font-size:3rem">🛍️</p>
        <p style="margin-top:14px;font-size:1rem;font-weight:600;color:#111827">Aucun produit disponible pour le moment</p>
        <p style="margin-top:6px;font-size:.85rem">Les boutiques partenaires ajoutent de nouveaux produits chaque jour</p>
      </div>`;
    return;
  }

  // Group by category
  const groups = {};
  products.forEach(p => { if (!groups[p.cat]) groups[p.cat] = []; groups[p.cat].push(p); });

  let html = '';

  // 🔥 Trending first (promos + popular)
  const trending = getTrending(8);
  if (trending.length >= 2) html += catSectionHTML('🔥 Tendances du moment', trending, null);

  // Per-category sections (max 8 products each, "see all" to view more)
  for (const cat of CAT_ORDER) {
    const prods = groups[cat];
    if (!prods?.length) continue;
    const phrase = CAT_PHRASES[cat] || { title: catLabel(cat) };
    html += catSectionHTML(phrase.title, prods.slice(0, 8), cat);
  }

  container.innerHTML = html || '<div style="text-align:center;padding:60px 20px;color:#6b7280">🛍️ Aucun produit</div>';
  observeImages();
}

// ─── Legacy stubs (referenced in some places) ─────────────
function buildCatRowCards(prods) { return prods.map(p => productCardHTML(p)).join(''); }
// Legacy stubs (no longer used but kept for safety)
function stdCardHTML(p) { return productCardHTML(p); }
function heroCardHTML(p) { return productCardHTML(p); }
function quadCardHTML(prods) { return prods.map(p => productCardHTML(p)).join(''); }
function duoCardHTML(p1, p2) { return productCardHTML(p1) + productCardHTML(p2); }
function catRowCardHTML(p) { return productCardHTML(p); }
function scrollCatRow() { }

// ── CLEAN PRODUCT CARD (Amazon-style) ──────────────────────────
function productCardHTML(p) {
  const disc = discount(p.price, p.oldPrice);
  const oos = p.qty_stock !== null && p.qty_stock <= 0;
  const inCart = cart.some(i => i.id === p.id);
  const img = getImgUrl(p.photo_url);

  const imgContent = img
    ? `<img data-src="${img}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'/%3E" alt="${p.name.replace(/"/g,"'")}\" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';
  const emojiContent = `<div class="pcard-emoji" style="display:${img ? 'none' : 'flex'};align-items:center;justify-content:center;width:100%;height:100%">${p.emoji}</div>`;

  const btnLabel = oos ? 'Indisponible' : (inCart ? '✓ Dans le panier' : 'Ajouter au panier');

  return `
<div class="pcard" id="pcard-${p.id}" ${oos ? 'style="opacity:.65"' : ''}>
  <div class="pcard-img" onclick="${oos ? '' : `openProduct('${p.id}')`}">
    ${imgContent}${emojiContent}
    ${disc > 0 ? `<span class="pcard-disc">-${disc}%</span>` : ''}
    ${oos ? `<div class="pcard-oos">Rupture</div>` : ''}
  </div>
  <div class="pcard-body">
    <p class="pcard-name">${p.name}</p>
    <p class="pcard-price">${formatPrice(p.price)}</p>
    ${p.oldPrice ? `<p class="pcard-old">${formatPrice(p.oldPrice)}</p>` : ''}
    <button class="pcard-btn ${inCart ? 'in-cart' : ''}"
      onclick="event.stopPropagation();${oos ? '' : `addToCart('${p.id}')`}"
      ${oos ? 'disabled' : ''}>
      ${btnLabel}
    </button>
  </div>
</div>`;
}


// ===== FLASH DEALS =====
function renderFlashDeals() {
  const grid = document.getElementById('flash-grid');
  const section = document.getElementById('flash-section');
  if (!grid) return;

  const deals = PRODUCTS
    .filter(p => p.oldPrice && p.oldPrice > p.price && discount(p.price, p.oldPrice) >= 5)
    .sort((a, b) => discount(b.price, b.oldPrice) - discount(a.price, a.oldPrice))
    .slice(0, 10);

  if (!deals.length) { if (section) section.style.display = 'none'; return; }
  if (section) section.style.display = '';

  grid.innerHTML = deals.map(p => {
    const disc = discount(p.price, p.oldPrice);
    const img = getImgUrl(p.photo_url);
    return `
    <div class="flash-card" onclick="openProduct('${p.id}')">
      <div class="flash-img">
        ${img ? `<img src="${img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">` : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:2.4rem">${p.emoji}</div>`}
        <span class="flash-badge">-${disc}%</span>
      </div>
      <div class="flash-info">
        <div class="flash-name">${p.name}</div>
        <span class="flash-price">${formatPrice(p.price)}</span>
        <span class="flash-old">${formatPrice(p.oldPrice)}</span>
      </div>
    </div>`;
  }).join('');
}

// ===== SHOPS =====
function renderShops() {
  const container = document.getElementById('shops-scroll');
  const section = document.querySelector('.shops-section');
  if (!container) return;
  if (!SHOPS.length) { if (section) section.style.display = 'none'; return; }
  if (section) section.style.display = '';

  const prodCountByShop = {};
  PRODUCTS.forEach(p => { prodCountByShop[p.shop_id] = (prodCountByShop[p.shop_id] || 0) + 1; });

  // Keep the "Boutiques" label chip, then append shop chips
  const label = container.querySelector('div.text-xs');
  const chipsHTML = SHOPS.map(s => {
    const logo = getImgUrl(s.logo);
    const initial = (s.name || '?')[0].toUpperCase();
    const prodCount = prodCountByShop[s.id] || 0;
    const sub = s.is_verified ? '✓ Vérifié' : (prodCount > 0 ? `${prodCount} produit${prodCount > 1 ? 's' : ''}` : (s.category || 'Boutique'));
    const href = shopUrl(s.slug, s.id);
    return `
    <a href="${href}" class="shop-chip">
      <div class="shop-chip-avatar" style="background:${shopColor(s.name)}">
        ${logo ? `<img src="${logo}" alt="${s.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span style="display:none">${initial}</span>` : `<span>${initial}</span>`}
      </div>
      <div>
        <div class="shop-chip-name">${s.name}</div>
        <div class="shop-chip-badge">${sub}</div>
      </div>
    </a>`;
  }).join('');

  container.innerHTML = `<div class="text-xs text-gray-400 font-semibold uppercase tracking-wide flex-shrink-0 self-center">Boutiques</div>${chipsHTML}`;
}

function shopColor(name) {
  const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#ef4444'];
  let hash = 0;
  for (let c of (name || '')) hash = c.charCodeAt(0) + hash * 31;
  return colors[Math.abs(hash) % colors.length];
}

// ===== FILTER TABS =====
function setTab(el, cat) {
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  currentTab = cat;
  renderProducts();
}

// ===== PRODUCT MODAL =====
function openProduct(id) {
  const p = PRODUCTS.find(x => String(x.id) === String(id));
  if (!p) return;
  if (typeof vaTrack === 'function') vaTrack('view_product', { productId: id, shopId: p.shop_id || null });
  else trackInteraction(id, 'view'); // 📊 track view
  const disc = discount(p.price, p.oldPrice);
  const img = getImgUrl(p.photo_url);
  window._pmId = id;
  window._pmQty = 1;

  const outOfStock = p.qty_stock !== null && p.qty_stock <= 0;
  const lowStock = p.qty_stock !== null && p.qty_stock > 0 && p.qty_stock <= 3;

  document.getElementById('product-modal-body').innerHTML = `
    <div class="pm-grid">
      <div class="pm-img" style="background:${catColor(p.cat)};overflow:hidden;border-radius:12px;display:flex;align-items:center;justify-content:center;min-height:220px;position:relative">
        ${img ? `<img src="${img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''}
        <span style="${img ? 'display:none' : 'display:flex'};font-size:4rem;align-items:center;justify-content:center;width:100%;height:100%">${p.emoji}</span>
        ${disc > 0 ? `<span style="position:absolute;top:12px;left:12px;background:#ff3b30;color:#fff;font-size:.8rem;font-weight:800;padding:4px 10px;border-radius:6px">-${disc}%</span>` : ''}
      </div>
      <div class="pm-info">
        <div class="product-category">${catLabel(p.cat)}</div>
        ${p.shop_name ? `<div style="font-size:.78rem;color:var(--text2);margin:4px 0">🏪 ${shopLink(p.shop_slug, p.shop_id, p.shop_name, '', 'color:var(--orange);font-weight:600')} ${p.is_verified ? '<span style="color:#00c853;font-weight:700">✓ Vérifié</span>' : ''}</div>` : ''}
        <h2 style="margin:8px 0 6px;font-size:1.2rem">${p.name}</h2>
        <div class="product-price" style="margin:10px 0">
          <span class="price-current" style="font-size:1.5rem">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="price-old" style="font-size:1rem">${formatPrice(p.oldPrice)}</span>` : ''}
        </div>
        ${p.desc ? `<p style="font-size:.85rem;color:var(--text2);line-height:1.6;margin-bottom:14px">${p.desc}</p>` : ''}
        ${lowStock ? `<div style="font-size:.82rem;color:#e53935;font-weight:700;margin-bottom:10px;padding:8px 12px;background:#fff5f5;border-radius:8px;border-left:3px solid #e53935">⚠️ Plus que ${p.qty_stock} unité${p.qty_stock > 1 ? 's' : ''} disponible${p.qty_stock > 1 ? 's' : ''} !</div>` : ''}
        ${outOfStock ? `<div style="font-size:.88rem;color:#e53935;font-weight:700;margin-bottom:10px;padding:10px 14px;background:#fff0f0;border-radius:8px;text-align:center">❌ Ce produit est actuellement en rupture de stock</div>` : `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px;font-size:.8rem;color:#00a849">
          <span>🚚 Livraison disponible</span>
          <span>💳 Paiement à la livraison</span>
        </div>
        <div class="pm-qty">
          <label style="font-size:.85rem;font-weight:600">Quantité :</label>
          <div class="qty-controls" style="margin-top:6px">
            <button class="qty-btn" onclick="pmQty(-1)">−</button>
            <span class="qty-val" id="pm-qty">1</span>
            <button class="qty-btn" onclick="pmQty(1)">+</button>
          </div>
        </div>
        ${(() => {
        const item = cart.find(i => i.id === p.id);
        return item ? `<div style="margin-top:12px;font-size:0.75rem;padding:6px 10px;background:#f0f9ff;color:#0369a1;border-radius:6px;display:flex;align-items:center;gap:6px;font-weight:600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
            ${item.qty} déjà dans votre panier
          </div>` : '';
      })()}
        <button class="btn-primary full-width" onclick="addToCartQty('${p.id}')" style="margin-top:14px;margin-bottom:10px">🛒 Ajouter au panier</button>`}
        <button class="btn-ghost full-width" onclick="toggleWish('${p.id}')" style="color:var(--text);border-color:var(--gray2)">
          ${wishlist.includes(id) ? '❤️ Retirer des favoris' : '🤍 Ajouter aux favoris'}
        </button>
      </div>
    </div>`;
  openModal('modal-product');
  addToRecent(id);
}

function pmQty(d) {
  window._pmQty = Math.max(1, (window._pmQty || 1) + d);
  const el = document.getElementById('pm-qty');
  if (el) el.textContent = window._pmQty;
}
function addToCartQty(id) {
  const qty = window._pmQty || 1;
  for (let i = 0; i < qty; i++) addToCart(id, true);
  window._pmQty = 1;
  closeModal('modal-product');
  showToast('✅ Ajouté au panier !');
  toggleCart();
}

// ===== RECENTLY VIEWED =====
function addToRecent(id) {
  recentIds = [id, ...recentIds.filter(x => x !== id)].slice(0, 6);
  localStorage.setItem('velmo_recent', JSON.stringify(recentIds));
  renderRecent();
}
function renderRecent() {
  const sec = document.getElementById('recently-section');
  const grid = document.getElementById('recently-grid');
  if (!sec || !grid) return;
  const data = recentIds.map(id => PRODUCTS.find(p => String(p.id) === String(id))).filter(Boolean);
  if (!data.length) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  grid.innerHTML = data.map(p => productCardHTML(p)).join('');
}

// ===== CART =====
function addToCart(id, silent = false) {
  const p = PRODUCTS.find(x => String(x.id) === String(id));
  if (!p) return;
  if (typeof vaTrack === 'function') vaTrack('add_cart', { productId: id, shopId: p.shop_id || null });
  else trackInteraction(id, 'cart'); // 📊 track cart add
  const ex = cart.find(i => i.id === id);
  if (ex) { ex.qty++; }
  else { cart.push({ id: p.id, name: p.name, emoji: p.emoji, price: p.price, qty: 1, photo_url: p.photo_url || null, shop_id: p.shop_id || null, shop_name: p.shop_name || '' }); }
  saveCart();
  updateCartBadge();
  renderCart();
  refreshCartButtons(); // Refresh add-to-cart button states
  if (!silent) { showToast(`✅ "${p.name}" ajouté !`); animateBadge('cart-badge'); }
}

// Light update: just toggle button state without re-rendering the full grid
function refreshCartButtons() {
  document.querySelectorAll('[id^="pcard-"]').forEach(card => {
    const id = card.id.replace('pcard-', '');
    const btn = card.querySelector('.pcard-btn');
    if (!btn) return;
    const inCart = cart.some(i => i.id === id);
    const oos = btn.disabled;
    if (!oos) {
      btn.classList.toggle('in-cart', inCart);
      btn.textContent = inCart ? '✓ Dans le panier' : 'Ajouter au panier';
    }
  });
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(); updateCartBadge(); renderCart();
  refreshCartButtons(); // Refresh add-to-cart button states
}

function changeQty(id, d) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + d);
  saveCart(); renderCart(); updateCartBadge();
}

function saveCart() { localStorage.setItem('velmo_cart', JSON.stringify(cart)); }

function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  ['cart-badge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = total; el.classList.toggle('show', total > 0); }
  });
  const cc = document.getElementById('cart-count');
  if (cc) cc.textContent = total;
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const empty = document.getElementById('cart-empty');
  const footer = document.getElementById('cart-footer');
  if (!container) return;
  if (!cart.length) {
    if (empty) empty.style.display = 'flex';
    if (footer) footer.style.display = 'none';
    container.innerHTML = '';
    if (empty) container.appendChild(empty);
    return;
  }
  if (empty) empty.style.display = 'none';
  if (footer) footer.style.display = 'block';
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  container.innerHTML = cart.map(i => {
    const img = getImgUrl(i.photo_url);
    return `
    <div class="cart-item">
      <div class="cart-item-img" style="${img ? '' : 'font-size:1.8rem;display:flex;align-items:center;justify-content:center'}">
        ${img ? `<img src="${img}" alt="${i.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px" onerror="this.outerHTML='<span style=font-size:1.8rem>${i.emoji}</span>'">` : i.emoji}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${i.name}</div>
        ${i.shop_name ? `<div style="font-size:.7rem;color:var(--text2)">${i.shop_name}</div>` : ''}
        <div class="cart-item-price">${formatPrice(i.price)}</div>
        <div class="qty-controls" style="margin-top:6px">
          <button class="qty-btn" onclick="changeQty('${i.id}',-1)">−</button>
          <span class="qty-val">${i.qty}</span>
          <button class="qty-btn" onclick="changeQty('${i.id}',1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${i.id}')">🗑️</button>
    </div>`;
  }).join('');
  const sub = document.getElementById('cart-subtotal');
  const tot = document.getElementById('cart-total');
  if (sub) sub.textContent = formatPrice(total);
  if (tot) tot.textContent = formatPrice(total);
}

function toggleCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('overlay');
  const wp = document.getElementById('wishlist-panel');
  if (wp) wp.classList.remove('open');
  const isOpen = drawer.classList.toggle('open');
  overlay.classList.toggle('show', isOpen);
  if (isOpen) renderCart();
}

// ===== WISHLIST =====
function toggleWish(id) {
  const sid = String(id);
  if (wishlist.includes(sid)) {
    wishlist = wishlist.filter(x => x !== sid);
    showToast('💔 Retiré des favoris');
  } else {
    wishlist.push(sid);
    showToast('❤️ Ajouté aux favoris !');
    animateBadge('wishlist-badge');
    if (typeof vaTrack === 'function') {
      const pw = PRODUCTS.find(x => String(x.id) === sid);
      vaTrack('add_wish', { productId: sid, shopId: pw?.shop_id || null });
    } else trackInteraction(sid, 'wish');
  }
  localStorage.setItem('velmo_wish', JSON.stringify(wishlist));
  updateWishBadge();
  // Update all wishlist buttons for this product in-place (no full re-render)
  const isNowWished = wishlist.includes(sid);
  document.querySelectorAll(`#wish-${sid}, #crwish-${sid}`).forEach(btn => {
    btn.textContent = isNowWished ? '❤️' : '🤍';
    btn.classList.toggle('active', isNowWished);
  });
  renderWishlist();
}
function updateWishBadge() {
  const badge = document.getElementById('wishlist-badge');
  if (badge) { badge.textContent = wishlist.length; badge.classList.toggle('show', wishlist.length > 0); }
  const wc = document.getElementById('wish-count');
  if (wc) wc.textContent = wishlist.length;
}
function renderWishlist() {
  const container = document.getElementById('wish-items');
  if (!container) return;
  if (!wishlist.length) {
    container.innerHTML = `<div class="cart-empty"><span>💙</span><p>Aucun favori pour l'instant</p></div>`;
    return;
  }
  container.innerHTML = wishlist.map(id => {
    const p = PRODUCTS.find(x => String(x.id) === String(id));
    if (!p) return '';
    const img = getImgUrl(p.photo_url);
    return `
    <div class="cart-item">
      <div class="cart-item-img" style="${img ? '' : 'font-size:1.8rem;display:flex;align-items:center;justify-content:center'}">
        ${img ? `<img src="${img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px" onerror="this.outerHTML='<span>${p.emoji}</span>'">` : p.emoji}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-price">${formatPrice(p.price)}</div>
      </div>
      <button class="pcard-btn" style="padding:6px 10px;font-size:.75rem;width:auto;margin-top:0" onclick="addToCart('${p.id}')">🛒</button>
      <button class="cart-item-remove" onclick="toggleWish('${p.id}')">🗑️</button>
    </div>`;
  }).join('');
}
function toggleWishlistPanel() {
  const panel = document.getElementById('wishlist-panel');
  const overlay = document.getElementById('overlay');
  const cartEl = document.getElementById('cart-drawer');
  if (cartEl) cartEl.classList.remove('open');
  const isOpen = panel.classList.toggle('open');
  overlay.classList.toggle('show', isOpen);
  if (isOpen) renderWishlist();
}

// ===== CHECKOUT =====
function checkout() {
  if (!cart.length) return;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const summary = document.getElementById('order-summary');
  if (summary) {
    summary.innerHTML = `
      ${cart.map(i => `
        <div class="order-summary-item">
          <img src="${getImgUrl(i.photo_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(i.name)}&background=ff6b00&color=fff`}" class="order-summary-item-img" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(i.name)}&background=ff6b00&color=fff'">
          <div style="flex:1; min-width:0">
            <div style="font-weight:700;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${i.name}</div>
            <div style="font-size:0.75rem;color:#888">Qté: ${i.qty} — ${formatPrice(i.price)}</div>
          </div>
          <div style="font-weight:800;font-size:0.9rem;flex-shrink:0">${formatPrice(i.price * i.qty)}</div>
        </div>`).join('')}
      <div class="order-summary-total"><span>Total</span><span>${formatPrice(total)}</span></div>`;
  }
  toggleCart();
  setTimeout(() => {
    openModal('modal-checkout');
    setupPhoneFormatter();

    // 🔥 PRE-REMPLISSAGE PREMIUM
    const sName = localStorage.getItem('velmo_co_name');
    const sPhone = localStorage.getItem('velmo_co_phone');
    const sAddress = localStorage.getItem('velmo_co_address');

    if (sName) { const el = document.getElementById('co-name'); if (el) el.value = sName; }
    if (sPhone) { const el = document.getElementById('co-phone'); if (el) el.value = sPhone; }
    if (sAddress) { const el = document.getElementById('co-address'); if (el) el.value = sAddress; }
  }, 300);
}

function setupPhoneFormatter() {
  const input = document.getElementById('co-phone');
  if (!input) return;

  const format = (v) => {
    let clean = v.replace(/\D/g, '');
    // Extraire seulement ce qui vient après 2246
    if (clean.startsWith('2246')) clean = clean.substring(4);
    else if (clean.startsWith('6')) clean = clean.substring(1);

    // Garder seulement les 8 chiffres après le 6
    clean = clean.substring(0, 8);

    let f = '+224 6';
    if (clean.length > 0) f += clean.substring(0, 2);
    if (clean.length > 2) f += ' ' + clean.substring(2, 4);
    if (clean.length > 4) f += ' ' + clean.substring(4, 6);
    if (clean.length > 6) f += ' ' + clean.substring(6, 8);

    return f;
  };

  input.addEventListener('input', (e) => {
    const start = e.target.selectionStart;
    const oldLen = e.target.value.length;
    e.target.value = format(e.target.value);
    const newLen = e.target.value.length;
    // Empêcher le curseur de revenir avant le préfixe fixe (+224 6 )
    const finalPos = Math.max(7, start + (newLen - oldLen));
    e.target.setSelectionRange(finalPos, finalPos);
  });
}

async function placeOrder() {
  const name = document.getElementById('co-name')?.value.trim();
  const phone = document.getElementById('co-phone')?.value.trim();
  const address = document.getElementById('co-address')?.value.trim();
  const payment = document.getElementById('co-payment')?.value;
  const delivery = document.getElementById('co-delivery')?.value || 'delivery';

  if (!name || !phone || !address) { showToast('⚠️ Veuillez remplir tous les champs'); return; }
  if (phone.replace(/\D/g, '').length < 8) { showToast('⚠️ Numéro de téléphone invalide'); return; }

  // 🔥 SAUVEGARDE DES INFOS CLIENT
  localStorage.setItem('velmo_co_name', name);
  localStorage.setItem('velmo_co_phone', phone);
  localStorage.setItem('velmo_co_address', address);

  const btn = document.querySelector('#modal-checkout .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Envoi en cours...'; }

  const finalTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const ref = await submitOrder({
    name, phone, address, delivery,
    note: payment ? `Paiement: ${payment}` : null,
    items: cart,
  });

  // Le panier est vidé par submitOrder, on utilise donc finalTotal calculé plus haut
  closeModal('modal-checkout');
  if (btn) { btn.disabled = false; btn.textContent = '✅ Confirmer la commande'; }

  // Analytics: track checkout
  if (typeof vaTrack === 'function') {
    vaTrack('checkout_done', { meta: { ref, total: finalTotal, name } });
    if (typeof vaLinkCustomer === 'function') vaLinkCustomer(phone, name).catch(() => { });
  }

  // 🔥 PACK PREMIUM : Confettis !
  fireConfetti();

  // Affichage succès amélioré
  showOrderSuccess({ ref, name, total: finalTotal });
}

function showOrderSuccess({ ref, name, total, phone, shopCount = 1 }) {
  const body = document.getElementById('success-modal-body');
  if (!body) return;

  const refsDisplay = ref.includes(',') ? ref.split(',').map(r => `<div style="font-family:monospace;color:var(--orange);font-weight:700;margin-bottom:2px">${r.trim()}</div>`).join('') : `<strong style="font-family:monospace;color:var(--orange)">${ref}</strong>`;

  const shopLabel = shopCount > 1 ? `<p style="color:#666;font-size:0.88rem;margin-bottom:12px;font-style:italic">🛍️ Votre panier a été divisé en <b>${shopCount} commandes</b> distinctes.</p>` : '';

  const waMsg = encodeURIComponent(`Bonjour VELMO MARKET !\nJ'ai passé une commande groupée (${shopCount} boutique(s)).\n👤 Client: ${name}\n📦 Réf(s): ${ref}\n💰 Total: ${formatPrice(total)}\n\nMerci de confirmer !`);

  body.innerHTML = `
    <div style="padding:40px 20px;text-align:center">
      <div style="font-size:4.5rem;margin-bottom:20px">🎉</div>
      <h2 style="margin-bottom:10px;font-size:1.5rem;font-weight:900">Merci, ${name} !</h2>
      <p style="color:#666;font-size:0.95rem;margin-bottom:24px">Votre commande a été envoyée avec succès.</p>
      
      ${shopLabel}

      <div style="background:#f8f9fa;border-radius:16px;padding:20px;margin-bottom:24px;border:1px solid #eee;text-align:left">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.9rem">
          <span>Réf${shopCount > 1 ? 's' : 'érence'} :</span>
          <div style="text-align:right">${refsDisplay}</div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.9rem;border-top:1px dashed #ddd;padding-top:8px;margin-top:8px">
          <span>Total Global :</span>
          <strong>${formatPrice(total)}</strong>
        </div>
      </div>

      <a href="https://wa.me/224623531387?text=${waMsg}" target="_blank" class="btn-whatsapp">
        Envoyer le récapitulatif sur WhatsApp
      </a>

      <button class="btn-ghost full-width" onclick="closeAll()" style="margin-top:12px;color:#888;font-weight:600;background:none;border:none;cursor:pointer">Continuer mes achats</button>
    </div>`;
  openModal('modal-success');
}

function fireConfetti() {
  if (typeof confetti === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    script.onload = () => {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff6b00', '#1a1a2e', '#ffffff'] });
    };
    document.head.appendChild(script);
  } else {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff6b00', '#1a1a2e', '#ffffff'] });
  }
}

// ===== MODALS =====
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
  const ov = document.getElementById('overlay');
  if (ov) ov.classList.add('show');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
  // Stopper le polling suivi commande si on ferme ce modal
  if (id === 'modal-track') stopTrackPolling();
  const anyOpen = document.querySelector('.modal.open');
  const drawerOpen = document.querySelector('.cart-drawer.open');
  if (!anyOpen && !drawerOpen) {
    const ov = document.getElementById('overlay');
    if (ov) ov.classList.remove('show');
  }
}
function closeAll() {
  document.querySelectorAll('.modal.open, .cart-drawer.open').forEach(el => el.classList.remove('open'));
  const ov = document.getElementById('overlay');
  if (ov) ov.classList.remove('show');
}

// ===== AUTH =====
function switchAuthTab(tab) {
  document.getElementById('auth-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('auth-register').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
}
function handleLogin() {
  const email = document.getElementById('login-email')?.value.trim();
  const pass = document.getElementById('login-pass')?.value.trim();
  if (!email || !pass) { showToast('⚠️ Email et mot de passe requis'); return; }
  user = { email, name: email.split('@')[0] };
  localStorage.setItem('velmo_user', JSON.stringify(user));
  updateUserUI(); closeModal('modal-auth');
  showToast(`👋 Bienvenue, ${user.name} !`);
}
function handleRegister() {
  const name = document.getElementById('reg-name')?.value.trim();
  const email = document.getElementById('reg-email')?.value.trim();
  const pass = document.getElementById('reg-pass')?.value.trim();
  if (!name || !email || !pass) { showToast('⚠️ Tous les champs sont requis'); return; }
  user = { email, name };
  localStorage.setItem('velmo_user', JSON.stringify(user));
  updateUserUI(); closeModal('modal-auth');
  showToast(`🎉 Compte créé ! Bienvenue, ${name} !`);
}
function updateUserUI() {
  const btn = document.getElementById('btn-account');
  if (btn && user) {
    btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg><span>${user.name}</span>`;
    btn.onclick = () => showToast(`👤 Connecté : ${user.name}`);
  }
}
function handleSellerRegister() {
  const shop = document.getElementById('shop-name')?.value.trim();
  if (!shop) { showToast('⚠️ Nom de la boutique requis'); return; }
  closeModal('modal-seller');
  showToast(`🏪 Candidature "${shop}" envoyée ! On vous contacte sous 48h.`);
}

// ===== NEWSLETTER =====
function subscribeNewsletter() {
  const email = document.getElementById('news-email')?.value.trim();
  if (!email || !email.includes('@')) { showToast('⚠️ Email invalide'); return; }
  showToast(`📧 Merci ! Abonné(e) avec ${email}`);
  const el = document.getElementById('news-email');
  if (el) el.value = '';
}

// ===== TOAST =====
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

// ─── Polling suivi commande ──────────────────────────────────
let _trackInterval = null;
let _trackLastStatus = null;
let _trackRef = null;

function stopTrackPolling() {
  if (_trackInterval) { clearInterval(_trackInterval); _trackInterval = null; }
  _trackLastStatus = null;
  _trackRef = null;
}

const ORDER_STATUS_MAP = {
  'pending': { icon: '⏳', label: 'EN ATTENTE', color: '#888', desc: 'Le vendeur a reçu votre commande et va la traiter.' },
  'confirmed': { icon: '✅', label: 'CONFIRMÉE', color: '#00a849', desc: 'Votre commande a été acceptée par le vendeur.' },
  'preparing': { icon: '📦', label: 'EN PRÉPARATION', color: '#ff6b00', desc: 'Nous préparons vos articles avec soin.' },
  'ready': { icon: '🏷️', label: 'PRÊTE', color: '#0ea5e9', desc: 'Votre commande est prête, en attente du livreur.' },
  'shipped': { icon: '🚚', label: 'EN COURS DE LIVRAISON', color: '#2563eb', desc: 'Le livreur est en route vers chez vous !' },
  'delivered': { icon: '🎉', label: 'LIVRÉE', color: '#00a849', desc: 'Commande livrée avec succès. Merci !' },
  'cancelled': { icon: '❌', label: 'ANNULÉE', color: '#dc2626', desc: 'Cette commande a été annulée.' },
};

function renderTrackResult(o, ref) {
  const result = document.getElementById('track-result');
  if (!result) return;
  const s = ORDER_STATUS_MAP[o.status] || ORDER_STATUS_MAP['pending'];
  const isFinal = o.status === 'delivered' || o.status === 'cancelled';

  // Stepper visuel
  const steps = ['pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered'];
  const currentIdx = steps.indexOf(o.status);
  const stepperHtml = steps.map((st, i) => {
    const sm = ORDER_STATUS_MAP[st];
    const done = i < currentIdx;
    const active = i === currentIdx && o.status !== 'cancelled';
    const col = active ? s.color : done ? '#00a84966' : 'rgba(0,0,0,0.08)';
    const txtCol = active ? s.color : done ? '#00a849' : '#aaa';
    return `<div style="flex:1;text-align:center">
      <div style="width:28px;height:28px;border-radius:50%;background:${col};margin:0 auto 4px;display:flex;align-items:center;justify-content:center;font-size:.85rem;border:2px solid ${active || done ? col : 'rgba(0,0,0,0.1)'}">
        ${done ? '✓' : sm.icon}
      </div>
      <div style="font-size:.55rem;font-weight:700;color:${txtCol};text-transform:uppercase;line-height:1.2">${sm.label.split(' ')[0]}</div>
    </div>`;
  }).join('<div style="flex:0 0 2px;height:2px;background:rgba(0,0,0,0.08);align-self:center;margin-bottom:18px"></div>');

  result.style.display = 'block';
  result.innerHTML = `
    <div style="text-align:center;padding:8px 4px">
      <div style="font-size:2.2rem;margin-bottom:8px">${s.icon}</div>
      <div style="font-weight:900;font-size:1.05rem;margin-bottom:6px;color:var(--text)">#${ref}</div>
      <div style="display:inline-block;padding:5px 16px;background:${s.color}18;color:${s.color};border-radius:20px;font-size:.78rem;font-weight:800;margin-bottom:12px">${s.label}</div>
      <p style="font-size:.83rem;color:var(--text2);margin-bottom:16px;line-height:1.5">${s.desc}</p>
      <!-- Stepper -->
      ${o.status !== 'cancelled' ? `<div style="display:flex;align-items:flex-start;gap:2px;margin:0 -4px 16px;overflow-x:auto;padding:0 4px">${stepperHtml}</div>` : ''}
      <div style="padding:10px 0;border-top:1px solid rgba(0,0,0,0.07);font-weight:800;font-size:.95rem;color:var(--text)">
        Total : ${formatPrice(o.total_amount)}
      </div>
      ${!isFinal ? `<div style="margin-top:10px;font-size:.72rem;color:#aaa">🔄 Mis à jour automatiquement toutes les 8 secondes</div>` : ''}
    </div>`;
}

async function trackOrder() {
  const ref = document.getElementById('track-ref')?.value.trim().toUpperCase();
  if (!ref) { showToast('⚠️ Veuillez entrer une référence'); return; }
  const result = document.getElementById('track-result');
  if (!result) return;

  // Si même réf déjà en cours de polling → juste rafraîchir
  if (ref !== _trackRef) {
    stopTrackPolling();
    _trackRef = ref;
  }

  result.style.display = 'block';
  if (!_trackLastStatus) {
    result.innerHTML = '<div style="text-align:center;padding:20px">🔍 Recherche en cours...</div>';
  }

  try {
    const orders = await sbGet('customer_orders', `or=(short_ref.eq.${ref},order_number.eq.${ref})&select=id,status,total_amount,created_at,short_ref,order_number&limit=1`);

    if (!orders || orders.length === 0) {
      stopTrackPolling();
      result.innerHTML = '<div style="text-align:center;color:#e53935;padding:20px">❌ Commande introuvable. Vérifiez la référence.</div>';
      return;
    }

    const o = orders[0];
    const isFinal = o.status === 'delivered' || o.status === 'cancelled';

    // Notifier si statut a changé
    if (_trackLastStatus && _trackLastStatus !== o.status) {
      const s = ORDER_STATUS_MAP[o.status] || ORDER_STATUS_MAP['pending'];
      showToast(`${s.icon} Statut mis à jour : ${s.label}`);
    }
    _trackLastStatus = o.status;

    renderTrackResult(o, ref);

    // Démarrer/arrêter le polling
    if (isFinal) {
      stopTrackPolling();
    } else if (!_trackInterval) {
      _trackInterval = setInterval(async () => {
        const modal = document.getElementById('modal-track');
        if (!modal || modal.style.display === 'none' || modal.hidden) { stopTrackPolling(); return; }
        await trackOrderSilent(ref);
      }, 8000);
    }
  } catch (err) {
    result.innerHTML = '<div style="text-align:center;color:#e53935;padding:20px">⚠️ Erreur lors de la recherche</div>';
  }
}

// Rafraîchissement silencieux (sans spinner)
async function trackOrderSilent(ref) {
  try {
    const orders = await sbGet('customer_orders', `or=(short_ref.eq.${ref},order_number.eq.${ref})&select=id,status,total_amount,created_at,short_ref,order_number&limit=1`);
    if (!orders || orders.length === 0) return;
    const o = orders[0];
    if (o.status !== _trackLastStatus) {
      const s = ORDER_STATUS_MAP[o.status] || ORDER_STATUS_MAP['pending'];
      showToast(`${s.icon} Statut mis à jour : ${s.label}`);
      _trackLastStatus = o.status;
      renderTrackResult(o, ref);
      if (o.status === 'delivered' || o.status === 'cancelled') stopTrackPolling();
    }
  } catch (_) { /* silencieux */ }
}

// ===== MY ORDERS LIST =====
async function openMyOrders() {
  openModal('modal-my-orders');
  const container = document.getElementById('my-orders-list');
  if (!container) return;

  const phone = localStorage.getItem('velmo_co_phone');
  if (!phone) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:3.5rem;margin-bottom:15px">📦</div>
        <p style="color:var(--text);font-size:1rem;font-weight:700">Aucune commande enregistrée</p>
        <p style="color:var(--text2);font-size:0.85rem;margin-top:8px">Vous n'avez pas encore passé de commande ou vos informations ne sont pas enregistrées sur cet appareil.</p>
        <button class="btn-primary" style="margin-top:24px;width:100%" onclick="closeModal('modal-my-orders');openModal('modal-track')">Suivre avec une référence</button>
      </div>`;
    return;
  }

  container.innerHTML = '<div style="text-align:center;padding:60px 0"><div class="sh-loader"></div><p style="margin-top:15px;color:#aaa">Chargement de vos commandes...</p></div>';

  try {
    const orders = await sbGet('customer_orders', `customer_phone=eq.${encodeURIComponent(phone)}&order=created_at.desc&limit=15`);

    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:#aaa">
          <p>Aucune commande trouvée pour le numéro ${phone}.</p>
          <button class="btn-secondary" style="margin-top:15px" onclick="openModal('modal-track');closeModal('modal-my-orders')">Chercher par référence</button>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div style="max-height:60vh;overflow-y:auto;padding-right:5px">
        ${orders.map(o => {
      const statusMap = {
        'pending': { icon: '⏳', label: 'En attente', color: '#666' },
        'confirmed': { icon: '✅', label: 'Confirmée', color: '#00a849' },
        'preparing': { icon: '📦', label: 'Préparation', color: '#ff6b00' },
        'shipped': { icon: '🚚', label: 'Livraison', color: '#2563eb' },
        'delivered': { icon: '🎉', label: 'Livrée', color: '#00a849' },
        'cancelled': { icon: '❌', label: 'Annulée', color: '#dc2626' }
      };
      const s = statusMap[o.status] || statusMap['pending'];
      const date = new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      const ref = o.short_ref || (o.order_number ? o.order_number.substring(0, 8) : 'CMD-...');

      return `
            <div class="order-item-card" style="padding:16px;background:rgba(0,0,0,0.03);border-radius:12px;margin-bottom:12px;cursor:pointer;border:1px solid rgba(0,0,0,0.05)" 
                 onclick="closeModal('modal-my-orders');openModal('modal-track');document.getElementById('track-ref').value='${ref}';trackOrder();">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <span style="font-weight:800;font-size:0.95rem;color:var(--text)">${ref}</span>
                <span style="font-size:0.8rem;color:var(--text2)">${date}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div style="display:flex;align-items:center;gap:6px">
                  <span style="font-size:0.9rem">${s.icon}</span>
                  <span style="font-size:0.75rem;font-weight:800;color:${s.color}">${s.label.toUpperCase()}</span>
                </div>
                <span style="font-weight:800;font-size:1rem;color:var(--primary)">${formatPrice(o.total_amount)}</span>
              </div>
            </div>
          `;
    }).join('')}
      </div>
    `;
  } catch (err) {
    console.error('Error fetching orders:', err);
    container.innerHTML = '<div style="text-align:center;padding:40px 0;color:#dc3545">⚠️ Impossible de charger vos commandes.</div>';
  }
}

// ===== SCROLL HELPERS =====
function scrollToProducts() { document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }
function scrollToCategories() { document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }); }

// ===== BADGE ANIMATION =====
function animateBadge(id) {
  const el = document.getElementById(id);
  if (el) el.animate([{ transform: 'scale(1.8)' }, { transform: 'scale(1)' }], { duration: 400, easing: 'cubic-bezier(.4,0,.2,1)' });
}

// ===== FAQ ACCORDÉON =====
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-a');
  const arrow = btn.querySelector('.faq-arrow');
  const isOpen = item.classList.contains('open');

  // Fermer tous les autres
  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-a').style.maxHeight = '0';
    el.querySelector('.faq-a').style.padding = '0 16px';
    const a = el.querySelector('.faq-arrow');
    if (a) a.style.transform = 'rotate(0deg)';
  });

  if (!isOpen) {
    item.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
    answer.style.padding = '10px 16px 14px';
    if (arrow) arrow.style.transform = 'rotate(180deg)';
  }
}

// ===== NOUVEAUTÉS (trier par les plus récents) =====
function showNewItems() {
  if (!PRODUCTS.length) { scrollToProducts(); return; }
  // Prendre les 30 premiers produits (déjà triés par created_at.desc depuis Supabase)
  const newProducts = PRODUCTS.slice(0, 30);
  const grid = document.getElementById('products-grid');
  // cat-mode removed
  renderProductsData(newProducts);
  scrollToProducts();
  showToast('🆕 Affichage des derniers produits ajoutés');
}

// ===== CONTACT — envoyer le message =====
async function sendContactMessage() {
  const name = document.getElementById('ct-name')?.value.trim();
  const contact = document.getElementById('ct-contact')?.value.trim();
  const subject = document.getElementById('ct-subject')?.value;
  const message = document.getElementById('ct-message')?.value.trim();

  if (!name || !contact || !message) {
    showToast('⚠️ Veuillez remplir tous les champs obligatoires (*)');
    return;
  }

  const btn = document.querySelector('#modal-contact .btn-primary');
  if (btn) { btn.textContent = 'Envoi en cours...'; btn.disabled = true; }

  try {
    // Sauvegarder dans Supabase si la table existe, sinon fallback local
    await sbPost('contact_messages', {
      name,
      contact,
      subject,
      message,
      created_at: new Date().toISOString(),
    }).catch(() => {
      // Fallback : sauvegarder localement
      const msgs = JSON.parse(localStorage.getItem('velmo_contact_msgs') || '[]');
      msgs.push({ name, contact, subject, message, date: new Date().toISOString() });
      localStorage.setItem('velmo_contact_msgs', JSON.stringify(msgs));
    });

    closeModal('modal-contact');
    showToast('✅ Message envoyé ! Nous vous répondrons sous 24h.');

    // Vider le formulaire
    ['ct-name', 'ct-contact', 'ct-message'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  } catch (e) {
    showToast('⚠️ Erreur d\'envoi. Appelez-nous au +224 623 531 387');
  } finally {
    if (btn) { btn.textContent = 'Envoyer le message →'; btn.disabled = false; }
  }
}
