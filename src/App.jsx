import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ShopPage from './components/Shop/ShopPage';
import {
    TrendingUp,
    Package,
    Users,
    Smartphone,
    WifiOff,
    Shield,
    Zap,
    ArrowRight,
    MessageCircle,
    BarChart3,
    Bell,
    X,
    Store,
    Play,
    Home,
    ShoppingCart,
    CreditCard,
    PieChart,
    Settings,
    Search,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Check,
    AlertTriangle,
    CheckCircle,
    Clock,
    UserPlus,
    Sparkles,
    Phone,
    Globe,
    Sun,
    Moon
} from 'lucide-react';

// Translations
const translations = {
    fr: {
        nav: { works: "Fonctionnement", features: "Fonctionnalités", testimonials: "Témoignages", login: "Connexion", start: "Commencer" },
        hero: { badge: "Simple, rapide, efficace", title: "Gérez votre boutique.", titleHighlight: "Suivez vos ventes.", desc: "L'application tout-en-un pour les commerçants du quotidien. Ventes, stocks, dettes — tout est là.", startFree: "Commencer gratuitement", demo: "Démo", trust: "Plus de 2,400 commerçants satisfaits" },
        preview: { badge: "💻 Interface Pro", title: "Gérez tout depuis votre ordinateur" },
        steps: { header: "5 minutes pour démarrer", subheader: "Simple comme bonjour.", s1t: "Téléchargez", s1d: "Sur Android ou Web", s2t: "Inscrivez-vous", s2d: "Avec votre numéro", s3t: "Ajoutez produits", s3d: "Créez votre stock", s4t: "Vendez", s4d: "Encaissez facilement", s5t: "Analysez", s5d: "Suivez vos gains" },
        features: { header: "Fonctionnalités complètes", f1: "Mode Hors-Ligne", f1d: "Continuez à vendre même sans internet. Synchronisation auto.", f2: "WhatsApp Intégré", f2d: "Envoyez des factures et rappels de dettes par WhatsApp.", f3: "Sécurisé", f3d: "Vos données sont chiffrées et sauvegardées en lieu sûr.", f4: "Multi-Utilisateurs", f4d: "Donnez un accès limité à vos employés.", f5: "Rapports Détaillés", f5d: "Sachez exactement ce que vous gagnez chaque jour.", f6: "Site Vitrine", f6d: "Vos produits visibles sur internet pour vos clients." },
        testimonials: { header: "Ils nous font confiance", t1: "Depuis que j'utilise Velmo, je ne perds plus une seule vente. C'est magique.", t1a: "Moussa S.", t1r: "Marchand de tissus", t2: "La gestion des crédits est devenue un jeu d'enfant. Mes clients me remboursent plus vite.", t2a: "Fatou C.", t2r: "Epicerie fine", t3: "J'ai tout mon stock dans ma poche. Je peux voyager tranquille.", t3a: "Ibrahim D.", t3r: "Grossiste" },
        footer: { copyright: "© 2026 Velmo. Fait avec ❤️ pour le commerce africain." }
    },
    en: {
        nav: { works: "How it works", features: "Features", testimonials: "Testimonials", login: "Login", start: "Get Started" },
        hero: { badge: "Simple, fast, effective", title: "Manage your shop.", titleHighlight: "Track your sales.", desc: "The all-in-one app for daily merchants. Sales, stock, debts — it's all here.", startFree: "Start for free", demo: "Demo", trust: "Over 2,400 satisfied merchants" },
        preview: { badge: "💻 Pro Interface", title: "Manage everything from your computer" },
        steps: { header: "5 minutes to start", subheader: "Easy as pie.", s1t: "Download", s1d: "On Android or Web", s2t: "Sign Up", s2d: "With your number", s3t: "Add Products", s3d: "Create your stock", s4t: "Sell", s4d: "Cash in easily", s5t: "Analyze", s5d: "Track your earnings" },
        features: { header: "Complete Features", f1: "Offline Mode", f1d: "Keep selling even without internet. Auto sync.", f2: "WhatsApp Integrated", f2d: "Send invoices and debt reminders via WhatsApp.", f3: "Secure", f3d: "Your data is encrypted and saved securely.", f4: "Multi-User", f4d: "Give limited access to your employees.", f5: "Detailed Reports", f5d: "Know exactly what you earn every day.", f6: "Showcase Site", f6d: "Your products visible online for your clients." },
        testimonials: { header: "They trust us", t1: "Since I use Velmo, I don't lose a single sale anymore. It's magic.", t1a: "Moussa S.", t1r: "Fabric Merchant", t2: "Credit management has become child's play. My clients pay me back faster.", t2a: "Fatou C.", t2r: "Fine Grocery", t3: "I have all my stock in my pocket. I can travel with peace of mind.", t3a: "Ibrahim D.", t3r: "Wholesaler" },
        footer: { copyright: "© 2026 Velmo. Made with ❤️ for African commerce." }
    }
};

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

