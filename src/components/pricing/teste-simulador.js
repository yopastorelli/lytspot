/**
 * Script para testar o simulador de preços diretamente no navegador
 * 
 * Este script pode ser executado no console do navegador para diagnosticar
 * problemas de exibição de serviços no simulador de preços.
 * 
 * @version 1.0.0 - 2025-03-15
 */

/**
 * Função principal para testar o simulador de preços
 */
function testarSimulador() {
  console.log('=== TESTE DO SIMULADOR DE PREÇOS ===');
  
  // Lista de serviços que devem aparecer no simulador
  const SERVICOS_ESPERADOS = [
    'VLOG - Aventuras em Família',
    'VLOG - Amigos e Comunidade',
    'Cobertura Fotográfica de Evento Social',
    'Filmagem de Evento Social',
    'Ensaio Fotográfico de Família',
    'Fotografia e Filmagem Aérea'
  ];
  
  // 1. Fazer uma requisição direta à API
  console.log('\n1. Fazendo requisição direta à API...');
  
  fetch('/api/pricing?simulador=true')
    .then(response => response.json())
    .then(data => {
      console.log(`✅ API retornou ${data.length} serviços:`);
      
      // Exibir os serviços retornados pela API
      data.forEach((servico, index) => {
        console.log(`${index + 1}. ${servico.nome} (ID: ${servico.id})`);
      });
      
      // Verificar se todos os serviços esperados estão presentes
      const nomesRetornados = data.map(servico => servico.nome);
      const servicosFaltantes = SERVICOS_ESPERADOS.filter(nome => !nomesRetornados.includes(nome));
      
      if (servicosFaltantes.length > 0) {
        console.warn(`⚠️ Há ${servicosFaltantes.length} serviços esperados que não foram retornados pela API:`);
        servicosFaltantes.forEach(nome => console.log(`- ${nome}`));
      } else {
        console.log('✅ Todos os serviços esperados estão presentes na resposta da API.');
      }
      
      // Verificar se há IDs duplicados
      const ids = data.map(servico => servico.id);
      const idsUnicos = [...new Set(ids)];
      
      if (ids.length !== idsUnicos.length) {
        console.warn('⚠️ Há IDs duplicados nos serviços retornados pela API!');
        
        // Identificar quais IDs estão duplicados
        const contagem = {};
        ids.forEach(id => {
          contagem[id] = (contagem[id] || 0) + 1;
        });
        
        const duplicados = Object.entries(contagem)
          .filter(([_, count]) => count > 1)
          .map(([id, count]) => `ID ${id}: ${count} ocorrências`);
        
        console.log('IDs duplicados:', duplicados.join(', '));
      } else {
        console.log('✅ Não há IDs duplicados na resposta da API.');
      }
      
      // 2. Verificar os serviços renderizados no DOM
      console.log('\n2. Verificando serviços renderizados no DOM...');
      
      // Buscar os cards de serviço no DOM
      const cards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.gap-6 > div');
      console.log(`Encontrados ${cards.length} cards de serviço no DOM.`);
      
      if (cards.length === 0) {
        console.warn('⚠️ Nenhum card de serviço encontrado no DOM!');
      } else {
        // Extrair os nomes dos serviços dos cards
        const servicosRenderizados = Array.from(cards).map(card => {
          const titulo = card.querySelector('h3')?.textContent.trim();
          return titulo;
        }).filter(Boolean);
        
        console.log('Serviços renderizados:');
        servicosRenderizados.forEach((nome, index) => {
          console.log(`${index + 1}. ${nome}`);
        });
        
        // Verificar se todos os serviços esperados estão renderizados
        const servicosNaoRenderizados = SERVICOS_ESPERADOS.filter(nome => !servicosRenderizados.includes(nome));
        
        if (servicosNaoRenderizados.length > 0) {
          console.warn(`⚠️ Há ${servicosNaoRenderizados.length} serviços que não estão sendo renderizados:`);
          servicosNaoRenderizados.forEach(nome => console.log(`- ${nome}`));
          
          // Verificar se há serviços na API que não estão sendo renderizados
          const servicosNaApiNaoRenderizados = data.filter(servico => !servicosRenderizados.includes(servico.nome));
          
          if (servicosNaApiNaoRenderizados.length > 0) {
            console.warn(`⚠️ Há ${servicosNaApiNaoRenderizados.length} serviços na resposta da API que não estão sendo renderizados:`);
            servicosNaApiNaoRenderizados.forEach(servico => {
              console.log(`- ${servico.nome} (ID: ${servico.id})`);
            });
          }
        } else {
          console.log('✅ Todos os serviços esperados estão sendo renderizados.');
        }
      }
      
      // 3. Verificar o estado do componente PriceSimulator
      console.log('\n3. Verificando estado do componente PriceSimulator...');
      
      // Tentar acessar o estado do componente React
      const componentes = Array.from(document.querySelectorAll('*')).filter(el => 
        el.__reactFiber$ && 
        el.__reactProps$ && 
        el.__reactProps$.children && 
        typeof el.__reactProps$.children === 'object' && 
        el.__reactProps$.children.type && 
        el.__reactProps$.children.type.name === 'PriceSimulator'
      );
      
      if (componentes.length === 0) {
        console.warn('⚠️ Não foi possível encontrar o componente PriceSimulator no DOM.');
      } else {
        console.log(`Encontrado componente PriceSimulator.`);
        
        // Tentar acessar o estado do componente
        try {
          const fiber = componentes[0].__reactFiber$;
          const stateNode = fiber.return?.stateNode;
          
          if (stateNode && stateNode.state && stateNode.state.servicos) {
            const servicosNoEstado = stateNode.state.servicos;
            console.log(`Estado do componente contém ${servicosNoEstado.length} serviços.`);
            
            if (servicosNoEstado.length !== data.length) {
              console.warn(`⚠️ Número de serviços no estado (${servicosNoEstado.length}) é diferente do número de serviços na API (${data.length})!`);
            }
          } else {
            console.warn('⚠️ Não foi possível acessar o estado de serviços do componente.');
          }
        } catch (error) {
          console.error('Erro ao acessar estado do componente:', error);
        }
      }
      
      // 4. Solução para o problema
      console.log('\n4. Solução para o problema:');
      
      if (data.length > 0 && cards.length < data.length) {
        console.log(`
Problema identificado: A API está retornando ${data.length} serviços, mas apenas ${cards.length} estão sendo renderizados.

Possíveis causas e soluções:

1. IDs duplicados: ${ids.length !== idsUnicos.length ? '✓ Detectado!' : '✗ Não detectado'}
   Solução: Adicionar código no PriceSimulator.jsx para remover duplicatas antes de definir o estado.

2. Problema na estrutura dos dados: Verificar se todos os serviços têm os campos obrigatórios.
   Solução: Adicionar código no serviceTransformer.js para garantir que todos os serviços tenham a estrutura correta.

3. Problema no componente ServiceCard: Verificar se o componente está lidando corretamente com diferentes estruturas de dados.
   Solução: Garantir que as funções getCaptura() e getTratamento() estejam funcionando corretamente.

4. Cache do navegador: Limpar o cache do navegador e recarregar a página.

5. Aplicar a seguinte correção no PriceSimulator.jsx:
   
   // No método carregarServicos, após receber a resposta:
   if (response && response.data && Array.isArray(response.data)) {
     // Remover duplicatas por ID
     const servicosSemDuplicatas = [];
     const idsProcessados = new Set();
     
     for (const servico of response.data) {
       if (!idsProcessados.has(servico.id)) {
         servicosSemDuplicatas.push(servico);
         idsProcessados.add(servico.id);
       }
     }
     
     setServicos(servicosSemDuplicatas);
   }
`);
      } else if (data.length === 0) {
        console.log(`
Problema identificado: A API não está retornando nenhum serviço.

Possíveis causas e soluções:

1. Filtro do simulador não está funcionando: Verificar a implementação do filtro no serviceRepository.js.
2. Banco de dados não contém os serviços esperados: Executar o script para popular o banco de dados.
3. Problema na conexão com o banco de dados: Verificar logs do servidor.
`);
      } else if (data.length === cards.length) {
        console.log(`
✅ Não foi detectado nenhum problema! A API está retornando ${data.length} serviços e todos estão sendo renderizados corretamente.
`);
      }
    })
    .catch(error => {
      console.error('❌ Erro ao fazer requisição à API:', error);
    });
}

// Executar o teste
testarSimulador();

// Instruções para o usuário
console.log(`
=== INSTRUÇÕES PARA USAR ESTE SCRIPT ===

1. Abra o simulador de preços no navegador
2. Abra as ferramentas de desenvolvedor (F12 ou Ctrl+Shift+I)
3. Vá para a aba Console
4. Cole este script completo e pressione Enter
5. Analise os resultados do teste
`);

// Exportar função para uso externo
export default testarSimulador;
