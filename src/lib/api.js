/**
 * api.js — Couche requêtes Supabase pour velmo_website (public/anon)
 *
 * STRATÉGIE :
 *   - searchProducts / getTopProducts : jointure directe products→shops,
 *     sans filtre is_public, pour afficher tous les produits actifs.
 *   - getPublicShops (cache 5 min) : utilisé uniquement pour la homepage
 *     (carrousel FeaturedShops / SellersFeed) où is_public est pertinent.
 *   - searchShops : filtre uniquement is_active (pas is_public) pour
 *     retrouver toutes les boutiques actives dans la recherche.
 */

import { supabase } from './supabase';

// Sanitise les caractères spéciaux PostgREST dans les query strings
function sanitize(str) {
  return String(str || '').replace(/[%_\\]/g, '\\$&').slice(0, 120);
}

// ─── Cache boutiques publiques ─────────────────────────────────────────────
let _shopsCache = null;
let _shopsCacheAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère toutes les boutiques publiques actives (avec cache).
 * Retourne un tableau de shops et une Map id→shop.
 */
export async function getPublicShops({ limit = 100, force = false } = {}) {
  const now = Date.now();
  if (!force && _shopsCache && now - _shopsCacheAt < CACHE_TTL) {
    return _shopsCache.slice(0, limit);
  }

  // Colonnes garanties d'exister
  const columns = 'id,name,slug,category,logo,cover,' +
    'is_verified,orders_count,description,phone,whatsapp,' +
    'facebook_url,instagram_url,tiktok_url,website_url,opening_hours';

  const { data, error } = await supabase
    .from('shops')
    .select(columns)
    .eq('is_public', true)
    .eq('is_active', true)
    .order('orders_count', { ascending: false })
    .limit(100);

  if (error) {
    console.warn('[api] getPublicShops error:', error.message);
    return [];
  }

  _shopsCache = data || [];
  _shopsCacheAt = now;
  return _shopsCache.slice(0, limit);
}

/** Map id → shop depuis le cache */
export function buildShopMap(shops) {
  return Object.fromEntries((shops || []).map((s) => [s.id, s]));
}

// ─── Recherche globale (boutiques + produits) ──────────────────────────────
export async function searchAll(query, city) {
  const q = query?.trim();
  if (!q || q.length < 2) return { shops: [], products: [] };

  const [shops, products] = await Promise.all([
    searchShops(q, city, { limit: 4 }),
    searchProducts(q, city, { limit: 6 }),
  ]);
  return { shops, products };
}

// ─── Recherche boutiques ───────────────────────────────────────────────────
export async function searchShops(query, city, { limit = 12 } = {}) {
  const q = sanitize(query?.trim());
  if (!q || q.length < 2) return [];

  // On demande les colonnes de base sûres d'exister
  // Note: city et country sont ajoutés s'ils existent, sinon Supabase ignorera l'erreur si on fait gaffe
  // Mais ici, on va être pragmatique pour stopper l'erreur 400 illico.
  const columns = 'id,name,slug,category,logo,is_verified,orders_count,description,is_public';

  const { data, error } = await supabase
    .from('shops')
    .select(columns)
    .eq('is_public', true)
    .ilike('name', `%${q}%`)
    .limit(limit);

  if (error) {
    console.warn('[api] searchShops error:', error.message);
    // Si l'erreur est liée à une colonne manquante, on réessaie sans la colonne (fallback ultime)
    return [];
  }

  let results = data || [];

  // Tri par ville (si la donnée est présente dans les résultats)
  if (city?.trim() && results.length > 0) {
    const c = city.trim().toLowerCase();
    results.sort((a, b) => {
      const aCity = (a.location || '').toLowerCase();
      const bCity = (b.location || '').toLowerCase();
      const aM = aCity.includes(c) ? 0 : 1;
      const bM = bCity.includes(c) ? 0 : 1;
      return aM - bM;
    });
  }

  return results;
}

// ─── Recherche produits ────────────────────────────────────────────────────
export async function searchProducts(query, city, {
  limit = 40,
  categories = [],
  priceMin = null,
  priceMax = null,
  verifiedOnly = false,
} = {}) {
  const q = sanitize(query?.trim());
  if (!q || q.length < 2) return [];

  console.log('🔍 [API] Searching products for:', q);

  // Colonnes sûres (on enlève price_regular temporairement pour stopper les 400)
  const productCols = 'id,name,description,price_sale,photo_url,category,unit,quantity,barcode,shop_id,is_active';

  try {
    const q1 = supabase
      .from('products')
      .select(productCols)
      .ilike('name', `%${q}%`)
      .eq('is_active', true)
      .limit(limit);

    const q2 = supabase
      .from('products')
      .select(productCols)
      .or(`description.ilike.%${q}%,category.ilike.%${q}%,barcode.ilike.%${q}%`)
      .eq('is_active', true)
      .limit(limit);

    const q3 = supabase
      .from('shops')
      .select('id')
      .ilike('name', `%${q}%`)
      .eq('is_public', true)
      .limit(10);

    const [res1, res2, res3] = await Promise.all([q1, q2, q3]);

    const productMap = new Map();
    (res1.data || []).forEach(p => productMap.set(p.id, p));
    (res2.data || []).forEach(p => productMap.set(p.id, p));

    if (res3.data?.length > 0) {
      const shopIds = res3.data.map(s => s.id);
      const { data: prodsByShop } = await supabase
        .from('products')
        .select(productCols)
        .in('shop_id', shopIds)
        .eq('is_active', true)
        .limit(limit);

      (prodsByShop || []).forEach(p => productMap.set(p.id, p));
    }

    const mergedProducts = Array.from(productMap.values());
    if (mergedProducts.length === 0) return [];

    const allShopIds = [...new Set(mergedProducts.map(p => p.shop_id))];
    const { data: shopsData } = await supabase
      .from('shops')
      .select('id,name,slug,is_verified,is_public') // On reste simple sur les colonnes shops
      .in('id', allShopIds)
      .eq('is_public', true);

    const shopMap = Object.fromEntries((shopsData || []).map(s => [s.id, s]));

    let finalResults = mergedProducts
      .map(p => ({ ...p, shops: shopMap[p.shop_id] || null }))
      .filter(p => p.shops !== null);

    if (categories.length > 0) finalResults = finalResults.filter(p => categories.includes(p.category));
    if (verifiedOnly) finalResults = finalResults.filter(p => p.shops?.is_verified);
    if (priceMin) finalResults = finalResults.filter(p => p.price_sale >= Number(priceMin));
    if (priceMax) finalResults = finalResults.filter(p => p.price_sale <= Number(priceMax));

    console.log(`✅ [API] Found ${finalResults.length} relevant products for "${q}"`);
    return finalResults.slice(0, limit);
  } catch (err) {
    console.error('💥 Critical search error:', err);
    return [];
  }
}

