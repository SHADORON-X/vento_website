/* =============================================
 VELMO MARKET — shop.js
 Page boutique individuelle (vanilla JS)
 ============================================= */

// ─── CONFIGURATION SUPABASE ──────────────────────────────────
const SB_URL = 'https://cqpcwqqjbcgklrvnqpxr.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcGN3cXFqYmNna2xydm5xcHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzE4NDEsImV4cCI6MjA3OTI0Nzg0MX0.klx0G4gOHm_vwxIXBPSOTm-V4ax_v9RSacBpDSP3Mgs';
const STORAGE = `${SB_URL}/storage/v1/object/public/velmo-media/`;
const SB_HEADERS = {
  'apikey': SB_KEY,
  'Authorization': `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
};

// ===== SUPABASE HELPERS WITH AUTO-RETRY (Ultra-Solide) =====
async function sbRetry(fn, retries = 3, delay = 1000) {
  try { return await fn(); }
  catch (err) {
    // Ne pas réessayer si c'est une erreur 4xx (ex: colonne manquante)
    if (err.message.startsWith('4') || retries <= 0) throw err;
    console.warn(`🔄 Retrying... (${retries} left)`, err);
    await new Promise(r => setTimeout(r, delay));
    return sbRetry(fn, retries - 1, delay * 1.5);
  }
}

async function sbGet(table, query = '') {
  const url = `${SB_URL}/rest/v1/${table}?${query}`;
  return sbRetry(async () => {
    const res = await fetch(url, { headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  });
}

async function sbPost(table, data) {
  const url = `${SB_URL}/rest/v1/${table}`;
  return sbRetry(async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  });
}

// ===== STATE =====
let SHOP = null;
let PRODUCTS = [];
let CART_KEY = 'velmo_cart'; // Sera mis à jour avec SHOP.id
let cart = [];
let wishlist = JSON.parse(localStorage.getItem('velmo_wish') || '[]');
let currentCat = 'all';
let currentSort = 'default';

let imgObserver = null;
if ('IntersectionObserver' in window) {
  imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const i = en.target;
        if (i.dataset.src) { i.src = i.dataset.src; i.removeAttribute('data-src'); }
        imgObserver.unobserve(i);
      }
    });
  }, { rootMargin: '150px' });
}
function observeShopImages() { if (imgObserver) document.querySelectorAll('img[data-src]').forEach(i => imgObserver.observe(i)); }

function lazyImg(src, alt, cls = '') {
  if (!src) return '';
  const finalCls = cls + ' lazy-fade';
  if (imgObserver) {
    return `<img data-src="${src}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'/%3E" alt="${alt}" class="${finalCls}" loading="lazy" onload="this.classList.add('loaded')">`;
  }
  return `<img src="${src}" alt="${alt}" class="${cls}" loading="lazy">`;
}

// ===== SUPABASE HELPERS =====
function getImgUrl(url) {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return STORAGE + url;
}
function mapCategory(c) {
  if (!c) return 'autre';
  const s = c.toLowerCase();
  if (s.includes('électron') || s.includes('electron') || s.includes('phone') || s.includes('informatique') || s.includes('tv') || s.includes('audio')) return 'electronique';
  if (s.includes('mode') || s.includes('vêtement') || s.includes('fashion') || s.includes('chaussure') || s.includes('bijou')) return 'mode';
  if (s.includes('beauté') || s.includes('beaute') || s.includes('cosmét') || s.includes('parfum') || s.includes('soin')) return 'beaute';
  if (s.includes('maison') || s.includes('meuble') || s.includes('déco') || s.includes('literie')) return 'maison';
  if (s.includes('sport') || s.includes('fitness') || s.includes('gym')) return 'sport';
  if (s.includes('aliment') || s.includes('nourriture') || s.includes('cuisine') || s.includes('épicerie') || s.includes('riz')) return 'cuisine';
  return 'autre';
}
function catLabel(cat) {
  const m = { electronique: 'Électronique', mode: 'Mode & Fashion', beaute: 'Beauté', maison: 'Maison', sport: 'Sport', cuisine: 'Alimentation', jouets: 'Jouets', auto: 'Auto', sante: 'Santé', autre: 'Autre' };
  return m[cat] || cat;
}
function catEmoji(cat) {
  const m = { electronique: '📱', mode: '👗', beaute: '💄', maison: '🏠', sport: '⚽', cuisine: '🍎', jouets: '🎮', auto: '🚗', sante: '💊', autre: '📦' };
  return m[cat] || '📦';
}
function catColor(cat) {
  const m = { electronique: 'linear-gradient(135deg,#e8f4fd,#cce5fb)', mode: 'linear-gradient(135deg,#fef0f5,#fce4ef)', beaute: 'linear-gradient(135deg,#f5e6ff,#e8d0fa)', maison: 'linear-gradient(135deg,#fff3e6,#fde3c8)', sport: 'linear-gradient(135deg,#e6f7ef,#c4edd8)', cuisine: 'linear-gradient(135deg,#fffde6,#fff3c4)', autre: 'linear-gradient(135deg,#f0f0f0,#e0e0e0)' };
  return m[cat] || 'var(--gray)';
}
function formatPrice(n) { return Math.round(n).toLocaleString('fr-FR') + ' GNF'; }

// 🔥 POINT 6 : SEO DYNAMIQUE
function updateSEO(title, desc = '', product = null) {
  if (!SHOP) return;
  const fullTitle = title ? `${title} — ${SHOP.name}` : `${SHOP.name} — VELMO MARKET`;
  document.title = fullTitle;

  const mDesc = document.getElementById('sh-meta-desc');
  if (mDesc && desc) mDesc.content = desc;

  // OpenGraph & Twitter
  const ogTitle = document.getElementById('sh-og-title');
  const ogDesc = document.getElementById('sh-og-desc');
  const ogImg = document.getElementById('sh-og-image');
  const twTitle = document.getElementById('sh-tw-title');
  const twImg = document.getElementById('sh-tw-image');

  if (ogTitle) ogTitle.content = fullTitle;
  if (ogDesc && desc) ogDesc.content = desc;
  if (twTitle) twTitle.content = fullTitle;

  if (product) {
    const imgUrl = getImgUrl(product.photo_url);
    if (ogImg && imgUrl) ogImg.content = imgUrl;
    if (twImg && imgUrl) twImg.content = imgUrl;
    injectJSONLD(product);
  }
}

// 🕸️ JSON-LD FOR GOOGLEBOT
function injectJSONLD(p) {
  let script = document.getElementById('json-ld-product');
  if (!script) {
    script = document.createElement('script');
    script.id = 'json-ld-product';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  const data = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": p.name,
    "image": [getImgUrl(p.photo_url)],
    "description": p.desc || p.name,
    "sku": p.id,
    "brand": { "@type": "Brand", "name": SHOP.name },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "GNF",
      "price": p.price,
      "availability": (p.qty_stock > 0 || p.qty_stock === null) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };
  script.text = JSON.stringify(data);
}

function discount(p, op) { return op && op > p ? Math.round((1 - p / op) * 100) : 0; }
function shopColorFrom(name) {
  const cols = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#ef4444'];
  let h = 0; for (const c of (name || '')) h = c.charCodeAt(0) + h * 31;
  return cols[Math.abs(h) % cols.length];
}
function randomRef() { return 'CMD-' + Math.random().toString(36).substr(2, 6).toUpperCase(); }
// URL d'une boutique (slug prioritaire, id en fallback) — chemin relatif
function shopUrl(slug, id) {
  if (slug) return `shop.html?s=${encodeURIComponent(slug)}`;
  if (id) return `shop.html?id=${encodeURIComponent(id)}`;
  return 'index.html';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initPremium();
  initShop();
});

function initPremium() {
  const saved = localStorage.getItem('velmo_theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && systemDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  // Register SW with sophisticated update handling
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      // Vérifier les mises à jour au chargement
      reg.update();

      // Détecter si une mise à jour est déjà prête
      if (reg.waiting) showUpdateBanner(reg.waiting);

      // Détecter quand une mise à jour arrive
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner(newWorker);
          }
        });
      });

      // Vérifier périodiquement
      setInterval(() => reg.update(), 15 * 60 * 1000);
    }).catch(() => { });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) { window.location.reload(); refreshing = true; }
    });
  }
  initPWABanner();
  init3DCards();
}

// ───── Update Banner UI ──────────────────────────────────────
function showUpdateBanner(worker) {
  if (document.getElementById('update-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.className = 'update-banner'; // Utiliser une classe pour plus de flexibilité
  banner.style = `
    position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
    z-index: 5000; background: #131921; color: #fff; padding: 14px 22px;
    border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.4);
    display: flex; align-items: center; gap: 15px; width: calc(100% - 40px);
    max-width: 400px; border: 1px solid rgba(255,255,255,0.1);
    animation: slideUpBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  `;
  banner.innerHTML = `
    <div style="font-size:1.6rem">🚀</div>
    <div style="flex:1">
      <div style="font-weight:800;font-size:14px">Nouvelle version !</div>
      <div style="font-size:11px;color:#9ca3af">Cliquez pour booster votre expérience</div>
    </div>
    <button id="btn-update-now-sh" style="background:#f97316;color:#fff;border:none;padding:10px 18px;border-radius:12px;font-weight:800;font-size:13px;cursor:pointer;white-space:nowrap">Actualiser</button>
  `;
  document.body.appendChild(banner);

  document.getElementById('btn-update-now-sh').addEventListener('click', () => {
    worker.postMessage('SKIP_WAITING');
    banner.style.opacity = '0.5';
    banner.querySelector('button').textContent = '⏳ ...';
  });
}

// ─── 3D Card Tilt Effect ──────────────────────────────────────
function init3DCards() {
  let cur = null;
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.pcard');
    if (cur && cur !== card) {
      cur.style.transform = '';
      cur.style.boxShadow = '';
      cur.style.zIndex = '';
      cur = null;
    }
    if (!card) return;
    cur = card;
    const r = card.getBoundingClientRect();
    const rx = -(((e.clientY - r.top) / r.height) - 0.5) * 12;
    const ry = (((e.clientX - r.left) / r.width) - 0.5) * 16;
    card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`;
    card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.18)';
    card.style.zIndex = '5';
  });
  document.addEventListener('mouseleave', () => {
    if (cur) { cur.style.transform = ''; cur.style.boxShadow = ''; cur.style.zIndex = ''; cur = null; }
  });
}

// ─── PWA Install Banner ──────────────────────────────────────
let _pwaPrompt = null;

