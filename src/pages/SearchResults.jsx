import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, X, Loader2, ShoppingBag,
  ChevronLeft, Filter, Store, CheckCircle, ArrowRight, Sparkles,
} from 'lucide-react';
import { searchProducts, searchShops, getAvailableCategories } from '../lib/api';
import { useGeoSearch } from '../hooks/useGeoSearch';
import { useSite } from '../context/SiteContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ─── Product card ──────────────────────────────────────────────────────────
function ProductCard({ product, isDark, lang }) {
  const navigate = useNavigate();
  const shop = product.shops;
  const hasDiscount = product.price_regular && product.price_regular > product.price_sale;
  const pct = hasDiscount ? Math.round((1 - product.price_sale / product.price_regular) * 100) : 0;
  const outOfStock = product.quantity != null && product.quantity === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className={`group rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 border h-full flex flex-col ${isDark
        ? 'bg-[#121821] border-white/10 hover:border-orange-500/40 shadow-xl'
        : 'bg-white border-gray-100 hover:border-orange-300 shadow-lg shadow-gray-200/40 hover:shadow-orange-500/10'
        } ${outOfStock ? 'opacity-60 grayscale-[0.5]' : ''}`}
      onClick={() => shop?.slug && navigate(`/b/${shop.slug}?p=${product.id}`)}
    >
      <div className={`aspect-square relative overflow-hidden ${isDark ? 'bg-white/[0.04]' : 'bg-gray-50'}`}>
        {product.photo_url ? (
          <img
            src={product.photo_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ShoppingBag size={24} strokeWidth={1} />
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg">
            -{pct}%
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white text-[10px] font-black px-3 py-1 bg-black/50 border border-white/10 rounded-full uppercase tracking-widest">
              {lang === 'en' ? 'Out of stock' : 'Rupture'}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className={`font-black text-xs md:text-sm truncate mb-1.5 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {product.name}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div className={`w-4 h-4 rounded-md overflow-hidden flex-shrink-0 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            {shop?.logo_url ? <img src={shop.logo_url} alt="" className="w-full h-full object-cover" /> : <Store size={8} className="text-slate-600 m-auto mt-0.5" />}
          </div>
          <span className="text-slate-500 text-[10px] font-bold truncate flex-1">{shop?.name}</span>
          {shop?.city && (
            <span className="text-slate-500 text-[9px] font-medium flex items-center gap-0.5 flex-shrink-0">
              <MapPin size={8} className="text-orange-500" />{shop.city}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-orange-500 text-sm font-black tracking-tight">
              {product.price_sale?.toLocaleString()} GNF
            </span>
            {hasDiscount && (
              <span className="text-slate-400 text-[9px] line-through decoration-red-500/30">
                {product.price_regular?.toLocaleString()}
              </span>
            )}
          </div>
          <div className={`p-1.5 rounded-lg transition-colors ${isDark ? 'bg-white/5 text-slate-400 group-hover:text-white' : 'bg-gray-100 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500'
            }`}>
            <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Shop result card ───────────────────────────────────────────────────────
function ShopResultCard({ shop, isDark, lang }) {
  const navigate = useNavigate();
  const logo = shop.logo_url || shop.logo;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`rounded-3xl p-5 cursor-pointer transition-all duration-500 border flex items-center gap-5 ${isDark
        ? 'bg-[#121821] border-white/10 hover:border-orange-500/40 shadow-xl'
        : 'bg-white border-gray-100 hover:border-orange-200 shadow-lg shadow-gray-200/40 hover:shadow-orange-500/10'
        }`}
      onClick={() => navigate(`/b/${shop.slug}`)}
    >
      <div
        className={`w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ${isDark ? 'ring-white/5' : 'ring-gray-50'
          }`}
        style={{ background: logo ? 'transparent' : 'linear-gradient(135deg,#f97316,#ea580c)' }}
      >
        {logo ? (
          <img src={logo} alt="" className="w-full h-full object-cover" />
        ) : (
          shop.name?.slice(0, 2).toUpperCase()
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-black text-base truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{shop.name}</span>
          {shop.is_verified && <CheckCircle size={14} className="text-orange-500 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          {shop.category && (
            <span className={`px-2 py-0.5 rounded-lg ${isDark ? 'bg-white/5 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
              {shop.category}
            </span>
          )}
          {shop.city && <span className="flex items-center gap-1"><MapPin size={10} className="text-orange-500" />{shop.city}</span>}
        </div>
        {shop.description && (
          <p className="text-slate-500 text-xs mt-2 line-clamp-1 opacity-80">{shop.description}</p>
        )}
      </div>
      <div className={`p-2 rounded-full transition-all ${isDark ? 'bg-white/5 text-slate-400' : 'bg-gray-100 text-slate-500'
        } group-hover:bg-orange-500 group-hover:text-white`}>
        <ArrowRight size={18} />
      </div>
    </motion.div>
  );
}

function Skeleton({ isDark }) {
  return (
    <div className={`rounded-2xl overflow-hidden animate-pulse border ${isDark ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-gray-50 border-gray-100'}`}>
      <div className={`aspect-square ${isDark ? 'bg-white/[0.05]' : 'bg-gray-200'}`} />
      <div className="p-3 space-y-2">
        <div className={`h-3 rounded w-3/4 ${isDark ? 'bg-white/[0.08]' : 'bg-gray-200'}`} />
        <div className={`h-2.5 rounded w-1/2 ${isDark ? 'bg-white/[0.05]' : 'bg-gray-150'}`} />
        <div className={`h-3.5 rounded w-2/5 ${isDark ? 'bg-white/[0.08]' : 'bg-gray-200'}`} />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userCity, detecting, detectCity } = useGeoSearch();
  const { theme, lang, t } = useSite();
  const isDark = theme === 'dark';

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [cityFilter, setCityFilter] = useState(searchParams.get('city') || '');
  const [categories, setCategories] = useState([]);
  const [availCats, setAvailCats] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [tab, setTab] = useState('products');

  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    getAvailableCategories().then(setAvailCats).catch(() => { });
  }, []);

  useEffect(() => {
    if (userCity && !cityFilter) setCityFilter(userCity);
  }, [userCity]); // eslint-disable-line

  const doSearch = useCallback(
    async (q, city, cats, minP, maxP, verif) => {
      const trimmed = q?.trim();
      if (!trimmed || trimmed.length < 2) {
        setProducts([]);
        setShops([]);
        return;
      }
      setLoading(true);
      try {
        const [prods, shs] = await Promise.all([
          searchProducts(trimmed, city, { categories: cats, priceMin: minP, priceMax: maxP, verifiedOnly: verif, limit: 40 }),
          searchShops(trimmed, city, { limit: 12 }),
        ]);
        const sortedProds = (prods || []).sort((a, b) => {
          const hasPhotoA = a.photo_url ? 1 : 0;
          const hasPhotoB = b.photo_url ? 1 : 0;
          return hasPhotoB - hasPhotoA;
        });
        setProducts(sortedProds);
        setShops(shs);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, cityFilter, categories, priceMin, priceMax, verifiedOnly);
      const p = {};
      if (query) p.q = query;
      if (cityFilter) p.city = cityFilter;
      setSearchParams(p, { replace: true });
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, cityFilter, categories, priceMin, priceMax, verifiedOnly, doSearch, setSearchParams]);

  const toggleCategory = (cat) =>
    setCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);

  const activeFilters = categories.length + (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (verifiedOnly ? 1 : 0);
  const hasQuery = query.trim().length >= 2;
  const totalResults = products.length + shops.length;

  const DEFAULT_CATS = lang === 'en'
    ? ['Food', 'Fashion', 'Phones', 'Pharmacy', 'Home', 'Beauty', 'Electronics', 'Sports']
    : ['Alimentation', 'Mode', 'Téléphones', 'Pharmacie', 'Maison', 'Beauté', 'Électronique', 'Sports'];

  const SUGGEST_TERMS = lang === 'en'
    ? ['Rice', 'Oil', 'Phone', 'Shoes', 'Medicine', 'Fabric']
    : ['Riz', 'Huile', 'Téléphone', 'Chaussures', 'Médicament', 'Tissu'];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#080b10] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      <Navbar />
      <div className="pt-20">

        {/* ── Sticky search header ────────────────────────────────────── */}
        <div className={`sticky top-16 z-30 transition-all duration-300 border-b py-4 ${isDark ? 'bg-[#080b10]/80 backdrop-blur-2xl border-white/5' : 'bg-white/80 backdrop-blur-2xl border-gray-100 shadow-sm'
          }`}>
          <div className="container flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-gray-100 text-slate-500 hover:text-slate-900'}`}
            >
              <ChevronLeft size={20} />
            </motion.button>

            {/* Search input */}
            <div className="relative flex-1 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-orange-500 transition-colors" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search.placeholder}
                className={`w-full rounded-2xl pl-11 pr-11 py-3 text-sm font-medium focus:outline-none transition-all ${isDark
                  ? 'bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-orange-500/50 shadow-inner'
                  : 'bg-gray-50 border border-gray-200 text-slate-900 placeholder-slate-400 focus:border-orange-400 shadow-sm'
                  }`}
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setProducts([]); setShops([]); }}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* City filter */}
            <div className="relative hidden md:flex items-center group">
              <MapPin size={16} className="absolute left-4 text-slate-500 pointer-events-none group-focus-within:text-orange-500 transition-colors" />
              <input
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder={lang === 'en' ? 'City' : 'Ville'}
                className={`rounded-2xl pl-10 pr-10 py-3 text-sm font-medium focus:outline-none w-44 transition-all ${isDark
                  ? 'bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-orange-500/50 shadow-inner'
                  : 'bg-gray-50 border border-gray-200 text-slate-900 placeholder-slate-400 focus:border-orange-400 shadow-sm'
                  }`}
              />
              <button
                onClick={detectCity}
                disabled={detecting}
                className="absolute right-3 text-slate-500 hover:text-orange-400 transition-colors"
                title={lang === 'en' ? 'Detect' : 'Détecter'}
              >
                {detecting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              </button>
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-black transition-all border flex-shrink-0 ${showFilters || activeFilters > 0
                ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                : isDark
                  ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  : 'bg-white border-gray-200 text-slate-500 hover:text-slate-900 shadow-sm'
                }`}
            >
              <Filter size={16} />
              <span className="hidden lg:inline">{lang === 'en' ? 'Filters' : 'Filtres'} {activeFilters > 0 && `(${activeFilters})`}</span>
            </button>
          </div>
        </div>

        <div className="container py-6">

          {/* Tab bar */}
          {/* Tab bar */}
          {hasQuery && (
            <div className={`flex items-center gap-2 border rounded-2xl p-1.5 w-fit mb-8 ${isDark ? 'bg-[#121821] border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-md'
              }`}>
              <button
                onClick={() => setTab('products')}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${tab === 'products'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-gray-50'
                  }`}
              >
                <ShoppingBag size={16} />
                {lang === 'en' ? 'Products' : 'Produits'}
                {products.length > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black ${tab === 'products' ? 'bg-white/20 text-white' : isDark ? 'bg-white/5 text-slate-500' : 'bg-gray-100 text-slate-500'
                    }`}>
                    {products.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTab('shops')}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${tab === 'shops'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-gray-50'
                  }`}
              >
                <Store size={16} />
                {lang === 'en' ? 'Shops' : 'Boutiques'}
                {shops.length > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black ${tab === 'shops' ? 'bg-white/20 text-white' : isDark ? 'bg-white/5 text-slate-500' : 'bg-gray-100 text-slate-500'
                    }`}>
                    {shops.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Status bar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 text-sm">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-orange-400" />
                  {lang === 'en' ? 'Searching…' : 'Recherche…'}
                </span>
              ) : hasQuery ? (
                <>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalResults}</span>{' '}
                  {lang === 'en' ? `result${totalResults !== 1 ? 's' : ''} for` : `résultat${totalResults !== 1 ? 's' : ''} pour`}{' '}
                  <span className="text-orange-400">"{query}"</span>
                  {cityFilter && <> · <span className="text-slate-400">{cityFilter}</span></>}
                </>
              ) : (
                lang === 'en' ? 'Enter at least 2 characters' : 'Entrez au moins 2 caractères'
              )}
            </p>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className={`rounded-2xl p-5 mb-6 border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Catégories */}
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {lang === 'en' ? 'Category' : 'Catégorie'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(availCats.length > 0 ? availCats : DEFAULT_CATS).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${categories.includes(cat)
                              ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                              : isDark
                                ? 'bg-white/[0.05] border-white/[0.08] text-slate-400 hover:text-white'
                                : 'bg-gray-50 border-gray-200 text-slate-500 hover:text-slate-900'
                              }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Prix */}
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {lang === 'en' ? 'Price (GNF)' : 'Prix (GNF)'}
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          placeholder="Min"
                          className={`flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none border transition-colors ${isDark
                            ? 'bg-white/[0.05] border-white/[0.08] text-white placeholder-slate-600 focus:border-orange-500/40'
                            : 'bg-gray-50 border-gray-200 text-slate-900 placeholder-slate-400 focus:border-orange-400'
                            }`}
                        />
                        <span className="text-slate-500 text-xs">—</span>
                        <input
                          type="number"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          placeholder="Max"
                          className={`flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none border transition-colors ${isDark
                            ? 'bg-white/[0.05] border-white/[0.08] text-white placeholder-slate-600 focus:border-orange-500/40'
                            : 'bg-gray-50 border-gray-200 text-slate-900 placeholder-slate-400 focus:border-orange-400'
                            }`}
                        />
                      </div>
                    </div>

                    {/* Qualité + reset */}
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {lang === 'en' ? 'Quality' : 'Qualité'}
                      </p>
                      <label className="flex items-center gap-3 cursor-pointer mb-3">
                        <div
                          onClick={() => setVerifiedOnly((v) => !v)}
                          className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${verifiedOnly ? 'bg-orange-500' : isDark ? 'bg-white/10' : 'bg-gray-200'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${verifiedOnly ? 'left-5' : 'left-0.5'}`} />
                        </div>
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {lang === 'en' ? 'Verified shops only' : 'Boutiques vérifiées uniquement'}
                        </span>
                      </label>
                      {activeFilters > 0 && (
                        <button
                          onClick={() => { setCategories([]); setPriceMin(''); setPriceMax(''); setVerifiedOnly(false); }}
                          className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                        >
                          {lang === 'en' ? 'Reset filters' : 'Réinitialiser les filtres'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Results ─────────────────────────────────────────────────── */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} isDark={isDark} />)}
            </div>
          ) : hasQuery && totalResults > 0 ? (
            <>
              {tab === 'products' && products.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {products.map((p) => <ProductCard key={p.id} product={p} isDark={isDark} lang={lang} />)}
                </div>
              )}
              {tab === 'products' && products.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-sm">
                  {lang === 'en' ? 'No matching products. ' : 'Aucun produit correspondant. '}
                  <button onClick={() => setTab('shops')} className="text-orange-400 hover:text-orange-300">
                    {lang === 'en' ? 'See shops →' : 'Voir les boutiques →'}
                  </button>
                </div>
              )}

              {tab === 'shops' && shops.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {shops.map((s) => <ShopResultCard key={s.id} shop={s} isDark={isDark} lang={lang} />)}
                </div>
              )}
              {tab === 'shops' && shops.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-sm">
                  {lang === 'en' ? 'No matching shops. ' : 'Aucune boutique correspondante. '}
                  <button onClick={() => setTab('products')} className="text-orange-400 hover:text-orange-300">
                    {lang === 'en' ? 'See products →' : 'Voir les produits →'}
                  </button>
                </div>
              )}
            </>
          ) : hasQuery ? (
            <div className="text-center py-20">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-white/[0.05]' : 'bg-gray-100'}`}>
                <ShoppingBag size={32} className="text-slate-400" />
              </div>
              <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {lang === 'en' ? 'No results' : 'Aucun résultat'}
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                {lang === 'en'
                  ? `No products or shops for "${query}"${cityFilter ? ` in ${cityFilter}` : ''}. Try a different term or remove the city filter.`
                  : `Aucun produit ou boutique pour "${query}"${cityFilter ? ` à ${cityFilter}` : ''}. Essayez un autre terme ou sans filtre de ville.`}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {cityFilter && (
                  <button
                    onClick={() => setCityFilter('')}
                    className={`px-4 py-2 rounded-full text-sm transition-colors border ${isDark ? 'bg-white/[0.05] border-white/[0.08] text-slate-400 hover:text-white' : 'bg-white border-gray-200 text-slate-500 hover:text-slate-900'}`}
                  >
                    {lang === 'en' ? 'Search everywhere' : 'Chercher partout'}
                  </button>
                )}
                {activeFilters > 0 && (
                  <button
                    onClick={() => { setCategories([]); setPriceMin(''); setPriceMax(''); setVerifiedOnly(false); }}
                    className={`px-4 py-2 rounded-full text-sm transition-colors border ${isDark ? 'bg-white/[0.05] border-white/[0.08] text-slate-400 hover:text-white' : 'bg-white border-gray-200 text-slate-500 hover:text-slate-900'}`}
                  >
                    {lang === 'en' ? 'Remove filters' : 'Supprimer les filtres'}
                  </button>
                )}
                <button
                  onClick={() => setQuery('')}
                  className="px-4 py-2 bg-orange-500/15 border border-orange-500/30 rounded-full text-sm text-orange-400 transition-colors hover:bg-orange-500/25"
                >
                  {lang === 'en' ? 'New search' : 'Nouvelle recherche'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-white/[0.05]' : 'bg-gray-100'}`}>
                <Search size={32} className="text-slate-400" />
              </div>
              <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {lang === 'en' ? 'What are you looking for?' : 'Que cherchez-vous ?'}
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                {lang === 'en' ? 'Enter a product or shop name' : "Entrez le nom d'un produit ou d'une boutique"}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGEST_TERMS.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className={`px-4 py-2 rounded-full text-sm transition-all border ${isDark
                      ? 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
                      : 'bg-white border-gray-200 text-slate-500 hover:text-slate-900 hover:border-gray-300 shadow-sm'
                      }`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
