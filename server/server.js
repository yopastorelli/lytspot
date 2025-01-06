import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Validação de variáveis de ambiente
const requiredEnvVars = [
  'REFRESH_TOKEN',
  'CLIENT_ID',
  'CLIENT_SECRET',
  'ACCOUNT_ID',
  'SENDER_EMAIL',
  'RECIPIENT_EMAIL',
];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Variável de ambiente ${key} não está configurada.`);
    process.exit(1);
  }
});

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
      `https://mail.zoho.com/api/accounts/${process.env.ACCOUNT_ID}/messages`,
      {
        fromAddress: process.env.SENDER_EMAIL,
        toAddress: process.env.RECIPIENT_EMAIL,
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

    console.log(`E-mail enviado com sucesso: ${response.data.messageId}`);
    res.status(200).json({ message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Erro de autenticação no Zoho Mail:', error.response?.data || error.message);
      res.status(401).json({ error: 'Falha de autenticação. Verifique suas credenciais.' });
    } else {
      console.error('Erro ao enviar e-mail:', error.response?.data || error.message);
      res.status(500).json({ error: 'Erro ao enviar o e-mail. Tente novamente mais tarde.' });
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});
