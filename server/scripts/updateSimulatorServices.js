/**
 * Script para atualizar os serviços do simulador de preços
 * @version 1.0.0 - 2025-03-12
 * @description Atualiza o arquivo servicos.js do simulador com base nas definições atualizadas
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { serviceDefinitions, getServiceDefinitionsForFrontend } from '../models/seeds/serviceDefinitions.js';

// Configuração para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Caminho para o arquivo de serviços do simulador
const simulatorServicesPath = path.join(rootDir, 'src', 'data', 'servicos.js');

/**
 * Gera o conteúdo do arquivo de serviços do simulador
 */
function gerarConteudoArquivo() {
  const dataAtual = new Date().toISOString().split('T')[0];
  const servicosFormatados = getServiceDefinitionsForFrontend();
  
  return `/**
 * Dados de serviços para o Simulador de Preços - Versão 2.1
 * Este arquivo centraliza os dados para uso consistente entre a API e o fallback
 * Última atualização: ${dataAtual}
 * ATENÇÃO: Este arquivo é gerado automaticamente pelo script updateSimulatorServices.js
 * Não edite manualmente!
 */

export const servicos = ${JSON.stringify(servicosFormatados, null, 2)};
`;
}

/**
 * Função principal para atualizar o arquivo de serviços do simulador
 */
async function atualizarServicosSimulador() {
  try {
    console.log(' Atualizando serviços do simulador de preços...');
    
    // Verificar se o arquivo existe
    try {
      await fs.access(simulatorServicesPath);
      console.log(` Arquivo encontrado: ${simulatorServicesPath}`);
    } catch (error) {
      console.error(` Arquivo não encontrado: ${simulatorServicesPath}`);
      console.log(` Criando novo arquivo...`);
    }
    
    // Fazer backup do arquivo original se existir
    try {
      const backupPath = `${simulatorServicesPath}.bak`;
      await fs.copyFile(simulatorServicesPath, backupPath);
      console.log(` Backup criado em: ${backupPath}`);
    } catch (error) {
      console.log(` Não foi possível criar backup: arquivo original não existe`);
    }
    
    // Gerar e escrever o novo conteúdo
    const novoConteudo = gerarConteudoArquivo();
    await fs.writeFile(simulatorServicesPath, novoConteudo, 'utf8');
    console.log(` Arquivo de serviços do simulador atualizado com sucesso!`);
    
  } catch (error) {
    console.error(' Erro ao atualizar serviços do simulador:', error);
  }
}

// Executar a função principal
atualizarServicosSimulador()
  .then(() => {
    console.log(' Processo de atualização concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error(' Erro durante o processo de atualização:', error);
    process.exit(1);
  });