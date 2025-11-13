/**
 * VENTO - Advanced Animations
 * Animations complexes et interactions avancées
 * =============================================
 */

// ==================== AOS (Animate On Scroll) Simulation ====================
const AOS = {
    elements: [],
    
    init() {
        this.elements = document.querySelectorAll('[data-aos]');
        this.observe();
        console.log(`✨ ${this.elements.length} éléments AOS initialisés`);
    },
    
    observe() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const animation = el.getAttribute('data-aos');
                    const delay = el.getAttribute('data-aos-delay') || 0;
                    
                    setTimeout(() => {
                        el.classList.add('aos-animate');
                    }, delay);
                    
                    observer.unobserve(el);
                }
            });
        }, options);
        
        this.elements.forEach(el => {
            observer.observe(el);
        });
    }
};

// ==================== PARALLAX EFFECTS ====================
class ParallaxEffect {
    constructor() {
        this.elements = document.querySelectorAll('.gradient-orb');
        this.init();
    }
    
    init() {
        if (window.innerWidth > 768) {
            window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        }
    }
    
    handleMouseMove(e) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        this.elements.forEach((el, index) => {
            const speed = (index + 1) * 0.05;
            const x = (mouseX - 0.5) * 100 * speed;
            const y = (mouseY - 0.5) * 100 * speed;
            
            el.style.transform = `translate(${x}px, ${y}px)`;
        });
    }
}

// ==================== TYPING EFFECT ====================
class TypingEffect {
    constructor(element, texts, speed = 100) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.init();
    }
    
    init() {
        this.type();
    }
    
    type() {
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }
        
        let typeSpeed = this.speed;
        
        if (this.isDeleting) {
            typeSpeed /= 2;
        }
        
        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = 2000;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

// ==================== NUMBER COUNTER ====================
class NumberCounter {
    constructor(element, duration = 2000) {
        this.element = element;
        this.duration = duration;
        this.hasAnimated = false;
    }
    
    animate() {
        if (this.hasAnimated) return;
        
        const target = parseFloat(this.element.getAttribute('data-target'));
        if (!target) return;
        
        const increment = target / (this.duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            
            if (current < target) {
                this.element.textContent = target % 1 !== 0 
                    ? current.toFixed(1) 
                    : Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                this.element.textContent = target % 1 !== 0 
                    ? target.toFixed(1) 
                    : target;
            }
        };
        
        updateCounter();
        this.hasAnimated = true;
    }
}

// ==================== PRICING TOGGLE ====================
function initPricingToggle() {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const priceAmounts = document.querySelectorAll('.price-amount');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const period = btn.getAttribute('data-period');
            
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            priceAmounts.forEach(amount => {
                if (amount.classList.contains('custom')) return;
                
                const monthlyPrice = amount.getAttribute('data-monthly');
                const yearlyPrice = amount.getAttribute('data-yearly');
                
                if (period === 'monthly') {
                    amount.textContent = monthlyPrice;
                } else {
                    amount.textContent = yearlyPrice;
                }
            });
        });
    });
}

// ==================== FAQ ACCORDION ====================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Fermer tous les autres
            faqItems.forEach(i => i.classList.remove('active'));
            
            // Ouvrir celui cliqué si il était fermé
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ==================== SCROLL PROGRESS BAR ====================
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// ==================== BACK TO TOP BUTTON ====================
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ==================== MOUSE CURSOR EFFECT ====================
class CustomCursor {
    constructor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        document.body.appendChild(this.cursor);
        
        this.follower = document.createElement('div');
        this.follower.className = 'custom-cursor-follower';
        document.body.appendChild(this.follower);
        
        this.init();
    }
    
    init() {
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                this.follower.style.left = e.clientX + 'px';
                this.follower.style.top = e.clientY + 'px';
            }, 100);
        });
        
        // Effet sur les liens
        const links = document.querySelectorAll('a, button');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.cursor.classList.add('hover');
                this.follower.classList.add('hover');
            });
            
            link.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('hover');
                this.follower.classList.remove('hover');
            });
        });
    }
}

// ==================== MAGNETIC BUTTONS ====================
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.hero-cta, .cta-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
        });
    });
}

// ==================== RIPPLE EFFECT ====================
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function initRippleEffect() {
    const buttons = document.querySelectorAll('.hero-cta, .price-btn, .submit-btn');
    buttons.forEach(button => {
        if (!button.classList.contains('ripple-container')) {
            button.classList.add('ripple-container');
        }
        button.addEventListener('click', createRipple);
    });
}

// ==================== HERO STATS ANIMATION ====================
function initHeroStats() {
    const stats = document.querySelectorAll('.hero-stat .stat-value');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = new NumberCounter(entry.target);
                counter.animate();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => {
        if (stat.getAttribute('data-target')) {
            observer.observe(stat);
        }
    });
}

// ==================== FORM VALIDATION ====================
function initContactForm() {
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;
        
        // Désactiver le bouton
        submitBtn.disabled = true;
        btnText.textContent = 'Envoi en cours...';
        submitBtn.classList.add('loading');
        
        // Simuler l'envoi
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Success
        formStatus.className = 'form-status success show';
        formStatus.textContent = '✓ Message envoyé avec succès ! Nous vous répondrons sous 24h.';
        
        // Réinitialiser le formulaire
        form.reset();
        submitBtn.disabled = false;
        btnText.textContent = originalText;
        submitBtn.classList.remove('loading');
        
        // Cacher le message après 5s
        setTimeout(() => {
            formStatus.classList.remove('show');
        }, 5000);
    });
    
    // Validation en temps réel
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.validity.valid) {
                input.classList.remove('error');
                input.classList.add('valid');
            } else {
                input.classList.add('error');
                input.classList.remove('valid');
            }
        });
    });
}

// ==================== LAZY LOADING IMAGES ====================
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ==================== FEATURE CARDS TILT EFFECT ====================
function initTiltEffect() {
    const cards = document.querySelectorAll('.feature-card, .why-item, .price-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser toutes les animations
    AOS.init();
    new ParallaxEffect();
    
    // Pricing
    initPricingToggle();
    
    // FAQ
    initFAQ();
    
    // Navigation
    initScrollProgress();
    initBackToTop();
    
    // Effets visuels
    if (window.innerWidth > 1024) {
        new CustomCursor();
        initMagneticButtons();
        initTiltEffect();
    }
    
    initRippleEffect();
    initHeroStats();
    
    // Forms
    initContactForm();
    
    // Performance
    initLazyLoading();
    
    console.log('🎨 Animations avancées chargées');
});

// ==================== EXPORT ====================
window.VentoAnimations = {
    AOS,
    ParallaxEffect,
    TypingEffect,
    NumberCounter
};