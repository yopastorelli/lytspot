/**
 * Transformador de Serviços
 * @description Converte dados de serviços entre diferentes formatos
 * @version 1.0.0 - 2025-03-12
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

    // Extrai duração média aproximada a partir dos campos individuais
    const duracaoCaptura = this._extractDuration(servico.duracao_media_captura);
    const duracaoTratamento = this._extractDuration(servico.duracao_media_tratamento);
    
    // Calcula a duração média (ou usa o valor existente, se disponível)
    const duracaoMedia = servico.duracao_media || 
      Math.ceil((duracaoCaptura + duracaoTratamento) / 2) || 3; // Fallback para 3 dias
    
    return {
      id: servico.id,
      nome: servico.nome,
      descricao: servico.descricao,
      preco_base: servico.preco_base,
      duracao_media: duracaoMedia,
      detalhes: {
        captura: servico.duracao_media_captura || '',
        tratamento: servico.duracao_media_tratamento || '',
        entregaveis: servico.entregaveis || '',
        adicionais: servico.possiveis_adicionais || '',
        deslocamento: servico.valor_deslocamento || ''
      }
    };
  }

  /**
   * Transforma um serviço do formato do simulador para o formato do banco de dados
   * @param {Object} servicoSimulador Serviço no formato do simulador
   * @returns {Object} Serviço no formato do banco de dados
   */
  toDatabaseFormat(servicoSimulador) {
    if (!servicoSimulador) return null;

    const { detalhes = {} } = servicoSimulador;
    
    return {
      nome: servicoSimulador.nome,
      descricao: servicoSimulador.descricao,
      preco_base: servicoSimulador.preco_base,
      duracao_media_captura: detalhes.captura || '',
      duracao_media_tratamento: detalhes.tratamento || '',
      entregaveis: detalhes.entregaveis || '',
      possiveis_adicionais: detalhes.adicionais || '',
      valor_deslocamento: detalhes.deslocamento || ''
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

// Exportar uma instância única do transformador
export default new ServiceTransformer();
