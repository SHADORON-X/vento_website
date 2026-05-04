import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Store, ShoppingBag, CheckCircle, Star } from 'lucide-react';
import { useSite } from '../context/SiteContext';

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

export default function StatsSection({ stats }) {
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
