# Arquitetura do Backend

## Visão Geral

O backend do Lytspot é construído com Node.js e Express.js, utilizando uma arquitetura RESTful para fornecer serviços ao frontend. O sistema utiliza Prisma como ORM para interação com o banco de dados PostgreSQL e implementa autenticação via JWT (JSON Web Tokens).

## Estrutura de Diretórios

```
/server
├── controllers/           # Controladores da lógica de negócios
│   ├── authController.js  # Autenticação e gerenciamento de usuários
│   ├── contactController.js # Processamento de formulários de contato
│   └── pricingController.js # Gerenciamento de serviços e preços
├── middleware/            # Middleware para funcionalidades transversais
│   ├── auth.js            # Middleware de autenticação JWT
│   ├── cache.js           # Middleware de cache para melhorar performance
│   └── validation.js      # Validação de entrada para rotas
├── routes/                # Definição de rotas da API
│   ├── auth.js            # Rotas de autenticação
│   ├── contact.js         # Rotas para formulário de contato
│   ├── pricing.js         # Rotas para serviços e preços
│   └── sync.js            # Rotas para sincronização de dados
├── prisma/                # Configuração e modelos do Prisma
│   ├── schema.prisma      # Definição do schema do banco de dados
│   └── migrations/        # Migrações do banco de dados
├── utils/                 # Utilitários e helpers
│   ├── email.js           # Serviço de envio de emails
│   └── logger.js          # Configuração de logging
└── server.js              # Ponto de entrada do servidor
```

## Fluxo de Dados

O fluxo de dados no backend segue o padrão MVC (Model-View-Controller):

1. **Requisição HTTP**: Cliente envia requisição para uma rota específica
2. **Middleware**: A requisição passa por middleware (auth, validation, etc.)
3. **Router**: O router direciona a requisição para o controlador apropriado
4. **Controller**: O controlador processa a lógica de negócios
5. **Model (Prisma)**: Interação com o banco de dados via Prisma
6. **Resposta**: O controlador retorna uma resposta HTTP ao cliente

## Componentes Principais

### Controllers

Os controladores implementam a lógica de negócios da aplicação:

#### authController.js

Responsável pela autenticação e gerenciamento de usuários:

- `register`: Registro de novos usuários
- `login`: Autenticação de usuários e geração de tokens JWT
- `verifyToken`: Verificação da validade de tokens JWT

```javascript
// Exemplo simplificado do método de login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Verificar a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
    
    return res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
```

#### pricingController.js

Gerencia os serviços e preços disponíveis:

- `getServices`: Retorna todos os serviços
- `getServiceById`: Retorna um serviço específico
- `createService`: Cria um novo serviço
- `updateService`: Atualiza um serviço existente
- `deleteService`: Remove um serviço

#### contactController.js

Processa os formulários de contato:

- `submitContact`: Recebe dados do formulário e envia email

### Middleware

#### auth.js

Middleware de autenticação que verifica a validade dos tokens JWT:

```javascript
const authMiddleware = (req, res, next) => {
  try {
    // Obter o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adicionar usuário decodificado à requisição
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};
```

#### cache.js

O middleware de cache é responsável por armazenar e recuperar respostas da API, reduzindo o tempo de resposta e a carga no banco de dados:

- Utiliza `node-cache` para armazenamento em memória
- Implementa TTL (Time-To-Live) configurável por rota
- Possui mecanismo de versão para invalidação rápida do cache
- Inclui logs detalhados para monitoramento de hits e misses

```javascript
// Exemplo simplificado do middleware de cache
const cacheMiddleware = (ttl = 30) => {
  return (req, res, next) => {
    // Pular cache para métodos não-GET ou se o cache estiver desativado
    if (req.method !== 'GET' || process.env.DISABLE_CACHE === 'true') {
      return next();
    }

    const key = `${req.originalUrl}_v${cacheVersion}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      // Cache hit - retornar resposta armazenada
      logger.info(`[CACHE] HIT: ${key}`);
      return res.status(200).json(cachedResponse);
    }

    // Cache miss - interceptar a resposta para armazenar no cache
    logger.info(`[CACHE] MISS: ${key}`);
    const originalSend = res.send;
    res.send = function(body) {
      try {
        const parsedBody = JSON.parse(body);
        cache.set(key, parsedBody, ttl);
        logger.info(`[CACHE] STORED: ${key} (TTL: ${ttl}s)`);
      } catch (error) {
        logger.error(`[CACHE] ERROR storing cache: ${error.message}`);
      }
      originalSend.call(this, body);
    };
    
    next();
  };
};
```

#### validation.js

{{ ... }}

### Routes

As rotas definem os endpoints da API e conectam as requisições aos controladores:

#### auth.js

```javascript
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validationMiddleware = require('../middleware/validation');

// Rota de registro
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
    body('nome').notEmpty().withMessage('O nome é obrigatório')
  ],
  validationMiddleware,
  authController.register
);

// Rota de login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('A senha é obrigatória')
  ],
  validationMiddleware,
  authController.login
);

