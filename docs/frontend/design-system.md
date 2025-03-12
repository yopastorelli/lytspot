# Sistema de Design Lytspot

Este documento descreve o sistema de design utilizado no projeto Lytspot, incluindo cores, tipografia, componentes e padrões de UI/UX.

## Paleta de Cores

A paleta de cores do Lytspot foi cuidadosamente selecionada para transmitir profissionalismo, confiança e modernidade.

### Cores Primárias

| Nome | Hex | Uso |
|------|-----|-----|
| primary | `#000430` | Cor principal da marca, usada em elementos de destaque e cabeçalhos |
| primary-light | `#4A90E2` | Variação clara da cor principal, usada em elementos interativos e destaques secundários |
| primary-dark | `#051520` | Variação escura da cor principal, usada em estados hover e elementos de fundo |

### Cores de Destaque

| Nome | Hex | Uso |
|------|-----|-----|
| accent | `#3B82F6` | Cor de destaque, usada para chamar atenção para elementos importantes |

### Cores Neutras

| Nome | Hex | Uso |
|------|-----|-----|
| neutral | `#1A1A1A` | Texto principal em fundos claros |
| light | `#F5F5F5` | Fundo claro e texto em fundos escuros |
| light-darker | `#E5E5E5` | Fundo claro alternativo para criar contraste sutil |
| dark | `#121212` | Fundo escuro principal |
| dark-lighter | `#1E1E1E` | Fundo escuro alternativo para criar contraste sutil |

### Cores de Estado

| Nome | Hex | Uso |
|------|-----|-----|
| success | `#10B981` | Mensagens de sucesso e confirmação |
| warning | `#F59E0B` | Alertas e avisos |
| error | `#EF4444` | Erros e mensagens críticas |
| info | `#3B82F6` | Informações e dicas |

## Tipografia

A hierarquia tipográfica do Lytspot utiliza uma combinação de fontes sans-serif e serif para criar contraste e melhorar a legibilidade.

### Famílias de Fontes

| Família | Fontes | Uso |
|---------|--------|-----|
| sans | Roboto, Nunito, Arial, sans-serif | Texto principal, conteúdo e interface |
| serif | Montserrat, Playfair Display, Merriweather, Georgia, serif | Títulos e elementos de destaque |
| heading | Montserrat, Arial, sans-serif | Cabeçalhos e títulos de seção |
| title | Montserrat, Arial, sans-serif | Títulos principais e logotipo |

### Escala Tipográfica

| Tamanho | Classe Tailwind | Uso |
|---------|-----------------|-----|
| 12px | `text-xs` | Texto muito pequeno, notas de rodapé |
| 14px | `text-sm` | Texto secundário, legendas |
| 16px | `text-base` | Texto principal do corpo |
| 18px | `text-lg` | Texto de destaque |
| 20px | `text-xl` | Subtítulos |
| 24px | `text-2xl` | Títulos de seção pequenos |
| 30px | `text-3xl` | Títulos de seção médios |
| 36px | `text-4xl` | Títulos de seção grandes |
| 48px | `text-5xl` | Títulos de página |
| 60px | `text-6xl` | Títulos principais e hero |

### Pesos de Fonte

| Peso | Classe Tailwind | Uso |
|------|-----------------|-----|
| 300 | `font-light` | Texto leve para conteúdo extenso |
| 400 | `font-normal` | Texto normal para a maioria do conteúdo |
| 500 | `font-medium` | Texto médio para elementos de interface e subtítulos |
| 600 | `font-semibold` | Texto semi-negrito para destaques e botões |
| 700 | `font-bold` | Texto negrito para títulos e elementos importantes |

## Espaçamento

O sistema de espaçamento segue uma escala consistente baseada em múltiplos de 4px.

| Tamanho | Classe Tailwind | Valor | Uso |
|---------|-----------------|-------|-----|
| 0 | `p-0`, `m-0` | 0px | Sem espaçamento |
| 1 | `p-1`, `m-1` | 4px | Espaçamento mínimo entre elementos relacionados |
| 2 | `p-2`, `m-2` | 8px | Espaçamento padrão entre elementos relacionados |
| 3 | `p-3`, `m-3` | 12px | Espaçamento médio |
| 4 | `p-4`, `m-4` | 16px | Espaçamento padrão entre grupos de elementos |
| 6 | `p-6`, `m-6` | 24px | Espaçamento grande |
| 8 | `p-8`, `m-8` | 32px | Espaçamento entre seções |
| 12 | `p-12`, `m-12` | 48px | Espaçamento grande entre seções |
| 16 | `p-16`, `m-16` | 64px | Espaçamento muito grande entre seções |
| 20 | `p-20`, `m-20` | 80px | Espaçamento para separação de seções principais |

