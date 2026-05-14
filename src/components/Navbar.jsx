import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Globe, Store } from 'lucide-react';
import VelmoLogo from './VelmoLogo';
import { useSite } from '../context/SiteContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, lang, toggleTheme, toggleLang, t } = useSite();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    if (location.pathname !== '/') { navigate('/#' + id); return; }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const NAV_LINKS = [
    { label: t.nav.features, id: 'features' },
    { label: t.nav.marketplace, id: 'marketplace' },
    { label: t.nav.faq, id: 'faq' },
  ];

  const isDark = theme === 'dark';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? (isDark ? 'bg-black/85 backdrop-blur-xl border-b border-white/5 py-1' : 'bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm py-1')
        : (isDark ? 'bg-transparent py-2' : 'bg-white/60 backdrop-blur-sm py-2')
    }`}>
      <div className="container px-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 transition-transform active:scale-95"
          >
            <VelmoLogo size={24} />
            <span className={`text-base font-black tracking-tighter transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Velmo
            </span>
          </button>

          {/* Centre — liens desktop */}
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-900/8 dark:border-white/8 backdrop-blur-md">
            {NAV_LINKS.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`px-4 py-1.5 text-[12px] font-semibold rounded-full transition-all ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Droite — actions desktop */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">

              {/* Langue + Thème */}
              <div className={`flex items-center gap-1 px-1.5 py-1 rounded-full border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  onClick={toggleLang}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold transition-all ${
                    isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                  }`}
                >
                  <Globe size={12} />
                  {lang.toUpperCase()}
                </button>
                <div className={`w-px h-3 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                <button
                  onClick={toggleTheme}
                  className={`p-1 rounded-full transition-all ${
                    isDark ? 'text-slate-400 hover:text-yellow-400 hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                  }`}
                >
                  {isDark ? <Sun size={13} /> : <Moon size={13} />}
                </button>
              </div>

              {/* Boutique */}
              <button
                onClick={() => window.open('/velmomobile/index.html', '_blank')}
                className={`p-1.5 rounded-xl transition-all ${
                  isDark
                    ? 'bg-white/5 text-orange-400 border border-white/10 hover:bg-white/10'
                    : 'bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100'
                }`}
              >
                <Store size={15} />
              </button>

              {/* Marketplace CTA */}
              <button
                onClick={() => window.location.href = '/market/index.html'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500 text-white text-[12px] font-black shadow-md shadow-orange-500/20 hover:bg-orange-600 active:scale-95 transition-all"
              >
                🛍️ Marketplace
              </button>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`lg:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-slate-900 hover:bg-gray-200'
              }`}
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ MENU MOBILE ═══ */}
      {menuOpen && (
        <div className={`lg:hidden border-t backdrop-blur-2xl ${
          isDark ? 'bg-[#080b10]/98 border-white/5' : 'bg-white/98 border-gray-100 shadow-xl'
        } animate-in slide-in-from-top duration-200`}>
          <div className="container py-4 flex flex-col gap-2">
            {NAV_LINKS.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`text-left px-4 py-3 text-[15px] font-semibold rounded-xl transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}

            <div className={`mt-2 pt-3 flex flex-col gap-2 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
              {/* Langue + Thème */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                isDark ? 'bg-white/[0.04] border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <button
                  onClick={toggleLang}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    isDark ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-black/5'
                  }`}
                >
                  <Globe size={14} /> {lang.toUpperCase()}
                </button>
                <div className={`w-px h-4 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                <button
                  onClick={toggleTheme}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    isDark ? 'text-slate-300 hover:bg-white/10 hover:text-yellow-400' : 'text-slate-600 hover:bg-black/5'
                  }`}
                >
                  {isDark ? <Sun size={14} /> : <Moon size={14} />}
                  {isDark ? (lang === 'fr' ? 'Clair' : 'Light') : (lang === 'fr' ? 'Sombre' : 'Dark')}
                </button>
              </div>

              <button
                onClick={() => { setMenuOpen(false); window.location.href = '/market/index.html'; }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-orange-500 text-white font-black shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
              >
                🛍️ Explorer le Marketplace
              </button>

              <button
                onClick={() => { setMenuOpen(false); window.open('/velmomobile/index.html', '_blank'); }}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold border transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-slate-700 hover:bg-gray-100'
                }`}
              >
                <Store size={16} className="text-orange-500" />
                {t.nav.accessMyShop || 'Ma boutique'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
