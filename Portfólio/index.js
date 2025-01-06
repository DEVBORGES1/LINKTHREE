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

const formContato = document.getElementById('formContato');

formContato.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const celular = document.getElementById('celular').value;
    const mensagem = document.getElementById('mensagem').value;

    try {
        const response = await fetch('http://localhost:3000/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome,
                email,
                celular,
                mensagem,
            }),
        });

        if (response.ok) {
            alert('Mensagem enviada com sucesso!');
            formContato.reset();
        } else {
            const errorMessage = await response.text();
            alert('Erro: ' + errorMessage);
        }
    } catch (err) {
        alert('Erro ao enviar o formulário: ' + err.message);
    }
});


