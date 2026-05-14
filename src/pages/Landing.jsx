import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import {
  getTopProducts,
  getPlatformStats,
  getAvailableCategories,
} from '../lib/api';
import { useSite } from '../context/SiteContext';
import Footer from '../components/Footer';

// Lazy-load sections for ultimate startup speed
const HeroSearch = lazy(() => import('../components/HeroSearch'));
const BestProducts = lazy(() => import('../components/BestProducts'));
const PricingSection = lazy(() => import('../components/PricingSection'));
const SellersFeed = lazy(() => import('../components/SellersFeed'));
const FeaturedShops = lazy(() => import('../components/FeaturedShops'));
const StatsSection = lazy(() => import('../components/StatsSection'));
const ProblemSection = lazy(() => import('../components/ProblemSection'));
const VisionSection = lazy(() => import('../components/VisionSection'));
const TestimonialsSection = lazy(() => import('../components/TestimonialsSection'));

// ─── Variants ────────────────────────────────────────────────────────────────
const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// ─── UI Helpers ──────────────────────────────────────────────────────────────
function SectionLabel({ icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold rounded-full mb-4 tracking-wide uppercase">
      {icon}{label}
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="py-24 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
}

// ─── Main Landing Page ───────────────────────────────────────────────────────
export default function Landing() {
  const { theme } = useSite();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState({ shopCount: 0, productCount: 0, orderCount: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [s, p] = await Promise.all([
          getPlatformStats(),
          getTopProducts({ limit: 12 }),
        ]);
        setStats(s);
        setTopProducts(p);
      } catch (err) {
        console.error("Landing data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className={`${isDark ? 'bg-[#080b10] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      <Helmet>
        <title>Velmo — Logiciel de Caisse & Marketplace pour Commerçants d'Afrique</title>
        <meta name="description" content="Velmo est le logiciel de caisse #1 pour commerçants africains. POS hors-ligne, gestion stock, dettes, WhatsApp automatique et boutique en ligne. Disponible en Guinée et Afrique." />
        <meta name="keywords" content="logiciel de caisse guinée, velmo, gestion boutique afrique, pos mobile, gestion stock conakry, boutique en ligne guinée, marketplace afrique" />
        <link rel="canonical" href="https://velmo.org/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://velmo.org/" />
        <meta property="og:title" content="Velmo — Logiciel de Caisse & Marketplace Afrique" />
        <meta property="og:description" content="Gérez votre boutique sans internet. Ventes, stocks, dettes, WhatsApp et boutique en ligne en un seul outil." />
        <meta property="og:image" content="https://velmo.org/market/logo-social.png" />
        <meta property="og:locale" content="fr_GN" />
        <meta property="og:site_name" content="Velmo" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Velmo — Logiciel de Caisse & Marketplace Afrique" />
        <meta name="twitter:description" content="POS hors-ligne, gestion stock, dettes, WhatsApp auto et boutique en ligne pour commerçants africains." />
        <meta name="twitter:image" content="https://velmo.org/market/logo-social.png" />

        {/* JSON-LD structured data */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Velmo",
          "operatingSystem": "Windows, Android, Web",
          "applicationCategory": "BusinessApplication",
          "description": "Logiciel de caisse et marketplace pour commerçants d'Afrique. Gestion de stock, dettes, ventes hors-ligne, boutique en ligne.",
          "url": "https://velmo.org",
          "offers": [
            { "@type": "Offer", "price": "500000", "priceCurrency": "GNF", "name": "Velmo Standard" },
            { "@type": "Offer", "price": "900000", "priceCurrency": "GNF", "name": "Velmo Pro" }
          ],
          "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "320" }
        })}</script>
      </Helmet>

      {/* ════ HERO SECTION ════ */}
      <section className="relative pt-28 pb-16 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/8 blur-[80px] rounded-full will-change-transform" />
        </div>

        <div className="container relative z-10 text-center">
          <motion.div variants={heroContainer} initial="hidden" animate="show">
            <motion.div variants={heroItem}>
              <SectionLabel icon={<Sparkles size={12} />} label="Vendez mieux, gérez plus vite" />
            </motion.div>
            
            <motion.h1 variants={heroItem} className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
              Le commerce <br />
              <span className="text-orange-500">réinventé</span>.
            </motion.h1>

            <motion.p variants={heroItem} className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
              La solution tout-en-un pour les commerçants d'Afrique. 
              Gérez votre boutique sans internet et vendez en ligne instantanément.
            </motion.p>

            <motion.div variants={heroItem} className="w-full">
              <Suspense fallback={<div className="h-16 bg-white/5 rounded-2xl animate-pulse max-w-2xl mx-auto" />}>
                <HeroSearch />
              </Suspense>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════ STATS ════ */}
      <Suspense fallback={<SectionSkeleton />}>
        <StatsSection stats={stats} />
      </Suspense>

      {/* ════ PROBLEM ════ */}
      <Suspense fallback={<SectionSkeleton />}>
        <ProblemSection />
      </Suspense>

      {/* ════ MARKETPLACE PREVIEW ════ */}
      <Suspense fallback={<SectionSkeleton />}>
        <BestProducts products={topProducts} loading={loading} />
      </Suspense>

      {/* ════ VISION ════ */}
      <Suspense fallback={<SectionSkeleton />}>
        <VisionSection />
      </Suspense>

      {/* ════ PRICING ════ */}
      <Suspense fallback={<SectionSkeleton />}>
        <PricingSection />
      </Suspense>

      {/* ════ TESTIMONIALS ════ */}
      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection />
      </Suspense>

      {/* ════ SELLERS FEED ════ */}
      <Suspense fallback={<SectionSkeleton />}>
        <SellersFeed />
      </Suspense>

      <Footer />
    </div>
  );
}
