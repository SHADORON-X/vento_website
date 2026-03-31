import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShoppingBag, Store, CheckCircle, CheckCircle2, ArrowRight, Star, Download, Globe, User, Menu, Sun, Moon, Sparkles, Zap, Map, Search, X, Loader2, ChevronRight, Apple, Shirt, Smartphone, Pill, Home, Dumbbell, Cpu, WifiOff, Package, TrendingUp, MessageCircle, BarChart3, Shield, Clock, Award, BarChart2, CreditCard, Users, Check, Crown, ShieldCheck } from 'lucide-react';
import {
  searchAll,
  getTopProducts,
  getPlatformStats,
  getAvailableCategories,
} from '../lib/api';
import { useGeoSearch } from '../hooks/useGeoSearch';
import { useSite } from '../context/SiteContext';
import Navbar from '../components/Navbar';
import AppMockup from '../components/AppMockup';
// Lazy-load : composants sous le fold — chargés seulement quand le scroll approche
const SellersFeed = lazy(() => import('../components/SellersFeed'));
const FeaturedShops = lazy(() => import('../components/FeaturedShops'));
const FAQSection = lazy(() => import('../components/FAQSection'));
import Footer from '../components/Footer';
import AccessMyShop from '../components/AccessMyShop';

// ─── Variants ────────────────────────────────────────────────────────────────
const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Counter ─────────────────────────────────────────────────────────────────
function Counter({ to, suffix = '', duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || to === 0) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to, duration]);
  return <span ref={ref}>{val > 0 ? val.toLocaleString('fr-FR') : '—'}{suffix}</span>;
}

// ─── Section badge ────────────────────────────────────────────────────────────
function SectionLabel({ icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold rounded-full mb-4 tracking-wide uppercase">
      {icon}{label}
    </div>
  );
}

