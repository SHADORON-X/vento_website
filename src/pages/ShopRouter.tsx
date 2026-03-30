/**
 * VELMO — ShopRouter
 * Détecte automatiquement le type de boutique et affiche la bonne page :
 *   account_type = 'boutique'  →  VelmoOnlinePage  (mode, féminin, rose)
 *   tout le reste              →  ShopPage          (marketplace classique)
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ShopPage = () => import('./ShopPage').then(m => m.default);
const VelmoOnlinePage = () => import('./VelmoOnlinePage').then(m => m.default);

// Loader minimal pendant la détection
function DetectingLoader() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fafafa',
        }}>
            <div style={{
                width: 36, height: 36,
                border: '3px solid rgba(233,30,140,0.15)',
                borderTopColor: '#E91E8C',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function ShopRouter() {
    const { slug } = useParams<{ slug: string }>();
    const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);

    useEffect(() => {
        if (!slug) return;

        supabase
            .from('shops')
            .select('account_type')
            .eq('slug', slug.toLowerCase())
            .eq('is_public', true)
            .maybeSingle()
            .then(({ data }) => {
                const isBoutique = data?.account_type === 'boutique';
                const loader = isBoutique ? VelmoOnlinePage : ShopPage;
                loader().then(Comp => setComponent(() => Comp));
            });
    }, [slug]);

    if (!Component) return <DetectingLoader />;
    return <Component />;
}
