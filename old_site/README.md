# vento_website
# 🚀 Vento - Site Web Principal

> **Gestion de ventes simple et puissante pour commerçants africains**

Site web moderne, responsive et performant pour présenter Vento, la solution de gestion de ventes adaptée aux réalités africaines.

---

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Structure du projet](#structure-du-projet)
- [Technologies utilisées](#technologies-utilisées)
- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Configuration](#configuration)
- [Déploiement](#déploiement)
- [Personnalisation](#personnalisation)
- [Optimisations](#optimisations)
- [Support navigateurs](#support-navigateurs)
- [Contribuer](#contribuer)

---

## 🎯 Aperçu

Vento est une solution de gestion de ventes conçue spécifiquement pour les commerçants africains. Ce site vitrine présente :

- ✅ **Mode Offline** : Fonctionne sans internet
- ✅ **Interface intuitive** : Aucune formation nécessaire
- ✅ **Multi-plateforme** : Application mobile + dashboard desktop
- ✅ **Gestion intelligente** : Stock, dettes, notifications
- ✅ **Analytics en temps réel** : Rapports et statistiques

---

## 📁 Structure du projet

```
vento-website/
│
├── index.html              # Page principale
│
├── assets/                 # Ressources statiques
│   ├── images/            
│   │   ├── logo.svg       # Logo Vento
│   │   ├── favicon.svg    # Favicon
│   │   ├── hero-mockup.svg # Mockup hero section
│   │   └── ...            # Autres images
│   │
│   └── fonts/             # Polices personnalisées (optionnel)
│
├── styles/                # Feuilles de style
│   ├── main.css          # Styles principaux
│   ├── responsive.css    # Media queries
│   └── animations.css    # Animations et transitions
│
├── scripts/              # Scripts JavaScript
│   ├── main.js          # Script principal
│   └── animations.js    # Animations avancées (optionnel)
│
├── README.md            # Documentation (ce fichier)
├── .gitignore          # Fichiers à ignorer par Git
└── LICENSE             # Licence du projet
```

---

## 🛠 Technologies utilisées

### Frontend
- **HTML5** : Structure sémantique
- **CSS3** : Styles modernes avec variables CSS
- **JavaScript** (Vanilla) : Interactions sans dépendances

### Fonctionnalités CSS
- ✅ CSS Grid & Flexbox
- ✅ Variables CSS (Custom Properties)
- ✅ Transitions et animations
- ✅ Media queries (responsive)
- ✅ Dark mode

### APIs JavaScript
- ✅ Intersection Observer (animations scroll)
- ✅ LocalStorage (préférences utilisateur)
- ✅ Fetch API (prêt pour intégrations)

---

## ✨ Fonctionnalités

### 🎨 Design & UX
- [x] Design moderne et épuré
- [x] Mode sombre/clair
- [x] Animations fluides
- [x] Responsive (mobile-first)
- [x] Accessibilité (WCAG 2.1)

### 🌍 Internationalisation
- [x] Français / Anglais
- [x] Changement de langue en temps réel
- [x] Sauvegarde des préférences

### ⚡ Performance
- [x] Lazy loading images
- [x] Optimisation CSS/JS
- [x] Minification (production)
- [x] Chargement rapide (<3s)

### 📱 Fonctionnalités
- [x] Menu mobile hamburger
- [x] Smooth scroll
- [x] Compteurs animés
- [x] Bouton WhatsApp flottant
- [x] Formulaire de contact
- [x] Sections interactives

---

## 🚀 Installation

### Prérequis
- Un navigateur moderne (Chrome, Firefox, Safari, Edge)
- Un serveur web local (optionnel pour développement)

### Méthode 1 : Ouverture directe
```bash
# Cloner le projet
git clone https://github.com/votre-username/vento-website.git
cd vento-website

# Ouvrir index.html dans votre navigateur
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

### Méthode 2 : Serveur local (recommandé)

**Avec Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Avec Node.js (http-server):**
```bash
npx http-server -p 8000
```

**Avec PHP:**
```bash
php -S localhost:8000
```

Puis ouvrir : `http://localhost:8000`

---

## ⚙️ Configuration

### 1. Personnaliser les couleurs

Modifier les variables CSS dans `styles/main.css` :

```css
:root {
    --primary-color: #667eea;      /* Couleur principale */
    --secondary-color: #764ba2;    /* Couleur secondaire */
    --success-color: #48bb78;      /* Succès */
    --error-color: #f56565;        /* Erreur */
}
```

### 2. Configurer WhatsApp

Dans `scripts/main.js`, modifier :

```javascript
const CONFIG = {
    whatsappNumber: '1234567890',  // Votre numéro WhatsApp
    // ...
};
```

### 3. Personnaliser les textes

Éditer directement dans `index.html` les sections avec classes `.lang-fr` et `.lang-en`

### 4. Modifier les images

Remplacer les images dans `assets/images/` :
- `logo.svg` : Logo de Vento
- `favicon.svg` : Icône du site
- `hero-mockup.svg` : Capture d'écran de l'app

---

## 🌐 Déploiement

### Netlify (Recommandé)

1. Connecter votre repo GitHub
2. Configuration :
   ```
   Build command: (vide)
   Publish directory: /
   ```
3. Déployer !

### Vercel

```bash
npm i -g vercel
vercel
```

### GitHub Pages

1. Aller dans Settings > Pages
2. Source : `main` branch
3. Le site sera sur : `https://username.github.io/vento-website`

### Hébergement classique (FTP)

Uploader tous les fichiers via FTP sur votre serveur web.

---

## 🎨 Personnalisation

### Ajouter une nouvelle section

```html
<section class="ma-section" id="ma-section">
    <div class="container">
        <h2 class="section-title">
            <span class="lang-fr">Mon titre FR</span>
            <span class="lang-en">My title EN</span>
        </h2>
        <p class="section-subtitle">
            <span class="lang-fr">Sous-titre FR</span>
            <span class="lang-en">Subtitle EN</span>
        </p>
        
        <!-- Votre contenu -->
    </div>
</section>
```

### Ajouter une animation

```css
/* Dans styles/animations.css */
@keyframes monAnimation {
    from { transform: scale(0); }
    to { transform: scale(1); }
}

.mon-element {
    animation: monAnimation 0.5s ease-out;
}
```

### Ajouter une fonctionnalité JS

```javascript
// Dans scripts/main.js
function maFonction() {
    console.log('Ma fonction personnalisée');
}

// L'appeler dans DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // ... autres initialisations
    maFonction();
});
```

---

## ⚡ Optimisations

### Performance

**Images:**
```html
<!-- Lazy loading natif -->
<img src="image.jpg" loading="lazy" alt="Description">

<!-- Format WebP avec fallback -->
<picture>
    <source srcset="image.webp" type="image/webp">
    <img src="image.jpg" alt="Description">
</picture>
```

**CSS:**
```bash
# Minifier avec cssnano
npx cssnano styles/main.css styles/main.min.css
```

**JavaScript:**
```bash
# Minifier avec terser
npx terser scripts/main.js -o scripts/main.min.js
```

### SEO

**Meta tags essentiels:**
```html
<meta name="description" content="Votre description">
<meta name="keywords" content="mots, clés, pertinents">
<link rel="canonical" href="https://vento.com">

<!-- Open Graph -->
<meta property="og:title" content="Vento">
<meta property="og:description" content="Description">
<meta property="og:image" content="image-preview.jpg">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
```

**Sitemap.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://vento.com/</loc>
        <lastmod>2025-01-15</lastmod>
        <priority>1.0</priority>
    </url>
</urlset>
```

---

## 🌐 Support navigateurs

| Navigateur | Version minimale |
|-----------|------------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Opera | 76+ |

### Fonctionnalités modernes utilisées
- CSS Grid
- CSS Variables
- Intersection Observer
- LocalStorage
- Fetch API

---

## 📊 Métriques de performance

### Objectifs (Lighthouse)
- ✅ Performance : > 90
- ✅ Accessibilité : > 95
- ✅ Best Practices : > 95
- ✅ SEO : > 95

### Temps de chargement
- First Contentful Paint : < 1.5s
- Time to Interactive : < 3s
- Total Page Size : < 500KB (sans images)

---

## 🐛 Débogage

### Activer les logs
```javascript
// Dans scripts/main.js
const DEBUG = true;

if (DEBUG) {
    console.log('État:', STATE);
    console.log('Config:', CONFIG);
}
```

### Tester le responsive
```javascript
// Dans la console du navigateur
window.Vento.STATE  // Voir l'état actuel
window.Vento.setTheme('dark')  // Tester le thème
window.Vento.setLanguage('en')  // Tester la langue
```

---

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Guidelines
- Code propre et commenté
- Respecter la structure existante
- Tester sur plusieurs navigateurs
- Documenter les changements majeurs

---

## 📝 Licence

MIT License - voir le fichier [LICENSE](LICENSE)

---

## 📞 Contact

**Vento** - [@vento](https://twitter.com/vento)

Site web : [https://vento.com](https://vento.com)

Email : contact@vento.com

WhatsApp : +224 XXX XXX XXX

---

## 🙏 Remerciements

- Design inspiré par les tendances modernes du web
- Icônes émoji pour une meilleure accessibilité
- Communauté open source

---

## 📚 Ressources

- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)
- [Web.dev](https://web.dev/)
- [Can I Use](https://caniuse.com/)

---

**Fait avec ❤️ pour les commerçants africains**