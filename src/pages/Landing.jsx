import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShoppingBag, Store, CheckCircle, CheckCircle2, ArrowRight, Star, Download, Globe, User, Menu, Sun, Moon, Sparkles, Zap, Map, Search, X, Loader2, ChevronRight, Apple, Shirt, Smartphone, Pill, Home, Dumbbell, Cpu, WifiOff, Package, TrendingUp, MessageCircle, BarChart3, Shield, Clock, Award, BarChart2, CreditCard, Users } from 'lucide-react';
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
import SellersFeed from '../components/SellersFeed';
import FeaturedShops from '../components/FeaturedShops';
import FAQSection from '../components/FAQSection';
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
              onClick={() => p.shops?.slug && navigate(`/b/${p.shops.slug}?p=${p.id}`)}
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
                      onClick={() => { navigate(`/b/${shop.slug}`); setOpen(false); setQuery(''); }}
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
                      onClick={() => { navigate(`/b/${prod.shops?.slug}?p=${prod.id}`); setOpen(false); setQuery(''); }}
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
      <div className="container relative z-10 mb-16">
        <div className="text-center">
          <SectionLabel icon={<Sparkles size={12} className="text-orange-400" />} label={lang === 'fr' ? 'Parcourir par secteur' : 'Browse by sector'} />
          <h2 className={`text-4xl md:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Cherchez par <span className="velmo-gradient-text-animated">envie</span>.
          </h2>
          <p className="text-slate-400 text-lg mt-4 font-medium max-w-xl mx-auto">
            Accédez instantanément aux meilleurs articles de chaque secteur d'activité.
          </p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative flex overflow-hidden">
        <motion.div
          animate={categories.length > 5 ? { x: ['0%', '-50%'] } : {}}
          transition={categories.length > 5 ? {
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          } : {}}
          className="flex gap-6 px-6"
        >
          {items.map((cat, i) => {
            const style = getCatStyle(cat);
            return (
              <motion.button
                key={`${cat}-${i}`}
                whileHover={{ y: -10, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/search?q=${encodeURIComponent(cat)}`)}
                className={`group relative flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border transition-all duration-500 overflow-hidden min-w-[180px] ${isDark
                  ? 'bg-[#121821] border-white/5 hover:border-orange-500/30'
                  : 'bg-white border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-2xl'
                  }`}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at center, ${style.color}, transparent 70%)` }}
                />

                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg"
                  style={{ background: `${style.color}15`, color: style.color, border: `1px solid ${style.color}25` }}
                >
                  {style.icon}
                </div>
                <span className={`text-xs font-black uppercase tracking-widest text-center transition-colors duration-300 ${isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'}`}>
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
    { icon: <Store size={26} />, value: stats.shopCount || 5000, suffix: '+', label: lang === 'fr' ? 'Boutiques actives' : 'Active shops', color: '#f97316' },
    { icon: <ShoppingBag size={26} />, value: stats.productCount || 120000, suffix: '+', label: lang === 'fr' ? 'Produits référencés' : 'Listed products', color: '#3b82f6' },
    { icon: <CheckCircle size={26} />, value: stats.orderCount || 50000, suffix: '+', label: lang === 'fr' ? 'Commandes traitées' : 'Orders processed', color: '#10b981' },
    { icon: <Star size={26} />, value: 0, suffix: '', label: lang === 'fr' ? 'Note marchands' : 'Merchant rating', color: '#f59e0b', fixed: '4.9★' },
  ];

  return (
    <div className={`py-24 relative overflow-hidden border-y ${isDark ? 'border-white/[0.05] bg-white/[0.01]' : 'border-black/[0.05] bg-slate-50/30'}`}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none opacity-50">
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16">
          {METRICS.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="group text-center"
            >
              <div
                className="w-16 h-16 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl"
                style={{ background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}25` }}
              >
                {m.icon}
              </div>
              <div className={`text-4xl md:text-5xl font-black mb-2 tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {m.fixed ?? <Counter to={m.value} suffix={m.suffix} />}
              </div>
              <div className="text-slate-500 text-xs font-black uppercase tracking-[0.1em]">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
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
                  onClick={() => p.shops?.slug && navigate(`/b/${p.shops.slug}?p=${p.id}`)}
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

// ─── How It Works ─────────────────────────────────────────────────────────────
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
            href="https://app.velmo.pro"
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
            <h2 className={`text-4xl md:text-5xl lg:text-7xl font-black mb-6 leading-[0.85] tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
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
              <a href="https://app.velmo.pro" target="_blank" rel="noopener noreferrer" className="velmo-btn-primary px-10 py-4 rounded-2xl text-base font-black flex items-center gap-3 shadow-2xl shadow-orange-500/30">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.features.items.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`group rounded-2xl p-5 transition-all duration-300 velmo-card-enterprise cursor-default border ${isDark
                ? 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                }`}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300" style={{ background: `${FEATURE_COLORS[i]}18`, color: FEATURE_COLORS[i] }}>
                {FEATURE_ICONS[i]}
              </div>
              <div className="flex items-start justify-between mb-1.5">
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{f.title}</h3>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0 border ${isDark ? 'bg-white/[0.04] border-white/[0.07] text-slate-600' : 'bg-green-50 border-green-200 text-green-600'}`}>
                  {t.features.included}
                </span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
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
                { emoji: '🪟', sub: t.download.windowsSub, label: t.download.windowsLabel, href: '#' },
                { emoji: '🌐', sub: t.download.browserSub, label: t.download.browserLabel, href: '#' },
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
              <a href="https://app.velmo.pro" target="_blank" rel="noopener noreferrer" className="velmo-btn-primary flex items-center gap-3 px-6 py-4 rounded-2xl">
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
    getPlatformStats().then(setStats).catch(() => { });
    getTopProducts({ limit: 18 })
      .then(setTopProducts)
      .catch(() => { })
      .finally(() => setTopProductsLoading(false));
    getAvailableCategories()
      .then(setCategories)
      .catch(() => { })
      .finally(() => setCategoriesLoading(false));
  }, []);

  const borderStyle = isDark ? { borderTop: '1px solid rgba(255,255,255,0.04)' } : { borderTop: '1px solid rgba(0,0,0,0.06)' };
  const fadeBg = isDark ? '#080b10' : '#f8fafc';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#080b10] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      <Navbar />

      {/* ════ HERO ════ */}
      <section className="relative overflow-hidden" style={{ paddingTop: '20px', paddingBottom: '32px' }}>
        {/* Aurora */}
        <div className="absolute pointer-events-none" style={{
          top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: '1100px', height: '700px',
          background: isDark
            ? 'radial-gradient(ellipse 65% 55% at 50% 18%, rgba(249,115,22,0.22) 0%, rgba(168,85,247,0.09) 50%, transparent 75%)'
            : 'radial-gradient(ellipse 65% 55% at 50% 18%, rgba(249,115,22,0.12) 0%, rgba(168,85,247,0.04) 50%, transparent 75%)',
          filter: 'blur(1px)',
        }} />

        <motion.div className="absolute pointer-events-none" style={{ top: '0', left: '5%', width: '500px', height: '400px', background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.07), transparent 70%)', filter: 'blur(70px)' }}
          animate={{ x: [0, 60, 0], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute pointer-events-none" style={{ top: '20px', right: '5%', width: '420px', height: '320px', background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.07), transparent 70%)', filter: 'blur(60px)' }}
          animate={{ x: [0, -50, 0], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />

        <div className={`absolute inset-0 velmo-grid-pattern pointer-events-none ${isDark ? 'opacity-[0.08]' : 'opacity-[0.03]'}`} />

        <div className="container relative">
          <motion.div variants={heroContainer} initial="hidden" animate="show" className="flex flex-col items-center text-center">
            {/* Badge */}
            <motion.div variants={heroItem} className="mb-3">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-orange-400/5 to-purple-500/5 text-orange-400 text-xs font-bold backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                {t.hero.badge}
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={heroItem} className="mb-4">
              <h1 className="font-black leading-[0.85] tracking-tighter">
                <span className={`block text-5xl md:text-7xl lg:text-8xl xl:text-[100px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{lang === 'fr' ? 'Vendez' : 'Sell'} <span className="velmo-gradient-text-animated">mieux.</span></span>
                <span className={`block text-5xl md:text-7xl lg:text-8xl xl:text-[100px] ${isDark ? 'text-white/40' : 'text-slate-300'}`}>{lang === 'fr' ? 'Encaissez' : 'Earn'} <span className="hover:text-orange-500 transition-colors duration-500">direct.</span></span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p variants={heroItem} className="text-slate-400 text-base md:text-xl max-w-xl mx-auto mb-8 font-medium leading-relaxed">
              {lang === 'fr'
                ? "La caisse intelligente qui transforme votre boutique guinéenne en une machine de guerre commerciale."
                : "The smart register that transforms your African shop into a commercial power-house."}
            </motion.p>

            {/* Search */}
            <motion.div variants={heroItem} className="w-full max-w-2xl mt-4 mb-8">
              <HeroSearch stats={stats} />
            </motion.div>

            {/* Access my shop */}
            <motion.div variants={heroItem} className="mb-12">
              <AccessMyShop variant="hero" />
            </motion.div>

            {/* Platform stats */}
            <motion.div
              variants={heroItem}
              className={`flex flex-wrap justify-center gap-8 md:gap-14 pt-8 border-t w-full max-w-xl ${isDark ? 'border-white/[0.07]' : 'border-gray-200'}`}
            >
              {[
                { value: stats.shopCount, suffix: '+', label: t.stats.shops, fallback: '5 000+' },
                { value: stats.productCount, suffix: '+', label: t.stats.products, fallback: '120 000+' },
                { value: stats.orderCount, suffix: '+', label: t.stats.orders, fallback: '50 000+' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className={`text-2xl md:text-3xl font-black mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {s.value > 0
                      ? <Counter to={s.value} suffix={s.suffix} />
                      : <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{s.fallback}</span>}
                  </div>
                  <div className="text-slate-500 text-xs">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════ TICKER ════ */}
      <div className="relative overflow-hidden" style={{
        background: 'transparent',
        borderTop: 'none',
        borderBottom: 'none',
      }}>
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-28 z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${fadeBg}, transparent)` }} />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-28 z-10 pointer-events-none" style={{ background: `linear-gradient(to left, ${fadeBg}, transparent)` }} />
        <div className="py-3">
          <div className="flex items-center gap-3 mb-2.5 container">
            <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap flex items-center gap-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              {t.ticker.label}
            </span>
          </div>
          <ProductTicker products={topProducts} />
        </div>
      </div>

      {/* ════ CATEGORIES ════ */}
      <div>
        <CategoriesSection categories={categories} />
      </div>

      {/* ════ FEATURED SHOPS ════ */}
      <div>
        <FeaturedShops />
      </div>

      {/* ════ STATS BAND ════ */}
      <StatsSection stats={stats} />

      {/* ════ BEST PRODUCTS ════ */}
      <div>
        <BestProducts products={topProducts.slice(0, 12)} loading={topProductsLoading} />
      </div>

      {/* ════ APP SECTION ════ */}
      <div>
        <AppSection />
      </div>

      {/* ════ HOW IT WORKS ════ */}
      <div>
        <HowItWorks />
      </div>

      {/* ════ SELLERS FEED ════ */}
      <div>
        <SellersFeed />
      </div>

      {/* ════ FAQ ════ */}
      <div>
        <FAQSection />
      </div>

      {/* ════ DOWNLOAD ════ */}
      <div>
        <DownloadSection />
      </div>

      <Footer />
    </div>
  );
}
