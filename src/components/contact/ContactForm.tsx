import React, { useState } from 'react';
import { validateEmail, validatePhone, validateRequired } from '../../utils/validation';
import axios from 'axios';
import { getEnvironment, getApiUrl } from '../../utils/environment';

// Definição da interface do ambiente para tipagem
interface Environment {
  type: string;
  isDev: boolean;
  isProd: boolean;
  baseUrl: string;
  prodApiUrl?: string;
  hostname?: string;
  href?: string;
  origin?: string;
}

/**
 * Interface para os dados do formulário
 * @version 1.0.2 - 2025-03-16
 */
interface FormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

/**
 * Interface para os erros do formulário
 */
interface FormErrors {
  [key: string]: string;
}

/**
 * Componente de formulário de contato
 * @version 1.0.5 - 2025-03-16 - Corrigido o endpoint da API e problemas de CORS
 * @returns {JSX.Element} Formulário de contato renderizado
 */
const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateRequired(formData.name)) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!validatePhone(formData.phone)) {
      newErrors.phone = "Telefone inválido";
    }

    if (!validateRequired(formData.service)) {
      newErrors.service = "Selecione um serviço";
    }

    if (!validateRequired(formData.message)) {
      newErrors.message = "Mensagem é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.warn("Tentativa de envio com validação falha", formData);
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    console.info("Tentativa de envio do formulário", formData);

    try {
      // Obter a URL da API usando a nova função getApiUrl
      const apiUrl = getApiUrl('contact');
      
      // Log para debug da URL da API
      console.info("Enviando formulário para API", {
        apiUrl,
        origin: window.location.origin
      });
      
      // Configuração do axios para esta requisição específica
      const axiosConfig = {
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'lytspot-contact-form',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        withCredentials: true
      };
      
      // Usando o axios diretamente para evitar problemas de tipagem
      const response = await axios.post(apiUrl, formData, axiosConfig);
      
      if (response.status === 200 || response.status === 201) {
        console.info("Mensagem enviada com sucesso", response.data);
        setSuccessMessage("Mensagem enviada com sucesso!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "",
          message: "",
        });
        // Resetar contador de tentativas após sucesso
        setRetryCount(0);
      } else {
        console.error("Erro no envio da mensagem", response.data.error);
        setErrorMessage(response.data.error || "Erro ao enviar a mensagem.");
      }
    } catch (error: any) {
      console.error("Erro inesperado no envio", error);
      
      // Tratamento de erro mais detalhado
      if (error.response) {
        // O servidor respondeu com um status de erro
        setErrorMessage(`Erro ${error.response.status}: ${error.response.data?.message || 'Falha ao enviar mensagem'}`);
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        setErrorMessage("Não foi possível conectar ao servidor. Verifique sua conexão.");
        
        // Implementar retry com exponential backoff
        if (retryCount < MAX_RETRIES) {
          const nextRetryCount = retryCount + 1;
          setRetryCount(nextRetryCount);
          
          const delay = Math.pow(2, nextRetryCount) * 1000; // 2s, 4s, 8s
          console.info(`Tentando novamente em ${delay/1000} segundos (tentativa ${nextRetryCount}/${MAX_RETRIES})...`);
          
          setTimeout(() => {
            handleSubmit(e);
          }, delay);
          
          setErrorMessage(`Tentando novamente em ${delay/1000} segundos...`);
          return;
        }
      } else {
        // Erro na configuração da requisição
        setErrorMessage("Erro ao preparar o envio da mensagem.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpa o erro específico quando o campo é alterado
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Entre em contato</h2>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome completo *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Seu nome completo"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="seu.email@exemplo.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefone *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="(00) 00000-0000"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
        
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
            Serviço de interesse *
          </label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.service ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Selecione um serviço</option>
            <option value="website">Website</option>
            <option value="ecommerce">E-commerce</option>
            <option value="app">Aplicativo</option>
            <option value="marketing">Marketing Digital</option>
            <option value="design">Design Gráfico</option>
            <option value="other">Outro</option>
          </select>
          {errors.service && <p className="mt-1 text-sm text-red-600">{errors.service}</p>}
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Mensagem *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.message ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Descreva seu projeto ou necessidade"
          ></textarea>
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Enviando..." : "Enviar mensagem"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
