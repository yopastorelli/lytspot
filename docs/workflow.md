# Fluxo de Trabalho e Padrões de Desenvolvimento

Este documento descreve os fluxos de trabalho, padrões de codificação e boas práticas adotados no projeto Lytspot.

## Fluxo de Trabalho Git

### Estrutura de Branches

O projeto segue o modelo de Git Flow adaptado às necessidades específicas do Lytspot:

- **`main`**: Branch principal que contém o código em produção
- **`develop`**: Branch de desenvolvimento, contém as funcionalidades aprovadas para o próximo release
- **`feature/*`**: Branches para desenvolvimento de novas funcionalidades
- **`bugfix/*`**: Branches para correção de bugs
- **`hotfix/*`**: Branches para correções urgentes em produção
- **`release/*`**: Branches para preparação de releases

### Nomenclatura de Branches

- **Feature**: `feature/nome-da-funcionalidade`
- **Bugfix**: `bugfix/descricao-do-bug`
- **Hotfix**: `hotfix/descricao-da-correcao`
- **Release**: `release/v1.x.x`

### Processo de Desenvolvimento

1. **Criação de Branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nova-funcionalidade
   ```

2. **Desenvolvimento e Commits**:
   ```bash
   # Faça suas alterações
   git add .
   git commit -m "feat: implementa nova funcionalidade"
   ```

3. **Atualização com a Branch Base**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/nova-funcionalidade
   git merge develop
   # Resolva conflitos se necessário
   ```

4. **Pull Request**:
   - Crie um Pull Request da sua branch para `develop`
   - Preencha o template de PR com as informações necessárias
   - Solicite revisão de pelo menos um outro desenvolvedor

5. **Revisão de Código**:
   - O revisor verifica a qualidade do código, testes e documentação
   - Sugestões e correções são feitas através de comentários no PR
   - O autor faz as correções necessárias e solicita nova revisão

6. **Merge**:
   - Após aprovação, o PR é mesclado na branch `develop`
   - A branch de feature pode ser excluída

### Convenções de Commit

