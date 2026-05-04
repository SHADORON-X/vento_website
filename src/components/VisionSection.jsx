import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Store, CreditCard, Users, BarChart2, Zap } from 'lucide-react';
import { useSite } from '../context/SiteContext';

function SectionLabel({ icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold rounded-full mb-4 tracking-wide uppercase">
      {icon}{label}
    </div>
  );
}

export default function VisionSection() {
  const { theme, t } = useSite();
  const isDark = theme === 'dark';
  const v = t.vision;

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 70% 50%, rgba(249,115,22,0.08), transparent)' }} />
      <div className="container relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionLabel icon={<TrendingUp size={12} />} label={v.badge} />
            <h2 className={`text-4xl md:text-6xl font-black mb-6 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {v.title}
            </h2>
            <p className="text-slate-500 text-xl font-medium mb-12 leading-relaxed">
              {v.subtitle}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {v.items.map((item, i) => (
                <div key={i} className="group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-8 bg-orange-500 rounded-full group-hover:h-10 transition-all" />
                    <h3 className={`font-black uppercase tracking-widest text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                  </div>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-orange-500 to-purple-600 p-1">
              <div className={`w-full h-full rounded-[2.9rem] overflow-hidden flex items-center justify-center ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
                <div className="relative w-full h-full p-12 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-4 rounded-3xl bg-orange-500 text-white shadow-xl shadow-orange-500/20"><Store size={32} /></div>
                    <div className="p-4 rounded-3xl bg-blue-500 text-white shadow-xl shadow-blue-500/20"><CreditCard size={32} /></div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-48 h-48 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center animate-spin-slow">
                      <div className="p-6 rounded-full bg-white text-orange-500 shadow-2xl shadow-white/10"><Zap size={40} /></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="p-4 rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20"><Users size={32} /></div>
                    <div className="p-4 rounded-3xl bg-purple-500 text-white shadow-xl shadow-purple-500/20"><BarChart2 size={32} /></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -inset-10 bg-orange-500/20 blur-[100px] -z-10 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
