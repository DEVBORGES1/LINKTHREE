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
            autoOpenDelay: 10000, // 10 segundos
            trackingEnabled: true
        };
        
        this.init();
    }

    init() {
        this.loadChatWidget();
        this.setupLeadTracking();
        this.addFloatingButtons();
        this.setupFormIntegration();
    }

    // Carregar Chat Widget
    loadChatWidget() {
        const chatHTML = `
            <div class="advocacia-chat-widget">
                <button class="chat-toggle-btn" id="advocaciaChatToggle">
                    <i class="fab fa-whatsapp"></i>
                    <span class="chat-badge">1</span>
                </button>
                
                <div class="chat-container" id="advocaciaChatContainer">
                    <div class="chat-header">
                        <div class="chat-avatar">NB</div>
                        <div class="chat-info">
                            <h4>Dra. Nathiara Borges</h4>
                            <p>Advocacia Especializada</p>
                        </div>
                        <button class="close-chat" id="closeAdvocaciaChat">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="chat-messages" id="advocaciaChatMessages">
                        <div class="message bot">
                            <div class="message-avatar">NB</div>
                            <div class="message-content">
                                Olá! 👋 Sou a Dra. Nathiara Borges. Como posso ajudá-lo hoje?
                                <div class="message-time">Agora</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quick-actions">
                        <button class="quick-action" data-action="agendar">📅 Agendar Consulta</button>
                        <button class="quick-action" data-action="precos">💰 Preços</button>
                        <button class="quick-action" data-action="duvida">❓ Dúvida Jurídica</button>
                        <button class="quick-action" data-action="tea">🧩 Direito TEA</button>
                    </div>
                    
                    <div class="chat-input">
                        <input type="text" id="advocaciaMessageInput" placeholder="Digite sua mensagem...">
                        <button class="send-button" id="advocaciaSendButton">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Adicionar CSS
        this.addChatStyles();
        
        // Adicionar HTML ao body
        document.body.insertAdjacentHTML('beforeend', chatHTML);
        
        // Inicializar funcionalidades do chat
        this.initChatFunctionality();
    }

    addChatStyles() {
        const styles = `
            <style>
                .advocacia-chat-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                    font-family: 'Inter', sans-serif;
                }

                .chat-toggle-btn {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #25D366, #128C7E);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
                    transition: all 0.3s ease;
                    border: none;
                    color: white;
                    font-size: 24px;
                    position: relative;
                }

                .chat-toggle-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 25px rgba(37, 211, 102, 0.6);
                }

                .chat-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #b89765;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }

                .chat-container {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 350px;
                    height: 500px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                }

                .chat-container.active {
                    display: flex;
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .chat-header {
                    background: linear-gradient(135deg, #b89765, #9c7c4c);
                    color: white;
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .chat-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #b89765;
                    font-weight: bold;
                }

                .chat-info h4 {
                    margin: 0;
                    font-size: 16px;
                }

                .chat-info p {
                    margin: 0;
                    font-size: 12px;
                    opacity: 0.9;
                }

                .close-chat {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    margin-left: auto;
                }

                .chat-messages {
                    flex: 1;
                    padding: 15px;
                    overflow-y: auto;
                    background: #f8f9fa;
                }

                .message {
                    margin-bottom: 15px;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                }

                .message.user {
                    flex-direction: row-reverse;
                }

                .message-avatar {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: #b89765;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                }

                .message.user .message-avatar {
                    background: #25D366;
                }

                .message-content {
                    max-width: 70%;
                    padding: 10px 15px;
                    border-radius: 15px;
                    font-size: 14px;
                    line-height: 1.4;
                }

                .message.bot .message-content {
                    background: white;
                    color: #333;
                    border: 1px solid #e9ecef;
                }

                .message.user .message-content {
                    background: #25D366;
                    color: white;
                }

                .message-time {
                    font-size: 11px;
                    color: #6c757d;
                    margin-top: 5px;
                }

                .quick-actions {
                    padding: 10px 15px;
                    background: #f8f9fa;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .quick-action {
                    padding: 8px 12px;
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 20px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .quick-action:hover {
                    background: #b89765;
                    color: white;
                    border-color: #b89765;
                }

                .chat-input {
                    padding: 15px;
                    background: white;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .chat-input input {
                    flex: 1;
                    padding: 10px 15px;
                    border: 1px solid #e9ecef;
                    border-radius: 25px;
                    outline: none;
                    font-size: 14px;
                }

                .chat-input input:focus {
                    border-color: #b89765;
                }

                .send-button {
                    width: 40px;
                    height: 40px;
                    background: #b89765;
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.3s ease;
                }

                .send-button:hover {
                    background: #9c7c4c;
                }

                @media (max-width: 768px) {
                    .chat-container {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 120px);
                        bottom: 90px;
                        right: 20px;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    initChatFunctionality() {
        const toggle = document.getElementById('advocaciaChatToggle');
        const close = document.getElementById('closeAdvocaciaChat');
        const sendBtn = document.getElementById('advocaciaSendButton');
        const input = document.getElementById('advocaciaMessageInput');
        const quickActions = document.querySelectorAll('.quick-action');

        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.closeChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        quickActions.forEach(action => {
            action.addEventListener('click', () => {
                const actionType = action.getAttribute('data-action');
                this.handleQuickAction(actionType);
            });
        });

        // Auto-abrir após delay
        setTimeout(() => {
            if (this.config.autoOpenDelay > 0) {
                this.toggleChat();
            }
        }, this.config.autoOpenDelay);
    }

    toggleChat() {
        const container = document.getElementById('advocaciaChatContainer');
        const toggle = document.getElementById('advocaciaChatToggle');
        
        if (container.classList.contains('active')) {
            this.closeChat();
        } else {
            container.classList.add('active');
            toggle.querySelector('.chat-badge').style.display = 'none';
            document.getElementById('advocaciaMessageInput').focus();
            this.trackEvent('chat_opened');
        }
    }

    closeChat() {
        document.getElementById('advocaciaChatContainer').classList.remove('active');
        this.trackEvent('chat_closed');
    }

    sendMessage() {
        const input = document.getElementById('advocaciaMessageInput');
        const message = input.value.trim();
        
        if (message) {
            this.addMessage(message, 'user');
            input.value = '';
            this.handleBotResponse(message);
            this.trackEvent('message_sent', { message: message });
        }
    }

    handleQuickAction(actionType) {
        const messages = {
            'agendar': 'Quero agendar uma consulta',
            'precos': 'Preciso de informações sobre preços',
            'duvida': 'Tenho uma dúvida jurídica',
            'tea': 'Falar sobre Direito dos Autistas'
        };

        const message = messages[actionType];
        if (message) {
            this.addMessage(message, 'user');
            this.handleBotResponse(message);
            this.trackEvent('quick_action_used', { action: actionType });
        }
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('advocaciaChatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = sender === 'user' ? 'Você' : 'NB';
        const time = new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                ${content}
                <div class="message-time">${time}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    handleBotResponse(userMessage) {
        setTimeout(() => {
            const response = this.getBotResponse(userMessage.toLowerCase());
            this.addMessage(response, 'bot');
        }, 1000);
    }

    getBotResponse(message) {
        const responses = {
            'agendar': 'Perfeito! Para agendar uma consulta, você pode:\n\n📱 WhatsApp: https://wa.me/5549999894224\n📧 Email: nathiara.borges@outlook.com\n\nOu acessar nosso sistema de agendamento online. Qual prefere?',
            
            'preço': 'Nossos honorários variam conforme o tipo de serviço:\n\n• Consulta inicial: R$ 200\n• Direito Civil: A partir de R$ 500\n• Direito Penal: A partir de R$ 800\n• Direito TEA: Consulta gratuita\n\n💡 Oferecemos consulta gratuita para casos de Direito dos Autistas!',
            
            'dúvida': 'Estou aqui para esclarecer suas dúvidas jurídicas! 🧑‍⚖️\n\nPode me contar mais detalhes sobre sua situação? Quanto mais informações você fornecer, melhor poderei orientá-lo.',
            
            'autista': 'Excelente! Sou especializada em Direito dos Autistas (TEA). 🧩\n\nPosso ajudar com:\n• Direitos educacionais\n• Benefícios sociais\n• Inclusão no mercado de trabalho\n• Direitos à saúde\n\nTem alguma situação específica que gostaria de discutir?',
            
            'default': 'Para um atendimento mais personalizado, uma duvida que não foi esclarecida, recomendamos:\n\n1️⃣ Agendar uma consulta\n2️⃣ Enviar detalhes por WhatsApp\n3️⃣ Preencher nosso formulário online\n\nPara que possamos te ajudar melhor!!'
        };

        for (const [key, response] of Object.entries(responses)) {
            if (message.includes(key)) {
                return response;
            }
        }

        return responses.default;
    }

    // Adicionar botões flutuantes
    addFloatingButtons() {
        const buttonsHTML = `
            <div class="floating-buttons">
                <a href="https://wa.me/${this.config.whatsapp}" class="floating-btn whatsapp-btn" target="_blank">
                    <i class="fab fa-whatsapp"></i>
                    <span>WhatsApp</span>
                </a>
                <a href="/escritorio/agendamento.html" class="floating-btn agendamento-btn">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Agendar</span>
                </a>
                <a href="/escritorio/lead-capture.html" class="floating-btn consulta-btn">
                    <i class="fas fa-gavel"></i>
                    <span>Consulta Grátis</span>
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
        const forms = document.querySelectorAll('form');
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

        // Melhorar submit
        form.addEventListener('submit', (e) => {
            this.handleFormSubmit(e, form);
        });
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

    async handleFormSubmit(e, form) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validar todos os campos
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            alert('Por favor, preencha todos os campos obrigatórios corretamente.');
            return;
        }

        try {
            // Enviar dados
            await this.sendFormData(data, form);
            this.showSuccessMessage(form);
            this.trackEvent('form_submitted', { form: form.id || 'unknown' });
        } catch (error) {
            alert('Erro ao enviar formulário. Tente novamente.');
        }
    }

    async sendFormData(data, form) {
        // Simular envio (substituir por API real)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Salvar no localStorage
        const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
        submissions.push({
            ...data,
            timestamp: new Date().toISOString(),
            formId: form.id || 'unknown'
        });
        localStorage.setItem('form_submissions', JSON.stringify(submissions));

        // Enviar para WhatsApp
        const message = this.formatFormMessage(data);
        const whatsappUrl = `https://wa.me/${this.config.whatsapp}?text=${encodeURIComponent(message)}`;
        
        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');
    }

    formatFormMessage(data) {
        return `📋 *Nova Solicitação do Site*

${Object.entries(data).map(([key, value]) => 
    `• ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`
).join('\n')}

---
*Enviado através do site*`;
    }

    showSuccessMessage(form) {
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.innerHTML = `
            <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center;">
                <i class="fas fa-check-circle"></i>
                <strong>Sucesso!</strong> Sua mensagem foi enviada. Você será redirecionado para o WhatsApp.
            </div>
        `;
        
        form.appendChild(successDiv);
        
        // Remover após 5 segundos
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

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

        const event = {
            name: eventName,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            }
        };

        // Salvar no localStorage
        const events = JSON.parse(localStorage.getItem('tracking_events') || '[]');
        events.push(event);
        localStorage.setItem('tracking_events', JSON.stringify(events));

        // Enviar para analytics (Google Analytics, Facebook Pixel, etc.)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }

        if (typeof fbq !== 'undefined') {
            fbq('track', eventName, properties);
        }

        console.log('Event tracked:', event);
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
