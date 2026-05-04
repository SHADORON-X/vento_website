import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Clock, CheckCircle2, ChevronRight, Check, ArrowRight } from 'lucide-react';
import { useSite } from '../context/SiteContext';

function SectionLabel({ icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold rounded-full mb-4 tracking-wide uppercase">
      {icon}{label}
    </div>
  );
}

export default function PricingSection() {
  const { theme, lang } = useSite();
  const isDark = theme === 'dark';
  const [duration, setDuration] = useState(1);

  const [timeLeft, setTimeLeft] = useState(() => {
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
            Le moteur de votre <span className="text-orange-500">croissance</span>.
          </h2>
          <p className="text-slate-500 text-lg font-medium">
            Des tarifs adaptés à la réalité du terrain. Pas de frais cachés.
          </p>
        </div>

        {/* Duration Selector */}
        <div className="flex justify-center mb-16">
          <div className={`flex p-1.5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
            {[1, 3, 6, 12].map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-6 py-3 rounded-xl text-[12px] font-black transition-all ${duration === d ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {d} {d === 1 ? 'Mois' : 'Mois'}
                {d > 1 && <span className="block text-[8px] opacity-70">-{Math.round((1 - (calculatePrice(120000, d) / (120000 * d))) * 100)}%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {Object.entries(PLANS).map(([key, p]) => {
            const currentPrice = calculatePrice(p.price, duration);
            const monthlyPrice = Math.round(currentPrice / duration);
            const bonus = getBonus(duration);

            return (
              <motion.div
                key={key}
                whileHover={{ y: -8 }}
                className={`p-10 rounded-[3rem] border relative flex flex-col h-full transition-all duration-500 ${p.popular ? (isDark ? 'bg-[#151b26] border-orange-500/30 shadow-2xl shadow-orange-500/5' : 'bg-white border-orange-200 shadow-2xl shadow-orange-100') : (isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-xl shadow-slate-100')}`}
              >
                {p.popular && (
                  <div className="absolute top-0 right-10 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
                    Conseillé
                  </div>
                )}
                <div className="mb-8">
                  <div className={`text-xs font-black uppercase tracking-widest mb-2 ${key === 'business' ? 'text-orange-500' : 'text-slate-500'}`}>{p.name}</div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {duration === 1 ? p.price.toLocaleString() : monthlyPrice.toLocaleString()}
                    </span>
                    <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">GNF / Mois</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 text-orange-500 mt-0.5">
                        <Check size={12} strokeWidth={4} />
                      </div>
                      <span className={`text-sm font-bold leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <a
                  href="/velmomobile/index.html#/signup"
                  target="_blank"
                  className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 ${key === 'business' ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20 hover:scale-[1.02]' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                >
                  Commencer maintenant
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
