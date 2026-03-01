import React from 'react';
import { useNavigate } from 'react-router-dom';
import VelmoLogo from './VelmoLogo';
import { useSite } from '../context/SiteContext';

export default function Footer() {
  const navigate = useNavigate();
  const { t, theme } = useSite();
  const isDark = theme === 'dark';

  const COLS = [
    {
      title: t.footer.product,
      links: [
        { label: t.footer.links.features, id: 'features' },
        { label: t.footer.links.marketplace, id: 'marketplace' },
        { label: t.footer.links.pricing, id: 'download' },
        { label: t.footer.links.download, id: 'download' },
      ],
    },
    {
      title: t.footer.marketplace,
      links: [
        { label: t.footer.links.allShops, href: '/search' },
        { label: t.footer.links.createShop, href: 'https://app.velmo.pro' },
        { label: t.footer.links.howToSell, id: 'features' },
      ],
    },
    {
      title: t.footer.support,
      links: [
        { label: t.footer.links.whatsapp, href: 'https://wa.me/224000000000' },
        { label: t.footer.links.guide, href: '#' },
        { label: t.footer.links.contact, href: 'mailto:hello@velmo.pro' },
      ],
    },
    {
      title: t.footer.legal,
      links: [
        { label: t.footer.links.terms, href: '#' },
        { label: t.footer.links.privacy, href: '#' },
        { label: t.footer.links.legalNotice, href: '#' },
      ],
    },
  ];

  const handleLink = (link) => {
    if (link.href) {
      if (link.href.startsWith('http') || link.href.startsWith('mailto')) {
        window.open(link.href, '_blank', 'noopener noreferrer');
      } else {
        navigate(link.href);
      }
    } else if (link.id) {
      const el = document.getElementById(link.id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className={`pt-16 pb-8 ${
      isDark
        ? 'border-t border-white/6 bg-[#050709]'
        : 'border-t border-gray-200 bg-gray-50'
    }`}>
      <div className="container">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <VelmoLogo size={32} />
              <span className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Velmo
              </span>
            </div>
            <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {t.footer.tagline}
            </p>
            {/* Social icons */}
            <div className="flex gap-2">
              {[
                { icon: '𝕏', href: '#' },
                { icon: 'in', href: '#' },
                { icon: 'f', href: '#' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    isDark
                      ? 'bg-white/5 border border-white/8 text-slate-500 hover:text-white hover:border-white/20'
                      : 'bg-black/5 border border-black/10 text-slate-500 hover:text-slate-900 hover:border-black/20'
                  }`}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className={`font-semibold text-sm mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleLink(link)}
                      className={`text-sm transition-colors text-left ${
                        isDark
                          ? 'text-slate-500 hover:text-slate-300'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className={`border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDark ? 'border-white/6' : 'border-gray-200'
        }`}>
          <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            {t.footer.rights}
          </p>
          <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t.footer.status}
          </div>
        </div>
      </div>
    </footer>
  );
}
