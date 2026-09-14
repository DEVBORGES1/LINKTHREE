/**
 * Sistema de Chat e Agendamento - Nathiara Borges Advocacia
 * Integração completa para conversão de leads
 */

class AdvocaciaIntegration {
    constructor() {
        this.config = {
            whatsapp: '5549999894224',
            email: 'nathiara.borges@outlook.com',
            apiEndpoint: '/api/leads', // Substituir por sua API real
            trackingEnabled: true
        };
        
        this.init();
    }

    init() {
        // No celular o chat cobre a tela inteira (a regra de <=768px o deixa com
        // calc(100vw - 40px)), abre sozinho depois de 10 segundos e ainda disputa
        // espaco com o botao flutuante do WhatsApp, que leva ao mesmo lugar.
        //
        // Nao e escondido com CSS: no celular ele nem chega a ser montado, entao
        // nao cria DOM nem arma o temporizador de abertura automatica.
        //
        // A largura e reavaliada quando muda -- girar o aparelho, dividir a tela
        // ou redimensionar a janela. Checar so no carregamento deixava o chat
        // montado em quem abriu a pagina larga e depois estreitou.
        this.chatSoNoDesktop = window.matchMedia('(min-width: 769px)');
        const aplicar = () => this.ajustarChat();
        aplicar();
        this.chatSoNoDesktop.addEventListener('change', aplicar);

        this.setupLeadTracking();
        this.addFloatingButtons();
        this.setupFormIntegration();
    }

    /** Monta o chat quando ha largura para ele, e o desmonta quando nao ha. */
    ajustarChat() {
        const existe = document.querySelector('.advocacia-chat-widget');
        if (this.chatSoNoDesktop.matches) {
            if (!existe) this.loadChatWidget();
            return;
        }
        if (existe) existe.remove();
    }

    // ------------------------------------------------------------------
    // Chat de atendimento
    //
    // O que ele é: um atendimento guiado do escritório. Entende o assunto do
    // que a pessoa escreve, responde só com o que o próprio site já afirma
    // (áreas de atuação, endereço, horário) e termina num botão que abre o
    // WhatsApp da Dra. Nathiara com o assunto e tudo o que a pessoa escreveu
    // já preenchidos. Quem envia a mensagem é a própria pessoa.
    //
    // O que ele não faz, de propósito:
    //   - não se apresenta como a Dra. Nathiara. A versão anterior abria com
    //     "Sou a Dra. Nathiara", pedia detalhes do caso e descartava tudo: a
    //     pessoa achava que tinha falado com a advogada;
    //   - não dá orientação jurídica nem promete resultado;
    //   - não informa valores de honorários (regras de publicidade da OAB);
    //   - não abre sozinho.
    // ------------------------------------------------------------------

    loadChatWidget() {
        this.topicos = this.topicos || this.montarTopicos();
        this.mensagensDigitadas = [];
        this.ultimoTopico = null;
        // O assunto do caso (penal, TEA, família, civil) fica guardado à parte:
        // uma pergunta de logística depois ("que horas abre?") não pode apagar
        // o que a pessoa realmente precisa resolver.
        this.topicoDoCaso = null;

        const chatHTML = `
            <div class="advocacia-chat-widget">
                <button type="button" class="chat-toggle-btn" id="advocaciaChatToggle"
                        aria-label="Abrir atendimento do escritório" aria-expanded="false"
                        aria-controls="advocaciaChatContainer">
                    <i class="fas fa-comments" aria-hidden="true"></i>
                    <span class="chat-badge" aria-hidden="true">1</span>
                </button>

                <div class="chat-container" id="advocaciaChatContainer" role="dialog"
                     aria-labelledby="advocaciaChatTitulo" hidden>
                    <div class="chat-header">
                        <div class="chat-avatar" aria-hidden="true">NB</div>
                        <div class="chat-info">
                            <h2 id="advocaciaChatTitulo">Nathiara Borges Advocacia</h2>
                            <p>Atendimento do escritório</p>
                        </div>
                        <button type="button" class="close-chat" id="closeAdvocaciaChat"
                                aria-label="Fechar atendimento">
                            <i class="fas fa-times" aria-hidden="true"></i>
                        </button>
                    </div>

                    <div class="chat-messages" id="advocaciaChatMessages"
                         role="log" aria-live="polite" aria-relevant="additions"></div>

                    <div class="quick-actions" role="group" aria-label="Assuntos">
                        <button type="button" class="quick-action" data-action="agendar"><span aria-hidden="true">📅</span> Agendar consulta</button>
                        <button type="button" class="quick-action" data-action="tea"><span aria-hidden="true">🧩</span> Autismo e PcD</button>
                        <button type="button" class="quick-action" data-action="familia"><span aria-hidden="true">👨‍👩‍👧</span> Família</button>
                        <button type="button" class="quick-action" data-action="areas"><span aria-hidden="true">⚖️</span> Outras áreas</button>
                    </div>

                    <form class="chat-input" id="advocaciaChatForm">
                        <input type="text" id="advocaciaMessageInput" maxlength="500"
                               autocomplete="off" placeholder="Escreva sua dúvida..."
                               aria-label="Escreva sua dúvida">
                        <button type="submit" class="send-button" aria-label="Enviar">
                            <i class="fas fa-paper-plane" aria-hidden="true"></i>
                        </button>
                    </form>
                </div>
            </div>
        `;

        this.addChatStyles();
        document.body.insertAdjacentHTML('beforeend', chatHTML);
        this.initChatFunctionality();
    }

