// === TRACKING ===
function track(action) {
  gtag('event', 'click', { event_category: 'CTA', event_label: action });
  fbq('track', 'Lead', { action });
}

// === TRADUCTIONS ===
const t = {
  fr: {
    "hero.title": "Velmo — Tech simple, partout",
    "hero.subtitle": "Application rapide, légère, universelle.<br>Pour tous les smartphones, même anciens.",
    "hero.cta": "Commencer maintenant",
    "proof.1": "Tous les téléphones",
    "proof.2": "Connexion faible",
    "why.title": "Pourquoi Velmo ?",
    "why.text": "Dans beaucoup de régions, la tech est lourde, chère, inaccessible.<br><strong>Velmo change ça.</strong> Une app simple, rapide, qui marche partout.",
    "forces.title": "Les 3 forces",
    "force.1.title": "Universelle", "force.1.text": "Fonctionne sur tous les smartphones, même anciens.",
    "force.2.title": "Légère", "force.2.text": "Utilisable sans réseau ou avec connexion faible.",
    "force.3.title": "Simple", "force.3.text": "Interface claire. Prise en main immédiate.",
    "testimonial.title": "Ils l’utilisent déjà",
    "testimonial.quote": "« Avec Velmo, je gère mon commerce avec un vieux téléphone. Je vois mes ventes en temps réel. »",
    "testimonial.author": "— Bakary, Guinée",
    "cta.title": "Rejoins Velmo",
    "cta.text": "Disponible sur Android. iOS bientôt.",
    "cta.android": "Android",
    "cta.ios": "iOS (bientôt)",
    "footer.about": "À propos", "footer.features": "Fonctionnalités", "footer.contact": "Contact"
  },
  en: { /* même structure, en anglais */ },
  ar: { /* même structure, en arabe */ }
};

// === SWITCH LANG ===
function setLang(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[lang][key]) el.innerHTML = t[lang][key];
  });
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('.lang-switcher button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
}

// Auto-detect
const userLang = navigator.language.split('-')[0];
setLang(['fr','en','ar'].includes(userLang) ? userLang : 'fr');

// Buttons
document.querySelectorAll('.lang-switcher button').forEach(b => {
  b.addEventListener('click', () => setLang(b.dataset.lang));
});