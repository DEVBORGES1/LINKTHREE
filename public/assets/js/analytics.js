/**
 * Medição de desempenho e eventos, compartilhada pelos seis sites.
 *
 * Faz três coisas:
 *
 *   1. Carrega o Cloudflare Web Analytics (visitas, origem do tráfego, países e
 *      Core Web Vitals de campo). Sem cookie, então não exige banner de
 *      consentimento. Só carrega se houver token configurado abaixo.
 *
 *   2. Mede os Core Web Vitals aqui mesmo, para diagnóstico local. Abra
 *      qualquer página com ?debug=analytics e os números aparecem no console.
 *
 *   3. Registra os eventos que interessam ao negócio (clique no WhatsApp,
 *      envio de formulário, telefone, e-mail, profundidade de rolagem).
 *
 * LIMITAÇÃO IMPORTANTE: o Cloudflare Web Analytics NÃO aceita eventos
 * personalizados. Os eventos do item 3 hoje só aparecem no modo debug. Para
 * medir quantos cliques no WhatsApp viram contato é preciso uma ferramenta que
 * receba eventos — GA4 ou Plausible, por exemplo. Quando isso acontecer, o
 * único ponto a mexer é a função `enviarEvento` no fim deste arquivo.
 *
 * Substitui os dois `trackEvent` que existiam antes: um não fazia nada e o
 * outro empilhava eventos no localStorage que ninguém lia e que crescia sem
 * limite.
 */
