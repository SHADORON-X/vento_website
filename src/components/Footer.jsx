import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, Facebook, Linkedin, Twitter, Instagram, Shield } from 'lucide-react';
import VelmoLogo from './VelmoLogo';
import { useSite } from '../context/SiteContext';

export default function Footer() {
  const navigate = useNavigate();
  const { t, theme } = useSite();
  const isDark = theme === 'dark';

  const location = useLocation();

  const COLS = [
    {
      title: t.footer.product,
      links: [
        { label: t.footer.links.features, id: 'features' },
        { label: t.footer.links.marketplace, id: 'marketplace' },
        { label: t.footer.links.pricing, id: 'pricing' },
        { label: t.footer.links.download, id: 'download' },
      ],
    },
    {
      title: t.footer.marketplace,
      links: [
        { label: t.footer.links.allShops, href: '/search' },
        { label: t.footer.links.createShop, href: '/velmomobile/index.html' },
        { label: t.footer.links.howToSell, id: 'features' },
      ],
    },
    {
      title: t.footer.support,
      links: [
        { label: t.footer.links.whatsapp, href: 'https://wa.me/224663639000' },
        { label: t.footer.links.guide, href: '/velmomobile/index.html' },
        { label: t.footer.links.contact, href: 'mailto:contact@velmo.org' },
      ],
    },
    {
      title: t.footer.legal,
      links: [
        { label: t.footer.links.terms, href: '/terms' },
        { label: t.footer.links.privacy, href: '/privacy' },
        { label: t.footer.links.legalNotice, href: '/legal' },
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
      if (location.pathname !== '/') {
        navigate('/#' + link.id);
        return;
      }
      const el = document.getElementById(link.id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className={`pt-24 pb-12 relative overflow-hidden ${isDark
      ? 'bg-[#050709] border-t border-white/5'
      : 'bg-white border-t border-slate-100'
      }`}>
      {/* Ambient background glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 mb-6 transition-transform active:scale-95"
            >
              <VelmoLogo size={36} />
              <span className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Velmo
              </span>
            </button>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-xs font-medium">
              {t.footer.tagline}
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { icon: <Globe size={16} />, href: 'https://velmo.org' },
                { icon: <Facebook size={16} />, href: 'https://facebook.com/velmo' },
                { icon: <Linkedin size={16} />, href: 'https://linkedin.com/company/velmo' },
                { icon: <Instagram size={16} />, href: 'https://instagram.com/velmo_hq' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-500 ${isDark
                    ? 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-orange-500/50 hover:bg-orange-500/10'
                    : 'bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-orange-500/50 hover:bg-orange-500/5'
                    }`}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {COLS.map((col) => (
            <div key={col.title} className="col-span-1">
              <h4 className={`font-black text-xs uppercase tracking-[0.2em] mb-6 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                {col.title}
              </h4>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleLink(link)}
                      className={`text-sm font-medium transition-all duration-300 text-left ${isDark
                        ? 'text-slate-500 hover:text-orange-400 hover:translate-x-1'
                        : 'text-slate-500 hover:text-orange-500 hover:translate-x-1'
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

        {/* Bottom Bar */}
        <div className={`pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-6 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="flex flex-col gap-2">
            <p className={`text-xs font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              © {new Date().getFullYear()} Velmo Technology. {t.footer.rights}
            </p>
            <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 border border-current px-2 py-0.5 rounded italic">ORANGE <span className="not-italic">MONEY</span></div>
              <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 border border-current px-2 py-0.5 rounded italic">MOOV <span className="not-italic">MONEY</span></div>
              <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 border border-current px-2 py-0.5 rounded"><Shield size={10} /> SSL SECURE</div>
            </div>
          </div>
          <div className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'
            }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {t.footer.status}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
