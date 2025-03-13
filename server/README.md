# Lytspot API - Documentação da Arquitetura

## Visão Geral

A API do Lytspot foi refatorada para seguir uma arquitetura em camadas, que proporciona melhor organização, manutenibilidade e escalabilidade do código. Esta documentação descreve a estrutura, os componentes e as práticas recomendadas para trabalhar com esta arquitetura.

**Versão:** 1.0.0  
**Data:** 2025-03-12

## Estrutura de Diretórios

```
server/
├── config/              # Configurações centralizadas
├── controllers/         # Controladores de requisições HTTP
├── middleware/          # Middlewares do Express
├── models/              # Modelos de dados e seeds
│   └── seeds/           # Definições e scripts de seed
├── prisma/              # Configuração do Prisma ORM
├── repositories/        # Camada de acesso a dados
├── routes/              # Definição de rotas
├── scripts/             # Scripts utilitários
├── services/            # Lógica de negócios
├── transformers/        # Conversão entre formatos de dados
├── utils/               # Funções utilitárias
└── validators/          # Validação de dados
```

## Camadas da Arquitetura

### 1. Controladores (Controllers)

Responsáveis por:
- Receber requisições HTTP
- Validar parâmetros de entrada
- Delegar processamento para a camada de serviços
- Formatar e retornar respostas

**Exemplo:** `pricingController.js`

### 2. Serviços (Services)

Responsáveis por:
- Implementar a lógica de negócios
- Orquestrar operações entre repositórios
- Aplicar regras de negócio
- Tratar exceções específicas do domínio

**Exemplo:** `pricingService.js`

### 3. Repositórios (Repositories)

Responsáveis por:
- Encapsular todas as operações de banco de dados
- Fornecer métodos CRUD para entidades
- Isolar a lógica de persistência

**Exemplo:** `serviceRepository.js`

### 4. Transformadores (Transformers)

Responsáveis por:
- Converter dados entre diferentes formatos
- Mapear entidades do banco para DTOs
- Preparar dados para apresentação

**Exemplo:** `serviceTransformer.js`

### 5. Validadores (Validators)

Responsáveis por:
- Validar dados de entrada
- Garantir integridade e consistência
- Fornecer mensagens de erro claras

**Exemplo:** `serviceValidator.js`

### 6. Configuração (Config)

Responsável por:
- Centralizar configurações da aplicação
- Gerenciar variáveis de ambiente
- Adaptar comportamento baseado no ambiente

**Exemplo:** `environment.js`

## Fluxo de Dados

1. **Requisição HTTP** → Rota → Controlador
2. **Controlador** → Valida entrada → Chama Serviço
3. **Serviço** → Aplica lógica de negócios → Chama Repositório
4. **Repositório** → Acessa banco de dados → Retorna dados
5. **Serviço** → Processa dados → Usa Transformador
6. **Transformador** → Converte formato → Retorna DTO
7. **Controlador** → Formata resposta → Retorna ao cliente

## Single Source of Truth (SSOT)

A arquitetura implementa o princípio de Fonte Única de Verdade através do módulo `serviceDefinitions.js`, que centraliza todas as definições de serviços. Este módulo é utilizado tanto para popular o banco de dados quanto para fornecer dados de demonstração para o frontend.

## Práticas Recomendadas

1. **Separação de Responsabilidades:**
   - Cada camada deve ter uma responsabilidade única e bem definida
   - Evite lógica de negócios nos controladores
   - Mantenha o acesso ao banco de dados apenas nos repositórios

2. **Tratamento de Erros:**
   - Use try/catch em cada camada
   - Propague erros com mensagens claras
   - Centralize logs de erros

3. **Validação:**
   - Valide dados de entrada nos controladores
   - Valide regras de negócio nos serviços
   - Use o módulo de validadores para regras complexas

4. **Documentação:**
   - Documente interfaces públicas com JSDoc
   - Mantenha versionamento nos arquivos
   - Atualize este README quando houver mudanças arquiteturais

## Endpoints da API

### Serviços e Preços

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/pricing | Listar todos os serviços |
| GET | /api/pricing/:id | Obter serviço por ID |
| POST | /api/pricing | Criar novo serviço |
| PUT | /api/pricing/:id | Atualizar serviço existente |
| DELETE | /api/pricing/:id | Excluir serviço |
| POST | /api/pricing/:id/calculate | Calcular preço com opções |

## Scripts de Manutenção

### Seed do Banco de Dados

Para popular o banco de dados com dados iniciais:

```javascript
import { seedDatabase } from './server/models/seeds/index.js';

// Opções:
// - force: força recriação mesmo se dados já existirem
// - environment: ambiente de execução
// - syncDemoData: sincroniza dados de demonstração
await seedDatabase({ force: true, environment: 'development', syncDemoData: true });
```

### Atualização de Scripts Legados

O script `updateSeeds.js` foi criado para atualizar os scripts legados para utilizar a nova arquitetura:

```bash
node server/scripts/updateSeeds.js
```

## Considerações de Ambiente

A aplicação suporta múltiplos ambientes através do módulo `environment.js`:

- **Desenvolvimento:** Configurações flexíveis para desenvolvimento local
- **Teste:** Configurações para execução de testes automatizados
- **Produção:** Configurações otimizadas para ambiente de produção

## Manutenção e Evolução

Ao adicionar novos recursos:

1. Mantenha a separação de camadas
2. Atualize a documentação
3. Siga o padrão de versionamento nos arquivos
4. Considere a compatibilidade com código existente

---

*Documentação criada em 2025-03-12*
