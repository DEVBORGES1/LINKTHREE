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
