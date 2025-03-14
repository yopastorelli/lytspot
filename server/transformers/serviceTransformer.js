/**
 * Transformador de Serviços
 * @description Converte dados de serviços entre diferentes formatos
 * @version 1.4.0 - 2025-03-14 - Adicionados logs detalhados para diagnóstico de inconsistências entre ambientes
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
    console.log(`[serviceTransformer] Tipo do campo detalhes: ${typeof servico.detalhes}`);
    console.log(`[serviceTransformer] Valor bruto do campo detalhes: ${JSON.stringify(servico.detalhes).substring(0, 200)}`);

    // Tenta fazer parse do campo detalhes se for uma string
    let detalhesObj = {};
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
        console.error(`[serviceTransformer] Conteúdo que causou erro: ${servico.detalhes.substring(0, 100)}`);
      }
    }

    // Garantir que os campos de captura e tratamento estejam sempre presentes no objeto detalhes
    // Priorizar os valores do campo detalhes sobre os campos individuais
    const capturaValue = detalhesObj.captura || servico.duracao_media_captura || '';
    const tratamentoValue = detalhesObj.tratamento || servico.duracao_media_tratamento || '';
    
    console.log(`[serviceTransformer] Valores extraídos - captura: "${capturaValue}", tratamento: "${tratamentoValue}"`);
    
    // Extrai duração média aproximada a partir dos campos individuais
    const duracaoCaptura = this._extractDuration(capturaValue);
    const duracaoTratamento = this._extractDuration(tratamentoValue);
    
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
    console.log(`[serviceTransformer] Detalhes originais (conteúdo): ${typeof servico.detalhes === 'string' ? servico.detalhes.substring(0, 100) + '...' : JSON.stringify(servico.detalhes).substring(0, 100) + '...'}`);
    console.log(`[serviceTransformer] Campos individuais: captura=${servico.duracao_media_captura}, tratamento=${servico.duracao_media_tratamento}`);
    console.log(`[serviceTransformer] Detalhes transformados: ${JSON.stringify(detalhesCompletos)}`);
    
    const resultado = {
      id: servico.id,
      nome: servico.nome,
      descricao: servico.descricao,
      preco_base: servico.preco_base,
      duracao_media: duracaoMedia,
      detalhes: detalhesCompletos
    };
    
    console.log(`[serviceTransformer] Resultado final da transformação: ${JSON.stringify(resultado).substring(0, 200)}...`);
    
    return resultado;
  }

  /**
   * Transforma um serviço do formato do simulador para o formato do banco de dados
   * @param {Object} servicoSimulador Serviço no formato do simulador
   * @returns {Object} Serviço no formato do banco de dados
   */
  toDatabaseFormat(servicoSimulador) {
    if (!servicoSimulador) return null;

    const { detalhes = {} } = servicoSimulador;
    
    // Criar objeto detalhes para armazenar como JSON string
    const detalhesObj = {
      captura: detalhes.captura || '',
      tratamento: detalhes.tratamento || '',
      entregaveis: detalhes.entregaveis || '',
      adicionais: detalhes.adicionais || '',
      deslocamento: detalhes.deslocamento || ''
    };
    
    return {
      nome: servicoSimulador.nome,
      descricao: servicoSimulador.descricao,
      preco_base: servicoSimulador.preco_base,
      duracao_media_captura: detalhes.captura || '',
      duracao_media_tratamento: detalhes.tratamento || '',
      entregaveis: detalhes.entregaveis || '',
      possiveis_adicionais: detalhes.adicionais || '',
      valor_deslocamento: detalhes.deslocamento || '',
      detalhes: JSON.stringify(detalhesObj)
    };
  }

  /**
   * Transforma uma lista de serviços do formato do banco de dados para o formato do simulador
   * @param {Array} servicos Lista de serviços no formato do banco de dados
   * @returns {Array} Lista de serviços no formato do simulador
   */
  toSimulatorFormatList(servicos) {
    if (!Array.isArray(servicos)) return [];
    return servicos.map(servico => this.toSimulatorFormat(servico));
  }

  /**
   * Extrai um valor numérico de duração a partir de uma string
   * @param {string} durationString String contendo informação de duração (ex: "2 a 3 horas")
   * @returns {number} Valor numérico da duração (média se for um intervalo)
   * @private
   */
  _extractDuration(durationString) {
    if (!durationString) return 0;
    
    // Tenta extrair números da string
    const numbers = durationString.match(/\d+/g);
    if (!numbers || numbers.length === 0) return 0;
    
    // Se houver dois números (intervalo), calcula a média
    if (numbers.length >= 2) {
      return (parseInt(numbers[0]) + parseInt(numbers[1])) / 2;
    }
    
    // Se houver apenas um número, retorna ele
    return parseInt(numbers[0]);
  }
}

export default new ServiceTransformer();
