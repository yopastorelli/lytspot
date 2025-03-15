import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { getEnvironment, getApiUrl } from '../../utils/environment';
import { servicosAPI } from '../../services/api';

/**
 * Componente de calculadora de preços para o simulador
 * @version 2.2.0 - 2025-03-16 - Corrigido problema de CORS e melhorado tratamento de erros
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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

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
  const enviarOrcamento = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome || !formData.email || (formData.metodoContato === 'telefone' && !formData.telefone)) {
      setMensagemStatus({
        tipo: 'erro',
        texto: 'Por favor, preencha todos os campos obrigatórios.'
      });
      return;
    }

    setEnviando(true);
    setMensagemStatus(null);

    try {
      // Preparar dados do orçamento
      const dadosOrcamento = {
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
      };

      // Obter a URL da API usando a nova função getApiUrl
      const apiUrl = getApiUrl('contact');
      
      // Log para debug
      console.info("Enviando orçamento para API", {
        apiUrl,
        origem: window.location.origin,
        dados: dadosOrcamento
      });
      
      // Usar o método específico da API para enviar orçamentos
      // Isso garante que todas as configurações CORS sejam aplicadas corretamente
      const response = await servicosAPI.enviarOrcamento(dadosOrcamento);
      
      if (response.status === 200 || response.status === 201) {
        console.info("Orçamento enviado com sucesso", response.data);
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
        
        // Resetar contador de tentativas
        setRetryCount(0);
      } else {
        throw new Error('Erro ao enviar orçamento');
      }
    } catch (error) {
      console.error("Erro ao enviar orçamento:", error);
      
      // Tratamento de erro mais detalhado
      if (error.response) {
        // O servidor respondeu com um status de erro
        setMensagemStatus({
          tipo: 'erro',
          texto: `Erro ${error.response.status}: ${error.response.data?.message || 'Falha ao enviar orçamento'}`
        });
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        setMensagemStatus({
          tipo: 'erro',
          texto: 'Não foi possível conectar ao servidor. Verifique sua conexão.'
        });
        
        // Implementar retry com exponential backoff
        if (retryCount < MAX_RETRIES) {
          const nextRetryCount = retryCount + 1;
          setRetryCount(nextRetryCount);
          
          const delay = Math.pow(2, nextRetryCount) * 1000; // 2s, 4s, 8s
          console.info(`Tentando novamente em ${delay/1000} segundos (tentativa ${nextRetryCount}/${MAX_RETRIES})...`);
          
          setTimeout(() => {
            enviarOrcamento(e);
          }, delay);
          
          setMensagemStatus({
            tipo: 'info',
            texto: `Tentando novamente em ${delay/1000} segundos...`
          });
          
          setEnviando(false);
          return;
        }
      } else {
        // Erro na configuração da requisição
        setMensagemStatus({
          tipo: 'erro',
          texto: 'Erro ao preparar o envio do orçamento.'
        });
      }
    } finally {
      setEnviando(false);
    }
  };

  if (!servicos || servicos.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
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
            </div>
          </div>
        ))}
      </div>
      
      {/* Opções adicionais */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Opções Adicionais
        </h3>
        
        <div className="space-y-2">
          {opcoesAdicionais.map(adicional => (
            <div key={adicional.id} className="flex items-center">
              <input
                type="checkbox"
                id={`adicional-${adicional.id}`}
                checked={adicionais.includes(adicional.id)}
                onChange={() => toggleAdicional(adicional.id)}
                className="mr-2 h-4 w-4 text-blue-600"
              />
              <label htmlFor={`adicional-${adicional.id}`} className="flex justify-between w-full text-sm">
                <span>{adicional.nome}</span>
                <span className="text-blue-600 font-medium">{formatMoney(adicional.valor)}</span>
              </label>
            </div>
          ))}
          
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="deslocamento"
              checked={deslocamento}
              onChange={() => setDeslocamento(!deslocamento)}
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <label htmlFor="deslocamento" className="flex justify-between w-full text-sm">
              <span>Taxa de deslocamento</span>
              <span className="text-blue-600 font-medium">{formatMoney(120)}</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Resumo */}
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Total Estimado:</h3>
          <span className="text-xl font-bold text-blue-700">{formatMoney(precoTotal)}</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Tempo estimado de entrega: {calcularTempoEntrega()} dias
        </p>
      </div>
      
      {/* Formulário de contato */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Solicitar Orçamento
        </h3>
        
        {mensagemStatus && (
          <div className={`p-3 mb-4 rounded ${
            mensagemStatus.tipo === 'sucesso' ? 'bg-green-100 text-green-700' : 
            mensagemStatus.tipo === 'erro' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {mensagemStatus.texto}
          </div>
        )}
        
        <form onSubmit={enviarOrcamento} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo *
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
          
          <div>
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
          
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone {formData.metodoContato === 'telefone' ? '*' : ''}
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={formData.metodoContato === 'telefone'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de contato preferido *
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="metodoContato"
                  value="email"
                  checked={formData.metodoContato === 'email'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">E-mail</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="metodoContato"
                  value="telefone"
                  checked={formData.metodoContato === 'telefone'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Telefone</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="metodoContato"
                  value="whatsapp"
                  checked={formData.metodoContato === 'whatsapp'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">WhatsApp</span>
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem adicional
            </label>
            <textarea
              id="mensagem"
              name="mensagem"
              value={formData.mensagem}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          <button
            type="submit"
            disabled={enviando}
            className={`w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              enviando ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {enviando ? 'Enviando...' : 'Solicitar Orçamento'}
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
      descricao: PropTypes.string,
      preco_base: PropTypes.number.isRequired,
      duracao_media: PropTypes.number
    })
  ).isRequired
};

export default PricingCalculator;