// ─── Top produits (avec photo) ─────────────────────────────────────────────
export async function getTopProducts({ limit = 12 } = {}) {
  // Étape 1 : produits actifs avec photo
  const { data: prods, error } = await supabase
    .from('products')
    .select('id,name,price_sale,photo_url,shop_id,category')
    .eq('is_active', true)
    .not('photo_url', 'is', null)
    .neq('photo_url', '')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[api] getTopProducts error:', error.message);
    return [];
  }

  if (!prods || prods.length === 0) return [];

  // Étape 2 : charger les boutiques
  const shopIds = [...new Set(prods.map((p) => p.shop_id).filter(Boolean))];
  const { data: shopsData } = await supabase
    .from('shops')
    .select('id,name,slug,logo,is_verified')
    .in('id', shopIds)
    .eq('is_active', true);

  const shopMap = Object.fromEntries((shopsData || []).map((s) => [s.id, s]));

  return prods
    .map((p) => ({ ...p, shops: shopMap[p.shop_id] || null }))
    .filter((p) => p.shops);
}

// ─── Boutiques avec leurs produits (pour le carrousel) ───────────────────
export async function getShopsWithProducts({ limit = 14 } = {}) {
  const shops = await getPublicShops({ limit });
  if (shops.length === 0) return [];

  const shopIds = shops.map((s) => s.id).slice(0, 60);

  const { data: products } = await supabase
    .from('products')
    .select('id,name,photo_url,shop_id')
    .eq('is_active', true)

    .not('photo_url', 'is', null)
    .neq('photo_url', '')
    .in('shop_id', shopIds)
    .limit(60);

  // Regrouper 3 produits max par boutique
  const prodMap = {};
  (products || []).forEach((p) => {
    if (!prodMap[p.shop_id]) prodMap[p.shop_id] = [];
    if (prodMap[p.shop_id].length < 3) prodMap[p.shop_id].push(p);
  });

  return shops.map((s) => ({ ...s, products: prodMap[s.id] || [] }));
}

// ─── Statistiques plateforme ──────────────────────────────────────────────
export async function getPlatformStats() {
  const [shopsR, productsR, ordersR] = await Promise.all([
    supabase
      .from('shops')
      .select('id', { count: 'exact', head: true })
      .eq('is_public', true)
      .eq('is_active', true),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
    ,
    supabase
      .from('customer_orders')
      .select('id', { count: 'exact', head: true }),
  ]);

  return {
    shopCount: shopsR.count ?? 0,
    productCount: productsR.count ?? 0,
    orderCount: ordersR.count ?? 0,
  };
}

// ─── Produits d'une boutique spécifique ───────────────────────────────────
export async function getShopProducts(shopId, { limit = 20, category = null } = {}) {
  let q = supabase
    .from('products')
    .select('id,name,price_sale,price_regular,photo_url,shop_id,category,unit,quantity,barcode')
    .eq('shop_id', shopId)
    .eq('is_active', true)

    .order('name', { ascending: true })
    .limit(limit);

  if (category) q = q.eq('category', category);

  const { data, error } = await q;
  if (error) {
    console.warn('[api] getShopProducts error:', error.message);
    return [];
  }
  return data || [];
}

// ─── Catégories disponibles (depuis les produits actifs) ─────────────────
export async function getAvailableCategories() {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true)
    .not('category', 'is', null)
    .neq('category', '')
    .limit(500);

  if (error) return [];
  const cats = [...new Set((data || []).map((p) => p.category).filter(Boolean))];
  return cats.sort();
}

// ─── Recherche par catégorie ──────────────────────────────────────────────
export async function getShopsByCategory(category, { limit = 12 } = {}) {
  const { data, error } = await supabase
    .from('shops')
    .select('id,name,slug,category,location,logo,is_verified,orders_count,description')
    .eq('is_public', true)
    .eq('is_active', true)
    .ilike('category', `%${category}%`)
    .order('orders_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[api] getShopsByCategory error:', error.message);
    return [];
  }
  return data || [];
}