// ─── Product Ticker ───────────────────────────────────────────────────────────
function ProductTicker({ products }) {
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const animRef = useRef(null);
  const pausedRef = useRef(false);
  const navigate = useNavigate();
  const { theme } = useSite();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!trackRef.current || products.length === 0) return;
    const SPEED = 0.55;
    const animate = () => {
      if (!pausedRef.current && trackRef.current) {
        posRef.current += SPEED;
        const halfW = trackRef.current.scrollWidth / 2;
        if (posRef.current >= halfW) posRef.current = 0;
        trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [products]);

  if (products.length === 0) return null;
  const display = [...products, ...products];

  return (
    <div
      className="overflow-hidden py-2.5"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div ref={trackRef} className="flex gap-3" style={{ width: 'max-content', willChange: 'transform' }}>
        {display.map((p, i) => {
          const hasDiscount = p.price_regular && p.price_regular > p.price_sale;
          const pct = hasDiscount ? Math.round((1 - p.price_sale / p.price_regular) * 100) : 0;
          return (
            <div
              key={`${p.id}-${i}`}
              onClick={() => {
                if (p.shops?.slug) {
                  window.location.href = `/market/shop.html?s=${encodeURIComponent(p.shops.slug)}&p=${p.id}`;
                }
              }}
              className={`flex-shrink-0 w-36 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group ${isDark
                ? 'bg-white/[0.04] border border-white/[0.07] hover:border-orange-500/40 hover:bg-white/[0.07]'
                : 'bg-white border border-gray-200 hover:border-orange-400/50 shadow-sm hover:shadow-md'
                }`}
            >
              <div className={`relative w-full aspect-square overflow-hidden ${isDark ? 'bg-white/[0.04]' : 'bg-gray-100'}`}>
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400"><ShoppingBag size={20} /></div>
                )}
                {hasDiscount && (
                  <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">-{pct}%</div>
                )}
              </div>
              <div className="p-2">
                <p className={`text-[10px] font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.name}</p>
                <p className="text-orange-400 text-[10px] font-black mt-0.5">{p.price_sale?.toLocaleString('fr-FR')} GNF</p>
                {p.shops?.name && <p className="text-slate-500 text-[9px] truncate mt-0.5">{p.shops.name}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Live Activity Indicator ──────────────────────────────────────────────────
function LiveActivityIndicator() {
  const [activity, setActivity] = useState(null);
  const { lang } = useSite();

  const ACTIVITIES = lang === 'fr'
    ? [
      "Un nouveau commerçant vient de rejoindre Velmo",
      "Vente enregistrée dans une boutique partenaire",
      "Une boutique vient d'activer sa vitrine web",
      "Nouvelle commande reçue via le marketplace",
      "Rapport quotidien envoyé sur WhatsApp à un gérant",
      "Sync auto terminée : 124 transactions sécurisées",
    ]
    : [
      "A new merchant just joined Velmo",
      "Sale recorded in a partner shop",
      "A shop just activated its web store",
      "New order received via marketplace",
      "Daily report sent on WhatsApp to a manager",
      "Auto-sync completed: 124 transactions secured",
    ];

  useEffect(() => {
    const showRandom = () => {
      setActivity(ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)]);
      setTimeout(() => setActivity(null), 5000);
    };

    const timer = setInterval(showRandom, 15000 + Math.random() * 10000);
    setTimeout(showRandom, 3000); // First one after 3s
    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {activity && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.9, filter: 'blur(10px)' }}
          className="fixed bottom-6 left-6 z-[100] max-w-[280px] p-4 rounded-2xl bg-[#080b10]/95 border border-orange-500/30 backdrop-blur-xl shadow-2xl flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
            <Zap size={14} className="text-orange-500" />
          </div>
          <div>
            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest mb-0.5">Velmo Live</p>
            <p className="text-xs text-white font-medium leading-tight">{activity}</p>
          </div>
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Trusted By Section ───────────────────────────────────────────────────────
function TrustedBySection() {
  const { theme, lang } = useSite();
  const isDark = theme === 'dark';
  return (
    <div className="py-10 border-y border-white/5 bg-white/[0.01]">
      <div className="container overflow-hidden">
        <p className={`text-center text-[10px] font-black uppercase tracking-[0.3em] mb-8 ${isDark ? 'text-white/20' : 'text-slate-300'}`}>
          {lang === 'fr' ? 'La confiance des leaders du marché' : 'Trusted by market leaders'}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="text-xl font-bold flex items-center gap-2">🛒 CITY <span className="text-[10px] font-normal opacity-50">STORES</span></div>
          <div className="text-xl font-bold flex items-center gap-2">📦 GLOBAL <span className="text-[10px] font-normal opacity-50">DISTRIB.</span></div>
          <div className="text-xl font-bold flex items-center gap-2">💎 UNIFIED <span className="text-[10px] font-normal opacity-50">TECH</span></div>
          <div className="text-xl font-bold flex items-center gap-2">⚡ ELITE <span className="text-[10px] font-normal opacity-50">SALES</span></div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero Search ──────────────────────────────────────────────────────────────
function HeroSearch({ stats }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState({ shops: [], products: [] });
  const [loading, setLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);
  const { userCity, detecting, detectCity } = useGeoSearch();
  const { t, theme } = useSite();
  const isDark = theme === 'dark';

  const placeholders = [
    "Chercher un 'Sagiko'...",
    "Chercher un 'Téléphone A16'...",
    "Trouver du 'Riz 50kg'...",
    "Chercher 'Lorenzo'...",
    "Chercher 'Huile de Palme'...",
    "Trouver une boutique...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [placeholders.length]);

  const doSearch = useCallback(async (q) => {
    if (q.trim().length < 2) { setResults({ shops: [], products: [] }); setOpen(false); return; }
    setLoading(true);
    try {
      const data = await searchAll(q.trim(), userCity);
      setResults(data);
      setOpen(true);
    } finally { setLoading(false); }
  }, [userCity]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  useEffect(() => {
    const fn = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const goSearch = () => {
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}${userCity ? `&city=${encodeURIComponent(userCity)}` : ''}`);
  };

  const hasResults = results.shops.length > 0 || results.products.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto" ref={wrapRef}>
      <div className="relative group">
        <div className={`flex items-center rounded-2xl p-1.5 gap-2 transition-all duration-500 ${isDark
          ? 'bg-white/[0.08] border border-white/[0.15] focus-within:border-orange-500/60 focus-within:bg-white/[0.12] shadow-2xl shadow-black/40'
          : 'bg-white border border-gray-200 focus-within:border-orange-400 focus-within:shadow-orange-100 shadow-xl shadow-gray-200/80'
          }`}>
          {/* City toggle */}
          <button
            onClick={detectCity}
            disabled={detecting}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold flex-shrink-0 border ${isDark
              ? 'bg-white/[0.05] border-white/[0.08] text-slate-400 hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/20'
              : 'bg-gray-50 border-gray-200 text-slate-500 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200'
              }`}
          >
            {detecting ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
            <span className="truncate max-w-[80px]">{userCity || t.search.myCity}</span>
          </button>

          <Search size={16} className={`transition-colors duration-300 ${isDark ? 'text-slate-500 group-focus-within:text-orange-400' : 'text-slate-400 group-focus-within:text-orange-500'} flex-shrink-0 ml-1`} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && goSearch()}
            onFocus={() => hasResults && setOpen(true)}
            placeholder={placeholders[placeholderIndex]}
            className={`flex-1 bg-transparent placeholder-slate-500 text-sm md:text-base focus:outline-none min-w-0 py-2 transition-all duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}
          />
          {loading && <Loader2 size={14} className="text-orange-400 animate-spin flex-shrink-0" />}
          {query && !loading && (
            <button onClick={() => { setQuery(''); setResults({ shops: [], products: [] }); setOpen(false); }}>
              <X size={13} className="text-slate-400 hover:text-slate-600 transition-colors" />
            </button>
          )}
          <button onClick={goSearch} className="velmo-btn-primary px-5 py-2.5 rounded-xl text-sm font-bold flex-shrink-0 whitespace-nowrap shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all">
            {t.search.search}
          </button>
        </div>

        <AnimatePresence>
          {open && hasResults && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.99 }}
              transition={{ duration: 0.15 }}
              className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[420px] overflow-y-auto border ${isDark ? 'bg-[#0e1118] border-white/10 shadow-black/70' : 'bg-white border-gray-200 shadow-gray-200/80'
                }`}
            >
              {results.shops.length > 0 && (
                <>
                  <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-slate-500 bg-white/[0.02]' : 'text-slate-400 bg-gray-50'}`}>
                    <Store size={9} />{t.search.shops}
                  </div>
                  {results.shops.map((shop) => (
                    <button key={shop.id}
                      onClick={() => {
                        window.location.href = `/market/shop.html?s=${encodeURIComponent(shop.slug)}`;
                        setOpen(false);
                        setQuery('');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-b last:border-0 ${isDark ? 'hover:bg-white/[0.04] border-white/[0.04]' : 'hover:bg-gray-50 border-gray-100'}`}
                    >
                      <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold text-xs" style={{ background: shop.logo_url ? undefined : 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                        {shop.logo_url ? <img src={shop.logo_url} alt="" className="w-full h-full object-cover" /> : shop.name?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-semibold truncate flex items-center gap-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {shop.name}{shop.is_verified && <CheckCircle size={11} className="text-orange-500" />}
                        </div>
                        <div className="text-slate-500 text-xs truncate">{shop.category}{shop.city && ` · ${shop.city}`}</div>
                      </div>
                      <ChevronRight size={13} className="text-slate-400" />
                    </button>
                  ))}
                </>
              )}
              {results.products.length > 0 && (
                <>
                  <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border-t ${isDark ? 'text-slate-500 bg-white/[0.02] border-white/[0.04]' : 'text-slate-400 bg-gray-50 border-gray-100'}`}>
                    <ShoppingBag size={9} />{t.search.products}
                  </div>
                  {results.products.map((prod) => (
                    <button key={prod.id}
                      onClick={() => {
                        window.location.href = `/market/shop.html?s=${encodeURIComponent(prod.shops?.slug)}&p=${prod.id}`;
                        setOpen(false);
                        setQuery('');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-b last:border-0 ${isDark ? 'hover:bg-white/[0.04] border-white/[0.04]' : 'hover:bg-gray-50 border-gray-100'}`}
                    >
                      <div className={`w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center ${isDark ? 'bg-white/[0.04]' : 'bg-gray-100'}`}>
                        {prod.photo_url ? <img src={prod.photo_url} alt="" className="w-full h-full object-cover" /> : <ShoppingBag size={13} className="text-slate-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{prod.name}</div>
                        <div className="text-slate-500 text-xs truncate">{prod.shops?.name}</div>
                      </div>
                      <span className="text-orange-400 text-xs font-black flex-shrink-0">{prod.price_sale?.toLocaleString('fr-FR')} GNF</span>
                    </button>
                  ))}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
const CAT_ICONS = {
  alimentation: { icon: <Apple size={22} />, color: '#f59e0b' },
  mode: { icon: <Shirt size={22} />, color: '#ec4899' },
  téléphones: { icon: <Smartphone size={22} />, color: '#3b82f6' },
  pharmacie: { icon: <Pill size={22} />, color: '#10b981' },
  maison: { icon: <Home size={22} />, color: '#8b5cf6' },
  beauté: { icon: <Sparkles size={22} />, color: '#f97316' },
  électronique: { icon: <Cpu size={22} />, color: '#06b6d4' },
  sports: { icon: <Dumbbell size={22} />, color: '#84cc16' },
  automobiles: { icon: <Package size={22} />, color: '#ef4444' },
  services: { icon: <User size={22} />, color: '#3b82f6' },
  santé: { icon: <Pill size={22} />, color: '#10b981' },
  brico: { icon: <Package size={22} />, color: '#64748b' },
};

const getCatStyle = (name) => {
  const n = name.toLowerCase();
  for (const k in CAT_ICONS) {
    if (n.includes(k)) return CAT_ICONS[k];
  }
  return { icon: <Package size={22} />, color: '#64748b' };
};

function CategoriesSection({ categories = [] }) {
  const navigate = useNavigate();
  const { theme, lang } = useSite();
  const isDark = theme === 'dark';

  // Double categories for seamless scrolling if we have enough
  const items = categories.length > 5 ? [...categories, ...categories] : categories;

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container relative z-10 mb-20">
        <div className="text-center">
          <SectionLabel icon={<Sparkles size={12} className="text-orange-400" />} label={lang === 'fr' ? 'Parcourir par secteur' : 'Browse by sector'} />
          <h2 className={`text-4xl md:text-6xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Cherchez par <span className="velmo-gradient-text-animated">envie</span>.
          </h2>
          <p className="text-slate-500 text-lg md:text-xl mt-6 font-medium max-w-2xl mx-auto leading-relaxed">
            Accédez instantanément aux meilleurs articles de chaque secteur d'activité à Conakry et au-delà.
          </p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative flex overflow-hidden py-10">
        <motion.div
          animate={categories.length > 5 ? { x: ['0%', '-50%'] } : {}}
          transition={categories.length > 5 ? {
            duration: 50,
            repeat: Infinity,
            ease: "linear",
          } : {}}
          className="flex gap-8 px-8"
        >
          {items.map((cat, i) => {
            const style = getCatStyle(cat);
            return (
              <motion.button
                key={`${cat}-${i}`}
                whileHover={{ y: -12, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/search?q=${encodeURIComponent(cat)}`)}
                className={`group relative flex flex-col items-center gap-6 p-10 rounded-[3rem] border transition-all duration-500 min-w-[220px] shadow-sm hover:shadow-2xl ${isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-orange-500/30' : 'bg-white border-slate-100 hover:border-orange-200'
                  }`}
              >
                {/* Decorative background circle */}
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" style={{ background: style.color }} />

                <div
                  className="w-20 h-20 rounded-[1.8rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-xl"
                  style={{ background: `${style.color}15`, color: style.color, border: `1px solid ${style.color}25` }}
                >
                  {style.icon}
                </div>
                <span className={`text-[11px] font-black uppercase tracking-[0.2em] text-center transition-colors duration-300 ${isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'}`}>
                  {cat}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Stats Section ────────────────────────────────────────────────────────────
function StatsSection({ stats }) {
  const { theme, lang } = useSite();
  const isDark = theme === 'dark';

  const METRICS = [
    { icon: <Store size={26} />, value: stats.shopCount || 5000, suffix: '+', label: lang === 'fr' ? 'Boutiques' : 'Shops', color: '#ff6200' },
    { icon: <ShoppingBag size={26} />, value: stats.productCount || 120000, suffix: '+', label: lang === 'fr' ? 'Produits' : 'Products', color: '#3b82f6' },
    { icon: <CheckCircle size={26} />, value: stats.orderCount || 50000, suffix: '+', label: lang === 'fr' ? 'Commandes' : 'Orders', color: '#10b981' },
    { icon: <Star size={26} />, value: 0, suffix: '', label: lang === 'fr' ? 'Satisfaction' : 'Rating', color: '#f59e0b', fixed: '4.9★' },
  ];

  return (
    <section className={`py-20 relative overflow-hidden border-y ${isDark ? 'border-white/5 bg-white/[0.01]' : 'border-slate-200 bg-white'}`}>
      <div className="container relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
          {METRICS.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`p-6 md:p-8 rounded-3xl border text-center transition-all duration-500 overflow-hidden relative group ${isDark ? 'bg-white/[0.03] border-white/5 hover:border-white/10' : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                }`}
            >
              {/* Decorative background circle */}
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:scale-150 transition-transform duration-700" style={{ background: m.color }} />

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-6"
                style={{ background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}25` }}
              >
                {m.icon}
              </div>
              <div className={`text-3xl md:text-5xl font-black mb-1 tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {m.fixed ?? <Counter to={m.value} suffix={m.suffix} />}
              </div>
              <div className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Best Products ────────────────────────────────────────────────────────────
function BestProducts({ products, loading }) {
  const navigate = useNavigate();
  const { t, theme, lang } = useSite();
  const isDark = theme === 'dark';

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-24" id="marketplace">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <SectionLabel icon={<Star size={12} className="text-orange-400" />} label={t.bestProducts.badge} />
            <h2 className={`text-4xl md:text-5xl font-black tracking-tight leading-[0.95] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Les <span className="velmo-gradient-text-animated">indispensables</span> <br />du moment
            </h2>
            <p className="text-slate-500 text-base md:text-lg mt-5 font-medium leading-relaxed">
              Les articles les plus demandés cette semaine par la communauté Velmo.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/search')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-black transition-all ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
          >
            {t.bestProducts.seeAll} <ArrowRight size={16} />
          </motion.button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={`aspect-[4/5] rounded-xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {products.map((p, i) => {
              const hasDiscount = p.price_regular && p.price_regular > p.price_sale;
              const pct = hasDiscount ? Math.round((1 - p.price_sale / p.price_regular) * 100) : 0;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02 }}
                  className={`group rounded-xl overflow-hidden cursor-pointer flex flex-col transition-all duration-300 border ${isDark ? 'bg-[#0e1218] border-white/5 hover:border-orange-500/30' : 'bg-white border-gray-100 hover:border-orange-200 shadow-sm'
                    }`}
                  onClick={() => {
                    if (p.shops?.slug) {
                      window.location.href = `/market/shop.html?s=${encodeURIComponent(p.shops.slug)}&p=${p.id}`;
                    }
                  }}
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-50/10">
                    <img src={p.photo_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {hasDiscount && (
                      <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">-{pct}%</div>
                    )}
                  </div>
                  <div className="p-2.5 flex flex-col flex-1">
                    <p className={`text-[11px] font-bold truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.name}</p>
                    <p className="text-[9px] text-slate-500 truncate mt-0.5">{p.shops?.name}</p>
                    <div className="mt-auto pt-2 flex items-baseline gap-1.5">
                      <span className="text-orange-500 text-xs font-black">{p.price_sale?.toLocaleString()} GNF</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Problem Section ──────────────────────────────────────────────────────────
function ProblemSection() {
  const { theme, lang, t } = useSite();
  const isDark = theme === 'dark';
  const p = t.problem;

  return (
    <section className="py-24 relative overflow-hidden bg-slate-900/5 dark:bg-black/20 border-y border-slate-200/50 dark:border-white/5">
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <SectionLabel icon={<Shield size={12} className="text-orange-400" />} label={p.badge} />
          <h2 className={`text-4xl md:text-5xl font-black tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {lang === 'fr' ? 'Le commerce africain ' : 'African commerce '}
            <span className="text-orange-500">{lang === 'fr' ? 'mérite mieux.' : 'deserves better.'}</span>
          </h2>
          <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            {p.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {p.items.map((item, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] border transition-all duration-300 ${isDark ? 'bg-[#0f141e] border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 text-orange-500">
                <X size={20} />
              </div>
              <h3 className={`font-black text-lg mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Vision Section ───────────────────────────────────────────────────────────
function VisionSection() {
  const { theme, t } = useSite();
  const isDark = theme === 'dark';
  const v = t.vision;

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 70% 50%, rgba(249,115,22,0.08), transparent)' }} />
      <div className="container relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionLabel icon={<TrendingUp size={12} />} label={v.badge} />
            <h2 className={`text-4xl md:text-6xl font-black mb-6 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {v.title}
            </h2>
            <p className="text-slate-500 text-xl font-medium mb-12 leading-relaxed">
              {v.subtitle}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {v.items.map((item, i) => (
                <div key={i} className="group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-8 bg-orange-500 rounded-full group-hover:h-10 transition-all" />
                    <h3 className={`font-black uppercase tracking-widest text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                  </div>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-orange-500 to-purple-600 p-1">
              <div className={`w-full h-full rounded-[2.9rem] overflow-hidden flex items-center justify-center ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
                {/* Abstract Vision Graphic */}
                <div className="relative w-full h-full p-12 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-4 rounded-3xl bg-orange-500 text-white shadow-xl shadow-orange-500/20"><Store size={32} /></div>
                    <div className="p-4 rounded-3xl bg-blue-500 text-white shadow-xl shadow-blue-500/20"><CreditCard size={32} /></div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-48 h-48 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center animate-spin-slow">
                      <div className="p-6 rounded-full bg-white text-orange-500 shadow-2xl shadow-white/10"><Zap size={40} /></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="p-4 rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20"><Users size={32} /></div>
                    <div className="p-4 rounded-3xl bg-purple-500 text-white shadow-xl shadow-purple-500/20"><BarChart2 size={32} /></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glowing effects */}
            <div className="absolute -inset-10 bg-orange-500/20 blur-[100px] -z-10 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}


// ─── Pricing Section ──────────────────────────────────────────────────────────
function PricingSection() {
  const { theme, lang } = useSite();
  const isDark = theme === 'dark';
  const [duration, setDuration] = useState(1);

  // Urgency Timer
  const [timeLeft, setTimeLeft] = useState(() => {
    // Generate a pseudo-random initial time between 3h and 10h to make it look real today
    const now = new Date();
    const eod = new Date();
    eod.setHours(23, 59, 59, 999);
    return Math.floor((eod.getTime() - now.getTime()) / 1000) || 3600 * 5;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (time) => {
    const h = Math.floor(time / 3600).toString().padStart(2, '0');
    const m = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
    const s = (time % 60).toString().padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
  };

  const PLANS = {
    starter: {
      name: 'Starter',
      price: 120000,
      color: 'from-cyan-500 to-blue-600',
      tag: lang === 'fr' ? 'La base idéale' : 'Perfect basics',
      features: lang === 'fr'
        ? ['Création produits', 'Vente & encaissement', 'Gestion dettes & créances', 'Historique des transactions']
        : ['Product creation', 'Sales & checkout', 'Debt & credit tracking', 'Transaction history']
    },
    business: {
      name: 'Business',
      price: 200000,
      color: 'from-purple-600 to-pink-600',
      tag: lang === 'fr' ? 'Pour voir grand' : 'Think bigger',
      popular: true,
      features: lang === 'fr'
        ? [
          'Tout Starter inclus',
          'Analytics avancés (ABC/RFM)',
          'Vitrine web (commande en ligne)',
          'Multi-boutiques & multi-employés',
          'Gestion dépenses & sortie d\'argent',
          'Agent IA Tambo connecté à Telegram → rapports quotidiens via chat'
        ]
        : [
          'All Starter features',
          'Advanced Analytics (ABC/RFM)',
          'Web storefront (online orders)',
          'Multi-shop & multi-staff',
          'Expense & cash out management',
          'AI Agent Tambo connected to Telegram → daily reports via chat'
        ]
    }
  };

  const calculatePrice = (base, dur) => {
    if (base === 120000) {
      if (dur === 1) return 120000;
      if (dur === 3) return 345000;
      if (dur === 6) return 600000;
      if (dur === 12) return 1200000;
    } else {
      if (dur === 1) return 200000;
      if (dur === 3) return 575000;
      if (dur === 6) return 1000000;
      if (dur === 12) return 2000000;
    }
    return base * dur;
  };

  const getBonus = (dur) => {
    if (dur === 3) return lang === 'fr' ? '15 jours offerts' : '15 days free';
    if (dur === 6) return lang === 'fr' ? '1 mois offert' : '1 month free';
    if (dur === 12) return lang === 'fr' ? '2 mois offerts' : '2 months free';
    return null;
  };

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-white/5 dark:bg-white/[0.01]">
      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionLabel icon={<CreditCard size={12} />} label={lang === 'fr' ? 'Tarifs Transparents' : 'Transparent Pricing'} />

          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm animate-pulse shadow-lg shadow-red-500/10">
            <Clock size={16} />
            {lang === 'fr' ? "Offre de lancement : se termine dans" : "Launch offer: ends in"} {formatTime(timeLeft)}
          </div>

          <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Le moteur de votre <span className="velmo-gradient-text">croissance</span>.
          </h2>
          <p className="text-slate-500 text-lg font-medium">
            Testez 14 jours gratuitement, sans carte bancaire. Économisez jusqu'à 400 000 GNF en vous engageant sur la durée.
          </p>

          {/* Duration Selector */}
          <div className="mt-10 inline-flex p-1.5 rounded-2xl bg-slate-900/50 border border-white/10 relative">
            {[1, 3, 6, 12].map(d => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`relative px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${duration === d ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:text-white'}`}
              >
                {d} {d === 1 ? 'Mois' : 'Mois'}
                {d === 12 && duration !== 12 && (
                  <span className="absolute -top-3 -right-2 bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-full border border-green-600 shadow-lg animate-bounce">
                    -17%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
          {Object.entries(PLANS).map(([key, p]) => {
            const currentPrice = calculatePrice(p.price, duration);
            const monthlyPrice = Math.round(currentPrice / duration);
            const bonus = getBonus(duration);

            return (
              <motion.div
                key={key}
                whileHover={{ y: -5 }}
                className={`relative p-10 rounded-[2.5rem] border overflow-hidden flex flex-col ${isDark ? 'bg-[#121821] border-white/5 shadow-2xl shadow-black/40' : 'bg-white border-gray-100 shadow-xl'}`}
              >
                {p.popular && (
                  <div className="absolute top-8 right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-purple-500/20 animate-pulse">
                    Le plus choisi
                  </div>
                )}

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                  {key === 'starter' ? <Store size={28} /> : <Crown size={28} />}
                </div>

                <h3 className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
                <p className="text-orange-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">{p.tag}</p>

                <div className="mb-10">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {duration === 1 ? p.price.toLocaleString() : monthlyPrice.toLocaleString()}
                    </span>
                    <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">GNF / Mois</span>
                  </div>
                  {duration > 1 && (
                    <p className="text-slate-400 text-xs font-medium mt-2">
                      {duration} mois : <span className="font-bold line-through opacity-50 mr-2">{(p.price * duration).toLocaleString()} GNF</span>
                      <span className="font-bold text-orange-500">{currentPrice.toLocaleString()} GNF</span>
                    </p>
                  )}
                  {bonus && (
                    <div className="mt-4 inline-flex items-center gap-1.5 bg-green-500/10 text-green-500 text-xs font-black px-3 py-1.5 rounded-lg border border-green-500/20 uppercase tracking-wider">
                      <CheckCircle2 size={14} /> {bonus}
                    </div>
                  )}
                  {/* Trial Tag */}
                  <div className="mt-3 block">
                    <div className="inline-block bg-blue-500/10 text-blue-500 text-[11px] font-bold px-3 py-1 rounded border border-blue-500/20">
                      🎁 14 jours d'essai offerts (sans carte)
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Inclus dans {p.name} :</div>
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 text-orange-500 mt-0.5">
                        {f.includes("Tout Starter") ? <ChevronRight size={12} strokeWidth={4} /> : <Check size={12} strokeWidth={4} />}
                      </div>
                      <span className={`text-sm font-bold leading-relaxed ${f.includes("Telegram") ? 'text-blue-500 dark:text-blue-400' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <a
                  href="/velmomobile/index.html#/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 ${key === 'business' ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20 hover:scale-[1.02]' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                >
                  Commencer le trial gratuit
                  <ArrowRight size={18} />
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials Section ──────────────────────────────────────────────────────
function TestimonialsSection() {
  const { theme, t } = useSite();
  const isDark = theme === 'dark';
  const ts = t.testimonials;

  return (
    <section className="py-24 relative overflow-hidden bg-white/5 dark:bg-white/[0.02]">
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <SectionLabel icon={<Award size={12} />} label={ts.badge} />
          <h2 className={`text-4xl md:text-5xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{ts.title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ts.items.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className={`p-10 rounded-[2.5rem] border relative ${isDark ? 'bg-[#121821] border-white/5 shadow-2xl shadow-black/40' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}
            >
              <div className="text-orange-500 mb-6 flex gap-1">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <p className={`text-lg font-medium italic mb-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                "{item.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-lg">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</h4>
                  <p className="text-orange-500 text-[10px] font-bold uppercase tracking-wider">{item.shop}</p>
                </div>
              </div>
              <div className="absolute top-10 right-10 opacity-[0.05] pointer-events-none">
                <MessageCircle size={80} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── App Section ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const { theme, lang } = useSite();
  const isDark = theme === 'dark';

  const STEPS = lang === 'fr'
    ? [
      { step: '01', icon: <Download size={24} />, title: 'Téléchargez Velmo', desc: 'Gratuit sur Windows, Mac et navigateur. Installation en 2 minutes.', color: '#f97316' },
      { step: '02', icon: <Package size={24} />, title: 'Ajoutez vos produits', desc: 'Scanner les codes-barres ou importer depuis Excel. Rapide et intuitif.', color: '#3b82f6' },
      { step: '03', icon: <Globe size={24} />, title: 'Vendez partout', desc: 'En boutique avec le POS, en ligne avec votre vitrine web. Tout synchronisé.', color: '#10b981' },
    ]
    : [
      { step: '01', icon: <Download size={24} />, title: 'Download Velmo', desc: 'Free on Windows, Mac and browser. 2-minute setup.', color: '#f97316' },
      { step: '02', icon: <Package size={24} />, title: 'Add your products', desc: 'Scan barcodes or import from Excel. Fast and intuitive.', color: '#3b82f6' },
      { step: '03', icon: <Globe size={24} />, title: 'Sell everywhere', desc: 'In-store with POS, online with your web storefront. All synced.', color: '#10b981' },
    ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.04), transparent)' }} />
      <div className="container relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionLabel icon={<Zap size={10} />} label={lang === 'fr' ? 'Expérience ultra-fluide' : 'Ultra-smooth experience'} />
          <h2 className={`text-4xl md:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {lang === 'fr' ? 'Prêt en un ' : 'Ready in a '}<span className="velmo-gradient-text">claquement de doigts</span>.
          </h2>
          <p className="text-slate-400 text-lg mt-4 font-medium">
            {lang === 'fr' ? 'Ouvrez votre boutique, listez vos produits, et commencez à encaisser.' : 'Open your shop, list your products, and start earning.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px"
            style={{ background: 'linear-gradient(to right, #f97316, #3b82f6, #10b981)', opacity: 0.3 }} />

          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-2xl p-7 border transition-all duration-300 text-center ${isDark
                ? 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.05]'
                : 'bg-white border-gray-200 shadow-sm hover:shadow-xl hover:shadow-gray-200/80'
                }`}
            >
              {/* Step number */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg"
                  style={{ background: s.color }}
                >
                  {s.step}
                </div>
              </div>

              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 mt-2"
                style={{ background: `${s.color}15`, color: s.color }}
              >
                {s.icon}
              </div>

              <h3 className={`text-lg font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA below steps */}
        <div className="text-center mt-12">
          <a
            href="/velmomobile/index.html#/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="velmo-btn-primary inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold"
          >
            <Zap size={18} />
            {lang === 'fr' ? 'Commencer gratuitement' : 'Get started for free'}
          </a>
          <p className={`text-xs mt-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            {lang === 'fr' ? 'Aucune carte bancaire requise · 100% gratuit' : 'No credit card required · 100% free'}
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── App Section ──────────────────────────────────────────────────────────────
const FEATURE_COLORS = ['#f97316', '#10b981', '#ef4444', '#25D366', '#3b82f6', '#8b5cf6'];
const FEATURE_ICONS = [<WifiOff size={20} />, <Package size={20} />, <TrendingUp size={20} />, <MessageCircle size={20} />, <BarChart3 size={20} />, <Globe size={20} />];

function AppSection() {
  const { t, theme, lang } = useSite();
  const isDark = theme === 'dark';

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(249,115,22,0.05), transparent)' }} />
      <div className="container relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Massive background glow */}
            <div className={`absolute -inset-10 blur-[120px] rounded-full opacity-20 pointer-events-none ${isDark ? 'bg-orange-500' : 'bg-orange-200'}`} />
            <AppMockup />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
            <SectionLabel icon={<Sparkles size={10} />} label={lang === 'fr' ? 'SaaS Nouvelle Génération' : 'Next-Gen SaaS'} />
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black mb-5 leading-[1.1] tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
              La caisse <br />
              <span className="velmo-gradient-text-animated">réinventée.</span>
            </h2>
            <p className={`text-xl mb-10 font-medium leading-relaxed max-w-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Velmo n'est pas qu'un logiciel, c'est l'OS de votre commerce. Gagnez en productivité, éliminez les erreurs et pilotez votre business comme un pro.
            </p>

            {/* Premium Features Checklist */}
            <div className="space-y-4 mb-10">
              {[
                { label: 'Synchronisation Cloud Ultra-rapide', sub: 'Vos données partout, tout le temps.' },
                { label: 'Mode Hors-ligne Natif', sub: 'Continuez à vendre même sans internet.' },
                { label: 'Intelligence Artificielle', sub: 'Prévision des stocks et analyses prédictives.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle size={12} className="text-orange-500" />
                  </div>
                  <div>
                    <div className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.label}</div>
                    <div className="text-slate-500 text-sm font-medium">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <a href="/velmomobile/index.html#/signup" target="_blank" rel="noopener noreferrer" className="velmo-btn-primary px-10 py-4 rounded-2xl text-base font-black flex items-center gap-3 shadow-2xl shadow-orange-500/30">
                <Zap size={18} />{t.features.tryFree}
              </a>
              <button
                onClick={() => document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' })}
                className={`px-8 py-4 rounded-2xl text-base font-black flex items-center gap-3 transition-all border ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'
                  }`}
              >
                <Download size={18} />{t.features.download}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.items.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className={`group p-8 rounded-[2rem] border transition-all duration-500 overflow-hidden relative ${isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-orange-500/30' : 'bg-white border-slate-100 hover:border-orange-200 shadow-sm hover:shadow-xl'
                }`}
            >
              {/* Decorative Glow */}
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-10 transition-transform duration-700 group-hover:scale-150" style={{ background: FEATURE_COLORS[i] }} />

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6"
                style={{ background: `${FEATURE_COLORS[i]}15`, color: FEATURE_COLORS[i], border: `1px solid ${FEATURE_COLORS[i]}25` }}
              >
                {FEATURE_ICONS[i]}
              </div>

              <h3 className={`font-black text-lg mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {f.title}
                {i < 3 && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
              </h3>

              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Download Section ─────────────────────────────────────────────────────────
function DownloadSection() {
  const { t, theme } = useSite();
  const isDark = theme === 'dark';

  return (
    <section id="download" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(249,115,22,0.07), transparent)' }} />
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`max-w-4xl mx-auto rounded-3xl p-10 md:p-16 text-center relative overflow-hidden border ${isDark
            ? 'border-orange-500/15 bg-gradient-to-br from-orange-500/[0.06] to-purple-500/[0.03]'
            : 'border-orange-200 bg-gradient-to-br from-orange-50 to-purple-50'
            }`}
        >
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.15), transparent 70%)', filter: 'blur(40px)' }} />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)', filter: 'blur(40px)' }} />

          <div className="relative">
            <SectionLabel icon={<Download size={10} />} label={t.download.badge} />
            <h2 className={`text-4xl md:text-5xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.download.title1}<br /><span className="velmo-gradient-text">{t.download.title2}</span>
            </h2>
            <p className={`text-lg mb-10 max-w-lg mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.download.subtitle}</p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                { emoji: '🪟', sub: t.download.windowsSub, label: t.download.windowsLabel, href: 'https://velmo.org/download/velmo-setup.exe' },
                { emoji: '🌐', sub: t.download.browserSub, label: t.download.browserLabel, href: '/velmomobile/index.html' },
              ].map((opt) => (
                <a key={opt.label} href={opt.href}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all group border ${isDark
                    ? 'bg-white/[0.05] border-white/10 hover:border-orange-500/35 hover:bg-white/[0.08]'
                    : 'bg-white border-gray-200 hover:border-orange-300 shadow-sm hover:shadow-md'
                    }`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <div className="text-left">
                    <div className="text-slate-500 text-xs">{opt.sub}</div>
                    <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{opt.label}</div>
                  </div>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-orange-400 group-hover:translate-x-1 transition-all ml-2" />
                </a>
              ))}
              <a href="/velmomobile/index.html#/signup" target="_blank" rel="noopener noreferrer" className="velmo-btn-primary flex items-center gap-3 px-6 py-4 rounded-2xl">
                <span className="text-3xl">🚀</span>
                <div className="text-left">
                  <div className="text-white/70 text-xs">{t.download.start}</div>
                  <div className="text-white font-bold">{t.download.createFree}</div>
                </div>
              </a>
            </div>
            <p className={`text-sm ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>{t.download.free}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const StatsSectionMemo = React.memo(StatsSection);
const ProblemSectionMemo = React.memo(ProblemSection);
const HowItWorksMemo = React.memo(HowItWorks);
const VisionSectionMemo = React.memo(VisionSection);
// lazy() n'est pas compatible avec React.memo — on les utilise directement avec Suspense
const SellersFeedMemo = SellersFeed;
const FAQSectionMemo = FAQSection;
const DownloadSectionMemo = React.memo(DownloadSection);
const FooterMemo = React.memo(Footer);

// ─── MAIN LANDING ─────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const { t, theme, lang } = useSite();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState({ shopCount: 0, productCount: 0, orderCount: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [topProductsLoading, setTopProductsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    setTopProductsLoading(true);
    setCategoriesLoading(true);

    getPlatformStats().then(setStats).catch(err => console.error("Stats fail:", err));

    getTopProducts({ limit: 18 })
      .then(setTopProducts)
      .catch(err => console.error("Products fail:", err))
      .finally(() => setTopProductsLoading(false));

    getAvailableCategories()
      .then(setCategories)
      .catch(err => console.error("Categories fail:", err))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const borderStyle = isDark ? { borderTop: '1px solid rgba(255,255,255,0.04)' } : { borderTop: '1px solid rgba(0,0,0,0.06)' };
  const fadeBg = isDark ? '#080b10' : '#f8fafc';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#080b10] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      <Helmet>
        {/* SEO */}
        <title>Velmo — Logiciel de Caisse & Gestion pour Petits Commerces</title>
        <meta name="description"
          content="Velmo est le logiciel de caisse #1 pour les commerçants en Afrique. Gérez vos stocks, ventes et dettes sans internet. Vitrine web et rapports WhatsApp." />
        <meta name="keywords"
          content="logiciel de caisse afrique, gestion de stock, velmo, gestion boutique, pos mobile, boutique en ligne gratuite, suivi dettes, commerçant" />
        <meta property="og:title" content="Velmo | Pilotez votre business" />
        <meta property="og:description" content="Transformez votre boutique avec la caisse intelligente Velmo." />
        <meta property="og:image" content="https://velmo.org/logo-velmo.png" />
        <meta property="og:url" content="https://velmo.org" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />

      {/* ════ HERO ════ */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
        {/* Aurora Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-500/20 blur-[120px] rounded-full opacity-50 dark:opacity-20" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [-20, 20, -20]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full"
          />
        </div>

        <div className={`absolute inset-0 velmo-grid-pattern pointer-events-none ${isDark ? 'opacity-[0.08]' : 'opacity-[0.03]'}`} />

        <div className="container relative z-10">
          <motion.div variants={heroContainer} initial="hidden" animate="show" className="flex flex-col items-center text-center">
            {/* Badge */}
            <motion.div variants={heroItem} className="mb-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-500 text-xs font-black backdrop-blur-md">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                {t.hero.badge}
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={heroItem} className="mb-8 max-w-4xl">
              <h1 className="font-black leading-[0.95] tracking-tighter">
                <span className={`block text-4xl sm:text-5xl md:text-6xl lg:text-7xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {lang === 'fr' ? 'La Caisse' : 'The POS'} <span className="velmo-gradient-text-animated">{lang === 'fr' ? 'Intégrale.' : 'Full.'}</span>
                </span>
                <span className={`block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2 ${isDark ? 'text-white/40' : 'text-slate-300'}`}>
                  {lang === 'fr' ? 'Pilotez' : 'Pilot'} <span className="hover:text-orange-500 transition-colors duration-500">{lang === 'fr' ? 'votre business.' : 'your business.'}</span>
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p variants={heroItem} className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-10 font-medium leading-relaxed px-4">
              {lang === 'fr'
                ? "L'OS du commerce africain. Gérez votre boutique, vos stocks et vos ventes en une seule application fluide et ultra-rapide."
                : "The OS for African commerce. Manage your shop, inventory, and sales in one fluid and ultra-fast application."}
            </motion.p>

            {/* Main Action Group */}
            <motion.div variants={heroItem} className="flex flex-col sm:flex-row justify-center gap-4 mb-8 w-full px-6">
              <a href="/velmomobile/index.html#/signup" target="_blank" rel="noopener noreferrer" className="velmo-btn-premium group flex items-center justify-center gap-3 py-4">
                <Zap size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="text-base">{t.features.tryFree}</span>
              </a>
              <button
                onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
                className={`px-8 py-4 rounded-[1.25rem] text-base font-black transition-all border flex items-center justify-center gap-2 ${isDark
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-md text-slate-900'}`}
              >
                Découvrir la solution
                <ArrowRight size={18} />
              </button>
            </motion.div>

            {/* Marketplace CTA */}
            <motion.div variants={heroItem} className="mb-14 px-6">
              <button
                onClick={() => window.location.href = '/market/index.html'}
                className="group mx-auto flex items-center gap-3 px-7 py-3.5 rounded-full border-2 border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 hover:border-orange-500/60 transition-all"
              >
                <span className="text-xl">🛍️</span>
                <span className={`text-sm font-black ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                  Explorer le Marketplace Velmo
                </span>
                <ArrowRight size={16} className={`group-hover:translate-x-1 transition-transform ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              </button>
              <p className={`text-center text-xs mt-2 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                30+ vendeurs vérifiés · Livraison à Conakry
              </p>
            </motion.div>

            {/* Quick Access */}
            <motion.div variants={heroItem} className="mb-20 px-4 w-full">
              <div className="max-w-md mx-auto p-1 rounded-2xl bg-white/[0.03] dark:bg-black/20 border border-white/10 backdrop-blur-sm">
                <AccessMyShop variant="hero" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════ TRUSTED BY ════ */}
      <TrustedBySection />

      {/* ════ STATS BAND ════ */}
      <StatsSectionMemo stats={stats} />

      {/* ════ PROBLEM ════ */}
      <div id="problem">
        <ProblemSectionMemo />
      </div>

      <LiveActivityIndicator />

      {/* ════ APP SECTION & SOLUTION ════ */}
      <div>
        <AppSection />
      </div>

      {/* ════ PRICING ════ */}
      <div id="pricing-wrapper">
        <PricingSection />
      </div>

      {/* ════ HOW IT WORKS ════ */}
      <div>
        <HowItWorksMemo />
      </div>

      {/* ════ TESTIMONIALS ════ */}
      <div>
        <TestimonialsSection />
      </div>

      {/* ════ MARKETPLACE LABEL (EN CROISSANCE) ════ */}
      <div className="py-12 border-t border-slate-200/30 dark:border-white/5">
        <div className="container">
          <div className="bg-orange-500/5 rounded-3xl p-8 border border-orange-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left">
              <h3 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Un Marketplace en pleine expansion</h3>
              <p className="text-slate-500 font-medium">Recherchez vos produits préférés parmi les boutiques qui utilisent déjà Velmo pour leur visibilité en ligne.</p>
            </div>
            <div className="w-full max-w-sm">
              <HeroSearch stats={stats} />
            </div>
          </div>
        </div>
      </div>

      {/* ════ TICKER ════ */}
      <div className="relative overflow-hidden" style={{
        background: 'transparent',
        borderTop: 'none',
        borderBottom: 'none',
      }}>
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-28 z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${fadeBg}, transparent)` }} />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-28 z-10 pointer-events-none" style={{ background: `linear-gradient(to left, ${fadeBg}, transparent)` }} />
        <div className="py-3">
          <ProductTicker products={topProducts} />
        </div>
      </div>

      {/* ════ CATEGORIES ════ */}
      <div>
        <CategoriesSection categories={categories} />
      </div>

      {/* ════ BEST PRODUCTS ════ */}
      <div>
        <BestProducts products={topProducts.slice(0, 12)} loading={topProductsLoading} />
      </div>

      {/* ════ FEATURED SHOPS ════ */}
      <div className="pb-24">
        <Suspense fallback={<div className="h-64" />}>
          <FeaturedShops />
        </Suspense>
      </div>

      {/* ════ VISION ════ */}
      <VisionSectionMemo />

      {/* ════ SELLERS FEED ════ */}
      <div>
        <Suspense fallback={<div className="h-64" />}>
          <SellersFeedMemo />
        </Suspense>
      </div>

      {/* ════ FAQ ════ */}
      <div className="bg-slate-50 dark:bg-slate-900/10 py-12">
        <Suspense fallback={<div className="h-32" />}>
          <FAQSectionMemo />
        </Suspense>
      </div>

      {/* ════ DOWNLOAD ════ */}
      <div>
        <DownloadSectionMemo />
      </div>

      <FooterMemo />
    </div>
  );
}
