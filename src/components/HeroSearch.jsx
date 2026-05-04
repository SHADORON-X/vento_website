import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Loader2, X, Store, ShoppingBag, CheckCircle, ChevronRight } from 'lucide-react';
import { searchAll } from '../lib/api';
import { useGeoSearch } from '../hooks/useGeoSearch';
import { useSite } from '../context/SiteContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState({ shops: [], products: [] });
  const [loading, setLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);
  const { userCity, detecting, detectCity } = useGeoSearch();
  const { t, theme, formatPrice } = useSite();
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
          <button onClick={goSearch} className="px-5 py-2.5 rounded-xl text-sm font-bold flex-shrink-0 whitespace-nowrap bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all">
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