    addChatStyles() {
        // O chat é montado e desmontado conforme a largura da tela, então esta
        // função pode ser chamada mais de uma vez. Sem isto, cada remontagem
        // empilhava outro <style> igual no head.
        if (document.getElementById('advocacia-chat-styles')) return;

        // Cores escolhidas pelo contraste. A versão anterior tinha texto branco
        // sobre dourado (2,8:1) e sobre o verde do WhatsApp (2,0:1), e o
        // subtítulo do cabeçalho herdava o cinza dos <p> da página. Tudo aqui
        // fica acima de 4,5:1. Os seletores começam por .advocacia-chat-widget
        // para as regras gerais da página (p, h2, ul) não vazarem para dentro.
        const styles = `
            <style id="advocacia-chat-styles">
                .advocacia-chat-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                    font-family: 'Inter', sans-serif;
                }

                .advocacia-chat-widget .chat-toggle-btn {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    border: none;
                    background: #1a365d;
                    color: #ffffff;
                    font-size: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    position: relative;
                    box-shadow: 0 4px 20px rgba(26, 54, 93, 0.35);
                    transition: transform 0.2s ease, background 0.2s ease;
                }

                .advocacia-chat-widget .chat-toggle-btn:hover {
                    background: #244b82;
                    transform: scale(1.06);
                }

                .advocacia-chat-widget .chat-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    background: #c5a059;
                    color: #1a365d;
                    font-size: 12px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .advocacia-chat-widget .chat-container {
                    position: absolute;
                    bottom: 76px;
                    right: 0;
                    width: 360px;
                    height: min(560px, calc(100vh - 120px));
                    background: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: chatSobe 0.22s ease;
                }

                /* display: flex acima venceria o [hidden] do navegador. */
                .advocacia-chat-widget .chat-container[hidden] {
                    display: none;
                }

                @keyframes chatSobe {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .advocacia-chat-widget .chat-header {
                    background: #1a365d;
                    color: #ffffff;
                    padding: 14px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .advocacia-chat-widget .chat-avatar,
                .advocacia-chat-widget .message-avatar {
                    border-radius: 50%;
                    background: #c5a059;
                    color: #1a365d;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .advocacia-chat-widget .chat-avatar {
                    width: 40px;
                    height: 40px;
                    font-size: 15px;
                }

                .advocacia-chat-widget .chat-info h2 {
                    margin: 0;
                    font-size: 16px;
                    line-height: 1.3;
                    color: #ffffff;
                }

                .advocacia-chat-widget .chat-info p {
                    margin: 0;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.85);
                }

                .advocacia-chat-widget .close-chat {
                    margin-left: auto;
                    width: 36px;
                    height: 36px;
                    border: none;
                    border-radius: 50%;
                    background: transparent;
                    color: #ffffff;
                    font-size: 18px;
                    cursor: pointer;
                }

                .advocacia-chat-widget .close-chat:hover {
                    background: rgba(255, 255, 255, 0.15);
                }

                .advocacia-chat-widget .chat-messages {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                    background: #f8f9fa;
                }

                .advocacia-chat-widget .message {
                    display: flex;
                    align-items: flex-end;
                    gap: 8px;
                    margin-bottom: 12px;
                }

                .advocacia-chat-widget .message.user {
                    justify-content: flex-end;
                }

                .advocacia-chat-widget .message-avatar {
                    width: 28px;
                    height: 28px;
                    font-size: 11px;
                }

                .advocacia-chat-widget .message-content {
                    max-width: 82%;
                    padding: 10px 14px;
                    border-radius: 14px;
                    font-size: 14px;
                    line-height: 1.45;
                    overflow-wrap: anywhere;
                }

                .advocacia-chat-widget .message.bot .message-content {
                    background: #ffffff;
                    color: #212529;
                    border: 1px solid #e9ecef;
                    border-bottom-left-radius: 4px;
                }

                .advocacia-chat-widget .message.user .message-content {
                    background: #1a365d;
                    color: #ffffff;
                    border-bottom-right-radius: 4px;
                }

                .advocacia-chat-widget .message-content p {
                    margin: 0 0 8px;
                    color: inherit;
                    font-size: inherit;
                }

                .advocacia-chat-widget .message-content p:last-of-type {
                    margin-bottom: 0;
                }

                .advocacia-chat-widget .message-content ul {
                    margin: 0 0 8px;
                    padding-left: 18px;
                }

                .advocacia-chat-widget .message-content li {
                    margin-bottom: 2px;
                }

                .advocacia-chat-widget .message-time {
                    margin-top: 6px;
                    font-size: 11px;
                    color: #6c757d;
                }

                .advocacia-chat-widget .message.user .message-time {
                    color: rgba(255, 255, 255, 0.8);
                }

                .advocacia-chat-widget .message-acoes {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-top: 10px;
                }

                .advocacia-chat-widget .chat-acao {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    min-height: 40px;
                    padding: 8px 12px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    text-decoration: none;
                    text-align: center;
                    transition: background 0.2s ease;
                }

                /* Verde-escuro do WhatsApp: o verde claro com texto branco dava
                   2,0:1 de contraste. */
                .advocacia-chat-widget .chat-acao-whatsapp {
                    background: #075e54;
                    color: #ffffff;
                }

                .advocacia-chat-widget .chat-acao-whatsapp:hover {
                    background: #064b43;
                }

                .advocacia-chat-widget .chat-acao-link {
                    background: #ffffff;
                    color: #1a365d;
                    border: 1px solid #1a365d;
                }

                .advocacia-chat-widget .chat-acao-link:hover {
                    background: #eef2f7;
                }

                .advocacia-chat-widget .digitando .message-content {
                    display: flex;
                    gap: 4px;
                    padding: 14px;
                }

                .advocacia-chat-widget .digitando .message-content span {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #adb5bd;
                    animation: chatPonto 1s infinite ease-in-out;
                }

                .advocacia-chat-widget .digitando .message-content span:nth-child(2) { animation-delay: 0.15s; }
                .advocacia-chat-widget .digitando .message-content span:nth-child(3) { animation-delay: 0.3s; }

                @keyframes chatPonto {
                    0%, 80%, 100% { opacity: 0.35; transform: translateY(0); }
                    40% { opacity: 1; transform: translateY(-3px); }
                }

                .advocacia-chat-widget .quick-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    padding: 10px 12px;
                    background: #ffffff;
                    border-top: 1px solid #e9ecef;
                }

                .advocacia-chat-widget .quick-action {
                    padding: 7px 11px;
                    border: 1px solid #dee2e6;
                    border-radius: 18px;
                    background: #ffffff;
                    color: #1a365d;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s ease, color 0.2s ease;
                }

                .advocacia-chat-widget .quick-action:hover {
                    background: #1a365d;
                    border-color: #1a365d;
                    color: #ffffff;
                }

                .advocacia-chat-widget .chat-input {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px;
                    background: #ffffff;
                    border-top: 1px solid #e9ecef;
                }

                .advocacia-chat-widget .chat-input input {
                    flex: 1;
                    min-width: 0;
                    padding: 10px 14px;
                    border: 1px solid #ced4da;
                    border-radius: 22px;
                    font-size: 14px;
                    color: #212529;
                }

                .advocacia-chat-widget .chat-input input:focus {
                    border-color: #1a365d;
                }

                .advocacia-chat-widget .send-button {
                    width: 42px;
                    height: 42px;
                    flex-shrink: 0;
                    border: none;
                    border-radius: 50%;
                    background: #1a365d;
                    color: #ffffff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .advocacia-chat-widget .send-button:hover {
                    background: #244b82;
                }

                @media (prefers-reduced-motion: reduce) {
                    .advocacia-chat-widget .chat-container,
                    .advocacia-chat-widget .digitando .message-content span {
                        animation: none;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    initChatFunctionality() {
        const toggle = document.getElementById('advocaciaChatToggle');
        const fechar = document.getElementById('closeAdvocaciaChat');
        const form = document.getElementById('advocaciaChatForm');
        const container = document.getElementById('advocaciaChatContainer');

        toggle.addEventListener('click', () => this.toggleChat());
        fechar.addEventListener('click', () => this.closeChat());

        // <form> em vez de ouvir a tecla Enter: funciona igual pelo teclado,
        // pelo botão e pelo "ir" do teclado do celular, e não dispara no meio de
        // uma composição de acento.
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        container.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeChat();
        });

        container.querySelectorAll('.quick-action').forEach((botao) => {
            botao.addEventListener('click', () => this.handleQuickAction(botao.dataset.action));
        });

        this.addMessage({
            partes: [
                'Olá! 👋 Este é o atendimento automático do escritório Nathiara Borges Advocacia.',
                'Escolha um assunto abaixo ou escreva sua dúvida. Eu explico como o escritório atua e te encaminho para a Dra. Nathiara pelo WhatsApp.',
            ],
        }, 'bot', { comHora: false });
    }

    toggleChat() {
        const container = document.getElementById('advocaciaChatContainer');
        if (container.hidden) {
            this.openChat();
        } else {
            this.closeChat();
        }
    }

    openChat() {
        const container = document.getElementById('advocaciaChatContainer');
        const toggle = document.getElementById('advocaciaChatToggle');

        container.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Fechar atendimento do escritório');
        const badge = toggle.querySelector('.chat-badge');
        if (badge) badge.remove();

        document.getElementById('advocaciaMessageInput').focus();
        this.trackEvent('chat_opened');
    }

    closeChat() {
        const container = document.getElementById('advocaciaChatContainer');
        if (!container || container.hidden) return;

        const toggle = document.getElementById('advocaciaChatToggle');
        container.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir atendimento do escritório');
        // Devolve o foco a quem abriu, para quem navega por teclado não se perder.
        toggle.focus();
        this.trackEvent('chat_closed');
    }

    sendMessage() {
        const input = document.getElementById('advocaciaMessageInput');
        const texto = input.value.trim();
        if (!texto) return;

        input.value = '';
        this.mensagensDigitadas.push(texto);
        this.addMessage({ partes: [texto] }, 'user');

        // Só o tamanho, nunca o conteúdo: o que a pessoa escreve aqui é assunto
        // pessoal dela.
        this.trackEvent('message_sent', { tamanho: texto.length });

        // Esta chamada é a resposta. Ela sumiu por engano em 10/09/2026, junto
        // com a troca da medição acima, e até 13/09 o chat mostrava a mensagem
        // da pessoa e não respondia nada.
        this.responder(this.identificarTopico(texto), texto);
    }

    handleQuickAction(id) {
        const topico = this.topicos.find((t) => t.id === id);
        if (!topico) return;

        this.addMessage({ partes: [topico.pergunta] }, 'user');
        this.trackEvent('quick_action_used', { action: id });
        this.responder(topico, '');
    }

    /** Mostra o "digitando" por um instante e então a resposta do tópico. */
    responder(topico, texto) {
        const lista = document.getElementById('advocaciaChatMessages');
        if (!lista) return;

        const digitando = document.createElement('div');
        digitando.className = 'message bot digitando';
        digitando.setAttribute('aria-hidden', 'true');
        digitando.innerHTML = '<div class="message-avatar">NB</div>'
            + '<div class="message-content"><span></span><span></span><span></span></div>';
        lista.appendChild(digitando);
        lista.scrollTop = lista.scrollHeight;

        setTimeout(() => {
            digitando.remove();
            // Saudação e agradecimento não têm assunto: não apagam o assunto de
            // uma pergunta anterior, que é o que vai para o WhatsApp.
            if (topico && topico.assunto) this.ultimoTopico = topico;
            if (topico && topico.caso) this.topicoDoCaso = topico;
            this.trackEvent('chat_topico', { topico: topico ? topico.id : 'nao_entendido' });

            let resposta = this.respostaPadrao();
            if (topico) {
                resposta = typeof topico.resposta === 'function'
                    ? topico.resposta(texto)
                    : topico.resposta;
            }
            this.addMessage(resposta, 'bot');
        }, 650);
    }

    /**
     * Escolhe o tópico com mais termos encontrados na mensagem.
     *
     * Cada termo vale 1 ponto, ou o peso indicado em [regex, peso] para
     * expressões mais específicas ("horário de atendimento" tem de vencer
     * "horário" + "atendimento", que apontariam para agendamento). Em empate,
     * vence o que vem antes na lista.
     */
    identificarTopico(texto) {
        const alvo = this.normalizar(texto);
        let melhor = null;
        let melhorPontos = 0;

        for (const topico of this.topicos) {
            let pontos = 0;
            for (const termo of topico.termos) {
                const [re, peso] = Array.isArray(termo) ? termo : [termo, 1];
                if (re.test(alvo)) pontos += peso;
            }
            if (pontos > melhorPontos) {
                melhor = topico;
                melhorPontos = pontos;
            }
        }
        return melhor;
    }

    /**
     * Minúsculas, sem acento e sem pontuação: "Pensão?" vira "pensao". A versão
     * anterior comparava o texto cru com palavras acentuadas, e quase toda
     * pergunta digitada caía na resposta genérica.
     */
    normalizar(texto) {
        return String(texto || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }

    addMessage(conteudo, autor, opcoes = {}) {
        const lista = document.getElementById('advocaciaChatMessages');
        // O chat pode ter sido desmontado enquanto a resposta estava a caminho
        // (a tela estreitou).
        if (!lista) return;

        const mensagem = document.createElement('div');
        mensagem.className = `message ${autor}`;

        if (autor === 'bot') {
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.setAttribute('aria-hidden', 'true');
            avatar.textContent = 'NB';
            mensagem.appendChild(avatar);
        }

        const balao = document.createElement('div');
        balao.className = 'message-content';

        // Tudo por textContent: o que a pessoa digita nunca vira HTML. A versão
        // anterior usava innerHTML, e um "<img onerror=...>" digitado executava.
        for (const parte of conteudo.partes || []) {
            if (typeof parte === 'string') {
                const p = document.createElement('p');
                p.textContent = parte;
                balao.appendChild(p);
            } else if (parte && parte.lista) {
                const ul = document.createElement('ul');
                for (const item of parte.lista) {
                    const li = document.createElement('li');
                    li.textContent = item;
                    ul.appendChild(li);
                }
                balao.appendChild(ul);
            }
        }

        if (conteudo.acoes && conteudo.acoes.length) {
            const acoes = document.createElement('div');
            acoes.className = 'message-acoes';
            for (const acao of conteudo.acoes) acoes.appendChild(this.criarAcao(acao));
            balao.appendChild(acoes);
        }

        if (opcoes.comHora !== false) {
            const hora = document.createElement('div');
            hora.className = 'message-time';
            hora.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            balao.appendChild(hora);
        }

        mensagem.appendChild(balao);
        lista.appendChild(mensagem);
        lista.scrollTop = lista.scrollHeight;
    }

    criarAcao(acao) {
        const a = document.createElement('a');
        a.className = `chat-acao chat-acao-${acao.tipo === 'whatsapp' ? 'whatsapp' : 'link'}`;

        if (acao.icone) {
            const icone = document.createElement('i');
            icone.className = acao.icone;
            icone.setAttribute('aria-hidden', 'true');
            a.appendChild(icone);
        }
        a.appendChild(document.createTextNode(acao.rotulo));

        if (acao.tipo === 'whatsapp') {
            a.target = '_blank';
            a.rel = 'noopener';
            // O texto é montado de novo na hora de usar o link: se a pessoa
            // escreveu mais alguma coisa depois desta resposta, vai junto.
            const atualizar = () => { a.href = this.linkWhatsApp(); };
            atualizar();
            a.addEventListener('focus', atualizar);
            a.addEventListener('mouseenter', atualizar);
            a.addEventListener('click', () => {
                atualizar();
                this.trackEvent('chat_whatsapp', {
                    topico: this.ultimoTopico ? this.ultimoTopico.id : 'nao_entendido',
                });
            });
        } else {
            a.href = acao.href;
            if (acao.novaAba) {
                a.target = '_blank';
                a.rel = 'noopener';
            }
        }
        return a;
    }

    /** wa.me com o assunto e tudo o que a pessoa escreveu no chat. */
    linkWhatsApp() {
        const linhas = ['Olá, Dra. Nathiara! Vim pelo site do escritório.'];
        const assunto = this.topicoDoCaso || this.ultimoTopico;
        if (assunto) linhas.push(`Assunto: ${assunto.assunto}`);
        if (this.mensagensDigitadas.length) {
            linhas.push('');
            linhas.push(...this.mensagensDigitadas);
        }

        let texto = linhas.join('\n');
        // Links muito longos são cortados por alguns aparelhos.
        if (texto.length > 1500) texto = `${texto.slice(0, 1500)}…`;
        return `https://wa.me/${this.config.whatsapp}?text=${encodeURIComponent(texto)}`;
    }

