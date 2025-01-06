const nodemailer = require('nodemailer');

// Configurar transporte SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true para porta 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Função para envio de e-mails
async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: process.env.SENDER_EMAIL, // Remetente
    to, // Destinatário(s)
    subject, // Assunto
    text, // Corpo em texto
    html, // Corpo em HTML (opcional)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado:', info.response);
    return info;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
}

module.exports = { sendEmail };