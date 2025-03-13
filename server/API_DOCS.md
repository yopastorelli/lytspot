# Documentação da API Lytspot

## Visão Geral

A API Lytspot fornece endpoints para gerenciamento de serviços fotográficos, simulação de preços e autenticação de usuários. Esta documentação descreve os endpoints disponíveis, seus parâmetros, respostas e exemplos de uso.

## Versão Atual: 1.5.0 (2025-03-12)

## Base URL

- Desenvolvimento: `http://localhost:3001`
- Produção: `https://api.lytspot.com`

## Autenticação

A API utiliza autenticação baseada em token JWT. Para acessar endpoints protegidos, inclua o token no cabeçalho `Authorization` no formato:

```
Authorization: Bearer {seu_token_jwt}
```

Para obter um token, utilize o endpoint de login.

## Endpoints

### Saúde da API

#### GET /api/health

Verifica o status da API e a configuração CORS.

**Resposta de Sucesso:**
```json
{
  "status": "ok",
  "version": "1.5.0",
  "timestamp": "2025-03-12T23:30:45.123Z",
  "cors": {
    "enabled": true,
    "allowedOrigins": ["https://lytspot.com", "http://localhost:4321"]
  }
}
```

### Autenticação

#### POST /api/auth/login

Autentica um usuário e retorna um token JWT.

