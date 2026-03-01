import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useSite } from '../context/SiteContext';

function FAQItem({ faq, isOpen, onToggle, isDark }) {
  return (
    <div
      className={`border rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
        isOpen
          ? 'border-orange-500/40 bg-orange-500/5'
          : isDark
            ? 'border-white/6 bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.04]'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between p-5 gap-4">
        <span className={`font-semibold text-sm leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {faq.q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            isOpen
              ? 'bg-orange-500 text-white'
              : isDark
                ? 'bg-white/8 text-slate-500'
                : 'bg-gray-100 text-slate-500'
          }`}
        >
          <ChevronDown size={14} />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="px-5 pb-5">
              <p className={`text-sm leading-relaxed border-t pt-4 ${
                isDark
                  ? 'text-slate-400 border-white/6'
                  : 'text-slate-600 border-gray-100'
              }`}>
                {faq.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);
  const { t, theme } = useSite();
  const isDark = theme === 'dark';

  return (
    <section id="faq" className="py-24">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold rounded-full mb-4">
            <HelpCircle size={12} />
            {t.faq.badge}
          </div>
          <h2 className={`text-4xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t.faq.title}
          </h2>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{t.faq.subtitle}</p>
        </div>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {t.faq.items.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              isDark={isDark}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            {t.faq.contactUs}{' '}
            <a
              href="https://wa.me/224000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
            >
              {t.faq.contactLink}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
