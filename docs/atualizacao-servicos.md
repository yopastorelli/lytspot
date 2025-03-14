# Documentação: Sistema de Atualização de Serviços

**Versão:** 2.0.0  
**Data:** 2025-03-14  
**Autor:** Equipe LytSpot

## Visão Geral

Este documento descreve a arquitetura e funcionamento do sistema de atualização de serviços do LytSpot, que foi refatorado para melhorar a manutenibilidade, reduzir duplicação de código e garantir consistência entre os ambientes de desenvolvimento e produção.

## Arquitetura

O sistema foi refatorado para seguir uma abordagem modular, com componentes especializados que podem ser reutilizados em diferentes contextos:

```
server/
├── scripts/
│   ├── render-update-services.js       # Script para ambiente Render (produção)
│   └── executarAtualizacaoServicos.js  # Script para ambiente de desenvolvimento
├── utils/
│   ├── serviceDefinitionLoader.js      # Carregamento de definições de serviços
│   ├── databaseUpdater.js              # Operações de banco de dados
│   └── cacheManager.js                 # Gerenciamento de cache
└── models/
    └── seeds/
        └── updatedServiceDefinitions.js # Definições atualizadas de serviços
```

## Componentes

### 1. Scripts Principais

#### render-update-services.js

Script otimizado para o ambiente de produção (Render). Responsável por orquestrar o processo de atualização, utilizando os módulos utilitários.

**Características:**
- Tamanho reduzido (menos de 200 linhas vs. mais de 1000 linhas na versão anterior)
- Foco na orquestração do fluxo de atualização
- Tratamento de erros robusto
- Logging detalhado

#### executarAtualizacaoServicos.js

Script para ambiente de desenvolvimento local. Mantém a mesma estrutura lógica do script de produção, mas com adaptações para o ambiente de desenvolvimento.

### 2. Módulos Utilitários

#### serviceDefinitionLoader.js

Responsável pelo carregamento das definições de serviços a partir de um arquivo.

**Funcionalidades:**
- Carregamento de definições a partir de diferentes formatos de arquivo
- Fallback para definições básicas em caso de erro
- Extração inteligente de definições do conteúdo do arquivo
- Logging detalhado do processo de carregamento

#### databaseUpdater.js

Gerencia as operações de banco de dados relacionadas à atualização de serviços.

**Funcionalidades:**
- Inicialização do cliente Prisma
- Sanitização de dados de serviços
- Comparação de serviços para determinar se precisam ser atualizados
- Criação e atualização de serviços no banco de dados
- Estatísticas detalhadas sobre o processo de atualização

#### cacheManager.js

Gerencia as operações relacionadas ao cache da API.

**Funcionalidades:**
- Limpeza do cache após atualizações
- Verificação do status do cache
- Tratamento de erros de conexão
- Autenticação segura para operações de cache

## Fluxo de Execução

1. **Inicialização**:
   - Carregamento de variáveis de ambiente
   - Configuração de diretórios e caminhos
   - Inicialização do logger

2. **Carregamento de Definições**:
   - Carregamento das definições de serviços do arquivo especificado
   - Fallback para definições básicas em caso de erro

3. **Atualização do Banco de Dados**:
   - Inicialização do cliente Prisma
   - Sanitização dos dados de serviços
   - Verificação de serviços existentes
   - Atualização ou criação de serviços conforme necessário

4. **Limpeza de Cache**:
   - Limpeza do cache da API para garantir que os clientes vejam os dados atualizados
   - Verificação do status do cache após a limpeza

5. **Finalização**:
   - Fechamento da conexão com o banco de dados
   - Registro de logs finais
   - Saída com código apropriado (0 para sucesso, 1 para erro)

## Variáveis de Ambiente

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| `SERVICE_DEFINITIONS_PATH` | Caminho para o arquivo de definições de serviços | Calculado com base no ambiente |
| `BASE_URL` | URL base da API | `https://lytspot.onrender.com` |
| `CACHE_SECRET` | Chave secreta para operações de cache | `cache-secret-key` |
| `FORCE_UPDATE` | Se `true`, força a atualização mesmo se os dados forem iguais | `false` |
| `RENDER` | Indica se o script está sendo executado no ambiente Render | - |

## Logs

O sistema mantém logs detalhados em dois locais:

1. **Console**: Todos os logs são exibidos no console durante a execução
2. **Arquivo**: Os logs são gravados em:
   - Produção: `/opt/render/project/src/logs/render-update-services.log`
   - Desenvolvimento: `<projeto>/logs/atualizacao-servicos.log`

## Tratamento de Erros

O sistema implementa tratamento de erros em múltiplos níveis:

1. **Nível de Módulo**: Cada módulo trata seus próprios erros internamente
2. **Nível de Script**: O script principal captura erros não tratados pelos módulos
3. **Fallbacks**: Implementação de mecanismos de fallback para garantir que o sistema continue funcionando mesmo em caso de falhas parciais

## Manutenção e Extensão

Para estender ou modificar o sistema:

1. **Adicionar Novos Serviços**: Atualize o arquivo `updatedServiceDefinitions.js`
2. **Modificar Lógica de Carregamento**: Edite o módulo `serviceDefinitionLoader.js`
3. **Alterar Lógica de Atualização**: Edite o módulo `databaseUpdater.js`
4. **Modificar Gerenciamento de Cache**: Edite o módulo `cacheManager.js`

## Histórico de Versões

### 2.0.0 (2025-03-14)
- Refatoração completa para abordagem modular
- Redução significativa do tamanho do código
- Melhoria na manutenibilidade e testabilidade
- Padronização do tratamento de erros e logging

### 1.5.1 (2025-03-14)
- Corrigido tratamento do campo detalhes para compatibilidade com Prisma

### 1.5.0 (2025-03-14)
- Implementada solução para sincronizar múltiplos bancos de dados

### 1.0.0 (2025-03-13)
- Versão inicial do script de atualização de serviços
