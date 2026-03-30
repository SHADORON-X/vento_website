/**
 * ============================================================
 * VELMO ONLINE — Storefront Public Féminin
 * Pour les vendeuses de mode Facebook & WhatsApp
 * Palette: Rose #E91E8C · Blanc #FAFAFA · Or #C9A84C · Vert #2ECC71
 * ============================================================
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, type Shop, type Product } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Heart, Share2, MessageCircle, Search, ShoppingBag,
  ChevronLeft, ChevronRight, X, Check, Minus, Plus,
  Star, MapPin, Clock, Phone, Instagram, Facebook,
  Package, ArrowRight, Sparkles, BadgeCheck, Zap
} from 'lucide-react';

// ============================================================
// 🎨 STYLES INLINE — Palette Rose Velmo Online
// ============================================================

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.vo-root {
  font-family: 'Poppins', sans-serif;
  background: #FAFAFA;
  min-height: 100vh;
  min-height: 100dvh;
  color: #1a1a2e;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior-y: none;
}

/* ── NAV ── */
.vo-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(233,30,140,0.1);
  padding: 0 16px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.vo-nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.vo-nav-logo {
  width: 36px; height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #E91E8C;
}
.vo-nav-logo-placeholder {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E91E8C, #ff6eb4);
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 700; font-size: 14px;
}
.vo-nav-name {
  font-weight: 700;
  font-size: 15px;
  color: #1a1a2e;
}
.vo-nav-verified {
  color: #E91E8C;
  width: 16px; height: 16px;
}
.vo-nav-actions {
  display: flex; align-items: center; gap: 8px;
}
.vo-nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.vo-nav-btn:hover { background: rgba(233,30,140,0.08); color: #E91E8C; }

/* ── HERO / COVER ── */
.vo-hero {
  position: relative;
  height: 180px;
  background: linear-gradient(135deg, #E91E8C 0%, #ff6eb4 50%, #C9A84C 100%);
  overflow: hidden;
}
@media (min-width: 640px) { .vo-hero { height: 240px; } }
@media (min-width: 1024px) { .vo-hero { height: 300px; } }
.vo-hero-img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.vo-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4));
}
.vo-promo-banner {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: #E91E8C;
  color: white;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  letter-spacing: 0.5px;
}

/* ── PROFIL ── */
.vo-profile {
  background: white;
  padding: 12px 16px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border-bottom: 1px solid #f0f0f5;
}
.vo-profile-avatar {
  width: 70px; height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #E91E8C;
  margin-top: -35px;
  flex-shrink: 0;
  background: white;
}
.vo-profile-avatar-placeholder {
  width: 70px; height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E91E8C, #ff6eb4);
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 800; font-size: 24px;
  margin-top: -35px;
  flex-shrink: 0;
  border: 3px solid white;
}
.vo-profile-info { flex: 1; min-width: 0; }
.vo-profile-name {
  font-weight: 700; font-size: 18px;
  color: #1a1a2e;
  display: flex; align-items: center; gap: 6px;
}
.vo-profile-desc {
  font-size: 13px; color: #666;
  margin-top: 4px;
  line-height: 1.4;
}
.vo-profile-meta {
  display: flex; flex-wrap: wrap; gap: 10px;
  margin-top: 8px;
}
.vo-profile-meta-item {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; color: #888;
}
.vo-badge-verified {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(233,30,140,0.1);
  color: #E91E8C;
  font-size: 11px; font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
}
.vo-socials {
  display: flex; gap: 8px; margin-top: 10px;
}
.vo-social-btn {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1px solid #eee;
  background: white;
  display: flex; align-items: center; justify-content: center;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}
