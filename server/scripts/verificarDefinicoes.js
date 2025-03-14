/**
 * Script para verificar quantos serviços estão definidos no arquivo de definições atualizadas
 * @version 1.0.0 - 2025-03-14
 */

import { getUpdatedServiceDefinitions } from '../models/seeds/updatedServiceDefinitions.js';

// Obter as definições atualizadas
const servicosDefinidos = getUpdatedServiceDefinitions();

// Exibir o total de serviços definidos
console.log(`Total de serviços definidos: ${servicosDefinidos.length}`);

// Exibir os nomes dos serviços
console.log('\nLista de serviços definidos:');
servicosDefinidos.forEach((servico, index) => {
  console.log(`${index + 1}. ${servico.nome}`);
});
