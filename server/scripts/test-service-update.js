/**
 * Script para testar a atualização de serviços
 * 
 * Este script testa a funcionalidade de atualização de serviços, verificando
 * se as alterações são corretamente aplicadas no banco de dados.
 * 
 * @version 1.0.0 - 2023-03-13
 */

import axios from 'axios';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar Prisma
const prisma = new PrismaClient();

// Configurações
const API_URL = process.env.API_URL || 'http://localhost:3001';
const API_TOKEN = process.env.API_TOKEN;

// Função para fazer login e obter token
async function login() {
  try {
    console.log(chalk.blue('🔑 Realizando login para obter token...'));
    
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    });
    
    if (response.data && response.data.token) {
      console.log(chalk.green('✅ Login realizado com sucesso!'));
      return response.data.token;
    } else {
      throw new Error('Token não encontrado na resposta');
    }
  } catch (error) {
    console.error(chalk.red('❌ Erro ao realizar login:'), error.message);
    if (error.response) {
      console.error(chalk.red('Detalhes:'), error.response.data);
    }
    throw error;
  }
}

// Função para verificar a existência de um serviço no banco de dados
async function verificarServicoBanco(id) {
  try {
    console.log(chalk.blue(`🔍 Verificando serviço ${id} diretamente no banco de dados...`));
    
    const servico = await prisma.servico.findUnique({
      where: { id: Number(id) }
    });
    
    if (servico) {
      console.log(chalk.green(`✅ Serviço ${id} encontrado no banco de dados:`));
      console.log(JSON.stringify(servico, null, 2));
      return servico;
    } else {
      console.log(chalk.yellow(`⚠️ Serviço ${id} não encontrado no banco de dados`));
      return null;
    }
  } catch (error) {
    console.error(chalk.red(`❌ Erro ao verificar serviço ${id} no banco de dados:`), error.message);
    return null;
  }
}

