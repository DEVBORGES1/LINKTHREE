var cont = 1;
document.getElementById('radio1').checked = true;

setInterval(() => {
    proximaImg();
}, 5000);

function proximaImg() {
    cont++;

    if (cont > 4) {  // Corrigindo para 4
        cont = 1;
    }

    document.getElementById('radio' + cont).checked = true;
}

document.addEventListener("DOMContentLoaded", () => {
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
});

let lastScrollY = window.scrollY;
const header = document.querySelector("header");


window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {

        header.classList.add("hidden");
        header.classList.remove("show");
    } else {

        header.classList.add("show");
        header.classList.remove("hidden");
    }

    lastScrollY = currentScrollY;
});


header.addEventListener("mouseenter", () => {
    header.classList.add("show");
    header.classList.remove("hidden");
});


header.addEventListener("mouseleave", () => {
    if (window.scrollY > lastScrollY) {
        header.classList.add("hidden");
        header.classList.remove("show");
    }
});

