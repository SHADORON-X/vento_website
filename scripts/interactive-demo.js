/**
 * VENTO - Interactive Demo
 * SVG interactif pour le mockup hero et la démo
 * ==============================================
 */

class InteractiveMockup {
    constructor(container) {
        this.container = container;
        this.currentScreen = 'sales';
        this.animating = false;
        this.init();
    }
    
    init() {
        this.createMockup();
        this.attachEventListeners();
        this.startAutoRotation();
    }
    
    createMockup() {
        const svg = `
            <svg class="interactive-mockup-svg" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                    </linearGradient>
                    
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    
                    <filter id="shadow">
                        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.2"/>
                    </filter>
                </defs>
                
                <!-- Phone Container -->
                <g id="phone" transform="translate(50, 20)" filter="url(#shadow)">
                    <rect class="phone-body" x="0" y="0" width="200" height="360" rx="20" fill="#1a1a1a"/>
                    <rect class="phone-screen" x="8" y="8" width="184" height="344" rx="15" fill="#f7fafc"/>
                    
                    <!-- Notch -->
                    <rect x="70" y="8" width="60" height="15" rx="8" fill="#1a1a1a"/>
                    
                    <!-- Status Bar -->
                    <g id="status-bar">
                        <text x="20" y="30" font-family="Arial" font-size="10" fill="#666">9:41</text>
                        <circle cx="165" cy="26" r="2" fill="#48bb78"/>
                        <text x="172" y="30" font-family="Arial" font-size="10" fill="#666">100%</text>
                    </g>
                    
                    <!-- Dynamic Content Screen -->
                    <g id="screen-content" class="screen-content"></g>
                    
                    <!-- Bottom Navigation -->
                    <g id="bottom-nav" transform="translate(20, 310)">
                        <rect class="nav-bg" width="160" height="30" rx="15" fill="#ffffff" filter="url(#shadow)"/>
                        <circle class="nav-item active" cx="40" cy="15" r="8" fill="url(#grad1)" data-screen="sales" style="cursor:pointer">
                            <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <circle class="nav-item" cx="80" cy="15" r="6" fill="#e2e8f0" data-screen="stock" style="cursor:pointer"/>
                        <circle class="nav-item" cx="120" cy="15" r="6" fill="#e2e8f0" data-screen="analytics" style="cursor:pointer"/>
                    </g>
                </g>
                
                <!-- Desktop Screen -->
                <g id="desktop" transform="translate(280, 50)" filter="url(#shadow)">
                    <rect class="desktop-frame" x="0" y="0" width="300" height="220" rx="8" fill="#1a1a1a"/>
                    <rect class="desktop-screen" x="5" y="5" width="290" height="195" rx="5" fill="#f7fafc"/>
                    
                    <!-- Desktop Content -->
                    <g id="desktop-content" class="desktop-content"></g>
                    
                    <!-- Stand -->
                    <rect x="135" y="220" width="30" height="15" rx="3" fill="#1a1a1a"/>
                    <rect x="110" y="235" width="80" height="5" rx="2" fill="#1a1a1a"/>
                </g>
                
                <!-- Connecting Line -->
                <path id="connect-line" d="M 250 200 Q 300 150 280 120" 
                      stroke="url(#grad1)" 
                      stroke-width="2" 
                      fill="none" 
                      stroke-dasharray="5,5" 
                      opacity="0.3">
                    <animate attributeName="stroke-dashoffset" from="0" to="20" dur="1s" repeatCount="indefinite"/>
                </path>
                
                <!-- Floating Elements -->
                <g id="floating-icons" opacity="0.6">
                    <circle cx="240" cy="80" r="4" fill="#667eea">
                        <animate attributeName="cy" values="80;70;80" dur="3s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="270" cy="250" r="5" fill="#764ba2">
                        <animate attributeName="cy" values="250;240;250" dur="4s" repeatCount="indefinite"/>
                    </circle>
                </g>
            </svg>
        `;
        
        this.container.innerHTML = svg;
        this.screenContent = this.container.querySelector('#screen-content');
        this.desktopContent = this.container.querySelector('#desktop-content');
        
        // Charger l'écran initial
        this.loadScreen('sales');
    }
    
