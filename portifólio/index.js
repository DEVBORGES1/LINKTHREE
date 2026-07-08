
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

    // --- Typewriter Effect ---
    const titleElement = document.querySelector('.topo-do-site h1');
    if (titleElement) {
        titleElement.innerHTML = ''; // Clear
        const textToType = "Advocacia especializada em Direito dos Autistas e das Pessoas com Deficiência";
        let i = 0;

        const typeWriter = () => {
            if (i < textToType.length) {
                titleElement.textContent += textToType.charAt(i);
                i++;
                setTimeout(typeWriter, 40);
            } else {
                titleElement.innerHTML = 'Advocacia especializada em <br><span>Direito dos Autistas</span> e das <span>Pessoas com Deficiência</span>';
            }
        };

        // Start after a delay
        setTimeout(typeWriter, 500);
    }


    // --- Intersection Observer for Animations ---
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                }
            });
        },
        {
            threshold: 0.1,
        }
    );

    const hiddenElements = document.querySelectorAll(".hidden");
    hiddenElements.forEach((el) => observer.observe(el));

    // --- Header Scroll Effect ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Smooth Scroll for anchors ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

});