function initPWABanner() {
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) return;
  const dismissed = localStorage.getItem('velmo_pwa_dismissed');
  if (dismissed && Date.now() - parseInt(dismissed) < 3 * 24 * 3600 * 1000) return;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _pwaPrompt = e;
    setTimeout(() => showPWABanner(), 5000);
  });

  if (isIOS) {
    setTimeout(() => showPWABanner(true), 6000);
  }

  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      hidePWABanner();
      if (_pwaPrompt) {
        _pwaPrompt.prompt();
        const { outcome } = await _pwaPrompt.userChoice;
        _pwaPrompt = null;
        if (outcome === 'accepted') showToast('✅ Velmo Market installé !');
      } else if (isIOS) {
        openModal('modal-pwa-ios');
      }
    });
  }

  const closeBtn = document.getElementById('pwa-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      hidePWABanner();
      localStorage.setItem('velmo_pwa_dismissed', Date.now().toString());
    });
  }

  window.addEventListener('appinstalled', () => {
    hidePWABanner();
    showToast('🎉 Velmo Market est sur votre écran d\'accueil !');
  });
}

function showPWABanner(isIOS = false) {
  const banner = document.getElementById('pwa-banner');
  if (!banner) return;
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

function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('velmo_theme', newTheme);
  showToast(newTheme === 'dark' ? '🌙 Mode sombre activé' : '☀️ Mode clair activé');
}

async function initShop() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('s');
  const id = params.get('id');
  const shop = params.get('shop'); // Paramètre utilisé par le système de partage

  updateCartBadge();
  updateWishBadge();

  if (!slug && !id && !shop) {
    showShopError('Aucune boutique spécifiée. Veuillez accéder via un lien valide.');
    return;
  }

  await loadShop(slug || shop, id);
}

// ===== LOAD SHOP =====
async function loadShop(slug, id) {
  try {
    // Colonnes réelles en DB (logo_url/cover_url n'existent pas → logo/cover)
    const cols = 'id,name,slug,description,category,logo,cover,owner_id,' +
      'is_verified,is_active,is_public,is_online_active,orders_count,phone,whatsapp,email,' +
      'address,location,opening_hours,facebook_url,instagram_url,tiktok_url,' +
      'twitter_url,website_url,delivery_info,return_policy';

    // Priorité : slug → id (fallback pour boutiques sans slug)
    let filter;
    if (slug) {
      // On teste d'abord slug=eq (cas normal)
      filter = `slug=eq.${encodeURIComponent(slug)}`;
    } else {
      filter = `id=eq.${encodeURIComponent(id)}`;
    }

    let shopData = await sbGet('shops', `${filter}&is_active=eq.true&select=${cols}&limit=1`);

    // Fallbacks si rien n'est trouvé (slug mal formé ou ID passé dans le champ slug)
    if (!shopData || !shopData.length) {
      if (slug) {
        // Tentative 1 : Et si c'était un ID ? (Cas fréquent avec les liens de l'app)
        const byId = await sbGet('shops', `id=eq.${encodeURIComponent(slug)}&select=${cols}&limit=1`);
        if (byId && byId.length) shopData = byId;
        
        // Tentative 2 : Recherche Insensible à la casse sur le Slug
        if (!shopData || !shopData.length) {
          const bySlugIlike = await sbGet('shops', `slug=ilike.${encodeURIComponent(slug)}&is_active=eq.true&select=${cols}&limit=1`);
          shopData = bySlugIlike;
        }

        // Tentative 3 : Recherche par Nom (si le slug n'est pas rempli)
        if (!shopData || !shopData.length) {
          const byName = await sbGet('shops', `name=ilike.${encodeURIComponent(slug)}&is_active=eq.true&select=${cols}&limit=1`);
          shopData = byName;
        }
      }
    }

    if (!shopData || !shopData.length) {
      showShopError(`La boutique "${slug || id}" est introuvable ou inactive.`);
      return;
    }
    SHOP = shopData[0];

    // Fallback : si la boutique n'a pas de whatsapp/phone, utiliser le téléphone du propriétaire
    if (!SHOP.whatsapp && !SHOP.phone && SHOP.owner_id) {
      try {
        const ownerData = await sbGet('users', `id=eq.${SHOP.owner_id}&select=phone&limit=1`);
        if (ownerData && ownerData[0] && ownerData[0].phone) {
          SHOP.whatsapp = ownerData[0].phone;
        }
      } catch (_) { /* silencieux */ }
    }

    // 🛡️ SPRINT 5: PANIER ISOLÉ - Utiliser une clé spécifique à cette boutique
    CART_KEY = `velmo_cart_${SHOP.id}`;
    cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    updateCartBadge();

    document.title = `${SHOP.name} — VELMO MARKET`;
    const metaDesc = document.getElementById('sh-meta-desc');
    if (metaDesc) metaDesc.content = SHOP.description || `Découvrez les produits de ${SHOP.name} sur VELMO MARKET`;

    renderShopHero();
    renderActionBar();
    renderAboutTab();
    renderContactTab();

    // 🔴 Boutique temporairement fermée
    if (SHOP.is_online_active === false) {
      renderClosedBanner();
    }

    await loadProducts(SHOP.id);

    // Gérer l'ouverture automatique d'un produit via l'URL
    const pid = new URLSearchParams(window.location.search).get('p');
    if (pid && typeof openProduct === 'function') {
      let attempts = 0;
      const checkP = setInterval(async () => {
        attempts++;
        if (PRODUCTS && PRODUCTS.length > 0) {
          clearInterval(checkP);

          // Si absent (ex: produit filtré ou masqué mais toujours avec un lien valide)
          let p = PRODUCTS.find(x => String(x.id) === String(pid));
          if (!p) {
            try {
              const select = 'id,name,description,category,price_sale,price_regular,photo_url,photo,quantity,shop_id,video_url';
              const data = await sbGet('products', `select=${select}&id=eq.${pid}&limit=1`);
              if (data && data.length) {
                const res = data[0];
                const processed = {
                  id: res.id, name: res.name, desc: res.description || '', cat: mapCategory(res.category),
                  price: res.price_sale, oldPrice: (res.price_regular && res.price_regular > res.price_sale) ? res.price_regular : null,
                  qty_stock: res.quantity ?? null, photo_url: getImgUrl(res.photo_url || res.photo),
                  video_url: res.video_url || null, _hasRealImg: true, emoji: catEmoji(mapCategory(res.category)),
                  shop_name: SHOP?.name || '', shop_slug: SHOP?.slug || null, shop_id: SHOP?.id || null, is_verified: SHOP?.is_verified || false,
                };
                PRODUCTS.push(processed);
                openProduct(pid);
              } else {
                showToast('⚠️ Produit introuvable');
              }
            } catch (err) { console.warn('PID fallback failed:', err); }
          } else {
            openProduct(pid);
          }
        }
        if (attempts > 20) {
          clearInterval(checkP);
          // Si on n'a rien trouvé du tout après 20 essais
        }
      }, 300);
    }

    if (typeof vaTrack === 'function') vaTrack('view_shop', { shopId: SHOP.id });
  } catch (e) {
    console.error('loadShop error:', e);
    showShopError('Erreur de chargement : ' + e.message);
  }
}

// ===== RENDER HERO =====
function renderShopHero() {
  // Cover
  const coverEl = document.getElementById('sh-cover');
  const coverUrl = getImgUrl(SHOP.cover);
  if (coverEl) {
    if (coverUrl) {
      coverEl.style.backgroundImage = `url('${coverUrl}')`;
    } else {
      coverEl.style.background = `linear-gradient(135deg, ${shopColorFrom(SHOP.name)}cc, ${shopColorFrom(SHOP.name + '1')}88)`;
    }
  }

  // Avatar / Logo
  const avatarEl = document.getElementById('sh-avatar');
  const logoUrl = getImgUrl(SHOP.logo);
  if (avatarEl) {
    if (logoUrl) {
      avatarEl.innerHTML = `<img src="${logoUrl}" alt="${SHOP.name}" onerror="this.style.display='none';this.parentElement.textContent='${(SHOP.name || '?')[0].toUpperCase()}'">`;
    } else {
      avatarEl.textContent = (SHOP.name || '?')[0].toUpperCase();
      avatarEl.style.background = shopColorFrom(SHOP.name);
    }
  }

  // Verified badge
  const verifiedEl = document.getElementById('sh-verified');
  if (verifiedEl && SHOP.is_verified) verifiedEl.style.display = 'inline-flex';

  // Name
  const nameEl = document.getElementById('sh-name');
  if (nameEl) nameEl.textContent = SHOP.name || 'Boutique';

  // Tags
  const tagsEl = document.getElementById('sh-tags');
  if (tagsEl) {
    const tags = [];
    if (SHOP.category) tags.push(`🏷️ ${SHOP.category}`);
    if (SHOP.location) tags.push(`📍 ${SHOP.location}`);
    tagsEl.innerHTML = tags.map(t => `<span class="sh-tag">${t}</span>`).join('');
  }

  // Hero floating buttons (WhatsApp / Appeler)
  const actionsEl = document.getElementById('sh-hero-actions');
  if (actionsEl) {
    let btns = '';
    if (SHOP.whatsapp) {
      const waNum = SHOP.whatsapp.replace(/\D/g, '');
      btns += `<a class="sh-hero-btn wa" href="https://wa.me/${waNum}" target="_blank" rel="noopener">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.105.546 4.1 1.5 5.837L0 24l6.338-1.478A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.796 9.796 0 0 1-4.962-1.347l-.356-.211-3.761.877.927-3.664-.231-.376A9.821 9.821 0 0 1 2.182 12c0-5.421 4.397-9.818 9.818-9.818 5.421 0 9.818 4.397 9.818 9.818 0 5.421-4.397 9.818-9.818 9.818z"/></svg>
        WhatsApp
      </a>`;
    }
    if (SHOP.phone) {
      btns += `<a class="sh-hero-btn call" href="tel:${SHOP.phone}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.59 1.23h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16z"/></svg>
        Appeler
      </a>`;
    }
    actionsEl.innerHTML = btns;
  }

  // Show online dot si la boutique a des activités récentes
  const onlineDot = document.getElementById('sh-online-dot');
  if (onlineDot && SHOP.orders_count > 0) onlineDot.style.display = 'block';
}

