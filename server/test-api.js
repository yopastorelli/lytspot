/**
 * Script de teste para verificar a funcionalidade da API de serviços
 * @version 1.0.0 - 2025-03-12
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Configuração
const API_URL = 'http://127.0.0.1:3000/api';
// O token atual está expirado, vamos obter um novo
let TOKEN = '';

// Cliente HTTP configurado sem token (para login)
const apiNoAuth = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Cliente HTTP configurado com token (será atualizado após login)
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Função para fazer login e obter um novo token
async function obterToken() {
  try {
    console.log('Obtendo novo token de autenticação...');
    const response = await apiNoAuth.post('/auth/login', {
      email: 'admin@lytspot.com.br',
      password: 'admin123'
    });
    
    if (response.data && response.data.token) {
      TOKEN = response.data.token;
      console.log('Token obtido com sucesso!');
      
      // Atualizar o header de autorização
      api.defaults.headers.common['Authorization'] = `Bearer ${TOKEN}`;
      return true;
    } else {
      console.error('Falha ao obter token:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error.response?.data || error.message);
    return false;
  }
}

// Função para testar a listagem de serviços
async function testarListagemServicos() {
  try {
    console.log('Testando listagem de serviços...');
    const response = await api.get('/pricing');
    console.log('Serviços encontrados:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar serviços:', error.response?.data || error.message);
    return null;
  }
}

// Função para testar a obtenção de um serviço específico
async function testarObterServico(id) {
  try {
    console.log(`Testando obtenção do serviço ${id}...`);
    const response = await api.get(`/pricing/${id}`);
    console.log('Serviço encontrado:', response.data.nome);
    return response.data;
  } catch (error) {
    console.error(`Erro ao obter serviço ${id}:`, error.response?.data || error.message);
    return null;
  }
}

// Função para testar a atualização de um serviço
async function testarAtualizacaoServico(id, dados) {
  try {
    console.log(`Testando atualização do serviço ${id}...`);
    console.log('Dados enviados:', dados);
    const response = await api.put(`/pricing/${id}`, dados);
    console.log('Serviço atualizado:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar serviço ${id}:`, error.response?.data || error.message);
    console.error('Detalhes do erro:', error.response?.status, error.response?.statusText);
    return null;
  }
}

// Função principal
async function executarTestes() {
  try {
    // Obter token de autenticação
    const tokenObtido = await obterToken();
    if (!tokenObtido) {
      console.log('Não foi possível obter token de autenticação. Abortando testes.');
      return;
    }
    
    // Testar listagem
    const servicos = await testarListagemServicos();
    if (!servicos || servicos.length === 0) {
      console.log('Nenhum serviço encontrado para testar.');
      return;
    }
    
    // Testar obtenção de um serviço específico
    const servicoId = servicos[0].id;
    const servico = await testarObterServico(servicoId);
    if (!servico) {
      console.log('Não foi possível obter o serviço para testar atualização.');
      return;
    }
    
    // Testar atualização de serviço
    const dadosAtualizados = {
      ...servico,
      nome: `${servico.nome} (Atualizado)`,
      descricao: `${servico.descricao} - Teste de atualização`,
      preco_base: servico.preco_base + 10
    };
    
    await testarAtualizacaoServico(servicoId, dadosAtualizados);
    
    // Verificar se a atualização foi bem-sucedida
    const servicoAtualizado = await testarObterServico(servicoId);
    if (servicoAtualizado && servicoAtualizado.nome === dadosAtualizados.nome) {
      console.log('✅ Teste de atualização bem-sucedido!');
    } else {
      console.log('❌ Teste de atualização falhou!');
    }
  } catch (error) {
    console.error('Erro durante a execução dos testes:', error);
  }
}

// Executar os testes
executarTestes();
