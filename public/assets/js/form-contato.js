/**
 * Envio dos formulários de contato, compartilhado pelos três sites.
 *
 * Antes cada página resolvia isso do seu jeito, e duas delas não resolviam:
 * a mentoria só fazia `setTimeout` e mostrava "enviada com sucesso" sem mandar
 * nada a lugar nenhum, e o escritório tinha dois listeners de submit no mesmo
 * formulário. Todo lead da mentoria era descartado em silêncio.
 *
 * Agora o envio é por e-mail, via FormSubmit (sem back-end). Se falhar, a
 * pessoa recebe o erro de verdade e um botão que abre o WhatsApp com a
 * mensagem já montada, para o contato não se perder.
 *
 * Uso no HTML:
 *
 *   <form data-form-contato
 *         data-email="destino@exemplo.com"
 *         data-assunto="Novo contato pelo site"
 *         data-whatsapp="5549999894224">
 *
 * ATENÇÃO: o FormSubmit exige confirmar o endereço uma vez. No primeiro envio
 * ele manda um e-mail de ativação para o destino; enquanto ninguém clicar no
 * link daquele e-mail, os envios seguintes não chegam.
 */
(function () {
    'use strict';

    var ENDPOINT = 'https://formsubmit.co/ajax/';

    function texto(form, nome) {
        var el = form.elements[nome];
        return el && el.value ? el.value.trim() : '';
    }

    /** Registra o resultado na camada de medição, se ela existir. */
    function medir(evento, form, extra) {
        if (typeof window.medirEvento !== 'function') return;
        var dados = { pagina: window.location.pathname, formulario: form.id || 'sem-id' };
        if (extra) Object.keys(extra).forEach(function (k) { dados[k] = extra[k]; });
        window.medirEvento(evento, dados);
    }

    /** Área de status dentro do formulário, criada uma vez. */
    function areaStatus(form) {
        var el = form.querySelector('.form-status');
        if (el) return el;
        el = document.createElement('div');
        el.className = 'form-status';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        form.appendChild(el);
        return el;
    }

    function limpar(el) {
        el.className = 'form-status';
        el.textContent = '';
    }

    function sucesso(el) {
        el.className = 'form-status is-sucesso';
        el.textContent = 'Mensagem enviada. Retornaremos em breve pelo e-mail ou telefone informado.';
    }

    /** Erro honesto + caminho alternativo pelo WhatsApp. */
    function erro(el, form, dados) {
        el.className = 'form-status is-erro';
        el.textContent = 'Não consegui enviar sua mensagem agora. ';

        var zap = form.dataset.whatsapp;
        if (!zap) {
            el.textContent += 'Tente novamente em instantes.';
            return;
        }

        var linhas = ['Olá! Vim pelo site.'];
        Object.keys(dados).forEach(function (k) {
            if (k.charAt(0) !== '_' && dados[k]) {
                linhas.push(k.charAt(0).toUpperCase() + k.slice(1) + ': ' + dados[k]);
            }
        });

        var a = document.createElement('a');
        a.className = 'form-status-acao';
        a.href = 'https://wa.me/' + zap + '?text=' + encodeURIComponent(linhas.join('\n'));
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = 'Enviar pelo WhatsApp';
        el.appendChild(a);
    }

    function enviar(form) {
        var status = areaStatus(form);
        var botao = form.querySelector('[type="submit"]');
        var rotulo = botao ? (botao.textContent || botao.value) : '';

        // Campo-armadilha: robô preenche, gente não. Se veio preenchido, finge
        // que deu certo e não envia nada.
        if (texto(form, '_honey')) {
            sucesso(status);
            form.reset();
            return;
        }

        var dados = {};
        Array.prototype.forEach.call(form.elements, function (el) {
            if (!el.name || el.name.charAt(0) === '_' || el.type === 'submit') return;
            dados[el.name] = el.value.trim();
        });
        dados._subject = form.dataset.assunto || 'Novo contato pelo site';
        dados._template = 'table';

        limpar(status);
        if (botao) {
            botao.disabled = true;
            if (botao.tagName === 'INPUT') botao.value = 'Enviando...';
            else botao.textContent = 'Enviando...';
        }

        function restaurar() {
            if (!botao) return;
            botao.disabled = false;
            if (botao.tagName === 'INPUT') botao.value = rotulo;
            else botao.textContent = rotulo;
        }

        fetch(ENDPOINT + form.dataset.email, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(dados)
        }).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        }).then(function (resposta) {
            // O FormSubmit responde 200 com success:"false" quando o endereço
            // ainda não foi confirmado. Isso é falha, não sucesso.
            if (String(resposta.success) === 'false') {
                // Falta de ativação é problema de configuração, não do visitante.
                // O aviso vai para o console para quem cuida do site perceber:
                // sem ativar, nenhum envio chega, e todo contato acaba caindo no
                // caminho alternativo do WhatsApp.
                if (/activat/i.test(resposta.message || '')) {
                    console.warn(
                        '[formulário] O FormSubmit ainda não foi ativado para '
                        + form.dataset.email + '.\n'
                        + 'Nenhum envio chega enquanto isso. Procure na caixa de entrada '
                        + '(e no spam) o e-mail do FormSubmit com o link "Activate Form" '
                        + 'e clique nele. É uma vez só.'
                    );
                }
                throw new Error(resposta.message || 'envio recusado');
            }
            sucesso(status);
            form.reset();
            restaurar();
            medir('formulario_enviado', form);
        }).catch(function (e) {
            erro(status, form, dados);
            restaurar();
            // A taxa de falha importa: sem isso não há como saber que leads
            // estão se perdendo por erro de envio.
            medir('formulario_falhou', form, { motivo: String(e && e.message || 'desconhecido').slice(0, 60) });
        });
    }

    document.querySelectorAll('form[data-form-contato]').forEach(function (form) {
        if (!form.dataset.email) return;

        // Armadilha anti-robô, invisível para quem enxerga e para leitor de tela.
        if (!form.elements._honey) {
            var armadilha = document.createElement('input');
            armadilha.type = 'text';
            armadilha.name = '_honey';
            armadilha.tabIndex = -1;
            armadilha.autocomplete = 'off';
            armadilha.setAttribute('aria-hidden', 'true');
            armadilha.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
            form.appendChild(armadilha);
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            // Deixa a validação nativa do navegador reclamar primeiro.
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            enviar(form);
        });
    });
}());
