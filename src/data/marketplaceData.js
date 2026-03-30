// ============================================================
//  VELMO MARKETPLACE — Mock Data
//  30 produits, 6 catégories, 10 vendeurs
// ============================================================

export const CATEGORIES = [
  { id: 'all',          label: 'Tout',        emoji: '🛍️' },
  { id: 'alimentation', label: 'Alimentaire',  emoji: '🥘' },
  { id: 'electronique', label: 'Électronique', emoji: '📱' },
  { id: 'mode',         label: 'Mode',         emoji: '👗' },
  { id: 'beaute',       label: 'Beauté',       emoji: '💄' },
  { id: 'maison',       label: 'Maison',       emoji: '🏠' },
  { id: 'scolaire',     label: 'Scolaire',     emoji: '📚' },
];

// Images Unsplash stables (pas de quota, CDN rapide)
const img = (id, w = 400, h = 400) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=70`;

export const PRODUCTS = [
  // ── ALIMENTATION ────────────────────────────────────────
  {
    id: 'p01', name: 'Riz Importé 25 kg', price: 185000, originalPrice: null,
    category: 'alimentation', image: img('1586201375761-83865001e31c'),
    vendor: 'Diallo Distribution', vendorId: 'v01', vendorVerified: true,
    badge: 'bestseller', rating: 4.8, reviews: 142, inStock: true,
    keywords: ['riz', 'alimentation', 'céréales'],
  },
  {
    id: 'p02', name: 'Huile de Palme 5 L', price: 55000, originalPrice: 65000,
    category: 'alimentation', image: img('1474979266404-7eaacbcd5784'),
    vendor: 'Épicerie Mamadou', vendorId: 'v02', vendorVerified: false,
    badge: 'promo', rating: 4.5, reviews: 87, inStock: true,
    keywords: ['huile', 'palme', 'cuisine'],
  },
  {
    id: 'p03', name: 'Jus Bissap Bouteille 1 L', price: 15000, originalPrice: null,
    category: 'alimentation', image: img('1622597040596-c2c07d6fe629'),
    vendor: 'Fatou Boissons', vendorId: 'v03', vendorVerified: true,
    badge: null, rating: 4.7, reviews: 203, inStock: true,
    keywords: ['bissap', 'jus', 'boisson', 'hibiscus'],
  },
  {
    id: 'p04', name: 'Couscous Premium 5 kg', price: 48000, originalPrice: null,
    category: 'alimentation', image: img('1505253716362-af92e91a93dd'),
    vendor: 'Épicerie Mamadou', vendorId: 'v02', vendorVerified: false,
    badge: null, rating: 4.3, reviews: 56, inStock: true,
    keywords: ['couscous', 'céréales', 'alimentation'],
  },
  {
    id: 'p05', name: 'Savon de Karité Artisanal', price: 18000, originalPrice: null,
    category: 'alimentation', image: img('1584308972272-9e14f5234a6d'),
    vendor: 'Naturelle Guinée', vendorId: 'v04', vendorVerified: true,
    badge: 'nouveau', rating: 4.9, reviews: 31, inStock: true,
    keywords: ['savon', 'karité', 'artisanal', 'naturel'],
  },

  // ── ÉLECTRONIQUE ─────────────────────────────────────────
  {
    id: 'p06', name: 'iPhone 15 Pro Max 256GB', price: 16500000, originalPrice: 18000000,
    category: 'electronique', image: img('1511707171634-5f897ff02aa9'),
    vendor: 'iStore Conakry', vendorId: 'v05', vendorVerified: true,
    badge: 'promo', rating: 4.9, reviews: 124, inStock: true,
    keywords: ['iphone', 'apple', 'smartphone', 'ios'],
  },
  {
    id: 'p07', name: 'AirPods Max Silver', price: 6500000, originalPrice: null,
    category: 'electronique', image: img('1505740420918-a926fa892976'),
    vendor: 'TechShop Conakry', vendorId: 'v05', vendorVerified: true,
    badge: 'premium', rating: 4.8, reviews: 44, inStock: true,
    keywords: ['airpods', 'apple', 'audio', 'headphones'],
  },
  {
    id: 'p08', name: 'Chargeur Rapide USB-C 65W', price: 65000, originalPrice: 80000,
    category: 'electronique', image: img('1609091839311-d5365f9ff1c5'),
    vendor: 'TechShop Conakry', vendorId: 'v05', vendorVerified: true,
    badge: 'promo', rating: 4.4, reviews: 67, inStock: true,
    keywords: ['chargeur', 'usb', 'rapide', 'telephone'],
  },
  {
    id: 'p09', name: 'MacBook Air M3 13"', price: 12500000, originalPrice: null,
    category: 'electronique', image: img('1496181754127-ae8baac99790'),
    vendor: 'TechShop Conakry', vendorId: 'v05', vendorVerified: true,
    badge: 'nouveau', rating: 4.9, reviews: 28, inStock: true,
    keywords: ['macbook', 'apple', 'laptop', 'ordinateur'],
  },
  {
    id: 'p10', name: 'Batterie Externe 20 000 mAh', price: 120000, originalPrice: null,
    category: 'electronique', image: img('1565849904461-04a58ad377e0'),
    vendor: 'TechShop Conakry', vendorId: 'v05', vendorVerified: true,
    badge: 'nouveau', rating: 4.7, reviews: 19, inStock: true,
    keywords: ['batterie', 'powerbank', 'charge', 'telephone'],
  },

  // ── MODE ─────────────────────────────────────────────────
  {
    id: 'p11', name: 'Montre de Luxe Chrono', price: 1250000, originalPrice: null,
    category: 'mode', image: img('1523275335617-c292c1baecf2'),
    vendor: 'Bijouterie Sow', vendorId: 'v07', vendorVerified: true,
    badge: 'premium', rating: 4.9, reviews: 178, inStock: true,
    keywords: ['montre', 'luxe', 'bijou', 'watch'],
  },
  {
    id: 'p12', name: 'Sneakers Limited Edition', price: 1450000, originalPrice: 1800000,
    category: 'mode', image: img('1549298916-b41d501d377b'),
    vendor: 'StreetWear Zone', vendorId: 'v08', vendorVerified: true,
    badge: 'rare', rating: 4.8, reviews: 93, inStock: true,
    keywords: ['sneakers', 'nike', 'shoes', 'mode'],
  },
  {
    id: 'p13', name: 'Chemise Boubou Homme', price: 125000, originalPrice: null,
    category: 'mode', image: img('1516826957135-700dedea698c'),
    vendor: 'Mode Africaine', vendorId: 'v08', vendorVerified: true,
    badge: null, rating: 4.5, reviews: 61, inStock: true,
    keywords: ['boubou', 'chemise', 'homme', 'tenue'],
  },
  {
    id: 'p14', name: 'Sandales Cuir Artisanales', price: 85000, originalPrice: null,
    category: 'mode', image: img('1542291026-7eec264c27ff'),
    vendor: 'Chaussures Ibrahima', vendorId: 'v09', vendorVerified: false,
    badge: null, rating: 4.3, reviews: 47, inStock: true,
    keywords: ['sandales', 'chaussures', 'cuir', 'artisanal'],
  },
  {
    id: 'p15', name: 'Sac à Main Designer', price: 2200000, originalPrice: 2800000,
    category: 'mode', image: img('1548036161-65efdc52f73e'),
    vendor: 'Luxe Conakry', vendorId: 'v10', vendorVerified: true,
    badge: 'luxe', rating: 4.9, reviews: 52, inStock: true,
    keywords: ['sac', 'main', 'cuir', 'designer', 'luxe'],
  },

  // ── BEAUTÉ ───────────────────────────────────────────────
  {
    id: 'p16', name: 'Beurre de Karité Pur 500 g', price: 45000, originalPrice: null,
    category: 'beaute', image: img('1556228720-195a672e8a03'),
    vendor: 'Naturelle Guinée', vendorId: 'v04', vendorVerified: true,
    badge: 'bestseller', rating: 4.9, reviews: 267, inStock: true,
    keywords: ['karité', 'beurre', 'hydratant', 'naturel', 'peau'],
  },
  {
    id: 'p17', name: 'Huile de Coco Vierge 250 ml', price: 38000, originalPrice: null,
    category: 'beaute', image: img('1573461160327-42b7989f4b26'),
    vendor: 'Naturelle Guinée', vendorId: 'v04', vendorVerified: true,
    badge: null, rating: 4.7, reviews: 134, inStock: true,
    keywords: ['huile', 'coco', 'cheveux', 'peau', 'naturel'],
  },
  {
    id: 'p18', name: 'Parfum Signature Intense', price: 850000, originalPrice: 1100000,
    category: 'beaute', image: img('1541533238-7bb9d7cc4f56'),
    vendor: 'Parfumerie Royale', vendorId: 'v04', vendorVerified: true,
    badge: 'bestseller', rating: 4.9, reviews: 88, inStock: true,
    keywords: ['parfum', 'fragrance', 'luxe', 'beauté'],
  },
  {
    id: 'p19', name: 'Henné Naturel Poudre 100 g', price: 25000, originalPrice: null,
    category: 'beaute', image: img('1526045612212-70caf35c14df'),
    vendor: 'Naturelle Guinée', vendorId: 'v04', vendorVerified: true,
    badge: null, rating: 4.6, reviews: 72, inStock: true,
    keywords: ['henné', 'cheveux', 'naturel', 'coloration'],
  },
  {
    id: 'p20', name: 'Savon Noir du Maroc 250 g', price: 22000, originalPrice: null,
    category: 'beaute', image: img('1526045612212-70caf35c14df'),
    vendor: 'Naturelle Guinée', vendorId: 'v04', vendorVerified: true,
    badge: 'nouveau', rating: 4.8, reviews: 41, inStock: true,
    keywords: ['savon', 'maroc', 'noir', 'hammam', 'naturel'],
  },

  // ── MAISON ───────────────────────────────────────────────
  {
    id: 'p21', name: 'Matelas Mousse 160×200 cm', price: 850000, originalPrice: null,
    category: 'maison', image: img('1555041469-a586d68702bc'),
    vendor: 'Électro Confort', vendorId: 'v06', vendorVerified: false,
    badge: null, rating: 4.3, reviews: 33, inStock: true,
    keywords: ['matelas', 'lit', 'chambre', 'confort'],
  },
  {
    id: 'p22', name: 'Casserole Inox 5 Pièces', price: 165000, originalPrice: 200000,
    category: 'maison', image: img('1584990347209-7b5ad01d3ce7'),
    vendor: 'Épicerie Mamadou', vendorId: 'v02', vendorVerified: false,
    badge: 'promo', rating: 4.5, reviews: 58, inStock: true,
    keywords: ['casserole', 'cuisine', 'inox', 'batterie'],
  },
  {
    id: 'p23', name: 'Natte Tressée Traditionnelle', price: 75000, originalPrice: null,
    category: 'maison', image: img('1519710164239-da838a7b6301'),
    vendor: 'Artisanat Guinée', vendorId: 'v07', vendorVerified: true,
    badge: null, rating: 4.7, reviews: 29, inStock: true,
    keywords: ['natte', 'tapis', 'artisanal', 'décoration'],
  },
  {
    id: 'p24', name: 'Lampe Solaire LED 50W', price: 280000, originalPrice: null,
    category: 'maison', image: img('1532996122724-e3de71baf223'),
    vendor: 'Électro Confort', vendorId: 'v06', vendorVerified: false,
    badge: 'nouveau', rating: 4.8, reviews: 15, inStock: true,
    keywords: ['lampe', 'solaire', 'led', 'éclairage', 'énergie'],
  },
  {
    id: 'p25', name: 'Mixer Cuisine 600W', price: 245000, originalPrice: 295000,
    category: 'maison', image: img('1570222094114-d054a817e56b'),
    vendor: 'Électro Confort', vendorId: 'v06', vendorVerified: false,
    badge: 'promo', rating: 4.4, reviews: 46, inStock: true,
    keywords: ['mixer', 'blender', 'cuisine', 'électroménager'],
  },

  // ── SCOLAIRE ─────────────────────────────────────────────
  {
    id: 'p26', name: 'Sac à Dos Scolaire Solide', price: 95000, originalPrice: null,
    category: 'scolaire', image: img('1553062407-98eeb64c6a62'),
    vendor: 'Fournitures Kaba', vendorId: 'v10', vendorVerified: true,
    badge: 'bestseller', rating: 4.6, reviews: 112, inStock: true,
    keywords: ['sac', 'école', 'enfant', 'cartable', 'scolaire'],
  },
  {
    id: 'p27', name: 'Lot 10 Cahiers 200 Pages', price: 65000, originalPrice: null,
    category: 'scolaire', image: img('1517971053567-ea3b294a0ae0'),
    vendor: 'Fournitures Kaba', vendorId: 'v10', vendorVerified: true,
    badge: null, rating: 4.4, reviews: 89, inStock: true,
    keywords: ['cahier', 'école', 'papeterie', 'scolaire'],
  },
  {
    id: 'p28', name: 'Stylos Bille Lot 24 Pcs', price: 18000, originalPrice: null,
    category: 'scolaire', image: img('1585776245991-cf89dd7fc73a'),
    vendor: 'Fournitures Kaba', vendorId: 'v10', vendorVerified: true,
    badge: null, rating: 4.2, reviews: 54, inStock: true,
    keywords: ['stylo', 'bille', 'papeterie', 'écriture'],
  },
  {
    id: 'p29', name: 'Calculatrice Scientifique', price: 85000, originalPrice: 110000,
    category: 'scolaire', image: img('1611532736597-de2d4265fba3'),
    vendor: 'TechShop Conakry', vendorId: 'v05', vendorVerified: true,
    badge: 'promo', rating: 4.7, reviews: 37, inStock: true,
    keywords: ['calculatrice', 'scientifique', 'maths', 'scolaire'],
  },
  {
    id: 'p30', name: 'Uniforme Scolaire Complet', price: 125000, originalPrice: null,
    category: 'scolaire', image: img('1503676260728-1c00d2a1ef5c'),
    vendor: 'Mode Africaine', vendorId: 'v08', vendorVerified: true,
    badge: null, rating: 4.5, reviews: 63, inStock: true,
    keywords: ['uniforme', 'école', 'tenue', 'scolaire'],
  },
];

export const fmtGNF = (n) =>
  new Intl.NumberFormat('fr-GN', { maximumFractionDigits: 0 }).format(n) + ' GNF';
