import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download, User, Menu, X, Sun, Moon, Globe, Store } from 'lucide-react';
import VelmoLogo from './VelmoLogo';
import AccessMyShop from './AccessMyShop';
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
    if (location.pathname !== '/') {
      navigate('/#' + id);
      return;
    }
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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 velmo-nav ${scrolled
          ? (isDark ? 'bg-[#080b10]/90 backdrop-blur-xl border-b border-white/5 py-2' : 'bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm py-2')
          : 'bg-transparent border-b border-transparent py-4'
        }`}
    >
      <div className="container px-4">
        <div className="flex items-center justify-between h-11">
          {/* ════ LEFT: LOGO ════ */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <VelmoLogo size={scrolled ? 28 : 32} />
            <span className={`text-lg font-black tracking-tight ${scrolled || !isDark ? 'velmo-gradient-text' : 'text-white'}`}>Velmo</span>
          </button>

          {/* ════ CENTER: PILL NAVIGATION ════ */}
          <div className={`hidden lg:flex items-center p-1 rounded-full border transition-all duration-300 shadow-sm ${isDark ? 'bg-white/[0.04] border-white/10 shadow-black/20' : 'bg-gray-100/50 border-gray-200'
            }`}>
            {NAV_LINKS.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`px-5 py-1.5 text-[13px] font-bold rounded-full transition-all ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ════ RIGHT: ACTIONS ════ */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Lang & Theme Pill */}
            <div className={`hidden md:flex items-center p-1 rounded-full border transition-all ${isDark ? 'bg-white/[0.04] border-white/10' : 'bg-gray-100/50 border-gray-200'
              }`}>
              <button
                onClick={toggleLang}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black transition-all ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <Globe size={11} /> {lang.toUpperCase()}
              </button>
              <div className={`w-[1px] h-3 mx-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              <button
                onClick={toggleTheme}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isDark ? 'text-slate-400 hover:text-yellow-400' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            </div>

            {/* Access Link */}
            <button
              onClick={() => navigate('/b/create')}
              className={`hidden md:flex items-center gap-2 px-4 py-2 text-[13px] font-bold transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              <Store size={15} className="text-orange-500" />
              {t.nav.accessMyShop}
            </button>

            {/* Download Button */}
            <button
              onClick={() => scrollTo('download')}
              className={`hidden sm:flex items-center gap-2 px-5 py-2 rounded-full border text-[13px] font-bold transition-all ${isDark
                  ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  : 'bg-gray-100 border-gray-200 text-slate-700 hover:bg-gray-200'
                } shadow-sm`}
            >
              <Download size={14} />
              {t.nav.download}
            </button>

            {/* Create Account (Primary) */}
            <button
              onClick={() => window.open('https://app.velmo.pro', '_blank')}
              className="hidden sm:flex items-center gap-2 px-6 py-2 rounded-full bg-orange-500 text-white text-[13px] font-black shadow-lg shadow-orange-500/20 hover:bg-orange-600 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <User size={14} />
              {t.nav.createAccount}
            </button>

            {/* Hamburger (Mobile) */}
            <button
              className={`lg:hidden p-2 rounded-xl transition-colors ${scrolled || !isDark ? 'text-slate-500 hover:bg-slate-100' : 'text-white hover:bg-white/10'
                }`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* ════ MOBILE MENU ════ */}
      {menuOpen && (
        <div className={`lg:hidden border-t backdrop-blur-2xl ${isDark ? 'bg-[#080b10]/98 border-white/5' : 'bg-white/98 border-gray-100 shadow-2xl'
          } animate-in slide-in-from-right duration-300`}>
          <div className="container py-8 flex flex-col gap-4">
            {NAV_LINKS.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`text-left px-6 py-4 text-lg font-black rounded-2xl transition-colors ${isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                  }`}
              >
                {label}
              </button>
            ))}

            <div className={`mt-4 pt-6 flex flex-col gap-3 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
              <button
                onClick={() => { setMenuOpen(false); navigate('/b/create'); }}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-orange-500 text-white font-black shadow-xl shadow-orange-500/20"
              >
                <User size={18} />
                {t.nav.createAccount}
              </button>
              <button
                onClick={() => { setMenuOpen(false); scrollTo('download'); }}
                className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'
                  }`}
              >
                <Download size={18} />
                {t.nav.download}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
