import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Landing = React.lazy(() => import('./pages/Landing'));
const JoinShopPage = React.lazy(() => import('./pages/JoinShopPage'));
const ShopPage = React.lazy(() => import('./pages/ShopPage'));
const OrderPage = React.lazy(() => import('./pages/OrderPage'));
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

export default function App() {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/s/:slug/p/:productId" element={<ShopPage />} />
        <Route path="/s/:slug" element={<ShopPage />} />
        <Route path="/b/:slug/p/:productId" element={<ShopPage />} />
        <Route path="/b/:slug" element={<ShopPage />} />
        <Route path="/join" element={<JoinShopPage />} />
        <Route path="/order/:orderId" element={<OrderPage />} />
        <Route path="/receipt/:orderId" element={<OrderPage />} />
        {/* Catch-all pour les slugs directs type velmo.pro/ma-boutique */}
        <Route path="/:slug/p/:productId" element={<ShopPage />} />
        <Route path="/:slug" element={<ShopPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
}
