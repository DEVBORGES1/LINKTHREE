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
            threshold: 0.1, // Quando 10% do elemento está visível
        }
    );

    // Seleciona elementos com a classe 'hidden' para aplicar animação
    const hiddenElements = document.querySelectorAll(".hidden");
    hiddenElements.forEach((el) => observer.observe(el));
});

let lastScrollY = window.scrollY;
const header = document.querySelector("header");

// Controle de exibição da navbar durante o scroll
window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
        // Scroll para baixo - Esconde a navbar
        header.classList.add("hidden");
        header.classList.remove("show");
    } else {
        // Scroll para cima - Mostra a navbar
        header.classList.add("show");
        header.classList.remove("hidden");
    }

    lastScrollY = currentScrollY;
});

// Reaparece ao mover o mouse sobre a navbar
header.addEventListener("mouseenter", () => {
    header.classList.add("show");
    header.classList.remove("hidden");
});

// Esconde a navbar novamente ao mover o mouse para fora (se rolando para baixo)
header.addEventListener("mouseleave", () => {
    if (window.scrollY > lastScrollY) {
        header.classList.add("hidden");
        header.classList.remove("show");
    }
});
