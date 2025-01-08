/// <reference types="astro/client" />

// Define as variáveis de ambiente
interface ImportMetaEnv {
    readonly BASE_URL: string; // Adicione outras variáveis, se necessário
    readonly SITE: string;     // Por exemplo, se `SITE` for usada
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  