// ===== RENDER ACTION BAR =====
function renderActionBar() {
  const bar = document.getElementById('sh-action-bar');
  if (!bar) return;
  const items = [];

  if (SHOP.phone) items.push(`<a class="sh-contact-btn" href="tel:${SHOP.phone}"><span class="sh-cbtn-icon">📞</span>${SHOP.phone}</a>`);
  if (SHOP.whatsapp) {
    const waNum = SHOP.whatsapp.replace(/\D/g, '');
    items.push(`<a class="sh-contact-btn" href="https://wa.me/${waNum}" target="_blank" rel="noopener"><span class="sh-cbtn-icon" style="color:#25d366">💬</span>WhatsApp</a>`);
  }
  if (SHOP.email) items.push(`<a class="sh-contact-btn" href="mailto:${SHOP.email}"><span class="sh-cbtn-icon">✉️</span>${SHOP.email}</a>`);
  if (SHOP.facebook_url) items.push(`<a class="sh-contact-btn" href="${SHOP.facebook_url}" target="_blank" rel="noopener"><span class="sh-cbtn-icon" style="color:#1877f2">📘</span>Facebook</a>`);
  if (SHOP.instagram_url) items.push(`<a class="sh-contact-btn" href="${SHOP.instagram_url}" target="_blank" rel="noopener"><span class="sh-cbtn-icon" style="color:#e1306c">📸</span>Instagram</a>`);
  if (SHOP.tiktok_url) items.push(`<a class="sh-contact-btn" href="${SHOP.tiktok_url}" target="_blank" rel="noopener"><span class="sh-cbtn-icon">🎵</span>TikTok</a>`);
  if (SHOP.website_url) items.push(`<a class="sh-contact-btn" href="${SHOP.website_url}" target="_blank" rel="noopener"><span class="sh-cbtn-icon">🌐</span>Site web</a>`);
  if (SHOP.address || SHOP.location) items.push(`<span class="sh-contact-btn" style="cursor:default"><span class="sh-cbtn-icon">📍</span>${SHOP.address || SHOP.location}</span>`);

  if (items.length) {
    bar.innerHTML = `<div class="sh-action-bar-inner">${items.join('')}</div>`;
  }
}

// ===== RENDER ABOUT TAB =====
function renderAboutTab() {
  const el = document.getElementById('sh-about-content');
  if (!el) return;
  let html = '';

  if (SHOP.description) {
    html += `<div class="sh-info-section">
      <div class="sh-info-section-title">À propos</div>
      <p class="sh-info-text">${SHOP.description}</p>
    </div>`;
  }

  if (SHOP.opening_hours) {
    html += `<div class="sh-info-section">
      <div class="sh-info-section-title">🕐 Horaires d'ouverture</div>
      <p class="sh-info-text">${SHOP.opening_hours}</p>
    </div>`;
  }

  if (SHOP.delivery_info) {
    html += `<div class="sh-info-section">
      <div class="sh-info-section-title">🚚 Livraison</div>
      <p class="sh-info-text">${SHOP.delivery_info}</p>
    </div>`;
  }

  if (SHOP.return_policy) {
    html += `<div class="sh-info-section">
      <div class="sh-info-section-title">🔄 Retours & remboursements</div>
      <p class="sh-info-text">${SHOP.return_policy}</p>
    </div>`;
  }

  if (!html) {
    html = `<div class="sh-empty">
      <div class="sh-empty-icon">📋</div>
      <div class="sh-empty-title">Infos non renseignées</div>
      <div class="sh-empty-sub">Le vendeur n'a pas encore renseigné les informations de sa boutique.</div>
    </div>`;
  }

  el.innerHTML = html;
}

// ===== RENDER CONTACT TAB =====
function renderContactTab() {
  const el = document.getElementById('sh-contact-content');
  if (!el) return;
  let html = '';

  const contacts = [];
  if (SHOP.phone) contacts.push({ icon: '📞', bg: '#e8f4fd', label: 'Téléphone', val: SHOP.phone, href: `tel:${SHOP.phone}` });
  if (SHOP.whatsapp) contacts.push({ icon: '💬', bg: '#e6f9ef', label: 'WhatsApp', val: SHOP.whatsapp, href: `https://wa.me/${SHOP.whatsapp.replace(/\D/g, '')}`, target: '_blank' });
  if (SHOP.email) contacts.push({ icon: '✉️', bg: '#fff3e6', label: 'Email', val: SHOP.email, href: `mailto:${SHOP.email}` });
  if (SHOP.address || SHOP.location) contacts.push({ icon: '📍', bg: '#f5e6ff', label: 'Adresse', val: SHOP.address || SHOP.location });

  if (contacts.length) {
    html += `<div class="sh-info-section">
      <div class="sh-info-section-title">Coordonnées</div>
      ${contacts.map(c => `
      <div class="sh-contact-item">
        <div class="sh-contact-icon" style="background:${c.bg}">${c.icon}</div>
        <div>
          <div class="sh-contact-label">${c.label}</div>
          ${c.href
        ? `<a class="sh-contact-value" href="${c.href}" ${c.target ? `target="${c.target}" rel="noopener"` : ''}>${c.val}</a>`
        : `<span class="sh-contact-value">${c.val}</span>`}
        </div>
      </div>`).join('')}
    </div>`;
  }

  const socials = [];
  if (SHOP.facebook_url) socials.push({ label: 'Facebook', href: SHOP.facebook_url, icon: '📘' });
  if (SHOP.instagram_url) socials.push({ label: 'Instagram', href: SHOP.instagram_url, icon: '📸' });
  if (SHOP.tiktok_url) socials.push({ label: 'TikTok', href: SHOP.tiktok_url, icon: '🎵' });
  if (SHOP.twitter_url) socials.push({ label: 'Twitter/X', href: SHOP.twitter_url, icon: '🐦' });
  if (SHOP.website_url) socials.push({ label: 'Site web', href: SHOP.website_url, icon: '🌐' });

  if (socials.length) {
    html += `<div class="sh-info-section">
      <div class="sh-info-section-title">Réseaux sociaux</div>
      <div class="sh-social-grid">
        ${socials.map(s => `<a class="sh-social-link" href="${s.href}" target="_blank" rel="noopener">${s.icon} ${s.label}</a>`).join('')}
      </div>
    </div>`;
  }

  if (!html) {
    html = `<div class="sh-empty">
      <div class="sh-empty-icon">📞</div>
      <div class="sh-empty-title">Contact non renseigné</div>
      <div class="sh-empty-sub">Aucun moyen de contact disponible pour cette boutique.</div>
    </div>`;
  }

  el.innerHTML = html;
}

// ===== LOAD PRODUCTS =====
async function loadProducts(shopId) {
  const gridLoader = document.getElementById('sh-grid-loader');
  if (gridLoader) gridLoader.style.display = 'block';
  try {
    const baseCols = 'id,name,description,category,price_sale,price_regular,photo_url,photo,quantity,images_json';
    const baseQuery = `shop_id=eq.${shopId}&is_active=eq.true&is_published=eq.true&order=name.asc&limit=2000`;
    let data;
    try {
      data = await sbGet('products', `select=${baseCols},video_url&${baseQuery}`);
    } catch (_) {
      // video_url n'existe pas encore → fallback
      data = await sbGet('products', `select=${baseCols}&${baseQuery}`);
    }
    PRODUCTS = (data || []).map(p => {
      const rawUrl = p.photo_url || p.photo || null;
      const hasRealImg = !!(rawUrl && !rawUrl.includes('placeholder') && !rawUrl.includes('default'));
      let pUrl = hasRealImg ? rawUrl : null;
      if (pUrl && !pUrl.startsWith('http') && !pUrl.startsWith('data:') && !pUrl.startsWith('./')) {
        pUrl = STORAGE + pUrl;
      }

      // Galerie d'images (angles multiples)
      let gallery = [];
      try {
        if (p.images_json) {
          const extra = typeof p.images_json === 'string' ? JSON.parse(p.images_json) : p.images_json;
          if (Array.isArray(extra)) {
            gallery = extra.map(img => getImgUrl(img)).filter(img => !!img);
          }
        }
      } catch (e) { }

      return {
        id: p.id,
        name: p.name,
        desc: p.description || '',
        cat: mapCategory(p.category),
        rawCat: p.category || '',
        price: p.price_sale,
        oldPrice: (p.price_regular && p.price_regular > p.price_sale) ? p.price_regular : null,
        qty_stock: p.quantity ?? null,
        photo_url: pUrl,
        video_url: p.video_url || null,
        images: gallery,
        _hasRealImg: hasRealImg,
        emoji: catEmoji(mapCategory(p.category)),
        shop_name: SHOP?.name || '',
        shop_slug: SHOP?.slug || null,
        shop_id: SHOP?.id || null,
        is_verified: SHOP?.is_verified || false,
      };
    }).filter(p => p._hasRealImg || p.video_url);

    // 🔥 VELMO-RANK : Stock d'abord
    PRODUCTS.sort((a, b) => {
      const aOos = a.qty_stock !== null && a.qty_stock <= 0;
      const bOos = b.qty_stock !== null && b.qty_stock <= 0;
      if (aOos && !bOos) return 1;
      if (!aOos && bOos) return -1;
      return 0; // Nom ASC par défaut via SQL
    });

    // SOLIDITY : Cache boutique
    localStorage.setItem(`velmo_cache_shop_${SHOP.id}`, JSON.stringify({ ts: Date.now(), data: PRODUCTS }));

    // Update stats after loading products
    renderStats();
    renderFilterTabs();
    renderShopProducts();
  } catch (e) {
    console.error('loadProducts error:', e);
    // SOLIDITY : Fallback Offline
    const cached = localStorage.getItem(`velmo_cache_shop_${SHOP.id}`);
    if (cached) {
      const { data } = JSON.parse(cached);
      PRODUCTS = data;
      renderShopProducts();
    } else {
      const grid = document.getElementById('sh-products');
      if (grid) grid.innerHTML = `<div class="sh-empty"><div class="sh-empty-icon">📶</div><div class="sh-empty-title">Mode Hors-ligne</div><div class="sh-empty-sub">Impossible de charger les nouveaux produits.</div><button class="btn-primary" onclick="location.reload()">Réessayer</button></div>`;
    }
  } finally {
    if (gridLoader) gridLoader.style.display = 'none';
  }
}

// POINT 3 : FILTRES & TRI
function sortProducts(by, btn) {
  currentSort = by;
  if (btn) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.sort-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
  }
  renderShopProducts();
}

// ===== RENDER STATS =====
function renderStats() {
  const el = document.getElementById('sh-stats');
  if (!el) return;
  const stats = [
    { val: PRODUCTS.length, label: 'Produits' },
    { val: SHOP.orders_count || 0, label: 'Commandes' },
  ];
  el.innerHTML = stats.map(s => `
    <div class="sh-stat">
      <span class="sh-stat-val">${Number(s.val).toLocaleString('fr-FR')}</span>
      <span class="sh-stat-label">${s.label}</span>
    </div>`).join('');
}

// ===== FILTER TABS =====
function renderFilterTabs() {
  const container = document.getElementById('sh-filter-tabs');
  if (!container) return;
  const cats = [...new Set(PRODUCTS.map(p => p.cat))].filter(Boolean);
  let html = `<button class="ftab active" onclick="shSetCat(this,'all')">Tous (${PRODUCTS.length})</button>`;
  cats.forEach(cat => {
    const count = PRODUCTS.filter(p => p.cat === cat).length;
    html += `<button class="ftab" onclick="shSetCat(this,'${cat}')">${catEmoji(cat)} ${catLabel(cat)} (${count})</button>`;
  });
  container.innerHTML = html;
  observeShopImages();
}

