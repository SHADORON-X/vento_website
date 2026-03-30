import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    Search, ArrowLeft, ArrowRight, CheckCircle, Loader2,
    Store, User, Phone, Shield, Eye, EyeOff, ChevronDown, X
} from 'lucide-react';

const ROLES = [
    { id: 'cashier',  label: 'Caissier',   desc: 'Encaisse les ventes au quotidien',   icon: '🧾' },
    { id: 'manager',  label: 'Manager',    desc: 'Gère le stock et les employés',       icon: '📊' },
    { id: 'seller',   label: 'Vendeur',    desc: 'Vend et consulte le catalogue',       icon: '🛒' },
];

const generateVelmoId = () => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const l1 = letters[Math.floor(Math.random() * letters.length)];
    const l2 = letters[Math.floor(Math.random() * letters.length)];
    const num = String(Math.floor(Math.random() * 900) + 100);
    return `VLM-${l1}${l2}-${num}`;
};

export default function JoinShopPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1=search, 2=profile, 3=pin, 4=success

    // Step 1
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [foundShop, setFoundShop] = useState(null);
    const [searchError, setSearchError] = useState('');

    // Step 2
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('cashier');

    // Step 3
    const [pin, setPin] = useState('');
    const [pinConfirm, setPinConfirm] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // ─── Search shop by slug ──────────────────────────────────────
    const handleSearch = async () => {
        const q = searchQuery.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
        if (!q) return;
        setSearching(true);
        setSearchError('');
        setFoundShop(null);
        try {
            const { data, error } = await supabase
                .from('shops')
                .select('id, name, category, location, logo, slug')
                .eq('slug', q)
                .eq('is_active', true)
                .maybeSingle();
            if (error) throw error;
            if (!data) {
                setSearchError('Boutique introuvable. Vérifiez le nom de la boutique.');
            } else {
                setFoundShop(data);
            }
        } catch (err) {
            setSearchError('Erreur de connexion. Vérifiez votre internet.');
        } finally {
            setSearching(false);
        }
    };

    // ─── Hash PIN with SHA-256 (Web Crypto) ──────────────────────
    const hashPin = async (p) => {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(p));
        return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    };

    // ─── Submit join request ──────────────────────────────────────
    const handleSubmit = async () => {
        if (pin !== pinConfirm) { setSubmitError('Les PINs ne correspondent pas.'); return; }
        if (pin.length !== 4) { setSubmitError('Le PIN doit faire 4 chiffres.'); return; }
        setSubmitting(true);
        setSubmitError('');
        try {
            const velmoId = generateVelmoId();
            const pinHash = await hashPin(pin);
            const { data, error } = await supabase.rpc('join_shop_as_employee', {
                p_shop_id:    foundShop.id,
                p_first_name: firstName.trim(),
                p_last_name:  lastName.trim(),
                p_phone:      phone.trim().replace(/\D/g, ''),
                p_role:       role,
                p_pin_hash:   pinHash,
                p_velmo_id:   velmoId,
            });
            if (error) throw error;
            const result = typeof data === 'string' ? JSON.parse(data) : data;
            if (result?.success === false) throw new Error(result.message || 'Erreur inconnue');
            setStep(4);
        } catch (err) {
            setSubmitError(err.message || 'Une erreur est survenue. Réessayez.');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── PinPad ───────────────────────────────────────────────────
    const PinInput = ({ value, onChange, placeholder }) => (
        <div className="relative">
            <input
                type={showPin ? 'text' : 'password'}
                maxLength={4}
                inputMode="numeric"
                pattern="[0-9]*"
                value={value}
                onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder={placeholder}
                className="w-full text-center text-2xl font-black tracking-[0.5em] py-4 rounded-2xl border-2 border-white/10 bg-white/5 text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button
                type="button"
                onClick={() => setShowPin(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {/* 4 dots indicator */}
            <div className="flex justify-center gap-3 mt-3">
                {[0,1,2,3].map(i => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < value.length ? 'bg-orange-500 scale-110' : 'bg-white/20'}`} />
                ))}
            </div>
        </div>
    );

    const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

    return (
        <div className="min-h-screen velmo-mesh-bg velmo-grid-pattern flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={18} />
                    <span className="text-sm font-bold">Accueil</span>
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Store size={14} className="text-white" />
                    </div>
                    <span className="font-black text-white">Velmo</span>
                </div>
                <div className="w-20" />
            </header>

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Progress */}
                    <div className="flex items-center gap-2 mb-8 justify-center">
                        {[1,2,3].map(s => (
                            <React.Fragment key={s}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                    step > s ? 'bg-orange-500 text-white' :
                                    step === s ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500' :
                                    'bg-white/5 text-slate-500 border border-white/10'
                                }`}>
                                    {step > s ? <CheckCircle size={14} /> : s}
                                </div>
                                {s < 3 && <div className={`flex-1 max-w-[60px] h-0.5 ${step > s ? 'bg-orange-500' : 'bg-white/10'}`} />}
                            </React.Fragment>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">

                        {/* ── STEP 1: Recherche boutique ── */}
                        {step === 1 && (
                            <motion.div key="step1" {...fadeIn} transition={{ duration: 0.3 }} className="velmo-glass rounded-3xl p-8">
                                <div className="text-center mb-8">
                                    <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                                        <Search size={26} className="text-orange-400" />
                                    </div>
                                    <h1 className="text-2xl font-black text-white">Rejoindre une boutique</h1>
                                    <p className="text-slate-400 text-sm mt-2">Entrez le nom de la boutique (ex : diallo-electronique)</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                            placeholder="diallo-electronique"
                                            className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 font-mono text-sm transition-colors"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSearch}
                                        disabled={!searchQuery.trim() || searching}
                                        className="velmo-btn-primary w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-black disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                                        {searching ? 'Recherche...' : 'Rechercher'}
                                    </button>

                                    {searchError && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                            <X size={14} /> {searchError}
                                        </motion.div>
                                    )}

                                    {foundShop && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/20 overflow-hidden shrink-0">
                                                    {foundShop.logo
                                                        ? <img src={foundShop.logo} alt="" className="w-full h-full object-cover" />
                                                        : <Store size={20} className="text-orange-400" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-white truncate">{foundShop.name}</p>
                                                    <p className="text-xs text-slate-400">{foundShop.category || 'Boutique'} {foundShop.location ? `· ${foundShop.location}` : ''}</p>
                                                </div>
                                                <CheckCircle size={20} className="text-emerald-400 shrink-0" />
                                            </div>
                                            <button
                                                onClick={() => setStep(2)}
                                                className="velmo-btn-primary w-full mt-4 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black"
                                            >
                                                Rejoindre cette boutique <ArrowRight size={16} />
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2: Profil + Rôle ── */}
                        {step === 2 && (
                            <motion.div key="step2" {...fadeIn} transition={{ duration: 0.3 }} className="velmo-glass rounded-3xl p-8">
                                <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6">
                                    <ArrowLeft size={14} /> Retour
                                </button>
                                <div className="text-center mb-8">
                                    <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                                        <User size={26} className="text-orange-400" />
                                    </div>
                                    <h1 className="text-2xl font-black text-white">Votre profil</h1>
                                    <p className="text-slate-400 text-sm mt-1">Pour rejoindre <span className="text-orange-400 font-bold">{foundShop?.name}</span></p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Prénom', value: firstName, set: setFirstName, placeholder: 'Mamadou' },
                                            { label: 'Nom', value: lastName, set: setLastName, placeholder: 'Diallo' },
                                        ].map(f => (
                                            <div key={f.label}>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">{f.label}</label>
                                                <input
                                                    value={f.value} onChange={e => f.set(e.target.value)}
                                                    placeholder={f.placeholder}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/60 text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Téléphone</label>
                                        <div className="relative">
                                            <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                value={phone} onChange={e => setPhone(e.target.value)}
                                                placeholder="622 000 000"
                                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/60 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Votre rôle</label>
                                        <div className="space-y-2">
                                            {ROLES.map(r => (
                                                <button key={r.id} onClick={() => setRole(r.id)}
                                                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                                                        role === r.id
                                                            ? 'bg-orange-500/10 border-orange-500/40 text-white'
                                                            : 'bg-white/3 border-white/8 text-slate-400 hover:border-white/20'
                                                    }`}>
                                                    <span className="text-lg">{r.icon}</span>
                                                    <div>
                                                        <p className="text-sm font-black">{r.label}</p>
                                                        <p className="text-xs opacity-60">{r.desc}</p>
                                                    </div>
                                                    {role === r.id && <CheckCircle size={16} className="text-orange-400 ml-auto shrink-0" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(3)}
                                        disabled={!firstName.trim() || !lastName.trim() || !phone.trim()}
                                        className="velmo-btn-primary w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-black disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                                    >
                                        Continuer <ArrowRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 3: PIN ── */}
                        {step === 3 && (
                            <motion.div key="step3" {...fadeIn} transition={{ duration: 0.3 }} className="velmo-glass rounded-3xl p-8">
                                <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6">
                                    <ArrowLeft size={14} /> Retour
                                </button>
                                <div className="text-center mb-8">
                                    <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                                        <Shield size={26} className="text-orange-400" />
                                    </div>
                                    <h1 className="text-2xl font-black text-white">Créer votre PIN</h1>
                                    <p className="text-slate-400 text-sm mt-1">4 chiffres pour sécuriser votre compte</p>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-3">PIN (4 chiffres)</label>
                                        <PinInput value={pin} onChange={setPin} placeholder="••••" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-3">Confirmer le PIN</label>
                                        <PinInput value={pinConfirm} onChange={setPinConfirm} placeholder="••••" />
                                    </div>

                                    {pin.length === 4 && pinConfirm.length === 4 && pin !== pinConfirm && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="text-red-400 text-sm text-center">
                                            Les PINs ne correspondent pas
                                        </motion.p>
                                    )}

                                    {submitError && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                            <X size={14} /> {submitError}
                                        </motion.div>
                                    )}

                                    <button
                                        onClick={handleSubmit}
                                        disabled={pin.length < 4 || pinConfirm.length < 4 || pin !== pinConfirm || submitting}
                                        className="velmo-btn-primary w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-black disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                        {submitting ? 'Envoi en cours...' : 'Envoyer la demande'}
                                    </button>

                                    <p className="text-[10px] text-slate-600 text-center">
                                        Votre demande sera examinée par le propriétaire de la boutique avant validation.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 4: Succès ── */}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }} className="velmo-glass rounded-3xl p-10 text-center">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                    className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                                    <CheckCircle size={40} className="text-emerald-400" />
                                </motion.div>
                                <h1 className="text-2xl font-black text-white mb-3">Demande envoyée !</h1>
                                <p className="text-slate-400 text-sm leading-relaxed mb-2">
                                    Votre demande pour rejoindre <span className="text-orange-400 font-bold">{foundShop?.name}</span> a bien été reçue.
                                </p>
                                <p className="text-slate-500 text-xs mb-8">
                                    Le propriétaire va l'examiner et vous validera bientôt. Vous recevrez un accès après approbation.
                                </p>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mb-6 text-left">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Récapitulatif</p>
                                    <p className="text-sm text-white font-bold">{firstName} {lastName}</p>
                                    <p className="text-xs text-slate-400">{ROLES.find(r => r.id === role)?.label} · {foundShop?.name}</p>
                                </div>
                                <button onClick={() => navigate('/')}
                                    className="velmo-btn-ghost w-full py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2">
                                    <ArrowLeft size={16} /> Retour à l'accueil
                                </button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
