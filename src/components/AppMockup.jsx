import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants & Styles ──────────────────────────────────────────────────────
const PURPLE = '#8b5cf6';
const ORANGE = '#f97316';
const BLUE = '#3b82f6';
const GREEN = '#10b981';
const DARK_BG = '#030712';
const PANEL_BG = 'rgba(255, 255, 255, 0.03)';
const PANEL_BORDER = 'rgba(255, 255, 255, 0.08)';

// ─── Common SVG primitives ─────────────────────────────────────────────────
// Inner screen coordinates: x=0 y=0 w=680 h=400 (relative)

function Sidebar({ activeIdx = 0 }) {
  const items = ['🏠', '🛒', '📦', '📊', '👥'];
  const labels = ['Accueil', 'Caisse', 'Stock', 'Analytics', 'Équipe'];
  return (
    <g>
      <rect x="0" y="0" width="130" height="400" fill="#020617" />
      <rect x="129.5" y="0" width="0.5" height="400" fill="white" fillOpacity="0.05" />

      {/* Logo */}
      <g transform="translate(18, 18)">
        <rect width="24" height="24" rx="6" fill={ORANGE} />
        <text x="12" y="17" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" style={{ pointerEvents: 'none' }}>V</text>
        <text x="32" y="17" fill="white" fontSize="11" fontWeight="800" letterSpacing="-0.02em">Velmo</text>
      </g>

      {/* Nav items */}
      {items.map((icon, i) => (
        <g key={i} transform={`translate(8, ${64 + i * 44})`}>
          <rect
            width="114" height="34"
            rx="10"
            fill={activeIdx === i ? ORANGE : 'transparent'}
            opacity={activeIdx === i ? 0.9 : 1}
          />
          <text x="12" y="21" fontSize="12">{icon}</text>
          <text
            x="34" y="21"
            fill={activeIdx === i ? 'white' : '#94a3b8'}
            fontSize="10"
            fontWeight={activeIdx === i ? '700' : '600'}
          >
            {labels[i]}
          </text>
          {activeIdx === i && (
            <circle cx="-4" cy="17" r="2" fill={ORANGE} />
          )}
        </g>
      ))}

      {/* Bottom Section */}
      <g transform="translate(12, 340)">
        <rect width="106" height="48" rx="12" fill="white" fillOpacity="0.03" />
        <rect x="8" y="10" width="28" height="28" rx="8" fill="#1e293b" />
        <text x="22" y="29" textAnchor="middle" fill="white" fontSize="10" fontWeight="800">M</text>
        <text x="42" y="23" fill="white" fontSize="9" fontWeight="700">Mamadou B.</text>
        <text x="42" y="34" fill={ORANGE} fontSize="8" fontWeight="600">Admin</text>
      </g>
    </g>
  );
}