function shSetCat(el, cat) {
  document.querySelectorAll('#sh-filter-tabs .ftab').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  currentCat = cat;
  // Clear search when switching category
  const inp = document.getElementById('sh-search-input');
  if (inp) inp.value = '';
  const clr = document.getElementById('sh-search-clear');
  if (clr) clr.style.display = 'none';
  renderShopProducts();
}

// ===== SEARCH =====
function shDoSearch() {
  const inp = document.getElementById('sh-search-input');
  const clr = document.getElementById('sh-search-clear');
  const q = (inp?.value || '').trim().toLowerCase();
  if (clr) clr.style.display = q ? 'flex' : 'none';

  if (!q) {
    renderShopProducts();
    return;
  }

  // Filter across all categories
  const results = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.desc || '').toLowerCase().includes(q) ||
    catLabel(p.cat).toLowerCase().includes(q) ||
    (p.rawCat || '').toLowerCase().includes(q)
  );

  const grid = document.getElementById('sh-products');
  if (!grid) return;

  if (!results.length) {
    // cat-mode removed
    grid.innerHTML = `
      <div style="grid-column:1/-1">
        <div class="sh-empty">
          <div class="sh-empty-icon">🔍</div>
          <div class="sh-empty-title">Aucun résultat pour « ${inp.value} »</div>
          <div class="sh-empty-sub">Essayez avec d'autres mots-clés</div>
          <button onclick="shClearSearch()" style="margin-top:14px;padding:10px 24px;background:var(--orange);color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:.88rem">Voir tous les produits</button>
        </div>
      </div>`;
    return;
  }

  // Show results as flat grid (no category rows during search)
  grid.classList.remove('cat-mode');
  grid.innerHTML = `
    <div style="grid-column:1/-1;padding:10px 0 4px;font-size:.82rem;color:var(--text2);font-weight:600">
      ${results.length} résultat${results.length > 1 ? 's' : ''} pour « ${inp.value} »
    </div>
    ${results.map(p => stdCardHTML(p)).join('')}`;
}

function shClearSearch() {
  const inp = document.getElementById('sh-search-input');
  if (inp) { inp.value = ''; inp.focus(); }
  const clr = document.getElementById('sh-search-clear');
  if (clr) clr.style.display = 'none';
  renderShopProducts();
}


// ===== RENDER PRODUCTS =====
function renderShopProducts() {
  const container = document.getElementById('sh-products');
  if (!container) return;

  let filtered = currentCat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === currentCat);
  const q = document.getElementById('sh-search-input')?.value.trim().toLowerCase();
  if (q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));

  // TRI
  function renderProductsSorted(data) {
    let sorted = [...data];
    if (currentSort === 'price_asc') sorted.sort((a, b) => a.price - b.price);
    else if (currentSort === 'price_desc') sorted.sort((a, b) => b.price - a.price);
    else if (currentSort === 'new') sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return sorted;
  }
  filtered = renderProductsSorted(filtered);

  // SEO Update
  const catLabelStr = currentCat === 'all' ? '' : catLabel(currentCat);
  updateSEO(catLabelStr, SHOP.description || `Produtis de la boutique ${SHOP.name}`);

  if (!filtered.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#6b7280;grid-column:1/-1">
        <div style="font-size:3rem">🛍️</div>
        <p style="margin-top:12px;font-size:1rem;font-weight:600;color:#111827">${currentCat === 'all' ? 'Aucun produit disponible' : 'Aucun produit dans cette catégorie'}</p>
        <p style="margin-top:6px;font-size:.85rem">Cette boutique n'a pas encore ajouté de produits ici.</p>
      </div>`;
    return;
  }

  if (currentCat === 'all' && currentSort === 'default') {
    renderShopCategoryRows(filtered, container);
  } else {
    _shInfRender(filtered, container);
  }
  observeShopImages();
}

// ===== SHOP INFINITE SCROLL =====
const SHOP_PAGE = 24;
let _shInfData = [];
let _shInfShown = 0;
let _shInfLoading = false;
let _shInfDone = false;

function _shInfRender(data, grid) {
  _shInfData = data;
  _shInfShown = 0;
  _shInfLoading = false;
  _shInfDone = false;
  _shInfDetach();
  grid.innerHTML = `
    <div class="prod-grid" id="sh-inf-grid"></div>
    <div id="sh-inf-footer" style="text-align:center;padding:28px 0 16px;display:none">
      <div id="sh-inf-spinner" style="display:none;margin:0 auto 10px;width:28px;height:28px;border:3px solid #f3f4f6;border-top-color:#f97316;border-radius:50%;animation:spin .7s linear infinite"></div>
      <button id="sh-inf-btn" onclick="_shInfAppend()" style="display:none;padding:10px 28px;background:#f97316;color:#fff;border:none;border-radius:24px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 12px rgba(249,115,22,.3)">Charger plus de produits ↓</button>
      <p id="sh-inf-end" style="display:none;color:#9ca3af;font-size:13px">✓ Tous les produits sont affichés</p>
    </div>`;
  _shInfAppend();
  _shInfAttach();
}

function _shInfAttach() {
  if (window._shScrollFn) window.removeEventListener('scroll', window._shScrollFn);
  window._shScrollFn = () => {
    if (_shInfDone || _shInfLoading) return;
    const dist = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
    if (dist < 500) _shInfAppend();
  };
  window.addEventListener('scroll', window._shScrollFn, { passive: true });
}

function _shInfDetach() {
  if (window._shScrollFn) { window.removeEventListener('scroll', window._shScrollFn); window._shScrollFn = null; }
}

function _shInfAppend() {
  if (_shInfLoading || _shInfDone) return;
  const igrid = document.getElementById('sh-inf-grid');
  const footer = document.getElementById('sh-inf-footer');
  const spinner = document.getElementById('sh-inf-spinner');
  const btn = document.getElementById('sh-inf-btn');
  const endMsg = document.getElementById('sh-inf-end');
  if (!igrid) return;

  const slice = _shInfData.slice(_shInfShown, _shInfShown + SHOP_PAGE);
  if (!slice.length) { _shInfDone = true; return; }

  _shInfLoading = true;
  if (footer) footer.style.display = 'block';
  if (spinner) spinner.style.display = 'block';
  if (btn) btn.style.display = 'none';

  setTimeout(() => {
    igrid.insertAdjacentHTML('beforeend', slice.map(p => shopCardHTML(p)).join(''));
    _shInfShown += slice.length;
    observeShopImages();
    _shInfLoading = false;
    if (spinner) spinner.style.display = 'none';
    if (_shInfShown >= _shInfData.length) {
      _shInfDone = true;
      _shInfDetach();
      if (endMsg) endMsg.style.display = 'block';
      if (btn) btn.style.display = 'none';
    } else {
      if (btn) setTimeout(() => { if (!_shInfDone && !_shInfLoading) btn.style.display = 'inline-block'; }, 2000);
    }
  }, 150);
}

// ===== CATCHY PHRASES per category =====
const CAT_PHRASES = {
  electronique: { title: '📱 Le meilleur de la tech', sub: 'Smartphones, accessoires et plus', color: 'linear-gradient(135deg,#e8f4fd,#cce5fb)' },
  mode: { title: '👗 La mode qui vous ressemble', sub: 'Vêtements, chaussures et bijoux', color: 'linear-gradient(135deg,#fef0f5,#fce4ef)' },
  beaute: { title: '💄 Prenez soin de vous', sub: 'Cosmétiques, parfums et soins', color: 'linear-gradient(135deg,#f5e6ff,#e8d0fa)' },
  maison: { title: '🏠 Votre intérieur de rêve', sub: 'Meubles, déco et électroménager', color: 'linear-gradient(135deg,#fff3e6,#fde3c8)' },
  cuisine: { title: '🍎 Le goût de chez vous', sub: 'Épicerie et produits locaux', color: 'linear-gradient(135deg,#fffde6,#fff3c4)' },
  sport: { title: '⚽ Dépassez vos limites', sub: 'Équipement sportif et fitness', color: 'linear-gradient(135deg,#e6f7ef,#c4edd8)' },
  autre: { title: '📦 Nos autres produits', sub: 'Découvrez toute la sélection', color: 'linear-gradient(135deg,#f0f0f0,#e0e0e0)' },
};
const CAT_ORDER = ['electronique', 'mode', 'beaute', 'maison', 'cuisine', 'sport', 'autre'];

function renderShopCategoryRows(products, container) {
  const groups = {};
  products.forEach(p => { if (!groups[p.cat]) groups[p.cat] = []; groups[p.cat].push(p); });

  let html = '';
  for (const cat of CAT_ORDER) {
    const prods = groups[cat];
    if (!prods?.length) continue;
    const phrase = CAT_PHRASES[cat] || { title: catLabel(cat) };
    html += `
    <div class="cat-section">
      <div class="cat-section-header">
        <h2 class="cat-title">${phrase.title}</h2>
        <button class="see-all" onclick="shSetCat(null,'${cat}')">Voir tout →</button>
      </div>
      <div class="prod-grid">${prods.slice(0, 8).map(p => shopCardHTML(p)).join('')}</div>
    </div>`;
  }
  // Produits déjà affichés dans les sections
  const shownIds = new Set();
  for (const cat of CAT_ORDER) { (groups[cat] || []).slice(0, 8).forEach(p => shownIds.add(p.id)); }
  const remaining = products.filter(p => !shownIds.has(p.id));

  html += `
    <div id="sh-inf-grid" class="prod-grid" style="margin-top:8px"></div>
    <div id="sh-inf-footer" style="text-align:center;padding:28px 0 16px;display:none">
      <div id="sh-inf-spinner" style="display:none;margin:0 auto 10px;width:28px;height:28px;border:3px solid #f3f4f6;border-top-color:#f97316;border-radius:50%;animation:spin .7s linear infinite"></div>
      <button id="sh-inf-btn" onclick="_shInfAppend()" style="display:none;padding:10px 28px;background:#f97316;color:#fff;border:none;border-radius:24px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 12px rgba(249,115,22,.3)">Charger plus de produits ↓</button>
      <p id="sh-inf-end" style="display:none;color:#9ca3af;font-size:13px">✓ Tous les produits sont affichés</p>
    </div>`;

  container.innerHTML = html || '<div style="padding:40px;text-align:center;color:#6b7280">🛍️ Aucun produit</div>';
  observeShopImages();

  if (remaining.length) {
    _shInfData = remaining;
    _shInfShown = 0;
    _shInfLoading = false;
    _shInfDone = false;
    _shInfDetach();
    _shInfAttach();
  }
}

function scrollShRow() { }

// ===== TAB SWITCHING =====
function switchShopTab(tab, btn) {
  ['products', 'about', 'contact'].forEach(t => {
    const el = document.getElementById('tab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
  });
  document.querySelectorAll('.sh-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// ===== CARD BUILDER =====
function buildCatRowCards(prods) { return prods.map(p => shopCardHTML(p)).join(''); }

// ── Clean product card (matches marketplace style) ──────────
function shopCardHTML(p) {
  const disc = discount(p.price, p.oldPrice);
  const inCart = cart.some(i => String(i.id) === String(p.id));
  const img = getImgUrl(p.photo_url);
  const btnLabel = inCart ? '✓ Dans le panier' : 'Ajouter au panier';

  const media = p.video_url
    ? `<video src="${p.video_url}" autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'"></video>
       <span class="pcard-video-badge">▶ Vidéo</span>`
    : (img ? lazyImg(img, p.name.replace(/"/g, "'"), '') : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:2.5rem">${p.emoji}</div>`);

  return `
<div class="pcard" id="pcard-${p.id}">
  <div class="pcard-img" onclick="openProduct('${p.id}')">
    ${media}
    ${disc > 0 ? `<span class="pcard-disc">-${disc}%</span>` : ''}
  </div>
  <div class="pcard-body">
    <p class="pcard-name">${p.name}</p>
    <p class="pcard-price">${formatPrice(p.price)}</p>
    ${p.oldPrice ? `<p class="pcard-old">${formatPrice(p.oldPrice)}</p>` : ''}
    <button class="pcard-btn ${inCart ? 'in-cart' : ''}"
      onclick="event.stopPropagation();addToCart('${p.id}')">
      ${btnLabel}</button>
  </div>
</div>`;
}