    respostaPadrao() {
        return {
            partes: [
                'Não tenho uma resposta pronta para isso, mas a Dra. Nathiara pode te orientar.',
                'Toque abaixo para enviar sua mensagem a ela pelo WhatsApp. O que você escreveu aqui já vai junto.',
            ],
            acoes: [{ tipo: 'whatsapp', rotulo: 'Enviar pelo WhatsApp', icone: 'fab fa-whatsapp' }],
        };
    }

    /**
     * O que o chat sabe responder. As informações são as mesmas que a página
     * do escritório já publica (áreas de atuação, endereço, horário): o chat
     * não afirma nada que o site não afirme.
     *
     * A ordem importa só em empate de pontos: áreas de atuação vêm antes de
     * agendamento, para "quero agendar sobre pensão" levar o assunto "Família"
     * ao WhatsApp. Saudação e agradecimento ficam por último.
     */
    montarTopicos() {
        const whatsapp = { tipo: 'whatsapp', rotulo: 'Falar com a Dra. Nathiara', icone: 'fab fa-whatsapp' };
        const endereco = 'R. Aloísio P. Kroeff, São Francisco, Videira - SC, 89565-158';
        const telefone = { tipo: 'link', rotulo: 'Ligar: (49) 99989-4224', href: 'tel:+5549999894224', icone: 'fas fa-phone' };

        return [
            {
                id: 'penal',
                caso: true,
                assunto: 'Direito Penal',
                termos: [
                    [/\bpenal\b/, 2], [/\bcriminal/, 2], /\bcrimes?\b/, [/\bdelegacia/, 2],
                    /\bboletim de ocorrencia\b/, [/\bpres[oa]s?\b/, 2], [/\bprisao/, 2],
                    [/\bflagrante/, 2], [/\binquerito/, 2], [/\bcustodia/, 2], /\bpolicia/,
                    /\bintimac/, /\bdenuncia/, /\bacusad/,
                ],
                resposta: (texto) => {
                    const urgente = /\b(pres[oa]s?|prisao|flagrante|custodia|urgente)\b/
                        .test(this.normalizar(texto));
                    return {
                        partes: [
                            ...(urgente ? ['Se é urgente, por exemplo alguém foi preso agora, não espere: ligue ou chame no WhatsApp.'] : []),
                            'Em Direito Penal, o escritório atua em:',
                            { lista: ['Acompanhamento de inquéritos policiais', 'Audiências de custódia', 'Defesa em processos criminais'] },
                        ],
                        acoes: urgente ? [telefone, whatsapp] : [whatsapp],
                    };
                },
            },
            {
                id: 'tea',
                caso: true,
                assunto: 'Autismo e PcD (TEA)',
                pergunta: 'Quero falar sobre direitos de pessoas com autismo ou deficiência',
                termos: [
                    [/\bautis/, 2], [/\btea\b/, 2], [/\bpcd\b/, 2], [/\bdeficien/, 2], [/\bbpc\b/, 2],
                    [/\bloas\b/, 2], /\blaudo/, /\bneurodiver/, /\binclusao/, /\bterapia/, /\baba\b/,
                    /\bmediador/, /\bplano de saude\b/, /\bmedicamento/, /\bescola/, /\bsus\b/,
                    /\bacessibilidade/,
                ],
                resposta: {
                    partes: [
                        'O escritório atua na garantia de direitos de pessoas com autismo (TEA) e com deficiência, como:',
                        { lista: [
                            'Tratamento multidisciplinar pelo plano de saúde ou pelo SUS',
                            'Fornecimento de medicamentos de alto custo',
                            'Benefício de Prestação Continuada (BPC/LOAS)',
                            'Inclusão escolar e acessibilidade',
                        ] },
                        'Cada situação tem detalhes próprios. Conte para a Dra. Nathiara o que está acontecendo.',
                    ],
                    acoes: [whatsapp],
                },
            },
            {
                id: 'familia',
                caso: true,
                assunto: 'Família e Sucessões',
                pergunta: 'Tenho uma questão de família',
                termos: [
                    [/\bpensao/, 2], /\balimentos\b/, [/\bdivorci/, 2], /\bsepara/, [/\bguarda\b/, 2],
                    /\bvisitas?\b/, /\buniao estavel\b/, [/\binventario/, 2], /\bheranca/, /\bpartilha/,
                    /\btestamento/, /\bsucesso(es|rio)\b/, /\bfamilia/, /\bcasamento/, /\bfilhos?\b/,
                    /\bex (marido|mulher|esposa|companheir)/,
                ],
                resposta: {
                    partes: [
                        'Em Família e Sucessões, o escritório atua em:',
                        { lista: [
                            'Divórcio consensual ou litigioso',
                            'Guarda e regulamentação de visitas',
                            'Pensão alimentícia',
                            'Partilha de bens, inventário e planejamento sucessório',
                        ] },
                        'São momentos delicados, e o atendimento é feito com cuidado e sigilo.',
                    ],
                    acoes: [whatsapp],
                },
            },
            {
                id: 'civil',
                caso: true,
                assunto: 'Direito Civil e Contratos',
                termos: [
                    [/\bcontrato/, 2], [/\bconsumidor/, 2], [/\bindeniza/, 2], /\bdanos?\b/,
                    /\bmora(l|is)\b/, /\bcobranca/, /\bdivida/, /\baluguel/, /\bdespejo/, /\bcompr/,
                    /\bproduto/, /\bdefeito/, /\bprocon\b/, /\bnegativad/, /\bserasa\b/, /\bgolpe/,
                    /\bcivil\b/,
                ],
                resposta: {
                    partes: [
                        'Em Direito Civil e Contratos, o escritório atua em:',
                        { lista: [
                            'Elaboração e análise de contratos',
                            'Indenizações por danos morais e materiais',
                            'Direito do Consumidor',
                        ] },
                        'Se você tiver documentos, como contrato, notas ou conversas, eles ajudam na primeira conversa.',
                    ],
                    acoes: [whatsapp],
                },
            },
            {
                id: 'honorarios',
                assunto: 'Honorários',
                termos: [
                    /\bprecos?\b/, /\bvalor/, /\bcusta\b/, /\bcusto\b/, [/\bquanto (custa|cobra|fica|sai|e)\b/, 2],
                    [/\bhonorario/, 2], /\bcobra/, /\bpagar\b/, /\bpagamento/, /\borcamento/,
                    /\bgratis\b/, /\bgratuit/, /\bparcel/,
                ],
                resposta: {
                    partes: [
                        'Os honorários dependem de cada caso: o tipo de ação, a complexidade e as etapas envolvidas.',
                        'Por isso a Dra. Nathiara primeiro entende a sua situação e, a partir dela, explica os valores e as formas de pagamento.',
                    ],
                    acoes: [whatsapp],
                },
            },
            {
                id: 'agendar',
                assunto: 'Agendar consulta',
                pergunta: 'Quero agendar uma consulta',
                termos: [/\bagend/, /\bmarcar\b/, /\bconsultas?\b/, /\breuniao\b/, /\bhorario\b/, /\bconversar\b/, /\batendimento\b/],
                resposta: {
                    partes: [
                        'Para agendar, o caminho mais rápido é falar direto com a Dra. Nathiara pelo WhatsApp: ela confirma o melhor dia e horário.',
                        'O atendimento pode ser presencial, no escritório em Videira-SC, ou online, para qualquer lugar do Brasil.',
                    ],
                    acoes: [
                        { ...whatsapp, rotulo: 'Agendar pelo WhatsApp' },
                        { tipo: 'link', rotulo: 'Escolher data na página de agendamento', href: 'agendamento.html', icone: 'fas fa-calendar-alt' },
                    ],
                },
            },
            {
                id: 'horario',
                assunto: 'Horário de atendimento',
                termos: [
                    [/\bhorario de (atendimento|funcionamento)\b/, 4], [/\bque horas\b/, 3],
                    [/\b(abre|abrem|fecha|fecham)\b/, 2], /\bsabado/, /\bdomingo/, /\bferiado/, /\bexpediente/,
                ],
                resposta: {
                    partes: [
                        'Horário de atendimento do escritório:',
                        { lista: ['Segunda a sexta: 8h às 18h', 'Sábado: 8h às 12h'] },
                        'Pelo WhatsApp você pode deixar sua mensagem a qualquer hora.',
                    ],
                    acoes: [whatsapp],
                },
            },
            {
                id: 'endereco',
                assunto: 'Endereço do escritório',
                termos: [
                    [/\bendereco/, 3], [/\bonde (fica|e|voces ficam|o escritorio)\b/, 3], [/\blocaliza/, 2],
                    [/\bcomo cheg/, 3], /\bmapa\b/, /\bvideira\b/, /\bpresencial/,
                ],
                resposta: {
                    partes: [
                        'O escritório fica em:',
                        endereco,
                        'Também há atendimento online, para qualquer lugar do Brasil.',
                    ],
                    acoes: [
                        {
                            tipo: 'link',
                            rotulo: 'Abrir no mapa',
                            href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`,
                            novaAba: true,
                            icone: 'fas fa-map-marker-alt',
                        },
                        whatsapp,
                    ],
                },
            },
            {
                id: 'online',
                assunto: 'Atendimento online',
                termos: [
                    [/\bonline\b/, 3], [/\bon line\b/, 3], [/\ba distancia\b/, 3], [/\boutra cidade\b/, 3],
                    [/\boutro estado\b/, 3], /\bvirtual/, [/\bvideo ?chamada/, 3], /\bremot/,
                ],
                resposta: {
                    partes: [
                        'Sim. Além do atendimento presencial em Videira-SC, o escritório atende de forma 100% online, para clientes de qualquer lugar do Brasil.',
                    ],
                    acoes: [whatsapp],
                },
            },
            {
                id: 'contato',
                assunto: 'Contato',
                termos: [
                    [/\btelefone/, 3], /\bwhats/, /\bzap\b/, [/\be ?mail\b/, 2], [/\bcontato/, 2],
                    [/\bfalar com (a )?(dra|doutora|advogada|nathiara)\b/, 3], /\bligar\b/, /\bnumero\b/,
                ],
                resposta: {
                    partes: [
                        'Você pode falar com o escritório por:',
                        { lista: ['WhatsApp e telefone: (49) 99989-4224', 'E-mail: nathiara.borges@outlook.com'] },
                    ],
                    acoes: [whatsapp, { ...telefone, rotulo: 'Ligar' }],
                },
            },
            {
                id: 'areas',
                assunto: 'Áreas de atuação',
                pergunta: 'Em quais áreas o escritório atua?',
                termos: [
                    [/\bareas?\b/, 2], /\batua/, /\bespecialidade/, /\bservicos?\b/,
                    [/\bo que (voce|voces|o escritorio) faz/, 2], /\badvogad/,
                ],
                resposta: {
                    partes: [
                        'O escritório atua principalmente em:',
                        { lista: ['Autismo e PcD (TEA)', 'Família e Sucessões', 'Direito Civil e Contratos', 'Direito Penal'] },
                        'Se o seu assunto não está na lista, pergunte mesmo assim: a Dra. Nathiara diz se o escritório pode ajudar.',
                    ],
                    acoes: [whatsapp],
                },
            },
            {
                id: 'saudacao',
                assunto: null,
                termos: [/^(oi|ola|opa|bom dia|boa tarde|boa noite|e ai|hey|hello)\b/],
                resposta: {
                    partes: ['Olá! Como posso ajudar? Escolha um assunto abaixo ou escreva sua dúvida.'],
                },
            },
            {
                id: 'agradecimento',
                assunto: null,
                termos: [/\bobrigad/, /\bvaleu\b/, /\bagradec/],
                resposta: {
                    partes: ['Por nada! Quando quiser, é só chamar a Dra. Nathiara no WhatsApp.'],
                    acoes: [whatsapp],
                },
            },
        ];
    }

    // Adicionar botões flutuantes
    addFloatingButtons() {
        const buttonsHTML = `
            <div class="floating-buttons">
                <a href="https://wa.me/${this.config.whatsapp}" class="floating-btn whatsapp-btn" target="_blank">
                    <i class="fab fa-whatsapp"></i>
                    <span>WhatsApp</span>
                </a>
                <a href="agendamento.html" class="floating-btn agendamento-btn">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Agendar</span>
                </a>
            </div>
        `;

        const buttonsStyles = `
            <style>
                .floating-buttons {
                    position: fixed;
                    left: 20px;
                    bottom: 20px;
                    z-index: 999;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .floating-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 20px;
                    background: white;
                    color: #333;
                    text-decoration: none;
                    border-radius: 25px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    font-weight: 500;
                    font-size: 14px;
                }

                .floating-btn:hover {
                    transform: translateX(5px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                }

                .whatsapp-btn {
                    background: #25D366;
                    color: white;
                }

                .agendamento-btn {
                    background: #b89765;
                    color: white;
                }

                .consulta-btn {
                    background: #f39c12;
                    color: white;
                }

                @media (max-width: 768px) {
                    .floating-buttons {
                        left: 10px;
                        bottom: 10px;
                    }
                    
                    .floating-btn span {
                        display: none;
                    }
                    
                    .floating-btn {
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        justify-content: center;
                        padding: 0;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', buttonsStyles);
        document.body.insertAdjacentHTML('beforeend', buttonsHTML);
    }

    // Integração com formulários existentes
    setupFormIntegration() {
        // Melhorar formulários existentes
        // O campo do chat também é um <form>, mas não é formulário de contato.
        const forms = document.querySelectorAll('form:not(#advocaciaChatForm)');
        forms.forEach(form => {
            this.enhanceForm(form);
        });
    }

    enhanceForm(form) {
        // Adicionar validação em tempo real
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });

        // O submit é do /assets/js/form-contato.js, compartilhado pelos três
        // formulários do projeto. O handler que existia aqui era o segundo
        // ligado ao mesmo formulário: um mostrava sucesso simulado e o outro
        // abria o WhatsApp, os dois ao mesmo tempo.
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;

        if (field.hasAttribute('required') && !value) {
            isValid = false;
        }

        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
        }

        if (field.type === 'tel' && value) {
            const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
            isValid = phoneRegex.test(value);
        }

        // Adicionar classes de validação
        field.classList.toggle('valid', isValid);
        field.classList.toggle('invalid', !isValid);

        return isValid;
    }

    // handleFormSubmit, sendFormData, formatFormMessage e showSuccessMessage
    // foram removidas: o envio dos formularios agora e do modulo compartilhado
    // /assets/js/form-contato.js, que manda por e-mail e oferece o WhatsApp se
    // falhar. O apiEndpoint que essa classe declarava nunca existiu.

    // Tracking de eventos
    setupLeadTracking() {
        if (!this.config.trackingEnabled) return;

        // Rastrear visualizações de página
        this.trackEvent('page_viewed', {
            page: window.location.pathname,
            referrer: document.referrer
        });

        // Rastrear cliques em links importantes
        const importantLinks = document.querySelectorAll('a[href*="whatsapp"], a[href*="agendamento"], a[href*="contato"]');
        importantLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('important_link_clicked', {
                    url: link.href,
                    text: link.textContent.trim()
                });
            });
        });
    }

    trackEvent(eventName, properties = {}) {
        if (!this.config.trackingEnabled) return;

        // Encaminha para /assets/js/analytics.js, que concentra a medição do
        // projeto. Antes isto empilhava cada evento no localStorage, com
        // userAgent e URL completa, numa lista que ninguém lia e que crescia
        // sem limite até estourar a cota do navegador.
        if (typeof window.medirEvento === 'function') {
            window.medirEvento(eventName, { ...properties, pagina: window.location.pathname });
        }

        // O encaminhamento para gtag e fbq mora dentro de analytics.js, para
        // não haver dois lugares mandando o mesmo evento.
    }

    // Métodos utilitários
    getLeads() {
        return JSON.parse(localStorage.getItem('leads') || '[]');
    }

    getFormSubmissions() {
        return JSON.parse(localStorage.getItem('form_submissions') || '[]');
    }

    getTrackingEvents() {
        return JSON.parse(localStorage.getItem('tracking_events') || '[]');
    }

    exportData() {
        return {
            leads: this.getLeads(),
            formSubmissions: this.getFormSubmissions(),
            trackingEvents: this.getTrackingEvents(),
            exportedAt: new Date().toISOString()
        };
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.advocaciaIntegration = new AdvocaciaIntegration();
});

// Exportar para uso global
window.AdvocaciaIntegration = AdvocaciaIntegration;
