/**
 * Script de diagnóstico para o simulador de preços (versão para navegador)
 * 
 * Copie e cole este script no console do navegador enquanto estiver na página do simulador
 * para diagnosticar por que apenas um serviço está sendo exibido.
 * 
 * @version 1.0.0 - 2025-03-15
 */

function diagnosticarSimulador() {
  console.log('=== DIAGNÓSTICO DO SIMULADOR DE PREÇOS ===');
  
  // 1. Verificar os serviços no estado do componente
  const componente = Array.from(document.querySelectorAll('*'))
    .find(el => el.__reactFiber$ && el.__reactProps$ && el.__reactProps$.children && 
          typeof el.__reactProps$.children === 'object' && 
          el.__reactProps$.children.type && 
          el.__reactProps$.children.type.name === 'PriceSimulator');
  
  if (!componente) {
    console.error('❌ Não foi possível encontrar o componente PriceSimulator');
    return;
  }
  
  // Obter a instância do componente
  const instancia = componente.__reactFiber$;
  const estado = instancia.memoizedState;
  
  // Verificar o estado
  if (!estado) {
    console.error('❌ Não foi possível acessar o estado do componente');
    return;
  }
  
  // 2. Verificar os serviços no DOM
  const cards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.gap-6 > div');
  console.log(`\n2. Encontrados ${cards.length} cards de serviço no DOM`);
  
  // 3. Verificar os serviços renderizados
  const servicosRenderizados = Array.from(cards).map(card => {
    const titulo = card.querySelector('h3')?.textContent.trim();
    return titulo;
  }).filter(Boolean);
  
  console.log('\n3. Serviços renderizados:');
  servicosRenderizados.forEach((nome, index) => {
    console.log(`   ${index + 1}. ${nome}`);
  });
  
  // 4. Verificar os logs recentes
  console.log('\n4. Verificando logs recentes:');
  
  // Filtrar logs do PriceSimulator
  const logs = console.logs || [];
  const logsSimulador = logs.filter(log => 
    log.message && typeof log.message === 'string' && 
    log.message.includes('[PriceSimulator]')
  );
  
  if (logsSimulador.length > 0) {
    console.log('   Logs do simulador encontrados:');
    logsSimulador.forEach(log => {
      console.log(`   - ${log.message}`);
    });
  } else {
    console.log('   Nenhum log do simulador encontrado.');
    
    // Instruções alternativas
    console.log('\n   Para obter mais informações, adicione os seguintes logs ao componente PriceSimulator:');
    console.log(`
    // No método carregarServicos, após receber a resposta:
    console.log('[PriceSimulator] Resposta completa:', response);
    console.log('[PriceSimulator] Dados recebidos:', response.data);
    
    // Antes de chamar setServicos:
    console.log('[PriceSimulator] Serviços a serem definidos no estado:', response.data);
    
    // No método render, antes de retornar:
    console.log('[PriceSimulator] Serviços no estado antes de renderizar:', servicos);
    `);
  }
  
  // 5. Verificar a rede
  console.log('\n5. Verificando requisições de rede:');
  console.log('   Abra a aba Network/Rede do DevTools e procure por requisições para "/api/pricing?simulador=true"');
  console.log('   Verifique se a resposta contém todos os 6 serviços esperados.');
  
  // 6. Instruções para depuração adicional
  console.log('\n6. Instruções para depuração adicional:');
  console.log('   - Adicione um breakpoint na linha onde setServicos é chamado');
  console.log('   - Inspecione o valor de response.data antes de ser definido no estado');
  console.log('   - Verifique se há alguma transformação ou filtro sendo aplicado aos dados');
  
  return {
    servicosRenderizados,
    quantidadeCards: cards.length
  };
}

// Executar diagnóstico
const resultado = diagnosticarSimulador();
console.log('\nDiagnóstico concluído. Resultado:', resultado);

// Instruções para o usuário
console.log(`
=== INSTRUÇÕES PARA USAR ESTE SCRIPT ===

1. Abra o simulador de preços no navegador
2. Abra as ferramentas de desenvolvedor (F12 ou Ctrl+Shift+I)
3. Vá para a aba Console
4. Cole este script completo e pressione Enter
5. Analise os resultados do diagnóstico
`);
