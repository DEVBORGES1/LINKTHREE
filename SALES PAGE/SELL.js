document.addEventListener('DOMContentLoaded', () => {
    initializeAnimations();
    initializeHeader();
    initializeMobileMenu();
    initializeSmoothScroll();
    initializeCounters();
    initializeCountdown();
    initializeFAQ();
    initializeSocialProof();
});

function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once visible
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select elements to animate
    const animatedElements = document.querySelectorAll('.hero-text, .section-header, .qualification-card, .pricing-card, .result-card, .countdown-container, .faq-container');

    animatedElements.forEach((el, index) => {
        el.classList.add('reveal-on-scroll');
        // Add stagger effect for grids
        if (el.classList.contains('pricing-card') || el.classList.contains('result-card')) {
            el.style.transitionDelay = `${(index % 3) * 100}ms`;
        }
        observer.observe(el);
    });
}

function initializeHeader() {
    const header = document.querySelector('.header-modern');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
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

function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
}

function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number, .metric-value');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const value = target.innerText;
                // Simple animation logic could go here
                observer.unobserve(target);
            }
        });
    });

    counters.forEach(counter => observer.observe(counter));
}

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
        <img src="IMAGENS/Mariane.png" alt="User" class="notification-image">
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
        const images = ['IMAGENS/USER.png',];
        notification.querySelector('.notification-image').src = images[Math.floor(Math.random() * images.length)];

        notification.classList.add('visible');

        // Hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('visible');
        }, 5000);
    };

    // Initial delay 5s, then different intervals
    setTimeout(() => {
        showNotification();
        setInterval(() => {
            // Random interval between 10s and 25s
            const randomInterval = Math.floor(Math.random() * (25000 - 10000 + 1) + 10000);
            setTimeout(showNotification, randomInterval);
        }, 15000); // Base loop
    }, 5000);
}