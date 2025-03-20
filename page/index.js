document.addEventListener("DOMContentLoaded", () => {
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
});

// script.js

let lastScrollY = window.scrollY;
const header = document.querySelector('header');

// Detecta a rolagem da página
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
        // Rola para baixo: esconde o header
        header.classList.add('hidden');
        header.classList.remove('show');
    } else {
        // Rola para cima: mostra o header
        header.classList.add('show');
        header.classList.remove('hidden');
    }

    lastScrollY = currentScrollY;
});

// Mostra o header ao passar o mouse
header.addEventListener('mouseenter', () => {
    header.classList.add('show');
    header.classList.remove('hidden');
});

// Esconde o header ao sair com o mouse, somente se estiver rolando para baixo
header.addEventListener('mouseleave', () => {
    if (window.scrollY > lastScrollY) {
        header.classList.add('hidden');
        header.classList.remove('show');
    }
});