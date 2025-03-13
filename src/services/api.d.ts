/**
 * Definições de tipos para o serviço de API
 * @version 1.0.0 - 2025-03-12
 */
import { AxiosInstance, AxiosResponse } from 'axios';

// Estendendo o tipo AxiosInstance para incluir todos os métodos necessários
interface ApiInstance extends AxiosInstance {
  post<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: any): Promise<R>;
  get<T = any, R = AxiosResponse<T>>(url: string, config?: any): Promise<R>;
  put<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: any): Promise<R>;
  delete<T = any, R = AxiosResponse<T>>(url: string, config?: any): Promise<R>;
  patch<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: any): Promise<R>;
}

// Definição para o serviço de API
declare const api: ApiInstance;

// Definição para os serviços específicos
interface ServicosAPI {
  listar: () => Promise<AxiosResponse>;
  obter: (id: string | number) => Promise<AxiosResponse>;
  criar: (dados: any) => Promise<AxiosResponse>;
  atualizar: (id: string | number, dados: any) => Promise<AxiosResponse>;
  excluir: (id: string | number) => Promise<AxiosResponse>;
}

interface AuthAPI {
  login: (credenciais: { email: string; senha: string }) => Promise<AxiosResponse>;
  registro: (dados: any) => Promise<AxiosResponse>;
  verificarToken: () => Promise<AxiosResponse>;
}

export { ServicosAPI, AuthAPI };
export default api;
