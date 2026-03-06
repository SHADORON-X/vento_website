import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ShoppingBag, Store, CheckCircle, ArrowRight, Star, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getPublicShops } from '../lib/api';
import { useSite } from '../context/SiteContext';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];
const COVER_GRADIENTS = [
  'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
  'linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
];

function shopColor(name) {
  return COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
}
function coverGrad(name) {
  return COVER_GRADIENTS[(name?.charCodeAt(0) || 0) % COVER_GRADIENTS.length];
}
function mockRating(name) {
  return (4.1 + ((name?.charCodeAt(0) || 65) % 9) * 0.09).toFixed(1);
}

function ShopCard({ shop, products, index }) {
  const navigate = useNavigate();
  const { theme } = useSite();
  const isDark = theme === 'dark';
  const color = shopColor(shop.name);
  const logo = shop.logo_url || shop.logo;
  const cover = shop.cover_url;
  const rating = mockRating(shop.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col h-full ${isDark
        ? 'bg-[#0e1218] border-white/5 hover:border-orange-500/30'
        : 'bg-white border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-md'
        }`}
      onClick={() => navigate(`/b/${shop.slug}`)}
    >
      {/* Cover banner */}
      <div className="relative h-24 overflow-hidden flex-shrink-0">
        {cover ? (
          <img src={cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: coverGrad(shop.name) }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {shop.category && (
          <div className="absolute top-2 left-2 text-[8px] font-black px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-md text-white border border-white/10 uppercase tracking-wider">
            {shop.category}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pb-4 flex flex-col flex-1">
        {/* Logo row */}
        <div className="flex items-end gap-3 -mt-6 mb-3">
          <div
            className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-black text-lg shadow-lg ring-2 ${isDark ? 'ring-[#0e1218]' : 'ring-white'
              }`}
            style={{ background: logo ? undefined : `linear-gradient(135deg, ${color}, ${color}99)` }}
          >
            {logo ? (
              <img src={logo} alt="" className="w-full h-full object-cover" />
            ) : (
              shop.name?.slice(0, 2).toUpperCase()
            )}
          </div>

          <div className="min-w-0 flex-1 pb-1">
            <div className={`font-bold text-sm truncate leading-tight flex items-center gap-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {shop.name}
              {shop.is_verified && <CheckCircle size={10} className="text-orange-500 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-500">
                <Star size={9} fill="currentColor" />{rating}
              </span>
              {shop.city && <span className="text-slate-500 text-[9px] truncate tracking-tight">{shop.city}</span>}
            </div>
          </div>
        </div>

        {/* Product thumbnails */}
        <div className="mb-3">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-4 gap-1.5">
              {products.slice(0, 4).map((p) => (
                <div key={p.id} className={`aspect-square rounded-lg overflow-hidden border ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-50 bg-gray-50'}`}>
                  <img
                    src={p.photo_url}
                    alt={p.name}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    loading="lazy"
                    onLoad={(e) => e.currentTarget.style.opacity = '1'}
                    style={{ opacity: 0 }}
                  />
                </div>
              ))}
              {Array.from({ length: Math.max(0, 4 - products.length) }).map((_, i) => (
                <div key={i} className={`aspect-square rounded-lg border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50/50 border-gray-100'}`} />
              ))}
            </div>
          ) : (
            <div className={`py-3 text-center rounded-xl border border-dashed text-[10px] uppercase font-bold tracking-widest ${isDark ? 'border-white/5 text-slate-600' : 'border-gray-100 text-slate-400'}`}>
              Bientôt disponible
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`mt-auto pt-3 border-t flex items-center justify-between ${isDark ? 'border-white/5' : 'border-gray-50'}`}>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
            {(shop.orders_count || 0).toLocaleString()} Commandes
          </span>
          <ArrowRight size={14} className="text-orange-500" />
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton card
function SkeletonCard() {
  return (
    <div className="h-64 rounded-2xl border border-gray-100 animate-pulse bg-white">
      <div className="h-24 bg-gray-100" />
      <div className="p-4 pt-0">
        <div className="w-14 h-14 -mt-6 rounded-xl bg-gray-200 ring-2 ring-white" />
        <div className="mt-2 h-3 w-1/2 bg-gray-100 rounded" />
        <div className="grid grid-cols-4 gap-1.5 mt-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-gray-50 rounded-lg" />)}
        </div>
      </div>
    </div>
  );
}

export default function FeaturedShops() {
  const [shops, setShops] = useState([]);
  const [prodMap, setProdMap] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme, lang } = useSite();
  const isDark = theme === 'dark';

  useEffect(() => {
    getPublicShops({ limit: 6 }).then(async (data) => {
      setShops(data);
      if (data.length === 0) return;
      const ids = data.map((s) => s.id);
      const { data: prods } = await supabase
        .from('products')
        .select('id,name,price_sale,price_regular,photo_url,shop_id')
        .eq('is_active', true)
        .not('photo_url', 'is', null)
        .neq('photo_url', '')
        .in('shop_id', ids)
        .order('name', { ascending: true })
        .limit(24);
      const map = {};
      (prods || []).forEach((p) => {
        if (!map[p.shop_id]) map[p.shop_id] = [];
        if (map[p.shop_id].length < 4) map[p.shop_id].push(p);
      });
      setProdMap(map);
    }).catch(() => setShops([])).finally(() => setLoading(false));
  }, []);

  if (!loading && shops.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-400 text-[10px] font-black rounded-full mb-3 tracking-widest uppercase border border-orange-500/10 shadow-lg shadow-orange-500/5">
              <Sparkles size={10} className="animate-pulse" />
              {lang === 'en' ? 'Featured Shops' : '🔥 Top Boutiques'}
            </div>
            <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {lang === 'en' ? 'Explore the local elite' : "Découvrez les leaders du marché"}
            </h2>
          </div>
          <button onClick={() => navigate('/search')} className="text-orange-500 text-xs font-bold px-4 py-2 rounded-full border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all">
            Tout voir
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : shops.map((shop, i) => (
              <ShopCard key={shop.id} shop={shop} products={prodMap[shop.id]} index={i} />
            ))}
        </div>
      </div>
    </section>
  );
}
