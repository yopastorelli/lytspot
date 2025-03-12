# Bugs e Problemas Conhecidos

Este documento mantém um registro dos bugs e problemas conhecidos no projeto Lytspot. O objetivo é fornecer aos desenvolvedores uma visão clara dos problemas existentes, seu status atual e prioridade.

## Estrutura de Registro de Bugs

Cada bug é documentado com as seguintes informações:

- **ID**: Identificador único do bug (LYTSPOT-XXX)
- **Título**: Breve descrição do problema
- **Descrição**: Explicação detalhada do problema
- **Componente**: Parte do sistema afetada
- **Severidade**: Crítica, Alta, Média, Baixa
- **Status**: Aberto, Em Progresso, Aguardando Revisão, Resolvido
- **Data de Identificação**: Quando o bug foi identificado
- **Data de Resolução**: Quando o bug foi resolvido (se aplicável)
- **Responsável**: Desenvolvedor designado para resolver o problema (se aplicável)
- **Workaround**: Solução temporária (se disponível)
- **Passos para Reproduzir**: Instruções para reproduzir o problema

## Bugs Ativos

### LYTSPOT-002

- **Título**: URLs hardcoded no ContactForm
- **Descrição**: O componente ContactForm.tsx utiliza fetch com URL hardcoded em vez do serviço de API centralizado, causando problemas quando a aplicação é implantada em diferentes ambientes.
- **Componente**: Frontend > Contact > ContactForm
- **Severidade**: Média
- **Status**: Em Progresso
- **Data de Identificação**: 2025-03-05
- **Responsável**: Ana Silva
- **Workaround**: Configurar redirecionamento no servidor para garantir que as URLs hardcoded funcionem em todos os ambientes.
- **Passos para Reproduzir**:
  1. Examinar o código-fonte do componente ContactForm.tsx
  2. Identificar chamadas fetch com URLs absolutas
  3. Testar o formulário de contato em ambiente de homologação para verificar falhas

### LYTSPOT-003

- **Título**: PriceSimulator não utiliza o serviço de API centralizado
- **Descrição**: O componente PriceSimulator.jsx ainda usa fetch diretamente em vez do serviço de API centralizado, resultando em inconsistências no tratamento de erros e falta de suporte para fallback.
- **Componente**: Frontend > Pricing > PriceSimulator
- **Severidade**: Média
- **Status**: Aberto
- **Data de Identificação**: 2025-03-05
- **Responsável**: Não atribuído
- **Workaround**: Nenhum disponível atualmente.
- **Passos para Reproduzir**:
  1. Examinar o código-fonte do componente PriceSimulator.jsx
  2. Identificar chamadas fetch diretas em vez do uso do serviço api.js
  3. Testar o simulador de preços com a API indisponível para verificar a falta de fallback

### LYTSPOT-004

- **Título**: Arquivos de backup desnecessários no repositório
- **Descrição**: Existem vários arquivos de backup (.bak, .old, etc.) no repositório que não são necessários e podem causar confusão.
- **Componente**: Geral
- **Severidade**: Baixa
- **Status**: Aberto
- **Data de Identificação**: 2025-03-10
- **Responsável**: Não atribuído
- **Workaround**: Ignorar arquivos com extensões .bak, .old, etc.
- **Passos para Reproduzir**:
  1. Examinar o repositório em busca de arquivos com extensões .bak, .old, etc.
  2. Verificar se esses arquivos são referenciados em algum lugar do código

### LYTSPOT-005

- **Título**: Problemas de CORS em ambiente de produção
- **Descrição**: Ocasionalmente, ocorrem problemas de CORS em ambiente de produção, especialmente quando acessado de domínios específicos.
- **Componente**: Backend > Server
- **Severidade**: Alta
- **Status**: Em Progresso
- **Data de Identificação**: 2025-02-20
- **Responsável**: Carlos Mendes
- **Workaround**: Adicionar manualmente os domínios problemáticos à lista de origens permitidas no servidor.
- **Passos para Reproduzir**:
  1. Acessar a aplicação a partir de um domínio não listado nas origens permitidas
  2. Tentar realizar operações que envolvam chamadas à API
  3. Observar erros de CORS no console do navegador

## Bugs Resolvidos Recentemente

### LYTSPOT-001

- **Título**: Incompatibilidade no campo de senha do LoginForm
- **Descrição**: O componente LoginForm.jsx estava enviando o campo 'senha', mas o backend esperava 'password', causando falhas de autenticação.
- **Componente**: Frontend > Admin > LoginForm
- **Severidade**: Alta
- **Status**: Resolvido
- **Data de Identificação**: 2025-03-01
- **Data de Resolução**: 2025-03-12
- **Responsável**: Equipe de Desenvolvimento
- **Solução**: Corrigido o componente LoginForm para enviar o campo 'password' conforme esperado pelo backend.
- **Detalhes da Resolução**:
  1. Modificado o formulário de login para usar o campo 'password' em vez de 'senha'
  2. Atualizada a documentação da API para esclarecer o formato esperado
  3. Adicionados testes para garantir a compatibilidade futura

### LYTSPOT-007

