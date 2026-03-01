// ================================================================
// VELMO MARKET — SYSTÈME DE THÈMES
// 5 thèmes prédéfinis + injection dynamique dans :root
// ================================================================

export interface ThemeConfig {
    id: string;
    name: string;
    preview: string; // couleur hex pour l'aperçu
    vars: Record<string, string>;
}

export const THEMES: ThemeConfig[] = [
    {
        id: 'dark-premium',
        name: 'Dark Premium',
        preview: '#f97316',
        vars: {
            '--bg-primary': '#0f0f0f',
            '--bg-secondary': '#1a1a1a',
            '--bg-card': '#1e1e1e',
            '--text-primary': '#ffffff',
            '--text-secondary': '#a1a1aa',
            '--accent': '#f97316',
            '--accent-hover': '#ea580c',
            '--border': '#2a2a2a',
            '--shadow': '0 4px 24px rgba(0,0,0,0.6)',
            '--radius': '16px',
            '--font': "'Inter', sans-serif",
        },
    },
    {
        id: 'ocean-blue',
        name: 'Ocean Blue',
        preview: '#0ea5e9',
        vars: {
            '--bg-primary': '#0c1624',
            '--bg-secondary': '#112030',
            '--bg-card': '#162840',
            '--text-primary': '#f0f8ff',
            '--text-secondary': '#94b8d0',
            '--accent': '#0ea5e9',
            '--accent-hover': '#0284c7',
            '--border': '#1e3a50',
            '--shadow': '0 4px 24px rgba(14,165,233,0.2)',
            '--radius': '14px',
            '--font': "'Inter', sans-serif",
        },
    },
    {
        id: 'forest-green',
        name: 'Forest Green',
        preview: '#16a34a',
        vars: {
            '--bg-primary': '#0a1f14',
            '--bg-secondary': '#102b1c',
            '--bg-card': '#163825',
            '--text-primary': '#f0fff4',
            '--text-secondary': '#86efac',
            '--accent': '#16a34a',
            '--accent-hover': '#15803d',
            '--border': '#1e4730',
            '--shadow': '0 4px 24px rgba(22,163,74,0.2)',
            '--radius': '12px',
            '--font': "'Inter', sans-serif",
        },
    },
    {
        id: 'luxury-gold',
        name: 'Luxury Gold',
        preview: '#d4a017',
        vars: {
            '--bg-primary': '#12100a',
            '--bg-secondary': '#1c1810',
            '--bg-card': '#231f14',
            '--text-primary': '#fef9e7',
            '--text-secondary': '#c9a84c',
            '--accent': '#d4a017',
            '--accent-hover': '#b8860b',
            '--border': '#2e2618',
            '--shadow': '0 4px 24px rgba(212,160,23,0.25)',
            '--radius': '10px',
            '--font': "'Georgia', serif",
        },
    },
    {
        id: 'minimal-white',
        name: 'Minimal White',
        preview: '#6366f1',
        vars: {
            '--bg-primary': '#ffffff',
            '--bg-secondary': '#f8f9fa',
            '--bg-card': '#ffffff',
            '--text-primary': '#111827',
            '--text-secondary': '#6b7280',
            '--accent': '#6366f1',
            '--accent-hover': '#4f46e5',
            '--border': '#e5e7eb',
            '--shadow': '0 2px 12px rgba(0,0,0,0.08)',
            '--radius': '12px',
            '--font': "'Inter', sans-serif",
        },
    },
];

/**
 * Applique un thème en injectant les variables CSS dans :root.
 * @param themeId  ID du thème (ex: 'ocean-blue')
 * @param customColors  Couleurs personnalisées optionnelles { '--accent': '#ff0000', ... }
 */
export function applyTheme(themeId: string, customColors?: Record<string, string>): void {
    const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];
    const root = document.documentElement;

    // Injecter les variables du thème
    for (const [key, value] of Object.entries(theme.vars)) {
        root.style.setProperty(key, value);
    }

    // Écraser avec les couleurs custom si fournies
    if (customColors) {
        for (const [key, value] of Object.entries(customColors)) {
            root.style.setProperty(key, value);
        }
    }

    // Marquer le thème actif pour le CSS conditionnel
    root.setAttribute('data-velmo-theme', theme.id);
}

/** Retourne le thème par son ID, ou le premier thème par défaut. */
export function getTheme(themeId: string): ThemeConfig {
    return THEMES.find(t => t.id === themeId) ?? THEMES[0];
}
