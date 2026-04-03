const fs = require('fs');
const path = require('path');

/**
 * 🚀 VELMO MARKET - Script d'Automatisation de Versioning
 * Ce script génère une version unique basée sur l'horodatage actuel.
 * Il l'injecte partout (HTML, SW) pour forcer le Refresh chez les clients.
 */

// Génère une version (AAAAMMJJHHMM)
const newVersion = new Date().toISOString().replace(/\D/g, '').slice(0, 12);
console.log('\x1b[36m%s\x1b[0m', `🚀 Génération de la version : ${newVersion}`);

const files = [
  'index.html',
  'shop.html',
  'sw.js'
];

files.forEach(fileName => {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Fichier non trouvé : ${fileName}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Mise à jour des fichiers HTML
  if (fileName.endsWith('.html')) {
    // Remplace la constante du Nuclear Reset : const VERSION = '...'
    content = content.replace(/const VERSION = ['"][^'"]*['"]/g, `const VERSION = '${newVersion}'`);
    // Remplace les versions dans les scripts : ?v=...
    content = content.replace(/\?v=[^"']*/g, `?v=${newVersion}`);
  }

  // 2. Mise à jour du Service Worker
  if (fileName === 'sw.js') {
    // Remplace le CACHE_NAME : const CACHE_NAME = 'velmo-market-v...'
    content = content.replace(/const CACHE_NAME = ['"][^'"]*['"]/g, `const CACHE_NAME = 'velmo-market-v${newVersion}'`);
    // Remplace la ligne de commentaire Updated: ... (si présente)
    content = content.replace(/\/\/ Updated: [^\n]*/g, `// Updated: ${new Date().toLocaleString()}`);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('\x1b[32m%s\x1b[0m', `✅ ${fileName} mis à jour.`);
  } else {
    console.log('\x1b[33m%s\x1b[0m', `ℹ️  ${fileName} n'a pas changé.`);
  }
});

console.log('\x1b[35m%s\x1b[0m', '✨ Tout est prêt. Le prochain chargement du site forcera la mise à jour !');