- **Título**: Erro 401 Unauthorized na autenticação do painel administrativo
- **Descrição**: O frontend não conseguia autenticar-se na API devido à falta de um usuário administrador válido no banco de dados, resultando em erro 401 Unauthorized.
- **Componente**: Backend > Autenticação
- **Severidade**: Crítica
- **Status**: Resolvido
- **Data de Identificação**: 2025-03-12
- **Data de Resolução**: 2025-03-12
- **Responsável**: Equipe de Desenvolvimento
- **Solução**: Criado um usuário administrador usando o script `create-admin-user.js` e documentado o processo em `docs/backend/authentication.md`.
- **Detalhes da Resolução**:
  1. Verificado que as variáveis JWT_SECRET e JWT_EXPIRES_IN estavam corretamente configuradas
  2. Confirmado que o sistema de autenticação JWT estava implementado corretamente
  3. Criado um usuário administrador com credenciais padrão (admin@lytspot.com / Admin@123456)
  4. Testado o login com sucesso usando o script `login-admin.js`
  5. Atualizada a documentação para incluir procedimentos de solução de problemas

### LYTSPOT-006

- **Título**: Erro ao importar next/router em projeto Astro
- **Descrição**: O componente PriceSimulator tentava importar next/router em um projeto Astro, causando erros de compilação.
- **Componente**: Frontend > Pricing > PriceSimulator
- **Severidade**: Crítica
- **Status**: Resolvido
- **Data de Identificação**: 2025-02-15
- **Data de Resolução**: 2025-02-18
- **Responsável**: João Oliveira
- **Solução**: Removida a dependência de next/router e substituída a navegação baseada em router.push() por window.location.href com URLSearchParams.

### LYTSPOT-005

- **Título**: Falha no carregamento de serviços quando a API está indisponível
- **Descrição**: O simulador de preços não exibia nenhum serviço quando a API estava indisponível, em vez de usar dados de fallback.
- **Componente**: Frontend > Pricing > PriceSimulator
- **Severidade**: Alta
- **Status**: Resolvido
- **Data de Identificação**: 2025-02-10
- **Data de Resolução**: 2025-02-12
- **Responsável**: Maria Santos
- **Solução**: Implementada estratégia de fallback para usar dados locais quando a API não está disponível.

## Problemas de Performance

### LYTSPOT-008

- **Título**: Carregamento lento da página inicial em dispositivos móveis
- **Descrição**: A página inicial leva mais de 5 segundos para carregar completamente em dispositivos móveis com conexão 3G.
- **Componente**: Frontend > Home
- **Severidade**: Média
- **Status**: Aberto
- **Data de Identificação**: 2025-03-08
- **Responsável**: Não atribuído
- **Workaround**: Nenhum disponível atualmente.
- **Passos para Reproduzir**:
  1. Acessar a página inicial em um dispositivo móvel ou usando o modo de simulação de dispositivo móvel do Chrome
  2. Ativar a limitação de rede para 3G
  3. Medir o tempo de carregamento completo da página

### LYTSPOT-009

- **Título**: Consultas de banco de dados não otimizadas no painel administrativo
- **Descrição**: O painel administrativo faz múltiplas consultas ao banco de dados para carregar informações que poderiam ser obtidas em uma única consulta.
- **Componente**: Backend > Admin
- **Severidade**: Média
- **Status**: Aberto
- **Data de Identificação**: 2025-03-07
- **Responsável**: Não atribuído
- **Workaround**: Limitar o número de registros exibidos por página para reduzir o impacto.
- **Passos para Reproduzir**:
  1. Acessar o painel administrativo
  2. Navegar para a página de listagem de serviços
  3. Monitorar as consultas ao banco de dados nos logs do servidor

## Dívidas Técnicas

### LYTSPOT-010

- **Título**: Migração para TypeScript incompleta
- **Descrição**: Apenas parte dos componentes foi migrada para TypeScript, resultando em uma mistura de arquivos .jsx e .tsx.
- **Componente**: Frontend > Geral
- **Severidade**: Baixa
- **Status**: Em Progresso
- **Data de Identificação**: 2025-01-15
- **Responsável**: Equipe Frontend
- **Plano de Ação**: Migrar gradualmente todos os componentes para TypeScript, começando pelos mais críticos.

### LYTSPOT-011

- **Título**: Falta de testes automatizados
- **Descrição**: A cobertura de testes é inferior a 30%, especialmente para componentes de frontend.
- **Componente**: Geral
- **Severidade**: Alta
- **Status**: Em Progresso
- **Data de Identificação**: 2025-01-10
- **Responsável**: Equipe de QA
- **Plano de Ação**: Implementar testes unitários para todos os componentes críticos e aumentar a cobertura para pelo menos 70%.

## Processo de Gerenciamento de Bugs

### Reportando Novos Bugs

Para reportar um novo bug:

1. Verifique se o bug já não está listado neste documento
2. Crie uma issue no sistema de rastreamento (GitHub Issues)
3. Adicione o bug a este documento seguindo o formato estabelecido
4. Notifique a equipe relevante

### Atualizando o Status de Bugs

Ao trabalhar em um bug:

1. Atualize o status no sistema de rastreamento
2. Atualize este documento com o novo status e outras informações relevantes
3. Se o bug for resolvido, mova-o para a seção "Bugs Resolvidos Recentemente"

### Priorização

Os bugs são priorizados com base em:

1. Severidade do impacto no usuário final
2. Frequência de ocorrência
3. Complexidade da solução
4. Dependências com outros componentes

## Versão

Versão atual: 1.0.0 (Março/2025)

## Histórico de Atualizações

- **1.0.0** (2025-03-12): Versão inicial do documento
