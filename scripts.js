 // Variables globales
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');
    const themeToggle = document.getElementById('theme-toggle');
    const langToggle = document.getElementById('lang-toggle');
    const html = document.documentElement;
    const betaForm = document.getElementById('beta-form');
    const formSuccess = document.getElementById('form-success');

    let isDark = false;
    let isEnglish = false;

    // Détection langue automatique
    window.addEventListener('load', () => {
      const browserLang = navigator.language || navigator.userLanguage;
      isEnglish = browserLang.startsWith('en');
      html.setAttribute('lang', isEnglish ? 'en' : 'fr');
      langToggle.textContent = isEnglish ? '🇬🇧' : '🇫🇷';
      localStorage.setItem('velmo-lang', isEnglish ? 'en' : 'fr');
      updatePhoneContent();
    });

    // Header scroll
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Menu mobile
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !menuToggle.contains(e.target) && nav.classList.contains('active')) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
      }
    });

    // Theme toggle
    themeToggle.addEventListener('click', () => {
      isDark = !isDark;
      html.setAttribute('data-theme', isDark ? 'dark' : 'light');
      themeToggle.textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem('velmo-theme', isDark ? 'dark' : 'light');
    });

    const savedTheme = localStorage.getItem('velmo-theme');
    if (savedTheme === 'dark') {
      isDark = true;
      html.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    }

    // Language toggle
    langToggle.addEventListener('click', () => {
      isEnglish = !isEnglish;
      html.setAttribute('lang', isEnglish ? 'en' : 'fr');
      langToggle.textContent = isEnglish ? '🇬🇧' : '🇫🇷';
      localStorage.setItem('velmo-lang', isEnglish ? 'en' : 'fr');
      updatePhoneContent();
    });

    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

    document.querySelectorAll('section:not(.hero)').forEach(el => observer.observe(el));

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          const headerHeight = 80;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });

    // Form submission
    betaForm.addEventListener('submit', e => {
      e.preventDefault();
      betaForm.style.display = 'none';
      formSuccess.classList.add('show');
      setTimeout(() => {
        betaForm.reset();
        betaForm.style.display = 'block';
        formSuccess.classList.remove('show');
      }, 5000);
    });

    // Update phone content avec 4 vues dynamiques
    function updatePhoneContent() {
      const views = getPhoneViews();
      const phoneContent = document.getElementById('hero-phone-content');
      if (phoneContent) {
        phoneContent.innerHTML = views.dashboard;
      }
    }

    function getPhoneViews() {
      return {
        dashboard: `
          <div class="content-card-phone">
            <div class="card-title">
              <span>📊</span>
              <span>${isEnglish ? "Today's Sales" : "Ventes du jour"}</span>
            </div>
            <div class="card-value">1,250,000 GNF</div>
            <div class="card-subtitle">
              <span>↗</span>
              <span>+15% vs ${isEnglish ? "yesterday" : "hier"}</span>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">${isEnglish ? "Transactions" : "Transactions"}</div>
              <div class="stat-value">45</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">${isEnglish ? "Customers" : "Clients"}</div>
              <div class="stat-value">28</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">${isEnglish ? "Average" : "Moyenne"}</div>
              <div class="stat-value">27k</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">${isEnglish ? "Products" : "Produits"}</div>
              <div class="stat-value">156</div>
            </div>
          </div>

          <div class="success-badge">
            <span>✓</span>
            <span class="success-text">${isEnglish ? "All systems operational" : "Tous les systèmes opérationnels"}</span>
          </div>

          <div class="product-item">
            <div class="product-icon">🍚</div>
            <div class="product-info">
              <div class="product-name">${isEnglish ? "Rice 5kg - Best seller" : "Riz 5kg - Meilleure vente"}</div>
              <div class="product-stock">350,000 GNF</div>
            </div>
            <span class="stock-badge stock-ok">✓ ${isEnglish ? "In stock" : "En stock"}</span>
          </div>

          <div class="product-item">
            <div class="product-icon">🥤</div>
            <div class="product-info">
              <div class="product-name">${isEnglish ? "Soda Pack" : "Pack Soda"}</div>
              <div class="product-stock">200,000 GNF</div>
            </div>
            <span class="stock-badge stock-ok">✓ ${isEnglish ? "Available" : "Disponible"}</span>
          </div>

          <div class="product-item">
            <div class="product-icon">🍞</div>
            <div class="product-info">
              <div class="product-name">${isEnglish ? "Bread" : "Pain"}</div>
              <div class="product-stock">150,000 GNF</div>
            </div>
            <span class="stock-badge stock-ok">✓ OK</span>
          </div>
        `,

        stock: `
          <div class="content-card-phone">
            <div class="card-title">
              <span>📦</span>
              <span>${isEnglish ? "Inventory Management" : "Gestion Stock"}</span>
            </div>
          </div>

          <div class="alert-badge">
            <div class="alert-text">⚠ ${isEnglish ? "3 products low in stock" : "3 produits en rupture"}</div>
          </div>

          <div class="product-item">
            <div class="product-icon">💧</div>
            <div class="product-info">
              <div class="product-name">${isEnglish ? "Water 1.5L" : "Eau 1.5L"}</div>
              <div class="product-stock">${isEnglish ? "Stock: 124 units" : "Stock: 124 unités"}</div>
            </div>
            <span class="stock-badge stock-ok">✓ OK</span>
          </div>

          <div class="product-item">
            <div class="product-icon">🍚</div>
            <div class="product-info">
              <div class="product-name">${isEnglish ? "Rice 5kg" : "Riz 5kg"}</div>
              <div class="product-stock">${isEnglish ? "Stock: 5 units" : "Stock: 5 unités"}</div>
            </div>
            <span class="stock-badge stock-low">⚠ ${isEnglish ? "Low" : "Bas"}</span>
          </div>

          <div class="product-item">
            <div class="product-icon">🛢️</div>
            <div class="product-info">
              <div class="product-name">${isEnglish ? "Oil 2L" : "Huile 2L"}</div>
              <div class="product-stock">${isEnglish ? "Stock: 0 units" : "Stock: 0 unités"}</div>
            </div>
            <span class="stock-badge stock-out">✗ ${isEnglish ? "Out" : "Vide"}</span>
          </div>

          <div class="product-item">
            <div class="product-icon">🍬</div>
            <div class="product-info">
              <div class="product-name">${isEnglish ? "Sugar 1kg" : "Sucre 1kg"}</div>
              <div class="product-stock">${isEnglish ? "Stock: 2 units" : "Stock: 2 unités"}</div>
            </div>
            <span class="stock-badge stock-low">⚠ ${isEnglish ? "Low" : "Bas"}</span>
          </div>

          <div class="product-item">
            <div class="product-icon">🥤</div>
            <div class="product-info">
              <div class="product-name">${isEnglish ? "Soda Pack" : "Pack Soda"}</div>
              <div class="product-stock">${isEnglish ? "Stock: 89 units" : "Stock: 89 unités"}</div>
            </div>
            <span class="stock-badge stock-ok">✓ OK</span>
          </div>

          <div class="product-item">
            <div class="product-icon">🍞</div>
            <div class="product-info">
              <div class="product-name">${isEnglish ? "Bread" : "Pain"}</div>
              <div class="product-stock">${isEnglish ? "Stock: 45 units" : "Stock: 45 unités"}</div>
            </div>
            <span class="stock-badge stock-ok">✓ OK</span>
          </div>
        `,

        analytics: `
          <div class="content-card-phone">
            <div class="card-title">
              <span>📈</span>
              <span>${isEnglish ? "Weekly Analytics" : "Analytics Hebdo"}</span>
            </div>
          </div>

          <div class="chart-container">
            <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
              ${isEnglish ? "Sales last 7 days" : "Ventes 7 derniers jours"}
            </div>
            <div class="chart-bars">
              <div class="chart-bar" style="height: 45%; animation-delay: 0s;"></div>
              <div class="chart-bar" style="height: 65%; animation-delay: 0.1s;"></div>
              <div class="chart-bar" style="height: 75%; animation-delay: 0.2s;"></div>
              <div class="chart-bar" style="height: 55%; animation-delay: 0.3s;"></div>
              <div class="chart-bar" style="height: 85%; animation-delay: 0.4s;"></div>
              <div class="chart-bar" style="height: 90%; animation-delay: 0.5s;"></div>
              <div class="chart-bar" style="height: 100%; animation-delay: 0.6s;"></div>
            </div>
            <div class="chart-labels">
              <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">${isEnglish ? "Growth" : "Croissance"}</div>
              <div class="stat-value" style="color: var(--success);">+24%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">${isEnglish ? "Best day" : "Meilleur jour"}</div>
              <div class="stat-value">${isEnglish ? "Sun" : "Dim"}</div>
            </div>
          </div>

          <div class="content-card-phone">
            <div style="font-size: 13px; font-weight: 700; color: var(--primary); margin-bottom: 12px;">
              📊 ${isEnglish ? "Top Products" : "Top Produits"}
            </div>
            <div class="product-item" style="margin-bottom: 8px;">
              <div class="product-icon">🍚</div>
              <div class="product-info">
                <div class="product-name">${isEnglish ? "Rice 5kg" : "Riz 5kg"}</div>
                <div class="product-stock">147 ${isEnglish ? "sales" : "ventes"}</div>
              </div>
            </div>
            <div class="product-item" style="margin-bottom: 8px;">
              <div class="product-icon">💧</div>
              <div class="product-info">
                <div class="product-name">${isEnglish ? "Water 1.5L" : "Eau 1.5L"}</div>
                <div class="product-stock">98 ${isEnglish ? "sales" : "ventes"}</div>
              </div>
            </div>
            <div class="product-item" style="margin-bottom: 0;">
              <div class="product-icon">🥤</div>
              <div class="product-info">
                <div class="product-name">${isEnglish ? "Soda Pack" : "Pack Soda"}</div>
                <div class="product-stock">76 ${isEnglish ? "sales" : "ventes"}</div>
              </div>
            </div>
          </div>
        `,

        offline: `
          <div class="content-card-phone" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 64px; margin-bottom: 20px;">📴</div>
            <div style="font-size: 18px; font-weight: 700; color: var(--primary); margin-bottom: 12px;">
              ${isEnglish ? "Offline Mode" : "Mode Hors-ligne"}
            </div>
            <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
              ${isEnglish 
                ? "Keep working without internet. Everything syncs automatically when you're back online." 
                : "Continuez à travailler sans internet. Tout se synchronise automatiquement quand vous êtes en ligne."}
            </div>
          </div>

          <div class="success-badge">
            <span>✓</span>
            <span class="success-text">${isEnglish ? "Local data saved" : "Données locales sauvegardées"}</span>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">${isEnglish ? "Sync Status" : "Statut Sync"}</div>
              <div class="stat-value">✓</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">${isEnglish ? "Last sync" : "Dernière sync"}</div>
              <div class="stat-value" style="font-size: 14px;">2m</div>
            </div>
          </div>

          <div class="content-card-phone">
            <div style="font-size: 13px; font-weight: 700; color: var(--primary); margin-bottom: 12px;">
              💡 ${isEnglish ? "Features Available Offline" : "Fonctions Hors-ligne"}
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.8;">
              • ${isEnglish ? "Record sales" : "Enregistrer ventes"}<br>
              • ${isEnglish ? "Check inventory" : "Vérifier stock"}<br>
              • ${isEnglish ? "View history" : "Voir historique"}<br>
              • ${isEnglish ? "Manage debts" : "Gérer dettes"}<br>
              • ${isEnglish ? "Add products" : "Ajouter produits"}
            </div>
          </div>

          <div class="product-item">
            <div class="product-icon">🔄</div>
            <div class="product-info">
              <div class="product-name">${isEnglish ? "Auto-sync enabled" : "Sync auto activée"}</div>
              <div class="product-stock">${isEnglish ? "Waiting for connection" : "En attente connexion"}</div>
            </div>
            <span class="stock-badge stock-ok">✓ ON</span>
          </div>
        `
      };
    }

    // Navigation entre les vues
    const navDots = document.querySelectorAll('.nav-dot');
    navDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const view = dot.getAttribute('data-view');
        const phoneContent = document.getElementById('hero-phone-content');
        const views = getPhoneViews();
        
        // Remove active class
        navDots.forEach(d => {
          d.classList.remove('active');
          d.querySelector('svg').style.fill = '#64748b';
        });
        
        // Add active class
        dot.classList.add('active');
        dot.querySelector('svg').style.fill = 'white';
        
        // Transition animation
        phoneContent.style.transition = 'all 0.3s ease';
        phoneContent.style.opacity = '0';
        phoneContent.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
          phoneContent.innerHTML = views[view];
          phoneContent.style.opacity = '1';
          phoneContent.style.transform = 'translateY(0)';
        }, 300);
      });
    });

    // Auto-rotation des vues (optionnel)
    let currentViewIndex = 0;
    const viewKeys = ['dashboard', 'stock', 'analytics', 'offline'];
    setInterval(() => {
      currentViewIndex = (currentViewIndex + 1) % viewKeys.length;
      const targetDot = document.querySelector(`[data-view="${viewKeys[currentViewIndex]}"]`);
      if (targetDot) {
        targetDot.click();
      }
    }, 6000);

    // Parallax effect
    window.addEventListener('scroll', () => {
      const hero = document.querySelector('.hero');
      if (hero && window.pageYOffset < 800) {
        hero.style.transform = `translateY(${window.pageYOffset * 0.2}px)`;
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        themeToggle.click();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        langToggle.click();
      }
    });

    // Logo animation
    document.querySelector('.logo-wrapper').addEventListener('mouseenter', function() {
      const svg = this.querySelector('.logo-svg');
      svg.style.animation = 'none';
      setTimeout(() => {
        svg.style.animation = 'pulse 1s ease-in-out';
      }, 10);
    });

    // Interactive phone content animation
    const phoneContent = document.getElementById('hero-phone-content');
    if (phoneContent) {
      setInterval(() => {
        const cards = phoneContent.querySelectorAll('.content-card-phone, .stat-item');
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.style.animation = 'none';
            setTimeout(() => {
              card.style.animation = 'fadeInUp 0.5s ease-out';
            }, 10);
          }, index * 100);
        });
      }, 5000);
    }

    // Console logs
    console.log('%c⚡ Velmo - Designed like a real startup', 'font-size: 20px; font-weight: bold; color: #667eea;');
    console.log('%c✨ Modern design with perfect spacing and rhythm', 'font-size: 12px; color: #475569;');
    console.log('%c🎨 Built with attention to every detail', 'font-size: 12px; color: #475569;');
    console.log('%c🚀 Ready for production', 'font-size: 12px; color: #10b981;');