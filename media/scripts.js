// ===== CONFIGURAÇÕES GLOBAIS =====
const CONFIG = {
    slider: {
        autoPlay: true,
        autoPlayDelay: 3000,
        transitionDuration: 500
    },
    animations: {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    }
};

// ===== SLIDER FUNCIONAL =====
class HeroSlider {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 4;
        this.isAutoPlaying = CONFIG.slider.autoPlay;
        this.autoPlayInterval = null;

        // Touch events
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchThreshold = 50; // Minimum distance for swipe

        this.init();
    }

    init() {
        this.bindEvents();
        this.startAutoPlay();
        this.updateIndicators();
    }

    bindEvents() {
        // Botões de navegação
        const prevBtn = document.querySelector('.slider-btn.prev');
        const nextBtn = document.querySelector('.slider-btn.next');

        if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());

        // Indicadores
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const slideNumber = parseInt(e.target.dataset.slide);
                this.goToSlide(slideNumber);
            });
        });

        // Pausar autoplay no hover
        const slider = document.querySelector('.hero-slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => this.pauseAutoPlay());
            slider.addEventListener('mouseleave', () => this.resumeAutoPlay());
        }

        // Controles de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });

        // Touch Events
        const sliderContainer = document.querySelector('.hero-slider');
        if (sliderContainer) {
            sliderContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
            sliderContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        }
    }

    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.pauseAutoPlay();
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
        this.resumeAutoPlay();
    }

    handleSwipe() {
        const diff = this.touchEndX - this.touchStartX;

        if (Math.abs(diff) > this.touchThreshold) {
            if (diff > 0) {
                // Swiped right -> prev slide
                this.prevSlide();
            } else {
                // Swiped left -> next slide
                this.nextSlide();
            }
        }
    }

    goToSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides) return;

        // Remover slide ativo
        const currentSlide = document.querySelector(`.slide[data-slide="${this.currentSlide}"]`);
        const targetSlide = document.querySelector(`.slide[data-slide="${slideNumber}"]`);

        if (currentSlide && targetSlide) {
            currentSlide.classList.remove('active');
            targetSlide.classList.add('active');

            this.currentSlide = slideNumber;
            this.updateIndicators();
            this.resetAutoPlay();
        }
    }

    nextSlide() {
        const nextSlide = this.currentSlide === this.totalSlides ? 1 : this.currentSlide + 1;
        this.goToSlide(nextSlide);
    }

    prevSlide() {
        const prevSlide = this.currentSlide === 1 ? this.totalSlides : this.currentSlide - 1;
        this.goToSlide(prevSlide);
    }

    updateIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            if (index + 1 === this.currentSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    startAutoPlay() {
        if (this.isAutoPlaying) {
            this.autoPlayInterval = setInterval(() => {
                this.nextSlide();
            }, CONFIG.slider.autoPlayDelay);
        }
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    resumeAutoPlay() {
        if (this.isAutoPlaying) {
            this.startAutoPlay();
        }
    }

    resetAutoPlay() {
        this.pauseAutoPlay();
        this.resumeAutoPlay();
    }
}

// ===== ANIMAÇÕES DE SCROLL =====
class ScrollAnimations {
    constructor() {
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            CONFIG.animations
        );

        this.init();
    }

    init() {
        const hiddenElements = document.querySelectorAll('.hidden');
        hiddenElements.forEach(el => this.observer.observe(el));
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');

                // Adicionar delay para elementos em sequência
                if (entry.target.classList.contains('contato-card') ||
                    entry.target.classList.contains('stat-item')) {
                    const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            }
        });
    }
}

// ===== HEADER SCROLL =====
class HeaderScroll {
    constructor() {
        this.header = document.querySelector('.header');
        this.lastScrollY = window.scrollY;
        this.isScrolling = false;

        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll());
        this.header.addEventListener('mouseenter', () => this.showHeader());
        this.header.addEventListener('mouseleave', () => this.handleMouseLeave());
    }

    handleScroll() {
        if (this.isScrolling) return;

        this.isScrolling = true;
        requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
                this.hideHeader();
            } else {
                this.showHeader();
            }

            this.lastScrollY = currentScrollY;
            this.isScrolling = false;
        });
    }

    hideHeader() {
        this.header.classList.add('hidden');
    }

    showHeader() {
        this.header.classList.remove('hidden');
    }

    handleMouseLeave() {
        if (window.scrollY > this.lastScrollY) {
            this.hideHeader();
        }
    }
}

// ===== FORMULÁRIO DE CONTATO =====
class ContactForm {
    constructor() {
        this.form = document.getElementById('formContato');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.setupFormValidation();
            this.setupPhoneMask();
        }
    }

    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    setupPhoneMask() {
        const phoneInput = document.getElementById('telefone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                e.target.value = value;
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Validações específicas
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Este campo é obrigatório';
        } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'E-mail inválido';
        } else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Telefone inválido';
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
        return phoneRegex.test(phone);
    }

    showFieldError(field, message) {
        this.clearFieldError(field);

        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';

        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validar todos os campos
        const inputs = this.form.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showNotification('Por favor, corrija os erros no formulário.', 'error');
            return;
        }

        // Simular envio
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;

        try {
            // Simular delay de envio
            await new Promise(resolve => setTimeout(resolve, 2000));

            this.showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
            this.form.reset();

        } catch (error) {
            this.showNotification('Erro ao enviar mensagem. Tente novamente.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    showNotification(message, type) {
        // Criar notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Estilos da notificação
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#28a745' : '#dc3545',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover após 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// ===== MENU MOBILE =====
class MobileMenu {
    constructor() {
        this.toggle = document.querySelector('.mobile-menu-toggle');
        this.nav = document.querySelector('.nav-menu');
        this.isOpen = false;

        this.init();
    }

    init() {
        if (this.toggle && this.nav) {
            this.toggle.addEventListener('click', () => this.toggleMenu());

            // Fechar menu ao clicar em links
            const navLinks = this.nav.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });

            // Fechar menu ao clicar fora
            document.addEventListener('click', (e) => {
                if (!this.nav.contains(e.target) && !this.toggle.contains(e.target)) {
                    this.closeMenu();
                }
            });
        }
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isOpen = true;
        this.nav.classList.add('mobile-open');
        this.toggle.classList.add('active');

        // Animar hamburger
        const spans = this.toggle.querySelectorAll('span');
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    }

    closeMenu() {
        this.isOpen = false;
        this.nav.classList.remove('mobile-open');
        this.toggle.classList.remove('active');

        // Resetar hamburger
        const spans = this.toggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

// ===== UTILITÁRIOS =====
class Utils {
    static smoothScroll(target) {
        const element = document.querySelector(target);
        if (element) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = element.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    static addLoadingState(element) {
        element.classList.add('loading');
        element.disabled = true;
    }

    static removeLoadingState(element) {
        element.classList.remove('loading');
        element.disabled = false;
    }

    static debounce(func, wait) {
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
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar todas as funcionalidades
    new HeroSlider();
    new ScrollAnimations();
    new HeaderScroll();
    new ContactForm();
    new MobileMenu();

    // Smooth scroll para links internos
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            Utils.smoothScroll(link.getAttribute('href'));
        });
    });

    // Adicionar efeitos de hover nos cards
    const cards = document.querySelectorAll('.contato-card, .info-card, .stat-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Lazy loading para imagens
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    console.log('🚀 Nathiara Borges Advocacia - Página carregada com sucesso!');
});