## Sombras

| Nome | Classe Tailwind | Uso |
|------|-----------------|-----|
| soft | `shadow-soft` | Sombra sutil para elementos de interface |
| card | `shadow-card` | Sombra para cards e elementos elevados |
| lg | `shadow-lg` | Sombra grande para elementos de destaque |
| xl | `shadow-xl` | Sombra extra grande para modais e elementos flutuantes |

## Componentes UI

### Botões

Os botões seguem uma hierarquia visual clara para indicar sua importância e função.

#### Variantes de Botão

| Variante | Classe | Aparência | Uso |
|----------|--------|-----------|-----|
| Primary | `btn btn-primary` | Fundo azul escuro, texto branco | Ações principais e de destaque |
| Accent | `btn btn-accent` | Fundo azul, texto branco | Ações secundárias importantes |
| Outline | `btn btn-outline` | Borda branca, texto branco | Ações alternativas ou menos importantes |
| Text | `btn btn-text` | Apenas texto, sem fundo | Ações terciárias ou links |

#### Tamanhos de Botão

| Tamanho | Classe | Uso |
|---------|--------|-----|
| Small | `btn-sm` | Botões em espaços limitados ou ações secundárias |
| Medium | `btn` | Tamanho padrão para a maioria dos botões |
| Large | `btn-lg` | Botões de destaque ou call-to-action |

```html
<!-- Exemplo de botão primário -->
<button class="btn btn-primary">
  Botão Primário
</button>

<!-- Exemplo de botão de destaque grande -->
<button class="btn btn-accent btn-lg">
  Botão de Destaque Grande
</button>

<!-- Exemplo de botão outline pequeno -->
<button class="btn btn-outline btn-sm">
  Botão Outline Pequeno
</button>
```

### Formulários

Os elementos de formulário são projetados para serem acessíveis e fáceis de usar.

#### Campos de Entrada

```html
<div class="form-group">
  <label for="nome" class="form-label">Nome</label>
  <input 
    type="text" 
    id="nome" 
    name="nome" 
    class="input" 
    placeholder="Seu nome completo"
  />
</div>
```

#### Mensagens de Erro

```html
<div class="form-group">
  <label for="email" class="form-label">Email</label>
  <input 
    type="email" 
    id="email" 
    name="email" 
    class="input border-red-500" 
    placeholder="seu@email.com"
  />
  <p class="error-message">Por favor, insira um email válido.</p>
</div>
```

#### Select

```html
<div class="form-group">
  <label for="servico" class="form-label">Serviço</label>
  <select id="servico" name="servico" class="input">
    <option value="">Selecione um serviço</option>
    <option value="drone">Filmagem com Drone</option>
    <option value="foto">Fotografia Profissional</option>
    <option value="video">Vídeo Corporativo</option>
  </select>
</div>
```

#### Checkbox e Radio

```html
<div class="form-group">
  <div class="flex items-center">
    <input 
      type="checkbox" 
      id="termos" 
      name="termos" 
      class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
    />
    <label for="termos" class="ml-2 text-light">
      Concordo com os termos e condições
    </label>
  </div>
</div>
```

### Cards

Os cards são utilizados para agrupar informações relacionadas.

```html
<div class="bg-dark-lighter rounded-lg border border-gray-700/50 p-6 shadow-card">
  <h3 class="text-xl font-bold text-light mb-4">Título do Card</h3>
  <p class="text-light/80 mb-4">
    Conteúdo do card com informações relevantes para o usuário.
  </p>
  <a href="#" class="text-primary-light hover:text-primary transition-colors">
    Saiba mais
  </a>
</div>
```

### Alertas

Os alertas são utilizados para comunicar mensagens importantes ao usuário.