// Social Icons as SVG
const SocialIcons = {
    WhatsApp: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    ),
    Facebook: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    ),
    Instagram: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
    ),
    X: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
};

// Floating Notification Bubble
const NotificationBubble = ({ children, position, delay = 0, color = 'green' }) => (
    <motion.div
        className={`notification-bubble ${position} ${color}`}
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay, duration: 0.5, type: 'spring' }}
    >
        {children}
    </motion.div>
);

// WhatsApp FAB
const WhatsAppFAB = () => (
    <motion.a
        href="https://wa.me/224621233847"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
    >
        <SocialIcons.WhatsApp />
    </motion.a>
);

// Navbar
const Navbar = ({ lang, setLang, theme, toggleTheme, t }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-content">
                <a href="#" className="logo">
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(255, 98, 0, 0.2)' }}>V</div>
                    <span style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-1px', color: 'var(--text-primary)' }}>VELMO</span>
                </a>

                <div className="nav-links">
                    <a href="#fonctionnement" className="nav-link">{t('nav.works')}</a>
                    <a href="#fonctionnalites" className="nav-link">{t('nav.features')}</a>
                    <a href="#temoignages" className="nav-link">{t('nav.testimonials')}</a>
                </div>

                <div className="nav-actions">
                    <div className="theme-toggle" onClick={toggleTheme} style={{ cursor: 'pointer', padding: '8px', borderRadius: '50%', background: 'var(--bg-subtle)' }}>
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </div>
                    <div className="lang-toggle" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} style={{ cursor: 'pointer', padding: '8px', borderRadius: '50%', background: 'var(--bg-subtle)', fontWeight: 700, fontSize: '0.8rem', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {lang === 'fr' ? 'EN' : 'FR'}
                    </div>
                    <button className="btn btn-primary">
                        {t('nav.start')}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

// Mockup Sub-components
const MockupDashboard = () => (
    <div className="app-page">
        <h2>Tableau de bord</h2>
        <div className="stats-row">
            <motion.div className="stat-card orange" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                <div className="stat-card-value">2.4M</div>
                <div className="stat-card-label">Ventes</div>
                <div className="stat-card-change positive"><ArrowUpRight size={14} /> +12%</div>
            </motion.div>
            <motion.div className="stat-card blue" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
                <div className="stat-card-value">156</div>
                <div className="stat-card-label">Produits</div>
                <div className="stat-card-change positive"><ArrowUpRight size={14} /> +5</div>
            </motion.div>
            <motion.div className="stat-card red" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <div className="stat-card-value">550K</div>
                <div className="stat-card-label">Dettes</div>
                <div className="stat-card-change negative"><ArrowDownRight size={14} /> -2%</div>
            </motion.div>
            <motion.div className="stat-card green" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
                <div className="stat-card-value">89</div>
                <div className="stat-card-label">Clients</div>
                <div className="stat-card-change positive"><UserPlus size={14} /> +3</div>
            </motion.div>
        </div>
        <div style={{ marginTop: '24px' }}>
            <h4 style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '0.85rem' }}>Ventes de la semaine</h4>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
                {[45, 60, 35, 80, 50, 90, 75].map((h, i) => (
                    <motion.div
                        key={i}
                        style={{
                            flex: 1,
                            background: i === 6 ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            width: '100%'
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.1, duration: 0.6, type: 'spring' }}
                    />
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: '#64748b', fontSize: '0.75rem' }}>
                <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
            </div>
        </div>
    </div>
);

const MockupSales = () => (
    <div className="app-page">
        <div className="page-header-row">
            <h2>Ventes récentes</h2>
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}><Plus size={16} /> Nouvelle</button>
        </div>
        <div className="data-table">
            <div className="table-header"><span>Produit</span><span>Combien</span><span>Prix</span><span>État</span><span></span></div>
            {[
                { name: 'Riz 25kg', qty: '2 sacs', price: '450,000', status: 'paye' },
                { name: 'Huile 5L', qty: '3 bidons', price: '280,000', status: 'dette' },
                { name: 'Sucre 50kg', qty: '1 sac', price: '175,000', status: 'paye' },
                { name: 'Lait Nido', qty: '5 boîtes', price: '125,000', status: 'paye' },
            ].map((item, i) => (
                <motion.div
                    key={i}
                    className="table-row"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <span>{item.name}</span>
                    <span style={{ color: '#94a3b8' }}>{item.qty}</span>
                    <span className="amount">{item.price}</span>
                    <span style={{
                        color: item.status === 'paye' ? '#10b981' : '#ef4444',
                        background: item.status === 'paye' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600
                    }}>
                        {item.status === 'paye' ? 'Payé' : 'Dette'}
                    </span>
                    <span style={{ color: '#64748b' }}><ArrowRight size={14} /></span>
                </motion.div>
            ))}
        </div>
    </div>
);