// Legacy aliases
function stdCardHTML(p) { return shopCardHTML(p); }
function heroCardHTML(p) { return shopCardHTML(p); }

// ─── TYPE 3: QUAD ───────────────────────────────────────────
function quadCardHTML(prods4) { return prods4.map(p => shopCardHTML(p)).join(''); }
function duoCardHTML(p1, p2) { return shopCardHTML(p1) + shopCardHTML(p2); }

// ===== PRODUCT MODAL =====
function openProduct(id) {
  const p = PRODUCTS.find(x => String(x.id) === String(id));
  if (!p) return;

  // 🔥 SEO & JSON-LD
  updateSEO(p.name, p.desc || p.name, p);

  if (typeof vaTrack === 'function') vaTrack('view_product', { productId: id, shopId: SHOP?.id || null });
  else if (typeof trackInteraction === 'function') trackInteraction(id, 'view');
  const disc = discount(p.price, p.oldPrice);
  const mainImg = getImgUrl(p.photo_url);
  window._pmId = id; window._pmQty = 1;
  const oos = p.qty_stock !== null && p.qty_stock <= 0;
  const low = p.qty_stock !== null && p.qty_stock > 0 && p.qty_stock <= 3;
  
  // Build Gallery
  const allImgs = [];
  if (mainImg) allImgs.push(mainImg);
  if (p.images && Array.isArray(p.images)) {
    p.images.forEach(img => { if (img && img !== mainImg) allImgs.push(img); });
  }

  document.getElementById('product-modal-body').innerHTML = `
    <div class="pm-grid">
      <div class="pm-media-col">
        <div class="pm-img" id="pm-img-wrap" ${mainImg && !p.video_url ? `onclick="openLightbox(this.querySelector('img').src)"` : ''}>
          ${p.video_url
      ? `<video src="${p.video_url}" autoplay muted loop playsinline controls style="width:100%;height:100%;object-fit:contain;border-radius:12px;max-height:350px"></video>`
      : mainImg
        ? `<img id="pm-main-img" src="${mainImg}" alt="${p.name}" onerror="this.style.display='none'">`
        : `<span style="font-size:5rem">${p.emoji}</span>`
    }
          ${disc > 0 ? `<span style="position:absolute;top:10px;left:10px;background:#ff3b30;color:#fff;font-size:.8rem;font-weight:800;padding:4px 10px;border-radius:6px">-${disc}%</span>` : ''}
          ${mainImg && !p.video_url ? `<span class="pm-img-hint">🔍 Cliquer pour agrandir</span>` : ''}
        </div>
        
        ${allImgs.length > 1 ? `
        <div class="pm-gallery" style="display:flex;gap:8px;margin-top:10px;overflow-x:auto;padding-bottom:5px">
          ${allImgs.map((img, i) => `
            <div class="pm-thumb ${i===0?'active':''}" onclick="swapPmImg(this, '${img}')" style="flex:0 0 60px;height:60px;border-radius:8px;overflow:hidden;border:2px solid ${i===0?'var(--brand)':'transparent'};cursor:pointer;background:#f5f5f5">
              <img src="${img}" style="width:100%;height:100%;object-fit:cover">
            </div>
          `).join('')}
        </div>` : ''}
      </div>

      <div class="pm-info">
        <div class="product-category">${catLabel(p.cat)}</div>
        <h2 style="margin:8px 0 6px;font-size:1.4rem;font-weight:900">${p.name}</h2>
        <div class="product-price" style="margin:12px 0">
          <span class="price-current" style="font-size:1.7rem">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="price-old" style="font-size:1.1rem;margin-left:8px">${formatPrice(p.oldPrice)}</span>` : ''}
        </div>
        
        ${p.desc ? `
        <div style="margin-bottom:18px">
          <label style="font-size:.75rem;text-transform:uppercase;color:var(--text2);font-weight:700;display:block;margin-bottom:6px">Description</label>
          <div style="font-size:.9rem;color:var(--text);line-height:1.6;white-space:pre-wrap;background:var(--gray);padding:12px;border-radius:10px">${p.desc}</div>
        </div>` : ''}

        ${low ? `<div style="font-size:.82rem;color:#e53935;font-weight:700;margin-bottom:10px;padding:8px 12px;background:#fff5f5;border-radius:8px;border-left:3px solid #e53935">⚠️ Plus que ${p.qty_stock} unité${p.qty_stock > 1 ? 's' : ''} !</div>` : ''}
        ${oos
      ? `<div style="font-size:.88rem;color:#e53935;font-weight:700;margin-bottom:10px;padding:10px 14px;background:#fff0f0;border-radius:8px;text-align:center">❌ Rupture de stock</div>`
      : `<div style="display:flex;align-items:center;gap:16px;margin-bottom:14px;font-size:.8rem;color:#00a849">
               <span>🚚 Livraison disponible</span><span>💳 Paiement à la livraison</span>
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
        return item ? `<div style="margin-top:10px;font-size:0.72rem;padding:5px 10px;background:#f0f9ff;color:#0369a1;border-radius:6px;display:flex;align-items:center;gap:6px;font-weight:600">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                 ${item.qty} déjà dans votre panier
               </div>` : '';
      })()}
             <button class="btn-primary full-width" onclick="addToCartQty('${p.id}')" style="margin-top:14px;margin-bottom:10px">🛒 Ajouter au panier</button>`}
        <div style="display:flex;gap:10px;margin-bottom:12px">
          <button class="btn-ghost" onclick="toggleWish('${p.id}')" style="flex:1;color:var(--text);border-color:var(--gray2)">
            ${wishlist.includes(id) ? '❤️ Favoris' : '🤍 Favoris'}
          </button>
          <button class="btn-ghost" onclick="shareProduct('${p.id}', '${p.shop_id || ''}', '${SHOP?.slug || ''}', \`${p.name.replace(/['"`]/g, '')}\`, ${p.price})" style="flex:1;color:var(--text);border-color:var(--gray2);display:flex;align-items:center;justify-content:center;gap:6px">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Partager
          </button>
        </div>
        ${(() => {
    const shopSlugOrId = SHOP?.slug || SHOP?.id || p.shop_id;
    const basePath = window.location.pathname.replace(/\/shop\.html.*/i, '').replace(/\/$/, '');
    const baseUrl = window.location.origin + basePath;
    const shareUrl = encodeURIComponent(`${baseUrl}/shop.html?shop=${shopSlugOrId}&p=${p.id}`);
    const shareText = encodeURIComponent(`Regarde ce produit sur Velmo : *${p.name}* à ${formatPrice(p.price)} !\n\nLien : `);
    return `
          <a href="https://wa.me/?text=${shareText}${shareUrl}" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#25D366;color:#fff;border:none;border-radius:12px;padding:14px;font-weight:700;margin-top:0;text-decoration:none">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            WhatsApp
          </a>`;
  })()}
      </div>
    </div>`;
  openModal('modal-product');
  addToRecent(id);
  // Init mouse-tracking zoom on the image
  requestAnimationFrame(() => {
    const wrap = document.getElementById('pm-img-wrap');
    const zimg = document.getElementById('pm-main-img');
    if (!wrap || !zimg) return;
    wrap.addEventListener('mousemove', (e) => {
      const r = wrap.getBoundingClientRect();
      const xPct = ((e.clientX - r.left) / r.width) * 100;
      const yPct = ((e.clientY - r.top) / r.height) * 100;
      zimg.style.transformOrigin = `${xPct}% ${yPct}%`;
      zimg.style.transform = 'scale(2.5)';
    });
    wrap.addEventListener('mouseleave', () => {
      zimg.style.transform = 'scale(1)';
      zimg.style.transformOrigin = 'center center';
    });
  });
}

function swapPmImg(el, src) {
  const main = document.getElementById('pm-main-img');
  if (main) main.src = src;
  document.querySelectorAll('.pm-thumb').forEach(t => {
    t.classList.remove('active');
    t.style.borderColor = 'transparent';
  });
  el.classList.add('active');
  el.style.borderColor = 'var(--brand)';
}

// ===== PRODUCT SHARING =====
async function shareProduct(id, shopId, slug, name, price) {
  const shopSlugOrId = slug || shopId;
  if (!shopSlugOrId) {
    showToast('Erreur: Lien introuvable');
    return;
  }
  const basePath = window.location.pathname.replace(/\/shop\.html.*/i, '').replace(/\/$/, '');
  const baseUrl = window.location.origin + basePath;
  const link = `${baseUrl}/shop.html?shop=${shopSlugOrId}&p=${id}`;
  const text = `Regarde ce produit sur Velmo : ${name} à ${formatPrice(price)} !\n\nLien : `;
  
  if (navigator.share) {
    try {
      await navigator.share({ title: name, text: text, url: link });
    } catch (e) {
      if (e.name !== 'AbortError') {
        copyToClip(link, 'Lien copié dans le presse-papier !');
      }
    }
  } else {
    copyToClip(link, 'Lien copié dans le presse-papier !');
  }
}

