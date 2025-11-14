// VELMO - Enhanced JavaScript for Ultra Cool, Animated, Functional, and Futuristic Features
// Documentation: This script manages all interactive elements of the Velmo website.
// It includes theme toggling, language switching, mobile menu, smooth scrolling, animations,
// modal handling, FAQ accordion, and more futuristic features like voice commands and particles.

// ==================== VARIABLES ====================
// Documentation: Global variables for DOM elements and state management.
const header = document.getElementById('header');
const nav = document.getElementById('nav');
const menuToggle = document.getElementById('menu-toggle');
const themeBtn = document.getElementById('theme-btn');
const langBtn = document.getElementById('lang-btn');
const backToTop = document.getElementById('back-to-top');
const phoneContent = document.getElementById('phone-content');
const navDots = document.querySelectorAll('.nav-dot');
const accessBtns = document.querySelectorAll('#access-btn, #access-btn-hero');
const demoBtn = document.getElementById('demo-btn');
const accessModal = document.getElementById('access-modal');
const modalClose = document.querySelector('.modal-close');
const accessForm = document.getElementById('access-form');
const formMessage = document.getElementById('form-message');
const faqQuestions = document.querySelectorAll('.faq-question');
let isDark = false;
let lang = 'fr';

// ==================== HEADER SCROLL ====================
// Documentation: Handles header styling on scroll and shows/hides back-to-top button.
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    // Back to top button with fade-in animation
    if (window.scrollY > 500) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

// ==================== MOBILE MENU ====================
// Documentation: Toggles mobile menu and handles closing on outside click or link click.
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    nav.classList.toggle('active');
});
// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target) && nav.classList.contains('active')) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});
// Close menu when clicking a link
nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// ==================== THEME TOGGLE ====================
// Documentation: Toggles dark/light theme with local storage persistence.
themeBtn.addEventListener('click', () => {
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeBtn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('velmoTheme', isDark ? 'dark' : 'light');
});
// Load saved theme
const savedTheme = localStorage.getItem('velmoTheme');
if (savedTheme === 'dark') {
    isDark = true;
    document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn.textContent = '☀️';
}

// ==================== LANGUAGE TOGGLE ====================
// Documentation: Toggles between French and English with local storage.
langBtn.addEventListener('click', () => {
    lang = lang === 'fr' ? 'en' : 'fr';
    document.documentElement.setAttribute('data-lang', lang);
    langBtn.textContent = lang === 'fr' ? '🇫🇷' : '🇬🇧';
    localStorage.setItem('velmoLang', lang);
});
// Load saved language
const savedLang = localStorage.getItem('velmoLang');
if (savedLang === 'en') {
    lang = 'en';
    document.documentElement.setAttribute('data-lang', 'en');
    langBtn.textContent = '🇬🇧';
}

// ==================== BACK TO TOP ====================
// Documentation: Smooth scroll to top on button click.
backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ==================== SMOOTH SCROLL ====================
// Documentation: Smooth scrolling for anchor links with offset for header.
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== ANIMATED COUNTERS ====================
// Documentation: Animates counter elements from 0 to target value.
const animateCounter = (element) => {
    const target = parseFloat(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = target % 1 !== 0 ? current.toFixed(1) : Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target % 1 !== 0 ? target.toFixed(1) : target;
        }
    };
    updateCounter();
};
// Intersection Observer for counters
const statValues = document.querySelectorAll('.stat-value');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });
statValues.forEach(stat => statsObserver.observe(stat));

