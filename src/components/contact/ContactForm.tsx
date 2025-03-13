import React, { useState } from 'react';
import { validateEmail, validatePhone, validateRequired } from '../../utils/validation';
import axios from 'axios';
import { getEnvironment } from '../../utils/environment';

// Definição da interface do ambiente para tipagem
interface Environment {
  type: string;
  isDev: boolean;
  baseUrl: string;
  prodApiUrls?: string[];
  hostname?: string;
  href?: string;
}

/**
 * Interface para os dados do formulário
 * @version 1.0.1 - 2025-03-12
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
 * @version 1.0.4 - 2025-03-12 - Corrigido o endpoint da API e problemas de tipagem
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
      // Obter a URL base do ambiente
      const env = getEnvironment() as Environment;
      
      // Usando o axios diretamente para evitar problemas de tipagem
      // A rota no servidor está definida como /api/contact (linha 172 do server.js)
      const response = await axios.post(`${env.baseUrl.includes('/api') ? env.baseUrl.replace('/api', '') : env.baseUrl}/api/contact`, formData);
      
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
      } else {
        console.error("Erro no envio da mensagem", response.data.error);
        setErrorMessage(response.data.error || "Erro ao enviar a mensagem.");
      }
    } catch (error: any) {
      console.error("Erro inesperado no envio", error);
      
      // Tratamento de erro mais detalhado
      if (error.response) {
        // O servidor respondeu com um status de erro
        setErrorMessage(`Erro ${error.response.status}: ${error.response.data.message || 'Falha ao enviar mensagem'}`);
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        setErrorMessage("Não foi possível conectar ao servidor. Verifique sua conexão.");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-dark-lighter mb-1">
          Nome
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* E-mail */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-dark-lighter mb-1">
          E-mail
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Telefone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-dark-lighter mb-1">
          Telefone
        </label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary ${
            errors.phone ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      {/* Serviço */}
      <div>
        <label htmlFor="service" className="block text-sm font-medium text-dark-lighter mb-1">
          Serviço
        </label>
        <select
          id="service"
          name="service"
          value={formData.service}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary ${
            errors.service ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Selecione um serviço</option>
          <option value="Serviço 1">Festas e comemorações</option>
          <option value="Serviço 2">Imagens corporativas</option>
          <option value="Serviço 3">Arquitetura</option>
          <option value="Serviço 4">Projetos especiais</option>
          <option value="Serviço 5">Aventuras em família</option>
          <option value="Serviço 6">Aventuras entre amigos</option>
          <option value="Serviço 7">Outros assuntos</option>
        </select>
        {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service}</p>}
      </div>

      {/* Mensagem */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-dark-lighter mb-1">
          Mensagem
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary ${
            errors.message ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
      </div>

      {/* Botão Enviar */}
      <button
        type="submit"
        className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
      </button>

      {successMessage && <p className="text-green-500 text-sm mt-4">{successMessage}</p>}
      {errorMessage && <p className="text-red-500 text-sm mt-4">{errorMessage}</p>}
    </form>
  );
}

export default ContactForm;
