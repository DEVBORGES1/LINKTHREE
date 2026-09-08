document.addEventListener("DOMContentLoaded", () => {

    // --- Mobile Menu Logic ---
    let btnMenu = document.getElementById('btn-menu');
    let menu = document.getElementById('menu-mobile');
    let overlay = document.getElementById('overlay-menu');
    let btnFechar = document.getElementById('btn-fechar');

    function openMenu() {
        menu.classList.add('abrir-menu');
        overlay.style.display = 'block';
    }

    function closeMenu() {
        menu.classList.remove('abrir-menu');
        overlay.style.display = 'none';
    }

    if (btnMenu) btnMenu.addEventListener('click', openMenu);
    if (btnFechar) btnFechar.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);

    document.querySelectorAll('.menu-mobile nav ul li a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // --- FAQ Logic ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            });

            // If it wasn't active before, open it
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // O efeito de máquina de escrever no <h1> foi removido: ele apagava o
    // título, digitava uma letra a cada 40 ms e só então devolvia o HTML com os
    // <span> destacados. Isso empurrava o LCP para depois do fim da digitação e
    // deixava o <h1> vazio para o Google e para leitores de tela.

    // A animação de entrada é a compartilhada em /assets/js/reveal.js
    // (classe .reveal). O observer que existia aqui procurava por .hidden e
    // ficou órfão quando a classe foi renomeada.

    // --- Header Scroll Effect ---
    let ticking = false;
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        // Sem o requestAnimationFrame, isto media o scroll a cada evento -
        // dezenas de vezes por segundo, forçando recálculo de estilo.
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            header.classList.toggle('scrolled', window.scrollY > 50);
            ticking = false;
        });
    }, { passive: true });

    // A rolagem suave das âncoras é feita pelo CSS (scroll-behavior e
    // scroll-padding-top em /assets/css/base.css), que já respeita
    // prefers-reduced-motion. O JS que fazia isso foi removido.

});
