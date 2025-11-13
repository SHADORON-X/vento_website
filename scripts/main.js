/**
 * VENTO - Main JavaScript
 * Gestion des interactions et fonctionnalités du site
 * ===================================================
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
    whatsappNumber: '1234567890',
    animationDelay: 100,
    scrollThreshold: 50,
    counterSpeed: 2000
};

// ==================== ÉTAT GLOBAL ====================
const STATE = {
    currentLang: 'fr',
    currentTheme: 'light',
    isMenuOpen: false,
    hasScrolled: false
};

// ==================== INITIALISATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initThemeToggle();
    initLanguageToggle();
    initMobileMenu();
    initSmoothScroll();
    initAnimations();
    initCounters();
    initWhatsAppButton();
    
    console.log('✅ Vento initialized successfully');
});

// ==================== HEADER SCROLL ====================
/**
 * Gère l'effet de scroll du header
 */
function initHeader() {
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        if (scrollY > CONFIG.scrollThreshold && !STATE.hasScrolled) {
            header.classList.add('scrolled');
            STATE.hasScrolled = true;
        } else if (scrollY <= CONFIG.scrollThreshold && STATE.hasScrolled) {
            header.classList.remove('scrolled');
            STATE.hasScrolled = false;
        }
    });
}

// ==================== THEME TOGGLE ====================
/**
 * Gère le basculement entre mode clair et sombre
 */
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    
    // Charger le thème depuis localStorage
    const savedTheme = localStorage.getItem('ventoTheme') || 'light';
    setTheme(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const newTheme = STATE.currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });
    
    function setTheme(theme) {
        STATE.currentTheme = theme;
        document.body.setAttribute('data-theme', theme);
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        localStorage.setItem('ventoTheme', theme);
    }
}

// ==================== LANGUAGE TOGGLE ====================
/**
 * Gère le basculement entre français et anglais
 */
function initLanguageToggle() {
    const langToggle = document.querySelector('.lang-toggle');
    const flagElement = document.querySelector('.flag');
    
    // Charger la langue depuis localStorage
    const savedLang = localStorage.getItem('ventoLang') || 'fr';
    setLanguage(savedLang);
    
    langToggle.addEventListener('click', () => {
        const newLang = STATE.currentLang === 'fr' ? 'en' : 'fr';
        setLanguage(newLang);
    });
    
    function setLanguage(lang) {
        STATE.currentLang = lang;
        document.body.setAttribute('data-lang', lang);
        flagElement.textContent = lang === 'fr' ? '🇫🇷' : '🇬🇧';
        localStorage.setItem('ventoLang', lang);
        
        // Mise à jour du lien WhatsApp
        updateWhatsAppLink(lang);
    }
}

// ==================== MOBILE MENU ====================
/**
 * Gère l'ouverture/fermeture du menu mobile
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    menuToggle.addEventListener('click', () => {
        STATE.isMenuOpen = !STATE.isMenuOpen;
        
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        document.body.style.overflow = STATE.isMenuOpen ? 'hidden' : '';
    });
    
    // Fermer le menu lors du clic sur un lien
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (STATE.isMenuOpen) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
                STATE.isMenuOpen = false;
            }
        });
    });
    
    // Fermer le menu lors du clic à l'extérieur
    document.addEventListener('click', (e) => {
        if (STATE.isMenuOpen && 
            !navMenu.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
            STATE.isMenuOpen = false;
        }
    });
}

// ==================== SMOOTH SCROLL ====================
/**
 * Active le défilement fluide pour les ancres
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Ignorer les liens sans cible
            if (href === '#' || href === '#!') {
                e.preventDefault();
                return;
            }
            
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==================== ANIMATIONS SCROLL ====================
/**
 * Anime les éléments lors du scroll (Intersection Observer)
 */
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Désobserver après animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Éléments à animer
    const animatedElements = document.querySelectorAll(`
        .feature-card,
        .why-item,
        .stat-item,
        .step,
        .price-card,
        .testimonial-card,
        .mockup-item
    `);
    
    animatedElements.forEach((el, index) => {
        // Style initial
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        el.style.transitionDelay = `${index * 0.1}s`;
        
        // Observer
        observer.observe(el);
    });
}

// ==================== ANIMATED COUNTERS ====================
/**
 * Anime les compteurs de statistiques
 */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    let hasAnimated = false;
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                counters.forEach(counter => {
                    animateCounter(counter);
                });
                hasAnimated = true;
            }
        });
    }, observerOptions);
    
    if (counters.length > 0) {
        observer.observe(counters[0]);
    }
    
    function animateCounter(element) {
        const target = parseFloat(element.getAttribute('data-target'));
        
        // Si pas de target, pas d'animation
        if (!target) return;
        
        const duration = CONFIG.counterSpeed;
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            
            if (current < target) {
                // Format avec décimales si nécessaire
                element.textContent = target % 1 !== 0 
                    ? current.toFixed(1) 
                    : Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target % 1 !== 0 
                    ? target.toFixed(1) 
                    : target;
            }
        };
        
        updateCounter();
    }
}

// ==================== WHATSAPP ====================
/**
 * Met à jour le lien WhatsApp selon la langue
 */
function updateWhatsAppLink(lang) {
    const whatsappFloat = document.querySelector('.whatsapp-float');
    const message = lang === 'fr' 
        ? 'Bonjour Vento, je suis intéressé par votre solution'
        : 'Hello Vento, I am interested in your solution';
    
    const encodedMessage = encodeURIComponent(message);
    whatsappFloat.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMessage}`;
}

/**
 * Initialise le bouton WhatsApp
 */
function initWhatsAppButton() {
    const whatsappFloat = document.querySelector('.whatsapp-float');
    
    // Animation d'entrée
    setTimeout(() => {
        whatsappFloat.style.opacity = '1';
        whatsappFloat.style.transform = 'scale(1)';
    }, 1000);
    
    // Style initial
    whatsappFloat.style.opacity = '0';
    whatsappFloat.style.transform = 'scale(0)';
    whatsappFloat.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
}

// ==================== FORM HANDLING ====================
/**
 * Gère la soumission du formulaire de contact
 */
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        try {
            // Simuler l'envoi (à remplacer par votre API)
            console.log('Form data:', data);
            
            // Message de succès
            showNotification('Message envoyé avec succès!', 'success');
            contactForm.reset();
        } catch (error) {
            console.error('Error:', error);
            showNotification('Erreur lors de l\'envoi. Réessayez.', 'error');
        }
    });
}

/**
 * Affiche une notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== PERFORMANCE ====================
/**
 * Lazy loading des images
 */
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('loading' in HTMLImageElement.prototype) {
        // Le navigateur supporte le lazy loading natif
        return;
    }
    
    // Fallback pour les navigateurs plus anciens
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ==================== UTILITIES ====================
/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ==================== ERROR HANDLING ====================
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// ==================== EXPORT ====================
// Pour utilisation dans d'autres modules si nécessaire
window.Vento = {
    STATE,
    CONFIG,
    showNotification,
    setTheme: (theme) => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('ventoTheme', theme);
    },
    setLanguage: (lang) => {
        document.body.setAttribute('data-lang', lang);
        localStorage.setItem('ventoLang', lang);
    }
};

console.log('🚀 Vento Core Loaded');