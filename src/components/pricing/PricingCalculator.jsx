import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { getEnvironment } from '../../utils/environment';
import { servicosAPI } from '../../services/api';

/**
 * Componente de calculadora de preços para o simulador
 * @version 2.1.0 - 2025-03-15 - Adicionado formulário de contato integrado
 */
const PricingCalculator = ({ servicos }) => {
  const [quantidades, setQuantidades] = useState({});
  const [adicionais, setAdicionais] = useState([]);
  const [deslocamento, setDeslocamento] = useState(false);
  const [precoTotal, setPrecoTotal] = useState(0);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    metodoContato: 'email',
    mensagem: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState(null);

  // Lista de adicionais disponíveis
  const opcoesAdicionais = [
    { id: 1, nome: 'Fotos adicionais', valor: 50 },
    { id: 2, nome: 'Entrega expressa', valor: 100 },
    { id: 3, nome: 'Edição avançada', valor: 150 },
    { id: 4, nome: 'Versão para redes sociais', valor: 80 }
  ];

  // Inicializa as quantidades quando os serviços mudam
  useEffect(() => {
    const novasQuantidades = {};
    servicos.forEach(servico => {
      // Se já existe uma quantidade para este serviço, mantém. Senão, inicializa com 1
      novasQuantidades[servico.id] = quantidades[servico.id] || 1;
    });
    setQuantidades(novasQuantidades);
  }, [servicos]);

  // Calcula o preço total quando as opções mudam
  useEffect(() => {
    if (!servicos || servicos.length === 0) return;

    let total = 0;
    
    // Soma o preço de cada serviço multiplicado pela quantidade
    servicos.forEach(servico => {
      total += servico.preco_base * (quantidades[servico.id] || 1);
    });
    
    // Adiciona valores dos adicionais selecionados
    adicionais.forEach(adicionalId => {
      const adicional = opcoesAdicionais.find(a => a.id === adicionalId);
      if (adicional) {
        total += adicional.valor;
      }
    });
    
    // Adiciona taxa de deslocamento se selecionada
    if (deslocamento) {
      total += 120; // Valor fixo para simplificar
    }
    
    setPrecoTotal(total);
  }, [servicos, quantidades, adicionais, deslocamento]);

  // Formata valores monetários
  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Manipula a seleção de adicionais
  const toggleAdicional = (id) => {
    setAdicionais(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Atualiza a quantidade de um serviço
  const atualizarQuantidade = (servicoId, novaQuantidade) => {
    setQuantidades(prev => ({
      ...prev,
      [servicoId]: Math.max(1, novaQuantidade)
    }));
  };

  // Calcula o tempo médio de entrega (o maior entre todos os serviços)
  const calcularTempoEntrega = () => {
    if (!servicos || servicos.length === 0) return 0;
    
    return Math.max(...servicos.map(servico => servico.duracao_media || 0));
  };

  // Manipula mudanças nos campos do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Prepara os detalhes dos serviços selecionados para o email
  const prepararDetalhesServicos = () => {
    return servicos.map(servico => ({
      nome: servico.nome,
      quantidade: quantidades[servico.id] || 1,
      precoUnitario: servico.preco_base,
      precoTotal: servico.preco_base * (quantidades[servico.id] || 1)
    }));
  };

  // Prepara os detalhes dos adicionais selecionados para o email
  const prepararDetalhesAdicionais = () => {
    return adicionais.map(adicionalId => {
      const adicional = opcoesAdicionais.find(a => a.id === adicionalId);
      return {
        nome: adicional.nome,
        valor: adicional.valor
      };
    });
  };

  // Envia o formulário de orçamento
  const enviarOrcamento = async () => {
    setEnviando(true);
    setMensagemStatus(null);
    
    try {
      const env = getEnvironment();
      
      // Log para debug
      console.info("Enviando orçamento para API", {
        baseUrl: env.baseUrl,
        endpoint: `${env.baseUrl}/api/contact`,
        dados: {
          name: formData.nome, // Compatibilidade com o formato original
          email: formData.email,
          phone: formData.telefone, // Compatibilidade com o formato original
          message: formData.mensagem, // Compatibilidade com o formato original
          tipo: 'orcamento',
          nome: formData.nome,
          telefone: formData.telefone,
          mensagem: formData.mensagem,
          metodoContato: formData.metodoContato,
          servicos: prepararDetalhesServicos(),
          adicionais: prepararDetalhesAdicionais(),
          deslocamento: deslocamento ? { incluido: true, valor: 120 } : { incluido: false },
          precoTotal: precoTotal,
          tempoEstimado: calcularTempoEntrega()
        }
      });
      
      // Usar o método específico da API para enviar orçamentos
      // Isso garante que todas as configurações CORS sejam aplicadas corretamente
      const response = await servicosAPI.enviarOrcamento({
        name: formData.nome, // Compatibilidade com o formato original
        email: formData.email,
        phone: formData.telefone, // Compatibilidade com o formato original
        message: formData.mensagem, // Compatibilidade com o formato original
        tipo: 'orcamento',
        nome: formData.nome,
        telefone: formData.telefone,
        mensagem: formData.mensagem,
        metodoContato: formData.metodoContato,
        servicos: prepararDetalhesServicos(),
        adicionais: prepararDetalhesAdicionais(),
        deslocamento: deslocamento ? { incluido: true, valor: 120 } : { incluido: false },
        precoTotal: precoTotal,
        tempoEstimado: calcularTempoEntrega()
      });
      
      // Verificar se a resposta foi bem-sucedida
      // A API retorna diretamente os dados, não um objeto com status
      console.info("Resposta do envio de orçamento:", response);
      
      if (response && response.success) {
        console.info("Orçamento enviado com sucesso", response);
        setMensagemStatus({
          tipo: 'sucesso',
          texto: 'Orçamento enviado com sucesso! Entraremos em contato em breve.'
        });
        
        // Limpar formulário
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          metodoContato: 'email',
          mensagem: ''
        });
        
        // Registrar evento de analytics
        try {
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'orcamento_enviado', {
              'event_category': 'formulario',
              'event_label': 'orcamento'
            });
          }
        } catch (analyticsError) {
          console.error("Erro ao registrar evento de analytics:", analyticsError);
        }
      } else {
        throw new Error(response?.message || 'Erro ao enviar orçamento');
      }
    } catch (error) {
      console.error("Erro ao enviar orçamento:", error);
      
      // Mensagem de erro mais descritiva
      let mensagemErro = 'Ocorreu um erro ao enviar o orçamento. Por favor, tente novamente mais tarde.';
      
      // Se for um erro de CORS, fornecer uma mensagem mais específica
      if (error.message && (
        error.message.includes('Network Error') || 
        error.message.includes('CORS') ||
        error.message.includes('cross-origin')
      )) {
        mensagemErro = 'Erro de conexão com o servidor. Por favor, verifique sua conexão e tente novamente.';
      }
      
      setMensagemStatus({
        tipo: 'erro',
        texto: mensagemErro
      });
    } finally {
      setEnviando(false);
    }
  };

  if (!servicos || servicos.length === 0) return null;

  // Verifica se há itens selecionados (serviços, adicionais ou deslocamento)
  const temItensSelecionados = 
    Object.values(quantidades).some(q => q > 0) || 
    adicionais.length > 0 || 
    deslocamento;

  return (
    <div className={`rounded-lg shadow-md p-6 border border-gray-200 ${temItensSelecionados ? 'bg-blue-50' : 'bg-white'}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Calculadora de Preço</h2>
      
      {/* Lista de serviços selecionados */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Serviços Selecionados
        </h3>
        
        {servicos.map(servico => (
          <div key={servico.id} className="border-b border-gray-100 pb-4">
            <div className="flex justify-between mb-2">
              <h4 className="font-medium text-gray-800">{servico.nome}</h4>
              <span className="text-blue-600 font-medium">
                {formatMoney(servico.preco_base)}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{servico.descricao}</p>
            
            {/* Controle de quantidade */}
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-3">Quantidade:</span>
              <div className="flex items-center">
                <button 
                  onClick={() => atualizarQuantidade(servico.id, (quantidades[servico.id] || 1) - 1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-l text-sm"
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1"
                  value={quantidades[servico.id] || 1}
                  onChange={(e) => atualizarQuantidade(servico.id, parseInt(e.target.value) || 1)}
                  className="w-12 py-1 px-2 text-center border-t border-b border-gray-300 text-sm"
                />
                <button 
                  onClick={() => atualizarQuantidade(servico.id, (quantidades[servico.id] || 1) + 1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-r text-sm"
                >
                  +
                </button>
              </div>
              <span className="ml-auto font-medium text-gray-700">
                {formatMoney(servico.preco_base * (quantidades[servico.id] || 1))}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-6">
        {/* Adicionais */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Adicionais
          </label>
          <div className="space-y-2">
            {opcoesAdicionais.map(opcao => (
              <div key={opcao.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`adicional-${opcao.id}`}
                  checked={adicionais.includes(opcao.id)}
                  onChange={() => toggleAdicional(opcao.id)}
                  className="mr-2"
                />
                <label htmlFor={`adicional-${opcao.id}`} className="flex justify-between w-full text-gray-700">
                  <span>{opcao.nome}</span>
                  <span className="font-medium">{formatMoney(opcao.valor)}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Deslocamento */}
        <div className="mt-0">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={deslocamento}
              onChange={() => setDeslocamento(prev => !prev)}
              className="mr-2"
            />
            <span className="text-gray-700">Incluir taxa de deslocamento</span>
            <span className="ml-auto font-medium">{formatMoney(120)}</span>
          </label>
        </div>
        
        {/* Total */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total:</span>
            <span className="text-2xl font-bold text-blue-600">{formatMoney(precoTotal)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Tempo estimado de entrega: {calcularTempoEntrega()} dias
          </p>
        </div>
        
        {/* Formulário de contato */}
        <form onSubmit={(e) => {
          e.preventDefault();
          
          // Validação básica
          if (!formData.nome || !formData.email || (formData.metodoContato === 'telefone' && !formData.telefone)) {
            setMensagemStatus({
              tipo: 'erro',
              texto: 'Por favor, preencha todos os campos obrigatórios.'
            });
            return;
          }
          
          // Enviar orçamento
          enviarOrcamento();
        }} className="space-y-4 border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Solicitar Orçamento Detalhado
          </h3>
          
          {/* Campos de contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="md:col-span-1">
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone {formData.metodoContato === 'telefone' || formData.metodoContato === 'whatsapp' ? '*' : ''}
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={formData.metodoContato === 'telefone' || formData.metodoContato === 'whatsapp'}
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de contato preferido *
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="metodoContato"
                    value="email"
                    checked={formData.metodoContato === 'email'}
                    onChange={handleInputChange}
                    className="form-radio h-4 w-4 text-blue-600"
                    required
                  />
                  <span className="ml-1 text-sm text-gray-700">E-mail</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="metodoContato"
                    value="telefone"
                    checked={formData.metodoContato === 'telefone'}
                    onChange={handleInputChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-1 text-sm text-gray-700">Telefone</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="metodoContato"
                    value="whatsapp"
                    checked={formData.metodoContato === 'whatsapp'}
                    onChange={handleInputChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-1 text-sm text-gray-700">WhatsApp</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Campo de mensagem */}
          <div>
            <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-1">
              Detalhes adicionais ou dúvidas
            </label>
            <textarea
              id="mensagem"
              name="mensagem"
              value={formData.mensagem}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          {/* Mensagem de status */}
          {mensagemStatus && (
            <div className={`p-3 rounded ${mensagemStatus.tipo === 'sucesso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {mensagemStatus.texto}
            </div>
          )}
          
          {/* Botão de envio */}
          <button 
            type="submit" 
            disabled={enviando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200 disabled:opacity-70"
          >
            {enviando ? 'Enviando...' : 'Solicitar Orçamento Detalhado'}
          </button>
        </form>
      </div>
    </div>
  );
};

PricingCalculator.propTypes = {
  servicos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nome: PropTypes.string.isRequired,
      descricao: PropTypes.string.isRequired,
      preco_base: PropTypes.number.isRequired,
      duracao_media: PropTypes.number.isRequired
    })
  ).isRequired
};

export default PricingCalculator;