**Parâmetros:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta de Sucesso:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "role": "admin"
  }
}
```

**Códigos de Erro:**
- `401 Unauthorized`: Credenciais inválidas
- `400 Bad Request`: Parâmetros inválidos

#### POST /api/auth/register

Registra um novo usuário.

**Parâmetros:**
```json
{
  "name": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta de Sucesso:**
```json
{
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": "123",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com"
  }
}
```

**Códigos de Erro:**
- `400 Bad Request`: Parâmetros inválidos ou usuário já existe

#### GET /api/auth/me

Obtém informações do usuário autenticado.

**Cabeçalhos:**
```
Authorization: Bearer {seu_token_jwt}
```

**Resposta de Sucesso:**
```json
{
  "id": "123",
  "name": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "role": "admin"
}
```

**Códigos de Erro:**
- `401 Unauthorized`: Token inválido ou expirado

### Serviços

#### GET /api/pricing

Lista todos os serviços disponíveis.

**Parâmetros de Query (opcionais):**
- `page`: Número da página (padrão: 1)
- `limit`: Número de itens por página (padrão: 10)
- `sort`: Campo para ordenação (padrão: "id")
- `order`: Direção da ordenação ("asc" ou "desc", padrão: "asc")

**Resposta de Sucesso:**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "Ensaio Fotográfico Básico",
      "descricao": "Ensaio fotográfico com duração de 1 hora",
      "preco_base": 300.00,
      "duracao_media_captura": "1 hora",
      "duracao_media_tratamento": "3 dias úteis",
      "entregaveis": "10 fotos em alta resolução",
      "possiveis_adicionais": "Fotos extras, Álbum impresso",
      "valor_deslocamento": "Gratuito até 10 km"
    },
    {
      "id": 2,
      "nome": "Ensaio Fotográfico Premium",
      "descricao": "Ensaio fotográfico com duração de 2 horas",
      "preco_base": 500.00,
      "duracao_media_captura": "2 horas",
      "duracao_media_tratamento": "5 dias úteis",
      "entregaveis": "20 fotos em alta resolução",
      "possiveis_adicionais": "Fotos extras, Álbum impresso, Vídeo curto",
      "valor_deslocamento": "Gratuito até 15 km"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### GET /api/pricing/:id

Obtém detalhes de um serviço específico.

**Parâmetros de URL:**
- `id`: ID do serviço

**Resposta de Sucesso:**
```json
{
  "id": 1,
  "nome": "Ensaio Fotográfico Básico",
  "descricao": "Ensaio fotográfico com duração de 1 hora",
  "preco_base": 300.00,
  "duracao_media_captura": "1 hora",
  "duracao_media_tratamento": "3 dias úteis",
  "entregaveis": "10 fotos em alta resolução",
  "possiveis_adicionais": "Fotos extras, Álbum impresso",
  "valor_deslocamento": "Gratuito até 10 km"
}
```

**Códigos de Erro:**
- `404 Not Found`: Serviço não encontrado

#### POST /api/pricing

Cria um novo serviço (requer autenticação).

**Cabeçalhos:**
```
Authorization: Bearer {seu_token_jwt}
```

**Parâmetros:**
```json
{
  "nome": "Novo Serviço",
  "descricao": "Descrição do novo serviço",
  "preco_base": 400.00,
  "duracao_media_captura": "1.5 horas",
  "duracao_media_tratamento": "4 dias úteis",
  "entregaveis": "15 fotos em alta resolução",
  "possiveis_adicionais": "Fotos extras, Álbum impresso",
  "valor_deslocamento": "Gratuito até 12 km"
}
```

**Resposta de Sucesso:**
```json
{
  "message": "Serviço criado com sucesso",
  "data": {
    "id": 9,
    "nome": "Novo Serviço",
    "descricao": "Descrição do novo serviço",
    "preco_base": 400.00,
    "duracao_media_captura": "1.5 horas",
    "duracao_media_tratamento": "4 dias úteis",
    "entregaveis": "15 fotos em alta resolução",
    "possiveis_adicionais": "Fotos extras, Álbum impresso",
    "valor_deslocamento": "Gratuito até 12 km"
  }
}
```

**Códigos de Erro:**
- `400 Bad Request`: Parâmetros inválidos
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão

#### PUT /api/pricing/:id

Atualiza um serviço existente (requer autenticação).

**Cabeçalhos:**
```
Authorization: Bearer {seu_token_jwt}
```

**Parâmetros de URL:**
- `id`: ID do serviço

**Parâmetros (todos opcionais):**
```json
{
  "nome": "Serviço Atualizado",
  "descricao": "Descrição atualizada",
  "preco_base": 450.00,
  "duracao_media_captura": "2 horas",
  "duracao_media_tratamento": "5 dias úteis",
  "entregaveis": "20 fotos em alta resolução",
  "possiveis_adicionais": "Fotos extras, Álbum impresso, Vídeo curto",
  "valor_deslocamento": "Gratuito até 15 km"
}
```

**Resposta de Sucesso:**
```json
{
  "message": "Serviço atualizado com sucesso",
  "data": {
    "id": 1,
    "nome": "Serviço Atualizado",
    "descricao": "Descrição atualizada",
    "preco_base": 450.00,
    "duracao_media_captura": "2 horas",
    "duracao_media_tratamento": "5 dias úteis",
    "entregaveis": "20 fotos em alta resolução",
    "possiveis_adicionais": "Fotos extras, Álbum impresso, Vídeo curto",
    "valor_deslocamento": "Gratuito até 15 km"
  }
}
```

**Códigos de Erro:**
- `400 Bad Request`: Parâmetros inválidos
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão
- `404 Not Found`: Serviço não encontrado

#### DELETE /api/pricing/:id

Remove um serviço (requer autenticação).

**Cabeçalhos:**
```
Authorization: Bearer {seu_token_jwt}
```

**Parâmetros de URL:**
- `id`: ID do serviço

**Resposta de Sucesso:**
```json
{
  "message": "Serviço 1 excluído com sucesso"
}
```

**Códigos de Erro:**
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão
- `404 Not Found`: Serviço não encontrado

### Simulação de Preços

#### POST /api/pricing/calculate

Calcula o preço de um serviço com base nas opções selecionadas.

**Parâmetros:**
```json
{
  "servico_id": 1,
  "opcoes": {
    "adicional_fotos": true,
    "album_impresso": false,
    "video_curto": false
  },
  "distancia_km": 15
}
```

**Resposta de Sucesso:**
```json
{
  "preco_base": 300.00,
  "adicionais": 150.00,
  "deslocamento": 0.00,
  "preco_total": 450.00,
  "detalhes": {
    "servico": "Ensaio Fotográfico Básico",
    "adicionais_selecionados": ["Fotos extras"],
    "prazo_estimado": "3 dias úteis após a sessão"
  }
}
```

**Códigos de Erro:**
- `400 Bad Request`: Parâmetros inválidos
- `404 Not Found`: Serviço não encontrado

## Tratamento de Erros

Todas as respostas de erro seguem o formato:

```json
{
  "message": "Descrição do erro",
  "error": "Detalhes técnicos do erro (apenas em ambiente de desenvolvimento)"
}
```

## Limites de Taxa

A API implementa limites de taxa para proteger contra abusos:
- 100 requisições por minuto para endpoints públicos
- 300 requisições por minuto para endpoints autenticados

Quando o limite é excedido, a API retorna o código de status `429 Too Many Requests`.

## Versionamento

O versionamento da API é controlado através do cabeçalho `Accept`:

```
Accept: application/json; version=1.5
```

Se não especificado, a versão mais recente será utilizada.

## Suporte

Para suporte ou dúvidas sobre a API, entre em contato através do email api@lytspot.com.

---

Documentação atualizada em: 2025-03-12