(function () {
    'use strict';

    var CONFIG = {
        /**
         * Token do Cloudflare Web Analytics.
         * Onde pegar: dash.cloudflare.com > Analytics & Logs > Web Analytics >
         * Add a site > copie o valor de `token` do snippet que ele mostra.
         * Enquanto estiver vazio, nada é carregado (sem requisição quebrada).
         */
        cloudflareToken: '',

        /** Rolagens que valem registrar, em porcentagem da página. */
        marcosDeRolagem: [25, 50, 75, 100]
    };

    // Modo debug: ?debug=analytics na URL, ou uma vez via
    // localStorage.setItem('debug-analytics', '1') no console.
    var debug = false;
    try {
        debug = new URLSearchParams(location.search).get('debug') === 'analytics'
            || localStorage.getItem('debug-analytics') === '1';
    } catch (e) { /* localStorage bloqueado */ }

    function log(rotulo, dados) {
        if (debug) console.log('%c[medição] ' + rotulo, 'color:#c5a059;font-weight:bold', dados);
    }

    // ---------------------------------------------------------------
    // 1. Cloudflare Web Analytics
    // ---------------------------------------------------------------
    if (CONFIG.cloudflareToken) {
        var beacon = document.createElement('script');
        beacon.defer = true;
        beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
        beacon.setAttribute('data-cf-beacon', JSON.stringify({ token: CONFIG.cloudflareToken }));
        document.head.appendChild(beacon);
        log('Cloudflare Web Analytics', 'carregado');
    } else {
        log('Cloudflare Web Analytics', 'sem token — não carregado');
    }

    // ---------------------------------------------------------------
    // 2. Core Web Vitals
    // ---------------------------------------------------------------
    var vitais = {};

    function observar(tipo, callback, opcoes) {
        if (!('PerformanceObserver' in window)) return;
        try {
            var po = new PerformanceObserver(callback);
            po.observe(Object.assign({ type: tipo, buffered: true }, opcoes || {}));
            return po;
        } catch (e) {
            // Tipo não suportado neste navegador. Segue sem ele.
            return null;
        }
    }

    // LCP: o maior elemento visível. Vale o último valor antes da página sair
    // de vista — por isso só fechamos o número no pagehide.
    observar('largest-contentful-paint', function (lista) {
        var e = lista.getEntries().pop();
        if (e) {
            vitais.LCP = Math.round(e.startTime);
            vitais.LCPelemento = e.element ? e.element.tagName.toLowerCase() : null;
        }
    });

    // CLS: soma dos deslocamentos de layout que não vieram de interação.
    var cls = 0;
    observar('layout-shift', function (lista) {
        lista.getEntries().forEach(function (e) {
            if (!e.hadRecentInput) cls += e.value;
        });
        vitais.CLS = Number(cls.toFixed(4));
    });

    observar('paint', function (lista) {
        lista.getEntries().forEach(function (e) {
            if (e.name === 'first-contentful-paint') vitais.FCP = Math.round(e.startTime);
        });
    });

    // Aproximação do INP: a maior duração de interação observada. O INP oficial
    // usa um percentil das interações da sessão; aqui o pior caso já serve para
    // perceber travamento.
    observar('event', function (lista) {
        lista.getEntries().forEach(function (e) {
            if (!vitais.piorInteracao || e.duration > vitais.piorInteracao) {
                vitais.piorInteracao = Math.round(e.duration);
            }
        });
    }, { durationThreshold: 40 });

    var nav = performance.getEntriesByType('navigation')[0];
    if (nav) vitais.TTFB = Math.round(nav.responseStart);

    /** Referência de qualidade, para o debug dizer se está bom ou ruim. */
    var METAS = { LCP: [2500, 4000], CLS: [0.1, 0.25], piorInteracao: [200, 500], FCP: [1800, 3000], TTFB: [800, 1800] };

    function avaliar(nome, valor) {
        var m = METAS[nome];
        if (!m) return '';
        if (valor <= m[0]) return 'bom';
        if (valor <= m[1]) return 'precisa melhorar';
        return 'ruim';
    }

    function fecharMedicao() {
        var linhas = {};
        Object.keys(vitais).forEach(function (k) {
            if (typeof vitais[k] === 'number') {
                linhas[k] = vitais[k] + (METAS[k] ? '  (' + avaliar(k, vitais[k]) + ')' : '');
            } else {
                linhas[k] = vitais[k];
            }
        });
        log('Core Web Vitals', linhas);
    }

    addEventListener('pagehide', fecharMedicao, { once: true });
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') fecharMedicao();
    });

    // ---------------------------------------------------------------
    // 3. Eventos do negócio
    // ---------------------------------------------------------------

    /**
     * Ponto único de saída. Hoje só registra no debug, porque o Cloudflare não
     * recebe eventos personalizados. Para ligar a uma ferramenta, é aqui:
     *
     *   GA4:       gtag('event', nome, dados)
     *   Plausible: plausible(nome, { props: dados })
     */
    function enviarEvento(nome, dados) {
        log('evento: ' + nome, dados || {});
        if (typeof window.gtag === 'function') window.gtag('event', nome, dados || {});
        if (typeof window.plausible === 'function') window.plausible(nome, { props: dados || {} });
    }

    // Exposto para o resto do código chamar (o form-contato.js usa).
    window.medirEvento = enviarEvento;

    var pagina = location.pathname;

    // Cliques em contato, por delegação: pega inclusive o que for criado depois
    // pelo JS, como os botões flutuantes do escritório.
    document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        var href = a.getAttribute('href') || '';
        var onde = (a.className || '').toString().slice(0, 40) || a.closest('section,footer,header')?.className || '';

        if (/wa\.me|api\.whatsapp\.com/.test(href)) {
            enviarEvento('contato_whatsapp', { pagina: pagina, origem: onde });
        } else if (href.indexOf('tel:') === 0) {
            enviarEvento('clique_telefone', { pagina: pagina });
        } else if (href.indexOf('mailto:') === 0) {
            enviarEvento('clique_email', { pagina: pagina });
        }
    }, { passive: true });

    // Profundidade de rolagem: mostra quem realmente leu a página.
    var atingidos = {};
    var pendente = false;
    addEventListener('scroll', function () {
        if (pendente) return;
        pendente = true;
        requestAnimationFrame(function () {
            pendente = false;
            var altura = document.documentElement.scrollHeight - innerHeight;
            if (altura <= 0) return;
            var pct = (scrollY / altura) * 100;
            CONFIG.marcosDeRolagem.forEach(function (marco) {
                if (pct >= marco && !atingidos[marco]) {
                    atingidos[marco] = true;
                    enviarEvento('rolagem_' + marco, { pagina: pagina });
                }
            });
        });
    }, { passive: true });

    if (debug) {
        log('modo debug ativo', 'os eventos aparecem aqui. Para desligar: localStorage.removeItem("debug-analytics")');
    }
}());
