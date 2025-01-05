require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Função para obter um novo Access Token usando o Refresh Token
const getAccessToken = async () => {
  try {
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        refresh_token: process.env.REFRESH_TOKEN,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'refresh_token',
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Erro ao obter o Access Token:', error.response?.data || error.message);
    throw new Error('Falha ao obter o Access Token.');
  }
};

// Endpoint para enviar o e-mail
app.post('/api/send-message', async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  // Validação básica
  if (!name || !email || !phone || !service || !message) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `https://mail.zoho.com/api/accounts/${process.env.ACCOUNT_ID}/messages`, // Substitua pelo Account ID correto
      {
        fromAddress: process.env.SENDER_EMAIL, // Configurado no .env
        toAddress: process.env.RECIPIENT_EMAIL, // Configurado no .env
        subject: 'Nova Mensagem de Contato',
        content: `Nome: ${name}\nEmail: ${email}\nTelefone: ${phone}\nServiço: ${service}\nMensagem: ${message}`,
      },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json({ message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao enviar o e-mail. Tente novamente mais tarde.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});