// Função para obter um serviço via API
async function obterServico(id, token) {
  try {
    console.log(chalk.blue(`🔍 Obtendo serviço ${id} via API...`));
    
    const response = await axios.get(`${API_URL}/api/pricing/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(chalk.green(`✅ Serviço ${id} obtido com sucesso via API:`));
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error(chalk.red(`❌ Erro ao obter serviço ${id} via API:`), error.message);
    if (error.response) {
      console.error(chalk.red('Detalhes:'), error.response.data);
    }
    return null;
  }
}

// Função para atualizar um serviço via API
async function atualizarServico(id, dados, token) {
  try {
    console.log(chalk.blue(`📝 Atualizando serviço ${id} via API...`));
    console.log('Dados para atualização:', dados);
    
    const response = await axios.put(`${API_URL}/api/pricing/${id}`, dados, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(chalk.green(`✅ Serviço ${id} atualizado com sucesso via API:`));
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error(chalk.red(`❌ Erro ao atualizar serviço ${id} via API:`), error.message);
    if (error.response) {
      console.error(chalk.red('Detalhes:'), error.response.data);
    }
    return null;
  }
}

// Função principal
async function main() {
  let token;
  
  try {
    console.log(chalk.bold.blue('🚀 Iniciando teste de atualização de serviços'));
    
    // Obter token de autenticação
    token = API_TOKEN || await login();
    
    // ID do serviço a ser testado
    const servicoId = process.argv[2] || 1;
    
    // Verificar serviço no banco de dados antes da atualização
    const servicoAntesBanco = await verificarServicoBanco(servicoId);
    
    // Obter serviço via API antes da atualização
    const servicoAntesAPI = await obterServico(servicoId, token);
    
    if (!servicoAntesAPI && !servicoAntesBanco) {
      console.error(chalk.red(`❌ Serviço ${servicoId} não encontrado. Teste cancelado.`));
      return;
    }
    
    // Preparar dados para atualização
    // Usamos o timestamp para garantir uma alteração visível
    const timestamp = new Date().toISOString();
    const dadosAtualizacao = {
      nome: `${servicoAntesBanco?.nome || servicoAntesAPI?.nome} (Atualizado: ${timestamp})`,
      descricao: `${servicoAntesBanco?.descricao || servicoAntesAPI?.descricao} (Teste de atualização: ${timestamp})`,
      preco_base: (servicoAntesBanco?.preco_base || servicoAntesAPI?.preco_base || 100) + 10,
      duracao_media_captura: servicoAntesBanco?.duracao_media_captura || servicoAntesAPI?.duracao_media_captura || '2 horas',
      duracao_media_tratamento: servicoAntesBanco?.duracao_media_tratamento || servicoAntesAPI?.duracao_media_tratamento || '5 dias',
      entregaveis: servicoAntesBanco?.entregaveis || servicoAntesAPI?.entregaveis || 'Teste de entregáveis',
      possiveis_adicionais: servicoAntesBanco?.possiveis_adicionais || servicoAntesAPI?.possiveis_adicionais || 'Teste de adicionais',
      valor_deslocamento: servicoAntesBanco?.valor_deslocamento || servicoAntesAPI?.valor_deslocamento || 'Teste de deslocamento'
    };
    
    // Atualizar serviço via API
    const servicoAtualizado = await atualizarServico(servicoId, dadosAtualizacao, token);
    
    if (!servicoAtualizado) {
      console.error(chalk.red(`❌ Falha ao atualizar serviço ${servicoId}. Teste cancelado.`));
      return;
    }
    
    // Aguardar um momento para garantir que a atualização foi processada
    console.log(chalk.blue('⏳ Aguardando processamento da atualização...'));
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar serviço no banco de dados após a atualização
    const servicoDepoisBanco = await verificarServicoBanco(servicoId);
    
    // Obter serviço via API após a atualização
    const servicoDepoisAPI = await obterServico(servicoId, token);
    
    // Verificar se a atualização foi bem-sucedida
    if (servicoDepoisBanco) {
      const atualizacaoBemSucedida = 
        servicoDepoisBanco.nome.includes(timestamp) && 
        servicoDepoisBanco.descricao.includes(timestamp);
      
      if (atualizacaoBemSucedida) {
        console.log(chalk.bold.green('✅ TESTE BEM-SUCEDIDO: Atualização refletida no banco de dados!'));
      } else {
        console.log(chalk.bold.red('❌ TESTE FALHOU: Atualização NÃO refletida no banco de dados!'));
        console.log('Esperado:', timestamp);
        console.log('Encontrado no nome:', servicoDepoisBanco.nome);
        console.log('Encontrado na descrição:', servicoDepoisBanco.descricao);
      }
    } else {
      console.log(chalk.bold.yellow('⚠️ Não foi possível verificar a atualização no banco de dados'));
    }
    
    // Verificar se a API está retornando os dados atualizados
    if (servicoDepoisAPI) {
      const apiAtualizadaCorretamente = 
        servicoDepoisAPI.nome.includes(timestamp) && 
        (servicoDepoisAPI.descricao.includes(timestamp) || 
         (servicoDepoisAPI.detalhes && servicoDepoisAPI.detalhes.descricao && 
          servicoDepoisAPI.detalhes.descricao.includes(timestamp)));
      
      if (apiAtualizadaCorretamente) {
        console.log(chalk.bold.green('✅ TESTE BEM-SUCEDIDO: API retornando dados atualizados!'));
      } else {
        console.log(chalk.bold.red('❌ TESTE FALHOU: API NÃO está retornando dados atualizados!'));
        console.log('Esperado:', timestamp);
        console.log('Encontrado na API:', servicoDepoisAPI);
      }
    } else {
      console.log(chalk.bold.yellow('⚠️ Não foi possível verificar a resposta da API após atualização'));
    }
    
  } catch (error) {
    console.error(chalk.bold.red('❌ Erro durante o teste:'), error.message);
  } finally {
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
    console.log(chalk.bold.blue('🏁 Teste concluído'));
  }
}

// Executar função principal
main();
