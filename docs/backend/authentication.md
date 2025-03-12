# Autenticação e Segurança

**Versão:** 1.0.0 (12/03/2025)

Este documento descreve o sistema de autenticação e segurança implementado no projeto Lytspot, incluindo fluxos de autenticação, configuração de JWT e gerenciamento de usuários.

## Índice

1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Fluxo de Autenticação](#fluxo-de-autenticação)
4. [Configuração JWT](#configuração-jwt)
5. [Endpoints de Autenticação](#endpoints-de-autenticação)
6. [Middleware de Autenticação](#middleware-de-autenticação)
7. [Gerenciamento de Usuários](#gerenciamento-de-usuários)
8. [Scripts de Administração](#scripts-de-administração)
9. [Solução de Problemas](#solução-de-problemas)

## Visão Geral

O sistema de autenticação do Lytspot utiliza JSON Web Tokens (JWT) para autenticar usuários e proteger rotas sensíveis. A autenticação é implementada no backend usando Express.js, Prisma ORM e bcrypt para criptografia de senhas.

## Tecnologias Utilizadas

- **JWT (jsonwebtoken)**: Para geração e verificação de tokens de autenticação
- **bcrypt**: Para hash e verificação segura de senhas
- **Prisma**: ORM para interação com o banco de dados
- **Express.js**: Framework web para implementação de rotas e middleware

## Fluxo de Autenticação

1. **Registro**: Criação de conta de usuário (restrito a uso administrativo)
2. **Login**: Autenticação com email e senha, retornando um token JWT
3. **Autorização**: Uso do token JWT em requisições subsequentes via cabeçalho Authorization
4. **Verificação**: Middleware que valida o token JWT antes de permitir acesso a rotas protegidas

## Configuração JWT

As configurações do JWT são definidas através de variáveis de ambiente:

- **JWT_SECRET**: Chave secreta para assinatura dos tokens
- **JWT_EXPIRES_IN**: Tempo de expiração dos tokens (padrão: "1d")

Essas variáveis são configuradas automaticamente no ambiente de produção através do script `render-setup.js`.

## Endpoints de Autenticação

| Endpoint | Método | Descrição | Parâmetros |
|----------|--------|-----------|------------|
| `/api/auth/register` | POST | Registra um novo usuário (apenas uso administrativo) | `email`, `password`, `nome` |
| `/api/auth/login` | POST | Autentica um usuário e retorna um token JWT | `email`, `password` |
| `/api/auth/verify` | GET | Verifica se o token JWT é válido | Requer token no cabeçalho Authorization |

## Middleware de Autenticação

O middleware `authenticateJWT` é responsável por:

1. Extrair o token JWT do cabeçalho Authorization
2. Verificar a validade do token usando a chave secreta
3. Decodificar as informações do usuário e anexá-las à requisição
4. Permitir ou bloquear o acesso às rotas protegidas

## Gerenciamento de Usuários

Os usuários são armazenados na tabela `User` do banco de dados com os seguintes campos:

- `id`: Identificador único (autoincrement)
- `email`: Email do usuário (único)
- `password`: Senha criptografada com bcrypt
- `nome`: Nome do usuário
- `createdAt`: Data de criação
- `updatedAt`: Data da última atualização

## Scripts de Administração

O projeto inclui scripts para gerenciamento de usuários administradores:

- **create-admin-user.js**: Cria um usuário administrador no sistema
  ```
  node scripts/create-admin-user.js [email] [senha] [nome]
  ```

- **login-admin.js**: Testa o login de um usuário administrador e obtém um token JWT
  ```
  node scripts/login-admin.js [email] [senha]
  ```

## Solução de Problemas

### Erro 401 Unauthorized

Se você estiver recebendo erros 401 (Unauthorized) ao tentar acessar endpoints protegidos:

1. **Verifique se existe um usuário administrador**:
   ```
   node scripts/create-admin-user.js
   ```

2. **Verifique se as variáveis JWT estão configuradas corretamente**:
   - JWT_SECRET deve estar definido no ambiente
   - JWT_EXPIRES_IN deve estar definido (padrão: "1d")

3. **Teste o login manualmente**:
   ```
   node scripts/login-admin.js
   ```

4. **Verifique os logs do servidor** para mensagens de erro relacionadas à autenticação

### Credenciais Padrão

As credenciais padrão para o usuário administrador são:
- **Email**: admin@lytspot.com
- **Senha**: Admin@123456
- **Nome**: Administrador

**Importante**: Por segurança, altere essas credenciais em ambientes de produção.

---

*Última atualização: 12/03/2025 - Documentação inicial do sistema de autenticação*
