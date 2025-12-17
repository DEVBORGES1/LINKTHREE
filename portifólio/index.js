
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
        // Backup original content including span
        const originalHTML = titleElement.innerHTML;
        const originalText = titleElement.textContent; // Simple text if needed

        // We want to type: "Advogada | Direito dos Autistas"
        // But keep styling for "Direito dos Autistas" ideally.
        // Simplified approach: Type just the text, then restore innerHTML or type with spans logic (complex).
        // Let's do a simple clean text typing for the main title part.

        // Better: Use a dedicated typed element so we don't mess strict HTML structure?
        // Let's try typing the whole text content.

        titleElement.innerHTML = ''; // Clear
        const textToType = "Advogada | Direito dos Autistas";
        let i = 0;

        const typeWriter = () => {
            if (i < textToType.length) {
                // If we hit the pipe, wrap next part in span? 
                // Too complex for simple script without breaking layout mid-type.
                // Let's just type plain text for the effect, then swap to formatted HTML at the end.

                titleElement.textContent += textToType.charAt(i);
                i++;
                setTimeout(typeWriter, 80);
            } else {
                // Restore formatted HTML to get colors back
                titleElement.innerHTML = 'Advogada <span>|</span> Direito dos Autistas';
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
