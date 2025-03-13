# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/spec/v2.0.0.html).

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
