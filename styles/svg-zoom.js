/**
 * VENTO - SVG Zoom Modal
 * Click pour agrandir les SVG et mockups
 * ==========================================
 */

class SVGZoom {
    constructor() {
        this.modal = document.getElementById('svg-modal');
        this.modalBody = document.getElementById('svg-modal-body');
        this.modalClose = document.getElementById('svg-modal-close');
        this.modalOverlay = document.getElementById('svg-modal-overlay');
        this.init();
    }
    
    init() {
        // Ajouter le click sur tous les SVG interactifs
        this.attachClickListeners();
        
        // Fermer le modal
        this.modalClose?.addEventListener('click', () => this.close());
        this.modalOverlay?.addEventListener('click', () => this.close());
        
        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
        
        console.log('🔍 SVG Zoom activé');
    }
    
    attachClickListeners() {
        // SVG dans la section hero
        const heroMockup = document.querySelector('.interactive-mockup-svg');
        if (heroMockup) {
            heroMockup.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-item')) {
                    this.open(heroMockup);
                }
            });
        }
        
        // SVG dans la section demo
        const demoContainer = document.getElementById('demo-container');
        if (demoContainer) {
            const demoSvg = demoContainer.querySelector('.interactive-mockup-svg');
            if (demoSvg) {
                demoSvg.addEventListener('click', (e) => {
                    if (!e.target.closest('.nav-item')) {
                        this.open(demoSvg);
                    }
                });
            }
        }
        
        // Tous les autres SVG avec classe .zoomable
        const zoomableSvgs = document.querySelectorAll('.zoomable');
        zoomableSvgs.forEach(svg => {
            svg.addEventListener('click', () => this.open(svg));
        });
    }
    
    open(svgElement) {
        if (!this.modal || !this.modalBody) return;
        
        // Cloner le SVG
        const svgClone = svgElement.cloneNode(true);
        svgClone.style.cursor = 'default';
        
        // Retirer les event listeners du clone
        const cloneNavItems = svgClone.querySelectorAll('.nav-item');
        cloneNavItems.forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            newItem.style.cursor = 'default';
            newItem.style.pointerEvents = 'none';
        });
        
        // Vider et ajouter le clone
        this.modalBody.innerHTML = '';
        this.modalBody.appendChild(svgClone);
        
        // Afficher le modal
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Animation
        setTimeout(() => {
            svgClone.style.animation = 'scaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }, 10);
    }
    
    close() {
        if (!this.modal) return;
        
        // Animation de fermeture
        const svgInModal = this.modalBody?.querySelector('svg');
        if (svgInModal) {
            svgInModal.style.animation = 'scaleOut 0.3s ease-out';
        }
        
        setTimeout(() => {
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
            if (this.modalBody) {
                this.modalBody.innerHTML = '';
            }
        }, 200);
    }
}

// Animation de sortie
const style = document.createElement('style');
style.textContent = `
    @keyframes scaleOut {
        from {
            transform: scale(1);
            opacity: 1;
        }
        to {
            transform: scale(0.8);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.ventoSvgZoom = new SVGZoom();
});

// Réinitialiser après les changements de mockup
if (window.InteractiveMockup) {
    const originalLoadScreen = InteractiveMockup.prototype.loadScreen;
    InteractiveMockup.prototype.loadScreen = function(...args) {
        originalLoadScreen.apply(this, args);
        setTimeout(() => {
            if (window.ventoSvgZoom) {
                window.ventoSvgZoom.attachClickListeners();
            }
        }, 500);
    };
}

console.log('🔍 SVG Zoom Module Loaded');