const MockupStock = () => (
    <div className="app-page">
        <div className="page-header-row">
            <h2>Gestion Stock</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge" style={{ margin: 0, padding: '4px 8px', fontSize: '0.75rem' }}>Tous (156)</span>
                <span className="badge" style={{ margin: 0, padding: '4px 8px', fontSize: '0.75rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'transparent' }}>Bas (3)</span>
            </div>
        </div>
        <div className="stock-grid">
            {[
                { name: 'Riz', icon: '🍚', level: 80, color: '#10b981' },
                { name: 'Huile', icon: '🫒', level: 20, color: '#ef4444' },
                { name: 'Sucre', icon: '🧂', level: 45, color: '#f59e0b' },
                { name: 'Lait', icon: '🥛', level: 90, color: '#10b981' },
                { name: 'Savon', icon: '🧼', level: 60, color: '#3b82f6' },
                { name: 'Café', icon: '☕', level: 30, color: '#f59e0b' },
            ].map((item, i) => (
                <motion.div
                    key={i}
                    className="stock-card"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: item.color }}>{item.level}%</span>
                    </div>
                    <div className="stock-name" style={{ fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                        <motion.div
                            style={{ height: '100%', background: item.color, borderRadius: '2px' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.level}%` }}
                            transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);

// Desktop Mockup Component
const DesktopMockup = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const tabs = ['dashboard', 'ventes', 'stock'];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTab(prev => {
                const currentIndex = tabs.indexOf(prev);
                return tabs[(currentIndex + 1) % tabs.length];
            });
        }, 5000); // 5 sec rotation
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="desktop-mockup-wrapper">
            <NotificationBubble position="top-left" delay={1} color="green"><CheckCircle size={14} /><span>Vente confirmée!</span></NotificationBubble>
            <NotificationBubble position="top-right" delay={2} color="orange"><AlertTriangle size={14} /><span>Stock bas: Riz</span></NotificationBubble>
            <NotificationBubble position="bottom-right" delay={3} color="blue"><UserPlus size={14} /><span>Nouveau client</span></NotificationBubble>

            <div className="desktop-frame">
                <div className="desktop-header">
                    <div className="desktop-dots">
                        <span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span>
                    </div>
                    <div className="desktop-url">app.velmo.com/dashboard</div>
                </div>
                <div className="desktop-content">
                    {/* Sidebar */}
                    <div className="app-sidebar">
                        <div className="sidebar-logo">
                            <div className="sidebar-logo-icon">V</div><span>Velmo</span>
                        </div>
                        <div className="sidebar-nav">
                            {[
                                { id: 'dashboard', icon: <Home size={18} />, label: 'Tableau de bord' },
                                { id: 'ventes', icon: <ShoppingCart size={18} />, label: 'Ventes' },
                                { id: 'stock', icon: <Package size={18} />, label: 'Stock' },
                                { id: 'dettes', icon: <CreditCard size={18} />, label: 'Dettes' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(item.id)}
                                >
                                    {item.icon}<span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="sidebar-user">
                            <div className="sidebar-avatar">M</div>
                            <div className="sidebar-user-info"><span className="sidebar-user-name">Mamadou</span><span className="sidebar-user-role">Pro</span></div>
                        </div>
                    </div>
                    {/* Main Content */}
                    <div className="app-main">
                        <div className="app-topbar">
                            <div className="app-search"><Search size={14} /><span>Rechercher...</span></div>
                            <div className="app-user">
                                <span className="badge-pulse" style={{ width: '8px', height: '8px', position: 'absolute', top: '18px', right: '110px' }}></span>
                                <Bell size={18} />
                                <div className="topbar-date"><Clock size={14} /><span>22 Jan</span></div>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.3 }}
                                style={{ height: '100%', overflowY: 'auto' }}
                            >
                                {activeTab === 'dashboard' && <MockupDashboard />}
                                {activeTab === 'ventes' && <MockupSales />}
                                {activeTab === 'stock' && <MockupStock />}
                                {activeTab === 'dettes' && (
                                    <div className="app-page">
                                        <h2>Dettes clients</h2>
                                        <div className="data-table">
                                            {[
                                                { name: 'Fatou Camara', amount: '120,000', days: '3j' },
                                                { name: 'Ibrahim Bah', amount: '50,000', days: '7j' }
                                            ].map((d, i) => (
                                                <div key={i} className="table-row">
                                                    <span>{d.name}</span>
                                                    <span className="amount" style={{ color: '#ef4444' }}>{d.amount}</span>
                                                    <span>{d.days}</span>
                                                    <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Rappel</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Phone Sub-components
const PhoneHomeView = () => (
    <motion.div
        key="home"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
        <div className="phone-header">
            <div><div className="phone-greeting">Bonjour</div><div className="phone-name">Mamadou</div></div>
            <div className="phone-avatar">M</div>
        </div>
        <div className="phone-card">
            <div className="phone-card-label">Ventes du jour</div>
            <div className="phone-card-value">2,450,000</div>
            <div className="phone-card-change"><TrendingUp size={12} /> +23%</div>
        </div>
        <div className="phone-stats-grid">
            <div className="phone-stat green"><div className="phone-stat-value">47</div><div className="phone-stat-label">Ventes</div></div>
            <div className="phone-stat red"><div className="phone-stat-value">12</div><div className="phone-stat-label">Dettes</div></div>
        </div>
        <div className="phone-stats-grid" style={{ marginTop: '12px' }}>
            <div className="phone-stat blue"><div className="phone-stat-value">156</div><div className="phone-stat-label">Stock</div></div>
            <div className="phone-stat orange"><div className="phone-stat-value">3</div><div className="phone-stat-label">Alertes</div></div>
        </div>
    </motion.div>
);

const PhoneSalesView = () => (
    <motion.div
        key="sales"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
        <div style={{ marginBottom: '16px', fontWeight: 700, fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Ventes récentes</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'rgba(255,98,0,0.1)', padding: '4px 8px', borderRadius: '10px' }}>Auj.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
            {[
                { item: 'Riz 25kg', time: '14:30', price: '225,000', icon: '🍚' },
                { item: 'Huile 5L', time: '13:45', price: '110,000', icon: '🫒' },
                { item: 'Sucre 50kg', time: '12:15', price: '175,000', icon: '🧂' },
                { item: 'Lait Nido', time: '11:20', price: '80,000', icon: '🥛' },
                { item: 'Savon', time: '10:05', price: '45,000', icon: '🧼' },
            ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.2rem' }}>{s.icon}</div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.item}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{s.time}</div>
                        </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>{s.price}</div>
                </div>
            ))}
        </div>
    </motion.div>
);

const PhoneStockView = () => (
    <motion.div
        key="stock"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
        <div style={{ marginBottom: '16px', fontWeight: 700, fontSize: '1.1rem' }}>Mon Stock</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
            {[
                { item: 'Riz importé', icon: '🍚', pct: 80, col: '#10b981', stock: '80/100' },
                { item: 'Huile Bidon', icon: '🫒', pct: 20, col: '#ef4444', stock: '10/50' },
                { item: 'Lait Poudre', icon: '🥛', pct: 60, col: '#3b82f6', stock: '30/50' },
                { item: 'Sucre', icon: '🧂', pct: 45, col: '#f59e0b', stock: '22/50' },
                { item: 'Café', icon: '☕', pct: 90, col: '#10b981', stock: '45/50' },
            ].map((s, i) => (
                <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{s.item}</span>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#94a3b8' }}>{s.stock}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div
                            style={{ width: '100%', height: '100%', background: s.col, borderRadius: '3px', transformOrigin: 'left' }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: s.pct / 100 }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                        />
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
);

// Phone Mockup
const PhoneMockup = () => {
    const [activeView, setActiveView] = useState('home');
    const views = ['home', 'sales', 'stock'];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveView(prev => {
                const idx = views.indexOf(prev);
                return views[(idx + 1) % views.length];
            });
        }, 3500); // Rotate every 3.5s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="phone-mockup-wrapper">
            <NotificationBubble position="phone-top-right" delay={2} color="green"><Check size={12} /><span>Vente +225K</span></NotificationBubble>

            <motion.div className="phone-mockup" animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="phone-notch"></div>
                <div className="phone-screen">
                    <div className="phone-status-bar"><span>9:41</span><span>4G</span></div>
                    <div className="phone-content" style={{ overflow: 'hidden' }}>
                        <AnimatePresence mode="wait">
                            {activeView === 'home' && <PhoneHomeView />}
                            {activeView === 'sales' && <PhoneSalesView />}
                            {activeView === 'stock' && <PhoneStockView />}
                        </AnimatePresence>
                    </div>
                    <div className="phone-nav">
                        {['home', 'sales', 'stock'].map(id => (
                            <button
                                key={id}
                                className={`phone-nav-item ${activeView === id ? 'active' : ''}`}
                                onClick={() => setActiveView(id)}
                            >
                                {id === 'home' && <Home size={18} />}
                                {id === 'sales' && <ShoppingCart size={18} />}
                                {id === 'stock' && <Package size={18} />}
                                <span>{id === 'home' ? 'Accueil' : id === 'sales' ? 'Ventes' : 'Stock'}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Shop Redirect Modal
const ShopModal = ({ isOpen, onClose, t, lang }) => {
    const [slug, setSlug] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (slug.trim()) {
            navigate(`/b/${slug.trim().toLowerCase()}`);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div
                className="shop-redirect-modal"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
                style={{ background: 'var(--card-bg)', padding: '40px', borderRadius: '32px', width: '95%', maxWidth: '420px', position: 'relative', border: '1px solid var(--border)', textAlign: 'center' }}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={24} /></button>
                <div style={{ width: '64px', height: '64px', background: 'rgba(255, 98, 0, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <ShoppingCart size={32} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', fontWeight: 800 }}>{lang === 'fr' ? 'Voir ma boutique' : 'View my shop'}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    {lang === 'fr' ? "Entrez l'identifiant de votre boutique pour accéder à votre catalogue en ligne." : "Enter your shop identifier to access your online catalog."}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ background: 'var(--bg-subtle)', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                        <Store size={20} color="var(--primary)" />
                        <input
                            type="text"
                            placeholder="nom-de-la-boutique"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            autoFocus
                            required
                            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', width: '100%', fontSize: '1rem' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700, fontSize: '1rem' }}>
                        {lang === 'fr' ? 'Accéder maintenant' : 'Access Now'} <ArrowRight size={20} />
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

// Hero
const Hero = ({ t, onOpenShopModal }) => (
    <section className="hero">
        <div className="container">
            <div className="hero-grid">
                <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                    <motion.div variants={fadeInUp} className="badge"><Sparkles size={16} />{t('hero.badge')}</motion.div>
                    <motion.h1 variants={fadeInUp} className="hero-title">{t('hero.title')}<br /><span className="highlight">{t('hero.titleHighlight')}</span></motion.h1>
                    <motion.p variants={fadeInUp} className="hero-description">{t('hero.desc')}</motion.p>
                    <motion.div variants={fadeInUp} className="hero-cta">
                        <button className="btn btn-primary btn-lg">{t('hero.startFree')} <ArrowRight size={20} /></button>
                        <button onClick={onOpenShopModal} className="btn btn-secondary btn-lg">
                            <ShoppingCart size={18} /> Voir ma boutique
                        </button>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="hero-trust">
                        <div className="trust-avatars"><div className="trust-avatar">👨</div><div className="trust-avatar">👩</div><div className="trust-avatar">+</div></div>
                        <p>{t('hero.trust')}</p>
                    </motion.div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <PhoneMockup />
                </motion.div>
            </div>
        </div>
    </section>
);

// App Preview
const AppPreview = ({ t }) => (
    <section className="app-preview-section">
        <div className="container">
            <div className="section-header">
                <div className="badge">{t('preview.badge')}</div>
                <h2>{t('preview.title')}</h2>
            </div>
            <DesktopMockup />
        </div>
    </section>
);

// Steps
const Steps = ({ t }) => (
    <section id="fonctionnement">
        <div className="container">
            <motion.div
                className="section-header"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2>{t('steps.header')}</h2>
                <p>{t('steps.subheader')}</p>
            </motion.div>
            <motion.div
                className="steps-timeline"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {[
                    { num: 1, title: t('steps.s1t'), desc: t('steps.s1d'), color: "orange", icon: <Smartphone /> },
                    { num: 2, title: t('steps.s2t'), desc: t('steps.s2d'), color: "blue", icon: <UserPlus /> },
                    { num: 3, title: t('steps.s3t'), desc: t('steps.s3d'), color: "green", icon: <Package /> },
                    { num: 4, title: t('steps.s4t'), desc: t('steps.s4d'), color: "red", icon: <ShoppingCart /> },
                    { num: 5, title: t('steps.s5t'), desc: t('steps.s5d'), color: "purple", icon: <TrendingUp /> },
                ].map((s, i, arr) => (
                    <React.Fragment key={i}>
                        <motion.div
                            className={`step-card step-${s.color}`}
                            variants={fadeInUp}
                            whileHover={{ y: -10 }}
                        >
                            <div className="step-number">{s.icon}</div>
                            <h4>{s.title}</h4>
                            <p>{s.desc}</p>
                        </motion.div>
                        {i < arr.length - 1 && (
                            <div className="step-connector">
                                <ArrowRight size={24} />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </motion.div>
        </div>
    </section>
);

// Features
const Features = ({ t }) => (
    <section id="fonctionnalites" className="section-alt">
        <div className="container">
            <motion.div
                className="section-header"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2>{t('features.header')}</h2>
            </motion.div>
            <motion.div
                className="features-grid"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {[
                    { icon: <WifiOff size={24} />, title: t('features.f1'), desc: t('features.f1d') },
                    { icon: <MessageCircle size={24} />, title: t('features.f2'), desc: t('features.f2d') },
                    { icon: <Shield size={24} />, title: t('features.f3'), desc: t('features.f3d') },
                    { icon: <Users size={24} />, title: t('features.f4'), desc: t('features.f4d') },
                    { icon: <BarChart3 size={24} />, title: t('features.f5'), desc: t('features.f5d') },
                    { icon: <Globe size={24} />, title: t('features.f6'), desc: t('features.f6d') },
                ].map((f, i) => (
                    <motion.div
                        key={i}
                        className="feature-card"
                        variants={fadeInUp}
                        whileHover={{ y: -5 }}
                    >
                        <div className="feature-icon">{f.icon}</div>
                        <h3>{f.title}</h3>
                        <p>{f.desc}</p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    </section>
);

// Testimonials
const Testimonials = ({ t }) => (
    <section id="temoignages">
        <div className="container">
            <motion.div
                className="section-header"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2>{t('testimonials.header')}</h2>
            </motion.div>
            <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {[
                    { id: 1, img: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=150&q=80" },
                    { id: 2, img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&q=80" },
                    { id: 3, img: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=150&q=80" }
                ].map((item, i) => (
                    <motion.div
                        key={item.id}
                        className="testimonial-card"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        style={{ padding: '32px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}
                        whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)' }}
                    >
                        <div className="quote-icon" style={{ color: 'var(--primary)', opacity: 0.3 }}><MessageCircle size={32} /></div>
                        <p style={{ fontStyle: 'italic', fontSize: '1rem', lineHeight: '1.6' }}>{t(`testimonials.t${item.id}`)}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                            <img src={item.img} alt={t(`testimonials.t${item.id}a`)} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t(`testimonials.t${item.id}a`)}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{t(`testimonials.t${item.id}r`)}</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

// Footer
const Footer = ({ t }) => (
    <footer>
        <div className="container footer-content">
            <div className="footer-links">
                <a href="#">{t('nav.works')}</a><span>•</span>
                <a href="#">{t('nav.features')}</a><span>•</span>
                <a href="#">Tarifs</a><span>•</span>
                <a href="#">Contact</a>
            </div>
            <div className="footer-social">
                <a href="https://wa.me/224621233847" className="social-link"><SocialIcons.WhatsApp /></a>
                <a href="#" className="social-link"><SocialIcons.Facebook /></a>
                <a href="#" className="social-link"><SocialIcons.Instagram /></a>
                <a href="#" className="social-link"><SocialIcons.X /></a>
            </div>
            <div className="footer-bottom"><p>{t('footer.copyright')}</p></div>
        </div>
    </footer>
);

const LandingPage = ({ t, lang, setLang, theme, toggleTheme }) => {
    const [isShopModalOpen, setIsShopModalOpen] = useState(false);

    return (
        <main>
            <Navbar lang={lang} setLang={setLang} theme={theme} toggleTheme={toggleTheme} t={t} />
            <Hero t={t} onOpenShopModal={() => setIsShopModalOpen(true)} />
            <AppPreview t={t} />
            <Steps t={t} />
            <Features t={t} />
            <Testimonials t={t} />
            <Footer t={t} />
            <WhatsAppFAB />

            <AnimatePresence>
                {isShopModalOpen && (
                    <ShopModal
                        isOpen={isShopModalOpen}
                        onClose={() => setIsShopModalOpen(false)}
                        t={t}
                        lang={lang}
                    />
                )}
            </AnimatePresence>
        </main>
    );
};

const App = () => {
    // Theme State
    const [theme, setTheme] = useState('light');

    // Language State
    const [lang, setLang] = useState('fr');

    // Initialize System Settings
    useEffect(() => {
        // Theme
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(systemDark ? 'dark' : 'light');

        // Language
        const userLang = navigator.language || navigator.userLanguage;
        if (userLang.startsWith('en')) setLang('en');
    }, []);

    // Apply Theme to Document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    // Helper translation function
    const t = (key) => {
        const keys = key.split('.');
        let val = translations[lang];
        for (const k of keys) val = val?.[k];
        return val || key;
    };

    return (
        <Routes>
            <Route path="/" element={<LandingPage t={t} lang={lang} setLang={setLang} theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/b/:slug" element={<ShopPage />} />
        </Routes>
    );
};

export default App;