// Rota para verificar token
router.get('/verify', authController.verifyToken);

module.exports = router;
```

#### pricing.js

```javascript
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const pricingController = require('../controllers/pricingController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const cacheMiddleware = require('../middleware/cache');

// Rotas públicas
router.get('/', cacheMiddleware(600), pricingController.getServices);
router.get('/:id', cacheMiddleware(600), pricingController.getServiceById);

// Rotas protegidas (requerem autenticação)
router.post(
  '/',
  authMiddleware,
  [
    body('nome').notEmpty().withMessage('O nome é obrigatório'),
    body('preco_base').isNumeric().withMessage('O preço base deve ser um número')
  ],
  validationMiddleware,
  pricingController.createService
);

router.put(
  '/:id',
  authMiddleware,
  [
    body('nome').notEmpty().withMessage('O nome é obrigatório'),
    body('preco_base').isNumeric().withMessage('O preço base deve ser um número')
  ],
  validationMiddleware,
  pricingController.updateService
);

router.delete('/:id', authMiddleware, pricingController.deleteService);

module.exports = router;
```

### Sistema de Cache

O sistema de cache é um componente crítico para a performance da API, especialmente para endpoints frequentemente acessados como `/api/pricing`. Ele consiste em:

#### Componentes do Sistema de Cache

1. **Middleware de Cache (`middleware/cache.js`)**
   - Implementa o armazenamento e recuperação de respostas da API
   - Configura TTL específico por rota
   - Registra estatísticas de uso (hits, misses)

2. **Rota de Gerenciamento de Cache (`routes/cache.js`)**
   - Fornece endpoints para verificar o status do cache
   - Permite limpar o cache manualmente ou programaticamente

3. **Mecanismo de Invalidação**
   - Versão global incrementada a cada limpeza de cache
   - Invalidação automática baseada em TTL
   - Invalidação explícita após atualizações no banco de dados

4. **Integração com Scripts de Atualização**
   - Scripts de atualização de serviços limpam o cache automaticamente
   - Garante que os dados mais recentes sejam servidos após atualizações

#### Fluxo de Dados com Cache

1. **Requisição Recebida**: Cliente envia requisição para um endpoint
2. **Verificação de Cache**: Middleware verifica se há uma resposta em cache válida
3. **Cache Hit**: Se encontrado, retorna imediatamente a resposta armazenada
4. **Cache Miss**: Se não encontrado, processa a requisição normalmente
5. **Armazenamento em Cache**: Após processamento, armazena a resposta no cache
6. **Invalidação**: Cache é invalidado após atualizações ou expiração do TTL

#### Estratégia de Cache por Endpoint

| Endpoint | TTL | Observações |
|----------|-----|-------------|
| `/api/pricing` | 30s | Dados de serviços e preços |
| `/api/pricing/:id` | 30s | Detalhes de serviço específico |
| `/api/contact` | Sem cache | Dados dinâmicos de formulário |
| `/api/auth/*` | Sem cache | Endpoints de autenticação |

## Banco de Dados

O projeto utiliza PostgreSQL como banco de dados relacional, com Prisma como ORM para facilitar a interação com o banco de dados.

### Schema Prisma

```prisma
// Exemplo simplificado do schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  nome      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Servico {
  id                     Int      @id @default(autoincrement())
  nome                   String
  descricao              String?
  preco_base             Float
  duracao_media_captura  String?
  duracao_media_tratamento String?
  entregaveis            String?
  possiveis_adicionais   String?
  valor_deslocamento     String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}
```

## Segurança

### Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:

1. O usuário faz login com email e senha
2. O servidor verifica as credenciais e gera um token JWT
3. O cliente armazena o token e o envia em requisições subsequentes
4. O middleware de autenticação verifica a validade do token

### Proteção de Dados

- Senhas são armazenadas com hash usando bcrypt
- Validação de entrada em todas as rotas
- Proteção contra ataques comuns (CSRF, XSS, etc.)

## Integração com Serviços Externos

### Email

O sistema utiliza Nodemailer para envio de emails:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async (options) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Lytspot" <contato@lytspot.com.br>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });
    
    return info;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};
```

## Performance

### Estratégias de Cache

O sistema implementa várias estratégias de cache para melhorar a performance:

1. **Cache em Memória**: Usando NodeCache para respostas frequentes
2. **Cache de Banco de Dados**: Consultas otimizadas e índices apropriados
3. **Compressão**: Respostas HTTP comprimidas com gzip/brotli

### Otimização de Consultas

- Uso de índices apropriados no banco de dados
- Seleção específica de campos (evitando SELECT *)
- Paginação para conjuntos grandes de dados

## Logs e Monitoramento

O sistema utiliza Winston para logging estruturado:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Próximos Passos

- Implementação de testes automatizados
- Migração para arquitetura de microsserviços
- Implementação de GraphQL para consultas mais eficientes
- Melhoria na documentação da API com Swagger/OpenAPI
