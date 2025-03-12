# Documentação da API Lytspot

Esta documentação descreve os endpoints disponíveis na API REST do Lytspot, incluindo parâmetros, respostas e exemplos de uso.

## Visão Geral

A API do Lytspot segue os princípios RESTful e utiliza JSON para formatação de dados. Todas as requisições devem ser feitas via HTTPS em ambiente de produção.

### URL Base

- **Desenvolvimento**: `http://localhost:3000`
- **Produção**: `https://api.lytspot.com.br`

### Autenticação

A API utiliza autenticação baseada em JWT (JSON Web Token). Para endpoints protegidos, é necessário incluir o token no cabeçalho de autorização:

```
Authorization: Bearer {seu_token_jwt}
```

Para obter um token, utilize o endpoint de login.

### Códigos de Status HTTP

A API utiliza os seguintes códigos de status HTTP:

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Erro na requisição (dados inválidos)
- `401 Unauthorized`: Autenticação necessária ou inválida
- `403 Forbidden`: Sem permissão para acessar o recurso
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

### Formato de Resposta

Todas as respostas são retornadas no formato JSON com a seguinte estrutura:

```json
{
  "message": "Mensagem descritiva",
  "data": { ... }  // Dados da resposta (opcional)
  "error": { ... }  // Detalhes do erro (apenas em caso de erro)
}
```

## Endpoints

### Autenticação

#### Login

Autentica um usuário e retorna um token JWT.

- **URL**: `/api/auth/login`
- **Método**: `POST`
- **Autenticação**: Não requerida

**Corpo da Requisição**:

```json
{
  "email": "admin@lytspot.com",
  "password": "Admin@123456"
}
```

**Resposta de Sucesso (200)**:

