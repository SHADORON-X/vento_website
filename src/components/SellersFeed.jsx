import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShoppingBag, CheckCircle, Users, Star, ArrowRight } from 'lucide-react';
import { getShopsWithProducts } from '../lib/api';
import { useSite } from '../context/SiteContext';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#84cc16'];
const COVER_GRADIENTS = [
  'linear-gradient(135deg, rgba(249,115,22,0.9), rgba(234,88,12,0.7))',
  'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,0.7))',
  'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.7))',
  'linear-gradient(135deg, rgba(139,92,246,0.9), rgba(124,58,237,0.7))',
  'linear-gradient(135deg, rgba(236,72,153,0.9), rgba(219,39,119,0.7))',
  'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(217,119,6,0.7))',
  'linear-gradient(135deg, rgba(6,182,212,0.9), rgba(8,145,178,0.7))',
  'linear-gradient(135deg, rgba(132,204,22,0.9), rgba(101,163,13,0.7))',
];

function shopColor(name) {
  return COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
}
function shopCover(name) {
  return COVER_GRADIENTS[(name?.charCodeAt(0) || 0) % COVER_GRADIENTS.length];
}
function mockRating(name) {
  return (4.2 + ((name?.charCodeAt(0) || 65) % 8) * 0.1).toFixed(1);
}

function ShopCard({ shop }) {
  const navigate = useNavigate();
  const { theme } = useSite();
  const isDark = theme === 'dark';
  const color = shopColor(shop.name);
  const logo = shop.logo_url || shop.logo;
  const cover = shop.cover_url;
  const rating = mockRating(shop.name);

  return (
    <div
      onClick={() => navigate(`/b/${shop.slug}`)}
      className={`flex-shrink-0 w-60 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 border ${
        isDark
          ? 'bg-white/[0.04] border-white/[0.07] hover:border-orange-500/30 hover:bg-white/[0.06]'
          : 'bg-white border-gray-200 hover:border-orange-300 shadow-sm hover:shadow-lg hover:shadow-orange-500/8'
      }`}
    >
      {/* Cover */}
      <div className="relative h-20 overflow-hidden">
        {cover ? (
          <img src={cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
            style={{ background: shopCover(shop.name) }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {shop.is_verified && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
            <CheckCircle size={7} />VIP
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 -mt-5 relative">
        {/* Logo overlapping */}
        <div className="flex items-end gap-2 mb-2.5">
          <div
            className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-black text-xs shadow-lg ring-2 ring-black/20"
            style={{ background: logo ? undefined : `linear-gradient(135deg, ${color}, ${color}88)` }}
          >
            {logo
              ? <img src={logo} alt={shop.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              : shop.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 pb-0.5">
            <div className={`font-bold text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{shop.name}</div>
            <div className="flex items-center gap-1.5">
              {shop.city && (
                <span className="text-slate-500 text-[9px] flex items-center gap-0.5">
                  <MapPin size={7} />{shop.city}
                </span>
              )}
              <span className="flex items-center gap-0.5 text-[9px] font-semibold text-amber-400">
                <Star size={7} fill="currentColor" />{rating}
              </span>
            </div>
          </div>
        </div>

        {/* Category */}
        {shop.category && (
          <span
            className="inline-block px-2 py-0.5 text-[9px] rounded-full border mb-2.5 font-bold"
            style={{ background: `${color}18`, color, borderColor: `${color}40` }}
          >
            {shop.category}
          </span>
        )}

        {/* Product thumbnails */}
        <div className="flex gap-1.5 mb-3">
          {(shop.products || []).slice(0, 3).map((p, i) => (
            <div key={i} className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 ${isDark ? 'bg-white/[0.05]' : 'bg-gray-100'}`}>
              {p.photo_url
                ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
                : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={12} className="text-slate-400" /></div>}
            </div>
          ))}
          {Array.from({ length: Math.max(0, 3 - (shop.products?.length || 0)) }).map((_, i) => (
            <div key={`ph-${i}`} className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center border ${
              isDark ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-gray-50 border-gray-200'
            }`}>
              <ShoppingBag size={10} className="text-slate-400" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className={`text-[9px] flex items-center gap-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            <ShoppingBag size={8} />
            {(shop.orders_count || 0).toLocaleString('fr-FR')} cmds
          </span>
          <span className="text-[9px] font-bold flex items-center gap-0.5" style={{ color }}>
            Voir →
          </span>
        </div>
      </div>
    </div>
  );
}

const PLACEHOLDERS = Array.from({ length: 10 }, (_, i) => ({
  id: `ph-${i}`,
  name: ['Diallo Market', 'Konaté Shop', 'Fofana Commerce', 'Bah Boutique', 'Traoré Store',
    'Barry Market', 'Camara Shop', 'Keïta Mode', 'Baldé Store', 'Touré Commerce'][i],
  slug: `placeholder-${i}`,
  category: ['Alimentation', 'Mode', 'Téléphones', 'Pharmacie', 'Électronique',
    'Beauté', 'Maison', 'Sports', 'Alimentation', 'Mode'][i],
  city: ['Conakry', 'Labé', 'Kankan', 'Nzérékoré', 'Kindia', 'Boké', 'Faranah', 'Mamou', 'Conakry', 'Labé'][i],
  is_verified: i < 3,
  orders_count: [342, 218, 195, 156, 134, 112, 98, 87, 76, 65][i],
  products: [],
}));

export default function SellersFeed() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const pausedRef = useRef(false);
  const posRef = useRef(0);
  const { theme, t, lang } = useSite();
  const isDark = theme === 'dark';

  useEffect(() => {
    getShopsWithProducts({ limit: 14 })
      .then((data) => setShops(data.length > 0 ? data : PLACEHOLDERS))
      .catch(() => setShops(PLACEHOLDERS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!trackRef.current || shops.length === 0) return;
    const SPEED = 0.45;
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
  }, [shops]);

  const display = shops.length > 0 ? [...shops, ...shops] : [];
  const fadeBg = isDark ? '#080b10' : '#f8fafc';

  return (
    <section className="py-20 overflow-hidden">
      <div className="container mb-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold rounded-full mb-4 tracking-wide uppercase">
              <Users size={10} />
              {lang === 'en' ? 'Live marketplace' : 'Marketplace live'}
            </div>
            <h2 className={`text-3xl md:text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {lang === 'en' ? 'Most active merchants' : 'Les commerçants les plus actifs'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {lang === 'en' ? 'Thousands of shops waiting for you' : 'Des milliers de boutiques vous attendent'}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4 px-8 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex-shrink-0 w-60 h-60 rounded-2xl velmo-shimmer-card ${isDark ? 'bg-white/[0.04]' : 'bg-gray-100'}`} />
          ))}
        </div>
      ) : (
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-28 z-10 pointer-events-none"
            style={{ background: `linear-gradient(to right, ${fadeBg}, transparent)` }} />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-28 z-10 pointer-events-none"
            style={{ background: `linear-gradient(to left, ${fadeBg}, transparent)` }} />

          <div
            ref={trackRef}
            className="flex gap-4 px-8 py-2"
            style={{ width: 'max-content', willChange: 'transform' }}
          >
            {display.map((shop, i) => (
              <ShopCard key={`${shop.id}-${i}`} shop={shop} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
