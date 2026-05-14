import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Cloud, Check, ArrowRight, Zap, Star } from 'lucide-react';
import { useSite } from '../context/SiteContext';

function SectionLabel({ icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold rounded-full mb-4 tracking-wide uppercase">
      {icon}{label}
    </div>
  );
}

const fmt = (n) => n.toLocaleString('fr-FR');

export default function PricingSection() {
  const { theme, lang } = useSite();
  const isDark = theme === 'dark';

  const isFr = lang === 'fr';

  const PLANS = [
    {
      key: 'standard',
      name: 'Standard',
      icon: <ShoppingBag size={22} />,
      price: 500000,
      type: 'once',
      color: 'from-blue-500 to-cyan-500',
      tag: isFr ? 'Idéal pour démarrer' : 'Perfect to start',
      features: isFr
        ? [
            'Caisse (POS) hors-ligne',
            'Gestion de stock complète',
            'Suivi dettes & créances',
            'Historique des transactions',
            'Rapports journaliers',
          ]
        : [
            'Offline POS',
            'Full inventory management',
            'Debt & credit tracking',
            'Transaction history',
            'Daily reports',
          ],
    },
    {
      key: 'pro',
      name: 'Pro',
      icon: <Star size={22} />,
      price: 900000,
      type: 'once',
      popular: true,
      color: 'from-orange-500 to-red-500',
      tag: isFr ? 'Le plus populaire' : 'Most popular',
      features: isFr
        ? [
            'Tout Standard inclus',
            'Analytics avancés (ABC / RFM)',
            'Vitrine web + commandes en ligne',
            'Multi-boutiques & multi-employés',
            'Gestion dépenses & sorties',
            'Agent IA Tambo → rapports WhatsApp & Telegram',
          ]
        : [
            'Everything in Standard',
            'Advanced Analytics (ABC / RFM)',
            'Web storefront + online orders',
            'Multi-shop & multi-staff',
            'Expenses & cash-out management',
            'AI Agent Tambo → WhatsApp & Telegram reports',
          ],
    },
    {
      key: 'cloud',
      name: 'Cloud',
      icon: <Cloud size={22} />,
      price: 30000,
      type: 'month',
      color: 'from-purple-500 to-indigo-500',
      tag: isFr ? 'Sauvegarde & accès partout' : 'Backup & access anywhere',
      features: isFr
        ? [
            'Synchronisation cloud temps réel',
            'Sauvegarde automatique des données',
            'Accès multi-appareils (tel + PC)',
            'Restauration en cas de perte',
            'Compatible Standard & Pro',
          ]
        : [
            'Real-time cloud sync',
            'Automatic data backup',
            'Multi-device access (phone + PC)',
            'Data restore on device loss',
            'Works with Standard & Pro',
          ],
    },
  ];

  const cardBase = `rounded-3xl border relative flex flex-col transition-all duration-300`;
  const cardLight = `bg-white border-slate-100 shadow-lg shadow-slate-100/80`;
  const cardDark = `bg-white/[0.04] border-white/8`;
  const cardPopLight = `bg-white border-orange-200 shadow-2xl shadow-orange-100/60`;
  const cardPopDark = `bg-[#151b26] border-orange-500/25 shadow-2xl shadow-orange-500/5`;

  return (
    <section id="pricing" className="py-20 md:py-28 overflow-hidden">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel icon={<ShoppingBag size={12} />} label={isFr ? 'Achetez une fois, gardez à vie' : 'Buy once, keep forever'} />
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {isFr ? <>Un achat.<br className="hidden sm:block" /> <span className="text-orange-500">Zéro abonnement.</span></> : <>One purchase.<br className="hidden sm:block" /> <span className="text-orange-500">No subscription.</span></>}
          </h2>
          <p className={`text-base md:text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isFr
              ? 'Payez une seule fois et utilisez le logiciel à vie. Seul le Cloud est en abonnement mensuel optionnel.'
              : 'Pay once and use the software forever. Only Cloud sync is an optional monthly add-on.'}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((p) => {
            const isPopular = !!p.popular;
            return (
              <motion.div
                key={p.key}
                whileHover={{ y: -6 }}
                className={`${cardBase} ${isPopular
                  ? (isDark ? cardPopDark : cardPopLight)
                  : (isDark ? cardDark : cardLight)
                } p-7 sm:p-8`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest whitespace-nowrap">
                    ⭐ {isFr ? 'Le plus complet' : 'Best value'}
                  </div>
                )}

                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white shrink-0`}>
                    {p.icon}
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{p.name}</p>
                    <p className={`text-[11px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{p.tag}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-7">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className={`text-4xl sm:text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {fmt(p.price)}
                    </span>
                    <span className={`text-sm font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      GNF
                    </span>
                  </div>
                  <p className={`mt-1 text-[12px] font-bold flex items-center gap-1.5 ${p.type === 'once' ? 'text-emerald-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {p.type === 'once'
                      ? <><Zap size={12} className="shrink-0" /> {isFr ? 'Achat unique · À vie' : 'One-time · Lifetime'}</>
                      : isFr ? '/ mois · Résiliable à tout moment' : '/ month · Cancel anytime'}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
                        <Check size={10} strokeWidth={4} />
                      </span>
                      <span className={`text-sm font-semibold leading-snug ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href="/velmomobile/index.html#/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm transition-all ${
                    isPopular
                      ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20 hover:scale-[1.02]'
                      : isDark
                        ? 'bg-white/8 text-white border border-white/10 hover:bg-white/12'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isFr ? 'Commencer' : 'Get started'}
                  <ArrowRight size={16} />
                </a>
              </motion.div>
            );
          })}
        </div>

        {/* Note bas */}
        <p className={`text-center mt-10 text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {isFr
            ? '🔒 Paiement sécurisé · Accès immédiat · Aucun renouvellement automatique'
            : '🔒 Secure payment · Instant access · No automatic renewal'}
        </p>
      </div>
    </section>
  );
}
