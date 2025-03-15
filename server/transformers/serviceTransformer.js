/**
 * Transformador de Serviços
 * @description Converte dados de serviços entre diferentes formatos
 * @version 1.5.0 - 2025-03-15 - Melhorada robustez na manipulação do campo detalhes
 */

/**
 * Classe responsável por transformar dados de serviços entre o formato do banco de dados e o formato do frontend
 */
class ServiceTransformer {
  /**
   * Transforma um serviço do formato do banco de dados para o formato do simulador
   * @param {Object} servico Serviço no formato do banco de dados
   * @returns {Object} Serviço no formato do simulador
   */
  toSimulatorFormat(servico) {
    if (!servico) return null;

    console.log(`[serviceTransformer] Início da transformação para o serviço ${servico.id} - ${servico.nome}`);
    
    // Extrair valores de duração de captura e tratamento
    // Priorizar os valores do campo detalhes se existirem
    let detalhesObj = {};
    
    // Tenta fazer parse do campo detalhes se for uma string
    if (servico.detalhes) {
      try {
        if (typeof servico.detalhes === 'string') {
          console.log(`[serviceTransformer] Tentando fazer parse do campo detalhes como string para o serviço ${servico.id}`);
          detalhesObj = JSON.parse(servico.detalhes);
          console.log(`[serviceTransformer] Parse do campo detalhes para o serviço ${servico.id} - ${servico.nome}:`, JSON.stringify(detalhesObj));
        } else if (typeof servico.detalhes === 'object') {
          console.log(`[serviceTransformer] Campo detalhes já é um objeto para o serviço ${servico.id}`);
          detalhesObj = servico.detalhes;
        }
      } catch (error) {
        console.error(`[serviceTransformer] Erro ao fazer parse do campo detalhes do serviço ${servico.id}:`, error.message);
        if (typeof servico.detalhes === 'string') {
          console.error(`[serviceTransformer] Conteúdo que causou erro: ${servico.detalhes.substring(0, 100)}`);
        }
        // Em caso de erro, usar um objeto vazio
        detalhesObj = {};
      }
    } else {
      console.log(`[serviceTransformer] Campo detalhes não existe ou é nulo para o serviço ${servico.id}`);
    }
    
    // Garantir que os campos de captura e tratamento estejam sempre presentes
    const capturaValue = detalhesObj.captura || servico.duracao_media_captura || 'Sob consulta';
    const tratamentoValue = detalhesObj.tratamento || servico.duracao_media_tratamento || 'Sob consulta';
    
    console.log(`[serviceTransformer] Valores extraídos - captura: "${capturaValue}", tratamento: "${tratamentoValue}"`);
    
    // Extrair valores numéricos para cálculo da duração média
    const duracaoCaptura = this.extrairValorNumerico(capturaValue) || 0;
    const duracaoTratamento = this.extrairValorNumerico(tratamentoValue) || 0;
    
    console.log(`[serviceTransformer] Durações extraídas - captura: ${duracaoCaptura}, tratamento: ${duracaoTratamento}`);
    
    // Calcula a duração média (ou usa o valor existente, se disponível)
    const duracaoMedia = servico.duracao_media || 
      Math.ceil((duracaoCaptura + duracaoTratamento) / 2) || 3; // Fallback para 3 dias
    
    // Cria um objeto detalhes completo e consistente
    const detalhesCompletos = {
      captura: capturaValue,
      tratamento: tratamentoValue,
      entregaveis: detalhesObj.entregaveis || servico.entregaveis || '',
      adicionais: detalhesObj.adicionais || servico.possiveis_adicionais || '',
      deslocamento: detalhesObj.deslocamento || servico.valor_deslocamento || ''
    };
    
    // Registra log para depuração
    console.log(`[serviceTransformer] Transformando serviço ${servico.id} - ${servico.nome}`);
    console.log(`[serviceTransformer] Detalhes originais (tipo): ${typeof servico.detalhes}`);
    if (servico.detalhes) {
      console.log(`[serviceTransformer] Detalhes originais (conteúdo): ${typeof servico.detalhes === 'string' ? servico.detalhes.substring(0, 100) + '...' : JSON.stringify(servico.detalhes).substring(0, 100) + '...'}`);
    } else {
      console.log(`[serviceTransformer] Detalhes originais: null ou undefined`);
    }
    console.log(`[serviceTransformer] Campos individuais: captura=${servico.duracao_media_captura}, tratamento=${servico.duracao_media_tratamento}`);
    console.log(`[serviceTransformer] Detalhes transformados: ${JSON.stringify(detalhesCompletos)}`);
    
    // Criar o objeto resultado com todos os campos necessários
    const resultado = {
      id: servico.id,
      nome: servico.nome,
      descricao: servico.descricao,
      preco_base: parseFloat(servico.preco_base) || 0,
      duracao_media: duracaoMedia,
      detalhes: detalhesCompletos
    };
    
    console.log(`[serviceTransformer] Resultado final da transformação: ${JSON.stringify(resultado).substring(0, 200)}...`);
    
    return resultado;
  }
  
