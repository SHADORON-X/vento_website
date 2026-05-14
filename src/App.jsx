import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import { useSite } from './context/SiteContext';

// Lazy-load les pages React restantes
const Landing = React.lazy(() => import('./pages/Landing'));
const JoinShopPage = React.lazy(() => import('./pages/JoinShopPage'));
const SearchResults = React.lazy(() => import('./pages/SearchResults'));
const TelegramDashboard = React.lazy(() => import('./pages/TelegramDashboard'));


function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center bg-[#080b10] animate-in fade-in duration-500">
      <div className="instant-loader">
        <div className="w-16 h-16 rounded-full border-[3px] border-orange-500/10 border-t-orange-500 animate-spin" />
        <p className="mt-6 text-orange-500 font-black uppercase tracking-[0.2em] text-[10px]">Démarrage Velmo...</p>
      </div>
    </div>
  );
}

/**
 * Redirige vers la page boutique Vanilla (HTML/JS) dans /market/shop.html
 */
function VanillaShopRedirect() {
  const { slug, productId } = useParams();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const s = slug || searchParams.get('s');
    if (!s) { window.location.replace('/'); return; }

    let url = `/market/shop.html?s=${encodeURIComponent(s)}`;
    if (productId) url += `&p=${encodeURIComponent(productId)}`;
    
    searchParams.forEach((value, key) => {
      if (key !== 's' && key !== 'p') url += `&${key}=${encodeURIComponent(value)}`;
    });
    
    // Ajout d'un flag pour éviter les boucles
    window.location.replace(url);
  }, [slug, productId, searchParams]);

  return <PageLoader />;
}

/**
 * Redirige vers l'index du Market Vanilla pour les commandes/recus
 */
function VanillaMarketRedirect({ type }) {
  const { orderId } = useParams();
  useEffect(() => {
    let url = '/market/index.html';
    if (orderId) url += `?${type}=${encodeURIComponent(orderId)}`;
    window.location.replace(url);
  }, [orderId, type]);
  return <PageLoader />;
}

export default function App() {
  const { theme } = useSite();
  const isDark = theme === 'dark';
  return (
    <div className={isDark ? 'bg-[#080b10]' : 'bg-[#f8fafc]'}>
      <Navbar />
      <React.Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/search" element={<SearchResults />} />
          
          {/* Redirections instantanées vers le shop Vanilla */}
          <Route path="/s/:slug/p/:productId" element={<VanillaShopRedirect />} />
          <Route path="/s/:slug" element={<VanillaShopRedirect />} />
          <Route path="/b/:slug/p/:productId" element={<VanillaShopRedirect />} />
          <Route path="/b/:slug" element={<VanillaShopRedirect />} />
          
          {/* Marketplace Vanilla (Suivi/Reçu) */}
          <Route path="/order/:orderId" element={<VanillaMarketRedirect type="track" />} />
          <Route path="/receipt/:orderId" element={<VanillaMarketRedirect type="receipt" />} />
          
          <Route path="/join" element={<JoinShopPage />} />
          <Route path="/tambo" element={<TelegramDashboard />} />

          {/* Catch-all pour les URLs directes */}
          <Route path="/:slug/p/:productId" element={<VanillaShopRedirect />} />
          <Route path="/:slug" element={<VanillaShopRedirect />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </div>
  );
}
