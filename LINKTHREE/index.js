document.addEventListener("DOMContentLoaded", () => {
    // Intersection Observer para animações
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        }
    );

    // Observar elementos com classe hidden
    const hiddenElements = document.querySelectorAll(".hidden");
    hiddenElements.forEach((el) => observer.observe(el));

    // Scroll suave para links internos
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Efeito de parallax sutil no header
    const header = document.querySelector('.header');
    const profilePic = document.querySelector('.profile-pic');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (profilePic) {
            profilePic.style.transform = `translateY(${rate}px)`;
        }
    });

    // Animação de digitação para o título
    const titulo = document.querySelector('.titulo');
    if (titulo) {
        const text = titulo.textContent;
        titulo.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                titulo.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // Iniciar animação após um pequeno delay
        setTimeout(typeWriter, 500);
    }

    // Efeito hover nos botões
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Animação de contadores para as experiências
    const experienciaCards = document.querySelectorAll('.experiencia-card');
    const observerCards = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            }
        });
    }, { threshold: 0.5 });

    experienciaCards.forEach(card => observerCards.observe(card));

    // Adicionar classe ativa ao link de navegação atual
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.button');
    
    navLinks.forEach(link => {
        if (link.href.includes(currentPath) || 
            (currentPath.endsWith('/') && link.href.includes('index.html'))) {
            link.classList.add('active');
        }
    });

    // Melhorar acessibilidade do formulário
    const emailForm = document.querySelector('form');
    const emailInput = document.querySelector('#email');
    
    if (emailForm && emailInput) {
        emailForm.addEventListener('submit', (e) => {
            const email = emailInput.value.trim();
            if (!email) {
                e.preventDefault();
                emailInput.focus();
                return;
            }
            
            // Adicionar feedback visual
            const submitBtn = emailForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-check"></i>';
            submitBtn.style.backgroundColor = '#28a745';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.backgroundColor = '';
            }, 2000);
        });
    }

    // Adicionar animação de loading para imagens
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Definir opacidade inicial
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        // Se a imagem já foi carregada, mostrar imediatamente
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            // Adicionar evento de load
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
            
            // Adicionar evento de error para fallback
            img.addEventListener('error', () => {
                console.log('Erro ao carregar imagem:', img.src);
                img.style.opacity = '1'; // Mostrar mesmo com erro
            });
        }
    });

    // Smooth reveal para elementos quando entram na viewport
    const revealElements = document.querySelectorAll('.contato-item, .experiencia-card');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, { threshold: 0.3 });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(el);
    });
});

// Adicionar estilos CSS dinâmicos para animações
const style = document.createElement('style');
style.textContent = `
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
    
    .button.active {
        border-color: var(--color-accent);
        background-color: rgba(173, 23, 0, 0.1);
    }
    
    .contato-item:hover i,
    .experiencia-card:hover i {
        transform: scale(1.1);
        transition: transform 0.3s ease;
    }
`;
document.head.appendChild(style);