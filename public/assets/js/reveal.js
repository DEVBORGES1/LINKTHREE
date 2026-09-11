/**
 * Animacao de entrada compartilhada pelos 6 sites.
 *
 * Antes cada pagina tinha a sua copia disso, e o conteudo comecava com
 * opacity: 0 direto no CSS - se o JS demorasse ou falhasse, a pagina ficava
 * em branco. Agora o estado invisivel depende de <html class="js">, marcado
 * por um script inline no <head>, e este arquivo so cuida de revelar.
 *
 * Uso no HTML:  <section class="reveal"> ... </section>
 */
(function () {
    'use strict';

    var elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    function revealAll() {
        for (var i = 0; i < elements.length; i += 1) {
            elements[i].classList.add('is-visible');
        }
    }

    var prefersReducedMotion = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Sem suporte a IntersectionObserver, ou com movimento reduzido: mostra tudo.
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealAll();
        return;
    }

    var pending = Array.prototype.slice.call(elements);

    function show(el) {
        el.classList.add('is-visible');
        observer.unobserve(el);
        var at = pending.indexOf(el);
        if (at !== -1) pending.splice(at, 1);
    }

    var observer = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i += 1) {
            // Uma vez visivel, para de observar: nao ha por que reanimar.
            if (entries[i].isIntersecting) show(entries[i].target);
        }
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    for (var i = 0; i < elements.length; i += 1) {
        observer.observe(elements[i]);
    }

    // Rede de seguranca. O IntersectionObserver so avisa sobre o que cruza a
    // viewport; num salto grande (ancora, botao "voltar", rolagem rapida no
    // celular) os elementos do meio nunca chegam a cruzar e ficariam invisiveis
    // para sempre. Esta varredura mostra tudo que a rolagem ja deixou para tras.
    var ticking = false;
    function sweep() {
        for (var i = pending.length - 1; i >= 0; i -= 1) {
            if (pending[i].getBoundingClientRect().top < window.innerHeight) show(pending[i]);
        }
        if (!pending.length) {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        }
    }

    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            sweep();
            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Ao imprimir, nada pode estar invisivel.
    window.addEventListener('beforeprint', revealAll);
}());
