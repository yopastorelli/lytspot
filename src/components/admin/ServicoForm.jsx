import React, { useState, useEffect } from 'react';

/**
 * Componente de formulário para adicionar e editar serviços
 * @version 1.2.0 - Compatível com PriceSimulator 2.8.0
 */
const ServicoForm = ({ servicoInicial, onSubmit, onCancel }) => {
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
  
  // Estado para armazenar o status de carregamento
  const [loading, setLoading] = useState(false);

  // Inicializar o formulário com os dados do serviço em edição, se houver
  useEffect(() => {
    if (servicoInicial) {
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
          valor_deslocamento: servicoInicial.detalhes?.deslocamento || ''
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
          valor_deslocamento: servicoInicial.valor_deslocamento || ''
        });
      }
    }
  }, [servicoInicial]);

  // Função para atualizar os dados do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Limpar o erro de validação do campo quando ele for alterado
    if (errosValidacao[name]) {
      setErrosValidacao(prevErros => ({
        ...prevErros,
        [name]: null
      }));
    }
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Função para validar o formulário
  const validarFormulario = () => {
    const erros = {};
    
    // Validar campos obrigatórios
    if (!formData.nome.trim()) {
      erros.nome = 'O nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      erros.nome = 'O nome deve ter pelo menos 3 caracteres';
    }
    
    if (!formData.descricao.trim()) {
      erros.descricao = 'A descrição é obrigatória';
    }
    
    if (!formData.preco_base.trim()) {
      erros.preco_base = 'O preço base é obrigatório';
    } else if (isNaN(parseFloat(formData.preco_base)) || parseFloat(formData.preco_base) <= 0) {
      erros.preco_base = 'O preço base deve ser um número positivo';
    }
    
    if (!formData.duracao_media_captura.trim()) {
      erros.duracao_media_captura = 'A duração média de captura é obrigatória';
    }
    
    if (!formData.duracao_media_tratamento.trim()) {
      erros.duracao_media_tratamento = 'A duração média de tratamento é obrigatória';
    }
    
    if (!formData.entregaveis.trim()) {
      erros.entregaveis = 'Os entregáveis são obrigatórios';
    }
    
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
      setLoading(true);
      
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
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="col-span-1">
          <label htmlFor="nome" className="block text-light font-medium mb-2">
            Nome do Serviço <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className={`w-full bg-dark border rounded-md py-2 px-3 text-light focus:outline-none focus:border-primary transition-colors ${
              errosValidacao.nome ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="Ex: Ensaio Fotográfico Pessoal"
          />
          {errosValidacao.nome && (
            <p className="mt-1 text-red-400 text-sm">{errosValidacao.nome}</p>
          )}
        </div>
        
        <div className="col-span-1">
          <label htmlFor="preco_base" className="block text-light font-medium mb-2">
            Preço Base (R$) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            id="preco_base"
            name="preco_base"
            value={formData.preco_base}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={`w-full bg-dark border rounded-md py-2 px-3 text-light focus:outline-none focus:border-primary transition-colors ${
              errosValidacao.preco_base ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="Ex: 299.90"
          />
          {errosValidacao.preco_base && (
            <p className="mt-1 text-red-400 text-sm">{errosValidacao.preco_base}</p>
          )}
        </div>
        
        <div className="col-span-2">
          <label htmlFor="descricao" className="block text-light font-medium mb-2">
            Descrição <span className="text-red-400">*</span>
          </label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            rows="3"
            className={`w-full bg-dark border rounded-md py-2 px-3 text-light focus:outline-none focus:border-primary transition-colors ${
              errosValidacao.descricao ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="Descreva o serviço brevemente"
          ></textarea>
          {errosValidacao.descricao && (
            <p className="mt-1 text-red-400 text-sm">{errosValidacao.descricao}</p>
          )}
        </div>
        
        <div className="col-span-1">
          <label htmlFor="duracao_media_captura" className="block text-light font-medium mb-2">
            Duração Média de Captura <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="duracao_media_captura"
            name="duracao_media_captura"
            value={formData.duracao_media_captura}
            onChange={handleChange}
            className={`w-full bg-dark border rounded-md py-2 px-3 text-light focus:outline-none focus:border-primary transition-colors ${
              errosValidacao.duracao_media_captura ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="Ex: 2h-4h"
          />
          {errosValidacao.duracao_media_captura && (
            <p className="mt-1 text-red-400 text-sm">{errosValidacao.duracao_media_captura}</p>
          )}
        </div>
        
        <div className="col-span-1">
          <label htmlFor="duracao_media_tratamento" className="block text-light font-medium mb-2">
            Duração Média de Tratamento <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="duracao_media_tratamento"
            name="duracao_media_tratamento"
            value={formData.duracao_media_tratamento}
            onChange={handleChange}
            className={`w-full bg-dark border rounded-md py-2 px-3 text-light focus:outline-none focus:border-primary transition-colors ${
              errosValidacao.duracao_media_tratamento ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="Ex: 8h-12h"
          />
          {errosValidacao.duracao_media_tratamento && (
            <p className="mt-1 text-red-400 text-sm">{errosValidacao.duracao_media_tratamento}</p>
          )}
        </div>
        
        <div className="col-span-2">
          <label htmlFor="entregaveis" className="block text-light font-medium mb-2">
            Entregáveis <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="entregaveis"
            name="entregaveis"
            value={formData.entregaveis}
            onChange={handleChange}
            className={`w-full bg-dark border rounded-md py-2 px-3 text-light focus:outline-none focus:border-primary transition-colors ${
              errosValidacao.entregaveis ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="Ex: 30 fotos tratadas"
          />
          {errosValidacao.entregaveis && (
            <p className="mt-1 text-red-400 text-sm">{errosValidacao.entregaveis}</p>
          )}
        </div>
        
        <div className="col-span-1">
          <label htmlFor="possiveis_adicionais" className="block text-light font-medium mb-2">
            Possíveis Adicionais
          </label>
          <input
            type="text"
            id="possiveis_adicionais"
            name="possiveis_adicionais"
            value={formData.possiveis_adicionais}
            onChange={handleChange}
            className="w-full bg-dark border border-gray-700 rounded-md py-2 px-3 text-light focus:outline-none focus:border-primary transition-colors"
            placeholder="Ex: Álbum físico, fotos extras"
          />
        </div>
        
        <div className="col-span-1">
          <label htmlFor="valor_deslocamento" className="block text-light font-medium mb-2">
            Valor de Deslocamento
          </label>
          <input
            type="text"
            id="valor_deslocamento"
            name="valor_deslocamento"
            value={formData.valor_deslocamento}
            onChange={handleChange}
            className="w-full bg-dark border border-gray-700 rounded-md py-2 px-3 text-light focus:outline-none focus:border-primary transition-colors"
            placeholder="Ex: R$1,20/km excedente"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-transparent hover:bg-gray-700/50 text-light font-medium py-2 px-4 rounded-md transition-colors"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={loading}
          className={`bg-primary hover:bg-primary-light text-dark font-medium py-2 px-6 rounded-md transition-colors ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-dark mr-2"></span>
              Salvando...
            </span>
          ) : (
            servicoInicial ? 'Atualizar Serviço' : 'Adicionar Serviço'
          )}
        </button>
      </div>
    </form>
  );
};

export default ServicoForm;