```json
{
  "user": {
    "id": 1,
    "email": "admin@lytspot.com",
    "nome": "Administrador",
    "createdAt": "2025-03-12T19:48:14.433Z",
    "updatedAt": "2025-03-12T19:48:14.433Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta de Erro (401)**:

```json
{
  "message": "Credenciais inválidas"
}
```

#### Registro (Apenas Uso Administrativo)

Registra um novo usuário administrador. Este endpoint é destinado apenas para uso administrativo inicial.

- **URL**: `/api/auth/register`
- **Método**: `POST`
- **Autenticação**: Não requerida

**Corpo da Requisição**:

```json
{
  "nome": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "password": "senha_segura"
}
```

**Resposta de Sucesso (201)**:

```json
{
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "nome": "Nome do Usuário"
  }
}
```

**Resposta de Erro (400)**:

```json
{
  "message": "Erro ao registrar usuário",
  "error": {
    "email": "Este email já está em uso"
  }
}
```

#### Verificar Token

Verifica se um token JWT é válido.

- **URL**: `/api/auth/verify`
- **Método**: `GET`
- **Autenticação**: Requerida

**Resposta de Sucesso (200)**:

```json
{
  "message": "Token válido",
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "nome": "Nome do Usuário"
  }
}
```

**Resposta de Erro (401)**:

```json
{
  "message": "Token inválido ou expirado"
}
```

### Serviços (Pricing)

#### Listar Serviços

Retorna a lista de todos os serviços disponíveis.

- **URL**: `/pricing`
- **Método**: `GET`
- **Autenticação**: Não requerida
- **Cache**: 10 minutos

**Parâmetros de Consulta (Opcionais)**:

- `limit`: Número máximo de serviços a retornar (padrão: 100)
- `offset`: Índice inicial para paginação (padrão: 0)

**Resposta de Sucesso (200)**:

```json
{
  "message": "Serviços encontrados com sucesso",
  "data": [
    {
      "id": 1,
      "nome": "Filmagem com Drone",
      "descricao": "Captura de imagens aéreas com drones de alta performance",
      "preco_base": 1500.00,
      "duracao_media_captura": "4 horas",
      "duracao_media_tratamento": "2 dias",
      "entregaveis": "Vídeo editado em 4K, fotos em alta resolução",
      "possiveis_adicionais": "Edição avançada, entrega expressa",
      "valor_deslocamento": "R$ 2,00 por km",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-03-10T14:20:00Z"
    },
    {
      "id": 2,
      "nome": "Fotografia Profissional",
      "descricao": "Serviço de fotografia profissional para eventos",
      "preco_base": 800.00,
      "duracao_media_captura": "3 horas",
      "duracao_media_tratamento": "1 dia",
      "entregaveis": "100 fotos editadas em alta resolução",
      "possiveis_adicionais": "Álbum impresso, fotos adicionais",
      "valor_deslocamento": "R$ 1,50 por km",
      "createdAt": "2025-01-20T09:15:00Z",
      "updatedAt": "2025-03-05T11:45:00Z"
    }
  ],
  "total": 2
}
```

#### Obter Serviço por ID

Retorna os detalhes de um serviço específico.

- **URL**: `/pricing/:id`
- **Método**: `GET`
- **Autenticação**: Não requerida
- **Cache**: 10 minutos

**Parâmetros de URL**:

- `id`: ID do serviço

**Resposta de Sucesso (200)**:

```json
{
  "message": "Serviço encontrado com sucesso",
  "data": {
    "id": 1,
    "nome": "Filmagem com Drone",
    "descricao": "Captura de imagens aéreas com drones de alta performance",
    "preco_base": 1500.00,
    "duracao_media_captura": "4 horas",
    "duracao_media_tratamento": "2 dias",
    "entregaveis": "Vídeo editado em 4K, fotos em alta resolução",
    "possiveis_adicionais": "Edição avançada, entrega expressa",
    "valor_deslocamento": "R$ 2,00 por km",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-03-10T14:20:00Z"
  }
}
```

**Resposta de Erro (404)**:

```json
{
  "message": "Serviço não encontrado"
}
```

#### Criar Serviço

Cria um novo serviço.

- **URL**: `/pricing`
- **Método**: `POST`
- **Autenticação**: Requerida (Admin)

**Corpo da Requisição**:

```json
{
  "nome": "Vídeo Corporativo",
  "descricao": "Produção de vídeos corporativos de alta qualidade",
  "preco_base": 2500.00,
  "duracao_media_captura": "1 dia",
  "duracao_media_tratamento": "5 dias",
  "entregaveis": "Vídeo editado em 4K, versão para redes sociais",
  "possiveis_adicionais": "Locutor profissional, legendas em outros idiomas",
  "valor_deslocamento": "R$ 2,50 por km"
}
```

**Resposta de Sucesso (201)**:

```json
{
  "message": "Serviço criado com sucesso",
  "data": {
    "id": 3,
    "nome": "Vídeo Corporativo",
    "descricao": "Produção de vídeos corporativos de alta qualidade",
    "preco_base": 2500.00,
    "duracao_media_captura": "1 dia",
    "duracao_media_tratamento": "5 dias",
    "entregaveis": "Vídeo editado em 4K, versão para redes sociais",
    "possiveis_adicionais": "Locutor profissional, legendas em outros idiomas",
    "valor_deslocamento": "R$ 2,50 por km",
    "createdAt": "2025-03-12T13:45:00Z",
    "updatedAt": "2025-03-12T13:45:00Z"
  }
}
```

**Resposta de Erro (400)**:

```json
{
  "message": "Erro ao criar serviço",
  "error": {
    "nome": "O nome é obrigatório",
    "preco_base": "O preço base deve ser um número"
  }
}
```

#### Atualizar Serviço

Atualiza um serviço existente.

- **URL**: `/pricing/:id`
- **Método**: `PUT`
- **Autenticação**: Requerida (Admin)

**Parâmetros de URL**:

- `id`: ID do serviço

**Corpo da Requisição**:

```json
{
  "nome": "Vídeo Corporativo Premium",
  "descricao": "Produção de vídeos corporativos de alta qualidade com equipe especializada",
  "preco_base": 3000.00,
  "duracao_media_captura": "1 dia",
  "duracao_media_tratamento": "7 dias",
  "entregaveis": "Vídeo editado em 4K, versão para redes sociais, versão para apresentações",
  "possiveis_adicionais": "Locutor profissional, legendas em outros idiomas, animações personalizadas",
  "valor_deslocamento": "R$ 3,00 por km"
}
```

**Resposta de Sucesso (200)**:

```json
{
  "message": "Serviço atualizado com sucesso",
  "data": {
    "id": 3,
    "nome": "Vídeo Corporativo Premium",
    "descricao": "Produção de vídeos corporativos de alta qualidade com equipe especializada",
    "preco_base": 3000.00,
    "duracao_media_captura": "1 dia",
    "duracao_media_tratamento": "7 dias",
    "entregaveis": "Vídeo editado em 4K, versão para redes sociais, versão para apresentações",
    "possiveis_adicionais": "Locutor profissional, legendas em outros idiomas, animações personalizadas",
    "valor_deslocamento": "R$ 3,00 por km",
    "createdAt": "2025-03-12T13:45:00Z",
    "updatedAt": "2025-03-12T14:30:00Z"
  }
}
```

**Resposta de Erro (404)**:

```json
{
  "message": "Serviço não encontrado"
}
```

#### Excluir Serviço

Remove um serviço existente.

- **URL**: `/pricing/:id`
- **Método**: `DELETE`
- **Autenticação**: Requerida (Admin)

**Parâmetros de URL**:

- `id`: ID do serviço

**Resposta de Sucesso (200)**:

```json
{
  "message": "Serviço excluído com sucesso"
}
```

**Resposta de Erro (404)**:

```json
{
  "message": "Serviço não encontrado"
}
```

### Contato

#### Enviar Mensagem de Contato

Envia uma mensagem através do formulário de contato.

- **URL**: `/contact`
- **Método**: `POST`
- **Autenticação**: Não requerida

**Corpo da Requisição**:

```json
{
  "nome": "Nome do Cliente",
  "email": "cliente@exemplo.com",
  "telefone": "(11) 98765-4321",
  "mensagem": "Gostaria de obter mais informações sobre o serviço de filmagem com drone."
}
```

**Resposta de Sucesso (200)**:

```json
{
  "message": "Mensagem enviada com sucesso"
}
```

**Resposta de Erro (400)**:

```json
{
  "message": "Erro ao enviar mensagem",
  "error": {
    "email": "Email inválido",
    "mensagem": "A mensagem é obrigatória"
  }
}
```

### Sincronização

#### Sincronizar Dados de Demonstração

Sincroniza os dados de demonstração para uso offline.

- **URL**: `/sync/demo`
- **Método**: `GET`
- **Autenticação**: Requerida (Admin)

**Resposta de Sucesso (200)**:

```json
{
  "message": "Dados sincronizados com sucesso",
  "data": {
    "timestamp": "2025-03-12T14:45:00Z",
    "services": 3
  }
}
```

## Tratamento de Erros

### Formato de Erro

Quando ocorre um erro, a API retorna uma resposta com o seguinte formato:

```json
{
  "message": "Mensagem descritiva do erro",
  "error": {
    "campo1": "Erro específico do campo1",
    "campo2": "Erro específico do campo2"
  }
}
```

### Erros Comuns

- **Validação de Dados**: Retorna erro 400 com detalhes sobre os campos inválidos
- **Autenticação**: Retorna erro 401 quando o token é inválido ou expirado
- **Autorização**: Retorna erro 403 quando o usuário não tem permissão para acessar o recurso
- **Recurso Não Encontrado**: Retorna erro 404 quando o recurso solicitado não existe
- **Erro Interno**: Retorna erro 500 quando ocorre um erro inesperado no servidor

## Limites de Taxa (Rate Limiting)

Para proteger a API contra abusos, implementamos limites de taxa:

- **Endpoints Públicos**: 100 requisições por minuto por IP
- **Endpoints Autenticados**: 300 requisições por minuto por usuário

Quando o limite é excedido, a API retorna o status 429 (Too Many Requests) com o cabeçalho `Retry-After` indicando o tempo (em segundos) para aguardar antes de fazer novas requisições.

## Versionamento

A API atual está na versão 1.0. O versionamento é implícito na URL base.

## Exemplos de Uso

### Fluxo de Autenticação

1. **Login**:

```javascript
// Exemplo de login com JavaScript/Axios
const login = async (email, password) => {
  try {
    const response = await axios.post('https://api.lytspot.com.br/api/auth/login', {
      email,
      password
    });
    
    // Armazenar o token para uso futuro
    localStorage.setItem('token', response.data.token);
    return response.data.user;
  } catch (error) {
    console.error('Erro no login:', error.response?.data || error.message);
    throw error;
  }
};
```

2. **Requisição Autenticada**:

```javascript
// Exemplo de requisição autenticada com JavaScript/Axios
const createService = async (serviceData) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post('https://api.lytspot.com.br/pricing', serviceData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Erro ao criar serviço:', error.response?.data || error.message);
    throw error;
  }
};
```

### Simulador de Preços

```javascript
// Exemplo de uso da API para o simulador de preços
const loadServices = async () => {
  try {
    const response = await axios.get('https://api.lytspot.com.br/pricing');
    return response.data.data;
  } catch (error) {
    console.error('Erro ao carregar serviços:', error.response?.data || error.message);
    // Fallback para dados locais
    return require('./data/servicos');
  }
};
```

### Envio de Formulário de Contato

```javascript
// Exemplo de envio de formulário de contato
const submitContactForm = async (formData) => {
  try {
    const response = await axios.post('https://api.lytspot.com.br/contact', formData);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar formulário:', error.response?.data || error.message);
    throw error;
  }
};
```

## Considerações de Segurança

### HTTPS

Todas as requisições em ambiente de produção devem ser feitas via HTTPS para garantir a segurança dos dados transmitidos.

### Armazenamento de Tokens

Os tokens JWT devem ser armazenados de forma segura:

- Em aplicações web, utilize `localStorage` ou `sessionStorage`
- Em aplicações móveis, utilize armazenamento seguro específico da plataforma
- Nunca armazene tokens em cookies sem a flag `httpOnly`

### Renovação de Tokens

Os tokens JWT têm validade de 24 horas. Após esse período, é necessário fazer login novamente para obter um novo token.

## Suporte e Contato

Para questões relacionadas à API, entre em contato pelo email `api@lytspot.com.br` ou abra uma issue no repositório do projeto.

## Changelog

### Versão 1.0.0 (12/03/2025)

- Lançamento inicial da API
- Endpoints de autenticação, serviços e contato
- Implementação de cache e rate limiting
- Documentação completa
