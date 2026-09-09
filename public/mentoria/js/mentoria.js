// ===== CONFIGURAÇÃO INICIAL =====
document.addEventListener("DOMContentLoaded", function () {
    // Inicializar todas as funcionalidades
    initHeader();
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
// Removido: esta página tinha o seu próprio IntersectionObserver para [data-aos],
// duplicando o de /assets/js/reveal.js (e ainda carregava a biblioteca AOS do
// unpkg, que nunca era usada). Os elementos agora usam a classe .reveal
// compartilhada; o atraso em cascata é `data-reveal-delay` lido pelo base.css.

// ===== CARROSSEL DE TESTEMUNHOS =====
//
// Antes: jQuery (87 KB) + OwlCarousel (43 KB de JS + CSS) para 4 depoimentos.
// Agora: rolagem com scroll-snap, que o navegador já faz sozinho. O JS abaixo
// só acrescenta as setas e os indicadores; sem ele o carrossel continua
// funcionando por arrasto e teclado.
//
// A função forceImageVisibility() que existia aqui foi removida: ela recarregava
// `.author-avatar`, um elemento que não existe mais - os depoimentos usam ícone,
// não foto.
function initCarousel() {
    const track = document.querySelector('.testemunhos-carousel');
    if (!track) return;

    const items = Array.from(track.querySelectorAll('.testemunho-item'));
    if (items.length < 2) return;

    track.setAttribute('tabindex', '0');
    track.setAttribute('role', 'region');
    track.setAttribute('aria-label', 'Depoimentos de clientes');

    const controls = document.createElement('div');
    controls.className = 'carousel-controls';
    controls.innerHTML = `
        <button class="carousel-btn" type="button" data-dir="-1" aria-label="Depoimento anterior">
            <i class="fas fa-chevron-left" aria-hidden="true"></i>
        </button>
        <div class="carousel-dots" role="tablist"></div>
        <button class="carousel-btn" type="button" data-dir="1" aria-label="Próximo depoimento">
            <i class="fas fa-chevron-right" aria-hidden="true"></i>
        </button>
    `;
    track.parentNode.insertBefore(controls, track.nextSibling);

    const dotsWrap = controls.querySelector('.carousel-dots');
    const dots = items.map((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Ir para o depoimento ${i + 1}`);
        dot.addEventListener('click', () => scrollToItem(i));
        dotsWrap.appendChild(dot);
        return dot;
    });

    function scrollToItem(index) {
        const clamped = Math.max(0, Math.min(index, items.length - 1));
        track.scrollTo({ left: items[clamped].offsetLeft - track.offsetLeft, behavior: 'smooth' });
    }

    function currentIndex() {
        const center = track.scrollLeft + track.clientWidth / 2;
        let best = 0;
        let bestDist = Infinity;
        items.forEach((item, i) => {
            const itemCenter = item.offsetLeft - track.offsetLeft + item.offsetWidth / 2;
            const dist = Math.abs(itemCenter - center);
            if (dist < bestDist) {
                bestDist = dist;
                best = i;
            }
        });
        return best;
    }

    function syncDots() {
        const active = currentIndex();
        dots.forEach((dot, i) => {
            dot.classList.toggle('is-active', i === active);
            dot.setAttribute('aria-selected', String(i === active));
        });
    }

    controls.querySelectorAll('.carousel-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            scrollToItem(currentIndex() + Number(btn.dataset.dir));
        });
    });

    // Um só listener, agendado em requestAnimationFrame: o evento de scroll
    // dispara dezenas de vezes por segundo e não pode fazer trabalho pesado.
    let ticking = false;
    track.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            syncDots();
            ticking = false;
        });
    }, { passive: true });

    syncDots();
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
    // O envio é do /assets/js/form-contato.js, compartilhado. O handler que
    // existia aqui só simulava: mostrava "enviada com sucesso" e limpava o
    // formulário sem mandar nada a lugar nenhum.
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

// handleFormSubmit foi removida: ela apenas simulava o envio com setTimeout e
// mostrava "enviada com sucesso" sem mandar nada. O envio real e o retorno de
// erro estao em /assets/js/form-contato.js.

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
        '../assets/images/brand/logo-advogada.webp',
        '../assets/images/brand/logo-simbolo.webp'
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
    // Sem analytics configurado, o evento nao vai a lugar nenhum. Quando o
    // GA4 ou o Pixel forem ativados, e aqui que eles entram.
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

    const faqItems = document.querySelectorAll('.faq-item');


    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        if (!question) return;

        question.addEventListener('click', () => {

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
    initFAQ
};