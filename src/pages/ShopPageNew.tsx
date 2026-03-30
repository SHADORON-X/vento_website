import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import '../styles/shop-v2.css';

// ── Helpers
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const fmtGNF = (n: number) => new Intl.NumberFormat('fr-GN', { maximumFractionDigits: 0 }).format(n) + ' GNF';
const getImg = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/velmo-media/${path.replace(/^\//, '')}`;
};
const disc = (sale: number, reg?: number | null) =>
  reg && reg > sale ? Math.round((1 - sale / reg) * 100) : 0;

const CAT_BG: Record<string, string> = {
  Alimentation: '#fef9e7', Électronique: '#eff6ff', Mode: '#fdf4ff',
  Beauté: '#fdf2f8', Maison: '#f0fdf4', Sport: '#f0fdf4',
  Chaussures: '#fff7ed', Bijoux: '#fffbeb', Auto: '#f1f5f9',
};
const CAT_EMOJI: Record<string, string> = {
  Alimentation: '🍎', Électronique: '📱', Mode: '👗', Beauté: '💄',
  Maison: '🏠', Sport: '⚽', Chaussures: '👟', Bijoux: '💍', Auto: '🚗', Autre: '📦',
};

interface Shop {
  id: string; name: string; slug: string; description?: string | null;
  logo?: string | null; logo_url?: string | null;
  cover?: string | null; cover_url?: string | null;
  category?: string | null; is_verified?: boolean;
  phone?: string | null; whatsapp?: string | null;
  address?: string | null; opening_hours?: string | null;
}
interface Product {
  id: string; name: string; price_sale: number; price_regular?: number | null;
  photo_url?: string | null; category?: string | null;
  quantity?: number; is_active: boolean; description?: string | null;
}
interface CartItem {
  id: string; name: string; price_sale: number;
  photo_url?: string | null; category?: string | null; qty: number;
}

function PFallback({ category }: { category?: string | null; name: string }) {
  return (
    <div className="sp2-card-fallback" style={{ background: CAT_BG[category || ''] || '#f8fafc' }}>
      <span className="sp2-card-fallback-emoji">{CAT_EMOJI[category || ''] || '📦'}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="sp2-skeleton">
      <div className="sp2-skel-img" />
      <div className="sp2-skel-body">
        <div className="sp2-skel-line" style={{ width: '90%' }} />
        <div className="sp2-skel-line" style={{ width: '60%', height: '10px' }} />
        <div className="sp2-skel-line" style={{ width: '50%', height: '16px', marginTop: '4px' }} />
        <div className="sp2-skel-line" style={{ width: '100%', height: '40px', borderRadius: '12px', marginTop: '8px' }} />
      </div>
    </div>
  );
}

function ProductCard({ product, inCart, onAdd }: { product: Product; inCart: boolean; onAdd: (p: Product) => void }) {
  const [imgErr, setImgErr] = useState(false);
  const imgUrl = getImg(product.photo_url);
  const pct = disc(product.price_sale, product.price_regular);
  const isOos = (product.quantity ?? 1) <= 0;
  const isLow = (product.quantity ?? 99) > 0 && (product.quantity ?? 99) <= 5;

  return (
    <div className="sp2-card">
      <div className="sp2-card-img" style={{ position: 'relative', paddingTop: '100%', background: '#f1f5f9', overflow: 'hidden' }}>
        {imgUrl && !imgErr
          ? <img src={imgUrl} alt={product.name} loading="lazy" onError={() => setImgErr(true)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <PFallback category={product.category} name={product.name} />
        }
        {isOos && <span className="sp2-badge-oos">Épuisé</span>}
        {!isOos && pct > 0 && <span className="sp2-badge-promo">-{pct}%</span>}
      </div>
      <div className="sp2-card-body">
        <div className="sp2-card-name" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3', height: 'auto' }}>
          {product.name}
        </div>
        {product.category && <div className="sp2-card-cat">{CAT_EMOJI[product.category] || '📦'} {product.category}</div>}
        <div className="sp2-card-price">
          <span className="sp2-price-main">{fmtGNF(product.price_sale)}</span>
          {product.price_regular && product.price_regular > product.price_sale && (
            <span className="sp2-price-old">{fmtGNF(product.price_regular)}</span>
          )}
          {pct > 0 && <span className="sp2-price-save">-{pct}%</span>}
        </div>
        {isLow && !isOos && <div className="sp2-card-stock">⚠️ Plus que {product.quantity} en stock</div>}
        <button
          className={`sp2-card-add${inCart ? ' in-cart' : ''}`}
          onClick={() => onAdd(product)}
          disabled={isOos}
          style={{ marginTop: 8, height: 42, borderRadius: 12, fontSize: '0.82rem', width: '100%', border: 'none', cursor: isOos ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
        >
          {isOos ? 'Épuisé' : inCart ? '✓ Dans le panier' : '+ Ajouter au panier'}
        </button>
      </div>
    </div>
  );
}

function CartDrawer({ cart, shopName, onClose, onQtyChange, onCheckout }: {
  cart: CartItem[]; shopName: string;
  onClose: () => void; onQtyChange: (id: string, delta: number) => void; onCheckout: () => void;
}) {
  const sub = cart.reduce((s, i) => s + i.price_sale * i.qty, 0);
  return (
    <>
      <div className="sp2-overlay" onClick={onClose} />
      <div className="sp2-drawer">
        <div className="sp2-drawer-header">
          <span className="sp2-drawer-title">🛒 {shopName}</span>
          <button className="sp2-drawer-close" onClick={onClose}>✕</button>
        </div>
        {cart.length === 0 ? (
          <div className="sp2-cart-empty">
            <span className="sp2-cart-empty-icon">🛒</span>
            <span className="sp2-cart-empty-text">Votre panier est vide</span>
          </div>
        ) : (
          <div className="sp2-drawer-items">
            {cart.map(item => (
              <div key={item.id} className="sp2-cart-item">
                <div className="sp2-cart-img">
                  {getImg(item.photo_url) ? <img src={getImg(item.photo_url)!} alt={item.name} loading="lazy" /> : <span>{CAT_EMOJI[item.category || ''] || '📦'}</span>}
                </div>
                <div className="sp2-cart-info">
                  <div className="sp2-cart-name">{item.name}</div>
                  <div className="sp2-cart-price">{fmtGNF(item.price_sale * item.qty)}</div>
                </div>
                <div className="sp2-qty-ctrl">
                  <button className="sp2-qty-btn" onClick={() => onQtyChange(item.id, -1)}>−</button>
                  <span className="sp2-qty-num">{item.qty}</span>
                  <button className="sp2-qty-btn" onClick={() => onQtyChange(item.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {cart.length > 0 && (
          <div className="sp2-drawer-footer">
            <div className="sp2-cart-summary">
              <div className="sp2-summary-row"><span>Sous-total</span><span>{fmtGNF(sub)}</span></div>
              <div className="sp2-summary-row"><span>🚚 Livraison</span><span style={{ color: '#22c55e', fontWeight: 700 }}>Gratuite</span></div>
              <div className="sp2-summary-row total"><span>Total</span><span>{fmtGNF(sub)}</span></div>
            </div>
            <button className="sp2-checkout-btn" onClick={onCheckout}>Commander maintenant →</button>
          </div>
        )}
      </div>
    </>
  );
}

function CheckoutModal({ cart, shop, onClose, onSuccess }: {
  cart: CartItem[]; shop: Shop; onClose: () => void; onSuccess: (ref: string) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [delivery, setDelivery] = useState<'delivery' | 'pickup'>('delivery');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const total = cart.reduce((s, i) => s + i.price_sale * i.qty, 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nom requis';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) e.phone = 'Numéro valide requis';
    if (delivery === 'delivery' && !address.trim()) e.address = 'Adresse requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const ref = 'CMD-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      const { error } = await supabase.from('customer_orders').insert({
        shop_id: shop.id, customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_address: delivery === 'delivery' ? address.trim() : (shop.address || null),
        delivery_method: delivery, order_note: note.trim() || null,
        total_amount: total, status: 'pending', short_ref: ref,
        items_json: cart.map(i => ({ id: i.id, name: i.name, price: i.price_sale, quantity: i.qty, photo_url: i.photo_url })),
      });
      if (error) throw error;
      onSuccess(ref);
    } catch {
      alert('Erreur lors de la commande. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const iStyle = (err?: string): React.CSSProperties => ({
    width: '100%', height: 44, borderRadius: 12,
    padding: '0 13px', border: '1.5px solid ' + (err ? '#ef4444' : 'rgba(0,0,0,0.1)'),
    fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', background: '#f8fafc', color: '#0f172a',
  });

  return (
    <div className="sp2-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sp2-modal">
        <div className="sp2-modal-header">
          <span className="sp2-modal-title">📦 Votre commande</span>
          <button className="sp2-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sp2-modal-body">
          <div className="sp2-order-items">
            {cart.map(i => (
              <div key={i.id} className="sp2-order-item">
                <span className="sp2-order-item-name">{i.name}</span>
                <span className="sp2-order-item-qty">×{i.qty}</span>
                <span className="sp2-order-item-price">{fmtGNF(i.price_sale * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="sp2-order-total-row">
            <span>Total</span><span style={{ color: 'var(--primary)' }}>{fmtGNF(total)}</span>
          </div>
          <div className="sp2-form-section">
            <span className="sp2-form-label">Mode de livraison</span>
            <div className="sp2-delivery-options">
              {(['delivery', 'pickup'] as const).map(m => (
                <div key={m} className={'sp2-delivery-opt' + (delivery === m ? ' active' : '')}
                  onClick={() => setDelivery(m)}
                  style={{ flex: 1, cursor: 'pointer', textAlign: 'center', padding: '12px 8px', borderRadius: 14, border: '2px solid ' + (delivery === m ? 'var(--primary)' : '#e2e8f0'), background: delivery === m ? 'var(--primary-glow)' : '#f8fafc', transition: 'all 0.2s' }}>
                  <div className="sp2-delivery-opt-icon">{m === 'delivery' ? '🚚' : '🏪'}</div>
                  <div className="sp2-delivery-opt-label">{m === 'delivery' ? 'Livraison' : 'Retrait'}</div>
                  <div className="sp2-delivery-opt-sub">{m === 'delivery' ? 'À domicile' : 'En boutique'}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="sp2-form-section">
            <span className="sp2-form-label">Vos informations</span>
            <div className="sp2-form-field">
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>Nom complet *</label>
              <input style={iStyle(errors.name)} type="text" placeholder="Mamadou Diallo" value={name} onChange={e => setName(e.target.value)} />
              {errors.name && <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 3 }}>{errors.name}</div>}
            </div>
            <div className="sp2-form-field">
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>Téléphone * (WhatsApp)</label>
              <input style={iStyle(errors.phone)} type="tel" placeholder="+224 6XX XXX XXX" value={phone} onChange={e => setPhone(e.target.value)} />
              {errors.phone && <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 3 }}>{errors.phone}</div>}
            </div>
            {delivery === 'delivery' && (
              <div className="sp2-form-field">
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>Adresse de livraison *</label>
                <input style={iStyle(errors.address)} type="text" placeholder="Quartier, commune, Conakry..." value={address} onChange={e => setAddress(e.target.value)} />
                {errors.address && <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 3 }}>{errors.address}</div>}
              </div>
            )}
            <div className="sp2-form-field">
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>Note pour le vendeur (optionnel)</label>
              <textarea style={{ ...iStyle(), height: 70, padding: '10px 13px', resize: 'none' } as React.CSSProperties} placeholder="Instructions spéciales..." value={note} onChange={e => setNote(e.target.value)} />
            </div>
          </div>
          <div className="sp2-trust-note">💰 Paiement à la livraison — vous payez uniquement à la réception</div>
        </div>
        <div className="sp2-modal-footer">
          <button className="sp2-submit-btn" onClick={submit} disabled={submitting}>
            {submitting ? 'Envoi...' : 'Confirmer · ' + fmtGNF(total)}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div className="sp2-toast">{message}</div>;
}

export default function ShopPageNew() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tout');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data: s, error } = await supabase
          .from('shops')
          .select('id,name,slug,description,logo,logo_url,cover,cover_url,category,is_verified,phone,whatsapp,address,opening_hours')
          .eq('slug', slug).single();
        if (error || !s) { setNotFound(true); setLoading(false); return; }
        if (cancelled) return;
        setShop(s as Shop);
        const { data: p } = await supabase
          .from('products')
          .select('id,name,price_sale,price_regular,photo_url,category,quantity,is_active,description')
          .eq('shop_id', s.id).eq('is_active', true).order('created_at', { ascending: false });
        if (!cancelled) setProducts((p as Product[]) || []);
      } catch { setNotFound(true); }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [slug]);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];
    return ['Tout', ...cats];
  }, [products]);

  const displayed = useMemo(() => {
    let list = products;
    if (activeCategory !== 'Tout') list = list.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
    }
    return list;
  }, [products, activeCategory, search]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price_sale * i.qty, 0);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2500);
  };

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price_sale: product.price_sale, photo_url: product.photo_url, category: product.category, qty: 1 }];
    });
    showToast('🛒 "' + product.name.slice(0, 22) + '" ajouté');
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  }, []);

  if (notFound) {
    return (
      <div className="sp2">
        <div className="sp2-notfound">
          <div className="sp2-notfound-icon">🔍</div>
          <div className="sp2-notfound-title">Boutique introuvable</div>
          <div className="sp2-notfound-sub">Cette boutique n'existe pas ou n'est plus disponible.</div>
          <a href="/market/index.html" className="sp2-notfound-btn">← Retour au Marketplace</a>
        </div>
      </div>
    );
  }

  const emoji = CAT_EMOJI[shop?.category || ''] || '🏪';
  const coverUrl = getImg(shop?.cover || shop?.cover_url);
  const logoUrl = getImg(shop?.logo || shop?.logo_url);
  const waNum = (shop?.whatsapp || shop?.phone || '').replace(/\D/g, '');
  const waUrl = waNum ? 'https://wa.me/' + waNum + '?text=Bonjour%20' + encodeURIComponent(shop?.name || '') : null;

  return (
    <div className="sp2">
      <Helmet>
        <title>{shop ? shop.name + ' — Velmo Market' : 'Boutique...'}</title>
        {shop?.description && <meta name="description" content={shop.description} />}
      </Helmet>

      <div className="sp2-topbar">
        <button className="sp2-back" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', background: 'rgba(15,23,42,0.06)', border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: 12, color: '#0f172a', fontFamily: 'inherit' }}>← Retour</button>
        <span className="sp2-topbar-name">{shop?.name || '...'}</span>
        <button className="sp2-cart-btn" onClick={() => setCartOpen(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {cartCount > 0 && <span className="sp2-cart-badge">{cartCount}</span>}
        </button>
      </div>

      <div className="sp2-cover">
        {coverUrl
          ? <img src={coverUrl} alt="cover" />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1e293b,#334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>{emoji}</div>
        }
        <div className="sp2-cover-overlay" />
      </div>

      <div className="sp2-shop-info">
        <div className="sp2-logo-wrap" style={{ marginTop: -34, marginBottom: 14 }}>
          <div className="sp2-logo">
            {logoUrl
              ? <img src={logoUrl} alt={shop?.name} />
              : <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>{shop?.name?.charAt(0).toUpperCase()}</span>
            }
          </div>
        </div>
        <div className="sp2-shop-name">
          {shop?.name}
          {shop?.is_verified && <span className="sp2-verified" title="Vérifié">✓</span>}
        </div>
        {shop?.description && <p className="sp2-shop-desc" style={{ marginTop: 6, marginBottom: 10 }}>{shop.description}</p>}
        <div className="sp2-shop-meta">
          {shop?.category && <span className="sp2-meta-item">{emoji} {shop.category}</span>}
          {shop?.address && <span className="sp2-meta-item">📍 {shop.address}</span>}
          {shop?.opening_hours && <span className="sp2-meta-item">🕐 {shop.opening_hours}</span>}
        </div>
        <div className="sp2-trust-pills">
          <span className="sp2-trust-pill">🚚 Livraison Conakry</span>
          <span className="sp2-trust-pill">💰 Paiement livraison</span>
          <span className="sp2-trust-pill">↩️ Retour 24h</span>
          {shop?.is_verified && <span className="sp2-trust-pill">✓ Vérifié</span>}
        </div>
        {waUrl && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 40, borderRadius: 12, fontWeight: 700, fontSize: '0.83rem', textDecoration: 'none', background: '#25d366', color: '#fff' }}>
              💬 WhatsApp
            </a>
            {shop?.phone && (
              <a href={'tel:' + shop.phone} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 40, borderRadius: 12, fontWeight: 700, fontSize: '0.83rem', textDecoration: 'none', background: '#f1f5f9', color: '#0f172a' }}>
                📞 Appeler
              </a>
            )}
          </div>
        )}
      </div>

      <div className="sp2-search-wrap">
        <div className="sp2-search">
          <input type="search" placeholder={'Rechercher dans ' + (shop?.name || 'la boutique') + '...'} value={search} onChange={e => setSearch(e.target.value)} autoComplete="off" />
          <span className="sp2-search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
        </div>
      </div>

      {categories.length > 2 && (
        <div className="sp2-cats">
          {categories.map(cat => (
            <button key={cat} className={'sp2-cat-pill' + (activeCategory === cat ? ' active' : '')} onClick={() => setActiveCategory(cat)} style={{ cursor: 'pointer' }}>
              {cat !== 'Tout' && CAT_EMOJI[cat] ? CAT_EMOJI[cat] + ' ' : ''}{cat}
            </button>
          ))}
        </div>
      )}

      <div className="sp2-products">
        <div className="sp2-products-header">
          <span className="sp2-section-title">{activeCategory === 'Tout' ? 'Tous les produits' : activeCategory}</span>
          {!loading && <span className="sp2-products-count">{displayed.length} produits</span>}
        </div>
        <div className="sp2-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : displayed.length === 0
              ? (
                <div className="sp2-empty">
                  <div className="sp2-empty-icon">📦</div>
                  <div className="sp2-empty-text">Aucun produit trouvé</div>
                  <div className="sp2-empty-sub">Essayez une autre catégorie</div>
                </div>
              )
              : displayed.map(p => (
                <ProductCard key={p.id} product={p} inCart={cart.some(i => i.id === p.id)} onAdd={addToCart} />
              ))
          }
        </div>
      </div>

      {cartCount > 0 && !cartOpen && !checkoutOpen && !successRef && (
        <button className="sp2-float-cart" onClick={() => setCartOpen(true)}>
          <div className="sp2-float-cart-info">
            <span className="sp2-float-cart-count">{cartCount} article{cartCount > 1 ? 's' : ''}</span>
            <span className="sp2-float-cart-total">{fmtGNF(cartTotal)}</span>
          </div>
          <span className="sp2-float-cart-action">Voir le panier →</span>
        </button>
      )}

      {cartOpen && shop && (
        <CartDrawer cart={cart} shopName={shop.name} onClose={() => setCartOpen(false)} onQtyChange={changeQty} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      )}
      {checkoutOpen && shop && (
        <CheckoutModal cart={cart} shop={shop} onClose={() => setCheckoutOpen(false)} onSuccess={ref => { setSuccessRef(ref); setCheckoutOpen(false); setCart([]); }} />
      )}
      {successRef && (
        <div className="sp2-modal-overlay" onClick={() => { setSuccessRef(null); window.location.href = '/market/index.html'; }}>
          <div className="sp2-modal" onClick={e => e.stopPropagation()}>
            <div className="sp2-success">
              <div className="sp2-success-icon">🎉</div>
              <div className="sp2-success-title">Commande confirmée !</div>
              <div className="sp2-success-text">Votre commande a été transmise à {shop?.name}. Le vendeur vous contactera bientôt.</div>
              <div className="sp2-success-ref">Réf: {successRef}</div>
              <div className="sp2-trust-note" style={{ marginTop: 8 }}>💰 Vous paierez uniquement à la livraison</div>
              <button className="sp2-success-btn" onClick={() => { setSuccessRef(null); window.location.href = '/market/index.html'; }}>← Retour au marketplace</button>
            </div>
          </div>
        </div>
      )}
      <Toast message={toast} />
    </div>
  );
}
