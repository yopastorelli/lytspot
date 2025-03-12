# Infraestrutura Lytspot

Este documento descreve a infraestrutura do projeto Lytspot, incluindo ambientes, configuração de servidores e variáveis de ambiente.

## Ambientes

O projeto Lytspot opera em três ambientes distintos:

- **Desenvolvimento**: Ambiente local para desenvolvimento e testes
  - Frontend: `localhost:4321`
  - Backend: `localhost:3000`
  
- **Homologação**: Ambiente para testes de integração e validação
  - Frontend: [URL do ambiente de homologação]
  - Backend: [URL da API de homologação]
  
- **Produção**: Ambiente de produção acessível aos usuários finais
  - Frontend: `https://lytspot.com.br`
  - Backend: `https://api.lytspot.com.br`

## Configuração de Servidores

### Frontend (Astro)

- **Framework**: Astro com integração React
- **Hospedagem**: Vercel (otimizado para performance e CDN global)
- **Configuração**: Definida em `astro.config.mjs`
- **Estratégia de Build**: SSG (Static Site Generation) com componentes React interativos

### Backend (Node.js/Express)

- **Framework**: Node.js com Express.js
- **Hospedagem**: Render.com (servidor Node.js)
- **Banco de Dados**: PostgreSQL gerenciado
- **ORM**: Prisma
- **Configuração**: Definida em `server.js` e arquivos relacionados

## Detecção de Ambiente

O sistema utiliza um módulo centralizado (`environment.js`) para detectar o ambiente atual e configurar URLs e comportamentos adequados:

```javascript
// Exemplo simplificado do módulo environment.js
export const getEnvironment = () => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  } else if (hostname.includes('staging') || hostname.includes('homolog')) {
    return 'staging';
  } else {
    return 'production';
  }
};

export const getApiUrl = () => {
  const env = getEnvironment();
  
  switch (env) {
    case 'development':
      return 'http://localhost:3000';
    case 'staging':
      return 'https://api-staging.lytspot.com.br';
    case 'production':
      return 'https://api.lytspot.com.br';
    default:
      return 'http://localhost:3000';
  }
};
```

## Estratégia de Fallback

Para garantir a resiliência do sistema, implementamos uma estratégia de fallback para os componentes que dependem de dados da API:

1. Tentativa de conexão com a API principal
2. Em caso de falha, tentativa com endpoints alternativos
3. Se todas as tentativas falharem, uso de dados estáticos de demonstração

Esta estratégia é implementada no serviço de API centralizado (`api.js`) e utilizada em componentes como o `PriceSimulator`.

## Configuração CORS

A configuração CORS é adaptativa, variando de acordo com o ambiente:

- **Desenvolvimento**: Aceita qualquer origem (mais flexível para desenvolvimento)
- **Produção**: Lista específica de origens permitidas (mais seguro)

```javascript
// Exemplo da configuração CORS no servidor
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://lytspot.com.br', 'https://www.lytspot.com.br']
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

## Monitoramento e Logs

- **Logs de Aplicação**: Implementados via Winston
- **Monitoramento de Erros**: Sentry.io para captura e notificação de erros
- **Métricas de Performance**: Monitoramento básico de tempo de resposta da API

## Backup e Recuperação

- **Banco de Dados**: Backups automáticos diários
- **Código-fonte**: Versionado via Git
- **Arquivos Estáticos**: Armazenados com redundância no provedor de hospedagem

## Segurança

- **HTTPS**: Todas as comunicações são realizadas via HTTPS
- **Autenticação**: JWT (JSON Web Tokens) para autenticação segura
- **Proteção contra Ataques**: Implementação de rate limiting e validação de entrada
- **Armazenamento de Senhas**: Hashing seguro com bcrypt

## Próximos Passos

- Implementação de CDN para arquivos estáticos
- Configuração de CI/CD automatizado
- Implementação de monitoramento mais abrangente
- Melhoria na estratégia de cache
