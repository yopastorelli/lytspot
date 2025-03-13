# 🛠️ Scripts de Gerenciamento de Serviços - Lytspot

Este diretório contém scripts para gerenciamento e atualização de serviços no Lytspot, com suporte para ambiente de desenvolvimento e produção.

## Scripts Disponíveis

### 1. Atualização em Massa de Serviços
- **Arquivo:** `atualizarServicosEmMassa.js`
- **Comando:** `npm run update-services`
- **Descrição:** Permite selecionar múltiplos serviços e atualizar campos específicos em massa.
- **Funcionalidades:**
  - Seleção de serviços por índice, intervalo ou todos
  - Escolha do campo a ser atualizado (preço, descrição, duração, entregáveis)
  - Atualização de preço com valor fixo ou ajuste percentual
  - Confirmação antes da execução

### 2. Sincronização de Dados de Demonstração
- **Arquivo:** `atualizarDadosDemonstracao.js`
- **Comando:** `npm run sync-demo-data`
- **Descrição:** Sincroniza os dados de demonstração com o banco de dados atual.
- **Funcionalidades:**
  - Atualiza o arquivo de dados de demonstração
  - Atualiza o arquivo de serviços do simulador
  - Suporte para modo não interativo (flag `--build`)
  - Fallback para dados de seed quando o banco não está disponível

### 3. Interface de Gerenciamento de Serviços
- **Arquivo:** `gerenciarServicos.js`
- **Comando:** `npm run manage-services`
- **Descrição:** Interface CLI completa para gerenciamento de serviços.
- **Funcionalidades:**
  - Listagem de todos os serviços
  - Acesso à atualização em massa
  - Sincronização de dados
  - Processo completo (atualização + sincronização)

### 4. Atualização em Produção
- **Arquivo:** `atualizarServicosProd.js`
- **Comando:** `npm run update-prod-services`
- **Descrição:** Script configurável para atualização em massa no ambiente de produção.
- **Funcionalidades:**
  - Configuração via variáveis no próprio arquivo
  - Modo de simulação (sem alterar o banco)
  - Filtro para selecionar serviços específicos
  - Atualização de preço com valor fixo ou ajuste percentual
  - Sincronização automática após a atualização

### 5. Build de Serviços no Render
- **Arquivo:** `render-build-services.js`
- **Comando:** `npm run build:services`
- **Descrição:** Script para integração com o processo de build do Render.
- **Funcionalidades:**
  - Verificação da variável de ambiente `ENABLE_SERVICES_SYNC`
  - Execução da atualização em massa (se configurada)
  - Sincronização de dados de demonstração
  - Tratamento de erros para não interromper o build

## Integração com o Render

Os scripts foram projetados para funcionar de forma integrada com o ambiente de produção do Render. A integração é controlada através da variável de ambiente `ENABLE_SERVICES_SYNC`.

### Configuração no Render

1. Acesse o dashboard do Render
2. Vá para seu serviço
3. Acesse a aba "Environment"
4. Adicione a variável de ambiente:
   - Nome: `ENABLE_SERVICES_SYNC`
   - Valor: `false` (por padrão)

### Atualização em Produção

Para atualizar os serviços em produção:

1. **Opção 1: Atualização durante o build**
   - Altere a variável `ENABLE_SERVICES_SYNC` para `true` no dashboard do Render
   - Faça um novo deploy ou reinicie o serviço
   - Após a atualização, volte o valor para `false`

2. **Opção 2: Atualização manual via console**
   - Acesse o console do Render (Shell)
   - Configure o arquivo `atualizarServicosProd.js` conforme necessário
   - Execute o comando: `npm run update-prod-services`

### Configuração do Script de Produção

O arquivo `atualizarServicosProd.js` contém um objeto de configuração `CONFIG` que permite personalizar a atualização:

```javascript
const CONFIG = {
  // Definir como true para executar a atualização, false para apenas simular
  EXECUTAR_ATUALIZACAO: false,
  
  // Filtro para selecionar quais serviços atualizar (null para todos)
  FILTRO_SERVICOS: null,
  
  // Tipo de atualização de preço: 'fixo' ou 'percentual'
  TIPO_ATUALIZACAO_PRECO: 'percentual',
  
  // Valor para atualização de preço
  VALOR_ATUALIZACAO_PRECO: 10,
  
  // Campos a atualizar (true para atualizar, false para manter)
  ATUALIZAR_CAMPOS: {
    preco_base: true,
    descricao: false,
    // ...
  },
  
  // Valores para os campos
  VALORES_CAMPOS: {
    descricao: "Nova descrição padrão",
    // ...
  },
  
  // Sincronizar dados de demonstração após a atualização
  SINCRONIZAR_DADOS: true
};
```

## Fluxo de Trabalho Recomendado

### Desenvolvimento

1. Faça as alterações necessárias nos serviços usando o script interativo:
   ```bash
   npm run update-services
   ```

2. Sincronize os dados de demonstração:
   ```bash
   npm run sync-demo-data
   ```

3. Verifique se as alterações foram aplicadas corretamente.

### Produção

1. Configure o script `atualizarServicosProd.js` conforme necessário.

2. Execute o script em modo de simulação para verificar as alterações:
   ```bash
   npm run update-prod-services
   ```

3. Após verificar que as alterações estão corretas, altere `EXECUTAR_ATUALIZACAO` para `true` e execute novamente.

4. Ou, se preferir a atualização durante o build:
   - Defina `ENABLE_SERVICES_SYNC=true` no dashboard do Render
   - Faça um novo deploy
   - Após a conclusão, defina `ENABLE_SERVICES_SYNC=false`

## Solução de Problemas

### Erro de coluna inexistente

Se encontrar um erro indicando que uma coluna não existe no banco de dados:

1. Verifique o schema do Prisma em `server/prisma/schema.prisma`
2. Adicione a coluna faltante ao modelo correspondente
3. Execute a migração: `npx prisma db push --schema=server/prisma/schema.prisma`

### Erro de conexão com o banco de dados

Se encontrar erros de conexão com o banco de dados:

1. Verifique se a variável de ambiente `DATABASE_URL` está configurada corretamente
2. No ambiente de desenvolvimento, verifique se o arquivo de banco de dados existe
3. No Render, verifique as configurações de banco de dados no dashboard

## Versionamento

- **atualizarServicosEmMassa.js**: v1.0.1 - 2025-03-13
- **atualizarDadosDemonstracao.js**: v1.0.1 - 2025-03-13
- **gerenciarServicos.js**: v1.0.1 - 2025-03-13
- **atualizarServicosProd.js**: v1.0.0 - 2025-03-13
- **render-build-services.js**: v1.0.0 - 2025-03-13
