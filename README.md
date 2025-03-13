# Lytspot

Sistema de gerenciamento de serviços fotográficos e simulação de preços.

## 📋 Descrição

Lytspot é uma plataforma completa para gerenciamento de serviços fotográficos, permitindo a administração de serviços, simulação de preços para clientes e agendamento de sessões. O sistema é composto por um frontend desenvolvido com Astro e React, e um backend em Node.js com Express e Prisma.

## 🚀 Estrutura do Projeto

```text
/
├── public/              # Arquivos estáticos
├── server/              # Backend da aplicação
│   ├── config/          # Configurações do servidor
│   ├── controllers/     # Controladores da API
│   ├── middlewares/     # Middlewares Express
│   ├── models/          # Definições de modelos e seeds
│   ├── repositories/    # Acesso ao banco de dados
│   ├── scripts/         # Scripts utilitários
│   ├── services/        # Lógica de negócios
│   ├── transformers/    # Transformação de dados
│   └── server.js        # Ponto de entrada do servidor
├── src/                 # Frontend da aplicação
│   ├── components/      # Componentes React/Astro
│   ├── layouts/         # Layouts Astro
│   ├── pages/           # Páginas Astro
│   └── services/        # Serviços do frontend
└── package.json         # Dependências do projeto
```

## 🔧 Tecnologias Utilizadas

- **Frontend**: Astro, React, Tailwind CSS
- **Backend**: Node.js, Express, Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: Firebase Auth
- **Implantação**: Vercel (frontend), Render (backend)

## 🧞 Comandos

Todos os comandos são executados a partir da raiz do projeto:

| Comando                   | Ação                                                  |
| :------------------------ | :---------------------------------------------------- |
| `npm install`             | Instala as dependências                               |
| `npm run dev`             | Inicia o servidor de desenvolvimento em `localhost:4321` |
| `npm run build`           | Compila o site para produção em `./dist/`             |
| `npm run preview`         | Visualiza a compilação localmente antes de implantar  |
| `npm run server:dev`      | Inicia o servidor backend em `localhost:3001`         |
| `npm run server:build`    | Compila o servidor para produção                      |
| `npm run server:start`    | Inicia o servidor backend em modo produção            |

## 📚 API Endpoints

### Serviços

- `GET /api/pricing` - Lista todos os serviços disponíveis
- `GET /api/pricing/:id` - Obtém detalhes de um serviço específico
- `POST /api/pricing` - Cria um novo serviço (requer autenticação)
- `PUT /api/pricing/:id` - Atualiza um serviço existente (requer autenticação)
- `DELETE /api/pricing/:id` - Remove um serviço (requer autenticação)

### Simulação de Preços

- `POST /api/pricing/calculate` - Calcula o preço de um serviço com base nas opções selecionadas

### Autenticação

- `POST /api/auth/login` - Autentica um usuário
- `POST /api/auth/register` - Registra um novo usuário
- `GET /api/auth/me` - Obtém informações do usuário atual (requer autenticação)

### Utilitários

- `GET /api/health` - Verifica o status da API e configuração CORS

## 🔐 Autenticação

O sistema utiliza Firebase Auth para autenticação segura. Todas as requisições para endpoints protegidos devem incluir um token JWT válido no cabeçalho `Authorization`.

## 🌐 Ambientes

O sistema suporta múltiplos ambientes de execução:

- **Desenvolvimento**: Configurado para execução local
- **Produção**: Otimizado para desempenho e segurança

## 📝 Changelog

Consulte o [CHANGELOG.md](./CHANGELOG.md) para ver o histórico de alterações do projeto.

## 👥 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request
