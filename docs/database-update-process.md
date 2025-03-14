# Processos de Atualização de Bases de Dados

## Visão Geral

Este documento descreve os processos de atualização das bases de dados do LytSpot, incluindo os scripts utilizados, fluxos de execução e estratégias de sincronização com o cache da API.

## Versão
**Versão atual:** 1.0.0
**Data:** 2025-03-14
**Autor:** Equipe de Desenvolvimento LytSpot

## Ambientes

O sistema suporta múltiplos ambientes, cada um com sua própria base de dados:

1. **Desenvolvimento** - Base local SQLite
   - Localização: `file:./server/database.sqlite`
   - Utilizado para desenvolvimento e testes locais

2. **Produção (Render)** - Base SQLite em ambiente cloud
   - Localização: `file:./database.sqlite`
   - Utilizado no ambiente de produção

## Scripts de Atualização

### 1. Script Principal (`executarAtualizacaoServicos.js`)

Este script é responsável por atualizar os serviços no banco de dados de desenvolvimento.

**Localização:** `server/scripts/executarAtualizacaoServicos.js`

**Funcionalidades:**
- Detecta automaticamente o banco de dados em uso
- Carrega definições de serviços a partir de `serviceDefinitions.js`
- Atualiza serviços existentes ou cria novos conforme necessário
- Limpa o cache da API após as atualizações

**Fluxo de Execução:**
1. Carrega variáveis de ambiente e configurações
2. Testa conexão com o banco de dados
3. Carrega definições de serviços
4. Para cada serviço:
   - Verifica se já existe no banco de dados
   - Atualiza se existir, cria se não existir
5. Limpa o cache da API
6. Registra logs de todas as operações

**Exemplo de Uso:**
```bash
node server/scripts/executarAtualizacaoServicos.js
```

### 2. Script para Ambiente Render (`render-update-services.js`)

Script específico para atualização de serviços no ambiente de produção (Render).

**Localização:** `server/scripts/render-update-services.js`

**Funcionalidades:**
- Carregamento dinâmico das definições de serviços
- Mecanismo de fallback para garantir serviços básicos
- Sistema de logs detalhados para diagnóstico
- Integração com o processo de deploy do Render

**Fluxo de Execução:**
1. Carrega variáveis de ambiente específicas do Render
2. Testa conexão com o banco de dados de produção
3. Tenta carregar definições de serviços dinamicamente
4. Utiliza definições básicas como fallback se necessário
5. Atualiza ou cria serviços no banco de dados
6. Limpa o cache da API de produção
7. Registra logs detalhados para monitoramento

**Exemplo de Uso:**
```bash
node server/scripts/render-update-services.js
```

### 3. Script de Configuração do Render (`render-setup.js`)

Este script é executado automaticamente durante o deploy no ambiente Render e é responsável por configurar o ambiente e executar migrações e atualizações necessárias.

**Localização:** `server/render-setup.js`

**Funcionalidades:**
- Configura variáveis de ambiente
- Executa migrações do banco de dados
- Chama o script de atualização de serviços
- Verifica o estado do cache após as atualizações

**Fluxo de Execução:**
1. Configura variáveis de ambiente para produção
2. Executa migrações do Prisma
3. Executa o script de atualização de serviços
4. Verifica se o cache foi limpo corretamente
5. Registra logs de todo o processo

**Execução Automática:**
Este script é executado automaticamente durante o deploy no Render, conforme configurado no `package.json`:
```json
"scripts": {
  "render-postbuild": "node server/render-setup.js"
}
```

## Definições de Serviços

### Arquivo de Definições (`serviceDefinitions.js`)

Este arquivo contém as definições dos serviços que serão criados ou atualizados no banco de dados.

**Localização:** `server/data/serviceDefinitions.js`

**Estrutura:**
```javascript
module.exports = function getServiceDefinitions() {
  return [
    {
      nome: "Nome do Serviço",
      descricao: "Descrição detalhada",
      preco_base: 200.00,
      duracao_media_captura: "2 a 3 horas",
      duracao_media_tratamento: "até 7 dias úteis",
      entregaveis: "20 fotos editadas em alta resolução",
      possiveis_adicionais: "Edição avançada, maquiagem profissional",
      valor_deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km",
      detalhes: {
        captura: "2 a 3 horas",
        tratamento: "até 7 dias úteis",
        entregaveis: "20 fotos editadas em alta resolução",
        adicionais: "Edição avançada, maquiagem profissional",
        deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
      }
    },
    // Outros serviços...
  ];
};
```

### Transformação de Dados

Os dados dos serviços passam por um processo de transformação antes de serem armazenados no banco de dados:

1. **Sanitização** - Garante que todos os campos necessários estão presentes
2. **Normalização** - Converte estruturas aninhadas para formato compatível com o banco
3. **Serialização** - Converte objetos complexos para strings JSON quando necessário

## Sincronização com o Cache

Após cada atualização no banco de dados, o cache da API é limpo para garantir que os dados mais recentes sejam servidos nas próximas requisições:

1. **Limpeza Automática** - Scripts de atualização limpam o cache automaticamente
2. **Verificação** - Sistema verifica se o cache foi limpo corretamente
3. **Retry** - Em caso de falha, tenta novamente após um intervalo

## Logs e Monitoramento

O sistema inclui logs detalhados para monitoramento e diagnóstico:

1. **Logs de Atualização** - Registra cada serviço atualizado ou criado
2. **Logs de Cache** - Registra operações de limpeza de cache
3. **Logs de Erro** - Registra erros e exceções durante o processo

## Troubleshooting

### Problema: Falha ao atualizar serviços

**Possíveis causas:**
- Erro de conexão com o banco de dados
- Formato inválido nas definições de serviços
- Permissões insuficientes

**Soluções:**
1. Verificar logs de erro
2. Confirmar que o banco de dados está acessível
3. Validar o formato das definições de serviços

### Problema: Cache não é limpo após atualizações

**Possíveis causas:**
- API não está em execução
- URL base incorreta
- Problemas de rede

**Soluções:**
1. Verificar se a API está em execução
2. Confirmar que as URLs base estão configuradas corretamente
3. Limpar o cache manualmente através do endpoint `/api/cache/clear`

## Melhores Práticas

1. **Sempre teste localmente** antes de atualizar o ambiente de produção
2. **Mantenha backups** do banco de dados antes de grandes atualizações
3. **Monitore os logs** após atualizações para identificar problemas
4. **Verifique o cache** após atualizações para garantir que foi limpo corretamente
5. **Documente alterações** nas definições de serviços para referência futura
