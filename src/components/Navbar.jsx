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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? (isDark ? 'bg-black/80 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-white/80 backdrop-blur-2xl border-b border-gray-100 shadow-sm py-3')
        : 'bg-transparent py-6'
        }`}
    >
      <div className="container px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 transition-transform active:scale-95"
          >
            <VelmoLogo size={scrolled ? 30 : 36} />
            <span className={`text-2xl font-black tracking-tighter transition-colors ${scrolled || !isDark ? 'text-slate-900 dark:text-white' : 'text-white'
              }`}>
              Velmo
            </span>
          </button>

          {/* Center Navigation (Pill) */}
          <div className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 backdrop-blur-md shadow-sm">
            {NAV_LINKS.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`px-6 py-2 text-[13px] font-bold rounded-full transition-all ${isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3">
              {/* Lang + Theme Toggle Pill */}
              <div className={`flex items-center gap-2 p-1 rounded-full border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  onClick={toggleLang}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black transition-all ${isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'}`}
                >
                  <Globe size={14} />
                  {lang.toUpperCase()}
                </button>
                <div className={`w-[1px] h-4 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                <button
                  onClick={toggleTheme}
                  className={`p-1.5 rounded-full transition-all ${isDark ? 'text-slate-300 hover:text-yellow-400 hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'}`}
                >
                  {isDark ? <Sun size={14} /> : <Moon size={14} />}
                </button>
              </div>

              {/* Marketplace Button */}
              <button
                onClick={() => window.location.href = '/market/index.html'}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-orange-500 text-white text-[12px] font-black shadow-md shadow-orange-500/25 hover:bg-orange-600 hover:scale-[1.02] active:scale-95 transition-all"
              >
                🛍️ Marketplace
              </button>

              {/* Shop Icon */}
              <button
                onClick={() => navigate('/join')}
                className={`p-2.5 rounded-2xl transition-all ${isDark ? 'bg-white/5 text-orange-500 border border-white/10 hover:bg-white/10' : 'bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100'}`}
              >
                <Store size={18} />
              </button>

              {/* Download Button */}
              <button
                onClick={() => scrollTo('download')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-black transition-all border ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-900'}`}
              >
                <Download size={16} />
                {t.nav.download}
              </button>

              {/* Create Account Button */}
              <button
                onClick={() => window.open('/velmomobile/index.html#/signup', '_blank')}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500 text-white text-[13px] font-black shadow-lg shadow-orange-500/20 hover:bg-orange-600 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <User size={16} />
                {t.nav.createAccount}
              </button>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-slate-900 hover:bg-gray-200'
                }`}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
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

              {/* ── Langue + Thème ── */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${isDark ? 'bg-white/[0.04] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                {/* Langue */}
                <button
                  onClick={toggleLang}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${isDark ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-black/5 hover:text-slate-900'}`}
                >
                  <Globe size={16} />
                  {lang.toUpperCase()}
                </button>

                <div className={`w-[1px] h-5 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

                {/* Thème */}
                <button
                  onClick={toggleTheme}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isDark ? 'text-slate-300 hover:bg-white/10 hover:text-yellow-400' : 'text-slate-600 hover:bg-black/5 hover:text-slate-900'}`}
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  {isDark ? (lang === 'fr' ? 'Clair' : 'Light') : (lang === 'fr' ? 'Sombre' : 'Dark')}
                </button>
              </div>

              {/* ── Marketplace ── */}
              <button
                onClick={() => { setMenuOpen(false); window.location.href = '/market/index.html'; }}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-orange-500 text-white font-black shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
              >
                🛍️ Explorer le Marketplace
              </button>

              {/* ── Accéder à ma boutique ── */}
              <button
                onClick={() => { setMenuOpen(false); navigate('/b/create'); }}
                className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold border transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white' : 'bg-gray-50 border-gray-200 text-slate-700 hover:bg-gray-100'}`}
              >
                <Store size={18} className="text-orange-500" />
                {t.nav.accessMyShop}
              </button>

              {/* ── Télécharger ── */}
              <button
                onClick={() => { setMenuOpen(false); scrollTo('download'); }}
                className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'}`}
              >
                <Download size={18} />
                {t.nav.download}
              </button>

              {/* ── Créer un compte ── */}
              <button
                onClick={() => { setMenuOpen(false); window.open('/velmomobile/index.html#/signup', '_blank'); }}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-orange-500 text-white font-black shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all"
              >
                <User size={18} />
                {t.nav.createAccount}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