```html
<!-- Alerta de sucesso -->
<div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
  <div class="flex items-center">
    <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
      <!-- Ícone de check -->
    </svg>
    <p>Operação realizada com sucesso!</p>
  </div>
</div>

<!-- Alerta de erro -->
<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
  <div class="flex items-center">
    <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
      <!-- Ícone de erro -->
    </svg>
    <p>Ocorreu um erro ao processar sua solicitação.</p>
  </div>
</div>
```

## Layout

### Container

O container é utilizado para centralizar e limitar a largura do conteúdo.

```html
<div class="container mx-auto px-4">
  <!-- Conteúdo centralizado -->
</div>
```

### Grid

O sistema de grid utiliza o Tailwind CSS para criar layouts responsivos.

```html
<!-- Grid de 3 colunas em desktop, 2 em tablet e 1 em mobile -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Coluna 1</div>
  <div>Coluna 2</div>
  <div>Coluna 3</div>
</div>
```

### Flexbox

Flexbox é utilizado para layouts mais flexíveis e alinhamentos.

```html
<!-- Centralizar conteúdo horizontal e verticalmente -->
<div class="flex items-center justify-center h-screen">
  <div>Conteúdo centralizado</div>
</div>

<!-- Distribuir itens horizontalmente -->
<div class="flex justify-between items-center">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## Responsividade

O design segue uma abordagem mobile-first, utilizando os breakpoints do Tailwind CSS.

### Breakpoints

| Nome | Tamanho | Classe Tailwind |
|------|---------|-----------------|
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |
| 2xl | 1536px | `2xl:` |

### Exemplos de Uso

```html
<!-- Texto que muda de tamanho em diferentes breakpoints -->
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  Título Responsivo
</h1>

<!-- Layout que muda de 1 coluna para 2 e depois 3 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Conteúdo -->
</div>

<!-- Elemento que é visível apenas em mobile -->
<div class="block md:hidden">
  Visível apenas em mobile
</div>

<!-- Elemento que é visível apenas em desktop -->
<div class="hidden md:block">
  Visível apenas em desktop
</div>
```

## Animações e Transições

As animações e transições são utilizadas com moderação para melhorar a experiência do usuário.

### Transições

```html
<!-- Botão com transição suave no hover -->
<button class="bg-primary text-white hover:bg-primary-dark transition-colors duration-300">
  Botão com Transição
</button>

<!-- Card com transição de escala no hover -->
<div class="bg-dark-lighter p-6 rounded-lg transform hover:scale-105 transition-transform duration-300">
  Card com Transição
</div>
```

### Animações

```html
<!-- Elemento com animação de fade-in -->
<div class="animate-fade-in">
  Conteúdo com fade-in
</div>

<!-- Elemento com animação de pulse -->
<div class="animate-pulse">
  Conteúdo pulsante
</div>
```

## Acessibilidade

O sistema de design prioriza a acessibilidade seguindo as diretrizes WCAG 2.1.

### Contraste

- Texto normal: Contraste mínimo de 4.5:1
- Texto grande: Contraste mínimo de 3:1
- Elementos de interface: Contraste mínimo de 3:1

### Foco

Todos os elementos interativos possuem um estado de foco visível:

```html
<button class="btn btn-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Botão com Estado de Foco
</button>
```

### Textos Alternativos

Todas as imagens possuem textos alternativos descritivos:

```html
<img src="/imagens/drone.jpg" alt="Drone DJI Mavic 3 voando sobre montanhas" />
```

## Ícones

O projeto utiliza ícones SVG inline para melhor performance e personalização.

```html
<svg class="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
  <!-- Conteúdo do SVG -->