  /**
   * Extrai um valor numérico de uma string de duração
   * @param {string} duracao String contendo informação de duração
   * @returns {number} Valor numérico extraído ou null se não for possível extrair
   */
  extrairValorNumerico(duracao) {
    if (!duracao || typeof duracao !== 'string') return null;
    
    // Tenta extrair um número da string
    const match = duracao.match(/(\d+(\.\d+)?)/);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
    
    // Casos especiais
    if (duracao.toLowerCase().includes('hora')) {
      // Se contém "hora", assume que é menos de um dia
      return 1;
    }
    
    if (duracao.toLowerCase().includes('dia')) {
      // Tenta extrair o número de dias
      const diasMatch = duracao.match(/(\d+).*dia/);
      if (diasMatch && diasMatch[1]) {
        return parseInt(diasMatch[1]);
      }
      return 1; // Assume 1 dia se não conseguir extrair
    }
    
    // Se contém "a", pode ser um intervalo como "2 a 3 horas"
    if (duracao.includes(' a ')) {
      const partes = duracao.split(' a ');
      const valores = [];
      
      for (const parte of partes) {
        const num = parte.match(/(\d+(\.\d+)?)/);
        if (num && num[1]) {
          valores.push(parseFloat(num[1]));
        }
      }
      
      if (valores.length > 0) {
        // Retorna a média dos valores encontrados
        return valores.reduce((a, b) => a + b, 0) / valores.length;
      }
    }
    
    return null;
  }
  
  /**
   * Transforma um serviço do formato do simulador para o formato do banco de dados
   * @param {Object} servico Serviço no formato do simulador
   * @returns {Object} Serviço no formato do banco de dados
   */
  toDatabaseFormat(servico) {
    if (!servico) return null;
    
    // Extrai os campos de detalhes, se existirem
    const detalhes = servico.detalhes || {};
    
    // Cria o objeto para o banco de dados
    const resultado = {
      nome: servico.nome,
      descricao: servico.descricao,
      preco_base: parseFloat(servico.preco_base) || 0,
      duracao_media_captura: detalhes.captura || 'Sob consulta',
      duracao_media_tratamento: detalhes.tratamento || 'Sob consulta',
      entregaveis: detalhes.entregaveis || '',
      possiveis_adicionais: detalhes.adicionais || '',
      valor_deslocamento: detalhes.deslocamento || 'Sob consulta',
      
      // Serializa o objeto detalhes para armazenamento
      detalhes: JSON.stringify(detalhes)
    };
    
    // Mantém o ID se existir
    if (servico.id) {
      resultado.id = servico.id;
    }
    
    return resultado;
  }

  /**
   * Transforma uma lista de serviços do formato do banco de dados para o formato do simulador
   * @param {Array} servicos Lista de serviços no formato do banco de dados
   * @returns {Array} Lista de serviços no formato do simulador
   */
  toSimulatorFormatList(servicos) {
    if (!Array.isArray(servicos)) return [];
    
    console.log(`[serviceTransformer] Transformando lista de ${servicos.length} serviços para o simulador`);
    
    // Transformar cada serviço
    const servicosTransformados = servicos.map(servico => this.toSimulatorFormat(servico));
    
    // Verificar se há IDs duplicados
    const ids = servicosTransformados.map(servico => servico.id);
    const idsUnicos = [...new Set(ids)];
    
    if (ids.length !== idsUnicos.length) {
      console.warn(`[serviceTransformer] Detectados ${ids.length - idsUnicos.length} IDs duplicados. Removendo duplicatas...`);
      
      // Remover duplicatas mantendo apenas a primeira ocorrência de cada ID
      const servicosSemDuplicatas = [];
      const idsProcessados = new Set();
      
      for (const servico of servicosTransformados) {
        if (!idsProcessados.has(servico.id)) {
          servicosSemDuplicatas.push(servico);
          idsProcessados.add(servico.id);
        }
      }
      
      console.log(`[serviceTransformer] Após remoção de duplicatas: ${servicosSemDuplicatas.length} serviços.`);
      return servicosSemDuplicatas;
    }
    
    console.log(`[serviceTransformer] Transformação concluída: ${servicosTransformados.length} serviços.`);
    return servicosTransformados;
  }
}

export default new ServiceTransformer();
