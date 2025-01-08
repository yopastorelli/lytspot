/// <reference types="vite/client" />

// Declaração de variáveis do ambiente
interface ImportMetaEnv {
    readonly BASE_URL: string; // Adicione outras variáveis conforme necessário
    readonly [key: string]: string | undefined; // Permite variáveis adicionais
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv; // Extensão da interface para incluir "env"
  }
  