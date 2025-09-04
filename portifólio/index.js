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
        }
    );

    const hiddenElements = document.querySelectorAll(".hidden");
    hiddenElements.forEach((el) => observer.observe(el));

    // Efeito de parallax suave (apenas no topo)
    const parallaxElements = document.querySelectorAll('.img-topo-site'); // removida .img-sobre
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        parallaxElements.forEach(element => {
            const rate = scrolled * -0.5;
            element.style.transform = `translateY(${rate}px)`;
        });
    });

    // Efeito de typing no título principal
    const titleElement = document.querySelector('.topo-do-site h1');
    if (titleElement) {
        const text = titleElement.textContent;
        titleElement.textContent = '';
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                titleElement.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 150);
            }
        };
        setTimeout(typeWriter, 1500);
    }

    // Animação dos cards de especialidades
    const cards = document.querySelectorAll('.especialidades-box');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.3}s`;
    });
});

// Header scroll effect
let lastScrollY = window.scrollY;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Adicionar classe scrolled quando rolar
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
});

// Mostrar header no hover
header.addEventListener('mouseenter', () => {
    header.style.transform = 'translateY(0)';
});

header.addEventListener('mouseleave', () => {
    if (window.scrollY > lastScrollY && window.scrollY > 200) {
        header.style.transform = 'translateY(-100%)';
    }
});

// Smooth scroll para links de navegação
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

// Efeito de hover nos botões sociais
document.querySelectorAll('.btn-social button').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.1)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Animação de entrada para elementos do formulário
const formElements = document.querySelectorAll('form input, form textarea');
formElements.forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        element.style.transition = 'all 0.8s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, index * 150);
});
