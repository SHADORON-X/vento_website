import React from 'react';
import { Shield, X } from 'lucide-react';
import { useSite } from '../context/SiteContext';

function SectionLabel({ icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold rounded-full mb-4 tracking-wide uppercase">
      {icon}{label}
    </div>
  );
}

export default function ProblemSection() {
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
