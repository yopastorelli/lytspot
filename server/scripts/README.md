# Sistema de Gerenciamento de Serviços Lytspot

## Visão Geral

Este diretório contém scripts para gerenciar os serviços do Lytspot em todos os ambientes (desenvolvimento, produção e frontend). O sistema foi projetado para simplificar o processo de atualização de dados, garantindo consistência entre todos os ambientes.

## Versão
- **Versão:** 1.0.0
- **Data:** 2025-03-15

## Arquivos Principais

### 1. `service-editor.js`
Interface de linha de comando para gerenciar serviços. Permite listar, adicionar, editar e remover serviços, além de sincronizar com o banco de dados e atualizar arquivos estáticos.

**Uso:**
```bash
node server/scripts/service-editor.js
```

### 2. `update-services-all.js`
Script automatizado para atualizar serviços em todos os ambientes. Carrega as definições de serviços, atualiza o banco de dados local, tenta atualizar o banco de dados de produção (se configurado) e atualiza os arquivos estáticos para o frontend.

**Uso:**
```bash
node server/scripts/update-services-all.js
```

### 3. `migrate-service-data.js`
Script de migração para converter dados existentes para o novo formato unificado. Garante que todos os serviços tenham a estrutura de dados correta, tanto no banco de dados quanto no arquivo de definições.

**Uso:**
```bash
node server/scripts/migrate-service-data.js
```

## Configuração

Para configurar a atualização do banco de dados de produção, adicione as seguintes variáveis ao arquivo `.env`:

```
PRODUCTION_API_URL=https://api.lytspot.com
PRODUCTION_API_KEY=sua_chave_api_aqui
```

## Estrutura de Dados

Os serviços são armazenados em um formato unificado com os seguintes campos principais:

```javascript
{
  nome: "Nome do Serviço",
  descricao: "Descrição detalhada do serviço",
  preco_base: 1500.00,
  detalhes: {
    captura: "6 a 8 horas",
    tratamento: "até 30 dias",
    entregaveis: "Descrição dos entregáveis",
    adicionais: "Opções adicionais",
    deslocamento: "Informações de deslocamento"
  }
}
```

## Fluxo de Trabalho Recomendado

1. **Primeira Vez:**
   - Execute `migrate-service-data.js` para garantir que todos os dados estejam no formato correto
   - Execute `update-services-all.js` para sincronizar todos os ambientes

2. **Atualizações Rotineiras:**
   - Use `service-editor.js` para fazer alterações nos serviços
   - Ou edite diretamente o arquivo `server/models/seeds/serviceDefinitions.js`
   - Execute `update-services-all.js` para aplicar as alterações em todos os ambientes

3. **Verificação:**
   - Verifique se os serviços estão sendo exibidos corretamente no simulador de preços
   - Verifique se os dados estão consistentes entre o backend e o frontend

## Solução de Problemas

### Erro de Conexão com o Banco de Dados
Verifique se a variável de ambiente `DATABASE_URL` está configurada corretamente no arquivo `.env`.

### Erro ao Atualizar o Banco de Dados de Produção
Verifique se as variáveis `PRODUCTION_API_URL` e `PRODUCTION_API_KEY` estão configuradas corretamente no arquivo `.env`.

### Inconsistência de Dados
Execute o script `migrate-service-data.js` para garantir que todos os dados estejam no formato correto.

## Logs e Backup

Todos os scripts criam backups automáticos dos arquivos antes de modificá-los. Os backups são salvos com a extensão `.bak` no mesmo diretório dos arquivos originais.

Os logs detalhados são exibidos no console durante a execução dos scripts, facilitando a identificação de problemas.