// ─── Dashboard Screen ──────────────────────────────────────────────────────
function DashboardScreen() {
  return (
    <g>
      <Sidebar activeIdx={0} />
      <rect x="130" y="0" width="550" height="400" fill={DARK_BG} />

      {/* Top Bar */}
      <rect x="130" y="0" width="550" height="56" fill="#020617" />
      <text x="154" y="34" fill="white" fontSize="14" fontWeight="800" letterSpacing="-0.01em">Tableau de bord</text>
      <rect x="530" y="18" width="130" height="24" rx="12" fill="white" fillOpacity="0.04" />
      <text x="595" y="34" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">Derniers 30 jours</text>

      {/* Metrics */}
      {[
        { x: 154, label: 'Revenus', val: '1.2M', color: ORANGE, delta: '+12.4%' },
        { x: 286, label: 'Ventes', val: '47', color: BLUE, delta: '+5.2%' },
        { x: 418, label: 'Stock', val: '234', color: GREEN, delta: 'Sain' },
        { x: 550, label: 'Dettes', val: '3', color: '#ef4444', delta: '-2' },
      ].map((c, i) => (
        <g key={i} transform={`translate(${c.x}, 76)`}>
          <rect width="120" height="74" rx="16" fill={PANEL_BG} stroke={PANEL_BORDER} strokeWidth="1" />
          <text x="12" y="22" fill="#94a3b8" fontSize="8" fontWeight="700" style={{ textTransform: 'uppercase' }} letterSpacing="0.05em">{c.label}</text>
          <text x="12" y="46" fill="white" fontSize="16" fontWeight="900">{c.val} <tspan fontSize="9" fontWeight="600" fill="#64748b">GNF</tspan></text>
          <text x="12" y="62" fill={c.color} fontSize="8" fontWeight="700">{c.delta}</text>

          <path d="M70,55 Q85,35 100,45" fill="none" stroke={c.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <circle cx="100" cy="45" r="2" fill={c.color} />
        </g>
      ))}

      {/* Main Content Area */}
      <g transform="translate(154, 166)">
        <rect width="516" height="218" rx="16" fill={PANEL_BG} stroke={PANEL_BORDER} strokeWidth="1" />

        {/* Visual Header */}
        <text x="20" y="30" fill="white" fontSize="11" fontWeight="800">Transactions récentes</text>
        <text x="496" y="30" textAnchor="end" fill="#64748b" fontSize="9" fontWeight="600">Voir tout</text>

        {/* Rows */}
        {[
          { prod: 'Huile de palme 5L', client: 'Aïssatou D.', amt: '25k', status: 'Payé', sc: GREEN, sb: 'rgba(16,185,129,0.1)' },
          { prod: 'Riz parfumé 25kg', client: 'Ibrahima K.', amt: '42k', status: 'En cours', sc: '#f59e0b', sb: 'rgba(245,158,11,0.1)' },
          { prod: 'Savon Duru ×12', client: 'Fatoumata B.', amt: '18k', status: 'Payé', sc: GREEN, sb: 'rgba(16,185,129,0.1)' },
        ].map((r, i) => (
          <g key={i} transform={`translate(0, ${50 + i * 44})`}>
            <line x1="20" y1="0" x2="496" y2="0" stroke="white" strokeOpacity="0.05" />
            <rect x="20" y="10" width="24" height="24" rx="6" fill="white" fillOpacity="0.05" />
            <text x="32" y="26" textAnchor="middle" fill="white" fontSize="10">📦</text>
            <text x="54" y="21" fill="white" fontSize="10" fontWeight="700">{r.prod}</text>
            <text x="54" y="32" fill="#64748b" fontSize="8">{r.client}</text>

            <text x="380" y="26" textAnchor="end" fill="white" fontSize="10" fontWeight="800">{r.amt} GNF</text>

            <rect x="420" y="14" width="76" height="18" rx="9" fill={r.sb} />
            <text x="458" y="26" textAnchor="middle" fill={r.sc} fontSize="8" fontWeight="800">{r.status}</text>
          </g>
        ))}
      </g>
    </g>
  );
}

// ─── POS Screen ────────────────────────────────────────────────────────────
function POSScreen() {
  return (
    <g>
      <Sidebar activeIdx={1} />
      <rect x="130" y="0" width="550" height="400" fill={DARK_BG} />

      {/* Grid Area */}
      <g transform="translate(148, 18)">
        <rect width="320" height="34" rx="10" fill="white" fillOpacity="0.04" stroke={PANEL_BORDER} />
        <text x="14" y="21" fill="#64748b" fontSize="10">🔍 Rechercher un produit...</text>

        {/* Horizontal Category bar */}
        <g transform="translate(0, 48)">
          {['Tout', 'Alim.', 'Boisson', 'Hygiène'].map((cat, i) => (
            <g key={i} transform={`translate(${i * 65}, 0)`}>
              <rect width="58" height="24" rx="8" fill={i === 0 ? ORANGE : 'white'} fillOpacity={i === 0 ? 1 : 0.05} />
              <text x="29" y="16" textAnchor="middle" fill={i === 0 ? 'white' : '#94a3b8'} fontSize="8" fontWeight="700">{cat}</text>
            </g>
          ))}
        </g>

        {/* Product Grid */}
        <g transform="translate(0, 90)">
          {[
            { name: 'Huile 5L', p: '12k', e: '🛢️', c: '#1e3a8a' },
            { name: 'Riz 25kg', p: '42k', e: '🍚', c: '#065f46' },
            { name: 'Sucre 5kg', p: '18k', e: '🍬', c: '#92400e' },
            { name: 'Savon ×6', p: '8k', e: '🧼', c: '#5b21b6' },
          ].map((p, i) => (
            <g key={i} transform={`translate(${(i % 2) * 165}, ${Math.floor(i / 2) * 100})`}>
              <rect width="155" height="90" rx="16" fill={p.c} fillOpacity="0.15" stroke={PANEL_BORDER} />
              <g transform="translate(12, 12)">
                <rect width="40" height="40" rx="10" fill={p.c} fillOpacity="0.2" />
                <text x="20" y="26" textAnchor="middle" fontSize="20">{p.e}</text>
              </g>
              <text x="64" y="28" fill="white" fontSize="11" fontWeight="800">{p.name}</text>
              <text x="64" y="42" fill={ORANGE} fontSize="10" fontWeight="800">{p.p} GNF</text>

              <rect x="12" y="60" width="131" height="22" rx="8" fill={ORANGE} />
              <text x="77" y="74" textAnchor="middle" fill="white" fontSize="9" fontWeight="800">+ Ajouter au panier</text>
            </g>
          ))}
        </g>
      </g>

      {/* Cart Sidebar */}
      <g transform="translate(488, 0)">
        <rect width="192" height="400" fill="#020617" />
        <rect width="0.5" height="400" fill="white" fillOpacity="0.1" />

        <text x="20" y="34" fill="white" fontSize="13" fontWeight="900">🛒 Panier</text>
        <rect x="138" y="21" width="34" height="18" rx="9" fill={ORANGE} fillOpacity="0.15" />
        <text x="155" y="32" textAnchor="middle" fill={ORANGE} fontSize="8" fontWeight="800">4 art.</text>

        {/* Cart list */}
        <g transform="translate(12, 56)">
          {[
            { n: 'Huile 5L', q: 2, p: '24k' },
            { n: 'Riz 25kg', q: 1, p: '42k' },
          ].map((item, i) => (
            <g key={i} transform={`translate(0, ${i * 48})`}>
              <rect width="168" height="40" rx="12" fill="white" fillOpacity="0.03" stroke={PANEL_BORDER} />
              <text x="12" y="18" fill="white" fontSize="9" fontWeight="700">{item.n}</text>
              <text x="12" y="30" fill="#64748b" fontSize="8">Qté: {item.q}</text>
              <text x="156" y="26" textAnchor="end" fill="white" fontSize="10" fontWeight="800">{item.p}</text>
            </g>
          ))}
        </g>

        {/* Total section */}
        <g transform="translate(12, 280)">
          <rect width="168" height="108" rx="18" fill={ORANGE} />
          <text x="84" y="30" textAnchor="middle" fill="white" fillOpacity="0.8" fontSize="9" fontWeight="600">Total à payer</text>
          <text x="84" y="60" textAnchor="middle" fill="white" fontSize="22" fontWeight="900">84,000 <tspan fontSize="10">GNF</tspan></text>
          <rect x="20" y="76" width="128" height="22" rx="11" fill="white" />
          <text x="84" y="91" textAnchor="middle" fill={ORANGE} fontSize="10" fontWeight="900">ENCAISSER</text>
        </g>
      </g>
    </g>
  );
}

// ─── Laptop Frame ──────────────────────────────────────────────────────────
function LaptopFrame({ children }) {
  return (
    <svg
      viewBox="0 0 810 540"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <linearGradient id="laptop-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e293b" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="bezel-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0f172a" />
          <stop offset="0.5" stopColor="#1e293b" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>

        <clipPath id="screen-clip">
          <rect x="45" y="34" width="720" height="422" rx="10" />
        </clipPath>
      </defs>

      {/* Ambient Glow */}
      <ellipse cx="405" cy="240" rx="350" ry="200" fill={ORANGE} fillOpacity="0.08" filter="url(#glow)" />

      {/* Laptop lid (Upper Shell) */}
      <rect x="20" y="10" width="770" height="470" rx="20" fill="url(#laptop-body)" stroke="#ffffff08" strokeWidth="1" />

      {/* Screen Bezel */}
      <rect x="34" y="24" width="742" height="442" rx="14" fill="#020617" stroke="#ffffff10" strokeWidth="1" />

      {/* Camera */}
      <circle cx="405" cy="18" r="3" fill="#1e293b" />
      <circle cx="405" cy="18" r="1" fill="#3b82f6" fillOpacity="0.5" />

      {/* Screen content area */}
      <rect x="45" y="34" width="720" height="422" rx="10" fill={DARK_BG} />
      <g clipPath="url(#screen-clip)" transform="translate(45,34) scale(1.0588)">
        {children}
      </g>

      {/* Bottom Base (Keyboard area) */}
      <g transform="translate(0, 480)">
        {/* 3D Base effect */}
        <path d="M0,4 Q0,20 20,20 L790,20 Q810,20 810,4 L810,0 L0,0 Z" fill="#0f172a" />
        <path d="M0,0 L810,0 L790,10 L20,10 Z" fill="#1e293b" />
        {/* Indent for opening */}
        <rect x="330" y="0" width="150" height="8" rx="4" fill="#020617" />
        {/* Bottom reflection */}
        <rect x="5" y="17" width="800" height="1" fill="white" fillOpacity="0.1" />
      </g>

      {/* Screen Reflection overlay */}
      <path d="M45,34 L765,34 L45,456 Z" fill="white" fillOpacity="0.02" pointerEvents="none" />
    </svg>
  );
}

// ─── Screens data ──────────────────────────────────────────────────────────
const SCREENS = [
  { key: 'dashboard', label: 'Dashboard', Component: DashboardScreen },
  { key: 'pos', label: 'Caisse', Component: POSScreen },
];

export default function AppMockup() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % SCREENS.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const { Component, key } = SCREENS[idx];

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Floating Navigation (Premium Glass) */}
      <div className="flex justify-center mb-8">
        <div className="p-1 px-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-2xl flex gap-1">
          {SCREENS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setIdx(i)}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-500 uppercase tracking-widest ${i === idx
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105'
                : 'text-slate-500 hover:text-slate-200'
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Mockup Container */}
      <div className="relative group">
        {/* Background ambient light */}
        <div className="absolute -inset-20 bg-orange-500/10 blur-[100px] rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-1000" />

        <LaptopFrame>
          <AnimatePresence mode="wait">
            <motion.g
              key={key}
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(5px)' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Component />
            </motion.g>
          </AnimatePresence>
        </LaptopFrame>

        {/* Overlaid Dynamic Badges */}
        <div className="absolute -left-12 top-1/4 z-20 hidden md:block">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="p-4 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Vente réalisée !</div>
              <div className="text-lg font-black text-white">+ 25,000 GNF</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute top-3 right-3" />
          </motion.div>
        </div>

        <div className="absolute -right-8 bottom-1/3 z-20 hidden md:block">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="p-4 rounded-3xl bg-slate-900/80 border border-orange-500/30 backdrop-blur-2xl shadow-2xl flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center">
              <span className="text-xl">📦</span>
            </div>
            <div>
              <div className="text-[10px] font-bold text-orange-400 uppercase tracking-tighter">Stock Alerte</div>
              <div className="text-sm font-bold text-white">Riz Parfumé: 12kg</div>
            </div>
          </motion.div>
        </div>

        <div className="absolute left-1/2 -bottom-6 -translate-x-1/2 z-20 hidden md:block">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="px-6 py-3 rounded-full bg-blue-600/90 border border-blue-400/50 backdrop-blur-xl shadow-2xl flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-black text-white uppercase tracking-widest whitespace-nowrap">Commande en ligne reçue !</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