function copyToClip(text, successMsg) {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  showToast(successMsg);
}

function openLightbox(src) {
  const lb = document.getElementById('pm-lightbox');
  const lbImg = document.getElementById('pm-lightbox-img');
  if (!lb || !lbImg) return;
  lbImg.src = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  const lb = document.getElementById('pm-lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}

function pmQty(d) { window._pmQty = Math.max(1, (window._pmQty || 1) + d); const el = document.getElementById('pm-qty'); if (el) el.textContent = window._pmQty; }
function addToCartQty(id) {
  const qty = window._pmQty || 1;
  for (let i = 0; i < qty; i++) addToCart(id, true);
  window._pmQty = 1;
  closeModal('modal-product');
  showToast('✅ Ajouté au panier !');
  toggleCart();
}

// ===== CART =====
// Lazy image observer for shop cards
function observeShopImages() {
  if (!window.IntersectionObserver) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });
  document.querySelectorAll('#sh-products img[data-src]').forEach(img => obs.observe(img));
}

function refreshShopCartButtons() {
  document.querySelectorAll('#sh-products [id^="pcard-"]').forEach(card => {
    const id = card.id.replace('pcard-', '');
    const btn = card.querySelector('.pcard-btn');
    if (!btn || btn.disabled) return;
    const inCart = cart.some(i => String(i.id) === String(id));
    btn.classList.toggle('in-cart', inCart);
    btn.textContent = inCart ? '✓ Dans le panier' : 'Ajouter au panier';
  });
}

function addToCart(id, silent = false) {
  const p = PRODUCTS.find(x => String(x.id) === String(id));
  if (!p) return;
  if (typeof vaTrack === 'function') vaTrack('add_cart', { productId: id, shopId: SHOP?.id || null });
  const ex = cart.find(i => String(i.id) === String(id));
  if (ex) ex.qty++;
  else cart.push({ id: p.id, name: p.name, emoji: p.emoji, price: p.price, qty: 1, photo_url: p.photo_url || null, shop_id: SHOP?.id || null, shop_name: SHOP?.name || '' });
  saveCart(); updateCartBadge(); renderCart();
  refreshShopCartButtons();
  if (!silent) showToast(`✅ "${p.name}" ajouté !`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(); updateCartBadge(); renderCart();
  refreshShopCartButtons();
}
function changeQty(id, d) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + d);
  saveCart(); renderCart(); updateCartBadge();
}
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function updateCartBadge() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const totalVal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const b = document.getElementById('cart-badge');
  if (b) { b.textContent = count; b.classList.toggle('show', count > 0); }

  updateFloatingCart(count, totalVal);
}

function updateFloatingCart(count, totalVal) {
  const f = document.getElementById('cart-floating');
  const ft = document.getElementById('cart-floating-total');
  if (!f) return;
  const modalOpen = document.querySelector('.modal.open') !== null;
  const drawerOpen = document.querySelector('.cart-drawer.open') !== null;
  const shouldShow = count > 0 && !modalOpen && !drawerOpen;
  f.classList.toggle('show', shouldShow);
  if (ft && totalVal !== null) ft.textContent = formatPrice(totalVal);
}
function renderCart() {
  const items = document.getElementById('cart-items');
  const footer = document.getElementById('cart-footer');
  const empty = document.getElementById('cart-empty');
  if (!items) return;
  if (!cart.length) {
    if (empty) empty.style.display = 'flex';
    if (footer) footer.style.display = 'none';
    items.querySelectorAll('.cart-item').forEach(el => el.remove());
    return;
  }
  if (empty) empty.style.display = 'none';
  if (footer) footer.style.display = 'block';
  items.querySelectorAll('.cart-item').forEach(el => el.remove());
  let sub = 0;
  cart.forEach(item => {
    sub += item.price * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-img" style="background:var(--gray);border-radius:8px;width:52px;height:52px;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:1.4rem;flex-shrink:0">
        ${item.photo_url ? `<img src="${getImgUrl(item.photo_url)}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">` : item.emoji}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:.82rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name}</div>
        <div style="font-size:.78rem;color:var(--orange);font-weight:700;margin-top:2px">${formatPrice(item.price)}</div>
        <div class="qty-controls" style="margin-top:5px;gap:6px">
          <button class="qty-btn" style="width:24px;height:24px;font-size:.85rem" onclick="changeQty('${item.id}',-1)">−</button>
          <span class="qty-val" style="min-width:22px;font-size:.82rem">${item.qty}</span>
          <button class="qty-btn" style="width:24px;height:24px;font-size:.85rem" onclick="changeQty('${item.id}',1)">+</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0">
        <span style="font-size:.82rem;font-weight:700">${formatPrice(item.price * item.qty)}</span>
        <button onclick="removeFromCart('${item.id}')" style="background:none;border:none;color:var(--text2);font-size:.75rem;cursor:pointer;padding:0">✕ Retirer</button>
      </div>`;
    items.appendChild(div);
  });
  const stEl = document.getElementById('cart-subtotal');
  const totEl = document.getElementById('cart-total');
  if (stEl) stEl.textContent = formatPrice(sub);
  if (totEl) totEl.textContent = formatPrice(sub);
}
function toggleCart() {
  const d = document.getElementById('cart-drawer');
  const o = document.getElementById('overlay');
  if (!d) return;
  const open = d.classList.toggle('open');
  if (o) o.classList.toggle('show', open);
  if (open) { renderCart(); document.getElementById('wishlist-panel')?.classList.remove('open'); }
  // Sync bouton flottant (caché quand drawer ouvert)
  updateCartBadge();
}

// ===== WISHLIST =====
function toggleWish(id) {
  const sid = String(id);
  if (wishlist.includes(sid)) { wishlist = wishlist.filter(x => x !== sid); showToast('💔 Retiré des favoris'); }
  else {
    wishlist.push(sid);
    showToast('❤️ Ajouté aux favoris !');
    if (typeof vaTrack === 'function') vaTrack('add_wish', { productId: sid, shopId: SHOP?.id || null });
    else if (typeof trackInteraction === 'function') trackInteraction(sid, 'wish');
  }
  localStorage.setItem('velmo_wish', JSON.stringify(wishlist));
  updateWishBadge();
  const wished = wishlist.includes(sid);
  document.querySelectorAll(`#crwish-${sid}`).forEach(b => { b.textContent = wished ? '❤️' : '🤍'; b.classList.toggle('active', wished); });
  renderWishlist();
}
function updateWishBadge() {
  const el = document.getElementById('wishlist-badge');
  if (el) { el.textContent = wishlist.length; el.classList.toggle('show', wishlist.length > 0); }
  const wc = document.getElementById('wish-count');
  if (wc) wc.textContent = wishlist.length;
}
function renderWishlist() {
  const el = document.getElementById('wish-items');
  if (!el) return;
  el.innerHTML = '';
  const wished = wishlist.map(id => PRODUCTS.find(p => String(p.id) === id)).filter(Boolean);
  if (!wished.length) { el.innerHTML = '<div class="cart-empty"><span>💙</span><p>Aucun favori</p></div>'; return; }
  wished.forEach(p => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div style="background:${catColor(p.cat)};border-radius:8px;width:52px;height:52px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;overflow:hidden">
        ${p.photo_url ? `<img src="${getImgUrl(p.photo_url)}" style="width:100%;height:100%;object-fit:cover">` : p.emoji}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:.82rem;font-weight:600">${p.name}</div>
        <div style="font-size:.78rem;color:var(--orange);font-weight:700;margin-top:2px">${formatPrice(p.price)}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
        <button onclick="addToCart('${p.id}')" style="background:var(--orange);color:#fff;border:none;border-radius:6px;padding:5px 10px;font-size:.72rem;font-weight:700;cursor:pointer">Ajouter</button>
        <button onclick="toggleWish('${p.id}')" style="background:none;border:none;color:var(--text2);font-size:.72rem;cursor:pointer">✕</button>
      </div>`;
    el.appendChild(div);
  });
}
function toggleWishlistPanel() {
  const p = document.getElementById('wishlist-panel');
  const o = document.getElementById('overlay');
  if (!p) return;
  const open = p.classList.toggle('open');
  if (o) o.classList.toggle('show', open);
  if (open) { renderWishlist(); document.getElementById('cart-drawer')?.classList.remove('open'); }
}

// ===== CHECKOUT =====
function renderClosedBanner() {
  // Insère une bannière rouge sous le hero
  const hero = document.getElementById('sh-hero');
  if (!hero) return;
  const existing = document.getElementById('sh-closed-banner');
  if (existing) return;
  const banner = document.createElement('div');
  banner.id = 'sh-closed-banner';
  banner.innerHTML = `
    <div style="background:rgba(239,68,68,0.12);border:1.5px solid rgba(239,68,68,0.35);border-radius:14px;margin:16px;padding:14px 18px;display:flex;align-items:center;gap:12px">
      <div style="width:10px;height:10px;border-radius:50%;background:#ef4444;flex-shrink:0;box-shadow:0 0 8px #ef4444aa"></div>
      <div>
        <p style="font-weight:800;color:#ef4444;margin:0;font-size:14px">Boutique temporairement fermée</p>
        <p style="color:#94a3b8;margin:4px 0 0;font-size:12px">Les commandes sont suspendues. Revenez plus tard.</p>
      </div>
    </div>`;
  hero.after(banner);

  // Désactiver le bouton Commander
  const btn = document.querySelector('.btn-primary[onclick="checkout()"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '🔴 Commandes suspendues';
    btn.style.cssText = 'background:#334155;color:#64748b;cursor:not-allowed;opacity:0.7;width:100%;padding:12px;border:none;border-radius:10px;font-weight:700;font-size:14px';
  }
}

function checkout() {
  if (SHOP && SHOP.is_online_active === false) { showToast('🔴 Cette boutique ne prend pas de commandes pour le moment'); return; }
  if (!cart.length) { showToast('⚠️ Votre panier est vide'); return; }
  const summary = document.getElementById('order-summary');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (summary) {
    summary.innerHTML = `
      <div style="font-weight:800;font-size:0.75rem;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">Ma Commande</div>
      ${cart.map(i => {
      const img = getImgUrl(i.photo_url);
      return `
        <div class="order-summary-item">
          <div class="order-summary-item-img" style="display:flex;align-items:center;justify-content:center;background:#f3f4f6;font-size:1.2rem">
            ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">` : (i.emoji || '📦')}
          </div>
          <div style="flex:1; min-width:0">
            <div style="font-weight:700;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#111">${i.name}</div>
            <div style="font-size:0.75rem;color:#6b7280;margin-top:2px">${i.qty} × ${formatPrice(i.price)}</div>
          </div>
          <div style="font-weight:800;font-size:0.85rem;flex-shrink:0;color:#111">${formatPrice(i.price * i.qty)}</div>
        </div>`;
    }).join('')}
      <div class="order-summary-total">
        <span style="color:#6b7280;font-weight:600;font-size:0.9rem">Total à payer</span>
        <span style="color:var(--orange);font-size:1.1rem">${formatPrice(total)}</span>
      </div>`;
  }

  toggleCart();
  setTimeout(() => {
    openModal('modal-checkout');
    // 🔥 PRE-REMPLISSAGE PREMIUM & SPEED
    const sName = localStorage.getItem('velmo_co_name');
    const sPhone = localStorage.getItem('velmo_co_phone');
    const sAddress = localStorage.getItem('velmo_co_address');

    if (sName) {
      const el = document.getElementById('co-name');
      if (el) { el.value = sName; el.previousElementSibling.innerHTML += ' <span class="saved-badge">Mémorisé ⚡</span>'; }
    }
    if (sPhone) {
      const el = document.getElementById('co-phone');
      if (el) { el.value = sPhone; el.previousElementSibling.innerHTML += ' <span class="saved-badge">Mémorisé ⚡</span>'; }
    }
    if (sAddress) {
      const el = document.getElementById('co-address');
      if (el) { el.value = sAddress; el.previousElementSibling.innerHTML += ' <span class="saved-badge">Mémorisé ⚡</span>'; }
    }

    // Bouton de confirmation dynamique
    const btnConfirm = document.querySelector('#modal-checkout .btn-primary');
    if (btnConfirm) {
      btnConfirm.innerHTML = `✅ Confirmer la commande <span class="btn-price">${formatPrice(total)}</span>`;
      btnConfirm.className = 'btn-primary full-width btn-confirm';
    }

    // Auto-focus sur le premier champ vide
    const inputs = ['co-name', 'co-phone', 'co-address'];
    for (const id of inputs) {
      const el = document.getElementById(id);
      if (el && !el.value) { el.focus(); break; }
    }
    setupPhoneFormatter();
  }, 300);
}

function setupPhoneFormatter() {
  const input = document.getElementById('co-phone');
  if (!input) return;
  const format = (v) => {
    let clean = v.replace(/\D/g, '');
    if (clean.startsWith('2246')) clean = clean.substring(4);
    else if (clean.startsWith('6')) clean = clean.substring(1);
    clean = clean.substring(0, 8);
    let f = '+224 6';
    if (clean.length > 0) f += clean.substring(0, 2);
    if (clean.length > 2) f += ' ' + clean.substring(2, 4);
    if (clean.length > 4) f += ' ' + clean.substring(4, 6);
    if (clean.length > 6) f += ' ' + clean.substring(6, 8);
    return f;
  };
  input.addEventListener('input', (e) => {
    const start = e.target.selectionStart; const oldLen = e.target.value.length;
    e.target.value = format(e.target.value);
    const newLen = e.target.value.length;
    const finalPos = Math.max(7, start + (newLen - oldLen));
    e.target.setSelectionRange(finalPos, finalPos);
  });
}
async function placeOrder() {
  const name = document.getElementById('co-name')?.value.trim();
  const phone = document.getElementById('co-phone')?.value.trim();
  const address = document.getElementById('co-address')?.value.trim();
  const payment = document.getElementById('co-payment')?.value || 'Paiement à la livraison';
  const delivery = document.getElementById('co-delivery')?.value || 'delivery';

  // SOLIDITY : Validation
  if (!name || name.length < 3) { showToast('⚠️ Nom trop court'); return; }
  if (phone.replace(/\D/g, '').length < 8) { showToast('⚠️ Numéro de téléphone invalide'); return; }
  if (delivery === 'delivery' && (!address || address.length < 5)) { showToast('⚠️ Adresse de livraison requise'); return; }

  const cleanName = name.replace(/[<>]/g, '');
  const cleanAddress = address.replace(/[<>]/g, '');

  localStorage.setItem('velmo_co_name', cleanName);
  localStorage.setItem('velmo_co_phone', phone);
  localStorage.setItem('velmo_co_address', cleanAddress);

  const btn = document.querySelector('#modal-checkout .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Envoi en cours...'; }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // STOCK CHECK
  try {
    const ids = cart.map(i => i.id).join(',');
    const liveStocks = await sbGet('products', `id=in.(${ids})&select=id,name,quantity`);
    for (const item of cart) {
      const live = liveStocks.find(ls => ls.id === item.id);
      if (live && live.quantity !== null && live.quantity < item.qty) {
        showToast(`❌ Plus assez de stock pour "${item.name}"`);
        if (btn) { btn.disabled = false; btn.innerHTML = `✅ Confirmer la commande <span class="btn-price">${formatPrice(total)}</span>`; }
        return;
      }
    }
    const itemsSnap = [...cart];
    const ref = 'CMD-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    await sbPost('customer_orders', {
      shop_id: SHOP.id,
      customer_name: cleanName,
      customer_phone: phone,
      customer_address: cleanAddress || null,
      delivery_method: delivery,
      notes: payment ? `Paiement: ${payment}` : null,
      total_amount: total,
      status: 'pending',
      short_ref: ref,
      items_json: itemsSnap.map(i => ({
        id: i.id, name: i.name, price: i.price,
        quantity: i.qty, photo_url: i.photo_url || null,
      })),
    });

    // Analytics
    if (typeof vaTrack === 'function') {
      vaTrack('checkout_done', { shopId: SHOP.id, meta: { ref, total, name: cleanName } });
    }

    // Vider le panier
    cart = [];
    saveCart(); updateCartBadge(); renderCart();
    closeModal('modal-checkout');
    fireConfetti();
    showOrderConfirmation({ ref, name: cleanName, phone, address: cleanAddress, delivery, payment, total, items: itemsSnap });

  } catch (err) {
    console.error('Submit Fail:', err);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '⚠️ Erreur Réseau. WhatsApp ?';
      btn.onclick = () => {
        const waMsg = encodeURIComponent(`Bonjour ${SHOP?.name || 'Velmo'},\nJe veux commander en direct :\n${cart.map(i => `- ${i.qty}x ${i.name}`).join('\n')}\nTotal: ${formatPrice(total)}\nClient: ${cleanName} (${phone})`);
        window.open(`https://wa.me/${SHOP?.phone || '224623531387'}?text=${waMsg}`, '_blank');
      };
    }
  }
}

