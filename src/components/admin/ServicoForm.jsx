import React, { useState, useEffect } from 'react';

/**
 * Componente de formulário para adicionar e editar serviços
 * @version 1.3.0 - Corrigido problema de cores e compatibilidade com ServicosManager
 */
const ServicoForm = ({ servicoInicial, onSubmit, onCancel, loading }) => {
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco_base: '',
    duracao_media_captura: '',
    duracao_media_tratamento: '',
    entregaveis: '',
    possiveis_adicionais: '',
    valor_deslocamento: ''
  });
  
  // Estado para armazenar erros de validação
  const [errosValidacao, setErrosValidacao] = useState({});
  
  // Estado para armazenar o status de carregamento interno
  const [loadingInterno, setLoadingInterno] = useState(false);
  
  // Combinando o estado de carregamento interno com o passado por props
  const isLoading = loading || loadingInterno;

  // Inicializar o formulário com os dados do serviço em edição, se houver
  useEffect(() => {
    if (servicoInicial) {
      console.log('Inicializando formulário com serviço:', servicoInicial);
      // Se o servicoInicial vier no formato do PriceSimulator (com detalhes agrupados)
      if (servicoInicial.detalhes) {
        setFormData({
          nome: servicoInicial.nome || '',
          descricao: servicoInicial.descricao || '',
          preco_base: servicoInicial.preco_base?.toString() || '',
          duracao_media_captura: servicoInicial.detalhes?.captura || '',
          duracao_media_tratamento: servicoInicial.detalhes?.tratamento || '',
          entregaveis: servicoInicial.detalhes?.entregaveis || '',
          possiveis_adicionais: servicoInicial.detalhes?.adicionais || '',
          valor_deslocamento: servicoInicial.detalhes?.deslocamento?.toString() || ''
        });
      } else {
        // Formato original do banco de dados
        setFormData({
          nome: servicoInicial.nome || '',
          descricao: servicoInicial.descricao || '',
          preco_base: servicoInicial.preco_base?.toString() || '',
          duracao_media_captura: servicoInicial.duracao_media_captura || '',
          duracao_media_tratamento: servicoInicial.duracao_media_tratamento || '',
          entregaveis: servicoInicial.entregaveis || '',
          possiveis_adicionais: servicoInicial.possiveis_adicionais || '',
          valor_deslocamento: servicoInicial.valor_deslocamento?.toString() || ''
        });
      }
    }
  }, [servicoInicial]);

  // Função para atualizar o estado do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro de validação ao editar o campo
    if (errosValidacao[name]) {
      setErrosValidacao(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Função para validar o formulário
  const validarFormulario = () => {
    const erros = {};
    
    // Validar campos obrigatórios
    if (!formData.nome.trim()) {
      erros.nome = 'O nome do serviço é obrigatório';
    }
    
    if (!formData.descricao.trim()) {
      erros.descricao = 'A descrição do serviço é obrigatória';
    }
    
    if (!formData.preco_base.trim()) {
      erros.preco_base = 'O preço base é obrigatório';
    } else if (isNaN(parseFloat(formData.preco_base))) {
      erros.preco_base = 'O preço base deve ser um número válido';
    }
    
    // Atualizar estado de erros
    setErrosValidacao(erros);
    
    // Retornar true se não houver erros
    return Object.keys(erros).length === 0;
  };
  
  // Função para enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar o formulário
    if (!validarFormulario()) {
      return;
    }
    
    try {
      setLoadingInterno(true);
      
      // Formatar os dados para envio
      // Criamos uma estrutura compatível com o formato do PriceSimulator 2.8.0
      const dadosFormatados = {
        ...formData,
        preco_base: parseFloat(formData.preco_base),
        // Calcular duração média para compatibilidade com o PriceSimulator
        duracao_media: Math.ceil((
          parseInt(formData.duracao_media_captura.split(' ')[0] || 0) + 
          parseInt(formData.duracao_media_tratamento.split(' ')[0] || 0)
        ) / 2) || 3, // valor padrão de 3 dias se não conseguir calcular
        // Adicionar a estrutura de detalhes para compatibilidade com PriceSimulator 2.8.0
        detalhes: {
          captura: formData.duracao_media_captura,
          tratamento: formData.duracao_media_tratamento,
          entregaveis: formData.entregaveis,
          adicionais: formData.possiveis_adicionais,
          deslocamento: formData.valor_deslocamento
        }
      };
      
      // Manter os campos originais para compatibilidade com o banco de dados
      
      // Chamar a função de callback com os dados do formulário
      await onSubmit(dadosFormatados);
      
      setLoadingInterno(false);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setLoadingInterno(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome do serviço */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Serviço *
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errosValidacao.nome ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Ensaio Fotográfico"
            disabled={isLoading}
          />
          {errosValidacao.nome && (
            <p className="mt-1 text-sm text-red-600">{errosValidacao.nome}</p>
          )}
        </div>
        
        {/* Preço base */}
        <div>
          <label htmlFor="preco_base" className="block text-sm font-medium text-gray-700 mb-1">
            Preço Base (R$) *
          </label>
          <input
            type="text"
            id="preco_base"
            name="preco_base"
            value={formData.preco_base}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errosValidacao.preco_base ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: 1200.00"
            disabled={isLoading}
          />
          {errosValidacao.preco_base && (
            <p className="mt-1 text-sm text-red-600">{errosValidacao.preco_base}</p>
          )}
        </div>
      </div>
      
      {/* Descrição */}
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição *
        </label>
        <textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          rows={3}
          className={`w-full px-4 py-2 border rounded-md text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errosValidacao.descricao ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Descreva o serviço..."
          disabled={isLoading}
        ></textarea>
        {errosValidacao.descricao && (
          <p className="mt-1 text-sm text-red-600">{errosValidacao.descricao}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Duração média de captura */}
        <div>
          <label htmlFor="duracao_media_captura" className="block text-sm font-medium text-gray-700 mb-1">
            Duração Média de Captura
          </label>
          <input
            type="text"
            id="duracao_media_captura"
            name="duracao_media_captura"
            value={formData.duracao_media_captura}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 2 dias"
            disabled={isLoading}
          />
        </div>
        
        {/* Duração média de tratamento */}
        <div>
          <label htmlFor="duracao_media_tratamento" className="block text-sm font-medium text-gray-700 mb-1">
            Duração Média de Tratamento
          </label>
          <input
            type="text"
            id="duracao_media_tratamento"
            name="duracao_media_tratamento"
            value={formData.duracao_media_tratamento}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 5 dias"
            disabled={isLoading}
          />
        </div>
      </div>
      
      {/* Entregáveis */}
      <div>
        <label htmlFor="entregaveis" className="block text-sm font-medium text-gray-700 mb-1">
          Entregáveis
        </label>
        <textarea
          id="entregaveis"
          name="entregaveis"
          value={formData.entregaveis}
          onChange={handleChange}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: 20 fotos em alta resolução, álbum digital..."
          disabled={isLoading}
        ></textarea>
      </div>
      
      {/* Possíveis adicionais */}
      <div>
        <label htmlFor="possiveis_adicionais" className="block text-sm font-medium text-gray-700 mb-1">
          Possíveis Adicionais
        </label>
        <textarea
          id="possiveis_adicionais"
          name="possiveis_adicionais"
          value={formData.possiveis_adicionais}
          onChange={handleChange}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Fotos extras, álbum impresso..."
          disabled={isLoading}
        ></textarea>
      </div>
      
      {/* Valor de deslocamento */}
      <div>
        <label htmlFor="valor_deslocamento" className="block text-sm font-medium text-gray-700 mb-1">
          Valor de Deslocamento (R$)
        </label>
        <input
          type="text"
          id="valor_deslocamento"
          name="valor_deslocamento"
          value={formData.valor_deslocamento}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: 50.00"
          disabled={isLoading}
        />
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Salvando...
            </span>
          ) : (
            'Salvar Serviço'
          )}
        </button>
      </div>
    </form>
  );
};

export default ServicoForm;