.vo-social-btn:hover { border-color: #E91E8C; color: #E91E8C; }

/* ── SEARCH ── */
.vo-search-wrap {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #f0f0f5;
}
.vo-search-box {
  display: flex; align-items: center; gap: 10px;
  background: #f7f7fb;
  border: 1.5px solid transparent;
  border-radius: 24px;
  padding: 10px 16px;
  transition: border 0.2s;
}
.vo-search-box:focus-within {
  border-color: #E91E8C;
  background: white;
}
.vo-search-box input {
  flex: 1; border: none; background: none;
  font-family: 'Poppins', sans-serif;
  font-size: 14px; color: #1a1a2e;
  outline: none;
}
.vo-search-box input::placeholder { color: #aaa; }

/* ── CATEGORIES ── */
.vo-cats {
  padding: 12px 16px;
  overflow-x: auto;
  display: flex; gap: 8px;
  background: white;
  border-bottom: 1px solid #f0f0f5;
  scrollbar-width: none;
}
.vo-cats::-webkit-scrollbar { display: none; }
.vo-cat-chip {
  white-space: nowrap;
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 13px; font-weight: 500;
  border: 1.5px solid #eee;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Poppins', sans-serif;
  color: #555;
}
.vo-cat-chip.active {
  background: #E91E8C;
  border-color: #E91E8C;
  color: white;
  box-shadow: 0 4px 12px rgba(233,30,140,0.3);
}
.vo-cat-chip:hover:not(.active) {
  border-color: #E91E8C;
  color: #E91E8C;
}

/* ── GRID ── */
.vo-grid-wrap {
  padding: 12px 14px;
  /* espace pour la barre de navigation mobile en bas */
  padding-bottom: max(80px, calc(60px + env(safe-area-inset-bottom)));
}
@media (min-width: 640px) { .vo-grid-wrap { padding: 20px; } }
.vo-grid-title {
  font-size: 11px; font-weight: 600;
  color: #aaa; text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
}
.vo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
@media (min-width: 480px) {
  .vo-grid { gap: 12px; }
}
@media (min-width: 640px) {
  .vo-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
}
@media (min-width: 1024px) {
  .vo-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
}

/* ── PRODUCT CARD ── */
.vo-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  position: relative;
  /* Cible tactile minimum 44px */
  min-height: 44px;
}
@media (hover:hover) {
  .vo-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(233,30,140,0.15);
  }
}
.vo-card:active { transform: scale(0.98); }
.vo-card-img {
  position: relative;
  width: 100%;
  padding-bottom: 115%;
  overflow: hidden;
  background: #f5f5f8;
}
.vo-card-img img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
@media (hover:hover) {
  .vo-card:hover .vo-card-img img { transform: scale(1.05); }
}
.vo-card-img-placeholder {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #fce4f3, #fff0e6);
}
.vo-card-badges {
  position: absolute; top: 8px; left: 8px;
  display: flex; flex-direction: column; gap: 3px;
}
.vo-badge {
  font-size: 9px; font-weight: 700;
  padding: 2px 7px; border-radius: 8px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.vo-badge.new { background: #C9A84C; color: white; }
.vo-badge.hot { background: #E91E8C; color: white; }
.vo-badge.promo { background: #2ECC71; color: white; }
.vo-badge.low { background: #ff6b35; color: white; }
.vo-card-fav {
  position: absolute; top: 8px; right: 8px;
  width: 34px; height: 34px;
  background: rgba(255,255,255,0.92);
  border: none; border-radius: 50%;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #ccc;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.vo-card-fav.active, .vo-card-fav:active { color: #E91E8C; }
.vo-card-body { padding: 10px 12px 12px; }
.vo-card-cat {
  font-size: 9px; color: #E91E8C;
  font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px; margin-bottom: 3px;
}
.vo-card-name {
  font-size: 12px; font-weight: 600;
  color: #1a1a2e; line-height: 1.35;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@media (min-width: 640px) { .vo-card-name { font-size: 13px; } }
.vo-card-price-row {
  display: flex; align-items: baseline; gap: 4px; flex-wrap: wrap;
}
.vo-card-price {
  font-size: 14px; font-weight: 700;
  color: #E91E8C;
}
@media (min-width: 640px) { .vo-card-price { font-size: 15px; } }
.vo-card-price-old {
  font-size: 10px; color: #bbb;
  text-decoration: line-through;
}
.vo-card-stock {
  font-size: 9px; color: #ff6b35;
  font-weight: 600; width: 100%;
  margin-top: 2px;
}

/* ── EMPTY STATE ── */
.vo-empty {
  text-align: center;
  padding: 60px 20px;
  color: #aaa;
}
.vo-empty p { margin-top: 12px; font-size: 14px; }

/* ── PRODUCT DETAIL (Full Screen) ── */
.vo-detail-overlay {
  position: fixed; inset: 0;
  background: #FAFAFA;
  z-index: 200;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.vo-detail-close {
  position: fixed;
  top: max(12px, env(safe-area-inset-top, 12px)); left: 12px;
  z-index: 201;
  background: rgba(255,255,255,0.9);
  border: none; border-radius: 50%;
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  color: #1a1a2e;
}
.vo-detail-share {
  position: fixed;
  top: max(12px, env(safe-area-inset-top, 12px)); right: 12px;
  z-index: 201;
  background: rgba(255,255,255,0.9);
  border: none; border-radius: 50%;
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  color: #1a1a2e;
}

/* Carousel */
.vo-carousel {
  position: relative;
  width: 100%;
  height: 60vw;
  max-height: 420px;
  min-height: 200px;
  overflow: hidden;
  background: #f5f5f8;
}
@media (min-width: 480px) { .vo-carousel { min-height: 260px; } }
@media (min-width: 768px) { .vo-carousel { min-height: 320px; } }
.vo-carousel img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.vo-carousel-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #fce4f3, #fff0e6);
  font-size: 80px;
}
.vo-carousel-prev, .vo-carousel-next {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.85);
  border: none; border-radius: 50%;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  color: #1a1a2e;
  z-index: 2;
}
.vo-carousel-prev { left: 12px; }
.vo-carousel-next { right: 12px; }
.vo-carousel-dots {
  position: absolute; bottom: 12px; left: 0; right: 0;
  display: flex; justify-content: center; gap: 6px;
}
.vo-carousel-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,0.5);
  transition: all 0.2s;
}
.vo-carousel-dot.active {
  background: white;
  width: 18px; border-radius: 3px;
}
.vo-thumbs {
  display: flex; gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  scrollbar-width: none;
  background: white;
}
.vo-thumbs::-webkit-scrollbar { display: none; }
.vo-thumb {
  width: 56px; height: 56px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border 0.2s;
}
.vo-thumb.active { border-color: #E91E8C; }
.vo-thumb img { width: 100%; height: 100%; object-fit: cover; }

/* Detail Body */
.vo-detail-body {
  background: white;
  border-radius: 28px 28px 0 0;
  margin-top: -24px;
  padding: 24px 16px;
  padding-bottom: max(40px, calc(24px + env(safe-area-inset-bottom)));
  min-height: 50vh;
  position: relative;
}
.vo-detail-cat {
  font-size: 11px; font-weight: 600;
  color: #E91E8C; text-transform: uppercase;
  letter-spacing: 1px;
}
.vo-detail-name {
  font-size: 22px; font-weight: 700;
  color: #1a1a2e; margin-top: 4px;
  line-height: 1.2;
}
.vo-detail-price-row {
  display: flex; align-items: center; gap: 10px;
  margin-top: 10px;
}
.vo-detail-price {
  font-size: 26px; font-weight: 800;
  color: #E91E8C;
}
.vo-detail-price-old {
  font-size: 16px; color: #bbb;
  text-decoration: line-through;
}
.vo-detail-stock-low {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(255,107,53,0.1);
  color: #ff6b35; font-size: 12px; font-weight: 600;
  padding: 4px 10px; border-radius: 12px;
  margin-top: 8px;
}

/* Variants */
.vo-variant-section { margin-top: 20px; }
.vo-variant-label {
  font-size: 13px; font-weight: 600; color: #444;
  margin-bottom: 10px;
}
.vo-color-row {
  display: flex; gap: 10px; flex-wrap: wrap;
}
.vo-color-swatch {
  position: relative;
  width: 42px; height: 42px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
  overflow: hidden;
}
.vo-color-swatch.active {
  border-color: #E91E8C;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #E91E8C;
}
.vo-color-swatch img {
  width: 100%; height: 100%; object-fit: cover;
}
.vo-color-swatch-fill {
  width: 100%; height: 100%; border-radius: 50%;
}
.vo-color-name {
  font-size: 10px; text-align: center;
  color: #666; margin-top: 4px;
  max-width: 42px;
}
.vo-size-row {
  display: flex; gap: 8px; flex-wrap: wrap;
}
.vo-size-btn {
  min-width: 44px;
  padding: 8px 14px;
  border-radius: 12px;
  border: 1.5px solid #eee;
  background: white;
  font-family: 'Poppins', sans-serif;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #444;
}
.vo-size-btn.active {
  background: #E91E8C;
  border-color: #E91E8C;
  color: white;
}
.vo-size-btn:hover:not(.active) {
  border-color: #E91E8C; color: #E91E8C;
}
.vo-detail-desc {
  margin-top: 16px;
  font-size: 13px; color: #666;
  line-height: 1.6;
}

/* Commander button */
.vo-order-btn {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%;
  background: linear-gradient(135deg, #E91E8C, #d4197f);
  color: white;
  border: none; border-radius: 20px;
  padding: 18px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px; font-weight: 700;
  cursor: pointer;
  margin-top: 24px;
  box-shadow: 0 8px 24px rgba(233,30,140,0.35);
  transition: all 0.2s;
}
.vo-order-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(233,30,140,0.45);
}
.vo-order-btn:active { transform: translateY(0); }

.vo-wa-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%;
  background: white;
  color: #25D366;
  border: 2px solid #25D366;
  border-radius: 20px;
  padding: 14px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px; font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s;
}
.vo-wa-btn:hover { background: #25D366; color: white; }

/* ── BOTTOM SHEET ORDER FORM ── */
.vo-sheet-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 300;
  display: flex; align-items: flex-end;
}
.vo-sheet {
  background: white;
  border-radius: 28px 28px 0 0;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 0 0 max(16px, env(safe-area-inset-bottom, 16px));
}
.vo-sheet-handle {
  width: 40px; height: 4px;
  background: #ddd; border-radius: 2px;
  margin: 12px auto 0;
}
.vo-sheet-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f0f0f5;
}
.vo-sheet-title {
  font-size: 17px; font-weight: 700;
  color: #1a1a2e;
}
.vo-sheet-subtitle {
  font-size: 12px; color: #888;
  margin-top: 2px;
}
.vo-sheet-product-preview {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 20px;
  background: #fff8fc;
  border-bottom: 1px solid #fce4f3;
}
.vo-sheet-product-img {
  width: 52px; height: 52px;
  border-radius: 14px; object-fit: cover;
  flex-shrink: 0;
  background: #f5f5f8;
}
.vo-sheet-product-name {
  font-size: 14px; font-weight: 600; color: #1a1a2e;
}
.vo-sheet-product-price {
  font-size: 16px; font-weight: 700; color: #E91E8C;
}
.vo-sheet-product-variants {
  font-size: 11px; color: #888;
  margin-top: 2px;
}
.vo-sheet-body { padding: 16px 20px; }
.vo-field { margin-bottom: 14px; }
.vo-label {
  font-size: 12px; font-weight: 600;
  color: #444; margin-bottom: 6px;
  display: block;
}
.vo-input {
  width: 100%; padding: 13px 14px;
  border: 1.5px solid #e8e8f0;
  border-radius: 16px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px; color: #1a1a2e;
  outline: none;
  transition: border 0.2s;
  box-sizing: border-box;
}
.vo-input:focus { border-color: #E91E8C; }
.vo-qty-row {
  display: flex; align-items: center; gap: 0;
  border: 1.5px solid #e8e8f0;
  border-radius: 16px; overflow: hidden;
  width: fit-content;
}
.vo-qty-btn {
  width: 44px; height: 44px;
  border: none; background: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #E91E8C; font-size: 20px;
  transition: background 0.2s;
}
.vo-qty-btn:hover { background: #fff0f8; }
.vo-qty-val {
  min-width: 44px; text-align: center;
  font-weight: 700; font-size: 16px; color: #1a1a2e;
}
.vo-submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #E91E8C, #d4197f);
  color: white; border: none;
  border-radius: 20px; padding: 18px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px; font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  box-shadow: 0 8px 24px rgba(233,30,140,0.35);
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.vo-submit-btn:hover { opacity: 0.92; }
.vo-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── SUCCESS SCREEN ── */
.vo-success {
  position: fixed; inset: 0;
  background: white;
  z-index: 400;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 40px 24px;
  text-align: center;
}
.vo-success-icon {
  width: 80px; height: 80px;
  background: linear-gradient(135deg, #2ECC71, #27ae60);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
}
.vo-success-title {
  font-size: 24px; font-weight: 800;
  color: #1a1a2e; margin-bottom: 8px;
}
.vo-success-text {
  font-size: 14px; color: #666;
  line-height: 1.6; margin-bottom: 24px;
}
.vo-success-ref {
  background: #fff8fc;
  border: 2px dashed #E91E8C;
  border-radius: 16px; padding: 16px 24px;
  margin-bottom: 24px;
}
.vo-success-ref-label {
  font-size: 11px; color: #E91E8C; font-weight: 600;
  text-transform: uppercase; letter-spacing: 1px;
}
.vo-success-ref-val {
  font-size: 22px; font-weight: 800;
  color: #1a1a2e; margin-top: 4px;
  letter-spacing: 2px;
}
.vo-success-back {
  background: linear-gradient(135deg, #E91E8C, #d4197f);
  color: white; border: none;
  border-radius: 20px; padding: 16px 32px;
  font-family: 'Poppins', sans-serif;
  font-size: 15px; font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(233,30,140,0.3);
}

/* ── LIVE ACTIVITY ── */
.vo-live-activity {
  position: fixed;
  bottom: max(100px, calc(80px + env(safe-area-inset-bottom))); left: 16px;
  background: white;
  border-radius: 16px;
  padding: 10px 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  display: flex; align-items: center; gap: 8px;
  z-index: 50;
  max-width: calc(100vw - 32px);
}
.vo-live-dot {
  width: 8px; height: 8px;
  border-radius: 50%; background: #2ECC71;
  flex-shrink: 0;
  box-shadow: 0 0 6px #2ECC71;
}
.vo-live-text {
  font-size: 11px; color: #444;
  line-height: 1.3;
}

/* ── FOOTER ── */
.vo-footer {
  text-align: center;
  padding: 32px 20px;
  color: #aaa;
  font-size: 12px;
  border-top: 1px solid #f0f0f5;
  margin-top: 20px;
}
.vo-footer a {
  color: #E91E8C; font-weight: 600;
  text-decoration: none;
}

/* ── LOADING ── */
.vo-loading {
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 16px; background: #FAFAFA;
  font-family: 'Poppins', sans-serif;
}
.vo-loading-spinner {
  width: 48px; height: 48px;
  border: 3px solid rgba(233,30,140,0.15);
  border-top-color: #E91E8C;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.vo-loading-text {
  font-size: 14px; font-weight: 500; color: #888;
}

/* ── ERROR ── */
.vo-error {
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px; background: #FAFAFA;
  font-family: 'Poppins', sans-serif;
  text-align: center; padding: 24px;
}
.vo-error h1 { font-size: 20px; font-weight: 700; color: #1a1a2e; }
.vo-error p { font-size: 14px; color: #888; }
.vo-error a {
  background: #E91E8C; color: white;
  padding: 12px 24px; border-radius: 16px;
  text-decoration: none; font-weight: 600;
  margin-top: 8px;
}

/* ── UTIL ── */
.vo-divider {
  height: 8px; background: #f5f5f8;
  margin: 0 -16px;
}
`;

// ============================================================
// 🛠️ HELPERS
// ============================================================

function formatPrice(n: number, currency?: string): string {
  const cur = currency || 'GNF';
  // Devises sans décimales
  const noDecimals = ['GNF', 'XOF', 'XAF', 'CLP', 'JPY', 'KRW'];
  const opts: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: cur,
    minimumFractionDigits: noDecimals.includes(cur) ? 0 : 0,
    maximumFractionDigits: noDecimals.includes(cur) ? 0 : 2,
  };
  try {
    return new Intl.NumberFormat('fr-FR', opts).format(n);
  } catch {
    return new Intl.NumberFormat('fr-FR').format(n) + ' ' + cur;
  }
}

function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  return `${supabaseUrl}/storage/v1/object/public/products/${url}`;
}

function getShopImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  return `${supabaseUrl}/storage/v1/object/public/shops/${url}`;
}

function getProductImages(product: Product): string[] {
  const urls: string[] = [];
  if (product.image_urls && product.image_urls.length > 0) {
    product.image_urls.forEach(u => { const r = getImageUrl(u); if (r) urls.push(r); });
  } else if (product.photo_url) {
    const r = getImageUrl(product.photo_url);
    if (r) urls.push(r);
  }
  return urls;
}

// ============================================================
// 🧩 TYPES LOCAUX
// ============================================================

interface OrderForm {
  name: string;
  phone: string;
  address: string;
  message: string;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

// ============================================================
// 📦 COMPOSANT PRINCIPAL
// ============================================================

export default function VelmoOnlinePage() {
  const { slug, productId: routeProductId } = useParams<{ slug: string; productId?: string }>();

  // ── Data ──
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // ── UI ──
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('vo_favorites') || '[]'); } catch { return []; }
  });
  const [liveActivity, setLiveActivity] = useState<string | null>(null);

  // ── Product Detail ──
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // ── Order Form (Bottom Sheet) ──
  const [orderSheet, setOrderSheet] = useState(false);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    name: '',
    phone: '',
    address: '',
    message: '',
    quantity: 1,
    selectedColor: '',
    selectedSize: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [successProduct, setSuccessProduct] = useState<Product | null>(null);
  const [refCopied, setRefCopied] = useState(false);

  // ── Scroll lock ──
  useEffect(() => {
    if (selectedProduct || orderSheet) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedProduct, orderSheet]);

  // ── Persist favorites ──
  useEffect(() => {
    localStorage.setItem('vo_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // ── Load shop data ──
  useEffect(() => {
    if (slug) loadShop();
  }, [slug]);

  const loadShop = async () => {
    try {
      setLoading(true);
      const { data: shopData, error } = await supabase
        .from('shops')
        .select('*')
        .eq('slug', slug!.toLowerCase())
        .eq('is_public', true)
        .maybeSingle();

      if (error || !shopData) throw new Error('Boutique introuvable');
      setShop(shopData);

      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopData.id)
        .eq('is_active', true)
        .order('name');

      setProducts(prods || []);
    } catch {
      setShop(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Open product from URL param ──
  useEffect(() => {
    if (routeProductId && products.length > 0) {
      const p = products.find(x => x.id === routeProductId);
      if (p) openProduct(p);
    }
  }, [routeProductId, products]);

  // ── Realtime: Products ──
  useEffect(() => {
    if (!shop?.id) return;
    const ch = supabase.channel(`vo-products-${shop.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `shop_id=eq.${shop.id}` }, (payload) => {
        if (payload.eventType === 'INSERT' && (payload.new as Product).is_active) {
          setProducts(prev => [...prev, payload.new as Product]);
        } else if (payload.eventType === 'UPDATE') {
          const p = payload.new as Product;
          setProducts(prev => p.is_active
            ? prev.map(x => x.id === p.id ? p : x)
            : prev.filter(x => x.id !== p.id));
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(x => x.id !== payload.old.id));
        }
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [shop?.id]);

  // ── Live activity ──
  useEffect(() => {
    if (!shop || loading || products.length === 0) return;
    const NAMES = ['Aminata', 'Fatoumata', 'Mariama', 'Aïssatou', 'Kadiatou', 'Bintou', 'Safiatou'];
    const CITIES = ['Conakry', 'Bamako', 'Dakar', 'Abidjan', 'Lomé'];
    const ACTIONS = ['vient de commander', 'regarde en ce moment', 'a ajouté au panier'];
    const timer = setInterval(() => {
      if (Math.random() > 0.65) {
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        const prod = products[Math.floor(Math.random() * products.length)];
        setLiveActivity(`${name} (${city}) ${action} ${prod.name}`);
        setTimeout(() => setLiveActivity(null), 5000);
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [shop, loading, products]);

  // ── Categories ──
  const categories = useMemo(() => {
    const cats = ['Tout', ...Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[]))];
    return cats;
  }, [products]);

  // ── Filtered products ──
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'Tout' || p.category === selectedCategory;
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // ── Helpers ──
  const openProduct = (p: Product) => {
    setSelectedProduct(p);
    setCarouselIdx(0);
    const variants = p.variants_json;
    setSelectedColor(variants?.colors?.[0]?.name || '');
    setSelectedSize(variants?.sizes?.[0] || '');
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const openOrderSheet = (p: Product) => {
    setOrderProduct(p);
    const variants = p.variants_json;
    setOrderForm({
      name: '',
      phone: '',
      address: '',
      message: '',
      quantity: 1,
      selectedColor: variants?.colors?.[0]?.name || '',
      selectedSize: variants?.sizes?.[0] || '',
    });
    setOrderError(null);
    setOrderSheet(true);
  };

  const handleOrder = async () => {
    if (!orderProduct || !shop) return;
    if (!orderForm.name.trim() || !orderForm.phone.trim()) return;

    setSubmitting(true);
    setOrderError(null);
    try {
      const ref = 'VEL-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      const itemVariant = [orderForm.selectedColor, orderForm.selectedSize].filter(Boolean).join(' / ');
      const itemsJson = JSON.stringify([{
        id: orderProduct.id,
        name: orderProduct.name + (itemVariant ? ` (${itemVariant})` : ''),
        price: orderProduct.price_sale,
        quantity: orderForm.quantity,
        photo_url: orderProduct.photo_url || null,
      }]);
      // Construire les notes avec la référence incluse pour retrouvabilité
      const noteParts = [`Réf: ${ref}`];
      if (itemVariant) noteParts.push(itemVariant);
      if (orderForm.address.trim()) noteParts.push(`Adresse: ${orderForm.address.trim()}`);
      if (orderForm.message.trim()) noteParts.push(orderForm.message.trim());

      const { data: rpcRes, error } = await supabase.rpc('place_customer_order', {
        p_shop_id: shop.id,
        p_customer_name: orderForm.name.trim(),
        p_customer_phone: orderForm.phone.trim(),
        p_total_amount: (orderProduct.price_sale || 0) * orderForm.quantity,
        p_items_json: itemsJson,
        p_notes: noteParts.join(' | '),
        p_short_ref: ref,
        p_delivery_method: 'delivery',
      });

      if (error) throw new Error(error.message);
      if (rpcRes?.success === false) throw new Error(rpcRes?.error || 'Erreur serveur');

      setOrderRef(ref);
      setSuccessProduct(orderProduct);
      setOrderSheet(false);
      setSelectedProduct(null);
      setOrderSuccess(true);
      setRefCopied(false);

    } catch (err: any) {
      console.error('[Order] Failed:', err);
      setOrderError('❌ Commande non envoyée. Vérifiez votre connexion et réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  const shareProduct = (p: Product) => {
    const url = `${window.location.origin}/b/${shop?.slug}/p/${p.id}`;
    const text = `${p.name} — ${formatPrice(p.price_sale, shop?.currency || undefined)}\n${url}`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const openWhatsApp = (p: Product) => {
    if (!shop?.whatsapp && !shop?.phone) return;
    const phone = (shop.whatsapp || shop.phone || '').replace(/\D/g, '');
    const text = encodeURIComponent(`Bonjour, je suis intéressé(e) par: *${p.name}* — ${formatPrice(p.price_sale, shop?.currency || undefined)}`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  // ── Loading ──
  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="vo-root vo-loading">
          <div className="vo-loading-spinner" />
          <p className="vo-loading-text">Chargement de la boutique...</p>
        </div>
      </>
    );
  }

  if (!shop) {
    return (
      <>
        <style>{CSS}</style>
        <div className="vo-root vo-error">
          <ShoppingBag size={56} style={{ color: '#E91E8C', opacity: 0.5 }} />
          <h1>Boutique introuvable</h1>
          <p>Cette boutique n'existe pas ou n'est plus disponible.</p>
          <a href="/">Retour à l'accueil</a>
        </div>
      </>
    );
  }

  const shopLogo = getShopImageUrl(shop.logo_url || shop.logo);
  const shopCover = getShopImageUrl(shop.cover_url || shop.cover);

  return (
    <>
      <style>{CSS}</style>
      <Helmet>
        <title>{shop.name} — Boutique en ligne | Velmo</title>
        <meta name="description" content={shop.description || `Découvrez la collection de ${shop.name}`} />
        <meta property="og:title" content={shop.name} />
        <meta property="og:image" content={shopLogo || ''} />
        <meta property="og:type" content="website" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </Helmet>

      <div className="vo-root">

        {/* ── NAV ── */}
        <nav className="vo-nav">
          <div className="vo-nav-brand">
            {shopLogo
              ? <img src={shopLogo} alt={shop.name} className="vo-nav-logo" />
              : <div className="vo-nav-logo-placeholder">{shop.name[0]}</div>
            }
            <span className="vo-nav-name">{shop.name}</span>
            {shop.is_verified && <BadgeCheck size={16} className="vo-nav-verified" />}
          </div>
          <div className="vo-nav-actions">
            {(shop.whatsapp || shop.phone) && (
              <button className="vo-nav-btn" onClick={() => {
                const phone = ((shop.whatsapp || shop.phone) || '').replace(/\D/g, '');
                window.open(`https://wa.me/${phone}`, '_blank');
              }}>
                <MessageCircle size={20} />
              </button>
            )}
            <button className="vo-nav-btn" onClick={() => {
              navigator.share?.({ title: shop.name, url: window.location.href })
                || navigator.clipboard.writeText(window.location.href);
            }}>
              <Share2 size={20} />
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <div className="vo-hero">
          {shopCover
            ? <img src={shopCover} alt="" className="vo-hero-img" />
            : null
          }
          <div className="vo-hero-overlay" />
          {shop.promo_banner && (
            <div className="vo-promo-banner">
              <Sparkles size={12} style={{ display: 'inline', marginRight: 6 }} />
              {shop.promo_banner}
            </div>
          )}
        </div>

        {/* ── PROFIL ── */}
        <div className="vo-profile">
          {shopLogo
            ? <img src={shopLogo} alt={shop.name} className="vo-profile-avatar" />
            : <div className="vo-profile-avatar-placeholder">{shop.name[0]}</div>
          }
          <div className="vo-profile-info">
            <div className="vo-profile-name">
              {shop.name}
              {shop.is_verified && (
                <span className="vo-badge-verified">
                  <BadgeCheck size={12} /> Vérifié
                </span>
              )}
            </div>
            {shop.description && (
              <p className="vo-profile-desc">{shop.description}</p>
            )}
            <div className="vo-profile-meta">
              {shop.location && (
                <span className="vo-profile-meta-item">
                  <MapPin size={12} />{shop.location}
                </span>
              )}
              {shop.opening_hours && (
                <span className="vo-profile-meta-item">
                  <Clock size={12} />{shop.opening_hours}
                </span>
              )}
            </div>
            <div className="vo-socials">
              {shop.instagram_url && (
                <a href={shop.instagram_url} target="_blank" rel="noreferrer" className="vo-social-btn">
                  <Instagram size={14} />
                </a>
              )}
              {shop.facebook_url && (
                <a href={shop.facebook_url} target="_blank" rel="noreferrer" className="vo-social-btn">
                  <Facebook size={14} />
                </a>
              )}
              {(shop.whatsapp || shop.phone) && (
                <a href={`https://wa.me/${((shop.whatsapp || shop.phone) || '').replace(/\D/g, '')}`}
                  target="_blank" rel="noreferrer" className="vo-social-btn" style={{ color: '#25D366' }}>
                  <MessageCircle size={14} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── SEARCH ── */}
        <div className="vo-search-wrap">
          <div className="vo-search-box">
            <Search size={16} style={{ color: '#aaa', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── CATEGORIES ── */}
        {categories.length > 1 && (
          <div className="vo-cats">
            {categories.map(cat => (
              <button
                key={cat}
                className={`vo-cat-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── GRID ── */}
        <div className="vo-grid-wrap">
          <p className="vo-grid-title">
            {filtered.length} article{filtered.length !== 1 ? 's' : ''}
            {selectedCategory !== 'Tout' ? ` · ${selectedCategory}` : ''}
          </p>

          {filtered.length === 0 ? (
            <div className="vo-empty">
              <Package size={48} style={{ color: '#E91E8C', opacity: 0.3 }} />
              <p>Aucun article trouvé</p>
            </div>
          ) : (
            <div className="vo-grid">
              {filtered.map((product, i) => {
                const images = getProductImages(product);
                const isNew = product.created_at &&
                  Date.now() - new Date(product.created_at).getTime() < 7 * 86400000;
                const isLow = product.quantity != null && product.quantity > 0 && product.quantity <= 3;
                const isFav = favorites.includes(product.id);
                const hasDiscount = product.price_regular && product.price_regular > product.price_sale;

                return (
                  <motion.div
                    key={product.id}
                    className="vo-card"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.5) }}
                    onClick={() => openProduct(product)}
                  >
                    <div className="vo-card-img">
                      {images[0]
                        ? <img src={images[0]} alt={product.name} loading="lazy" />
                        : <div className="vo-card-img-placeholder">
                          <ShoppingBag size={32} style={{ color: '#E91E8C', opacity: 0.3 }} />
                        </div>
                      }
                      <div className="vo-card-badges">
                        {isNew && <span className="vo-badge new">Nouveau</span>}
                        {hasDiscount && <span className="vo-badge promo">Promo</span>}
                        {isLow && <span className="vo-badge low">Plus que {product.quantity}</span>}
                      </div>
                      <button
                        className={`vo-card-fav ${isFav ? 'active' : ''}`}
                        onClick={(e) => toggleFavorite(product.id, e)}
                      >
                        <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="vo-card-body">
                      {product.category && (
                        <div className="vo-card-cat">{product.category}</div>
                      )}
                      <div className="vo-card-name">{product.name}</div>
                      <div className="vo-card-price-row">
                        <div>
                          <span className="vo-card-price">{formatPrice(product.price_sale, shop.currency || undefined)}</span>
                          {hasDiscount && (
                            <span className="vo-card-price-old">{formatPrice(product.price_regular!, shop.currency || undefined)}</span>
                          )}
                        </div>
                        {isLow && (
                          <span className="vo-card-stock">
                            <Zap size={10} style={{ display: 'inline' }} /> Bientôt épuisé
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="vo-footer">
          <p>Propulsé par <a href="/" target="_blank" rel="noreferrer">Velmo</a></p>
          <p style={{ marginTop: 6 }}>
            Tu veux ta boutique en ligne ?{' '}
            <a href="/join" target="_blank" rel="noreferrer">C'est gratuit →</a>
          </p>
        </div>

        {/* ── LIVE ACTIVITY ── */}
        <AnimatePresence>
          {liveActivity && (
            <motion.div
              className="vo-live-activity"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="vo-live-dot" />
              <p className="vo-live-text">{liveActivity}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PRODUCT DETAIL ── */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              className="vo-detail-overlay"
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <button className="vo-detail-close" onClick={() => setSelectedProduct(null)}>
                <ChevronLeft size={22} />
              </button>
              <button className="vo-detail-share" onClick={() => shareProduct(selectedProduct)}>
                <Share2 size={18} />
              </button>

              {/* Carousel */}
              <ProductCarousel
                images={getProductImages(selectedProduct)}
                idx={carouselIdx}
                setIdx={setCarouselIdx}
                productName={selectedProduct.name}
              />

              {/* Body */}
              <div className="vo-detail-body">
                {selectedProduct.category && (
                  <div className="vo-detail-cat">{selectedProduct.category}</div>
                )}
                <h1 className="vo-detail-name">{selectedProduct.name}</h1>

                <div className="vo-detail-price-row">
                  <span className="vo-detail-price">{formatPrice(selectedProduct.price_sale, shop.currency || undefined)}</span>
                  {selectedProduct.price_regular && selectedProduct.price_regular > selectedProduct.price_sale && (
                    <span className="vo-detail-price-old">{formatPrice(selectedProduct.price_regular, shop.currency || undefined)}</span>
                  )}
                </div>

                {selectedProduct.quantity != null && selectedProduct.quantity > 0 && selectedProduct.quantity <= 5 && (
                  <div className="vo-detail-stock-low">
                    <Zap size={12} /> Plus que {selectedProduct.quantity} en stock
                  </div>
                )}

                {/* Variants */}
                {selectedProduct.variants_json?.colors && selectedProduct.variants_json.colors.length > 0 && (
                  <div className="vo-variant-section">
                    <div className="vo-variant-label">
                      Couleur{selectedColor ? ` — ${selectedColor}` : ''}
                    </div>
                    <div className="vo-color-row">
                      {selectedProduct.variants_json.colors.map(c => (
                        <div key={c.name} style={{ textAlign: 'center' }}>
                          <button
                            className={`vo-color-swatch ${selectedColor === c.name ? 'active' : ''}`}
                            onClick={() => setSelectedColor(c.name)}
                            style={{ background: c.hex || '#ccc' }}
                            title={c.name}
                          >
                            {c.image_url && (
                              <img src={getImageUrl(c.image_url) || ''} alt={c.name} />
                            )}
                            {!c.image_url && !c.hex && (
                              <div className="vo-color-swatch-fill" />
                            )}
                          </button>
                          <div className="vo-color-name">{c.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProduct.variants_json?.sizes && selectedProduct.variants_json.sizes.length > 0 && (
                  <div className="vo-variant-section">
                    <div className="vo-variant-label">
                      Taille{selectedSize ? ` — ${selectedSize}` : ''}
                    </div>
                    <div className="vo-size-row">
                      {selectedProduct.variants_json.sizes.map(s => (
                        <button
                          key={s}
                          className={`vo-size-btn ${selectedSize === s ? 'active' : ''}`}
                          onClick={() => setSelectedSize(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProduct.description && (
                  <p className="vo-detail-desc">{selectedProduct.description}</p>
                )}

                {/* Bouton Commander */}
                <button
                  className="vo-order-btn"
                  onClick={() => {
                    setSelectedProduct(null);
                    openOrderSheet(selectedProduct);
                  }}
                >
                  <ShoppingBag size={20} />
                  Commander maintenant
                </button>

                {/* WhatsApp */}
                {(shop?.whatsapp || shop?.phone) && (
                  <button className="vo-wa-btn" onClick={() => openWhatsApp(selectedProduct)}>
                    <MessageCircle size={18} />
                    Commander via WhatsApp
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BOTTOM SHEET ORDER FORM ── */}
        <AnimatePresence>
          {orderSheet && orderProduct && (
            <motion.div
              className="vo-sheet-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOrderSheet(false)}
            >
              <motion.div
                className="vo-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="vo-sheet-handle" />

                <div className="vo-sheet-header">
                  <div className="vo-sheet-title">Passer une commande</div>
                  <div className="vo-sheet-subtitle">Remplissez les informations pour confirmer</div>
                </div>

                {/* Product preview */}
                <div className="vo-sheet-product-preview">
                  {getProductImages(orderProduct)[0]
                    ? <img src={getProductImages(orderProduct)[0]} alt="" className="vo-sheet-product-img" />
                    : <div className="vo-sheet-product-img" style={{ background: 'linear-gradient(135deg,#fce4f3,#fff0e6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBag size={20} style={{ color: '#E91E8C', opacity: 0.4 }} />
                    </div>
                  }
                  <div>
                    <div className="vo-sheet-product-name">{orderProduct.name}</div>
                    <div className="vo-sheet-product-price">{formatPrice(orderProduct.price_sale * orderForm.quantity, shop.currency || undefined)}</div>
                    {(orderForm.selectedColor || orderForm.selectedSize) && (
                      <div className="vo-sheet-product-variants">
                        {[orderForm.selectedColor, orderForm.selectedSize].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="vo-sheet-body">
                  {/* Couleur */}
                  {orderProduct.variants_json?.colors && orderProduct.variants_json.colors.length > 0 && (
                    <div className="vo-field">
                      <label className="vo-label">Couleur</label>
                      <div className="vo-color-row">
                        {orderProduct.variants_json.colors.map(c => (
                          <div key={c.name} style={{ textAlign: 'center' }}>
                            <button
                              className={`vo-color-swatch ${orderForm.selectedColor === c.name ? 'active' : ''}`}
                              onClick={() => setOrderForm(f => ({ ...f, selectedColor: c.name }))}
                              style={{ background: c.hex || '#ccc' }}
                            />
                            <div className="vo-color-name">{c.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Taille */}
                  {orderProduct.variants_json?.sizes && orderProduct.variants_json.sizes.length > 0 && (
                    <div className="vo-field">
                      <label className="vo-label">Taille</label>
                      <div className="vo-size-row">
                        {orderProduct.variants_json.sizes.map(s => (
                          <button
                            key={s}
                            className={`vo-size-btn ${orderForm.selectedSize === s ? 'active' : ''}`}
                            onClick={() => setOrderForm(f => ({ ...f, selectedSize: s }))}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantité */}
                  <div className="vo-field">
                    <label className="vo-label">Quantité</label>
                    <div className="vo-qty-row">
                      <button className="vo-qty-btn" onClick={() => setOrderForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}>
                        <Minus size={18} />
                      </button>
                      <span className="vo-qty-val">{orderForm.quantity}</span>
                      <button className="vo-qty-btn" onClick={() => setOrderForm(f => ({ ...f, quantity: f.quantity + 1 }))}>
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Prénom */}
                  <div className="vo-field">
                    <label className="vo-label">Prénom *</label>
                    <input
                      className="vo-input"
                      type="text"
                      placeholder="Votre prénom"
                      value={orderForm.name}
                      onChange={e => setOrderForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>

                  {/* Téléphone / WhatsApp */}
                  <div className="vo-field">
                    <label className="vo-label">Numéro WhatsApp *</label>
                    <input
                      className="vo-input"
                      type="tel"
                      inputMode="numeric"
                      placeholder="Ex: 620 00 00 00"
                      value={orderForm.phone}
                      onChange={e => setOrderForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>

                  {/* Adresse livraison */}
                  <div className="vo-field">
                    <label className="vo-label">Adresse de livraison</label>
                    <input
                      className="vo-input"
                      type="text"
                      placeholder="Quartier, rue, point de repère..."
                      value={orderForm.address}
                      onChange={e => setOrderForm(f => ({ ...f, address: e.target.value }))}
                    />
                  </div>

                  {/* Message optionnel */}
                  <div className="vo-field">
                    <label className="vo-label">Message (optionnel)</label>
                    <input
                      className="vo-input"
                      type="text"
                      placeholder="Variante, couleur, précisions..."
                      value={orderForm.message}
                      onChange={e => setOrderForm(f => ({ ...f, message: e.target.value }))}
                    />
                  </div>

                  {/* Message d'erreur */}
                  {orderError && (
                    <div style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1.5px solid rgba(239,68,68,0.3)',
                      borderRadius: 14,
                      padding: '12px 14px',
                      fontSize: 13,
                      color: '#dc2626',
                      marginBottom: 8,
                      fontWeight: 500,
                    }}>
                      {orderError}
                    </div>
                  )}

                  <button
                    className="vo-submit-btn"
                    onClick={handleOrder}
                    disabled={submitting || !orderForm.name.trim() || !orderForm.phone.trim()}
                  >
                    {submitting
                      ? <><div className="vo-loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Envoi...</>
                      : <><Check size={20} /> Envoyer la commande</>
                    }
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SUCCESS SCREEN ── */}
        <AnimatePresence>
          {orderSuccess && (
            <motion.div
              className="vo-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="vo-success-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
              >
                <Check size={36} color="white" strokeWidth={3} />
              </motion.div>
              <div className="vo-success-title">Commande envoyée ! 🎉</div>
              <p className="vo-success-text">
                Votre commande a bien été reçue. La boutique va vous contacter rapidement pour confirmer la livraison.
              </p>

              {/* Résumé commande */}
              {successProduct && (
                <div style={{
                  background: 'rgba(233,30,140,0.06)',
                  border: '1.5px solid rgba(233,30,140,0.15)',
                  borderRadius: 16,
                  padding: '14px 16px',
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: 8,
                }}>
                  <div style={{ fontSize: 11, color: '#E91E8C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                    Récapitulatif
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 2 }}>
                    {successProduct.name}
                  </div>
                  <div style={{ fontSize: 13, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Qté : {orderForm.quantity}</span>
                    <span style={{ fontWeight: 700, color: '#E91E8C' }}>
                      {formatPrice((successProduct.price_sale || 0) * orderForm.quantity, shop?.currency || undefined)}
                    </span>
                  </div>
                </div>
              )}

              {/* Ref + copy */}
              <div className="vo-success-ref" style={{ width: '100%' }}>
                <div className="vo-success-ref-label">Référence commande</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div className="vo-success-ref-val" style={{ flex: 1 }}>{orderRef}</div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(orderRef);
                      setRefCopied(true);
                      setTimeout(() => setRefCopied(false), 2000);
                    }}
                    style={{
                      background: refCopied ? '#2ECC71' : 'rgba(233,30,140,0.1)',
                      color: refCopied ? 'white' : '#E91E8C',
                      border: 'none',
                      borderRadius: 10,
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {refCopied ? <><Check size={12} /> Copié</> : 'Copier'}
                  </button>
                </div>
              </div>

              {/* Bouton WhatsApp suivi */}
              {(shop?.whatsapp || shop?.phone) && (
                <button
                  onClick={() => {
                    const phone = ((shop?.whatsapp || shop?.phone) || '').replace(/\D/g, '');
                    const msg = encodeURIComponent(
                      `Bonjour ! J'ai passé une commande sur votre boutique Velmo.\n` +
                      `Réf : *${orderRef}*\n` +
                      `Produit : ${successProduct?.name || ''}\n` +
                      `Montant : ${formatPrice((successProduct?.price_sale || 0) * orderForm.quantity, shop?.currency || undefined)}\n\n` +
                      `Pouvez-vous confirmer ma commande ? Merci 🙏`
                    );
                    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                  }}
                  style={{
                    width: '100%',
                    background: '#25D366',
                    color: 'white',
                    border: 'none',
                    borderRadius: 16,
                    padding: '14px 20px',
                    fontFamily: 'inherit',
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <MessageCircle size={20} /> Confirmer sur WhatsApp
                </button>
              )}

              <button
                className="vo-success-back"
                onClick={() => setOrderSuccess(false)}
              >
                Continuer les achats
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}

// ============================================================
// 🖼️ ProductCarousel
// ============================================================

function ProductCarousel({
  images, idx, setIdx, productName
}: {
  images: string[];
  idx: number;
  setIdx: (i: number) => void;
  productName: string;
}) {
  const touchStartX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      if (delta > 0 && idx < images.length - 1) setIdx(idx + 1);
      if (delta < 0 && idx > 0) setIdx(idx - 1);
    }
  };

  if (images.length === 0) {
    return (
      <div className="vo-carousel">
        <div className="vo-carousel-placeholder">
          <ShoppingBag size={60} style={{ color: '#E91E8C', opacity: 0.2 }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="vo-carousel"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={images[idx]}
            src={images[idx]}
            alt={productName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            {idx > 0 && (
              <button className="vo-carousel-prev" onClick={() => setIdx(idx - 1)}>
                <ChevronLeft size={18} />
              </button>
            )}
            {idx < images.length - 1 && (
              <button className="vo-carousel-next" onClick={() => setIdx(idx + 1)}>
                <ChevronRight size={18} />
              </button>
            )}
            <div className="vo-carousel-dots">
              {images.map((_, i) => (
                <div key={i} className={`vo-carousel-dot ${i === idx ? 'active' : ''}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="vo-thumbs" style={{ background: 'white' }}>
          {images.map((img, i) => (
            <div
              key={i}
              className={`vo-thumb ${i === idx ? 'active' : ''}`}
              onClick={() => setIdx(i)}
            >
              <img src={img} alt={`Photo ${i + 1}`} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