// ==================== PHONE NAVIGATION ====================
// Documentation: Handles phone mockup view switching with animations and auto-rotation.
const views = {
    sales: `
        <div class="content-header">
            <h3>Ventes du jour</h3>
        </div>
        <div class="sales-card">
            <div style="font-size: 0.85rem; color: #64748b; font-weight: 600;">Chiffre d'affaires</div>
            <div class="sales-value">***</div>
            <div style="font-size: 0.8rem; color: #10b981; font-weight: 600;">Données masquées</div>
        </div>
        <div class="sales-grid">
            <div class="mini-card">
                <div class="mini-label">Ventes</div>
                <div class="mini-value">--</div>
                <div style="font-size: 0.7rem; color: #667eea; font-weight: 700;">Demo</div>
            </div>
            <div class="mini-card">
                <div class="mini-label">Clients</div>
                <div class="mini-value">--</div>
                <div style="font-size: 0.7rem; color: #10b981; font-weight: 700;">Demo</div>
            </div>
        </div>
        <div class="sales-card">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 50px; height: 50px; background: rgba(102, 126, 234, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">📦</div>
                <div style="flex: 1;">
                    <div style="font-weight: 700; font-size: 1rem;">Produit exemple</div>
                    <div style="font-size: 0.8rem; color: #64748b;">Démo interactive</div>
                </div>
                <div style="font-weight: 900; color: #10b981; font-size: 1.1rem;">***</div>
            </div>
        </div>
    `,
    stock: `
        <div class="content-header">
            <h3>Gestion Stock</h3>
        </div>
        <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 1.25rem; border-radius: 1rem; margin-bottom: 1.5rem;">
            <div style="font-size: 0.9rem; color: #dc2626; font-weight: 700;">⚠ 8 produits en rupture</div>
            <div style="font-size: 0.75rem; color: #ef4444; margin-top: 0.25rem;">Action requise</div>
        </div>
        ${['Eau minérale 1.5L', 'Riz parfumé 5kg', 'Huile végétale 2L', 'Sucre blanc 1kg'].map((item, i) => `
            <div class="sales-card" style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 700; font-size: 0.95rem;">${item}</div>
                        <div style="font-size: 0.8rem; color: ${i === 0 ? '#10b981' : i === 1 ? '#f59e0b' : i === 2 ? '#ef4444' : '#10b981'};">
                            Stock: ${i === 0 ? '124' : i === 1 ? '5 ⚠' : i === 2 ? '0 ✗' : '89'}
                        </div>
                    </div>
                    <div style="width: 36px; height: 36px; background: rgba(${i === 0 ? '16, 185, 129' : i === 1 ? '245, 158, 11' : i === 2 ? '239, 68, 68' : '16, 185, 129'}, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: ${i === 0 ? '#10b981' : i === 1 ? '#f59e0b' : i === 2 ? '#ef4444' : '#10b981'};">
                        ${i === 0 ? '✓' : i === 1 ? '!' : i === 2 ? '✗' : '✓'}
                    </div>
                </div>
            </div>
        `).join('')}
    `,
    analytics: `
        <div class="content-header">
            <h3>Analytics</h3>
        </div>
        <div class="sales-card" style="margin-bottom: 1.5rem;">
            <div style="font-size: 0.9rem; color: #64748b; margin-bottom: 1.25rem; font-weight: 600;">Ventes des 7 derniers jours</div>
            <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 120px; gap: 0.75rem;">
                ${[40, 65, 75, 68, 50, 85, 92].map((height, i) => `
                    <div style="flex: 1; background: linear-gradient(to top, #667eea, #818cf8); border-radius: 0.75rem 0.75rem 0 0; height: ${height}%; transition: all 0.3s; animation: barGrow 0.5s ease-out ${i * 0.1}s backwards;"></div>
                `).join('')}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: #94a3b8; margin-top: 0.75rem; font-weight: 600;">
                <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
            </div>
        </div>
        <div class="sales-grid">
            <div class="mini-card">
                <div class="mini-label">Top produit</div>
                <div style="font-weight: 800; color: #667eea; margin: 0.75rem 0; font-size: 1.1rem;">Eau 1.5L</div>
                <div style="font-size: 0.75rem; color: #10b981; font-weight: 700;">147 ventes</div>
            </div>
            <div class="mini-card">
                <div class="mini-label">Profit</div>
                <div style="font-size: 2rem; font-weight: 900; color: #10b981; margin: 0.75rem 0;">+24%</div>
                <div style="font-size: 0.75rem; color: #64748b; font-weight: 600;">vs semaine</div>
            </div>
        </div>
        <style>
            @keyframes barGrow {
                from { height: 0; opacity: 0; }
                to { height: ${height}%; opacity: 1; }
            }
        </style>
    `
};
navDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const view = dot.getAttribute('data-view');
      
        // Update active state with neon glow
        navDots.forEach(d => {
            d.classList.remove('active');
            const svg = d.querySelector('svg');
            svg.setAttribute('fill', '#94a3b8');
        });
      
        dot.classList.add('active');
        dot.querySelector('svg').setAttribute('fill', 'white');
      
        // Update content with futuristic fade and scale animation
        phoneContent.style.opacity = '0';
        phoneContent.style.transform = 'translateY(10px) scale(0.95)';
      
        setTimeout(() => {
            phoneContent.innerHTML = views[view];
            phoneContent.style.transition = 'all 0.4s ease-out';
            phoneContent.style.opacity = '1';
            phoneContent.style.transform = 'translateY(0) scale(1)';
        }, 250);
    });
});
// Auto-rotate phone views with smooth transition
let currentViewIndex = 0;
const viewKeys = Object.keys(views);

