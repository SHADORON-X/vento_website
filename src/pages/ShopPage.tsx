import { useState, useEffect, useMemo, useCallback, type FormEvent } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, type Shop, type Product, type OrderItem, type CustomerOrder, type ShopEvent } from '../lib/supabase';
import { applyTheme } from '../lib/themes';
import {
    ShoppingBag, Plus, Minus, Trash2, X, Check, Store, ShoppingCart,
    Moon, Sun, MapPin, Truck, Search, Clock, Heart, Share2, MessageCircle,
    Shield, CreditCard, Users, Filter, ChevronDown, CheckCircle2, BadgeCheck, Printer, Package,
    Instagram, Facebook, Twitter, Mail, Globe, ExternalLink, ArrowRight, Phone, Smartphone,
    Sparkles, Shirt, Monitor, Utensils, Home, Dumbbell, Coffee, Zap, Palette, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// ============================================================
// 🛒 TYPES LOCAUX
// ============================================================

interface CartItem {
    product: Product;
    quantity: number;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name' | 'popular';
type FilterOption = 'all' | 'available' | 'new';

// ============================================================
// 📦 COMPOSANT PRINCIPAL
// ============================================================

export default function ShopPage() {
    const { slug, productId: routeProductId } = useParams<{ slug: string, productId?: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [shop, setShop] = useState<Shop | null>(null);
    const [trackedOrder, setTrackedOrder] = useState<CustomerOrder | null>(null);


    // 🕵️ Track Order
    const [isTrackOpen, setIsTrackOpen] = useState(false);
    const [trackInput, setTrackInput] = useState(() => {
        return localStorage.getItem('velmo_last_order_ref') || '';
    });
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // 🌙 Theme Management
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // 🛒 Cart State
    const [cart, setCart] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('velmo_cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [addedId, setAddedId] = useState<string | null>(null);

    // 🕵️ Session Tracking
    const [sessionId] = useState(() => {
        const saved = sessionStorage.getItem('velmo_session_id');
        if (saved) return saved;
        const newId = crypto.randomUUID();
        sessionStorage.setItem('velmo_session_id', newId);
        return newId;
    });

    const [categoryViews, setCategoryViews] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem('velmo_category_views');
        return saved ? JSON.parse(saved) : {};
    });

    // 📝 Order State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
    const [submittedOrderRef, setSubmittedOrderRef] = useState<string | null>(null);
    const [submittedTotal, setSubmittedTotal] = useState<number>(0);
    const [ticketImageUrl, setTicketImageUrl] = useState<string | null>(null);
    const [ticketBlob, setTicketBlob] = useState<Blob | null>(null);

    // 📋 Form State
    const [customerInfo, setCustomerInfo] = useState<{
        name: string;
        phone: string;
        address: string;
        location?: { lat: number; lng: number };
    }>(() => {
        const saved = localStorage.getItem('velmo_customer_info');
        return saved ? JSON.parse(saved) : { name: '', phone: '', address: '' };
    });

    // 🕵️ Analytique locale (Produits les plus vus)
    const [productViews, setProductViews] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem('velmo_product_views');
        return saved ? JSON.parse(saved) : {};
    });

    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');

    // 🖼️ Product Modal State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalQuantity, setModalQuantity] = useState(1);

    // 🕵️ Direct product opening (from Search Param OR Route Param)
    useEffect(() => {
        const pid = routeProductId || searchParams.get('p');
        if (pid && products.length > 0) {
            const found = products.find(p => p.id === pid);
            if (found) {
                setSelectedProduct(found);
            }
        }
    }, [routeProductId, searchParams, products]);

    // ✨ Particules stabilisées (évite recalcul Math.random à chaque render)
    const loadingParticles = useMemo(() =>
        Array.from({ length: 20 }, (_, i) => ({
            left: Math.random() * 100,
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            duration: Math.random() * 8 + 5,
            delay: Math.random() * 2,
            glow: i % 3 === 0,
        })), []);

    const bgParticles = useMemo(() =>
        Array.from({ length: 15 }, (_, i) => ({
            left: Math.random() * 100,
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5,
            glow: i % 3 === 0,
        })), []);

    // 🔒 Scroll Lock (Propre)
    useEffect(() => {
        if (isCartOpen || !!selectedProduct) {
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollBarWidth}px`; // Évite le saut horizontal
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [isCartOpen, selectedProduct]);

    // 🔍 Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Tout');
    const [sortOption, setSortOption] = useState<SortOption>('default');
    const [filterOption, setFilterOption] = useState<FilterOption>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [showReferralModal, setShowReferralModal] = useState(false);

    // 📦 Smart Pagination State
    const [visibleCount, setVisibleCount] = useState(12);
    const [searchPlaceholder, setSearchPlaceholder] = useState("Rechercher un produit...");

    useEffect(() => {
        const placeholders = ["iPhone 15 Pro Max...", "Basket Nike Jordan...", "Sac Louis Vuitton...", "Riz Basmati 5kg...", "Parfum Sauvage..."];
        let i = 0;
        const interval = setInterval(() => {
            setSearchPlaceholder(`Rechercher "${placeholders[i]}"`);
            i = (i + 1) % placeholders.length;
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const [liveActivity, setLiveActivity] = useState<{ id: string; text: string } | null>(null);

    // 🚀 LIVE ACTIVITY SIMULATOR (Social Proof)
    useEffect(() => {
        if (!shop || loading) return;

        const NAMES = ['Mamadou', 'Aminata', 'Sekou', 'Fatoumata', 'Thierno', 'Abdoulaye', 'Aïssatou', 'Ibrahima', 'Ousmane', 'Mariam'];
        const CITIES = ['Conakry', 'Bamako', 'Dakar', 'Abidjan', 'Lomé', 'Cotonou', 'Ouaga'];
        const ACTIONS = ['vient de commander', 'est en train de regarder', 'a ajouté au panier'];

        const showActivity = () => {
            const name = NAMES[Math.floor(Math.random() * NAMES.length)];
            const city = CITIES[Math.floor(Math.random() * CITIES.length)];
            const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];

            if (products.length === 0) return;
            const product = products[Math.floor(Math.random() * products.length)];

            setLiveActivity({
                id: Math.random().toString(),
                text: `${name} (${city}) ${action} ${product.name}`
            });

            setTimeout(() => setLiveActivity(null), 5000);
        };

        const timer = setInterval(() => {
            if (Math.random() > 0.7) showActivity();
        }, 12000);

        return () => clearInterval(timer);
    }, [shop, loading, products]);

    // ✨ Mouse tracking for holographic effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const cards = document.getElementsByClassName('product-card');
            for (const card of cards as any) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Reset pagination on search/filter change
    useEffect(() => {
        setVisibleCount(12);
    }, [searchQuery, selectedCategory, sortOption, filterOption]);

    // ❤️ Favorites
    const [favorites, setFavorites] = useState<string[]>(() => {
        const saved = localStorage.getItem('velmo_favorites');
        return saved ? JSON.parse(saved) : [];
    });

    // 📤 Share
    const [copiedLink, setCopiedLink] = useState(false);

    // ============================================================
    // 🔄 EFFECTS
    // ============================================================

    useEffect(() => {
        localStorage.setItem('velmo_cart', JSON.stringify(cart));
    }, [cart]);

    // 🛒 Abandon cart detection
    useEffect(() => {
        if (!shop?.id) return;

        const saveAbandonedCart = async () => {
            if (cart.length === 0) return;
            const total = cart.reduce((sum, item) => sum + (item.product.price_sale || 0) * item.quantity, 0);
            try {
                await supabase.from('abandoned_carts').upsert(
                    {
                        shop_id: shop.id,
                        session_id: sessionId,
                        cart_json: cart.map(item => ({
                            id: item.product.id,
                            name: item.product.name,
                            price: item.product.price_sale,
                            quantity: item.quantity,
                            photo_url: item.product.photo_url ?? null,
                        })),
                        total_amount: total,
                        recovered: false,
                    },
                    { onConflict: 'session_id' }
                );
            } catch (_) {
                // Silencieux
            }
        };

        const handleBeforeUnload = () => saveAbandonedCart();
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') saveAbandonedCart();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [cart, shop?.id, sessionId]);

    useEffect(() => {
        localStorage.setItem('velmo_favorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem('velmo_customer_info', JSON.stringify(customerInfo));
    }, [customerInfo]);

    useEffect(() => {
        localStorage.setItem('velmo_product_views', JSON.stringify(productViews));
    }, [productViews]);

    useEffect(() => {
        localStorage.setItem('velmo_category_views', JSON.stringify(categoryViews));
    }, [categoryViews]);

    // 📡 Analytics Tracking Helper
    const trackEvent = useCallback(async (
        type: ShopEvent['event_type'],
        productId?: string,
        category?: string,
        query?: string,
        metadata?: any
    ) => {
        if (!shop?.id) return;

        try {
            const { error } = await supabase.from('shop_analytics').insert({
                shop_id: shop.id,
                session_id: sessionId,
                event_type: type,
                product_id: productId,
                category: category,
                search_query: query,
                metadata: metadata
            });

            if (error && error.code !== 'PGRST116') { // Ignorer si table manquante ou autre erreur bénigne
                console.warn(`Analytics (${type}) info:`, error.message);
            }
        } catch (err) {
            // Silence absolu en cas d'erreur réseau/code
        }
    }, [shop?.id, sessionId]);

    // Track Visit
    useEffect(() => {
        if (shop?.id) {
            trackEvent('visit');
        }
    }, [shop?.id, trackEvent]);

    // 🔍 Search tracking delay (après trackEvent, avant tout return conditionnel)
    useEffect(() => {
        if (searchQuery.length > 2) {
            const timer = setTimeout(() => {
                trackEvent('search', undefined, undefined, searchQuery);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [searchQuery, trackEvent]);

    useEffect(() => {
        if (slug) {
            loadShopData();

            // 📡 Realtime: Shop Profile Changes
            const shopChannel = supabase
                .channel(`public-shop-${slug}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*', // UPDATE, DELETE
                        schema: 'public',
                        table: 'shops',
                        filter: `slug=eq.${slug}`
                    },
                    (payload) => {
                        console.log('⚡️ Shop update received:', payload);
                        if (payload.eventType === 'DELETE') {
                            navigate('/');
                        } else {
                            setShop(payload.new as Shop);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(shopChannel);
            };
        }
    }, [slug]);

    // 📡 Realtime: Products Changes
    useEffect(() => {
        if (!shop?.id) return;

        const productsChannel = supabase
            .channel(`public-products-${shop.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'products',
                    filter: `shop_id=eq.${shop.id}`
                },
                (payload) => {
                    console.log('⚡️ Product update received:', payload);
                    if (payload.eventType === 'INSERT') {
                        const newProd = payload.new as Product;
                        if (newProd.is_active) {
                            setProducts(prev => [...prev, newProd].sort((a, b) => a.name.localeCompare(b.name)));
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedProd = payload.new as Product;
                        setProducts(prev => {
                            if (!updatedProd.is_active) {
                                return prev.filter(p => p.id !== updatedProd.id);
                            }
                            const existing = prev.find(p => p.id === updatedProd.id);
                            if (existing) {
                                return prev.map(p => p.id === updatedProd.id ? updatedProd : p);
                            } else {
                                return [...prev, updatedProd].sort((a, b) => a.name.localeCompare(b.name));
                            }
                        });
                    } else if (payload.eventType === 'DELETE') {
                        setProducts(prev => prev.filter(p => p.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(productsChannel);
        };
    }, [shop?.id]);

    // 📡 Realtime: Order Status Monitoring
    useEffect(() => {
        const orderToTrack = submittedOrderId || (isTrackOpen && trackInput ? trackInput : null);
        if (!orderToTrack || orderToTrack.length < 20) return; // Basic UUID check

        const orderChannel = supabase
            .channel(`track-order-${orderToTrack}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'customer_orders',
                    filter: `id=eq.${orderToTrack}`
                },
                (payload) => {
                    console.log('⚡️ Order update received:', payload);
                    const updatedOrder = payload.new as CustomerOrder;
                    setTrackedOrder(updatedOrder);

                    if (updatedOrder.status === 'delivered') {
                        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                    }
                }
            )
            .subscribe();

        // Charger l'état initial pour le suivi
        const fetchInitialOrder = async () => {
            const { data } = await supabase.from('customer_orders').select('*').eq('id', orderToTrack).single();
            if (data) setTrackedOrder(data);
        };
        fetchInitialOrder();

        return () => {
            supabase.removeChannel(orderChannel);
        };
    }, [submittedOrderId, isTrackOpen, trackInput]);

    // ============================================================
    // 📊 COMPUTED VALUES
    // ============================================================

    const recommendedProducts = useMemo(() => {
        if (!products.length) return [];

        // Algorithme de recommandation puissant
        return [...products]
            .map(p => {
                let score = 0;

                // 💎 Facteur 1: Intérêt direct (Favoris)
                if (favorites.includes(p.id)) score += 500;

                // 👁️ Facteur 2: Vues produit locales
                score += (productViews[p.id] || 0) * 25;

                // 🏷️ Facteur 3: Affinité par catégorie (Apprentissage des goûts)
                if (p.category && categoryViews[p.category]) {
                    score += categoryViews[p.category] * 10;
                }

                // 🛒 Facteur 4: Cross-selling (Produits liés au panier actuel)
                const isInCategoryInCart = cart.some(item => item.product.category === p.category);
                if (isInCategoryInCart) score += 50;

                // 📦 Facteur 5: Nouveauté (Bonus pour les produits récents)
                const isNew = p.created_at && (new Date().getTime() - new Date(p.created_at).getTime()) < (7 * 24 * 60 * 60 * 1000);
                if (isNew) score += 30;

                return { ...p, relevanceScore: score };
            })
            .filter(p => p.relevanceScore > 0)
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 10);
    }, [products, favorites, productViews, categoryViews, cart]);

    // ============================================================
    // 🔧 HELPERS (Déplacés ici pour éviter les erreurs d'initialisation)
    // ============================================================

    const formatPrice = (price: number | null | undefined) => {
        if (price === null || price === undefined) return "Prix sur demande";
        if (price === 0) return `0 ${shop?.currency || 'GNF'}`;
        return `${price.toLocaleString('fr-FR')} ${shop?.currency || 'GNF'}`;
    };

    // 🎨 Generates a vibrant gradient from a product's name so no-photo products look premium
    const getProductPlaceholderStyle = (name: string): React.CSSProperties => {
        const PALETTES = [
            ['#f97316', '#ea580c'], // orange
            ['#8b5cf6', '#7c3aed'], // violet
            ['#06b6d4', '#0891b2'], // cyan
            ['#10b981', '#059669'], // emerald
            ['#ec4899', '#db2777'], // pink
            ['#f59e0b', '#d97706'], // amber
            ['#3b82f6', '#2563eb'], // blue
            ['#ef4444', '#dc2626'], // red
        ];
        const idx = (name?.charCodeAt(0) || 0) % PALETTES.length;
        const [c1, c2] = PALETTES[idx];
        const initials = name?.slice(0, 2).toUpperCase() || '??';
        return { background: `linear-gradient(135deg, ${c1}, ${c2})`, color: 'white', fontSize: '1.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', letterSpacing: '-0.05em' } as React.CSSProperties;
    };
    const getProductInitials = (name: string) => name?.slice(0, 2).toUpperCase() || '??';

    const getPublicImageUrl = (path: string | null | undefined) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;

        const bucket = 'velmo-media';
        const projectUrl = import.meta.env.VITE_SUPABASE_URL;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;

        return `${projectUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
    };

    const getShopLogo = () => {
        return shop?.logo_url || shop?.logo || null;
    };

    const getShopCover = () => {
        return shop?.cover_url || shop?.cover || null;
    };

    const getStockStatus = (product: Product) => {
        if (!product.is_active) return { label: 'Rupture', color: 'red' };
        if (product.quantity !== null && product.quantity !== undefined) {
            if (product.quantity === 0) return { label: 'Rupture', color: 'red' };
            if (product.quantity <= 5) return { label: `Seulement ${product.quantity} restant${product.quantity > 1 ? 's' : ''}`, color: 'yellow' };
        }
        return { label: 'Disponible', color: 'green' };
    };

    const getCategoryIcon = (category: string) => {
        const cat = category.toLowerCase();
        if (cat === 'tout') return <ShoppingBag size={24} />;
        if (cat.includes('mode') || cat.includes('vêtement') || cat.includes('habit') || cat.includes('chaussure') || cat.includes('sac')) return <Shirt size={24} />;
        if (cat.includes('élec') || cat.includes('info') || cat.includes('tech') || cat.includes('téléphone') || cat.includes('ordinateur')) return <Monitor size={24} />;
        if (cat.includes('beauté') || cat.includes('cosmétique') || cat.includes('soin') || cat.includes('douche') || cat.includes('gel') || cat.includes('parfum') || cat.includes('maquillage')) return <Sparkles size={24} />;
        if (cat.includes('alim') || cat.includes('food') || cat.includes('nourriture') || cat.includes('chocolat') || cat.includes('bonbon') || cat.includes('sucrerie') || cat.includes('épice')) return <Utensils size={24} />;
        if (cat.includes('maison') || cat.includes('déco') || cat.includes('cuisine') || cat.includes('ménage') || cat.includes('entretien') || cat.includes('lessive') || cat.includes('savon') || cat.includes('dissolvant')) return <Home size={24} />;
        if (cat.includes('sport') || cat.includes('fitness') || cat.includes('musculation')) return <Dumbbell size={24} />;
        if (cat.includes('café') || cat.includes('boisson') || cat.includes('thé') || cat.includes('jus') || cat.includes('eau') || cat.includes('vin')) return <Coffee size={24} />;
        if (cat.includes('accessoire') || cat.includes('bijoux') || cat.includes('montre')) return <Zap size={24} />;
        if (cat.includes('art') || cat.includes('design') || cat.includes('peinture')) return <Palette size={24} />;
        if (cat.includes('cadeau') || cat.includes('plaisir') || cat.includes('fête')) return <Gift size={24} />;
        if (cat.includes('bébé') || cat.includes('enfant') || cat.includes('jouet') || cat.includes('scolaire')) return <Users size={24} />;
        return <Package size={24} />;
    };

    const getRecommendedProducts = (currentProduct: Product | null) => {
        if (!currentProduct || !products.length) return [];

        // 🧠 CLUSTERS SÉMANTIQUES (Usage & Émotion)
        const clusters = {
            food: ['alim', 'food', 'nourriture', 'boisson', 'snack', 'chocolat', 'café', 'thé', 'jus', 'sucrerie', 'biscuit', 'gateau', 'divers', 'mate'],
            beauty: ['beauté', 'soin', 'cosmétique', 'cheveux', 'visage', 'savon', 'shampoing', 'hygiène', 'douche'],
            fashion: ['mode', 'vêtement', 'habit', 'chaussure', 'bijoux', 'sac'],
            home: ['maison', 'déco', 'cuisine', 'meuble'],
            tech: ['élec', 'info', 'tech', 'téléphone', 'ordi']
        };

        const getCluster = (product: Product) => {
            const str = (product.category || '' + product.name).toLowerCase();
            for (const [key, keywords] of Object.entries(clusters)) {
                if (keywords.some(k => str.includes(k))) return key;
            }
            return 'other';
        };

        const currentCluster = getCluster(currentProduct);
        const currentWords = currentProduct.name.toLowerCase().split(' ').filter(w => w.length > 3);

        return products
            .filter(p => p.id !== currentProduct.id && p.is_active)
            .map(p => {
                let score = 0;
                const targetCluster = getCluster(p);
                const targetName = p.name.toLowerCase();

                // 🎯 1. Même catégorie exacte (Boost massif)
                if (p.category === currentProduct.category) score += 1000;

                // 🎭 2. Même cluster d'usage (Le chocolat avec les biscuits)
                if (currentCluster !== 'other' && currentCluster === targetCluster) score += 500;

                // 🔍 3. Similarité textuelle (Mots clés partagés)
                currentWords.forEach(word => {
                    if (targetName.includes(word)) score += 200;
                });

                // 👁️ 4. Popularité locale (Tie-breaker léger)
                score += (productViews[p.id] || 0) * 5;

                // 🆕 5. Nouveauté
                const isNew = p.created_at && (Date.now() - new Date(p.created_at).getTime()) < 15 * 86400000;
                if (isNew) score += 50;

                return { ...p, score };
            })
            .sort((a, b) => b.score - a.score)
            .filter(p => p.score > 0) // Ne montrer que ce qui est un minimum pertinent
            .slice(0, 8);
    };

    const categories = useMemo(() =>
        ['Tout', ...new Set(products.map(p => p.category).filter(Boolean))],
        [products]
    );

    const filteredAndSortedProducts = useMemo(() => {
        let result = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.description?.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = selectedCategory === 'Tout' || product.category === selectedCategory;

            let matchesFilter = true;
            if (filterOption === 'available') matchesFilter = product.is_active;
            if (filterOption === 'new') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                matchesFilter = product.created_at ? new Date(product.created_at) > oneWeekAgo : false;
            }

            return matchesSearch && matchesCategory && matchesFilter;
        });

        if (sortOption === 'default') {
            // Tri intelligent : Photos d'abord, puis popularité (vues) puis nouveauté
            result.sort((a, b) => {
                const hasPhotoA = a.photo_url ? 1 : 0;
                const hasPhotoB = b.photo_url ? 1 : 0;
                if (hasPhotoB !== hasPhotoA) return hasPhotoB - hasPhotoA;

                const viewsA = productViews[a.id] || 0;
                const viewsB = productViews[b.id] || 0;
                if (viewsB !== viewsA) return viewsB - viewsA;
                return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            });
        }

        switch (sortOption) {
            case 'popular':
                result.sort((a, b) => {
                    const viewsA = productViews[a.id] || 0;
                    const viewsB = productViews[b.id] || 0;
                    return viewsB - viewsA;
                });
                break;
            case 'price-asc':
                result.sort((a, b) => (a.price_sale || 0) - (b.price_sale || 0));
                break;
            case 'price-desc':
                result.sort((a, b) => (b.price_sale || 0) - (a.price_sale || 0));
                break;
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        return result;
    }, [products, searchQuery, selectedCategory, sortOption, filterOption, productViews]);
    const handleCloseProductModal = useCallback(() => {
        setSelectedProduct(null);
        if (slug) {
            navigate(`/s/${slug}`, { replace: true });
        }
    }, [slug, navigate]);

    // 📊 ULTRA-PREMIUM PRODUCTS GRID
    const productGrid = useMemo(() => {
        const productsList = filteredAndSortedProducts;
        const totalFound = productsList.length;
        const visibleProducts = productsList.slice(0, visibleCount);

        if (totalFound === 0) {
            return (
                <div className="empty-state">
                    <Package size={64} style={{ opacity: 0.2 }} />
                    <p>Aucun produit ne correspond à votre recherche.</p>
                </div>
            );
        }

        return (
            <>
                <div className="product-grid">
                    {visibleProducts.map((product, index) => {
                        const isFavorite = favorites.includes(product.id);
                        const cartItem = cart.find(item => item.product.id === product.id);
                        const quantity = cartItem ? cartItem.quantity : 0;

                        const isHot = (productViews[product.id] || 0) >= 3;
                        const isNew = product.created_at &&
                            (Date.now() - new Date(product.created_at).getTime()) < 7 * 86400000;

                        return (
                            <motion.div
                                key={product.id}
                                className="product-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: Math.min(index * 0.05, 0.6) }}
                                onClick={() => {
                                    navigate(`/s/${shop?.slug}/p/${product.id}`, { replace: true });
                                    setSelectedProduct(product);
                                    setModalQuantity(1);
                                    trackEvent('view_product', product.id, product.category || undefined);
                                    setProductViews(prev => ({
                                        ...prev,
                                        [product.id]: (prev[product.id] || 0) + 1
                                    }));
                                    if (product.category) {
                                        setCategoryViews(prev => ({
                                            ...prev,
                                            [product.category!]: (prev[product.category!] || 0) + 1
                                        }));
                                    }
                                }}
                            >
                                <div className="card-img-container">
                                    {product.photo_url ? (
                                        <img
                                            src={getPublicImageUrl(product.photo_url) || ''}
                                            alt={product.name}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div style={{ position: 'absolute', inset: 0, ...getProductPlaceholderStyle(product.name) }}>
                                            {getProductInitials(product.name)}
                                        </div>
                                    )}

                                    <div className="card-badge-overlay">
                                        {isNew && <span className="card-luxury-badge new">Nouveau</span>}
                                        {isHot && <span className="card-luxury-badge hot">Populaire</span>}
                                        {product.price_sale < (product.price_regular || 0) && (
                                            <span className="card-luxury-badge discount">Promo</span>
                                        )}
                                    </div>

                                    <button
                                        className={`card-fav-btn ${isFavorite ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(product.id);
                                        }}
                                    >
                                        <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                <div className="card-content">
                                    <div className="product-meta-row">
                                        {product.category && (
                                            <span className="product-category">{product.category}</span>
                                        )}
                                        {/* 🏷️ DYNAMIC BADGES */}
                                        {(productViews[product.id] || 0) > 100 ? (
                                            <span className="product-badge badge-hot">🔥 Meilleure Vente</span>
                                        ) : product.created_at && (new Date().getTime() - new Date(product.created_at).getTime() < 7 * 24 * 60 * 60 * 1000) ? (
                                            <span className="product-badge badge-new">✨ Nouveau</span>
                                        ) : null}
                                    </div>
                                    <h3 className="product-title">{product.name}</h3>

                                    <div className="product-price-row">
                                        <div className="price-glass-container">
                                            <span className="product-price">{formatPrice(product.price_sale)}</span>
                                            {product.price_regular && product.price_regular > product.price_sale && (
                                                <span className="product-price-old">{formatPrice(product.price_regular)}</span>
                                            )}
                                        </div>
                                    </div>

                                    {quantity > 0 ? (
                                        <div className="card-qty-control" onClick={(e) => e.stopPropagation()}>
                                            <button className="qty-btn" onClick={() => updateQuantity(product.id, -1)}>
                                                <Minus size={16} />
                                            </button>
                                            <span className="qty-val">{quantity}</span>
                                            <button className="qty-btn" onClick={() => updateQuantity(product.id, 1)}>
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="card-actions-wrapper">
                                            <button
                                                className="btn-card-add"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(product);
                                                }}
                                            >
                                                <Plus size={18} />
                                                <span>Ajouter</span>
                                            </button>
                                            <button
                                                className="btn-card-buy"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(product);
                                                    setIsCartOpen(true);
                                                }}
                                            >
                                                Acheter
                                            </button>
                                        </div>
                                    )}

                                    {(shop?.whatsapp || shop?.phone) && (
                                        <button
                                            className="btn-wa-product-mini"
                                            onClick={(e) => openProductWhatsApp(e, product)}
                                            style={{
                                                marginTop: '8px',
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                padding: '8px',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(37, 211, 102, 0.3)',
                                                background: 'transparent',
                                                color: '#25d366',
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <MessageCircle size={14} fill="currentColor" />
                                            Commander via WhatsApp
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {totalFound > visibleCount && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                        <button
                            className="btn-show-more"
                            onClick={() => setVisibleCount(prev => prev + 12)}
                        >
                            Voir plus de pépites
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </>
        );
    }, [filteredAndSortedProducts, favorites, cart, visibleCount, productViews, shop]);

    const totalAmount = cart.reduce((acc, item) => acc + ((item.product.price_sale || 0) * item.quantity), 0);
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    // ============================================================
    // 📡 DATA LOADING
    // ============================================================

    const loadShopData = async () => {
        try {
            setLoading(true);
            console.log('🔍 Chargement de la boutique pour le slug:', slug);

            // Charger la boutique (publique uniquement)
            const { data: shopData, error: shopError } = await supabase
                .from('shops')
                .select('*')
                .eq('slug', (slug || '').toLowerCase())
                .eq('is_public', true)
                .maybeSingle();

            if (shopError || !shopData) {
                console.error('❌ Boutique introuvable ou non publique:', shopError);
                throw new Error('Boutique introuvable');
            }

            console.log('✅ Boutique trouvée:', shopData);
            setShop(shopData);

            // Charger les produits actifs
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('shop_id', shopData.id)
                .eq('is_active', true)
                .order('name');

            if (productError) throw productError;

            console.log('📦 Produits chargés:', productData?.length);
            setProducts(productData || []);

            // 🎨 Charger et appliquer le thème vitrine
            try {
                const { data: customData } = await supabase
                    .from('shop_customizations')
                    .select('*')
                    .eq('shop_id', shopData.id)
                    .maybeSingle();

                if (customData) {
                    applyTheme(customData.theme_id, {
                        '--accent': customData.primary_color,
                        '--accent-hover': customData.secondary_color,
                    });
                }
            } catch (_) {
                // Pas de customisation → thème par défaut
            }

        } catch (err) {
            console.error('💥 Erreur chargement:', err);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // 🛒 CART ACTIONS
    // ============================================================

    const addToCart = (product: Product, quantity: number = 1) => {
        if (navigator.vibrate) navigator.vibrate(50);

        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity }];
        });

        // Analytics Intelligent
        trackEvent('add_to_cart', product.id, product.category || undefined, undefined, { quantity });

        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 1500);
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === productId);
            if (!existing) return prev;

            const newQty = existing.quantity + delta;
            if (newQty <= 0) {
                // Analytics
                trackEvent('remove_from_cart', productId);
                return prev.filter(item => item.product.id !== productId);
            }

            return prev.map(item =>
                item.product.id === productId
                    ? { ...item, quantity: newQty }
                    : item
            );
        });
    };

    const setManualQuantity = (productId: string, quantity: number) => {
        const val = Math.max(0, quantity);
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                return { ...item, quantity: val };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const toggleFavorite = (productId: string) => {
        if (navigator.vibrate) navigator.vibrate(30);

        const isFav = favorites.includes(productId);
        if (!isFav) {
            trackEvent('view_product', productId, undefined, undefined, { type: 'favorite_add' });
        }

        setFavorites(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    // ============================================================
    // 🎫 TICKET IMAGE GENERATOR (Canvas)
    // ============================================================

    const generateOrderTicketImage = async (orderId?: string): Promise<Blob | null> => {
        if (!shop) return null;

        const W = 480;
        const PADDING = 28;
        const HEADER_H = 160;
        const ITEM_H = 56;
        const QR_SIZE = 110;
        const FOOTER_H = 220 + QR_SIZE; // Plus de place pour le QR Code
        const totalHeight = HEADER_H + (cart.length * ITEM_H) + FOOTER_H;

        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = totalHeight;
        const ctx = canvas.getContext('2d')!;

        // --- Background ---
        const bgGrad = ctx.createLinearGradient(0, 0, 0, totalHeight);
        bgGrad.addColorStop(0, '#0d0d12');
        bgGrad.addColorStop(1, '#15151f');
        ctx.fillStyle = bgGrad;
        roundRect(ctx, 0, 0, W, totalHeight, 20);
        ctx.fill();

        // --- Header accent bar ---
        const barGrad = ctx.createLinearGradient(0, 0, W, 0);
        barGrad.addColorStop(0, '#ff5500');
        barGrad.addColorStop(1, '#ff8c00');
        ctx.fillStyle = barGrad;
        ctx.fillRect(0, 0, W, 5);

        // --- Velmo Logo (simple V) ---
        ctx.fillStyle = '#ff5500';
        roundRect(ctx, PADDING, 22, 44, 44, 10);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('V', PADDING + 22, 51);

        // --- Shop name ---
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(shop.name.toUpperCase(), PADDING + 58, 42);

        ctx.fillStyle = '#888';
        ctx.font = '13px Arial';
        ctx.fillText('velmo.market', PADDING + 58, 60);

        // --- Order reference & date ---
        const ref = orderId ? orderId.slice(0, 8).toUpperCase() : 'VEL-' + Math.random().toString(36).slice(2, 6).toUpperCase();
        const now = new Date();
        const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
        ctx.fillStyle = '#ff5500';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`#${ref}`, W - PADDING, 42);
        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.fillText(dateStr, W - PADDING, 60);

        // --- Separator ---
        ctx.strokeStyle = '#2a2a3a';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(PADDING, 82);
        ctx.lineTo(W - PADDING, 82);
        ctx.stroke();
        ctx.setLineDash([]);

        // --- "COMMANDE" label ---
        ctx.fillStyle = '#555';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('COMMANDE', PADDING, 105);

        // --- Column headers ---
        ctx.fillStyle = '#777';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('PRODUIT', PADDING, 128);
        ctx.textAlign = 'center';
        ctx.fillText('QTÉ', W / 2 + 20, 128);
        ctx.textAlign = 'right';
        ctx.fillText('PRIX', W - PADDING, 128);

        // --- Separator ---
        ctx.fillStyle = '#2a2a3a';
        ctx.fillRect(PADDING, 136, W - PADDING * 2, 1);

        // --- Product rows ---
        let currY = HEADER_H;
        for (const item of cart) {
            const price = (item.product.price_sale || 0) * item.quantity;
            const name = item.product.name.length > 26 ? item.product.name.slice(0, 25) + '…' : item.product.name;

            ctx.fillStyle = '#e5e5e5';
            ctx.font = '13px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(name, PADDING, currY + 22);

            ctx.fillStyle = '#ff8c00';
            ctx.font = 'bold 13px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`×${item.quantity}`, W / 2 + 20, currY + 22);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(formatPrice(price), W - PADDING, currY + 22);

            // Row separator
            ctx.fillStyle = '#1e1e2a';
            ctx.fillRect(PADDING, currY + 32, W - PADDING * 2, 1);

            currY += ITEM_H;
        }

        // --- Total ---
        const totalY = currY + 30;
        const totGrad = ctx.createLinearGradient(PADDING, totalY - 4, W - PADDING, totalY - 4 + 48);
        totGrad.addColorStop(0, '#1a1a2a');
        totGrad.addColorStop(1, '#222235');
        ctx.fillStyle = totGrad;
        roundRect(ctx, PADDING, totalY - 4, W - PADDING * 2, 48, 10);
        ctx.fill();

        ctx.fillStyle = '#999';
        ctx.font = '13px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('TOTAL À PAYER', PADDING + 14, totalY + 22);

        ctx.fillStyle = '#ff5500';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(formatPrice(totalAmount), W - PADDING - 14, totalY + 24);

        // --- Delivery info ---
        const infoY = totalY + 74;
        ctx.fillStyle = '#555';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('LIVRAISON À', PADDING, infoY);

        ctx.fillStyle = '#ddd';
        ctx.font = 'bold 13px Arial';
        ctx.fillText(customerInfo.address || 'À confirmer', PADDING, infoY + 18);

        if (customerInfo.name) {
            ctx.fillStyle = '#777';
            ctx.font = '12px Arial';
            ctx.fillText(`Client : ${customerInfo.name}`, PADDING, infoY + 36);
        }

        // --- QR Code ---
        const qrY = infoY + 60;
        const trackingUrl = `https://velmo.market/order/${ref}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&data=${encodeURIComponent(trackingUrl)}&color=ffffff&bgcolor=15151f`;

        try {
            const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = () => reject();
                img.src = qrUrl;
            });
            ctx.drawImage(qrImg, W / 2 - QR_SIZE / 2, qrY, QR_SIZE, QR_SIZE);
            ctx.fillStyle = '#555';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Scannez pour suivre la commande', W / 2, qrY + QR_SIZE + 15);
        } catch (e) {
            console.warn('QR Code generation failed');
        }

        // --- Trust badge ---
        const badgeY = totalHeight - 52;
        ctx.fillStyle = '#1a2a1a';
        roundRect(ctx, PADDING, badgeY, (W - PADDING * 2) / 2 - 6, 32, 8);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✓ Paiement à la livraison', PADDING + (W - PADDING * 2) / 4 - 3, badgeY + 20);

        ctx.fillStyle = '#1a1a2a';
        roundRect(ctx, W / 2 + 6, badgeY, (W - PADDING * 2) / 2 - 6, 32, 8);
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.font = '11px Arial';
        ctx.fillText('Propulsé par Velmo', W - PADDING - (W - PADDING * 2) / 4 + 3, badgeY + 20);

        return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/png', 0.95));
    };

    // Helper to draw rounded rects (compatible avec tous les navigateurs)
    const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    };

    // Ouverture WhatsApp (fallback texte si partage image impossible)
    const openWhatsApp = (orderId?: string) => {
        if (!shop) return;
        const shopPhone = (shop.whatsapp || shop.phone || '').replace(/\D/g, '');
        const ref = orderId ? orderId.slice(0, 8).toUpperCase() : '';

        // Liste détaillée des produits dans le message
        const itemLines = cart.map(item => {
            const subtotal = formatPrice((item.product.price_sale || 0) * item.quantity);
            return `  • *${item.product.name}* × ${item.quantity} = ${subtotal}`;
        }).join('\n');

        const msg = [
            `🛒 *NOUVELLE COMMANDE — ${shop.name}*`,
            ``,
            `*PRODUITS :*`,
            itemLines,
            ``,
            `💰 *TOTAL : ${formatPrice(totalAmount)}*`,
            ``,
            `👤 *Client :* ${customerInfo.name || 'Non renseigné'}`,
            `📍 *Quartier/Repère :* ${customerInfo.address}`,
            customerInfo.location
                ? `🌐 *Position GPS :* https://maps.google.com?q=${customerInfo.location.lat},${customerInfo.location.lng}`
                : '',
            ref ? `🔖 *Réf :* #${ref}` : '',
            ``,
            `_Commande passée via velmo.market_`
        ].filter(Boolean).join('\n');

        window.open(`https://wa.me/${shopPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    // Bouton WhatsApp rapide par produit
    const openProductWhatsApp = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (!shop) return;
        const shopPhone = (shop.whatsapp || shop.phone || '').replace(/\D/g, '');
        if (!shopPhone) return;
        const shopUrl = `${window.location.origin}${window.location.pathname}`;
        const msg = [
            `🛒 *Je suis intéressé(e) par ce produit :*`,
            ``,
            `📦 *${product.name}*`,
            `💰 *Prix :* ${formatPrice(product.price_sale)}`,
            product.category ? `🏷️ *Catégorie :* ${product.category}` : '',
            ``,
            `🔗 Boutique : ${shopUrl}`,
            ``,
            `_Via velmo.market_`
        ].filter(Boolean).join('\n');
        window.open(`https://wa.me/${shopPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const requestLocation = () => {
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCustomerInfo(prev => ({
                    ...prev,
                    location: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                }));
            },
            () => {
                alert("Impossible de récupérer votre position. Veuillez activer le GPS de votre appareil.");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    // ============================================================
    // 📝 ORDER SUBMISSION (CONFORME AU RAPPORT - items_json)
    // ============================================================

    const handleSubmitOrder = async (e: FormEvent) => {
        e.preventDefault();
        if (!shop || cart.length === 0) return;

        try {
            setIsSubmitting(true);
            const currentTotal = totalAmount; // Garder en mémoire
            setSubmittedTotal(currentTotal);

            // 1. Enregistrement Supabase
            const items_json: OrderItem[] = cart.map(item => ({
                id: item.product.id,
                name: item.product.name,
                price: item.product.price_sale || 0,
                quantity: item.quantity,
                photo_url: item.product.photo_url || null
            }));

            const { data, error } = await supabase
                .from('customer_orders')
                .insert({
                    shop_id: shop.id,
                    customer_name: customerInfo.name || 'Client WhatsApp',
                    customer_phone: customerInfo.phone || null,
                    items_json: items_json,
                    total_amount: currentTotal,
                    status: 'pending',
                    delivery_method: deliveryMethod || 'pickup',
                    customer_address: customerInfo.address,
                    customer_location: customerInfo.location ? JSON.stringify(customerInfo.location) : null
                })
                .select('id, short_ref')
                .single();

            if (error) throw error;

            trackEvent('checkout_success', undefined, undefined, undefined, { orderId: data?.id, total: currentTotal });

            // 2. Générer le ticket image
            const blob = await generateOrderTicketImage(data?.id);
            if (blob) {
                const url = URL.createObjectURL(blob);
                setTicketImageUrl(url);
                setTicketBlob(blob);
            }

            // 3. Ouvrir WhatsApp
            openWhatsApp(data?.id);

            // 3.1 Téléchargement automatique du ticket (OPTIONNEL, mais demandé par utilisateur)
            if (blob) {
                downloadTicket(blob, data?.short_ref || data?.id?.slice(0, 8));
            }

            // 4. Nettoyage
            setSubmittedOrderId(data?.id || null);
            setSubmittedOrderRef(data?.short_ref || (data?.id ? data.id.slice(0, 8).toUpperCase() : null));
            setOrderSuccess(true);
            setCart([]);
            localStorage.removeItem('velmo_cart');

        } catch (err) {
            console.warn('Checkout error:', err);
            const fallbackRef = `WA-${Date.now().toString(36).toUpperCase()}`;
            setSubmittedOrderRef(fallbackRef);
            setOrderSuccess(true);
            openWhatsApp(); // Fallback direct WhatsApp sans DB
            setCart([]);
            localStorage.removeItem('velmo_cart');
        } finally {
            setIsSubmitting(false);
        }
    };

    const downloadTicket = (blob?: Blob | null, orderId?: string | null) => {
        const b = blob || ticketBlob;
        if (!b) return;
        const url = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-velmo-${orderId?.slice(0, 6) || 'cmd'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const shareTicket = async () => {
        if (!ticketBlob) return;
        const ticketFile = new File([ticketBlob], 'ticket-velmo.png', { type: 'image/png' });
        try {
            if (navigator.canShare?.({ files: [ticketFile] })) {
                await navigator.share({ files: [ticketFile], title: `Commande - ${shop?.name}` });
            } else {
                downloadTicket();
            }
        } catch {
            downloadTicket();
        }
    };

    // ============================================================
    // 🎨 RENDER: LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="shop-loading-screen">
                <div className="particles-container">
                    {loadingParticles.map((p, i) => (
                        <div
                            key={i}
                            className={`particle ${p.glow ? 'glow' : ''}`}
                            style={{
                                left: `${p.left}%`,
                                width: `${p.width}px`,
                                height: `${p.height}px`,
                                animationDuration: `${p.duration}s`,
                                animationDelay: `${p.delay}s`
                            }}
                        />
                    ))}
                </div>

                <div className="loader-content">
                    <div className="loader-logo-container">
                        <div className="loader-ring"></div>
                        <div className="loader-ring-inner"></div>
                        <svg viewBox="0 0 100 100" fill="none" className="loader-logo">
                            <rect width="100" height="100" rx="28" fill="#ff5500" />
                            <path d="M32 38L50 72L68 38" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="loading-text">Ouverture de la boutique...</h2>
                        <p className="loading-subtext">Chargement des produits en cours</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ============================================================
    // 🎨 RENDER: ERROR (BOUTIQUE NON TROUVÉE)
    // ============================================================

    if (!shop) {
        return (
            <div className="error-screen">
                <Store className="error-icon" size={64} />
                <h1>Boutique introuvable</h1>
                <p>Cette boutique n'existe pas ou n'est pas publique.</p>
                <a href="/" className="btn-back-home">Retour à l'accueil</a>
            </div>
        );
    }

    const handleCategoryClick = (cat: string) => {
        setSelectedCategory(cat);
        trackEvent('category_click', undefined, cat);
        if (cat !== 'Tout') {
            setCategoryViews(prev => ({
                ...prev,
                [cat]: (prev[cat] || 0) + 1
            }));
        }
    };

    // ============================================================
    // 🎨 RENDER: MAIN
    // ============================================================

    return (
        <div className="shop-container">
            <Helmet>
                <title>{selectedProduct ? `${selectedProduct.name} | Boutique ${shop.name} Velmo` : `${shop.name} - Boutique en ligne à ${shop.location || 'Conakry'}`}</title>
                <meta name="description" content={selectedProduct
                    ? `${selectedProduct.name} - ${selectedProduct.description || ''}. Disponible chez ${shop.name} à ${shop.location || 'Conakry'}. Prix: ${formatPrice(selectedProduct.price_sale)}.`
                    : `${shop.name}: ${shop.description || `Boutique de ${shop.category || 'qualité'} à ${shop.location || 'Conakry'}`}. Commandez en ligne et faites-vous livrer partout en Guinée.`}
                />
                <meta property="og:title" content={selectedProduct ? selectedProduct.name : shop.name} />
                <meta property="og:description" content={selectedProduct ? (selectedProduct.description || '') : (shop.description || '')} />
                <meta property="og:image" content={selectedProduct ? getPublicImageUrl(selectedProduct.photo_url) : (getPublicImageUrl(getShopLogo()) || '')} />
                <meta property="og:type" content="product" />
                <meta name="keywords" content={`${shop.name}, ${shop.location || 'Conakry'}, Guinée, boutique en ligne, ${categories.join(', ')}, velmo market, ${selectedProduct ? selectedProduct.name : ''}`} />
                <link rel="canonical" href={`https://velmo.org/s/${shop.slug}${selectedProduct ? `/p/${selectedProduct.id}` : ''}`} />

                {/* 🛡️ STRUCTURED DATA: JSON-LD */}
                <script type="application/ld+json">
                    {JSON.stringify(
                        selectedProduct ? {
                            "@context": "https://schema.org/",
                            "@type": "Product",
                            "name": selectedProduct.name,
                            "image": getPublicImageUrl(selectedProduct.photo_url),
                            "description": selectedProduct.description || '',
                            "brand": {
                                "@type": "Brand",
                                "name": shop.name
                            },
                            "offers": {
                                "@type": "Offer",
                                "priceCurrency": "GNF",
                                "price": selectedProduct.price_sale,
                                "availability": selectedProduct.is_active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                                "url": `https://velmo.org/s/${shop.slug}/p/${selectedProduct.id}`
                            }
                        } : {
                            "@context": "https://schema.org/",
                            "@type": "Store",
                            "name": shop.name,
                            "description": shop.description || '',
                            "image": getPublicImageUrl(getShopLogo()),
                            "telephone": shop.phone || shop.whatsapp,
                            "address": {
                                "@type": "PostalAddress",
                                "streetAddress": shop.address || '',
                                "addressLocality": shop.location || 'Conakry',
                                "addressCountry": "GN"
                            },
                            "url": `https://velmo.org/s/${shop.slug}`
                        }
                    )}
                </script>
            </Helmet>
            {/* ✨ Particles Background */}
            <div className="particles-container">
                {bgParticles.map((p, i) => (
                    <div
                        key={i}
                        className={`particle ${p.glow ? 'glow' : ''}`}
                        style={{
                            left: `${p.left}%`,
                            width: `${p.width}px`,
                            height: `${p.height}px`,
                            animationDuration: `${p.duration}s`,
                            animationDelay: `${p.delay}s`
                        }}
                    />
                ))}
            </div>

            {/* 🔝 Premium Sticky Nav */}
            <nav className="sticky-nav">
                <div className="nav-brand-area">
                    <Link to="/" className="btn-nav-back">
                        <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
                    </Link>
                    <div className="nav-shop-info">
                        <span className="nav-shop-label">Market</span>
                        <span className="nav-shop-name">{shop.name}</span>
                    </div>
                </div>

                <div className="nav-actions-area">
                    <Link
                        to="/search"
                        className="btn-nav-action marketplace-btn"
                        title="Explorer le Marketplace"
                    >
                        <ShoppingBag size={20} />
                        <span className="btn-label-desktop">Marketplace</span>
                    </Link>
                    <button
                        onClick={() => setShowReferralModal(true)}
                        className="btn-nav-action referral-glow"
                        title="Parrainez & Gagnez"
                    >
                        <Gift size={20} className="text-orange-500" />
                    </button>
                    <button
                        onClick={() => setIsTrackOpen(true)}
                        className="btn-nav-action"
                        title="Suivre ma commande"
                    >
                        <Package size={20} />
                    </button>
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="btn-nav-action"
                        title="Changer le thème"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="btn-nav-cart"
                    >
                        <ShoppingCart size={20} />
                        {cart.length > 0 && (
                            <span className="cart-badge-mini">
                                {cart.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                        )}
                    </button>
                </div>
            </nav>

            {/* 🆕 FAB Track supprimé à la demande de l'utilisateur ("sale") - Accessible via header */}

            {/* ===================== SHOP HEADER ===================== */}

            {/* ===================== PREMIUM SHOP HEADER ===================== */}
            <header className="shop-header">
                {/* 📸 IMMERSIVE COVER IMAGE */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="shop-cover"
                >
                    {getShopCover() ? (
                        <motion.img
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 10, ease: "linear" }}
                            src={getPublicImageUrl(getShopCover()) || ''}
                            alt={`Couverture ${shop.name}`}
                        />
                    ) : (
                        <div className="shop-cover-fallback"></div>
                    )}
                    <div className="shop-cover-overlay"></div>
                </motion.div>

                <div className="shop-header-content">
                    {/* 🖼️ Luxury Logo Container */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                        className="shop-logo-container"
                    >
                        {getShopLogo() ? (
                            <img src={getPublicImageUrl(getShopLogo()) || ''} alt={shop.name} className="shop-logo" />
                        ) : (
                            <div className="shop-logo-fallback">
                                {shop.name.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                    </motion.div>

                    {/* 🏅 Dynamic Badges */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="shop-badge-container"
                    >
                        {shop.is_verified && (
                            <span className="shop-badge verified">
                                <BadgeCheck size={14} />
                                Boutique vérifiée
                            </span>
                        )}
                        {shop.orders_count && shop.orders_count > 50 && (
                            <span className="shop-badge orders">
                                <Users size={14} />
                                +{shop.orders_count} commandes
                            </span>
                        )}
                    </motion.div>

                    {/* 📛 High-End Title */}
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="shop-title"
                    >
                        {shop.name}
                    </motion.h1>

                    {/* 📍 Glass Information Hub */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="shop-info-bar"
                    >
                        {shop.location && (
                            <div className="info-badge">
                                <MapPin size={16} />
                                <span>{shop.location}</span>
                            </div>
                        )}
                        {shop.opening_hours && (
                            <div className="info-badge">
                                <Clock size={16} />
                                <span>{shop.opening_hours}</span>
                            </div>
                        )}
                        {(shop.whatsapp || shop.phone) && (
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href={`https://wa.me/${(shop.whatsapp || shop.phone)?.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="info-badge whatsapp-badge"
                            >
                                <MessageCircle size={16} fill="currentColor" />
                                <span>Contacter</span>
                            </motion.a>
                        )}
                    </motion.div>

                    {/* 📝 Sophisticated Description */}
                    {shop.description && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="shop-description"
                        >
                            {shop.description}
                        </motion.p>
                    )}

                    {/* 🎁 PROMINENT REFERRAL BANNER */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.9, type: "spring" }}
                        className="referral-banner-mini"
                        onClick={() => setShowReferralModal(true)}
                    >
                        <div className="banner-gift-icon">
                            <Gift size={24} />
                        </div>
                        <div className="banner-text">
                            <h4>Parrainez & Gagnez des Cadeaux ! 🎁</h4>
                            <p>Partagez {shop.name} et recevez des récompenses exclusives.</p>
                        </div>
                        <ArrowRight size={20} className="banner-arrow" />
                    </motion.div>
                </div>

                {/* 🔍 Premium Integrated Search & Filter Row */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="search-filter-row"
                >
                    <div className="search-container">
                        <motion.div
                            className="search-icon-wrapper"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Search size={24} />
                        </motion.div>
                        <input
                            type="text"
                            className="search-input"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                className="btn-clear-search"
                                onClick={() => setSearchQuery('')}
                            >
                                <X size={18} />
                            </button>
                        )}
                        {/* 🔍 Instant Search Dropdown */}
                        <AnimatePresence>
                            {searchQuery.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="search-dropdown"
                                >
                                    {filteredAndSortedProducts.length > 0 ? (
                                        filteredAndSortedProducts.map(product => (
                                            <div
                                                key={product.id}
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setSearchQuery('');
                                                }}
                                                className="search-result-item"
                                            >
                                                <div className="search-result-img">
                                                    {product.photo_url ? (
                                                        <img src={getPublicImageUrl(product.photo_url) || ''} alt={product.name} />
                                                    ) : (
                                                        <div className="search-result-fallback">
                                                            <Package size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="search-result-info">
                                                    <h4>{product.name}</h4>
                                                    <p>{formatPrice(product.price_sale)}</p>
                                                </div>
                                                <div className="search-result-plus">
                                                    <Plus size={18} />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="search-empty-state">
                                            <div className="search-empty-icon">
                                                <Search size={40} />
                                            </div>
                                            <p className="search-empty-text">Pas de produit ici...</p>
                                            <Link
                                                to="/search"
                                                className="btn-search-global"
                                                onClick={() => trackEvent('search_global_click', searchQuery)}
                                            >
                                                <Globe size={16} />
                                                Chercher dans tout le Marketplace
                                            </Link>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button
                        className={`filter-toggle ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={20} />
                        <span>Filtres</span>
                        <ChevronDown size={18} className={`chevron ${showFilters ? 'rotated' : ''}`} />
                    </button>
                </motion.div>

                {/* Filters Panel Expansion */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            className="filters-panel"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <div className="filter-group">
                                <span className="filter-label">Trier la collection</span>
                                <div className="filter-options">
                                    {[
                                        { value: 'default', label: 'Défaut' },
                                        { value: 'price-asc', label: 'Prix croissant' },
                                        { value: 'price-desc', label: 'Prix décroissant' },
                                        { value: 'name', label: 'Alphabétique' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            className={`filter-chip ${sortOption === opt.value ? 'active' : ''}`}
                                            onClick={() => setSortOption(opt.value as SortOption)}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-group">
                                <span className="filter-label">Sélectionner par état</span>
                                <div className="filter-options">
                                    {[
                                        { value: 'all', label: 'Tous les produits' },
                                        { value: 'available', label: 'En stock uniquement' },
                                        { value: 'new', label: 'Nouveautés' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            className={`filter-chip ${filterOption === opt.value ? 'active' : ''}`}
                                            onClick={() => setFilterOption(opt.value as FilterOption)}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 🏷️ Categories: Premium Visual Grid */}
                {
                    categories.length > 1 && (
                        <div className="category-pills-container">
                            <div className="category-visual-grid">
                                {categories.map(cat => (
                                    <motion.div
                                        key={cat as string}
                                        whileHover={{ y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleCategoryClick(cat as string)}
                                        className={`category-card ${selectedCategory === cat ? 'active' : ''}`}
                                    >
                                        <div className="cat-icon">
                                            {getCategoryIcon(cat as string)}
                                        </div>
                                        <span className="cat-name">{cat as string}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )
                }
            </header >

            {/* ===================== PRODUCTS GRID ===================== */}
            < section className="products-section" >
                {/* ✨ Section Intelligente "Pour Vous" */}
                {
                    !searchQuery && selectedCategory === 'Tout' && recommendedProducts.length > 0 && (
                        <div className="recommendations-container">
                            {/* Header section */}
                            <div className="rec-section-header">
                                <div className="rec-section-title-group">
                                    <div className="rec-title-accent" />
                                    <div className="rec-title-text">
                                        <h3 className="rec-section-title">
                                            ✨ Sélection pour vous
                                        </h3>
                                        <p className="rec-section-subtitle">
                                            Basé sur vos préférences et produits populaires
                                        </p>
                                    </div>
                                </div>
                                <span className="rec-count-badge">{recommendedProducts.length} produit{recommendedProducts.length > 1 ? 's' : ''}</span>
                            </div>

                            {/* Scroll horizontal */}
                            <div className="rec-scroll">
                                {recommendedProducts.map((product) => {
                                    const isHot = (productViews[product.id] || 0) >= 3;
                                    const isFav = favorites.includes(product.id);
                                    const isNew = product.created_at &&
                                        (Date.now() - new Date(product.created_at).getTime()) < 7 * 86400000;
                                    const inCart = cart.find(i => i.product.id === product.id);

                                    return (
                                        <motion.div
                                            key={`rec-${product.id}`}
                                            className="rec-card-v2"
                                            whileTap={{ scale: 0.96 }}
                                            onClick={() => {
                                                navigate(`/s/${shop?.slug}/p/${product.id}`, { replace: true });
                                                setSelectedProduct(product);
                                                setModalQuantity(1);
                                            }}
                                        >
                                            {/* Image */}
                                            <div className="rec-img-v2">
                                                {product.photo_url ? (
                                                    <img
                                                        src={getPublicImageUrl(product.photo_url) || ''}
                                                        alt={product.name}
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Produit';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="rec-img-placeholder" style={getProductPlaceholderStyle(product.name)}>
                                                        {getProductInitials(product.name)}
                                                    </div>
                                                )}
                                                {/* Badge overlay: priorité fav > hot > new */}
                                                {isFav ? (
                                                    <span className="rec-overlay-badge fav">❤️ Favori</span>
                                                ) : isHot ? (
                                                    <span className="rec-overlay-badge hot">🔥 Populaire</span>
                                                ) : isNew ? (
                                                    <span className="rec-overlay-badge fresh">✦ Nouveau</span>
                                                ) : null}
                                            </div>

                                            {/* Body */}
                                            <div className="rec-body">
                                                {product.category && (
                                                    <span className="rec-category">{product.category}</span>
                                                )}
                                                <p className="rec-name">{product.name}</p>
                                                <p className="rec-price">{formatPrice(product.price_sale)}</p>
                                                <button
                                                    className="rec-add-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(product);
                                                    }}
                                                >
                                                    {inCart ? (
                                                        <><Check size={13} /> Dans le panier</>
                                                    ) : (
                                                        <><Plus size={13} /> Ajouter</>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                }

                {productGrid}
            </section >

            {/* ===================== SHOP INFORMATION CARD ===================== */}
            < section className="shop-info-section" >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="shop-info-card"
                >
                    <div className="shop-info-grid">

                        {/* 📞 Column 1: Contact & Identity */}
                        <div className="shop-info-col">
                            <div className="info-col-header">
                                <div className="info-icon-wrapper primary">
                                    <Store size={24} />
                                </div>
                                <h3 className="info-col-title">Contactez-nous</h3>
                            </div>

                            <div className="info-items-list">
                                {(shop.phone || shop.whatsapp) && (
                                    <a href={`tel:${shop.phone || shop.whatsapp}`} className="info-item-link">
                                        <div className="item-icon-circle">
                                            <Phone size={18} />
                                        </div>
                                        <div className="item-content">
                                            <span className="item-label">Téléphone</span>
                                            <span className="item-value">{shop.phone || shop.whatsapp}</span>
                                        </div>
                                    </a>
                                )}

                                {shop.whatsapp && (
                                    <a href={`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="info-item-link whatsapp">
                                        <div className="item-icon-circle whatsapp">
                                            <MessageCircle size={18} />
                                        </div>
                                        <div className="item-content">
                                            <span className="item-label">WhatsApp</span>
                                            <span className="item-value">Discuter en ligne</span>
                                        </div>
                                    </a>
                                )}

                                {shop.email && (
                                    <a href={`mailto:${shop.email}`} className="info-item-link">
                                        <div className="item-icon-circle">
                                            <Mail size={18} />
                                        </div>
                                        <div className="item-content">
                                            <span className="item-label">Email</span>
                                            <span className="item-value truncate">{shop.email}</span>
                                        </div>
                                    </a>
                                )}
                            </div>

                            {/* Social Media Row */}
                            <div className="social-links-row">
                                {shop.facebook_url && (
                                    <a href={shop.facebook_url} target="_blank" rel="noopener noreferrer" className="social-icon-btn facebook" title="Facebook">
                                        <Facebook size={20} />
                                    </a>
                                )}
                                {shop.instagram_url && (
                                    <a href={shop.instagram_url} target="_blank" rel="noopener noreferrer" className="social-icon-btn instagram" title="Instagram">
                                        <Instagram size={20} />
                                    </a>
                                )}
                                {shop.tiktok_url && (
                                    <a href={shop.tiktok_url} target="_blank" rel="noopener noreferrer" className="social-icon-btn tiktok" title="TikTok">
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.85.51-1.44 1.43-1.58 2.41-.09.96.16 1.94.71 2.7.53.77 1.39 1.32 2.31 1.5.88.2 1.84.03 2.59-.47.8-.5 1.48-1.31 1.63-2.26.14-.94.02-1.91.02-2.87-.01-4.71.01-9.42-.02-14.13z" /></svg>
                                    </a>
                                )}
                                {shop.twitter_url && (
                                    <a href={shop.twitter_url} target="_blank" rel="noopener noreferrer" className="social-icon-btn twitter" title="Twitter">
                                        <Twitter size={20} />
                                    </a>
                                )}
                                {shop.website_url && (
                                    <a href={shop.website_url} target="_blank" rel="noopener noreferrer" className="social-icon-btn website" title="Site Web">
                                        <Globe size={20} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* 🕐 Column 2: Hours & Location */}
                        <div className="shop-info-col">
                            <div className="info-col-header">
                                <div className="info-icon-wrapper orange">
                                    <MapPin size={24} />
                                </div>
                                <h3 className="info-col-title">Où nous trouver ?</h3>
                            </div>

                            <div className="location-items">
                                <div className="location-item">
                                    <div className="item-icon-circle">
                                        <MapPin size={18} />
                                    </div>
                                    <div className="item-content">
                                        <span className="item-label">Adresse</span>
                                        <span className="item-value">{shop.address || shop.location || 'Adresse non spécifiée'}</span>
                                        {shop.location && (
                                            <a
                                                href={`https://www.google.com/maps/search/${encodeURIComponent(shop.address || shop.location)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="maps-link"
                                            >
                                                Ouvrir dans Maps <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="location-item">
                                    <div className="item-icon-circle">
                                        <Clock size={18} />
                                    </div>
                                    <div className="item-content">
                                        <span className="item-label">Horaires</span>
                                        <span className="item-value">{shop.opening_hours || 'Contactez-nous pour les horaires'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 🚚 Column 3: Policies */}
                        <div className="shop-info-col">
                            <div className="info-col-header">
                                <div className="info-icon-wrapper emerald">
                                    <Truck size={24} />
                                </div>
                                <h3 className="info-col-title">Nos Politiques</h3>
                            </div>

                            <div className="policies-list">
                                <div className="policy-box">
                                    <span className="policy-label">
                                        <Truck size={14} /> Livraison & Retrait
                                    </span>
                                    <p className="policy-text">
                                        {shop.delivery_info || "Nous proposons la livraison à domicile et le retrait en boutique. Les délais varient selon votre localisation."}
                                    </p>
                                </div>

                                <div className="policy-box border-t">
                                    <span className="policy-label">
                                        <Shield size={14} /> Retours & Remboursements
                                    </span>
                                    <p className="policy-text">
                                        {shop.return_policy || "Les produits peuvent être retournés sous conditions. Veuillez nous contacter pour toute réclamation."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom CTA Bar */}
                    <div className="shop-info-footer">
                        <div className="footer-cta-info">
                            <div className="cta-icon-wrapper">
                                <Share2 size={24} />
                            </div>
                            <div className="cta-text-content">
                                <h4 className="cta-title">Partagez la boutique</h4>
                                <p className="cta-subtitle">Invitez vos amis à découvrir nos produits</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                navigator.share?.({
                                    title: shop.name,
                                    text: shop.description || '',
                                    url: window.location.href,
                                }).catch(() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Lien copié !');
                                });
                            }}
                            className="btn-share-shop"
                        >
                            Partager le site <ArrowRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </section >

            {/* ===================== TRUST SECTION ===================== */}
            < section className="trust-section" >
                <h3>Pourquoi commander chez nous ?</h3>
                <div className="trust-grid">
                    <div className="trust-card">
                        <div className="trust-icon blue"><CreditCard size={22} /></div>
                        <h4>Paiement à la livraison</h4>
                        <p>Payez seulement à réception</p>
                    </div>
                    <div className="trust-card">
                        <div className="trust-icon green"><Shield size={22} /></div>
                        <h4>Commande sécurisée</h4>
                        <p>Données protégées</p>
                    </div>
                    <div className="trust-card">
                        <div className="trust-icon orange"><MessageCircle size={22} /></div>
                        <h4>Support WhatsApp</h4>
                        <p>Assistance 7j/7</p>
                    </div>
                </div>
            </section >

            {/* ===================== FOOTER ===================== */}
            {/* 📱 Mobile Floating Nav (Hidden when modal open) */}
            {
                !selectedProduct && !isCartOpen && !isTrackOpen && (
                    <div className="bottom-nav">
                        <button
                            className={`nav-item ${selectedCategory === 'Tout' ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedCategory('Tout');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            <Home size={22} />
                            <span>Accueil</span>
                        </button>
                        <button
                            className={`nav-item ${showFilters ? 'active' : ''}`}
                            onClick={() => {
                                setShowFilters(true);
                                const cats = document.querySelector('.category-pills-container');
                                cats?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <Filter size={22} />
                            <span>Explorer</span>
                        </button>
                        <button
                            className="nav-item"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <div className="cart-nav-icon">
                                <ShoppingCart size={22} />
                                {cart.length > 0 && (
                                    <span className="cart-nav-badge">{totalItems}</span>
                                )}
                            </div>
                            <span>Panier</span>
                        </button>
                        <button
                            className={`nav-item ${isTrackOpen ? 'active' : ''}`}
                            onClick={() => setIsTrackOpen(true)}
                        >
                            <Package size={22} />
                            <span>Suivi</span>
                        </button>
                        <button className="nav-item" onClick={() => {
                            const info = document.querySelector('.shop-info-section');
                            info?.scrollIntoView({ behavior: 'smooth' });
                        }}>
                            <Store size={22} />
                            <span>Infos</span>
                        </button>
                    </div>
                )
            }

            <footer className="shop-footer">
                <div className="footer-logo">
                    <svg viewBox="0 0 100 100" fill="none">
                        <rect width="100" height="100" rx="28" fill="#ff5500" />
                        <path d="M32 38L50 72L68 38" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <p className="footer-text">
                    Propulsé par <a href="https://velmo.market" target="_blank" rel="noopener noreferrer">Velmo</a>
                </p>
            </footer>

            {/* ===================== FLOATING CART BUTTON ===================== */}
            {
                cart.length > 0 && (
                    <motion.button
                        className="cart-floating"
                        onClick={() => setIsCartOpen(true)}
                        initial={{ scale: 0, y: 100 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0, y: 100 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="cart-badge">{totalItems}</div>
                        <ShoppingCart size={20} />
                        <span className="cart-total-fab">{formatPrice(totalAmount)}</span>
                    </motion.button>
                )
            }

            {/* ===================== CART SHEET ===================== */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        <motion.div
                            className="cart-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCartOpen(false)}
                        />
                        <motion.div
                            className="cart-sheet"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div className="cart-header">
                                <div className="cart-header-title">
                                    <ShoppingCart size={22} className="text-primary" />
                                    <h2>{orderSuccess ? 'Commande confirmée' : 'Votre Panier'}</h2>
                                    {!orderSuccess && cart.length > 0 && (
                                        <span className="cart-count-pill">{totalItems}</span>
                                    )}
                                </div>
                                <button className="btn-close-cart-premium" onClick={() => setIsCartOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            {orderSuccess ? (
                                <div className="order-success-premium">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="success-check-lottie"
                                    >
                                        <CheckCircle2 size={56} color="#25D366" />
                                    </motion.div>

                                    <h2 className="success-title">Commande Envoyée ! 🎉</h2>
                                    <p className="success-msg">
                                        ✅ Le marchand a reçu votre commande complète sur WhatsApp.<br />
                                        <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                            Voici votre ticket de commande — téléchargez-le comme preuve.
                                        </span>
                                    </p>

                                    {/* 🎫 Ticket image preview */}
                                    {ticketImageUrl ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            style={{ width: '100%', marginBottom: '1rem' }}
                                        >
                                            <img
                                                src={ticketImageUrl}
                                                alt="Ticket de commande"
                                                style={{
                                                    width: '100%',
                                                    borderRadius: '16px',
                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                                    display: 'block'
                                                }}
                                            />
                                        </motion.div>
                                    ) : (
                                        <div className="order-summary-card" style={{
                                            background: '#0d0d12',
                                            border: '2px solid var(--primary)',
                                            boxShadow: '0 0 20px var(--primary-glow)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '4px',
                                                background: 'linear-gradient(90deg, var(--primary), #ff8c00)'
                                            }} />
                                            <div className="summary-ref" style={{ borderBottom: '1px dashed #2a2a3a', paddingBottom: '12px' }}>
                                                <span style={{ color: '#888' }}>RÉFÉRENCE TICKET</span>
                                                <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>#{submittedOrderRef || 'VEL-ERROR'}</strong>
                                            </div>
                                            <div className="summary-amount" style={{ paddingTop: '12px' }}>
                                                <span style={{ color: '#888' }}>TOTAL À PAYER</span>
                                                <strong style={{ color: '#fff', fontSize: '1.4rem' }}>{formatPrice(submittedTotal)}</strong>
                                            </div>
                                        </div>
                                    )}

                                    {/* 🧡 ORANGE MONEY ONE-TAP PAYMENT (MOBILE ONLY) */}
                                    {/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) && (shop?.phone || shop?.whatsapp) && (
                                        <div style={{ padding: '4px', background: 'rgba(255, 107, 0, 0.1)', borderRadius: '20px', border: '1px solid rgba(255, 107, 0, 0.2)', marginBottom: '16px' }}>
                                            <a
                                                href={`tel:*144*2*1*${(shop.whatsapp || shop.phone || "").replace(/\D/g, "")}*${submittedTotal}%23`}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '4px',
                                                    padding: '16px',
                                                    background: 'linear-gradient(135deg, #FF6600, #CC5500)',
                                                    color: 'white',
                                                    borderRadius: '16px',
                                                    fontWeight: 900,
                                                    fontSize: '1.1rem',
                                                    cursor: 'pointer',
                                                    border: 'none',
                                                    boxShadow: '0 8px 24px rgba(255, 107, 0, 0.4)',
                                                    width: '100%',
                                                    textDecoration: 'none',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Smartphone size={24} fill="currentColor" />
                                                    PAYER PAR ORANGE MONEY
                                                </div>
                                                <span style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: 700, letterSpacing: '0.05em' }}>
                                                    (Un clic, puis tapez votre code secret)
                                                </span>
                                            </a>
                                        </div>
                                    )}

                                    {/* Action buttons */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                                        {/* Bouton principal : Partager le ticket */}
                                        <button
                                            onClick={shareTicket}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '10px',
                                                padding: '14px',
                                                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                                                color: 'white',
                                                borderRadius: '14px',
                                                fontWeight: 800,
                                                fontSize: '1rem',
                                                cursor: 'pointer',
                                                border: 'none',
                                                boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
                                                width: '100%'
                                            }}
                                        >
                                            <MessageCircle size={22} fill="white" />
                                            Envoyer le ticket sur WhatsApp
                                        </button>

                                        {/* Bouton secondaire : Télécharger */}
                                        {ticketBlob && (
                                            <button
                                                onClick={() => downloadTicket(null, submittedOrderRef)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    padding: '12px',
                                                    background: 'var(--bg-tertiary)',
                                                    color: 'var(--text-primary)',
                                                    borderRadius: '14px',
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                    cursor: 'pointer',
                                                    border: '1px solid var(--border-color)',
                                                    width: '100%'
                                                }}
                                            >
                                                <Printer size={18} />
                                                Télécharger le ticket PNG
                                            </button>
                                        )}

                                        {/* Bouton retour */}
                                        <button
                                            onClick={() => {
                                                setIsCartOpen(false);
                                                setOrderSuccess(false);
                                                if (ticketImageUrl) URL.revokeObjectURL(ticketImageUrl);
                                                setTicketImageUrl(null);
                                                setTicketBlob(null);
                                            }}
                                            style={{
                                                padding: '11px',
                                                background: 'transparent',
                                                color: 'var(--text-muted)',
                                                borderRadius: '14px',
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                border: '1px solid var(--border-color)',
                                                width: '100%'
                                            }}
                                        >
                                            Retour au magasin
                                        </button>
                                    </div>
                                </div>
                            ) : cart.length === 0 ? (
                                <div className="cart-empty">
                                    <ShoppingBag size={64} />
                                    <p>Votre panier est vide</p>
                                </div>
                            ) : (
                                <form
                                    id="checkout-form"
                                    onSubmit={handleSubmitOrder}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div className="cart-items" style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
                                        {/* ITEMS LIST */}
                                        {cart.map(item => (
                                            <div key={item.product.id} className="cart-item">
                                                <div className="cart-item-img">
                                                    {item.product.photo_url ? (
                                                        <img src={getPublicImageUrl(item.product.photo_url) || ''} alt={item.product.name} />
                                                    ) : (
                                                        <div style={{ ...getProductPlaceholderStyle(item.product.name), width: '100%', height: '100%', borderRadius: '14px', fontSize: '1rem' }}>
                                                            {getProductInitials(item.product.name)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="cart-item-info">
                                                    <div className="cart-item-name">{item.product.name}</div>
                                                    <div className="cart-item-price">{formatPrice(item.product.price_sale)}</div>
                                                    <div className="cart-item-actions">
                                                        <button type="button" className="qty-btn" onClick={() => updateQuantity(item.product.id, -1)}>
                                                            <Minus size={14} />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            className="qty-input"
                                                            value={item.quantity}
                                                            onChange={(e) => setManualQuantity(item.product.id, parseInt(e.target.value) || 0)}
                                                            min="0"
                                                        />
                                                        <button type="button" className="qty-btn" onClick={() => updateQuantity(item.product.id, 1)}>
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="cart-item-remove">
                                                    <button type="button" className="btn-remove" onClick={() => removeFromCart(item.product.id)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* CHECKOUT FORM FIELDS (PREMIUM) */}
                                        <div className="checkout-form-premium">
                                            <h3>
                                                <Users size={20} className="text-primary" />
                                                Finaliser la commande
                                            </h3>
                                            <p className="form-desc">
                                                Votre commande sera envoyée directement sur le WhatsApp de la boutique.
                                            </p>

                                            <div className="luxury-group">
                                                <label className="luxury-label">Votre nom complet</label>
                                                <input
                                                    type="text"
                                                    className="luxury-input"
                                                    placeholder="Ex: Mamadou Diallo"
                                                    value={customerInfo.name}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                                />
                                            </div>

                                            <div className="luxury-group">
                                                <label className="luxury-label required">Quartier / Adresse de livraison</label>
                                                <input
                                                    type="text"
                                                    className="luxury-input"
                                                    placeholder="Ex: Kaloum, près de la pharmacie..."
                                                    value={customerInfo.address}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="luxury-group">
                                                <label className="luxury-label">Mode de récupération</label>
                                                <div className="delivery-toggle-group" style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                                    <button
                                                        type="button"
                                                        className={`delivery-chip ${deliveryMethod === 'delivery' ? 'active' : ''}`}
                                                        onClick={() => setDeliveryMethod('delivery')}
                                                        style={{
                                                            flex: 1,
                                                            padding: '12px',
                                                            borderRadius: '14px',
                                                            border: '1px solid var(--border-color)',
                                                            background: deliveryMethod === 'delivery' ? 'var(--primary)' : 'var(--bg-tertiary)',
                                                            color: deliveryMethod === 'delivery' ? 'white' : 'var(--text-secondary)',
                                                            fontWeight: 800,
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        <Truck size={18} style={{ marginBottom: '4px' }} />
                                                        <br />Livraison
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`delivery-chip ${deliveryMethod === 'pickup' ? 'active' : ''}`}
                                                        onClick={() => setDeliveryMethod('pickup')}
                                                        style={{
                                                            flex: 1,
                                                            padding: '12px',
                                                            borderRadius: '14px',
                                                            border: '1px solid var(--border-color)',
                                                            background: deliveryMethod === 'pickup' ? 'var(--primary)' : 'var(--bg-tertiary)',
                                                            color: deliveryMethod === 'pickup' ? 'white' : 'var(--text-secondary)',
                                                            fontWeight: 800,
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        <Store size={18} style={{ marginBottom: '4px' }} />
                                                        <br />Retrait
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                className={`delivery-option ${customerInfo.location ? 'active' : ''}`}
                                                onClick={requestLocation}
                                                style={{
                                                    marginTop: '10px',
                                                    width: '100%',
                                                    flexDirection: 'row',
                                                    gap: '10px',
                                                    padding: '16px',
                                                    border: '1.5px dashed var(--border-color)',
                                                    borderRadius: '18px',
                                                    background: customerInfo.location ? 'rgba(37, 211, 102, 0.08)' : 'transparent',
                                                    color: customerInfo.location ? '#25D366' : 'var(--text-secondary)',
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                <MapPin size={20} />
                                                {customerInfo.location ? 'Position GPS configurée ✅' : 'Épingler ma position GPS (Recommandé)'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cart-footer">
                                        <div className="cart-summary-premium">
                                            <div className="summary-row">
                                                <span>Sous-total</span>
                                                <span>{formatPrice(totalAmount)}</span>
                                            </div>
                                            <div className="summary-row total">
                                                <span>Total à payer</span>
                                                <strong>{formatPrice(totalAmount)}</strong>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn-checkout-premium"
                                            disabled={isSubmitting || cart.length === 0 || !customerInfo.address}
                                        >
                                            <MessageCircle size={22} fill="white" />
                                            {isSubmitting ? 'Envoi en cours...' : 'Envoyer la commande (WhatsApp)'}
                                        </button>
                                        <p className="checkout-note">
                                            Paiement à la livraison ou selon les conditions du marchand.
                                        </p>
                                    </div>
                                </form>
                            )}

                        </motion.div>
                    </>
                )}
            </AnimatePresence>


            {/* ===================== PRODUCT MODAL ===================== */}
            <AnimatePresence>
                {selectedProduct && (
                    <>
                        <motion.div
                            className="product-modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseProductModal}
                        />
                        <div className="product-modal-container">
                            <motion.div
                                className="product-modal-content"
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            >
                                <button className="btn-close-modal" onClick={handleCloseProductModal}>
                                    <X size={24} />
                                </button>
                                <button
                                    className="btn-share-modal"
                                    onClick={() => {
                                        const url = window.location.href;
                                        const text = `Découvre ${selectedProduct.name} chez ${shop.name} - ${formatPrice(selectedProduct.price_sale)}`;
                                        copyToClipboard(text + '\n' + url);
                                    }}
                                >
                                    {copiedLink ? <Check size={18} /> : <Share2 size={18} />}
                                </button>

                                <div className="product-modal-img">
                                    {selectedProduct.photo_url ? (
                                        <img
                                            src={getPublicImageUrl(selectedProduct.photo_url) || ''}
                                            alt={selectedProduct.name}
                                        />
                                    ) : (
                                        <div style={{ ...getProductPlaceholderStyle(selectedProduct.name), position: 'absolute', inset: 0, borderRadius: '0' }}>
                                            <span style={{ fontSize: '4rem' }}>{getProductInitials(selectedProduct.name)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="product-modal-info">
                                    <div className="modal-badges">
                                        {selectedProduct.category && (
                                            <span className="modal-category">{selectedProduct.category}</span>
                                        )}
                                        <span className={`stock-badge stock-${getStockStatus(selectedProduct).color}`}>
                                            {getStockStatus(selectedProduct).label}
                                        </span>
                                    </div>

                                    <h2 className="product-modal-name">{selectedProduct.name}</h2>
                                    <p className="product-modal-price">{formatPrice(selectedProduct.price_sale)}</p>

                                    {selectedProduct.description && (
                                        <p className="product-modal-description">{selectedProduct.description}</p>
                                    )}

                                    {selectedProduct.is_active && (
                                        <div style={{ marginTop: 'auto' }}>
                                            <div className="product-modal-qty">
                                                <button
                                                    className="modal-qty-btn"
                                                    onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                                                >
                                                    <Minus size={20} />
                                                </button>
                                                <span className="modal-qty-display">{modalQuantity}</span>
                                                <button
                                                    className="modal-qty-btn"
                                                    onClick={() => setModalQuantity(modalQuantity + 1)}
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </div>

                                            <button
                                                className="btn-add-to-cart-modal"
                                                onClick={() => {
                                                    addToCart(selectedProduct, modalQuantity);
                                                    setSelectedProduct(null);
                                                }}
                                            >
                                                <ShoppingBag size={20} />
                                                Ajouter au panier ({formatPrice(selectedProduct.price_sale * modalQuantity)})
                                            </button>
                                        </div>
                                    )}

                                    {/* 🧠 SMART RECOMMENDATIONS COMPACT */}
                                    {getRecommendedProducts(selectedProduct).length > 0 && (
                                        <div className="modal-recommendations">
                                            <h4 className="rec-title-compact">Vous pourriez aussi aimer</h4>
                                            <div className="rec-grid-compact">
                                                {getRecommendedProducts(selectedProduct).map(rec => (
                                                    <div
                                                        key={rec.id}
                                                        className="rec-item-v2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedProduct(rec);
                                                            setModalQuantity(1);
                                                            // Auto-scroll to top of modal for new product
                                                            const modalInfo = document.querySelector('.product-modal-info');
                                                            if (modalInfo) modalInfo.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                    >
                                                        <div className="rec-item-img">
                                                            {rec.photo_url ? (
                                                                <img src={getPublicImageUrl(rec.photo_url) || ''} alt={rec.name} />
                                                            ) : (
                                                                <div style={{ ...getProductPlaceholderStyle(rec.name), width: '100%', height: '100%', borderRadius: '12px', fontSize: '1rem' }}>
                                                                    {getProductInitials(rec.name)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="rec-item-name">{rec.name}</p>
                                                        <p className="rec-item-price">{formatPrice(rec.price_sale)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* 🕵️ Track Order Modal */}
            <AnimatePresence>
                {isTrackOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsTrackOpen(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ opacity: 0, y: 100, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="modal-close-premium" onClick={() => setIsTrackOpen(false)}>
                                <X size={20} />
                            </button>

                            <div className="modal-header">
                                <Package size={42} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
                                <h2 className="success-title" style={{ marginTop: 0 }}>Suivre ma commande</h2>
                                <p className="success-msg" style={{ maxWidth: '100%', marginBottom: '2rem' }}>
                                    Entrez votre numéro de référence pour afficher votre ticket.
                                </p>
                            </div>

                            <div className="luxury-group">
                                <label className="luxury-label">Code Suivi (Ex: CMD-X7Y8...)</label>
                                <input
                                    type="text"
                                    className="luxury-input"
                                    placeholder="Entrez votre code..."
                                    value={trackInput}
                                    onChange={(e) => setTrackInput(e.target.value.toUpperCase())}
                                    autoFocus
                                />
                            </div>

                            <button
                                className="btn-premium"
                                style={{ marginTop: '1rem' }}
                                disabled={!trackInput.trim()}
                                onClick={() => {
                                    if (trackInput.trim()) {
                                        navigate(`/receipt/${trackInput.trim()}`);
                                    }
                                }}
                            >
                                <Search size={20} />
                                Rechercher la commande
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🌍 MARKETPLACE DISCOVERY SECTION */}
            <div className="container">
                <section className="marketplace-discovery">
                    <div className="discovery-bg-glow" />
                    <h3 className="discovery-title">Découvrez un monde de boutiques</h3>
                    <p className="discovery-text">
                        Velmo rassemble les meilleurs petits commerces d'Afrique.
                        Qualité, confiance et livraison rapide garanties.
                    </p>
                    <Link to="/search" className="btn-discovery-explore">
                        Explorer le Marketplace
                        <ArrowRight size={20} />
                    </Link>

                    <div className="discovery-brands">
                        <span className="brand-item">Mode</span>
                        <span className="brand-item">Tech</span>
                        <span className="brand-item">Maison</span>
                        <span className="brand-item">Beauté</span>
                    </div>
                </section>
            </div>

            {/* 🔝 BACK TO TOP */}
            <motion.button
                className="btn-back-to-top"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: scrolled ? 1 : 0, y: scrolled ? 0 : 20 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                <ChevronDown size={24} style={{ transform: 'rotate(180deg)' }} />
            </motion.button>

            {/* 🚀 LIVE ACTIVITY TOAST */}
            <AnimatePresence>
                {liveActivity && (
                    <motion.div
                        className="live-activity-toast"
                        initial={{ opacity: 0, x: -50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.8 }}
                    >
                        <div className="live-toast-dot" />
                        <span className="live-toast-text">{liveActivity.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showReferralModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowReferralModal(false)}
                    >
                        <motion.div
                            className="referral-modal-card"
                            initial={{ y: 100, scale: 0.9 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 100, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <div className="header-icon-box">
                                    <Gift size={32} />
                                </div>
                                <h3 className="modal-title">Parrainez un ami !</h3>
                                <p className="modal-subtitle">Faites découvrir la boutique et gagnez des cadeaux !</p>
                                <button className="modal-close" onClick={() => setShowReferralModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="referral-content">
                                <div className="referral-info-grid">
                                    <div className="referral-step">
                                        <div className="step-num">1</div>
                                        <p>Partagez le lien de la boutique à vos amis</p>
                                    </div>
                                    <div className="referral-step">
                                        <div className="step-num">2</div>
                                        <p>Ils découvrent nos pépites & commandent</p>
                                    </div>
                                    <div className="referral-step">
                                        <div className="step-num">3</div>
                                        <p>Vous recevez des cadeaux exclusifs !</p>
                                    </div>
                                </div>

                                <div className="share-actions">
                                    <button
                                        className="btn-share-whatsapp"
                                        onClick={() => {
                                            const text = `Regarde ce que j'ai trouvé sur ${shop.name} ! 😍 Voici le lien : ${window.location.origin}/s/${shop.slug}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                    >
                                        <MessageCircle size={20} fill="currentColor" /> Partager sur WhatsApp
                                    </button>

                                    <button
                                        className="btn-copy-link"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/s/${shop.slug}`);
                                            setCopiedLink(true);
                                            setTimeout(() => setCopiedLink(false), 2000);
                                        }}
                                    >
                                        {copiedLink ? <Check size={20} /> : <Share2 size={20} />}
                                        {copiedLink ? "Lien copié !" : "Copier le lien"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
