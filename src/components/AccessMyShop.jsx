import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, ArrowRight, X, Loader2, AlertCircle, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

/**
 * Bouton + Modal "Accéder à ma boutique"
 * L'utilisateur entre son slug → redirigé vers /b/{slug}
 */
export default function AccessMyShop({ variant = 'button' }) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null); // shop trouvé en live
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Focus input à l'ouverture
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Escape pour fermer
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  // Prévisualisation live pendant la saisie
  useEffect(() => {
    const val = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (val.length < 2) { setPreview(null); setError(''); return; }

    setError('');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setChecking(true);
      const { data } = await supabase
        .from('shops')
        .select('id,name,slug,logo,location,category,is_verified,description')
        .eq('slug', val)
        .eq('is_public', true)
        .maybeSingle();
      setPreview(data || null);
      if (!data && val.length >= 3) setError('Aucune boutique trouvée avec ce slug.');
      else setError('');
      setChecking(false);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [slug]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const val = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (!val) return;
    if (preview) {
      navigate(`/b/${preview.slug}`);
      setOpen(false);
      setSlug('');
    } else {
      // Aller quand même
      navigate(`/b/${val}`);
      setOpen(false);
      setSlug('');
    }
  };

  const logo = preview?.logo;

  return (
    <>
      {/* Trigger */}
      {variant === 'button' && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/6 border border-white/10 rounded-full text-slate-300 hover:text-white hover:border-orange-500/40 hover:bg-orange-500/8 transition-all text-sm font-semibold"
        >
          <Store size={14} className="text-orange-400" />
          Accéder à ma boutique
        </button>
      )}
      {variant === 'hero' && (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors group"
        >
          <Store size={15} />
          Accéder à ma boutique
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </button>
      )}
      {variant === 'card' && (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white/5 border border-white/10 hover:border-orange-500/40 hover:bg-orange-500/8 rounded-2xl text-white font-semibold text-sm transition-all group"
        >
          <Store size={16} className="text-orange-400" />
          Accéder à ma boutique
          <ArrowRight size={14} className="text-slate-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
        </button>
      )}

      {/* Modal overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="relative bg-[#0e1117] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl shadow-black/60"
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all"
              >
                <X size={14} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center">
                  <Store size={20} className="text-orange-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Accéder à ma boutique</h2>
                  <p className="text-slate-500 text-sm">Entrez votre slug ou nom de boutique</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="relative mb-4">
                  {/* Prefix */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    <span className="text-slate-600 text-sm">velmo.pro/</span>
                  </div>
                  <input
                    ref={inputRef}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                    placeholder="ma-boutique"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-[88px] pr-10 py-3.5 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors placeholder-slate-700"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checking
                      ? <Loader2 size={15} className="animate-spin text-orange-400" />
                      : slug.length >= 2
                        ? preview
                          ? <span className="text-emerald-400 text-xs">✓</span>
                          : <Search size={15} className="text-slate-600" />
                        : null}
                  </div>
                </div>

                {/* Preview boutique trouvée */}
                <AnimatePresence>
                  {preview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 p-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl">
                        <div
                          className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-black text-sm"
                          style={{ background: logo ? undefined : 'linear-gradient(135deg,#f97316,#ea580c)' }}
                        >
                          {logo
                            ? <img src={logo} alt="" className="w-full h-full object-cover" />
                            : preview.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-semibold text-sm truncate flex items-center gap-1">
                            {preview.name}
                            {preview.is_verified && <span className="text-orange-400 text-xs">✓</span>}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {preview.category}{preview.location ? ` · ${preview.location}` : ''}
                          </p>
                        </div>
                        <span className="text-emerald-400 text-xs font-bold flex-shrink-0">Trouvée !</span>
                      </div>
                    </motion.div>
                  )}
                  {error && !checking && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 p-3 bg-red-500/8 border border-red-500/20 rounded-xl">
                        <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-xs">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={slug.trim().length < 2 || checking}
                  className="w-full velmo-btn-primary py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {checking ? <Loader2 size={15} className="animate-spin" /> : <Store size={15} />}
                  {preview ? `Ouvrir "${preview.name}"` : 'Accéder à la boutique'}
                  {!checking && <ArrowRight size={15} />}
                </button>
              </form>

              {/* Hint */}
              <p className="text-slate-600 text-xs text-center mt-4">
                Votre slug se trouve dans Velmo → Paramètres → Vitrine web
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
