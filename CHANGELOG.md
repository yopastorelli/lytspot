# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/spec/v2.0.0.html).

## [Não publicado]

### Adicionado
- Scripts de inicialização e monitoramento do banco de dados:
  - `inicializarBancoDados.js`: Configura corretamente o banco de dados SQLite, garantindo permissões e estrutura.
  - `popularServicos.js`: Popula o banco de dados com serviços de demonstração quando necessário.
  - `inicializarSistema.js`: Script completo que executa todas as etapas de inicialização em sequência.
  - `monitorBancoDados.js`: Monitora o estado atual do banco de dados e registra estatísticas.
  - `verificarPersistencia.js`: Realiza testes de persistência para validar operações CRUD no banco de dados.
- Melhorias na persistência de dados no ambiente Render:
  - Configuração para usar diretório persistente para o SQLite.
  - Tratamento de erros aprimorado para operações de banco de dados.
  - Verificação de permissões de arquivos para garantir acesso ao banco de dados.
  - Sistema de logs detalhados para rastreamento de operações de banco de dados.
  - Mecanismo de recuperação automática com dados de demonstração em caso de falha.

### Modificado
- Refatoração do `pricingService.js` com melhorias significativas:
  - Implementação de sistema de logs detalhados para diagnóstico.
  - Mecanismo de verificação de persistência após operações de banco de dados.
  - Estratégia de fallback para dados de demonstração em caso de falha.
  - Sincronização automática entre dados de demonstração e banco de dados.

### Corrigido
- Problema de persistência de dados no ambiente de produção (Render).
- Tratamento de caminhos com espaços nos scripts de banco de dados.
- Verificação de integridade do banco de dados antes das operações.
- Conversão de IDs entre string e número para garantir compatibilidade em diferentes contextos.
- Correção no script `verificarPersistencia.js`:
  - Corrigido acesso à configuração do caminho do banco de dados.
  - Ajustado formato dos dados para corresponder ao schema do Prisma.
  - Melhorada a compatibilidade entre tipos de dados nos testes de persistência.
  - Adicionado tratamento de erros mais detalhado para diagnóstico de problemas.
- Erro 500 ao atualizar serviços:
  - Corrigido o formato de dados enviado do frontend para o backend.
  - Melhorado o sanitizador de dados no repositório de serviços para tratar corretamente campos vazios e valores numéricos.
  - Adicionada validação mais robusta para campos obrigatórios.
- Erro 400 ao criar novos serviços:
  - Implementada sanitização de dados antes do envio para o backend.
  - Melhorado o tratamento de erros específicos, como serviços com nomes duplicados.
  - Adicionado log detalhado para facilitar o diagnóstico de problemas.
- Inconsistências na validação de formulários:
  - Corrigido o tratamento de campos de texto para garantir que valores vazios sejam tratados corretamente.
  - Melhorada a conversão de tipos para campos numéricos.

## [1.6.0] - 2025-03-13

### Corrigido
- Problema de persistência de dados no ambiente de produção (Render)
- Configuração do caminho do banco de dados SQLite para usar um diretório persistente no Render
- Tratamento de erros aprimorado nas operações de banco de dados

### Adicionado
- Sistema de logs detalhados para diagnóstico de problemas de banco de dados
- Teste de conexão com o banco de dados antes de cada operação
- Verificação de permissões de arquivos para o banco de dados SQLite

### Modificado
- Função `updateDemonstrationService` para aceitar um objeto de serviço completo como parâmetro
- Melhorado o tratamento de erros no repositório de serviços
- Refatorado o serviço de preços para melhor lidar com erros de banco de dados

## [1.5.1] - 2025-03-12

### Corrigido
- Resolvido erro 400 (Bad Request) ao criar novos serviços no painel administrativo
- Corrigida a validação de tipos de dados no backend para aceitar tanto strings quanto números
- Implementada sanitização de dados consistente na criação e atualização de serviços

### Adicionado
- Criada função de sanitização centralizada para evitar duplicação de código
- Adicionados logs detalhados para facilitar a depuração de problemas na API
- Criada documentação completa da API e componentes

### Melhorado
- Refatorado o repositório de serviços para melhor tratamento de erros
- Aprimorada a validação de campos obrigatórios no backend
- Atualizada a documentação do projeto com informações detalhadas sobre a arquitetura

## [1.5.0] - 2025-03-12

### Corrigido
- Resolvido problema de CORS que impedia requisições da API em produção
- Corrigido erro 500 ao atualizar serviços no painel administrativo
- Resolvido problema de persistência de dados na atualização de serviços

### Adicionado
- Implementada configuração de CORS dinâmica para suportar múltiplos ambientes
- Adicionado endpoint de verificação de saúde da API (/api/health)
- Criados scripts para teste e verificação da configuração em produção
- Adicionado script para testar a atualização de serviços

### Melhorado
- Aprimorada a sanitização de dados na atualização de serviços
- Melhorada a validação de campos obrigatórios no formulário de serviços
- Aprimorado o tratamento de erros em toda a aplicação
- Adicionados logs detalhados para facilitar a depuração

## [1.4.0] - 2025-03-10

### Adicionado
- Implementada arquitetura em camadas (controllers, services, repositories)
- Criado sistema de cache para melhorar o desempenho da API
- Adicionado suporte para dados de demonstração quando o banco de dados não está disponível

### Melhorado
- Refatorado o código para seguir os princípios de Single Source of Truth
- Melhorada a documentação do código
- Aprimorada a experiência do usuário no painel administrativo

## [1.3.0] - 2025-03-05

### Adicionado
- Implementado painel administrativo para gerenciamento de serviços
- Criado simulador de preços para clientes
- Adicionado sistema de autenticação com Firebase Auth

### Melhorado
- Otimizado o carregamento de páginas
- Aprimorada a responsividade para dispositivos móveis
