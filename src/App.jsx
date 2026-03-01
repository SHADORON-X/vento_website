import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import JoinShopPage from './pages/JoinShopPage';
import ShopPage from './pages/ShopPage';
import OrderPage from './pages/OrderPage';
import SearchResults from './pages/SearchResults';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/b/:slug" element={<ShopPage />} />
      <Route path="/shop/:slug" element={<ShopPage />} />
      <Route path="/join" element={<JoinShopPage />} />
      <Route path="/order/:orderId" element={<OrderPage />} />
      <Route path="/receipt/:orderId" element={<OrderPage />} />
      {/* Catch-all pour les slugs directs type velmo.pro/ma-boutique */}
      <Route path="/:slug" element={<ShopPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
