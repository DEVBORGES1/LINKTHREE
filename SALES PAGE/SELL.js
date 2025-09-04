// Configurações globais
const CONFIG = {
    animationDuration: 600,
    scrollThreshold: 0.1,
    headerHideDelay: 100
};

// Inicialização quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
    initializeAnimations();
    initializeHeader();
    initializeMobileMenu();
    initializeVideoPlayers();
    initializeCounters();
    initializeSmoothScroll();
    initializeFormValidation();
});

// Sistema de animações com Intersection Observer
function initializeAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    
                    // Adiciona delay escalonado para elementos em grupo
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.style.animationDelay = `${delay}ms`;
                    }, delay);
                }
            });
        },
        {
            threshold: CONFIG.scrollThreshold,
            rootMargin: '0px 0px -50px 0px'
        }
    );

    const hiddenElements = document.querySelectorAll(".hidden");
    hiddenElements.forEach((el, index) => {
        el.dataset.delay = index * 100; // Delay escalonado
        observer.observe(el);
    });
}

// Sistema de header inteligente
function initializeHeader() {
    const header = document.querySelector('.header-modern');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
        const currentScrollY = window.scrollY;
        const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
        
        if (currentScrollY > 100) {
            header.classList.add('scrolled');
            
            if (scrollDirection === 'down' && currentScrollY > lastScrollY + 50) {
                header.classList.add('hidden');
            } else if (scrollDirection === 'up') {
                header.classList.remove('hidden');
            }
        } else {
            header.classList.remove('scrolled', 'hidden');
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

    window.addEventListener('scroll', requestTick, { passive: true });

    // Mostrar header no hover
    header.addEventListener('mouseenter', () => {
        header.classList.remove('hidden');
    });

    // Atualizar links ativos
    updateActiveNavLinks();
    window.addEventListener('scroll', updateActiveNavLinks, { passive: true });
}

// Atualizar links de navegação ativos
function updateActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
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

// Menu mobile responsivo
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!mobileToggle || !navMenu) return;

    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
        
        // Animar ícone do hambúrguer
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Fechar menu ao clicar em um link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Sistema de vídeos melhorado
function initializeVideoPlayers() {
    const videoContainers = document.querySelectorAll('.video-container');
    
    videoContainers.forEach(container => {
        const iframe = container.querySelector('iframe');
        const overlay = container.parentElement.querySelector('.video-overlay');
        
        if (overlay) {
            overlay.addEventListener('click', () => {
                // Simular play do vídeo
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 300);
            });
        }
        
        // Lazy loading para iframes
        if (iframe) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const src = iframe.dataset.src || iframe.src;
                        if (src && !iframe.src) {
                            iframe.src = src;
                        }
                        observer.unobserve(iframe);
                    }
                });
            });
            
            observer.observe(iframe);
        }
    });
}

// Contadores animados
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number, .metric-value, .result-number');
    
    const animateCounter = (element) => {
        const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            const suffix = element.textContent.replace(/[\d]/g, '');
            element.textContent = Math.floor(current) + suffix;
        }, 16);
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Scroll suave para âncoras
function initializeSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header-modern').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Validação de formulários
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = form.querySelector('input[type="email"]');
            if (email && !isValidEmail(email.value)) {
                showNotification('Por favor, insira um email válido.', 'error');
                return;
            }
            
            // Simular envio do formulário
            showNotification('Formulário enviado com sucesso!', 'success');
            form.reset();
        });
    });
}

// Utilitários
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'
    });
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Efeitos de hover para cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.result-card, .option-card, .testimonial-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});

// Parallax sutil para elementos de fundo
function initializeParallax() {
    const parallaxElements = document.querySelectorAll('.hero-background, .floating-card');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// Inicializar parallax
initializeParallax();

// Performance: Debounce para eventos de scroll
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

// Otimização de performance
const debouncedScrollHandler = debounce(() => {
    // Handlers de scroll otimizados
}, 16);

window.addEventListener('scroll', debouncedScrollHandler, { passive: true });

// Preload de imagens críticas
function preloadImages() {
    const criticalImages = [
        'IMAGENS/LUCAS.png',
        'IMAGENS/Mariane.png',
        'IMAGENS/MARIA.png',
        'IMAGENS/BS (500 x 200 px).png'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Inicializar preload
preloadImages();