setInterval(() => {
    currentViewIndex = (currentViewIndex + 1) % viewKeys.length;
    const nextView = viewKeys[currentViewIndex];
    const nextDot = document.querySelector(`[data-view="${nextView}"]`);
    if (nextDot) nextDot.click();
}, 5000);

// ==================== ACCESS MODAL ====================
// Documentation: Handles modal opening, closing, and form submission simulation.
accessBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        accessModal.style.display = 'flex';
        accessModal.style.opacity = '0';
        setTimeout(() => {
            accessModal.style.opacity = '1';
            accessModal.style.transition = 'opacity 0.3s ease';
        }, 10);
    });
});
modalClose.addEventListener('click', () => {
    accessModal.style.display = 'none';
    formMessage.classList.add('hidden');
    accessForm.reset();
});
window.addEventListener('click', (e) => {
    if (e.target === accessModal) {
        accessModal.style.display = 'none';
        formMessage.classList.add('hidden');
        accessForm.reset();
    }
});
accessForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Simulate form submission with animation
    setTimeout(() => {
        accessForm.classList.add('hidden');
        formMessage.classList.remove('hidden');
        formMessage.style.opacity = '0';
        setTimeout(() => {
            formMessage.style.opacity = '1';
            formMessage.style.transition = 'opacity 0.5s ease';
        }, 10);
    }, 500);
});

// ==================== DEMO BUTTON ====================
// Documentation: Scrolls to demo section on click.
demoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#demo').scrollIntoView({ behavior: 'smooth' });
});

// ==================== FAQ ACCORDION ====================
// Documentation: Toggles FAQ answers with smooth height animation.
faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        question.classList.toggle('active');
        const answer = question.nextElementSibling;
        if (question.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
            answer.style.opacity = '1';
        } else {
            answer.style.maxHeight = '0';
            answer.style.opacity = '0';
        }
    });
});

// ==================== SCROLL ANIMATIONS ====================
// Documentation: Observes elements for reveal animations on scroll.
const observeElements = () => {
    const elements = document.querySelectorAll('.feature-card, .stat, .hero-content, .testimonial-card, .step-card');
  
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
  
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px) scale(0.95)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
};
// Initialize scroll animations
observeElements();

// ==================== PERFORMANCE ====================
// Documentation: Removes loading class after load for better perceived performance.
window.addEventListener('load', () => {
    // Remove loading class if any
    document.body.classList.remove('loading');
});

// ==================== CONSOLE MESSAGE ====================
// Documentation: Logs initialization messages to console for debugging.
console.log('%c🚀 Velmo - Site Ultra Pro', 'font-size: 24px; font-weight: bold; color: #667eea;');
console.log('%c✨ Développé avec passion pour les commerçants africains', 'font-size: 14px; color: #64748b;');

