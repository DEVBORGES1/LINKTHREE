/**
 * Landing de links.
 *
 * O que saiu daqui e por quê:
 *
 * - Observer de `.hidden`: ficou órfão quando a animação passou a se chamar
 *   `.reveal`. Agora é /assets/js/reveal.js, compartilhado pelos seis sites.
 * - Efeito de digitação no `.main-title`: começava 1 s depois do carregamento e
 *   digitava letra a letra. Como esse é o maior elemento da tela, o LCP só era
 *   contado no fim da digitação.
 * - Hover do `.cta-button` e dos `.benefit-card`: já existiam em CSS
 *   (`:hover`), e o `style.transform` inline sobrescrevia a regra.
 * - 20 partículas flutuantes com animação infinita: eram vermelho-escuro a 30%
 *   de opacidade sobre fundo escuro, praticamente invisíveis, e mantinham o
 *   navegador repintando sem parar.
 * - `setInterval(updateCounter, 1000)`: rodava para sempre procurando um
 *   `.counter` que não existe nesta página.
 * - `<style>` injetado em tempo de execução: as mesmas regras já estão em
 *   css/style.css.
 * - Rolagem suave por JS: hoje vem do CSS (base.css), respeitando
 *   prefers-reduced-motion.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Entrada em cascata dos cards de benefício.
    document.querySelectorAll('.benefit-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });

    // Parallax suave no banner de fundo, agendado em requestAnimationFrame para
    // não fazer trabalho a cada evento de scroll.
    const backgroundImage = document.querySelector('.backgroundImage');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (backgroundImage && !prefersReducedMotion) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                backgroundImage.style.transform = `translateY(${window.scrollY * -0.5}px)`;
                ticking = false;
            });
        }, { passive: true });
    }

    document.body.classList.add('loaded');
});
