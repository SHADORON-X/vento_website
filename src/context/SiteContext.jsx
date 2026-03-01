import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('velmo-theme') || 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('velmo-lang') || 'fr');

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('velmo-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('velmo-lang', lang);
  }, [lang]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  const toggleLang = () => setLang(l => (l === 'fr' ? 'en' : 'fr'));

  const t = translations[lang];

  return (
    <SiteContext.Provider value={{ theme, lang, toggleTheme, toggleLang, t }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
}