// ==================== EASTER EGG ====================
// Documentation: Konami code Easter egg with rainbow animation and alert.
let konamiCode = [];
const pattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
  
    if (konamiCode.join(',') === pattern.join(',')) {
        document.body.style.animation = 'rainbow 2s infinite';
        setTimeout(() => {
            document.body.style.animation = '';
            alert('🎉 Vous avez trouvé l\'Easter Egg Velmo! 🚀');
        }, 2000);
    }
});

// ==================== KEYBOARD SHORTCUTS ====================
// Documentation: Adds keyboard shortcuts for theme, language, and closing elements.
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        themeBtn.click();
    }
  
    // Ctrl/Cmd + L: Toggle language
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        langBtn.click();
    }
  
    // Escape: Close menu and modal
    if (e.key === 'Escape') {
        if (nav.classList.contains('active')) {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
        }
        if (accessModal.style.display === 'flex') {
            accessModal.style.display = 'none';
            formMessage.classList.add('hidden');
            accessForm.classList.remove('hidden');
            accessForm.reset();
        }
    }
});

// ==================== PRINT STYLES ====================
// Documentation: Hides non-essential elements during print.
window.addEventListener('beforeprint', () => {
    document.querySelectorAll('.whatsapp-btn, .back-to-top, header').forEach(el => {
        el.style.display = 'none';
    });
});
window.addEventListener('afterprint', () => {
    document.querySelectorAll('.whatsapp-btn, .back-to-top, header').forEach(el => {
        el.style.display = '';
    });
});

// ==================== ANALYTICS (Optional) ====================
// Documentation: Tracks page views and button clicks (placeholder for real analytics).
const trackPageView = () => {
    console.log('Page viewed:', window.location.href);
    // Add your analytics code here (Google Analytics, etc.)
};
// Track button clicks
document.querySelectorAll('button, .btn-primary, .btn-secondary, .cta-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        console.log('Button clicked:', e.target.textContent);
        // Add your analytics code here
    });
});
trackPageView();

// ==================== INITIALIZATION ====================
// Documentation: Logs initialization status.
console.log('✅ Velmo initialized successfully');
console.log('📱 Responsive: ✓');
console.log('🎨 Theme: ' + (isDark ? 'Dark' : 'Light'));
console.log('🌍 Language: ' + lang.toUpperCase());

// ==================== FUTURISTIC PARTICLE BACKGROUND ====================
// Documentation: Creates a canvas with animated particles for a futuristic hero section.
function createParticles() {
  const canvas = document.createElement('canvas');
  canvas.classList.add('particle-canvas');
  document.querySelector('.hero-bg').appendChild(canvas); // Add to hero bg

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  for (let i = 0; i < 150; i++) { // Increased for more density
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 1,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1,
      color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx = -p.vx;
      if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
  }

  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

createParticles();

// ==================== VOICE COMMAND INTEGRATION ====================
// Documentation: Adds voice commands for theme toggle and scroll to top (futuristic feature).
if ('SpeechRecognition' in window) {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'fr-FR';
  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    if (command.includes('mode sombre') || command.includes('dark mode')) {
      if (!isDark) themeBtn.click();
    } else if (command.includes('mode clair') || command.includes('light mode')) {
      if (isDark) themeBtn.click();
    } else if (command.includes('retour en haut') || command.includes('scroll top')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Start listening on voice button click (assume .voice-btn exists or add it)
  document.querySelector('.voice-btn')?.addEventListener('click', () => recognition.start());
}

// ==================== LAZY LOADING IMAGES ====================
// Documentation: Adds lazy loading to all images for performance.
document.querySelectorAll('img').forEach(img => {
  img.loading = 'lazy';
});

// ==================== INFINITE TESTIMONIAL CAROUSEL ====================
// Documentation: Creates an infinite scrolling effect for testimonials.
const testimonialsGrid = document.querySelector('.testimonials-grid');
if (testimonialsGrid) {
  let clone = testimonialsGrid.innerHTML;
  testimonialsGrid.innerHTML += clone + clone; // Triple for smoother infinite scroll
  testimonialsGrid.style.animation = 'scrollLeft 60s linear infinite';
}
// Add to CSS if needed: @keyframes scrollLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }