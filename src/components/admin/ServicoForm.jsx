import React, { useState, useEffect } from 'react';

/**
 * Componente de formulário para adicionar e editar serviços
 * 
 * Este componente fornece uma interface para adicionar novos serviços ou editar serviços existentes.
 * Implementa validação de campos obrigatórios e formatação de dados para envio ao backend.
 * 
 * @version 1.5.0 - 2025-03-12 - Melhorada a validação e formatação de dados para compatibilidade com o backend
 */
const ServicoForm = ({ servico, onSave, onCancel, loading }) => {
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
  const [erros, setErros] = useState({});
  
  // Estado para armazenar o status de carregamento interno
  const [loadingInterno, setLoadingInterno] = useState(false);
  
  // Combinando o estado de carregamento interno com o passado por props
  const isLoading = loading || loadingInterno;

  // Inicializar o formulário com os dados do serviço em edição, se houver
  useEffect(() => {
    if (servico) {
      console.log('Inicializando formulário com serviço:', servico);
      // Se o serviço vier no formato do PriceSimulator (com detalhes agrupados)
      if (servico.detalhes) {
        setFormData({
          id: servico.id, // Importante manter o ID para edição
          nome: servico.nome || '',
          descricao: servico.descricao || '',
          preco_base: servico.preco_base?.toString() || '',
          duracao_media_captura: servico.detalhes?.captura || '',
          duracao_media_tratamento: servico.detalhes?.tratamento || '',
          entregaveis: servico.detalhes?.entregaveis || '',
          possiveis_adicionais: servico.detalhes?.adicionais || '',
          valor_deslocamento: servico.detalhes?.deslocamento?.toString() || ''
        });
      } else {
        // Formato original do banco de dados
        setFormData({
          id: servico.id, // Importante manter o ID para edição
          nome: servico.nome || '',
          descricao: servico.descricao || '',
          preco_base: servico.preco_base?.toString() || '',
          duracao_media_captura: servico.duracao_media_captura || '',
          duracao_media_tratamento: servico.duracao_media_tratamento || '',
          entregaveis: servico.entregaveis || '',
          possiveis_adicionais: servico.possiveis_adicionais || '',
          valor_deslocamento: servico.valor_deslocamento?.toString() || ''
        });
      }
    }
  }, [servico]);

  // Função para atualizar o estado do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro de validação ao editar o campo
    if (erros[name]) {
      setErros(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validar o formulário antes de enviar
  const validarFormulario = () => {
    const erros = {};
    let formValido = true;
    
    // Validar nome
    if (!formData.nome || formData.nome.trim() === '') {
      erros.nome = 'O nome do serviço é obrigatório';
      formValido = false;
    } else if (formData.nome.trim().length < 3) {
      erros.nome = 'O nome deve ter pelo menos 3 caracteres';
      formValido = false;
    }
    
    // Validar descrição
    if (!formData.descricao || formData.descricao.trim() === '') {
      erros.descricao = 'A descrição do serviço é obrigatória';
      formValido = false;
    } else if (formData.descricao.trim().length < 10) {
      erros.descricao = 'A descrição deve ter pelo menos 10 caracteres';
      formValido = false;
    }
    
    // Validar preço base
    if (!formData.preco_base) {
      erros.preco_base = 'O preço base é obrigatório';
      formValido = false;
    } else {
      const preco = parseFloat(formData.preco_base.toString().replace(',', '.'));
      if (isNaN(preco) || preco <= 0) {
        erros.preco_base = 'O preço base deve ser um número positivo';
        formValido = false;
      }
    }
    
    // Validar duração média de captura
    if (!formData.duracao_media_captura || formData.duracao_media_captura.trim() === '') {
      erros.duracao_media_captura = 'A duração média de captura é obrigatória';
      formValido = false;
    }
    
    // Validar duração média de tratamento
    if (!formData.duracao_media_tratamento || formData.duracao_media_tratamento.trim() === '') {
      erros.duracao_media_tratamento = 'A duração média de tratamento é obrigatória';
      formValido = false;
    }
    
    // Validar entregáveis
    if (!formData.entregaveis || formData.entregaveis.trim() === '') {
      erros.entregaveis = 'Os entregáveis são obrigatórios';
      formValido = false;
    }
    
    setErros(erros);
    
    if (!formValido) {
      console.log('Erros de validação:', erros);
    }
    
    return formValido;
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
      
      // Formatar os dados para envio no formato esperado pelo backend
      const dadosFormatados = {
        id: formData.id, // Manter o ID para edição
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        preco_base: parseFloat(formData.preco_base) || 0,
        duracao_media_captura: formData.duracao_media_captura.trim() || '',
        duracao_media_tratamento: formData.duracao_media_tratamento.trim() || '',
        entregaveis: formData.entregaveis.trim() || '',
        possiveis_adicionais: formData.possiveis_adicionais.trim() || '',
        valor_deslocamento: formData.valor_deslocamento ? formData.valor_deslocamento.trim() : ''
      };
      
      console.log('Enviando dados formatados para o backend:', dadosFormatados);
      
      // Chamar a função de callback com os dados do formulário
      await onSave(dadosFormatados);
      
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
              erros.nome ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Ensaio Fotográfico"
            disabled={isLoading}
          />
          {erros.nome && (
            <p className="mt-1 text-sm text-red-600">{erros.nome}</p>
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
              erros.preco_base ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: 1200.00"
            disabled={isLoading}
          />
          {erros.preco_base && (
            <p className="mt-1 text-sm text-red-600">{erros.preco_base}</p>
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
          rows={4}
          className={`w-full px-4 py-2 border rounded-md text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            erros.descricao ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Descreva o serviço em detalhes..."
          disabled={isLoading}
        />
        {erros.descricao && (
          <p className="mt-1 text-sm text-red-600">{erros.descricao}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Duração média de captura */}
        <div>
          <label htmlFor="duracao_media_captura" className="block text-sm font-medium text-gray-700 mb-1">
            Duração Média de Captura *
          </label>
          <input
            type="text"
            id="duracao_media_captura"
            name="duracao_media_captura"
            value={formData.duracao_media_captura}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              erros.duracao_media_captura ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: 2 horas"
            disabled={isLoading}
          />
          {erros.duracao_media_captura && (
            <p className="mt-1 text-sm text-red-600">{erros.duracao_media_captura}</p>
          )}
        </div>
        
        {/* Duração média de tratamento */}
        <div>
          <label htmlFor="duracao_media_tratamento" className="block text-sm font-medium text-gray-700 mb-1">
            Duração Média de Tratamento *
          </label>
          <input
            type="text"
            id="duracao_media_tratamento"
            name="duracao_media_tratamento"
            value={formData.duracao_media_tratamento}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              erros.duracao_media_tratamento ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: 3 dias"
            disabled={isLoading}
          />
          {erros.duracao_media_tratamento && (
            <p className="mt-1 text-sm text-red-600">{erros.duracao_media_tratamento}</p>
          )}
        </div>
      </div>
      
      {/* Entregáveis */}
      <div>
        <label htmlFor="entregaveis" className="block text-sm font-medium text-gray-700 mb-1">
          Entregáveis *
        </label>
        <textarea
          id="entregaveis"
          name="entregaveis"
          value={formData.entregaveis}
          onChange={handleChange}
          rows={3}
          className={`w-full px-4 py-2 border rounded-md text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            erros.entregaveis ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ex: 20 fotos editadas em alta resolução, álbum digital..."
          disabled={isLoading}
        />
        {erros.entregaveis && (
          <p className="mt-1 text-sm text-red-600">{erros.entregaveis}</p>
        )}
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
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Fotos extras, álbum impresso, pôster..."
          disabled={isLoading}
        />
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
      
      {/* Botões de ação */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={`px-4 py-2 bg-blue-500 text-white rounded-md ${
            isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'
          } transition-colors`}
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};

export default ServicoForm;