</svg>
```

## Implementação no Tailwind CSS

A configuração do Tailwind CSS inclui todas as cores, fontes e outros valores do sistema de design:

```javascript
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#000430',
        'primary-light': '#4A90E2',
        'primary-dark': '#051520',
        accent: '#3B82F6',
        neutral: '#1A1A1A',
        light: '#F5F5F5',
        'light-darker': '#E5E5E5',
        dark: '#121212',
        'dark-lighter': '#1E1E1E',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Roboto', 'Nunito', 'Arial', 'sans-serif'],
        serif: ['Montserrat', 'Playfair Display', 'Merriweather', 'Georgia', 'serif'],
        heading: ['Montserrat', 'Arial', 'sans-serif'],
        title: ['Montserrat', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
        card: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
```

## Componentes Personalizados

Os componentes personalizados são definidos na camada de componentes do Tailwind CSS:

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn {
    @apply inline-block px-6 py-3 rounded-md font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply bg-primary text-white hover:bg-primary-dark focus:ring-primary;
  }
  
  .btn-accent {
    @apply bg-accent text-white hover:bg-blue-700 focus:ring-accent;
  }
  
  .btn-outline {
    @apply border-2 border-light text-light hover:bg-light/10 focus:ring-light;
  }
  
  .btn-text {
    @apply text-primary-light hover:text-primary underline focus:ring-primary-light;
  }
  
  .btn-sm {
    @apply px-4 py-2 text-sm;
  }
  
  .btn-lg {
    @apply px-8 py-4 text-lg;
  }
  
  .input {
    @apply w-full px-4 py-2 bg-dark-lighter border border-gray-700 rounded-md text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent;
  }
  
  .form-group {
    @apply mb-4;
  }
  
  .form-label {
    @apply block text-light mb-2 font-medium;
  }
  
  .error-message {
    @apply text-red-500 text-sm mt-1;
  }
  
  .card {
    @apply bg-dark-lighter rounded-lg border border-gray-700/50 p-6 shadow-card;
  }
  
  .container {
    @apply mx-auto px-4 max-w-7xl;
  }
}
```

## Boas Práticas

### Mobile-First

Todo o desenvolvimento de interface segue uma abordagem mobile-first, garantindo que a experiência seja ótima em todos os dispositivos.

### Consistência

Utilize sempre os componentes e classes definidos neste sistema de design para manter a consistência visual em todo o projeto.

### Acessibilidade

Priorize a acessibilidade em todos os componentes, garantindo que sejam utilizáveis por todos os usuários, independentemente de suas limitações.

### Performance

Otimize imagens e utilize técnicas como lazy loading para garantir uma boa performance em todos os dispositivos.

## Exemplos de Uso

### Página de Serviços

```html
<section class="py-20 bg-dark">
  <div class="container">
    <h1 class="text-4xl md:text-5xl font-serif font-bold text-primary mb-8 text-center">
      Nossos Serviços
    </h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Card de Serviço 1 -->
      <div class="card">
        <img src="/images/drone.jpg" alt="Drone em voo" class="w-full h-48 object-cover rounded-md mb-4" />
        <h3 class="text-xl font-bold text-light mb-2">Filmagem com Drone</h3>
        <p class="text-light/80 mb-4">
          Captura de imagens aéreas com drones de alta performance para diversos fins.
        </p>
        <a href="/servicos/drone" class="btn btn-primary w-full">Saiba mais</a>
      </div>
      
      <!-- Card de Serviço 2 -->
      <div class="card">
        <img src="/images/camera.jpg" alt="Câmera profissional" class="w-full h-48 object-cover rounded-md mb-4" />
        <h3 class="text-xl font-bold text-light mb-2">Fotografia Profissional</h3>
        <p class="text-light/80 mb-4">
          Serviços de fotografia profissional para eventos, produtos e muito mais.
        </p>
        <a href="/servicos/fotografia" class="btn btn-primary w-full">Saiba mais</a>
      </div>
      
      <!-- Card de Serviço 3 -->
      <div class="card">
        <img src="/images/video.jpg" alt="Filmagem corporativa" class="w-full h-48 object-cover rounded-md mb-4" />
        <h3 class="text-xl font-bold text-light mb-2">Vídeos Corporativos</h3>
        <p class="text-light/80 mb-4">
          Produção de vídeos corporativos de alta qualidade para sua empresa.
        </p>
        <a href="/servicos/video" class="btn btn-primary w-full">Saiba mais</a>
      </div>
    </div>
  </div>
</section>
```

## Manutenção e Evolução

Este sistema de design deve ser tratado como um documento vivo, evoluindo conforme as necessidades do projeto. Qualquer alteração deve ser documentada e refletida tanto neste documento quanto na implementação.

### Processo de Atualização

1. Identifique a necessidade de um novo componente ou alteração
2. Documente a proposta de alteração
3. Implemente a alteração no código
4. Atualize este documento
5. Comunique a alteração à equipe

## Versão

Versão atual: 1.0.0 (Março/2025)
