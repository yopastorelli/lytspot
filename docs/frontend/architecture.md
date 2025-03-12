# Arquitetura do Frontend

## Visão Geral

O frontend do Lytspot é construído com Astro como framework principal, utilizando React para componentes interativos e Tailwind CSS para estilização. Esta arquitetura foi escolhida para combinar o melhor de ambos os mundos: a performance e simplicidade do Astro para conteúdo estático, e a interatividade do React para componentes dinâmicos.

## Estrutura de Diretórios

```
/src
├── components/           # Componentes reutilizáveis
│   ├── admin/            # Componentes do painel administrativo
│   │   ├── AdminPanel.jsx        # Painel principal de administração
│   │   ├── LoginForm.jsx         # Formulário de login
│   │   ├── ServicosManager.jsx   # Gerenciamento de serviços
│   │   └── ServicoForm.jsx       # Formulário de serviço
│   ├── common/           # Componentes comuns
│   │   ├── Button.astro          # Botão reutilizável
│   │   ├── Container.jsx         # Container para layout
│   │   └── ...
│   ├── contact/          # Componentes de contato
│   │   ├── ContactForm.tsx       # Formulário de contato
│   │   ├── ContactHero.astro     # Hero section da página de contato
│   │   └── ContactInfo.astro     # Informações de contato
│   ├── pricing/          # Componentes de preços
│   │   └── PriceSimulator.jsx    # Simulador de preços
│   ├── Footer.astro      # Rodapé do site
│   ├── Header.astro      # Cabeçalho do site
│   ├── Hero.astro        # Hero section da página inicial
│   ├── Portfolio.astro   # Seção de portfólio
│   └── Services.astro    # Seção de serviços
├── layouts/              # Layouts reutilizáveis
│   └── Layout.astro      # Layout principal
├── pages/                # Páginas do site
│   ├── admin/            # Páginas administrativas
│   │   └── index.astro   # Página do painel administrativo
│   ├── api/              # Endpoints da API (Astro)
│   │   └── pricing.astro # Endpoint para preços
│   ├── contato.astro     # Página de contato
│   ├── index.astro       # Página inicial
│   ├── politicas.astro   # Página de políticas
│   ├── portfolio.astro   # Página de portfólio
│   ├── precos.astro      # Página de preços
│   ├── servicos.astro    # Página de serviços
│   └── sobre.astro       # Página sobre
├── services/             # Serviços do frontend
│   └── api.js            # Serviço de API centralizado
├── styles/               # Estilos globais
│   └── global.css        # CSS global com Tailwind
└── utils/                # Utilitários
    └── environment.js    # Utilitário de ambiente
```

## Padrões de Componentes

O projeto utiliza uma combinação de componentes Astro e React, seguindo estes padrões:

### Componentes Astro (.astro)

Utilizados para conteúdo estático ou com pouca interatividade:

```astro
---
// Hero.astro
const videoPath = '/videos/drone-hero.mp4';
---

<section class="relative h-screen overflow-hidden">
  <video 
    class="absolute w-full h-full object-cover"
    autoplay 
    muted 
    loop 
    playsinline
    src={videoPath}
  >
  </video>
  
  <div class="absolute inset-0 bg-dark/50 flex items-center justify-center">
    <div class="text-center text-light max-w-4xl px-4">
      <h1 class="text-4xl md:text-6xl font-serif font-bold mb-6">
        Capturando momentos extraordinários
      </h1>
      <p class="text-xl md:text-2xl mb-8">
        Serviços profissionais de fotografia e filmagem aérea com drones
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="/servicos" class="btn btn-primary">Nossos Serviços</a>
        <a href="/contato" class="btn btn-outline">Fale Conosco</a>
      </div>
    </div>
  </div>
</section>
```

### Componentes React (.jsx/.tsx)

Utilizados para componentes interativos que requerem gerenciamento de estado e lógica complexa:

```jsx
// ContactForm.tsx
import { useState } from 'react';
import api from '../../services/api';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: ''
  });
  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, error: null });

    try {
      await api.post('/contact', formData);
      setStatus({ submitting: false, success: true, error: null });
      setFormData({ nome: '', email: '', telefone: '', mensagem: '' });
    } catch (error) {
      setStatus({
        submitting: false,
        success: false,
        error: error.response?.data?.message || 'Ocorreu um erro ao enviar o formulário.'
      });
    }
  };

  // Renderização do componente
  return (
    <form onSubmit={handleSubmit} className="bg-dark-lighter p-6 rounded-lg shadow-lg">
      {/* Campos do formulário */}
    </form>
  );
};

export default ContactForm;
```

## Integração Astro-React

O Astro permite a integração de componentes React usando a diretiva `client:` para especificar o modo de hidratação:

```astro
---
// contato.astro
import Layout from '../layouts/Layout.astro';
import ContactHero from '../components/contact/ContactHero.astro';
import ContactForm from '../components/contact/ContactForm';
import ContactInfo from '../components/contact/ContactInfo.astro';
---

<Layout title="Contato">
  <ContactHero />
  <div class="py-20 bg-dark">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-2 gap-12">
        <ContactInfo />
        <ContactForm client:load />
      </div>
    </div>
  </div>
</Layout>
```

Os modos de hidratação disponíveis incluem:

- `client:load`: Carrega e hidrata o componente assim que a página é carregada
- `client:idle`: Carrega e hidrata o componente quando o navegador estiver ocioso
- `client:visible`: Carrega e hidrata o componente quando ele se torna visível
- `client:only`: Renderiza o componente apenas no cliente, sem SSR

