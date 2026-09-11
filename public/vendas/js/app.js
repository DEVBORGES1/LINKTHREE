document.addEventListener('DOMContentLoaded', () => {
    initializeHeader();
    initializeMobileMenu();
    initializeCountdown();
    initializeFAQ();
    initializeSocialProof();
});

// A animação de entrada saiu daqui: as classes .reveal estão direto no HTML e
// quem anima é /assets/js/reveal.js, compartilhado pelos seis sites. O observer
// antigo nunca chamava unobserve() e, num scroll rápido, os elementos pulados
// ficavam invisíveis para sempre.
//
// initializeCounters() também foi removida: era um IntersectionObserver sobre
// .stat-number e .metric-value cujo corpo só tinha o comentário
// "Simple animation logic could go here" - observava e não fazia nada.

function initializeHeader() {
    const header = document.querySelector('.header-modern');
    if (!header) return;

    // Agendado em requestAnimationFrame: sem isso, cada evento de scroll
    // (dezenas por segundo) mexia em classe e forçava recálculo de estilo.
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            header.classList.toggle('scrolled', window.scrollY > 50);
            ticking = false;
        });
    }, { passive: true });
}

function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!mobileToggle || !navMenu) return;

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');

        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// A rolagem suave das âncoras é feita pelo CSS (scroll-behavior e
// scroll-padding-top em /assets/css/base.css), que já respeita
// prefers-reduced-motion. O JS que fazia isso foi removido.

function initializeCountdown() {
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!hoursEl) return;

    // Set countdown for 2 hours, 45 minutes from now
    let totalSeconds = (2 * 3600) + (45 * 60); // 2h 45m

    const updateTimer = () => {
        if (totalSeconds <= 0) {
            totalSeconds = (2 * 3600) + (45 * 60);
        }

        totalSeconds--;

        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);

        hoursEl.textContent = h.toString().padStart(2, '0');
        minutesEl.textContent = m.toString().padStart(2, '0');
        secondsEl.textContent = s.toString().padStart(2, '0');
    };

    setInterval(updateTimer, 1000);
}

function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current
            item.classList.toggle('active');
        });
    });
}

function initializeSocialProof() {
    const names = [
        { name: "Ana Silva", location: "São Paulo, SP", plan: "Start" },
        { name: "Carlos Oliveira", location: "Rio de Janeiro, RJ", plan: "VIP" },
        { name: "Fernanda Costa", location: "Belo Horizonte, MG", plan: "Pro" },
        { name: "João Pedro", location: "Curitiba, PR", plan: "VIP" },
        { name: "Mariana Santos", location: "Salvador, BA", plan: "Pro" },
        { name: "Lucas Ferreira", location: "Porto Alegre, RS", plan: "Start" },
        { name: "Beatriz Lima", location: "Recife, PE", plan: "VIP" },
        { name: "Gabriel Souza", location: "Brasília, DF", plan: "Pro" },
        { name: "Juliana Alves", location: "Fortaleza, CE", plan: "VIP" },
        { name: "Rafael Mendes", location: "Manaus, AM", plan: "Pro" },
        { name: "Patricia Rocha", location: "Goiânia, GO", plan: "Start" },
        { name: "Rodrigo Santos", location: "Campinas, SP", plan: "Pro" }
    ];

    const notification = document.createElement('div');
    notification.className = 'social-proof-notification';
    notification.innerHTML = `
        <button class="close-notification">&times;</button>
        <img loading="lazy" decoding="async" src="images/depoimento-mariane.webp" width="320" height="322" alt="" class="notification-image">
        <div class="notification-content">
            <h4>Nova Compra Realizada!</h4>
            <p><strong id="sp-name">Ana Silva</strong> de <span id="sp-location">São Paulo</span> acabou de entrar no <strong id="sp-plan">Plano Start</strong></p>
            <span class="notification-time">agora mesmo</span>
        </div>
    `;

    document.body.appendChild(notification);

    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('visible');
    });

    const showNotification = () => {
        // Random data
        const person = names[Math.floor(Math.random() * names.length)];
        notification.querySelector('#sp-name').textContent = person.name;
        notification.querySelector('#sp-location').textContent = person.location;
        notification.querySelector('#sp-plan').textContent = `Plano ${person.plan}`;

        // Random image placeholder
        const images = ['images/avatar-generico.webp'];
        notification.querySelector('.notification-image').src = images[Math.floor(Math.random() * images.length)];

        notification.classList.add('visible');

        // Hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('visible');
        }, 5000);
    };

    // Agendamento em cadeia: cada notificação marca a próxima só depois de
    // aparecer. Antes havia um setInterval de 15s que, dentro dele, agendava um
    // setTimeout de 10 a 25s — como o atraso podia passar do intervalo, as
    // chamadas se acumulavam e as notificações começavam a se sobrepor. Não
    // havia clearInterval em lugar nenhum.
    let proxima = null;
    const agendar = (espera) => {
        proxima = setTimeout(() => {
            showNotification();
            agendar(Math.floor(Math.random() * 15000) + 10000);
        }, espera);
    };
    agendar(5000);

    // Para de agendar quando a aba sai de vista e retoma quando volta.
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearTimeout(proxima);
        } else {
            agendar(10000);
        }
    });
}