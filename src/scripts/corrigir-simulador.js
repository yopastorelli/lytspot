/**
 * Script para diagnosticar e corrigir problemas no simulador de preços
 * 
 * Este script identifica e corrige problemas que podem estar causando a exibição
 * incorreta de serviços no simulador de preços.
 * 
 * @version 1.0.0 - 2025-03-15
 */

import { servicosAPI } from '../services/api';
import { getEnvironment } from '../utils/environment';

/**
 * Função para diagnosticar e corrigir problemas no simulador
 */
async function corrigirSimulador() {
  console.log('=== DIAGNÓSTICO E CORREÇÃO DO SIMULADOR DE PREÇOS ===\n');
  
  try {
    const env = getEnvironment();
    console.log(`Ambiente: ${env.environment}`);
    console.log(`URL Base: ${env.baseUrl}`);
    
    // 1. Verificar se a API está retornando dados corretamente
    console.log('\n1. Verificando resposta da API...');
    const response = await servicosAPI.listar({ simulador: true });
    
    if (!response || !response.data || !Array.isArray(response.data)) {
      console.error('❌ A API não retornou dados válidos!');
      console.log('Resposta:', response);
      return;
    }
    
    console.log(`✅ API retornou ${response.data.length} serviços.`);
    
    // 2. Verificar se há IDs duplicados
    console.log('\n2. Verificando IDs duplicados...');
    const ids = response.data.map(servico => servico.id);
    const idsUnicos = [...new Set(ids)];
    
    if (ids.length !== idsUnicos.length) {
      console.error('❌ Há IDs duplicados nos serviços!');
      
      // Identificar quais IDs estão duplicados
      const contagem = {};
      ids.forEach(id => {
        contagem[id] = (contagem[id] || 0) + 1;
      });
      
      const duplicados = Object.entries(contagem)
        .filter(([_, count]) => count > 1)
        .map(([id, count]) => ({ id, count }));
      
      console.log('IDs duplicados:', duplicados);
      
      // Mostrar detalhes dos serviços com IDs duplicados
      console.log('\nDetalhes dos serviços com IDs duplicados:');
      for (const { id, count } of duplicados) {
        const servicosComIdDuplicado = response.data.filter(s => s.id == id);
        console.log(`\nID ${id} aparece ${count} vezes:`);
        
        servicosComIdDuplicado.forEach((servico, index) => {
          console.log(`- Serviço ${index + 1}:`);
          console.log(`  Nome: ${servico.nome}`);
          console.log(`  Preço base: ${servico.preco_base}`);
        });
      }
      
      // Solução: remover duplicatas mantendo apenas a primeira ocorrência de cada ID
      console.log('\nCorrigindo: removendo duplicatas...');
      const servicosSemDuplicatas = [];
      const idsProcessados = new Set();
      
      for (const servico of response.data) {
        if (!idsProcessados.has(servico.id)) {
          servicosSemDuplicatas.push(servico);
          idsProcessados.add(servico.id);
        }
      }
      
      console.log(`✅ Após remoção de duplicatas: ${servicosSemDuplicatas.length} serviços.`);
      
      // Atualizar a resposta para continuar o diagnóstico
      response.data = servicosSemDuplicatas;
    } else {
      console.log('✅ Não há IDs duplicados.');
    }
    
    // 3. Verificar a estrutura dos dados
    console.log('\n3. Verificando estrutura dos dados...');
    const servicosComProblemas = [];
    
    for (const servico of response.data) {
      const problemas = [];
      
      // Verificar campos obrigatórios
      if (!servico.id) problemas.push('ID ausente');
      if (!servico.nome) problemas.push('Nome ausente');
      if (servico.preco_base === undefined) problemas.push('Preço base ausente');
      
      // Verificar estrutura do campo detalhes
      if (!servico.detalhes) {
        problemas.push('Campo detalhes ausente');
      } else {
        if (!servico.detalhes.captura) problemas.push('detalhes.captura ausente');
        if (!servico.detalhes.tratamento) problemas.push('detalhes.tratamento ausente');
      }
      
      // Se encontrou problemas, adicionar à lista
      if (problemas.length > 0) {
        servicosComProblemas.push({
          id: servico.id,
          nome: servico.nome,
          problemas
        });
      }
    }
    
    if (servicosComProblemas.length > 0) {
      console.error(`❌ Encontrados ${servicosComProblemas.length} serviços com problemas estruturais:`);
      
      servicosComProblemas.forEach(servico => {
        console.log(`\n- Serviço ID ${servico.id} (${servico.nome}):`);
        servico.problemas.forEach(problema => {
          console.log(`  • ${problema}`);
        });
      });
      
      // Solução: corrigir a estrutura dos serviços com problemas
      console.log('\nCorrigindo estrutura dos serviços...');
      
      for (const servico of response.data) {
        // Garantir que o campo detalhes exista
        if (!servico.detalhes) {
          servico.detalhes = {};
        } else if (typeof servico.detalhes === 'string') {
          try {
            servico.detalhes = JSON.parse(servico.detalhes);
          } catch (error) {
            console.error(`Erro ao fazer parse do campo detalhes do serviço ${servico.id}:`, error.message);
            servico.detalhes = {};
          }
        }
        
        // Garantir que os campos de captura e tratamento existam
        if (!servico.detalhes.captura) {
          servico.detalhes.captura = servico.duracao_media_captura || 'Sob consulta';
        }
        
        if (!servico.detalhes.tratamento) {
          servico.detalhes.tratamento = servico.duracao_media_tratamento || 'Sob consulta';
        }
      }
      
      console.log('✅ Estrutura dos serviços corrigida.');
    } else {
      console.log('✅ Todos os serviços têm estrutura válida.');
    }
    
    // 4. Verificar se o componente PriceSimulator está processando corretamente os dados
    console.log('\n4. Verificando processamento no componente PriceSimulator...');
    console.log('Instruções para corrigir o componente PriceSimulator:');
    console.log(`
1. Adicione logs detalhados no método carregarServicos:
   console.log('[PriceSimulator] Resposta completa:', response);
   console.log('[PriceSimulator] Dados recebidos:', response.data);
   console.log('[PriceSimulator] Quantidade de serviços:', response.data.length);

2. Verifique se há algum filtro ou transformação sendo aplicado aos dados antes de chamar setServicos.

3. Adicione um log após definir o estado:
   useEffect(() => {
     console.log('[PriceSimulator] Estado de serviços atualizado:', servicos);
   }, [servicos]);
`);
    
    // 5. Resumo e recomendações
    console.log('\n5. Resumo e recomendações:');
    
    if (ids.length !== idsUnicos.length || servicosComProblemas.length > 0) {
      console.log(`
✅ Problemas identificados e corrigidos:
${ids.length !== idsUnicos.length ? '- IDs duplicados nos serviços' : ''}
${servicosComProblemas.length > 0 ? '- Estrutura inconsistente em alguns serviços' : ''}

Para aplicar essas correções permanentemente:

1. Atualize o arquivo serviceTransformer.js para garantir que não haja duplicação de IDs
   e que a estrutura dos serviços seja consistente.

2. Verifique se o componente PriceSimulator está filtrando serviços indevidamente.

3. Execute o script fix-service-details.js para corrigir a estrutura dos serviços no banco de dados.
`);
    } else {
      console.log(`
✅ Nenhum problema estrutural encontrado nos dados retornados pela API.

O problema provavelmente está no processamento dos dados no frontend:

1. Verifique se há algum filtro sendo aplicado no componente PriceSimulator.
2. Verifique se há algum problema na renderização dos serviços.
3. Adicione logs para rastrear o fluxo de dados no componente.
`);
    }
    
    return {
      servicosOriginais: response.data,
      idsUnicos: idsUnicos.length,
      servicosComProblemas: servicosComProblemas.length
    };
  } catch (error) {
    console.error('\n❌ ERRO ao executar diagnóstico:', error);
  }
}

// Executar diagnóstico e correção
corrigirSimulador()
  .then(resultado => {
    console.log('\nDiagnóstico e correção concluídos.');
    if (resultado) {
      console.log('Resultado:', resultado);
    }
  })
  .catch(error => console.error('Erro fatal:', error));

export default corrigirSimulador;
