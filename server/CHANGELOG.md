# Changelog - Lytspot API

Este arquivo documenta todas as alterações significativas feitas na API do Lytspot.

## [2.1.0] - 2025-03-13

### Melhorias na Validação e Processamento de Dados

#### Adicionado
- Método `prepareServiceData` no `pricingService.js` para centralizar a sanitização de dados de serviços
- Validação mais rigorosa para campos obrigatórios no `serviceValidator.js`
- Logs detalhados para diagnóstico de problemas em operações de serviços

#### Modificado
- Refatorados os métodos `createService` e `updateService` no `pricingService.js` para melhor tratamento de dados e validação
- Melhorada a sanitização de dados no repositório de serviços
- Aprimorado o tratamento de erros específicos, como serviços com nomes duplicados

#### Corrigido
- Erro 500 ao atualizar serviços devido a problemas de formato de dados
- Erro 400 ao criar novos serviços devido a validação inadequada
- Tratamento inconsistente de campos vazios e valores numéricos
- Verificação de persistência após operações de banco de dados

## [2.0.0] - 2025-03-12

### Refatoração da Arquitetura da API

#### Adicionado
- Módulo centralizado de definições de serviços (`serviceDefinitions.js`)
- Script unificado de seed do banco de dados (`index.js` em models/seeds)
- Camada de repositório para serviços (`serviceRepository.js`)
- Camada de serviço para lógica de negócios (`pricingService.js`)
- Transformador para conversão de dados (`serviceTransformer.js`)
- Validador para dados de serviços (`serviceValidator.js`)
- Configuração centralizada de ambiente (`environment.js`)
- Documentação completa da arquitetura (`README.md`)
- Script de teste da arquitetura (`testArchitecture.js`)
- Este arquivo de changelog para documentar alterações

#### Modificado
- Refatorado controlador de preços para usar a nova arquitetura
- Atualizado script de seed de serviços para usar o módulo centralizado
- Atualizado script de população do banco de dados para usar o módulo centralizado

#### Melhorias
- Implementação de padrão de arquitetura em camadas
- Centralização de definições de dados (Single Source of Truth)
- Melhor separação de responsabilidades
- Código mais testável e manutenível
- Documentação abrangente da arquitetura

## [1.3.3] - 2025-03-11

### Correções e Melhorias no Sistema de CORS

#### Modificado
- Invertida lógica de `SKIP_DB_POPULATION` (agora 'false' para pular)
- Melhorada configuração de CORS para suportar múltiplos ambientes
- Implementado middleware de cache mais eficiente

#### Corrigido
- Resolvido problema de CORS no ambiente de produção
- Corrigido tratamento de requisições OPTIONS (preflight)

## [1.2.0] - 2025-03-10

### Adição de Sincronização de Dados de Demonstração

#### Adicionado
- Suporte para sincronização com dados de demonstração
- Novas opções para serviços

#### Modificado
- Melhorado script de seed de serviços

## [1.0.0] - 2025-03-01

### Lançamento Inicial

#### Adicionado
- Implementação inicial da API
- Sistema de preços e serviços
- Autenticação via JWT
- Endpoints para gerenciamento de serviços
