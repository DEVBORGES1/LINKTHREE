/**
 * Linktree - comportamentos especificos da pagina inicial.
 *
 * A animacao de entrada mora em /assets/js/reveal.js.
 * A rolagem suave e as ancoras que paravam embaixo do header sao resolvidas
 * no CSS (scroll-behavior + scroll-padding-top em base.css), nao aqui.
 */
(function () {
    'use strict';

    var EMAIL = 'nathiara.borges@outlook.com';

    var emailBtn = document.getElementById('btn-email-linktree');
    var feedback = document.getElementById('copy-feedback');
    if (!emailBtn) return;

    var resetTimer = null;

    function announce(message) {
        if (!feedback) return;
        feedback.textContent = message;
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(function () {
            feedback.textContent = '';
        }, 3000);
    }

    emailBtn.addEventListener('click', function (event) {
        // Sem clipboard (http, navegador antigo, permissao negada) o link
        // mailto: continua funcionando normalmente.
        if (!navigator.clipboard || !navigator.clipboard.writeText) return;

        event.preventDefault();
        navigator.clipboard.writeText(EMAIL).then(function () {
            emailBtn.classList.add('is-copied');
            announce('E-mail copiado: ' + EMAIL);
            window.setTimeout(function () {
                emailBtn.classList.remove('is-copied');
            }, 2000);
        }).catch(function () {
            // Nao conseguiu copiar: abre o cliente de e-mail como antes.
            window.location.href = 'mailto:' + EMAIL;
        });
    });
}());
