import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { useSite } from '../context/SiteContext';

function SectionLabel({ icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold rounded-full mb-4 tracking-wide uppercase">
      {icon}{label}
    </div>
  );
}

export default function BestProducts({ products, loading }) {
  const navigate = useNavigate();
  const { t, theme } = useSite();
  const isDark = theme === 'dark';

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-24" id="marketplace">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <SectionLabel icon={<Star size={12} className="text-orange-400" />} label={t.bestProducts.badge} />
            <h2 className={`text-4xl md:text-5xl font-black tracking-tight leading-[0.95] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Les <span className="text-orange-500">indispensables</span> <br />du moment
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