    loadScreen(screenName) {
        if (this.animating) return;
        this.animating = true;
        
        // Mise à jour navigation
        const navItems = this.container.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            item.setAttribute('r', '6');
            item.setAttribute('fill', '#e2e8f0');
        });
        
        const activeNav = this.container.querySelector(`[data-screen="${screenName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
            activeNav.setAttribute('r', '8');
            activeNav.setAttribute('fill', 'url(#grad1)');
        }
        
        // Animation de transition
        this.screenContent.style.opacity = '0';
        this.desktopContent.style.opacity = '0';
        
        setTimeout(() => {
            this.screenContent.innerHTML = this.getScreenContent(screenName);
            this.desktopContent.innerHTML = this.getDesktopContent(screenName);
            
            this.screenContent.style.opacity = '1';
            this.desktopContent.style.opacity = '1';
            this.animating = false;
        }, 300);
        
        this.currentScreen = screenName;
    }
    
    getScreenContent(screen) {
        const screens = {
            sales: `
                <g transform="translate(20, 50)">
                    <!-- Header -->
                    <rect width="160" height="40" rx="8" fill="url(#grad1)"/>
                    <text x="15" y="25" font-family="Arial" font-size="14" font-weight="bold" fill="#ffffff">Ventes du jour</text>
                    
                    <!-- Total Card -->
                    <rect y="55" width="160" height="70" rx="10" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="15" y="75" font-family="Arial" font-size="11" fill="#718096">Chiffre d'affaires</text>
                    <text x="15" y="100" font-family="Arial" font-size="24" font-weight="bold" fill="url(#grad1)">---</text>
                    <text x="15" y="115" font-family="Arial" font-size="10" fill="#48bb78">Données masquées</text>
                    
                    <!-- Stats Grid -->
                    <rect y="140" width="75" height="60" rx="8" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="12" y="158" font-family="Arial" font-size="9" fill="#718096">Ventes</text>
                    <text x="12" y="178" font-family="Arial" font-size="18" font-weight="bold" fill="#1a1a1a">--</text>
                    <text x="12" y="190" font-family="Arial" font-size="8" fill="#667eea">Demo</text>
                    
                    <rect x="85" y="140" width="75" height="60" rx="8" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="97" y="158" font-family="Arial" font-size="9" fill="#718096">Clients</text>
                    <text x="97" y="178" font-family="Arial" font-size="18" font-weight="bold" fill="#1a1a1a">--</text>
                    <text x="97" y="190" font-family="Arial" font-size="8" fill="#48bb78">Demo</text>
                    
                    <!-- Recent Transaction -->
                    <rect y="215" width="160" height="40" rx="8" fill="#ffffff" filter="url(#shadow)"/>
                    <circle cx="20" cy="235" r="10" fill="#667eea" opacity="0.2"/>
                    <text x="20" y="239" font-family="Arial" font-size="10" text-anchor="middle" fill="#667eea">🛒</text>
                    <text x="38" y="232" font-family="Arial" font-size="10" fill="#1a1a1a">Produit exemple</text>
                    <text x="38" y="243" font-family="Arial" font-size="8" fill="#718096">Démo interactive</text>
                    <text x="145" y="238" font-family="Arial" font-size="11" font-weight="bold" fill="#48bb78" text-anchor="end">***</text>
                </g>
            `,
            
            stock: `
                <g transform="translate(20, 50)">
                    <rect width="160" height="40" rx="8" fill="url(#grad1)"/>
                    <text x="15" y="25" font-family="Arial" font-size="14" font-weight="bold" fill="#ffffff">Gestion Stock</text>
                    
                    <!-- Alert Banner -->
                    <rect y="55" width="160" height="35" rx="8" fill="#fed7d7"/>
                    <text x="15" y="75" font-family="Arial" font-size="10" fill="#c53030">⚠ 8 produits en rupture</text>
                    <text x="15" y="88" font-family="Arial" font-size="8" fill="#c53030">Action requise</text>
                    
                    <!-- Product List -->
                    <g transform="translate(0, 105)">
                        <rect width="160" height="30" rx="6" fill="#ffffff" filter="url(#shadow)"/>
                        <text x="12" y="15" font-family="Arial" font-size="9" fill="#1a1a1a">Eau minérale 1.5L</text>
                        <text x="12" y="25" font-family="Arial" font-size="8" fill="#718096">Stock: 124</text>
                        <circle cx="145" cy="15" r="8" fill="#48bb78" opacity="0.2"/>
                        <text x="145" y="18" font-family="Arial" font-size="8" text-anchor="middle" fill="#48bb78">✓</text>
                    </g>
                    
                    <g transform="translate(0, 145)">
                        <rect width="160" height="30" rx="6" fill="#ffffff" filter="url(#shadow)"/>
                        <text x="12" y="15" font-family="Arial" font-size="9" fill="#1a1a1a">Riz parfumé 5kg</text>
                        <text x="12" y="25" font-family="Arial" font-size="8" fill="#ed8936">Stock: 5 ⚠</text>
                        <circle cx="145" cy="15" r="8" fill="#ed8936" opacity="0.2"/>
                        <text x="145" y="18" font-family="Arial" font-size="8" text-anchor="middle" fill="#ed8936">!</text>
                    </g>
                    
                    <g transform="translate(0, 185)">
                        <rect width="160" height="30" rx="6" fill="#ffffff" filter="url(#shadow)"/>
                        <text x="12" y="15" font-family="Arial" font-size="9" fill="#1a1a1a">Huile végétale 2L</text>
                        <text x="12" y="25" font-family="Arial" font-size="8" fill="#c53030">Stock: 0 ✗</text>
                        <circle cx="145" cy="15" r="8" fill="#c53030" opacity="0.2"/>
                        <text x="145" y="18" font-family="Arial" font-size="8" text-anchor="middle" fill="#c53030">✗</text>
                    </g>
                    
                    <g transform="translate(0, 225)">
                        <rect width="160" height="30" rx="6" fill="#ffffff" filter="url(#shadow)"/>
                        <text x="12" y="15" font-family="Arial" font-size="9" fill="#1a1a1a">Sucre blanc 1kg</text>
                        <text x="12" y="25" font-family="Arial" font-size="8" fill="#718096">Stock: 89</text>
                        <circle cx="145" cy="15" r="8" fill="#48bb78" opacity="0.2"/>
                        <text x="145" y="18" font-family="Arial" font-size="8" text-anchor="middle" fill="#48bb78">✓</text>
                    </g>
                </g>
            `,
            
            analytics: `
                <g transform="translate(20, 50)">
                    <rect width="160" height="40" rx="8" fill="url(#grad1)"/>
                    <text x="15" y="25" font-family="Arial" font-size="14" font-weight="bold" fill="#ffffff">Analytics</text>
                    
                    <!-- Chart -->
                    <rect y="55" width="160" height="120" rx="10" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="15" y="72" font-family="Arial" font-size="10" fill="#1a1a1a">Ventes des 7 derniers jours</text>
                    
                    <!-- Bar Chart -->
                    <g transform="translate(15, 90)">
                        <rect x="0" y="40" width="15" height="20" rx="2" fill="#667eea" opacity="0.4"/>
                        <rect x="22" y="25" width="15" height="35" rx="2" fill="#667eea" opacity="0.6"/>
                        <rect x="44" y="15" width="15" height="45" rx="2" fill="#667eea" opacity="0.8"/>
                        <rect x="66" y="20" width="15" height="40" rx="2" fill="#667eea"/>
                        <rect x="88" y="30" width="15" height="30" rx="2" fill="#667eea" opacity="0.7"/>
                        <rect x="110" y="10" width="15" height="50" rx="2" fill="url(#grad1)">
                            <animate attributeName="height" values="50;55;50" dur="2s" repeatCount="indefinite"/>
                        </rect>
                        
                        <!-- Days Labels -->
                        <text x="7" y="75" font-family="Arial" font-size="7" fill="#718096">L</text>
                        <text x="29" y="75" font-family="Arial" font-size="7" fill="#718096">M</text>
                        <text x="51" y="75" font-family="Arial" font-size="7" fill="#718096">M</text>
                        <text x="73" y="75" font-family="Arial" font-size="7" fill="#718096">J</text>
                        <text x="95" y="75" font-family="Arial" font-size="7" fill="#718096">V</text>
                        <text x="117" y="75" font-family="Arial" font-size="7" fill="#718096">S</text>
                    </g>
                    
                    <!-- Stats Cards -->
                    <rect y="190" width="75" height="55" rx="8" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="12" y="208" font-family="Arial" font-size="9" fill="#718096">Top produit</text>
                    <text x="12" y="225" font-family="Arial" font-size="11" font-weight="bold" fill="#667eea">Eau 1.5L</text>
                    <text x="12" y="237" font-family="Arial" font-size="8" fill="#48bb78">147 ventes</text>
                    
                    <rect x="85" y="190" width="75" height="55" rx="8" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="97" y="208" font-family="Arial" font-size="9" fill="#718096">Profit</text>
                    <text x="97" y="225" font-family="Arial" font-size="14" font-weight="bold" fill="#48bb78">+24%</text>
                    <text x="97" y="237" font-family="Arial" font-size="8" fill="#718096">vs semaine</text>
                </g>
            `
        };
        
        return screens[screen] || screens.sales;
    }
    
    getDesktopContent(screen) {
        const content = {
            sales: `
                <g transform="translate(15, 15)">
                    <!-- Header -->
                    <rect width="260" height="30" rx="6" fill="url(#grad1)"/>
                    <text x="15" y="20" font-family="Arial" font-size="12" font-weight="bold" fill="#ffffff">Dashboard Vento</text>
                    
                    <!-- Stats Cards -->
                    <rect y="40" width="80" height="50" rx="6" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="10" y="55" font-family="Arial" font-size="8" fill="#718096">CA TOTAL</text>
                    <text x="10" y="73" font-family="Arial" font-size="16" font-weight="bold" fill="#667eea">***</text>
                    <text x="10" y="84" font-family="Arial" font-size="7" fill="#48bb78">Demo</text>
                    
                    <rect x="90" y="40" width="80" height="50" rx="6" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="100" y="55" font-family="Arial" font-size="8" fill="#718096">VENTES</text>
                    <text x="100" y="73" font-family="Arial" font-size="16" font-weight="bold" fill="#764ba2">***</text>
                    <text x="100" y="84" font-family="Arial" font-size="7" fill="#48bb78">Demo</text>
                    
                    <rect x="180" y="40" width="80" height="50" rx="6" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="190" y="55" font-family="Arial" font-size="8" fill="#718096">CLIENTS</text>
                    <text x="190" y="73" font-family="Arial" font-size="16" font-weight="bold" fill="#667eea">***</text>
                    <text x="190" y="84" font-family="Arial" font-size="7" fill="#48bb78">Demo</text>
                    
                    <!-- Chart -->
                    <rect y="100" width="180" height="75" rx="6" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="10" y="115" font-family="Arial" font-size="9" fill="#1a1a1a">Évolution des ventes</text>
                    
                    <!-- Line Chart -->
                    <polyline points="15,155 35,145 55,150 75,135 95,140 115,125 135,130 155,120" 
                              stroke="url(#grad1)" 
                              stroke-width="2" 
                              fill="none"/>
                    
                    <!-- Activity Feed -->
                    <rect x="190" y="100" width="70" height="75" rx="6" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="198" y="115" font-family="Arial" font-size="8" fill="#1a1a1a">Activité</text>
                    
                    <circle cx="205" cy="128" r="4" fill="#48bb78" opacity="0.3"/>
                    <text x="212" y="130" font-family="Arial" font-size="6" fill="#1a1a1a">Vente enregistrée</text>
                    
                    <circle cx="205" cy="145" r="4" fill="#667eea" opacity="0.3"/>
                    <text x="212" y="147" font-family="Arial" font-size="6" fill="#1a1a1a">Stock mis à jour</text>
                    
                    <circle cx="205" cy="162" r="4" fill="#ed8936" opacity="0.3"/>
                    <text x="212" y="164" font-family="Arial" font-size="6" fill="#1a1a1a">Alerte stock bas</text>
                </g>
            `,
            
            stock: `
                <g transform="translate(15, 15)">
                    <rect width="260" height="30" rx="6" fill="url(#grad1)"/>
                    <text x="15" y="20" font-family="Arial" font-size="12" font-weight="bold" fill="#ffffff">Gestion de Stock</text>
                    
                    <!-- Alert Summary -->
                    <rect y="40" width="260" height="40" rx="6" fill="#fed7d7"/>
                    <text x="15" y="58" font-family="Arial" font-size="10" font-weight="bold" fill="#c53030">⚠ Alertes Stock</text>
                    <text x="15" y="72" font-family="Arial" font-size="8" fill="#c53030">8 produits nécessitent votre attention</text>
                    
                    <!-- Product Table -->
                    <rect y="90" width="260" height="90" rx="6" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="15" y="105" font-family="Arial" font-size="8" font-weight="bold" fill="#1a1a1a">Produit</text>
                    <text x="140" y="105" font-family="Arial" font-size="8" font-weight="bold" fill="#1a1a1a">Stock</text>
                    <text x="200" y="105" font-family="Arial" font-size="8" font-weight="bold" fill="#1a1a1a">Statut</text>
                    
                    <!-- Row 1 -->
                    <text x="15" y="125" font-family="Arial" font-size="7" fill="#1a1a1a">Eau minérale 1.5L</text>
                    <text x="140" y="125" font-family="Arial" font-size="7" fill="#48bb78">124</text>
                    <circle cx="215" cy="122" r="5" fill="#48bb78" opacity="0.3"/>
                    <text x="215" y="125" font-family="Arial" font-size="6" text-anchor="middle" fill="#48bb78">✓</text>
                    
                    <!-- Row 2 -->
                    <text x="15" y="145" font-family="Arial" font-size="7" fill="#1a1a1a">Riz parfumé 5kg</text>
                    <text x="140" y="145" font-family="Arial" font-size="7" fill="#ed8936">5</text>
                    <circle cx="215" cy="142" r="5" fill="#ed8936" opacity="0.3"/>
                    <text x="215" y="145" font-family="Arial" font-size="6" text-anchor="middle" fill="#ed8936">!</text>
                    
                    <!-- Row 3 -->
                    <text x="15" y="165" font-family="Arial" font-size="7" fill="#1a1a1a">Huile végétale 2L</text>
                    <text x="140" y="165" font-family="Arial" font-size="7" fill="#c53030">0</text>
                    <circle cx="215" cy="162" r="5" fill="#c53030" opacity="0.3"/>
                    <text x="215" y="165" font-family="Arial" font-size="6" text-anchor="middle" fill="#c53030">✗</text>
                </g>
            `,
            
            analytics: `
                <g transform="translate(15, 15)">
                    <rect width="260" height="30" rx="6" fill="url(#grad1)"/>
                    <text x="15" y="20" font-family="Arial" font-size="12" font-weight="bold" fill="#ffffff">Analytics Avancés</text>
                    
                    <!-- Main Chart -->
                    <rect y="40" width="260" height="90" rx="6" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="15" y="55" font-family="Arial" font-size="9" fill="#1a1a1a">Évolution du chiffre d'affaires (30 jours)</text>
                    
                    <!-- Area Chart -->
                    <path d="M 15 110 L 30 95 L 50 100 L 70 85 L 90 90 L 110 75 L 130 80 L 150 70 L 170 75 L 190 65 L 210 70 L 230 60 L 245 65 L 245 115 L 15 115 Z" 
                          fill="url(#grad1)" 
                          opacity="0.2"/>
                    <polyline points="15,110 30,95 50,100 70,85 90,90 110,75 130,80 150,70 170,75 190,65 210,70 230,60 245,65" 
                              stroke="url(#grad1)" 
                              stroke-width="2" 
                              fill="none"/>
                    
                    <!-- Bottom Stats -->
                    <rect y="140" width="80" height="40" rx="6" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="10" y="155" font-family="Arial" font-size="8" fill="#718096">Meilleure vente</text>
                    <text x="10" y="170" font-family="Arial" font-size="11" font-weight="bold" fill="#667eea">Eau 1.5L</text>
                    
                    <rect x="90" y="140" width="80" height="40" rx="6" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="100" y="155" font-family="Arial" font-size="8" fill="#718096">Taux conversion</text>
                    <text x="100" y="170" font-family="Arial" font-size="11" font-weight="bold" fill="#48bb78">87.2%</text>
                    
                    <rect x="180" y="140" width="80" height="40" rx="6" fill="#ffffff" filter="url(#shadow)"/>
                    <text x="190" y="155" font-family="Arial" font-size="8" fill="#718096">Ticket moyen</text>
                    <text x="190" y="170" font-family="Arial" font-size="11" font-weight="bold" fill="#764ba2">2,847F</text>
                </g>
            `
        };
        
        return content[screen] || content.sales;
    }
    
    attachEventListeners() {
        const navItems = this.container.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const screen = item.getAttribute('data-screen');
                this.loadScreen(screen);
            });
        });
    }
    
    startAutoRotation() {
        const screens = ['sales', 'stock', 'analytics'];
        let currentIndex = 0;
        
        setInterval(() => {
            currentIndex = (currentIndex + 1) % screens.length;
            this.loadScreen(screens[currentIndex]);
        }, 5000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const heroMockup = document.getElementById('interactive-mockup');
    const demoContainer = document.getElementById('demo-container');
    
    if (heroMockup) {
        new InteractiveMockup(heroMockup);
    }
    
    if (demoContainer) {
        new InteractiveMockup(demoContainer);
    }
    
    console.log('📱 Mockup interactif chargé');
});