O projeto utiliza o padrão [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit:

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

**Tipos de Commit**:

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Alterações na documentação
- **style**: Alterações que não afetam o significado do código (espaços em branco, formatação, etc.)
- **refactor**: Refatoração de código
- **perf**: Melhorias de performance
- **test**: Adição ou correção de testes
- **build**: Alterações no sistema de build ou dependências externas
- **ci**: Alterações nos arquivos de configuração de CI
- **chore**: Outras alterações que não modificam arquivos de código ou teste

**Exemplos**:

```
feat(auth): implementa autenticação com Firebase

fix(pricing): corrige cálculo de preço total

docs(api): atualiza documentação dos endpoints

refactor(components): migra componente para TypeScript
```

## Padrões de Codificação

### Princípios Gerais

- **Simplicidade**: Prefira soluções simples, claras e legíveis
- **DRY (Don't Repeat Yourself)**: Evite duplicação de código
- **KISS (Keep It Simple, Stupid)**: Mantenha o código simples e direto
- **YAGNI (You Aren't Gonna Need It)**: Não implemente funcionalidades que não são necessárias no momento
- **Separação de Responsabilidades**: Cada componente ou módulo deve ter uma única responsabilidade

### JavaScript/TypeScript

#### Estilo de Código

- Use **camelCase** para variáveis, funções e propriedades
- Use **PascalCase** para classes e componentes React
- Use **UPPER_CASE** para constantes
- Use aspas simples (`'`) para strings
- Use ponto e vírgula (`;`) ao final de cada instrução
- Limite linhas a 100 caracteres
- Use 2 espaços para indentação

#### Boas Práticas

- Prefira funções puras e imutabilidade
- Use desestruturação para acessar propriedades de objetos
- Use arrow functions para preservar o contexto `this`
- Use async/await em vez de Promises encadeadas
- Evite variáveis globais
- Utilize TypeScript para tipos complexos

**Exemplo**:

```typescript
// Bom
const getUserData = async (userId: string): Promise<UserData> => {
  try {
    const { data } = await api.get(`/users/${userId}`);
    const { name, email, role } = data;
    return { name, email, role };
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    throw error;
  }
};

// Evitar
function getUserData(userId) {
  return api.get('/users/' + userId)
    .then(function(response) {
      return response.data;
    })
    .catch(function(error) {
      console.error('Erro ao buscar dados do usuário:', error);
      throw error;
    });
}
```

### React

#### Estrutura de Componentes

- Use componentes funcionais com hooks
- Separe a lógica de negócio da apresentação (Container/Presentational pattern)
- Mantenha componentes pequenos e focados em uma única responsabilidade
- Use prop-types ou TypeScript para definir as props

#### Hooks

- Use `useState` para estado local
- Use `useEffect` para efeitos colaterais
- Use `useCallback` para funções que são passadas para componentes filhos
- Use `useMemo` para cálculos pesados
- Crie hooks personalizados para lógica reutilizável

**Exemplo**:

```jsx
// Hook personalizado
const useServiceData = (serviceId) => {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await api.getServiceById(serviceId);
        setService(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  return { service, loading, error };
};

// Componente usando o hook
const ServiceDetails = ({ serviceId }) => {
  const { service, loading, error } = useServiceData(serviceId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!service) return <NotFound message="Serviço não encontrado" />;

  return (
    <div className="service-details">
      <h2>{service.nome}</h2>
      <p>{service.descricao}</p>
      <div className="price">R$ {service.preco_base.toFixed(2)}</div>
    </div>
  );
};
```

### Astro

#### Estrutura de Páginas

- Use componentes Astro (`.astro`) para conteúdo estático
- Use componentes React (`.jsx`/`.tsx`) para partes interativas
- Organize as páginas de acordo com a estrutura do site
- Use layouts reutilizáveis

#### Boas Práticas

- Aproveite a renderização estática do Astro para melhorar a performance
- Use hidratação parcial com diretivas `client:*` apenas quando necessário
- Prefira `client:visible` ou `client:idle` para componentes abaixo da dobra
- Utilize `getStaticPaths` para gerar páginas dinâmicas em tempo de build

**Exemplo**:

```astro
---
// src/pages/servicos/[id].astro
import Layout from '../../layouts/Layout.astro';
import ServiceDetails from '../../components/ServiceDetails';
import { getServices } from '../../services/api';

export async function getStaticPaths() {
  const services = await getServices();
  
  return services.map(service => ({
    params: { id: service.id.toString() },
    props: { service },
  }));
}

const { service } = Astro.props;
---

<Layout title={`${service.nome} | Lytspot`}>
  <div class="container mx-auto px-4 py-12">
    <ServiceDetails service={service} client:visible />
  </div>
</Layout>
```

### CSS/Tailwind

#### Organização

- Use Tailwind CSS para estilização
- Siga a abordagem mobile-first
- Agrupe classes relacionadas
- Crie componentes reutilizáveis na camada `@layer components`

#### Boas Práticas

- Prefira classes utilitárias do Tailwind em vez de CSS personalizado
- Use variantes responsivas (`sm:`, `md:`, `lg:`, etc.) para adaptação a diferentes tamanhos de tela
- Extraia padrões repetitivos para componentes no arquivo de estilos global
- Mantenha a consistência visual seguindo o sistema de design

**Exemplo**:

```html
<!-- Bom -->
<button class="btn btn-primary">
  Botão Primário
</button>

<!-- Evitar -->
<button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Botão Primário
</button>
```

```css
/* global.css */
@layer components {
  .btn {
    @apply px-4 py-2 rounded font-bold transition-colors;
  }
  
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white;
  }
}
```

## Testes

### Tipos de Testes

- **Testes Unitários**: Testam unidades individuais de código
- **Testes de Integração**: Testam a interação entre diferentes partes do sistema
- **Testes E2E (End-to-End)**: Testam o fluxo completo da aplicação

### Ferramentas

- **Vitest**: Para testes unitários e de integração
- **Testing Library**: Para testes de componentes React
- **Cypress**: Para testes E2E

### Boas Práticas

- Escreva testes para funcionalidades críticas
- Siga o padrão AAA (Arrange, Act, Assert)
- Use mocks para dependências externas
- Mantenha os testes independentes entre si
- Escreva testes legíveis e descritivos

**Exemplo**:

```jsx
// Teste de componente React
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ContactForm from './ContactForm';

describe('ContactForm', () => {
  test('deve enviar o formulário com os dados corretos', async () => {
    // Arrange
    const mockSubmit = vi.fn();
    render(<ContactForm onSubmit={mockSubmit} />);
    
    // Act
    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'João Silva' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'joao@exemplo.com' },
    });
    fireEvent.change(screen.getByLabelText(/mensagem/i), {
      target: { value: 'Olá, gostaria de mais informações.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
    
    // Assert
    expect(mockSubmit).toHaveBeenCalledWith({
      nome: 'João Silva',
      email: 'joao@exemplo.com',
      mensagem: 'Olá, gostaria de mais informações.',
    });
  });
});
```

## Revisão de Código

### Critérios de Revisão

- **Funcionalidade**: O código atende aos requisitos?
- **Qualidade**: O código segue os padrões e boas práticas?
- **Testes**: Existem testes adequados?
- **Documentação**: A documentação está clara e atualizada?
- **Performance**: O código é eficiente?
- **Segurança**: Existem vulnerabilidades?

### Processo de Revisão

1. **Verificação Automática**:
   - Linting
   - Testes automatizados
   - Análise estática de código

2. **Revisão Manual**:
   - Leitura do código
   - Verificação da lógica
   - Sugestões de melhorias

3. **Feedback**:
   - Comentários construtivos
   - Sugestões específicas
   - Aprovação ou solicitação de alterações

### Checklist de Revisão

- [ ] O código segue os padrões de codificação do projeto?
- [ ] A funcionalidade está implementada corretamente?
- [ ] Existem testes adequados?
- [ ] A documentação foi atualizada?
- [ ] O código é legível e bem organizado?
- [ ] Não há duplicação de código?
- [ ] O código é seguro e não introduz vulnerabilidades?
- [ ] A performance é adequada?

## Ambientes

### Desenvolvimento

- **URL**: `http://localhost:3000`
- **Variáveis de Ambiente**: Definidas em `.env.development`
- **Banco de Dados**: Instância local ou de desenvolvimento

### Homologação

- **URL**: `https://staging.lytspot.com.br`
- **Variáveis de Ambiente**: Definidas em `.env.staging`
- **Banco de Dados**: Instância de homologação

### Produção

- **URL**: `https://lytspot.com.br`
- **Variáveis de Ambiente**: Definidas em `.env.production`
- **Banco de Dados**: Instância de produção

### Configuração de Ambiente

Cada ambiente deve ter seu próprio arquivo de configuração:

```javascript
// environment.js
const getEnvironment = () => {
  // Detectar ambiente atual
  const isProduction = window.location.hostname === 'lytspot.com.br';
  const isStaging = window.location.hostname === 'staging.lytspot.com.br';
  const isDevelopment = !isProduction && !isStaging;
  
  return {
    isProduction,
    isStaging,
    isDevelopment,
    apiUrl: isProduction
      ? 'https://api.lytspot.com.br'
      : isStaging
        ? 'https://api-staging.lytspot.com.br'
        : 'http://localhost:3000',
    // Outras configurações específicas do ambiente
  };
};

export default getEnvironment();
```

## Implantação (Deployment)

### Pipeline de CI/CD

O projeto utiliza GitHub Actions para automação do processo de CI/CD:

1. **Build e Testes**:
   - Acionado em cada push para branches de feature, develop e main
   - Executa linting, testes unitários e build

2. **Deploy para Homologação**:
   - Acionado em cada merge para a branch develop
   - Implanta a aplicação no ambiente de homologação
   - Executa testes E2E

3. **Deploy para Produção**:
   - Acionado em cada merge para a branch main
   - Implanta a aplicação no ambiente de produção
   - Executa testes de smoke

### Processo de Release

1. **Preparação**:
   - Crie uma branch `release/vX.Y.Z` a partir de `develop`
   - Atualize a versão no `package.json`
   - Gere o changelog

2. **Testes e Validação**:
   - Implante a branch de release no ambiente de homologação
   - Execute testes E2E
   - Realize testes manuais

3. **Finalização**:
   - Mescle a branch de release em `main`
   - Mescle a branch de release de volta em `develop`
   - Crie uma tag com a versão

4. **Implantação**:
   - O pipeline de CI/CD implantará automaticamente a nova versão em produção

## Monitoramento e Logs

### Ferramentas

- **Monitoramento**: New Relic
- **Logs**: Sentry para erros de frontend, CloudWatch para logs de backend
- **Analytics**: Google Analytics para comportamento do usuário

### Padrões de Log

- **Informativo**: Eventos normais do sistema
- **Aviso**: Situações inesperadas que não afetam a funcionalidade principal
- **Erro**: Falhas que afetam a funcionalidade

**Exemplo**:

```javascript
// Logger centralizado
const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data);
    // Enviar para sistema de logs
  },
  
  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data);
    // Enviar para sistema de logs
  },
  
  error: (message, error, context) => {
    console.error(`[ERROR] ${message}`, error);
    // Enviar para Sentry ou outro sistema de monitoramento de erros
    Sentry.captureException(error, { extra: context });
  }
};

// Uso
try {
  // Operação arriscada
} catch (error) {
  logger.error('Falha ao processar pagamento', error, { 
    userId: user.id, 
    orderId: order.id 
  });
}
```

## Segurança

### Autenticação

- Utilização do Firebase Auth para autenticação segura
- Implementação de JWT para comunicação entre frontend e backend
- Suporte a autenticação de dois fatores (2FA)

### Proteção de Dados

- Todas as senhas são armazenadas com hashing e criptografia fortes
- Dados sensíveis são criptografados em repouso
- Comunicação sempre via HTTPS

### Prevenção de Vulnerabilidades

- Validação de entrada em todos os endpoints da API
- Proteção contra ataques comuns (XSS, CSRF, SQL Injection)
- Sanitização de dados antes de renderização

### Auditoria

- Registro de ações sensíveis (login, alteração de dados, etc.)
- Monitoramento de atividades suspeitas
- Revisão periódica de permissões

## Documentação

### Tipos de Documentação

- **Documentação de Código**: Comentários e JSDoc
- **Documentação de API**: Descrição de endpoints, parâmetros e respostas
- **Documentação de Arquitetura**: Visão geral do sistema e componentes
- **Documentação de Usuário**: Guias e tutoriais

### Padrões de Documentação

- Use comentários para explicar "por quê", não "o quê"
- Documente decisões arquiteturais importantes
- Mantenha a documentação atualizada junto com o código
- Use linguagem clara e concisa

**Exemplo de JSDoc**:

```javascript
/**
 * Calcula o preço total de um serviço com base nos parâmetros fornecidos.
 * 
 * @param {Object} service - O serviço base
 * @param {number} service.preco_base - Preço base do serviço
 * @param {Object} options - Opções adicionais
 * @param {number} options.distancia - Distância em km para deslocamento
 * @param {string[]} options.adicionais - Lista de serviços adicionais
 * @param {Object} adicionaisPrecos - Mapeamento de adicionais para preços
 * @returns {number} O preço total calculado
 */
const calcularPrecoTotal = (service, options, adicionaisPrecos) => {
  let total = service.preco_base;
  
  // Adicionar valor do deslocamento
  if (options.distancia > 0) {
    const valorPorKm = parseFloat(service.valor_deslocamento.replace(/[^\d,]/g, '').replace(',', '.'));
    total += options.distancia * valorPorKm;
  }
  
  // Adicionar serviços adicionais
  if (options.adicionais && options.adicionais.length > 0) {
    options.adicionais.forEach(adicional => {
      if (adicionaisPrecos[adicional]) {
        total += adicionaisPrecos[adicional];
      }
    });
  }
  
  return total;
};
```

## Versionamento

### Versionamento Semântico

O projeto segue o [Versionamento Semântico](https://semver.org/):

- **MAJOR**: Mudanças incompatíveis com versões anteriores
- **MINOR**: Adições de funcionalidades compatíveis com versões anteriores
- **PATCH**: Correções de bugs compatíveis com versões anteriores

### Changelog

O changelog é mantido no arquivo `CHANGELOG.md` e segue o formato [Keep a Changelog](https://keepachangelog.com/):

```markdown
# Changelog

## [1.2.0] - 2025-03-15

### Adicionado
- Novo componente de galeria para a página de portfólio
- Suporte para autenticação com Google

### Alterado
- Melhorada a performance do simulador de preços
- Atualizada a biblioteca de UI para a versão mais recente

### Corrigido
- Corrigido bug no formulário de contato em dispositivos móveis
- Corrigido problema de carregamento de imagens em conexões lentas

## [1.1.0] - 2025-02-20

...
```

## Manutenção

### Atualização de Dependências

- Atualize dependências regularmente para manter a segurança e performance
- Use `npm audit` para identificar vulnerabilidades
- Teste cuidadosamente após atualizações de dependências

### Refatoração

- Identifique e refatore código complexo ou duplicado
- Divida arquivos grandes em componentes menores
- Melhore a cobertura de testes durante a refatoração

### Limpeza de Código

- Remova código comentado ou não utilizado
- Atualize comentários desatualizados
- Remova dependências não utilizadas

## Conclusão

Este documento serve como guia para todos os desenvolvedores do projeto Lytspot. Seguir estes padrões e práticas ajuda a manter a qualidade do código, facilita a colaboração e reduz o tempo gasto em decisões triviais.

A documentação deve ser tratada como um documento vivo, sendo atualizada conforme o projeto evolui e novas práticas são adotadas.

## Versão

Versão atual: 1.0.0 (Março/2025)
