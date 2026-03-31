import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Lazy-load les pages React restantes
const Landing = React.lazy(() => import('./pages/Landing'));
const JoinShopPage = React.lazy(() => import('./pages/JoinShopPage'));
const SearchResults = React.lazy(() => import('./pages/SearchResults'));

function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#080b10]">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-orange-500/20" />
        <Loader2 className="w-16 h-16 text-orange-500 animate-spin absolute top-0 left-0" />
      </div>
      <p className="mt-4 text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Chargement Velmo...</p>
    </div>
  );
}

/**
 * Redirige vers la page boutique Vanilla (HTML/JS) dans /market/shop.html
 * Gère le slug de la boutique et éventuellement l'ID du produit.
 */
function VanillaShopRedirect() {
  const { slug, productId } = useParams();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    let url = `/market/shop.html?s=${encodeURIComponent(slug)}`;
    if (productId) url += `&p=${encodeURIComponent(productId)}`;
    
    // Transférer les autres paramètres de recherche si présents
    searchParams.forEach((value, key) => {
      if (key !== 's' && key !== 'p') url += `&${key}=${encodeURIComponent(value)}`;
    });
    
    window.location.replace(url);
  }, [slug, productId, searchParams]);

  return <PageLoader />;
}

/**
 * Redirige vers l'index du Market Vanilla pour les commandes/recus
 * Ouvre les modals correspondantes via des query params.
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
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/search" element={<SearchResults />} />
        
        {/* Redirections vers le shop Vanilla */}
        <Route path="/s/:slug/p/:productId" element={<VanillaShopRedirect />} />
        <Route path="/s/:slug" element={<VanillaShopRedirect />} />
        <Route path="/b/:slug/p/:productId" element={<VanillaShopRedirect />} />
        <Route path="/b/:slug" element={<VanillaShopRedirect />} />
        
        {/* Redirections vers le marketplace Vanilla (Suivi/Reçu) */}
        <Route path="/order/:orderId" element={<VanillaMarketRedirect type="track" />} />
        <Route path="/receipt/:orderId" element={<VanillaMarketRedirect type="receipt" />} />
        
        <Route path="/join" element={<JoinShopPage />} />
        
        {/* Catch-all pour les URLs directes type velmo.pro/ma-boutique */}
        <Route path="/:slug/p/:productId" element={<VanillaShopRedirect />} />
        <Route path="/:slug" element={<VanillaShopRedirect />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
}
