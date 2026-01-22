// === DÉTECTION MOBILE & INITIALISATION ===
        // Vérifie si l'utilisateur est sur mobile via userAgent.
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            document.body.classList.add('mobile-detected');
        }
        // === THÈME (LIGHT / DARK) ===
        // Sélectionne le bouton toggle et l'élément HTML.
        const themeToggle = document.getElementById('theme-toggle');
        const html = document.documentElement;
       
        // Fonction pour définir le thème et le sauvegarder en localStorage.
        function setTheme(theme) {
            html.setAttribute('data-theme', theme);
            localStorage.setItem('velmo-theme', theme);
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
       
        // Charge le thème sauvegardé ou détecte la préférence système.
        const savedTheme = localStorage.getItem('velmo-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setTheme(savedTheme);
       
        // Événement click pour switcher le thème.
        themeToggle.addEventListener('click', () => {
            const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
        // === LANGUE (FR / EN) ===
        // Sélectionne le bouton et initialise la langue.
        const langToggle = document.getElementById('lang-toggle');
        let currentLang = localStorage.getItem('velmo-lang') || 'fr';
       
        // Fonction pour définir la langue et la sauvegarder.
        function setLang(lang) {
            html.setAttribute('lang', lang);
            localStorage.setItem('velmo-lang', lang);
            langToggle.textContent = lang === 'fr' ? '🇬🇧' : '🇫🇷';
            currentLang = lang;
        }
       
        setLang(currentLang);
       
        // Événement click pour switcher la langue.
        langToggle.addEventListener('click', () => {
            const newLang = currentLang === 'fr' ? 'en' : 'fr';
            setLang(newLang);
        });
        // === MENU OFF-CANVAS ===
        // Sélectionne les éléments pour le menu.
        const menuToggle = document.getElementById('menu-toggle');
        const pageContainer = document.getElementById('page-container');
        const body = document.body;
       
        // Toggle le menu au click.
        menuToggle.addEventListener('click', () => {
            body.classList.toggle('menu-open');
            menuToggle.classList.toggle('active');
        });
       
        // Ferme le menu si click dehors.
        pageContainer.addEventListener('click', (e) => {
            if (body.classList.contains('menu-open') && !menuToggle.contains(e.target)) {
                body.classList.remove('menu-open');
                menuToggle.classList.remove('active');
            }
        });
        // === SCROLL HEADER ===
        // Ajoute classe scrolled quand on descend.
        const header = document.getElementById('header');
        let lastScroll = 0;
       
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
           
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
           
            lastScroll = currentScroll;
        });
        // === OBSERVER POUR ANIMATIONS AU SCROLL ===
        // Observe les sections pour ajouter .visible au viewport.
        const sections = document.querySelectorAll('section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
       
        sections.forEach(section => observer.observe(section));
        // === MOCKUP TÉLÉPHONE - CONTENU DYNAMIQUE ===
        // Contenu du téléphone change avec les dots.
        const phoneContent = document.getElementById('hero-phone-content');
        const navDots = document.querySelectorAll('.nav-dot');
       
        const views = {
            dashboard: `
                <div class="content-card-phone">
                    <div class="card-title">💰 <span class="lang-fr">Ventes du jour</span><span class="lang-en">Today's sales</span></div>
                    <div class="card-value">1 250 000 GNF</div>
                    <div class="card-subtitle">↑ 12% <span class="lang-fr">vs hier</span><span class="lang-en">vs yesterday</span></div>
                    <p class="lang-fr">Détails des ventes : 20 transactions, produit le plus vendu : Riz.</p>
                    <p class="lang-en">Sales details: 20 transactions, best-selling product: Rice.</p>
                </div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label lang-fr">Clients</div>
                        <div class="stat-label lang-en">Customers</div>
                        <div class="stat-value">48</div>
                        <p class="lang-fr">Dont 15 nouveaux</p>
                        <p class="lang-en">Including 15 new</p>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label lang-fr">Produits</div>
                        <div class="stat-label lang-en">Products</div>
                        <div class="stat-value">127</div>
                        <p class="lang-fr">En stock total</p>
                        <p class="lang-en">Total in stock</p>
                    </div>
                </div>
            `,
            stock: `
                <div class="content-card-phone">
                    <div class="card-title">📦 <span class="lang-fr">Stock critique</span><span class="lang-en">Critical stock</span></div>
                    <p class="lang-fr">Liste complète des produits bas en stock.</p>
                    <p class="lang-en">Full list of low stock products.</p>
                </div>
                <div class="product-item">
                    <div class="product-icon">🥚</div>
                    <div class="product-info">
                        <div class="product-name">Œufs (carton)</div>
                        <div class="product-stock">3 unités restantes</div>
                        <p class="lang-fr">Prix : 50 000 GNF</p>
                        <p class="lang-en">Price: 50 000 GNF</p>
                    </div>
                    <div class="stock-badge stock-low">LOW</div>
                </div>
                <div class="product-item">
                    <div class="product-icon">🍚</div>
                    <div class="product-info">
                        <div class="product-name">Riz (sac 25kg)</div>
                        <div class="product-stock">7 unités</div>
                        <p class="lang-fr">Prix : 200 000 GNF</p>
                        <p class="lang-en">Price: 200 000 GNF</p>
                    </div>
                    <div class="stock-badge stock-low">LOW</div>
                </div>
                <div class="product-item">
                    <div class="product-icon">🛢️</div>
                    <div class="product-info">
                        <div class="product-name">Huile (bidon 5L)</div>
                        <div class="product-stock">2 unités</div>
                        <p class="lang-fr">Prix : 100 000 GNF</p>
                        <p class="lang-en">Price: 100 000 GNF</p>
                    </div>
                    <div class="stock-badge stock-out">OUT</div>
                </div>
                <div class="alert-badge">
                    <div class="alert-text lang-fr">3 produits en rupture imminente</div>
                    <div class="alert-text lang-en">3 products running out</div>
                </div>
            `,
            analytics: `
                <div class="content-card-phone">
                    <div class="card-title">📊 <span class="lang-fr">Performance semaine</span><span class="lang-en">Weekly performance</span></div>
                    <p class="lang-fr">Analyse détaillée des ventes.</p>
                    <p class="lang-en">Detailed sales analysis.</p>
                </div>
                <div class="chart-container">
                    <div class="chart-bars">
                        <div class="chart-bar" style="height: 60%;"></div>
                        <div class="chart-bar" style="height: 80%;"></div>
                        <div class="chart-bar" style="height: 45%;"></div>
                        <div class="chart-bar" style="height: 90%;"></div>
                        <div class="chart-bar" style="height: 70%;"></div>
                        <div class="chart-bar" style="height: 85%;"></div>
                        <div class="chart-bar" style="height: 95%;"></div>
                    </div>
                    <div class="chart-labels">
                        <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
                    </div>
                </div>
                <div class="success-badge">
                    <span>✅</span>
                    <div class="success-text lang-fr">Meilleure journée : Vendredi avec 300 000 GNF</div>
                    <div class="success-text lang-en">Best day: Friday with 300 000 GNF</div>
                </div>
                <div class="content-card-phone">
                    <div class="card-title">📈 <span class="lang-fr">Tendances</span><span class="lang-en">Trends</span></div>
                    <p class="lang-fr">Augmentation de 15% des ventes ce mois-ci.</p>
                    <p class="lang-en">15% sales increase this month.</p>
                </div>
            `,
            offline: `
                <div class="content-card-phone">
                    <div class="card-title">📴 <span class="lang-fr">Mode hors-ligne</span><span class="lang-en">Offline mode</span></div>
                    <div class="card-value">ACTIF</div>
                    <div class="card-subtitle lang-fr">12 ventes enregistrées, 5 mises à jour stock</div>
                    <div class="card-subtitle lang-en">12 sales recorded, 5 stock updates</div>
                    <p class="lang-fr">Détails : Dernière synchro il y a 2 heures.</p>
                    <p class="lang-en">Details: Last sync 2 hours ago.</p>
                </div>
                <div class="alert-badge" style="background: rgba(16, 185, 129, 0.1); border-left-color: var(--success);">
                    <div class="alert-text" style="color: var(--success);">
                        <span class="lang-fr">Synchronisation automatique dès connexion. Données sécurisées localement.</span>
                        <span class="lang-en">Auto-sync when online. Data secured locally.</span>
                    </div>
                </div>
                <div class="content-card-phone">
                    <div class="card-title">🔄 <span class="lang-fr">Actions en attente</span><span class="lang-en">Pending actions</span></div>
                    <p class="lang-fr">3 ventes à synchroniser, 2 alertes stock.</p>
                    <p class="lang-en">3 sales to sync, 2 stock alerts.</p>
                </div>
            `
        };
       
        // Fonction pour afficher une vue avec transition fluide.
        function showView(view) {
            phoneContent.classList.add('fade');
            setTimeout(() => {
                phoneContent.innerHTML = views[view] || views.dashboard;
                phoneContent.classList.remove('fade');
            }, 500);  // Délai pour fade out/in
            navDots.forEach(dot => dot.classList.remove('active'));
            document.querySelector(`[data-view="${view}"]`).classList.add('active');
        }
       
        // Événements sur les dots.
        navDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const view = dot.getAttribute('data-view');
                showView(view);
            });
        });
       
        // Initialiser avec dashboard.
        showView('dashboard');
       
        // Rotation automatique des vues toutes les 4 secondes.
        let currentViewIndex = 0;
        const viewKeys = Object.keys(views);
        setInterval(() => {
            currentViewIndex = (currentViewIndex + 1) % viewKeys.length;
            showView(viewKeys[currentViewIndex]);
        }, 4000);
        // === FORMULAIRE BETA ===
        // Gère la soumission du formulaire (simulation pour l'instant).
        const betaForm = document.getElementById('beta-form');
        const formSuccess = document.getElementById('form-success');
       
        betaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
           
            const formData = new FormData(betaForm);
            const data = Object.fromEntries(formData);
           
            // Simulation d'envoi (remplacez par votre API réelle).
            try {
                // await fetch('https://api.velmo.app/beta', { method: 'POST', body: JSON.stringify(data) });
                console.log('Beta submission:', data);
               
                betaForm.style.display = 'none';
                formSuccess.classList.add('show');
               
                setTimeout(() => {
                    betaForm.style.display = 'block';
                    formSuccess.classList.remove('show');
                    betaForm.reset();
                }, 5000);
            } catch (err) {
                alert('Erreur. Veuillez réessayer.');
            }
        });
        // === SMOOTH SCROLL POUR ANCRES ===
        // Fait défiler doucement vers les sections.
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
               
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = header.offsetHeight;
                    const top = target.offsetTop - offset;
                   
                    window.scrollTo({
                        top,
                        behavior: 'smooth'
                    });
                   
                    // Ferme le menu mobile si ouvert.
                    if (body.classList.contains('menu-open')) {
                        body.classList.remove('menu-open');
                        menuToggle.classList.remove('active');
                    }
                }
            });
        });
        // === ACCESSIBILITÉ : FOCUS VISIBLE ===
        // Affiche les focus pour navigation clavier.
        document.body.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('show-focus');
            }
        });
       
        document.body.addEventListener('mousedown', () => {
            document.body.classList.remove('show-focus');
        });