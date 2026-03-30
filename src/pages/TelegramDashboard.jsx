import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    TrendingUp, Package, CreditCard, Zap, ShieldCheck,
    Bell, Clock, Settings, LayoutDashboard, CheckCircle,
    AlertCircle, ToggleLeft, ToggleRight, Save, RefreshCw,
    ChevronRight, Store, Target
} from 'lucide-react';

// ─── Types/Interfaces (for clarity in JSX) ────────────────────────
// Stats: revenue, salesCount, totalDebt, lowStockCount, hourlyData, trendData, shopName

// ─── Helpers ─────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0));

// ─── Mini Components ─────────────────────────────────────────────
function StatCard({ label, value, unit = 'GNF', color, icon: Icon, sub }) {
    return (
        <div className={`relative overflow-hidden rounded-3xl p-4 border border-white/10 bg-gradient-to-br ${color}`}>
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/5 blur-xl" />
            <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black tracking-widest text-white/60 uppercase">{label}</p>
                <Icon size={14} className="text-white/40" />
            </div>
            <div className="flex items-end gap-1">
                <span className="text-2xl font-black text-white leading-none">{typeof value === 'number' ? fmt(value) : value}</span>
                {unit && <span className="text-[10px] font-bold text-white/50 mb-0.5">{unit}</span>}
            </div>
            {sub && <p className="text-[10px] text-white/40 mt-1">{sub}</p>}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────
export default function TelegramDashboard() {
    const [searchParams] = useSearchParams();
    const shopId = searchParams.get('shop_id');
    const [stats, setStats] = useState(null);
    const [settings, setSettings] = useState({
        notify_big_sales: true,
        big_sale_threshold: 500000,
        notif_mute_start: '22:00',
        notif_mute_end: '07:00',
        report_hour: 18,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('live');
    const [orders, setOrders] = useState([]);
    const [shopInfo, setShopInfo] = useState({ phone: '', whatsapp: '' });
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!shopId) return;
        setLoading(true);
        setError(null);
        try {
            // Dashboard Stats via RPC (bypasse RLS if exists)
            const { data: rpcData, error: rpcErr } = await supabase.rpc('get_tambo_dashboard_stats', { p_shop_id: shopId });

            if (rpcErr) {
                // Fallback: get_telegram_stats (RLS-safe)
                const { data: tStats } = await supabase.rpc('get_telegram_stats', { p_shop_id: shopId, p_days: 7 });
                if (tStats && !tStats.error) {
                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    const allSales = tStats.sales || [];
                    const todaySales = allSales.filter(s => new Date(s.created_at) >= today);
                    const revenue = todaySales.reduce((s, r) => s + (r.total_amount || 0), 0);
                    const totalDebt = (tStats.debts || []).reduce((s, d) => s + (d.remaining_amount || 0), 0);
                    const prods = tStats.products || [];
                    const lowStockCount = prods.filter(p => p.quantity <= (p.stock_alert || 5)).length;
                    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split('T')[0]; });
                    const trendData = days.map(date => ({ name: date.split('-').slice(1).join('/'), total: allSales.filter(s => s.created_at?.startsWith(date)).reduce((s, r) => s + (r.total_amount || 0), 0) }));
                    const hourlyData = Array.from({ length: 8 }, (_, i) => ({ hour: `${8 + i * 2}h`, total: 0 }));
                    todaySales.forEach(s => { const h = new Date(s.created_at).getHours(); const slot = Math.floor((h - 8) / 2); if (slot >= 0 && slot < 8) hourlyData[slot].total += s.total_amount || 0; });
                    setStats({ revenue, salesCount: todaySales.length, totalDebt, lowStockCount, trendData, hourlyData, shopName: tStats.shop?.name || 'Mon Empire' });
                }
            } else if (rpcData) {
                setStats(rpcData);
            }

            // Notification Settings from telegram_subscribers
            const { data: sub } = await supabase
                .from('telegram_subscribers')
                .select('notify_big_sales, big_sale_threshold, notif_mute_start, notif_mute_end, report_hour')
                .eq('shop_id', shopId)
                .maybeSingle();

            if (sub) {
                setSettings({
                    notify_big_sales: sub.notify_big_sales ?? true,
                    big_sale_threshold: sub.big_sale_threshold ?? 500000,
                    notif_mute_start: (sub.notif_mute_start || '22:00').slice(0, 5),
                    notif_mute_end: (sub.notif_mute_end || '07:00').slice(0, 5),
                    report_hour: sub.report_hour ?? 18,
                });
            }

            // Fetch Customer Orders + Shop Info via RPCs (RLS-safe)
            const [ordersRes, shopRes] = await Promise.all([
                supabase.rpc('sync_pull_table', { p_table_name: 'customer_orders', p_shop_id: shopId, p_last_sync: new Date(0).toISOString() }),
                supabase.rpc('get_shop_settings', { p_shop_id: shopId }),
            ]);
            const ordData = Array.isArray(ordersRes.data) ? ordersRes.data : [];
            setOrders(ordData.slice(-20).reverse());
            const shp = shopRes.data?.shop;
            if (shp) setShopInfo({ phone: shp.phone || '', whatsapp: shp.whatsapp || '' });
        } catch (err) {
            console.error(err);
            setError('Impossible de charger les données. Vérifiez votre connexion.');
        } finally {
            setLoading(false);
        }
    }, [shopId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const saveSettings = async () => {
        if (!shopId) return;
        setSaving(true);
        try {
            // Update Bot Settings + Shop Info via RPCs (RLS-safe)
            await Promise.all([
                supabase.rpc('save_whatsapp_config', {
                    p_shop_id: shopId,
                    p_data: { report_hour: settings.report_hour, daily_report_enabled: true },
                }),
                supabase.rpc('update_shop_online_profile', {
                    p_shop_id: shopId,
                    p_data: { phone: shopInfo.phone, whatsapp: shopInfo.whatsapp },
                }),
            ]);

            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // ─── No shop_id ─────────────────────────────────────────────
    if (!shopId) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-orange-500/10 flex items-center justify-center mb-6">
                <Store size={36} className="text-orange-400" />
            </div>
            <h1 className="text-xl font-black text-white mb-2">Boutique non détectée</h1>
            <p className="text-slate-400 text-sm">Veuillez ouvrir ce lien depuis le Bot Telegram Tambo.</p>
        </div>
    );

    // ─── Loading ─────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
            <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" size={24} />
            </div>
            <p className="mt-6 text-orange-200 font-bold tracking-widest text-xs uppercase animate-pulse">Synchronisation avec Tambo...</p>
        </div>
    );

    // ─── Error ────────────────────────────────────────────────────
    if (error) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle size={48} className="text-red-400 mb-4" />
            <p className="text-red-300 font-bold mb-4">{error}</p>
            <button onClick={fetchData} className="px-6 py-3 bg-orange-500 text-white font-bold rounded-2xl flex items-center gap-2">
                <RefreshCw size={16} /> Réessayer
            </button>
        </div>
    );

    // ─── Main UI ─────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#020617] text-white pb-24 font-sans">
            <header className="sticky top-0 z-10 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-sm font-black text-white">{stats?.shopName || 'Chargement...'}</h1>
                        <p className="text-[10px] text-slate-500">Empire Velmo • Tambo Intelligence</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-full">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-400">EN DIRECT</span>
                    </div>
                </div>
            </header>

            <div className="flex gap-1 px-4 pt-4 pb-2 overflow-x-auto hide-scrollbar">
                {[
                    { id: 'live', label: '⚡ Live', icon: LayoutDashboard },
                    { id: 'orders', label: '📦 Commandes', icon: Package },
                    { id: 'trends', label: '📈 Stats', icon: TrendingUp },
                    { id: 'automations', label: '🤖 Auto', icon: Zap },
                    { id: 'settings', label: '⚙️ Shop', icon: Settings },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${activeTab === tab.id
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'live' && (
                <div className="px-4 space-y-4 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Tambo Proactive Insight */}
                    <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/5 border border-orange-500/20 rounded-3xl p-5 relative overflow-hidden">
                        <div className="flex gap-4 items-start relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/40">
                                <Zap size={24} className="text-white fill-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Conseil de Tambo 🦁</p>
                                <p className="text-sm font-bold text-white leading-tight">
                                    {stats?.revenue > 0
                                        ? `Bravo Chef ! Tu as fait ${stats.salesCount} ventes. ${stats.revenue > (stats.lastMonthRevenue / 30) ? 'Tu es plus rapide que la moyenne ! 🚀' : 'Continue comme ça ! 🔥'}`
                                        : "La journée commence, Patron ! Prêt à exploser les scores aujourd'hui ? 💪"}
                                </p>
                            </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <Zap size={80} className="text-orange-500" />
                        </div>
                    </div>

                    {/* Progress Gauge */}
                    <div className="bg-white/[0.04] border border-white/8 rounded-3xl p-5">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Objectif du mois</p>
                                <p className="text-lg font-black text-white">{fmt(stats?.monthlyGoal || 2000000)} GNF</p>
                            </div>
                            <p className="text-xs font-bold text-orange-500">
                                {Math.round(((stats?.revenue || 0) / (stats?.monthlyGoal || 2000000)) * 100)}% atteint
                            </p>
                        </div>
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min(100, ((stats?.revenue || 0) / (stats?.monthlyGoal || 2000000)) * 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <StatCard label="Recettes Jour" value={stats?.revenue || 0} color="from-emerald-900/50 to-emerald-800/20" icon={TrendingUp} sub={`${stats?.salesCount || 0} vente(s)`} />
                        <StatCard label="Dettes Client" value={stats?.totalDebt || 0} color="from-rose-900/50 to-rose-800/20" icon={CreditCard} />
                        <StatCard label="Stock Critique" value={stats?.lowStockCount || 0} unit="produit(s)" color="from-amber-900/50 to-amber-800/20" icon={Package} sub="à réapprovisionner" />
                        <StatCard label="Objectif" value={`${stats?.revenue ? Math.min(100, Math.round((stats.revenue / 2000000) * 100)) : 0}%`} unit="" color="from-violet-900/50 to-violet-800/20" icon={Target} sub="de 2M GNF/jour" />
                    </div>

                    <div className="bg-white/[0.04] border border-white/8 rounded-3xl p-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">🕒 Fréquentation horaire (Aujourd'hui)</p>
                        <ResponsiveContainer width="100%" height={120}>
                            <BarChart data={stats?.hourlyData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                                <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 9 }} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 11 }} formatter={(v) => [`${fmt(v)} GNF`, 'Ventes']} />
                                <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <button onClick={fetchData} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        <RefreshCw size={14} /> Rafraîchir les statistiques
                    </button>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="px-4 space-y-4 mt-2 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dernières commandes ({orders.length})</p>
                        <RefreshCw size={14} className={`text-slate-600 ${loading ? 'animate-spin' : ''}`} onClick={fetchData} />
                    </div>

                    {orders.length === 0 ? (
                        <div className="py-20 text-center">
                            <Package size={48} className="text-white/5 mx-auto mb-4" />
                            <p className="text-slate-500 text-sm">Aucune commande reçue via le site pour le moment.</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="bg-white/[0.04] border border-white/8 rounded-3xl p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-black text-white">{order.customer_name}</h4>
                                        <p className="text-[10px] text-slate-500">{new Date(order.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${order.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                        order.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                            'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        }`}>
                                        {order.status === 'pending' ? '⏳ En attente' : order.status === 'confirmed' ? '✅ Confirmée' : '🏁 Livrée'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {(order.items_json || []).map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 overflow-hidden shrink-0">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/10">
                                                        <Package size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-white truncate">{item.name}</p>
                                                <p className="text-[10px] text-slate-500">{item.quantity} x {fmt(item.price)} GNF</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</span>
                                    <span className="text-sm font-black text-orange-500">{fmt(order.total_amount)} GNF</span>
                                </div>

                                <button
                                    onClick={() => window.open(`https://velmo.org/order/${order.id}`, '_blank')}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all"
                                >
                                    Détails & Actions
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
            {activeTab === 'trends' && (
                <div className="px-4 space-y-4 mt-2">
                    <div className="bg-white/[0.04] border border-white/8 rounded-3xl p-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">📈 Évolution Hebdomadaire</p>
                        <p className="text-[10px] text-slate-600 mb-4">Volume des ventes sur les 7 derniers jours</p>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={stats?.trendData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 11 }} formatter={(v) => [`${fmt(v)} GNF`, 'Recettes']} />
                                <Area type="monotone" dataKey="total" stroke="#f97316" strokeWidth={2} fill="url(#grad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white/[0.04] border border-white/8 rounded-3xl p-4 space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Détails de la Semaine</p>
                        {stats?.trendData?.map((d, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">{d.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, (d.total / (Math.max(...stats.trendData.map(x => x.total)) || 1)) * 100)}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-white w-20 text-right">{fmt(d.total)} GNF</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'automations' && (
                <div className="px-4 space-y-4 mt-2">
                    <div className="bg-white/[0.04] border border-white/8 rounded-3xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-white">💰 Alertes Grosses Ventes</p>
                                <p className="text-[10px] text-slate-500">Notification immédiate lors d'un gros encaissement</p>
                            </div>
                            <button onClick={() => setSettings(s => ({ ...s, notify_big_sales: !s.notify_big_sales }))} className="text-orange-400">
                                {settings.notify_big_sales ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-600" />}
                            </button>
                        </div>

                        {settings.notify_big_sales && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Montant minimum (Seuil)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={settings.big_sale_threshold}
                                        onChange={e => setSettings(s => ({ ...s, big_sale_threshold: Number(e.target.value) }))}
                                        className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold text-sm focus:border-orange-500 outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold uppercase tracking-widest">GNF</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white/[0.04] border border-white/8 rounded-3xl p-5 space-y-4">
                        <div>
                            <p className="text-sm font-black text-white">📋 Rapport Quotidien Automatique</p>
                            <p className="text-[10px] text-slate-500">À quelle heure souhaitez-vous votre bilan ?</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[17, 18, 19, 20, 21, 22].map(h => (
                                <button key={h} onClick={() => setSettings(s => ({ ...s, report_hour: h }))}
                                    className={`py-3 rounded-2xl text-xs font-black transition-all ${settings.report_hour === h ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                                    {h}h00
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/[0.04] border border-white/8 rounded-3xl p-5 space-y-4">
                        <p className="text-sm font-black text-white">🌙 Heures de Tranquillité</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Début (Silence)</label>
                                <input type="time" value={settings.notif_mute_start}
                                    onChange={e => setSettings(s => ({ ...s, notif_mute_start: e.target.value }))}
                                    className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold text-sm focus:border-orange-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Fin (Réveil)</label>
                                <input type="time" value={settings.notif_mute_end}
                                    onChange={e => setSettings(s => ({ ...s, notif_mute_end: e.target.value }))}
                                    className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold text-sm focus:border-orange-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    <button onClick={saveSettings} disabled={saving}
                        className="w-full py-5 rounded-3xl font-black text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50">
                        {saving ? <RefreshCw size={18} className="animate-spin" /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
                        {saved ? 'Automations Enregistrées !' : 'Enregistrer la Configuration'}
                    </button>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="px-4 space-y-4 mt-2">
                    <div className="bg-white/[0.04] border border-white/8 rounded-[2.5rem] p-8 text-center">
                        <div className="w-20 h-20 rounded-[2rem] bg-orange-500/10 mx-auto flex items-center justify-center mb-4">
                            <Store size={32} className="text-orange-400" />
                        </div>
                        <h3 className="text-xl font-black text-white">{stats?.shopName || 'Chargement...'}</h3>
                        <p className="text-xs text-slate-500 font-mono mt-1 opacity-50 uppercase tracking-widest">{shopId}</p>
                    </div>

                    <div className="bg-white/[0.04] border border-white/8 rounded-3xl p-6 space-y-6">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Informations de Contact Vitrine</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">📞 Numéro de Téléphone (Client)</label>
                                <input
                                    type="text"
                                    value={shopInfo.phone}
                                    onChange={e => setShopInfo(s => ({ ...s, phone: e.target.value }))}
                                    placeholder="Ex: 622 00 00 00"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white font-bold text-sm focus:border-orange-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">💬 Numéro WhatsApp (Commandes)</label>
                                <input
                                    type="text"
                                    value={shopInfo.whatsapp}
                                    onChange={e => setShopInfo(s => ({ ...s, whatsapp: e.target.value }))}
                                    placeholder="Ex: 622 00 00 00"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white font-bold text-sm focus:border-orange-500 outline-none transition-all border-dashed"
                                />
                                <p className="text-[9px] text-slate-500 mt-2 italic">C'est ce numéro qui recevra les messages de commande de la vitrine.</p>
                            </div>
                        </div>

                        <button onClick={saveSettings} disabled={saving}
                            className="w-full py-4 rounded-2xl font-black text-sm bg-white/5 hover:bg-white/10 text-white border border-white/5 flex items-center justify-center gap-2 active:scale-95 transition-all">
                            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                            Sauvegarder les Infos
                        </button>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-2 space-y-1">
                        {[
                            { label: '📊 Tableau de Bord', action: () => setActiveTab('live') },
                            { label: '⚙️ Configuration Alertes', action: () => setActiveTab('automations') },
                            { label: '🔗 Ouvrir ma Vitrine', action: () => window.open(`https://velmo.org/s/${stats?.slug || ''}`, '_blank') },
                        ].map((item, i) => (
                            <button key={i} onClick={item.action} className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all group">
                                <span className="text-[10px] text-slate-400 font-black group-hover:text-white transition-colors uppercase tracking-widest">{item.label}</span>
                                <ChevronRight size={14} className="text-slate-600 group-hover:text-orange-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <nav className="fixed bottom-0 left-0 right-0 bg-[#020617]/95 backdrop-blur-2xl border-t border-white/5 p-4 safe-area-bottom">
                <div className="flex justify-around items-center max-w-sm mx-auto">
                    {[
                        { id: 'live', label: 'Live', icon: Zap },
                        { id: 'trends', label: 'Stats', icon: TrendingUp },
                        { id: 'automations', label: 'Auto', icon: Bell },
                        { id: 'settings', label: 'Shop', icon: Settings },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center gap-1.5 px-6 py-2 rounded-2xl transition-all ${activeTab === tab.id ? 'text-orange-500 bg-orange-500/5' : 'text-slate-600'}`}>
                            <tab.icon size={20} className={activeTab === tab.id ? 'animate-pulse' : ''} />
                            <span className="text-[9px] font-black uppercase tracking-[0.15em]">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}
