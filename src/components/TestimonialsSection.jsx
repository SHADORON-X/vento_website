import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, Award } from 'lucide-react';
import { useSite } from '../context/SiteContext';

function SectionLabel({ icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold rounded-full mb-4 tracking-wide uppercase">
      {icon}{label}
    </div>
  );
}

export default function TestimonialsSection() {
  const { theme, t } = useSite();
  const isDark = theme === 'dark';
  const ts = t.testimonials;

  return (
    <section className="py-24 relative overflow-hidden bg-white/5 dark:bg-white/[0.02]">
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <SectionLabel icon={<Award size={12} />} label={ts.badge} />
          <h2 className={`text-4xl md:text-5xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{ts.title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ts.items.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className={`p-10 rounded-[2.5rem] border relative ${isDark ? 'bg-[#121821] border-white/5 shadow-2xl shadow-black/40' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}
            >
              <div className="text-orange-500 mb-6 flex gap-1">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <p className={`text-lg font-medium italic mb-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                "{item.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-lg">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</h4>
                  <p className="text-orange-500 text-[10px] font-bold uppercase tracking-wider">{item.shop}</p>
                </div>
              </div>
              <div className="absolute top-10 right-10 opacity-[0.05] pointer-events-none">
                <MessageCircle size={80} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