## Serviço de API Centralizado

O projeto utiliza um serviço de API centralizado (`api.js`) para gerenciar todas as requisições ao backend:

```javascript
// api.js
import axios from 'axios';
import { getApiUrl } from '../utils/environment';

// Criar instância do axios com configuração base
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Implementação de fallback para URLs alternativas
    if (error.code === 'ECONNABORTED' || !error.response) {
      const fallbackUrls = [
        'https://api-backup.lytspot.com.br',
        'https://lytspot-api.vercel.app'
      ];
      
      // Tentar URLs alternativas
      for (const url of fallbackUrls) {
        try {
          const fallbackApi = axios.create({
            baseURL: url,
            headers: config.headers,
            timeout: 15000,
          });
          
          return await fallbackApi(error.config);
        } catch (fallbackError) {
          console.log(`Fallback para ${url} falhou:`, fallbackError);
        }
      }
    }
    
    // Se o token expirou, redirecionar para login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname.includes('/admin')) {
        window.location.href = '/admin';
      }
    }
    
    return Promise.reject(error);
  }
);

// Métodos de API
const apiService = {
  // Autenticação
  login: (credentials) => api.post('/auth/login', credentials),
  verifyToken: () => api.get('/auth/verify'),
  
  // Serviços
  getServices: () => api.get('/pricing'),
  getServiceById: (id) => api.get(`/pricing/${id}`),
  createService: (data) => api.post('/pricing', data),
  updateService: (id, data) => api.put(`/pricing/${id}`, data),
  deleteService: (id) => api.delete(`/pricing/${id}`),
  
  // Contato
  submitContact: (data) => api.post('/contact', data),
  
  // Método genérico para requisições personalizadas
  request: (config) => api(config),
  
  // Métodos HTTP básicos
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config)
};

export default apiService;
```

## Estratégia de Fallback para Dados

Para componentes que dependem de dados da API, como o `PriceSimulator`, implementamos uma estratégia de fallback para garantir que o componente funcione mesmo quando a API não está disponível:

```jsx
// Trecho do PriceSimulator.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import servicosDemoData from '../../data/servicos';

const PriceSimulator = () => {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const carregarServicos = async () => {
      try {
        setLoading(true);
        const response = await api.getServices();
        setServicos(response.data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar serviços:', err);
        setError('Não foi possível carregar os serviços da API. Usando dados de demonstração.');
        // Fallback para dados de demonstração
        setServicos(servicosDemoData);
      } finally {
        setLoading(false);
      }
    };
    
    carregarServicos();
  }, []);
  
  // Resto do componente
};
```

## Sistema de Design

O projeto utiliza Tailwind CSS para estilização, com classes personalizadas para manter a consistência visual:

### Configuração do Tailwind

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
    },
  },
  plugins: [],
};
```

### Estilos Globais

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
}
```

## Responsividade

O projeto segue uma abordagem mobile-first, utilizando as classes de breakpoint do Tailwind:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Exemplo de implementação responsiva:

```astro
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Conteúdo responsivo -->
</div>
```

## Acessibilidade

O projeto implementa boas práticas de acessibilidade:

- Uso de atributos `alt` em imagens
- Contraste adequado entre texto e fundo
- Foco visível em elementos interativos
- Uso de landmarks semânticos (header, main, footer)
- Estrutura de cabeçalhos hierárquica

## Gerenciamento de Estado

Para componentes React complexos, o estado é gerenciado localmente usando hooks:

```jsx
// Exemplo de gerenciamento de estado com useState e useEffect
import { useState, useEffect } from 'react';

const ComponenteComEstado = () => {
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  useEffect(() => {
    const carregarDados = async () => {
      setCarregando(true);
      try {
        const resultado = await fetchDados();
        setDados(resultado);
      } catch (erro) {
        console.error(erro);
      } finally {
        setCarregando(false);
      }
    };
    
    carregarDados();
  }, []);
  
  // Renderização condicional baseada no estado
  if (carregando) return <div>Carregando...</div>;
  
  return (
    <div>
      {dados.map(item => (
        <div key={item.id}>{item.nome}</div>
      ))}
    </div>
  );
};
```

## Otimização de Performance

### Lazy Loading

Componentes pesados são carregados sob demanda:

```astro
---
// Exemplo de lazy loading com Astro
---

<div id="map-container" class="h-96">
  <button id="load-map" class="btn btn-primary">Carregar Mapa</button>
</div>

<script>
  document.getElementById('load-map').addEventListener('click', async () => {
    const container = document.getElementById('map-container');
    container.innerHTML = '<div>Carregando mapa...</div>';
    
    // Importação dinâmica do componente de mapa
    const { initMap } = await import('../scripts/map.js');
    initMap(container);
  });
</script>
```

### Otimização de Imagens

Utilização do componente `Image` do Astro para otimização automática:

```astro
---
import { Image } from 'astro:assets';
import imagemHero from '../assets/hero-image.jpg';
---

<Image 
  src={imagemHero} 
  alt="Drone capturando imagens aéreas" 
  width={1200} 
  height={800}
  format="webp"
  quality={80}
  class="rounded-lg shadow-lg"
/>
```

## Próximos Passos

- Implementação de testes automatizados com Cypress
- Migração para TypeScript em todos os componentes
- Implementação de tema escuro (dark mode)
- Melhoria na documentação de componentes com Storybook
- Implementação de internacionalização (i18n) para suporte a múltiplos idiomas
