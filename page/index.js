document.addEventListener("DOMContentLoaded", () => {
    // Configuração do Intersection Observer para animações
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                
                // Adiciona delay escalonado para cards
                if (entry.target.classList.contains('benefit-card')) {
                    const cards = document.querySelectorAll('.benefit-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add("show");
                        }, index * 200);
                    });
                }
            }
        });
    }, observerOptions);

    // Observa todos os elementos com classe 'hidden'
    const hiddenElements = document.querySelectorAll(".hidden");
    hiddenElements.forEach((el) => observer.observe(el));

    // Animação de entrada escalonada para os cards
    const benefitCards = document.querySelectorAll('.benefit-card');
    benefitCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });

    // Efeito de parallax suave para a imagem de fundo
    let ticking = false;
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const backgroundImage = document.querySelector('.backgroundImage');
        if (backgroundImage) {
            const rate = scrolled * -0.5;
            backgroundImage.style.transform = `translateY(${rate}px)`;
        }
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick);

    // Efeito de hover para o botão CTA
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });

        ctaButton.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    }

    // Efeito de hover para os cards
    const cards = document.querySelectorAll('.benefit-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Smooth scroll para links internos (se houver)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Adiciona classe de carregamento para melhorar a experiência
    document.body.classList.add('loaded');

    // Efeito de contador para criar urgência (opcional)
    function updateCounter() {
        const counterElement = document.querySelector('.counter');
        if (counterElement) {
            let count = parseInt(counterElement.textContent);
            if (count > 0) {
                count--;
                counterElement.textContent = count;
            }
        }
    }

    // Atualiza contador a cada segundo (se existir)
    setInterval(updateCounter, 1000);

    // ======== EFEITO DE DIGITAÇÃO CORRIGIDO (ACEITA HTML) ========
    function typeWriterHTML(element, html, speed) {
        // Parseia o HTML original em nós
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
        const nodes = Array.from(doc.body.firstChild.childNodes);
        element.innerHTML = '';

        function typeNode(nodeIndex) {
            if (nodeIndex >= nodes.length) return;
            const node = nodes[nodeIndex];
            if (node.nodeType === Node.TEXT_NODE) {
                // Texto puro
                const text = node.textContent;
                let i = 0;
                (function typeChar() {
                    if (i < text.length) {
                        element.innerHTML += text.charAt(i++);
                        setTimeout(typeChar, speed);
                    } else {
                        typeNode(nodeIndex + 1);
                    }
                })();
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Elemento HTML
                const el = node.cloneNode();
                element.appendChild(el);
                const text = node.textContent;
                let j = 0;
                (function typeInside() {
                    if (j < text.length) {
                        el.textContent += text.charAt(j++);
                        setTimeout(typeInside, speed);
                    } else {
                        typeNode(nodeIndex + 1);
                    }
                })();
            }
        }

        typeNode(0);
    }

    // Aplica efeito de digitação ao título principal (opcional)
    const mainTitle = document.querySelector('.main-title');
    if (mainTitle && window.innerWidth > 768) {
        const originalText = mainTitle.innerHTML;
        setTimeout(() => {
            typeWriterHTML(mainTitle, originalText, 50);
        }, 1000);
    }

    // Adiciona efeito de partículas flutuantes (opcional)
    function createFloatingParticles() {
        const container = document.querySelector('.container');
        if (!container) return;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(173, 23, 0, 0.3);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float 6s ease-in-out infinite;
                animation-delay: ${Math.random() * 6}s;
            `;
            container.appendChild(particle);
        }
    }

    // Cria partículas flutuantes após o carregamento
    setTimeout(createFloatingParticles, 2000);

    // Adiciona CSS para as partículas flutuantes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
            50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        
        .floating-particle {
            animation: float 6s ease-in-out infinite;
        }
        
        .loaded .content {
            animation: fadeInUp 1s ease-out;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});

// Adiciona efeito de scroll suave para toda a página
document.documentElement.style.scrollBehavior = 'smooth';

// Previne comportamento padrão de links para melhor controle
document.addEventListener('click', function(e) {
    if (e.target.closest('.cta-button')) {
        // Adiciona efeito de clique
        e.target.closest('.cta-button').style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.closest('.cta-button').style.transform = 'scale(1)';
        }, 150);
    }
});
