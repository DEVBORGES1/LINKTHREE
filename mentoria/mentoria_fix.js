// ===== CONFIGURAÇÃO INICIAL =====
document.addEventListener("DOMContentLoaded", function () {
    // Inicializar todas as funcionalidades
    initHeader();
    initAnimations();
    initCarousel();
    initFormValidation();
    initSmoothScrolling();
    initMobileMenu();
    initLazyLoading();
    initFooter();
    initFAQ(); // Nova função de FAQ

    // Adicionar listener para scroll
    window.addEventListener('scroll', handleScroll);

    // Adicionar listener para resize da janela
    window.addEventListener('resize', handleResize);
});

// ===== HEADER E NAVEGAÇÃO =====
function initHeader() {
    const header = document.getElementById('header');
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Esconder/mostrar header baseado na direção do scroll
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick);

    // Mostrar header ao passar o mouse
    header.addEventListener('mouseenter', () => {
        header.style.transform = 'translateY(0)';
    });
}

// ===== ANIMAÇÕES DE SCROLL =====
function initAnimations() {
    // Verificar se o navegador suporta Intersection Observer
    if (!('IntersectionObserver' in window)) {
        // Fallback para navegadores antigos
        document.querySelectorAll('[data-aos]').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animation = element.getAttribute('data-aos');
                const delay = element.getAttribute('data-aos-delay') || 0;

                setTimeout(() => {
                    element.classList.add('aos-animate');
                    element.style.opacity = '1';
                    element.style.transform = 'none';
                }, delay);

                observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Observar todos os elementos com data-aos
    document.querySelectorAll('[data-aos]').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===== CARROSSEL DE TESTEMUNHOS =====
function initCarousel() {
    if (typeof $ === 'undefined') {
        console.warn('jQuery não está carregado. Carrossel não funcionará.');
        return;
    }

    $('.testemunhos-carousel').owlCarousel({
        loop: true,
        margin: 30,
        nav: true,
        dots: true,
        autoplay: true,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        lazyLoad: true,
        lazyLoadEager: 1,
        responsive: {
            0: {
                items: 1,
                margin: 20
            },
            768: {
                items: 1,
                margin: 30
            },
            1024: {
                items: 2,
                margin: 40
            }
        },
        navText: [
            '<i class="fas fa-chevron-left"></i>',
            '<i class="fas fa-chevron-right"></i>'
        ],
        onInitialized: function () {
            // Garantir que as imagens sejam visíveis após inicialização
            $('.testemunhos-carousel .owl-item').each(function () {
                $(this).find('img').css('opacity', '1');
            });
        },
        onChanged: function () {
            // Garantir que as imagens sejam visíveis após mudança de slide
            $('.testemunhos-carousel .owl-item').each(function () {
                $(this).find('img').css({
                    'opacity': '1',
                    'visibility': 'visible',
                    'display': 'block'
                });
            });

            // Forçar visibilidade após mudança
            setTimeout(() => {
                forceImageVisibility();
            }, 50);
        }
    });

    // Adicionar controles de navegação personalizados
    addCustomCarouselControls();

    // Forçar visibilidade das imagens após inicialização
    setTimeout(() => {
        forceImageVisibility();
    }, 100);

    // Adicionar listener para mudanças de slide
    $('.testemunhos-carousel').on('changed.owl.carousel', function () {
        setTimeout(() => {
            forceImageVisibility();
        }, 100);
    });
}

function addCustomCarouselControls() {
    const carousel = document.querySelector('.testemunhos-carousel');
    if (!carousel) return;

    // Adicionar indicadores personalizados
    const indicators = document.createElement('div');
    indicators.className = 'custom-indicators';
    indicators.innerHTML = `
        <button class="indicator active" data-slide="0"></button>
        <button class="indicator" data-slide="1"></button>
        <button class="indicator" data-slide="2"></button>
        <button class="indicator" data-slide="3"></button>
        <button class="indicator" data-slide="4"></button>
    `;

    carousel.parentNode.appendChild(indicators);

    // Adicionar funcionalidade aos indicadores
    indicators.addEventListener('click', (e) => {
        if (e.target.classList.contains('indicator')) {
            const slideIndex = parseInt(e.target.dataset.slide);
            $('.testemunhos-carousel').trigger('to.owl.carousel', [slideIndex]);

            // Atualizar indicadores ativos
            indicators.querySelectorAll('.indicator').forEach(ind => ind.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
}

// ===== FORÇAR VISIBILIDADE DAS IMAGENS =====
function forceImageVisibility() {
    const carouselImages = document.querySelectorAll('.testemunhos-carousel .author-avatar');

    carouselImages.forEach(img => {
        // Forçar visibilidade
        img.style.opacity = '1';
        img.style.visibility = 'visible';
        img.style.display = 'block';

        // Se a imagem não carregou, tentar recarregar
        if (!img.complete || img.naturalHeight === 0) {
            const originalSrc = img.src;
            img.src = '';
            setTimeout(() => {
                img.src = originalSrc;
            }, 50);
        }
    });

    // Também forçar visibilidade dos itens do carrossel
    const carouselItems = document.querySelectorAll('.testemunhos-carousel .owl-item');
    carouselItems.forEach(item => {
        item.style.opacity = '1';
        item.style.visibility = 'visible';
    });
}

// ===== VALIDAÇÃO DE FORMULÁRIO =====
function initFormValidation() {
    const form = document.getElementById('formContato');
    if (!form) return;

    // Adicionar validação em tempo real
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });

    // Submissão do formulário
    form.addEventListener('submit', handleFormSubmit);
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.name;

    // Remover erros anteriores
    clearFieldError(e);

    let isValid = true;
    let errorMessage = '';

    // Validações específicas por campo
    switch (fieldName) {
        case 'nome':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Nome deve ter pelo menos 2 caracteres';
            }
            break;

        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'E-mail inválido';
            }
            break;

        case 'celular':
            const phoneRegex = /^[\d\s\(\)\-\+]+$/;
            if (!phoneRegex.test(value) || value.length < 10) {
                isValid = false;
                errorMessage = 'Celular inválido';
            }
            break;

        case 'mensagem':
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'Mensagem deve ter pelo menos 10 caracteres';
            }
            break;
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function showFieldError(field, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    `;

    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#ef4444';
}

function clearFieldError(e) {
    const field = e.target;
    const errorDiv = field.parentNode.querySelector('.field-error');

    if (errorDiv) {
        errorDiv.remove();
    }

    field.style.borderColor = '';
}

function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const inputs = form.querySelectorAll('input, textarea');

    // Validar todos os campos
    let isValid = true;
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });

    if (!isValid) {
        showNotification('Por favor, corrija os erros no formulário.', 'error');
        return;
    }

    // Simular envio
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simular delay de envio
    setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
        form.reset();

        // Limpar todos os erros
        form.querySelectorAll('.field-error').forEach(error => error.remove());
        form.querySelectorAll('input, textarea').forEach(input => {
            input.style.borderColor = '';
        });
    }, 2000);
}

// ===== ROLAGEM SUAVE =====
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Atualizar URL sem scroll
                history.pushState(null, null, targetId);
            }
        });
    });
}

// ===== MENU MOBILE =====
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (!mobileToggle || !navMenu) return;

    mobileToggle.addEventListener('click', () => {
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';

        mobileToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');

        // Animar o botão hamburger
        const spans = mobileToggle.querySelectorAll('span');
        if (!isExpanded) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Fechar menu ao clicar em um link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');

            // Resetar animação do botão
            const spans = mobileToggle.querySelectorAll('span');
            spans.forEach(span => {
                span.style.transform = 'none';
                span.style.opacity = '1';
            });
        });
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// ===== LAZY LOADING =====
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Verificar e corrigir imagens dos testemunhos
    initTestimonialImages();
}

// ===== IMAGENS DOS TESTEMUNHOS =====
function initTestimonialImages() {
    const testimonialImages = document.querySelectorAll('.author-avatar');

    testimonialImages.forEach(img => {
        // Adicionar evento de erro para imagens que não carregam
        img.addEventListener('error', function () {
            console.warn('Imagem não carregou:', this.src);
            // Adicionar um placeholder ou ícone
            this.style.background = 'var(--primary-color)';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.innerHTML = '<i class="fas fa-user" style="color: white; font-size: 24px;"></i>';
            this.style.opacity = '1';
        });

        // Adicionar evento de carregamento bem-sucedido
        img.addEventListener('load', function () {
            this.style.opacity = '1';
            this.style.visibility = 'visible';
        });

        // Garantir que a imagem seja visível
        img.style.opacity = '1';
        img.style.visibility = 'visible';
        img.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';

        // Forçar carregamento da imagem se ela já estiver em cache
        if (img.complete && img.naturalHeight !== 0) {
            img.style.opacity = '1';
            img.style.visibility = 'visible';
        }
    });
}

// ===== NOTIFICAÇÕES =====
function showNotification(message, type = 'info') {
    // Remover notificações existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Botão de fechar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });

    // Auto-remover após 5 segundos
    setTimeout(() => {
        hideNotification(notification);
    }, 5000);
}

function hideNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    return colors[type] || '#3b82f6';
}

// ===== HANDLERS DE EVENTOS =====
function handleScroll() {
    // Atualizar indicadores de navegação
    updateNavigationIndicators();
}

function handleResize() {
    // Ajustar layout em mudanças de tamanho da janela
    adjustLayout();
}

function updateNavigationIndicators() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

function adjustLayout() {
    // Ajustar layout responsivo se necessário
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // Ajustes específicos para mobile
        document.body.classList.add('mobile');
    } else {
        document.body.classList.remove('mobile');
    }
}

// ===== UTILITÁRIOS =====
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

function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== PERFORMANCE =====
// Usar throttle para eventos de scroll
const throttledScrollHandler = throttle(handleScroll, 16); // ~60fps
window.addEventListener('scroll', throttledScrollHandler);

// Usar debounce para resize
const debouncedResizeHandler = debounce(handleResize, 250);
window.addEventListener('resize', debouncedResizeHandler);

// ===== PRELOAD DE RECURSOS =====
function preloadResources() {
    // Preload de imagens importantes
    const importantImages = [
        'imagens/logos/Design sem nome (1).png',
        'imagens/logos/BS (500 x 200 px).png'
    ];

    importantImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Executar preload quando a página estiver carregada
window.addEventListener('load', preloadResources);

// ===== SERVICE WORKER (OPCIONAL) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Registrar service worker para cache offline
        // navigator.serviceWorker.register('/sw.js');
    });
}

// ===== ANALYTICS E TRACKING =====
function trackEvent(eventName, eventData = {}) {
    // Implementar tracking de eventos se necessário
    console.log('Event tracked:', eventName, eventData);
}

// ===== FOOTER =====
function initFooter() {
    const footer = document.querySelector('footer .interface');
    if (!footer) return;

    // Adicionar animação de entrada quando o footer estiver visível
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                entry.target.classList.remove('hidden');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Inicialmente esconder o footer
    footer.classList.add('hidden');
    observer.observe(footer);
}

// ===== FAQ ACCORDION =====
function initFAQ() {
    console.log('MentoriaApp: initFAQ starting');
    const faqItems = document.querySelectorAll('.faq-item');
    console.log('MentoriaApp: Found FAQ items:', faqItems.length);

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        if (!question) return;

        question.addEventListener('click', () => {
            console.log('MentoriaApp: FAQ clicked');
            const isActive = item.classList.contains('active');

            // Fechar todos os outros
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                if (otherAnswer) {
                    otherAnswer.style.maxHeight = null;
                }
            });

            // Abrir ou fechar o atual
            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                if (answer) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            }
        });
    });
}

// ===== EXPORTAR FUNÇÕES PARA USO GLOBAL =====
window.MentoriaApp = {
    showNotification,
    trackEvent,
    validateField,
    initAnimations,
    initFAQ
};