// ===== CONFIRMATION CARD =====
function showOrderConfirmation({ ref, name, phone, address, delivery, payment, total, items }) {
  const body = document.getElementById('success-modal-body');
  if (!body) return;

  // Numéro réel du vendeur (whatsapp prioritaire, sinon téléphone, sinon pas de bouton)
  const rawWa = (SHOP.whatsapp || SHOP.phone || '').replace(/\D/g, '');
  const waNumber = rawWa ? (rawWa.startsWith('224') ? rawWa : '224' + rawWa) : null;

  // Message pré-rempli avec récapitulatif complet
  const itemLines = items.map(i => `  • ${i.name} ×${i.qty} — ${formatPrice(i.price * i.qty)}`).join('\n');
  const delivLabel = delivery === 'pickup' ? 'Retrait en boutique' : 'Livraison à domicile';
  const waMsg = encodeURIComponent([
    `Bonjour *${SHOP.name}* ! 👋`,
    ``,
    `Je viens de passer une commande sur votre boutique Velmo.`,
    ``,
    `📦 *Réf :* ${ref}`,
    `👤 *Nom :* ${name}`,
    `📞 *Tél :* ${phone}`,
    address ? `📍 *Adresse :* ${address}` : null,
    `🚚 *Livraison :* ${delivLabel}`,
    `💳 *Paiement :* ${payment}`,
    ``,
    `*Articles commandés :*`,
    itemLines,
    ``,
    `💰 *Total : ${formatPrice(total)}*`,
    ``,
    `Merci de confirmer ma commande ! 🙏`,
  ].filter(l => l !== null).join('\n'));

  body.innerHTML = `
    <div style="padding:40px 20px;text-align:center">
      <div style="font-size:4.5rem;margin-bottom:20px">🎉</div>
      <h2 style="margin-bottom:10px;font-size:1.5rem;font-weight:900">Merci, ${name} !</h2>
      <p style="color:#666;font-size:0.92rem;margin-bottom:24px">Commande transmise à <strong>${SHOP.name}</strong></p>

      <div style="background:#f8f9fa;border-radius:16px;padding:20px;margin-bottom:24px;border:1px solid #eee;text-align:left">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.85rem"><span>Référence :</span><strong style="font-family:monospace;color:var(--orange)">${ref}</strong></div>
        <div style="display:flex;justify-content:space-between;font-size:0.85rem"><span>Total :</span><strong>${formatPrice(total)}</strong></div>
        <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-top:4px"><span>Paiement :</span><span>${payment}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-top:4px"><span>Livraison :</span><span>${delivery === 'pickup' ? '🏪 Retrait' : '🚚 Domicile'}</span></div>
      </div>

      ${waNumber
      ? `<a href="https://wa.me/${waNumber}?text=${waMsg}" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#25D366;color:#fff;border:none;border-radius:12px;padding:14px;font-weight:700;margin-bottom:12px;text-decoration:none">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            Envoyer la commande sur WhatsApp
           </a>`
      : `<div style="font-size:0.82rem;color:#999;padding:10px;background:#f8f9fa;border-radius:10px;margin-bottom:12px">
            Le vendeur n'a pas renseigné de numéro WhatsApp.
           </div>`
    }

      <button class="btn-ghost full-width" onclick="closeAll()" style="margin-top:12px;color:#888;font-weight:600">Continuer mes achats</button>
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

// ===== TELEGRAM NOTIFY VENDEUR =====
async function notifyShopTelegram({ ref, name, phone, address, delivery, payment, total, items }) {
  const MAX_RETRIES = 3;
  const BACKOFF = [2000, 5000, 15000];
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const subs = await sbGet('telegram_subscribers', `shop_id=eq.${SHOP.id}&status=eq.active&select=chat_id&limit=1`);
      if (!subs || !subs.length) return; // Pas de Telegram configuré

      const chatId = subs[0].chat_id;
      const delivLabel = delivery === 'pickup' ? 'Retrait boutique' : 'Livraison à domicile';
      const itemLines = items.map(i => `  • ${i.name} ×${i.qty} — ${formatPrice(i.price * i.qty)}`).join('\n');

      const text = [
        `🛒 *Nouvelle commande — ${SHOP.name}*`,
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
        headers: { ...SB_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
      });
      if (res.ok || res.status === 400) return; // 400 = mauvais format, inutile de réessayer
      throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(r => setTimeout(r, BACKOFF[attempt]));
      } else {
        console.warn('[Telegram] notify échoué après', MAX_RETRIES, 'tentatives:', e.message);
      }
    }
  }
}

// ===== MODAL / OVERLAY =====
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
  document.getElementById('overlay')?.classList.add('show');
  // Cacher le bouton panier flottant
  updateFloatingCart(cart.reduce((s, i) => s + i.qty, 0), null);
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
  const anyOpen = document.querySelector('.modal.open');
  if (!anyOpen) document.getElementById('overlay')?.classList.remove('show');
  // Réafficher le bouton panier si plus aucun modal ouvert
  if (!anyOpen) updateCartBadge();
}
async function trackOrder() {
  const ref = document.getElementById('track-ref')?.value.trim().toUpperCase();
  if (!ref) { showToast('⚠️ Veuillez entrer une référence'); return; }
  const result = document.getElementById('track-result');
  if (!result) return;
  result.style.display = 'block';
  result.innerHTML = '<div style="text-align:center">🔍 Recherche en cours...</div>';
  try {
    const orders = await sbGet('customer_orders', `or=(short_ref.eq.${ref},order_number.eq.${ref})&limit=1`);
    if (!orders || orders.length === 0) {
      result.innerHTML = '<div style="text-align:center;color:#e53935">❌ Commande introuvable</div>';
      return;
    }
    const o = orders[0];
    const ORDER_STATUS_MAP = {
      'pending': { icon: '⏳', label: 'EN ATTENTE', color: '#666', desc: 'Le vendeur a reçu votre commande.' },
      'confirmed': { icon: '✅', label: 'CONFIRMÉE', color: '#00a849', desc: 'Votre commande a été acceptée.' },
      'preparing': { icon: '📦', label: 'EN PRÉPARATION', color: '#ff6b00', desc: 'Nous préparons vos articles.' },
      'shipped': { icon: '🚚', label: 'EN COURS DE LIVRAISON', color: '#2563eb', desc: 'Le livreur est en route !' },
      'delivered': { icon: '🎉', label: 'LIVRÉE', color: '#00a849', desc: 'Commande livrée avec succès.' },
      'cancelled': { icon: '❌', label: 'ANNULÉE', color: '#dc2626', desc: 'Cette commande a été annulée.' }
    };
    const s = ORDER_STATUS_MAP[o.status] || ORDER_STATUS_MAP['pending'];
    const steps = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];
    const currentIdx = steps.indexOf(o.status) > -1 ? steps.indexOf(o.status) : 0;
    const isFinal = o.status === 'delivered' || o.status === 'cancelled';

    // Bloc notation : affiché après livraison si pas encore noté
    const ratingBlock = (o.status === 'delivered' && !o.rated_at) ? `
      <div id="rating-block" style="margin-top:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:18px;text-align:center">
        <div style="font-weight:700;font-size:0.95rem;margin-bottom:12px;color:#166534">⭐ Comment s'est passée votre livraison ?</div>
        <div style="display:flex;justify-content:center;gap:6px;margin-bottom:12px" id="stars-row" data-order-id="${o.id}">
          ${[1, 2, 3, 4, 5].map(n => `<span data-rating="${n}" id="star-${n}" style="font-size:2rem;cursor:pointer;transition:transform 0.1s">☆</span>`).join('')}
        </div>
        <div id="rating-msg" style="font-size:0.82rem;color:#666;min-height:18px"></div>
      </div>` : (o.status === 'delivered' && o.rating) ? `
      <div style="text-align:center;margin-top:10px;color:#166534;font-size:0.85rem">
        ✅ Merci pour votre avis ! ${'⭐'.repeat(o.rating)}
      </div>` : '';

    result.style.display = 'block';
    result.innerHTML = `
      <div style="text-align:center;padding:12px 4px;animation:fadeIn .4s ease">
        <div class="track-icon-main" style="font-size:3rem;margin-bottom:12px;filter:drop-shadow(0 4px 10px ${s.color}44)">${s.icon}</div>
        <div style="font-weight:900;font-size:1.1rem;margin-bottom:4px;color:var(--text)">#${ref}</div>
        <div style="display:inline-block;padding:6px 18px;background:${s.color};color:#fff;border-radius:24px;font-size:.75rem;font-weight:800;margin-bottom:20px;box-shadow:0 4px 12px ${s.color}44">${s.label}</div>
        
        <!-- Stepper Professionnel -->
        <div class="stepper-wrapper" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;position:relative;padding:0 10px">
          <div style="position:absolute;top:13px;left:40px;right:40px;height:2px;background:#eee;z-index:0"></div>
          <div style="position:absolute;top:13px;left:40px;width:${(currentIdx / (steps.length - 1)) * 100}%;height:2px;background:#00a849;z-index:1;transition:width 1s ease"></div>
          ${steps.map((st, i) => {
      const active = i <= currentIdx;
      return `<div style="z-index:2;position:relative;text-align:center">
              <div style="width:28px;height:28px;border-radius:50%;background:${active ? '#00a849' : '#fff'};border:2px solid ${active ? '#00a849' : '#eee'};display:flex;align-items:center;justify-content:center;font-size:.7rem;color:${active ? '#fff' : '#ccc'};transition:all .3s">
                ${active && i < currentIdx ? '✓' : ORDER_STATUS_MAP[st].icon}
              </div>
            </div>`;
    }).join('')}
        </div>

        <div style="background:#f9fafb;border-radius:12px;padding:15px;text-align:left;margin-bottom:20px;border:1px solid #f0f0f0">
          <p style="font-size:.85rem;color:var(--text2);line-height:1.5;margin:0">
            <strong style="color:var(--text)">Status :</strong> ${s.desc}
          </p>
        </div>

        <div style="font-weight:900;font-size:1.1rem;color:var(--text);margin-bottom:15px">
          Total : <span style="color:var(--orange)">${formatPrice(o.total_amount)}</span>
        </div>

        ${o.status === 'shipped' ? `
          <a href="tel:+224623531387" class="btn-primary" style="display:flex;align-items:center;justify-content:center;gap:10px;text-decoration:none;margin-bottom:15px;background:#2563eb">
            <span style="font-size:1.2rem">📞</span> Appeler le livreur
          </a>
        ` : ''}

        ${!isFinal ? `<div style="font-size:.7rem;color:#9ca3af;font-style:italic">🔄 Actualisation automatique en cours...</div>` : ''}
        ${ratingBlock}
      </div>`;
  } catch (err) {
    result.innerHTML = '<div style="text-align:center;color:#e53935">⚠️ Erreur lors de la recherche</div>';
  }
}
// ===== NOTATION CLIENT =====
// Délégation d'événement sur #stars-row (pas d'onclick inline → pas de XSS)
document.addEventListener('click', async (e) => {
  const star = e.target.closest('[data-rating]');
  if (!star) return;
  const row = star.closest('[data-order-id]');
  if (!row) return;
  const orderId = row.dataset.orderId;
  const rating = parseInt(star.dataset.rating, 10);
  if (!orderId || !rating) return;

  // Feedback visuel immédiat
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById(`star-${i}`);
    if (el) { el.textContent = i <= rating ? '⭐' : '☆'; el.style.transform = i === rating ? 'scale(1.3)' : 'scale(1)'; }
  }
  // Désactiver les étoiles pendant l'envoi
  row.style.pointerEvents = 'none';
  const msg = document.getElementById('rating-msg');
  if (msg) msg.textContent = 'Envoi...';

  try {
    const res = await fetch(`${SB_URL}/rest/v1/rpc/velmo_rate_order`, {
      method: 'POST',
      headers: { ...SB_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_order_id: orderId, p_rating: rating }),
    });
    const data = await res.json();
    if (data?.ok) {
      if (msg) msg.innerHTML = '<span style="color:#166534;font-weight:700">✅ Merci pour votre avis !</span>';
      setTimeout(() => {
        const block = document.getElementById('rating-block');
        if (block) block.innerHTML = `<div style="color:#166534;font-weight:700;text-align:center;padding:10px">Merci ! ${'⭐'.repeat(rating)}</div>`;
      }, 1500);
    } else {
      if (msg) msg.textContent = 'Erreur — réessayez';
      row.style.pointerEvents = '';
    }
  } catch (_) {
    if (msg) msg.textContent = 'Erreur réseau';
    row.style.pointerEvents = '';
  }
});

function closeAll() {
  document.querySelectorAll('.modal.open, .cart-drawer.open').forEach(el => el.classList.remove('open'));
  document.getElementById('overlay')?.classList.remove('show');
  // Réafficher le bouton panier flottant
  updateCartBadge();
}

// ===== TOAST QUEUE SYSTEM (Ultra-Solide) =====
let toastQueue = [];
let isToastShowing = false;

function showToast(msg) {
  toastQueue.push(msg);
  if (!isToastShowing) processToastQueue();
}

function processToastQueue() {
  if (toastQueue.length === 0) { isToastShowing = false; return; }
  isToastShowing = true;
  const msg = toastQueue.shift();

  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');

  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(processToastQueue, 400); // Pause entre deux toasts
  }, 3000);
}

// ===== ERROR STATE =====
function showShopError(msg) {
  document.getElementById('sh-name').textContent = 'Introuvable';
  const grid = document.getElementById('sh-products');
  if (grid) grid.innerHTML = `
    <div style="grid-column:1/-1">
      <div class="sh-empty">
        <div class="sh-empty-icon">🏪</div>
        <div class="sh-empty-title">${msg}</div>
        <div class="sh-empty-sub" style="margin-top:16px">
          <a href="index.html" class="btn-primary" style="display:inline-block;text-decoration:none;padding:10px 24px">← Retour à la marketplace</a>
        </div>
      </div>
    </div>`;
  const loader = document.getElementById('sh-grid-loader');
  if (loader) loader.style.display = 'none';
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
        <p style="color:var(--text2);font-size:0.85rem;margin-top:8px">Vous n'avez pas encore passé de commande ou vos informations ne sont pas enregistrées.</p>
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
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

window.addEventListener('scroll', () => {
  const btn = document.getElementById('btn-scroll-top');
  if (!btn) return;
  if (window.scrollY > 400) btn.classList.add('show');
  else btn.classList.remove('show');
});

function setupPhoneFormatter() {
  const input = document.getElementById('co-phone');
  if (!input) return;

  const format = (v) => {
    let clean = v.replace(/\D/g, '');
    if (clean.startsWith('224')) clean = clean.substring(3);
    clean = clean.substring(0, 9);

    if (clean.length === 0) return '';
    let f = '+224 ';
    if (clean.length > 0) f += clean.substring(0, 3);
    if (clean.length > 3) f += ' ' + clean.substring(3, 5);
    if (clean.length > 5) f += ' ' + clean.substring(5, 7);
    if (clean.length > 7) f += ' ' + clean.substring(7, 9);
    return f;
  };

  input.addEventListener('input', (e) => {
    e.target.value = format(e.target.value);
  });
}
