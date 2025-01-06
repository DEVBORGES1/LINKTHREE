const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();


app.use(express.json());
app.use(cors());


const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'pedrohenriqueherculanodias@gmail.com', 
        pass: 'rttt hfov lljg mqvb', 
    },
});


app.post('/send-email', (req, res) => {
    const { nome, email, celular, mensagem } = req.body;

    const subject = `Nova mensagem de contato de ${nome}`;
    const text = `
        Nome: ${nome}
        Email para resposta: ${email}
        Celular: ${celular}
        Mensagem: ${mensagem}
    `;
    const html = `
        <h3>Nova mensagem de contato</h3>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email para resposta:</strong> ${email}</p>
        <p><strong>Celular:</strong> ${celular}</p>
        <p><strong>Mensagem:</strong><br>${mensagem}</p>
    `;

    transport.sendMail({
        from: 'Contato Anônimo <suaConta@gmail.com>',
        to: 'pedrohenriqueherculanodias@gmail.com',
        subject,
        text,
        html,
    })
    .then(() => res.status(200).send('Email enviado com sucesso!'))
    .catch(err => res.status(500).send('Erro ao enviar o email: ' + err.message));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});


