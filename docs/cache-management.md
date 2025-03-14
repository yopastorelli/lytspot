# Documentação do Sistema de Cache da API

## Visão Geral
Este documento descreve o sistema de cache implementado na API do LytSpot, incluindo sua configuração, gerenciamento e estratégias de invalidação.

## Versão
**Versão atual:** 1.2.0
**Data:** 2025-03-14
**Autor:** Equipe de Desenvolvimento LytSpot

## Componentes Principais

### 1. Middleware de Cache (`server/middleware/cache.js`)
O middleware de cache é responsável por armazenar e recuperar respostas da API, reduzindo o tempo de resposta e a carga no banco de dados.

**Características principais:**
- Utiliza `node-cache` para armazenamento em memória
- TTL (Time-To-Live) padrão: 30 segundos
- Mecanismo de versão para invalidação rápida do cache
- Logs detalhados para monitoramento de hits e misses

### 2. Rota de Gerenciamento de Cache (`server/routes/cache.js`)
Endpoints dedicados para gerenciar o cache da API:

- **GET /api/cache/status**
  - Retorna informações sobre o estado atual do cache
  - Inclui estatísticas como número de itens, hits, misses e versão atual

- **GET /api/cache/clear**
  - Limpa o cache da API
  - Parâmetros opcionais:
    - `key`: Limpa apenas uma chave específica do cache

### 3. Script de Atualização de Serviços (`server/scripts/executarAtualizacaoServicos.js`)
Script responsável por atualizar os serviços no banco de dados e limpar o cache após as atualizações.

**Funcionalidades:**
- Detecta automaticamente o banco de dados em uso
- Atualiza todos os bancos de dados encontrados
- Limpa o cache da API após as atualizações
- Registra logs detalhados das operações

### 4. Script para Ambiente Render (`server/scripts/render-update-services.js`)
Script específico para atualização de serviços no ambiente de produção (Render).

**Características:**
- Carregamento dinâmico das definições de serviços
- Mecanismo de fallback para garantir serviços básicos
- Sistema de logs detalhados para diagnóstico
- Integração com o processo de deploy do Render

## Estratégia de Invalidação de Cache

O sistema utiliza duas estratégias principais para invalidação de cache:

1. **Invalidação baseada em tempo (TTL):**
   - Cache expira automaticamente após 30 segundos
   - Garante que dados não fiquem desatualizados por muito tempo

2. **Invalidação explícita:**
   - Após atualizações no banco de dados, o cache é explicitamente limpo
   - Mecanismo de versão incrementa um contador global, invalidando todo o cache instantaneamente
   - Endpoints específicos podem ter seu cache limpo individualmente

## Fluxo de Atualização de Dados

1. Script de atualização é executado (manual ou automaticamente no deploy)
2. Serviços são atualizados no banco de dados
3. Cache é limpo através da API ou diretamente pelo script
4. Próximas requisições à API obtêm dados atualizados do banco de dados
5. Novos resultados são armazenados em cache com a nova versão

## Monitoramento e Diagnóstico

O sistema inclui logs detalhados para monitoramento e diagnóstico:

- Logs de operações de cache (hits, misses, invalidações)
- Logs de atualizações de serviços
- Logs específicos para o ambiente de produção

## Considerações para Desenvolvimento

Ao desenvolver novos endpoints ou modificar os existentes, considere:

1. Se o endpoint deve utilizar cache (dados estáticos ou que mudam raramente)
2. TTL apropriado para o tipo de dados
3. Quando e como invalidar o cache após atualizações

## Troubleshooting

### Problema: API retornando dados desatualizados
- Verifique se o cache foi limpo após as atualizações
- Utilize o endpoint `/api/cache/clear` para limpar manualmente
- Verifique os logs para confirmar que a limpeza foi bem-sucedida

### Problema: Erros ao limpar o cache
- Verifique se o servidor da API está em execução
- Confirme que as URLs base estão configuradas corretamente
- Verifique os logs para identificar erros específicos
