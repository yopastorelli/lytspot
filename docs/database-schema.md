# Esquema de Banco de Dados

Este documento descreve o esquema de banco de dados utilizado no projeto Lytspot, incluindo tabelas, relacionamentos, índices e considerações de performance.

## Visão Geral

O Lytspot utiliza MongoDB como banco de dados principal, aproveitando sua flexibilidade para armazenar dados de diferentes estruturas. O esquema é projetado para suportar as principais funcionalidades da aplicação, incluindo gerenciamento de usuários, serviços, contatos e agendamentos.

## Coleções

### Users

Armazena informações sobre os usuários do sistema, incluindo administradores e clientes.

```javascript
{
  _id: ObjectId,
  email: String,          // Email do usuário (único)
  nome: String,           // Nome completo do usuário
  role: String,           // Papel do usuário: "admin" ou "client"
  telefone: String,       // Telefone de contato (opcional)
  firebaseUid: String,    // UID do usuário no Firebase Auth
  createdAt: Date,        // Data de criação
  updatedAt: Date,        // Data da última atualização
  lastLogin: Date,        // Data do último login
  status: String,         // Status: "active", "inactive", "suspended"
  preferences: {          // Preferências do usuário
    notifications: Boolean,
    language: String,
    theme: String
  }
}
```

**Índices**:
- `email`: Único, para garantir que não haja duplicação de emails
- `firebaseUid`: Único, para associação com o Firebase Auth
- `role`: Para consultas filtradas por papel

### Services

Armazena os serviços oferecidos pela Lytspot, incluindo detalhes de preços e características.

```javascript
{
  _id: ObjectId,
  nome: String,                    // Nome do serviço
  descricao: String,               // Descrição detalhada
  preco_base: Number,              // Preço base em reais
  duracao_media_captura: String,   // Tempo médio de captura
  duracao_media_tratamento: String, // Tempo médio de tratamento
  entregaveis: String,             // Descrição dos entregáveis
  possiveis_adicionais: String,    // Descrição de adicionais disponíveis
  valor_deslocamento: String,      // Valor do deslocamento por km
  categoria: String,               // Categoria do serviço
  imagem: String,                  // URL da imagem representativa
  destaque: Boolean,               // Se o serviço deve ser destacado
  ordem: Number,                   // Ordem de exibição
  adicionais: [{                   // Lista de serviços adicionais
    nome: String,
    descricao: String,
    preco: Number
  }],
  createdAt: Date,                 // Data de criação
  updatedAt: Date,                 // Data da última atualização
  status: String                   // Status: "active", "inactive"
}
```

**Índices**:
- `categoria`: Para filtrar serviços por categoria
- `destaque`: Para consultar serviços em destaque
- `status`: Para filtrar por status
- `ordem`: Para ordenação na exibição

### Contacts

Armazena mensagens de contato enviadas através do formulário de contato do site.

```javascript
{
  _id: ObjectId,
  nome: String,           // Nome da pessoa que entrou em contato
  email: String,          // Email de contato
  telefone: String,       // Telefone de contato
  mensagem: String,       // Conteúdo da mensagem
  assunto: String,        // Assunto da mensagem (opcional)
  origem: String,         // Origem do contato: "site", "indicacao", etc.
  status: String,         // Status: "new", "read", "replied", "archived"
  tags: [String],         // Tags para categorização
  createdAt: Date,        // Data de criação
  updatedAt: Date,        // Data da última atualização
  respondidoPor: ObjectId // Referência ao usuário que respondeu (opcional)
}
```

**Índices**:
- `email`: Para buscar contatos do mesmo email
- `status`: Para filtrar por status
- `createdAt`: Para ordenação cronológica
- `tags`: Para filtrar por categorias

### Bookings

Armazena agendamentos de serviços feitos pelos clientes.

```javascript
{
  _id: ObjectId,
  cliente: {                 // Informações do cliente
    nome: String,
    email: String,
    telefone: String,
    userId: ObjectId         // Referência ao usuário (opcional)
  },
  servico: {                 // Informações do serviço
    id: ObjectId,            // Referência ao serviço
    nome: String,
    preco_base: Number
  },
  adicionais: [{             // Serviços adicionais selecionados
    id: String,
    nome: String,
    preco: Number
  }],
  data: Date,                // Data agendada para o serviço
  horario: String,           // Horário agendado
  local: {                   // Local do serviço
    endereco: String,
    cidade: String,
    estado: String,
    cep: String,
    complemento: String,
    distancia: Number        // Distância em km para cálculo de deslocamento
  },
  valor_total: Number,       // Valor total calculado
  observacoes: String,       // Observações adicionais
  status: String,            // Status: "pending", "confirmed", "completed", "cancelled"
  pagamento: {               // Informações de pagamento
    status: String,          // Status: "pending", "paid", "refunded"
    metodo: String,          // Método: "credit_card", "bank_transfer", "cash"
    comprovante: String      // URL do comprovante (opcional)
  },
  createdAt: Date,           // Data de criação
  updatedAt: Date            // Data da última atualização
}
```

**Índices**:
- `"cliente.email"`: Para buscar agendamentos do mesmo cliente
- `"servico.id"`: Para buscar agendamentos de um serviço específico
- `data`: Para buscar agendamentos por data
- `status`: Para filtrar por status
- `"pagamento.status"`: Para filtrar por status de pagamento

### Portfolio

Armazena itens do portfólio para exibição no site.

```javascript
{
  _id: ObjectId,
  titulo: String,          // Título do item
  descricao: String,       // Descrição detalhada
  categoria: String,       // Categoria: "drone", "fotografia", "video"
  cliente: String,         // Nome do cliente (opcional)
  data: Date,              // Data de realização
  imagens: [{              // Lista de imagens
    url: String,
    legenda: String,
    destaque: Boolean      // Se é a imagem principal
  }],
  video: {                 // Informações de vídeo (opcional)
    url: String,
    plataforma: String,    // "youtube", "vimeo", etc.
    id: String             // ID do vídeo na plataforma
  },
  tags: [String],          // Tags para categorização
  destaque: Boolean,       // Se o item deve ser destacado
  ordem: Number,           // Ordem de exibição
  createdAt: Date,         // Data de criação
  updatedAt: Date,         // Data da última atualização
  status: String           // Status: "draft", "published", "archived"
}
```

**Índices**:
- `categoria`: Para filtrar por categoria
- `tags`: Para filtrar por tags
- `destaque`: Para consultar itens em destaque
- `status`: Para filtrar por status
- `ordem`: Para ordenação na exibição

### Settings

Armazena configurações gerais do sistema.

```javascript
{
  _id: ObjectId,
  key: String,             // Chave da configuração
  value: Mixed,            // Valor da configuração (pode ser qualquer tipo)
  description: String,     // Descrição da configuração
  group: String,           // Grupo da configuração
  updatedAt: Date,         // Data da última atualização
  updatedBy: ObjectId      // Usuário que atualizou
}
```

**Índices**:
- `key`: Único, para acesso rápido à configuração
- `group`: Para agrupar configurações relacionadas

## Relacionamentos

O MongoDB é um banco de dados NoSQL, portanto os relacionamentos são gerenciados de forma diferente dos bancos relacionais. No Lytspot, utilizamos duas abordagens:

### Referências

Utilizamos referências (ObjectId) para relacionamentos onde a consistência é crítica e os dados relacionados são acessados separadamente:

- `Bookings.cliente.userId` → `Users._id`
- `Bookings.servico.id` → `Services._id`
- `Contacts.respondidoPor` → `Users._id`

### Incorporação (Embedding)

Utilizamos incorporação para dados que são sempre acessados juntos e têm uma relação de propriedade clara:

- `Services.adicionais` - Lista de serviços adicionais incorporada diretamente
- `Bookings.cliente` - Informações do cliente incorporadas para acesso rápido
- `Portfolio.imagens` - Lista de imagens incorporada diretamente

## Validação de Esquema

Embora o MongoDB seja schemaless por natureza, utilizamos validação de esquema para garantir a integridade dos dados:

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "nome", "role", "firebaseUid"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        role: {
          enum: ["admin", "client"]
        },
        // Outras propriedades...
      }
    }
  }
});
```

## Considerações de Performance

### Indexação

Além dos índices mencionados para cada coleção, consideramos:

- Índices compostos para consultas frequentes que filtram por múltiplos campos
- Índices de texto para busca textual em descrições e conteúdo
- TTL (Time-To-Live) índices para dados temporários

### Paginação

Para coleções que podem crescer significativamente, implementamos paginação:

```javascript
// Exemplo de paginação no backend
const getServices = async (page = 1, limit = 10, filters = {}) => {
  const skip = (page - 1) * limit;
  
  const query = { status: "active" };
  if (filters.categoria) query.categoria = filters.categoria;
  if (filters.destaque) query.destaque = filters.destaque === "true";
  
  const services = await db.collection("services")
    .find(query)
    .sort({ ordem: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();
    
  const total = await db.collection("services").countDocuments(query);
  
  return {
    services,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};
```

### Agregações

Utilizamos o framework de agregação do MongoDB para consultas complexas:

```javascript
// Exemplo de agregação para estatísticas de agendamentos
const getBookingStats = async (startDate, endDate) => {
  return await db.collection("bookings").aggregate([
    {
      $match: {
        data: { $gte: startDate, $lte: endDate },
        status: { $in: ["confirmed", "completed"] }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: "$data" },
          year: { $year: "$data" },
          serviceId: "$servico.id"
        },
        count: { $sum: 1 },
        revenue: { $sum: "$valor_total" }
      }
    },
    {
      $lookup: {
        from: "services",
        localField: "_id.serviceId",
        foreignField: "_id",
        as: "service_details"
      }
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1
      }
    }
  ]).toArray();
};
```

## Backup e Recuperação

### Estratégia de Backup

- Backups diários completos
- Backups incrementais a cada 6 horas
- Retenção de backups por 30 dias

### Procedimento de Backup

```bash
# Backup completo
mongodump --uri="mongodb://username:password@host:port/lytspot" --out=/backups/$(date +%Y-%m-%d)

# Backup de uma coleção específica
mongodump --uri="mongodb://username:password@host:port/lytspot" --collection=services --out=/backups/services-$(date +%Y-%m-%d)
```

### Procedimento de Restauração

```bash
# Restauração completa
mongorestore --uri="mongodb://username:password@host:port/lytspot" --dir=/backups/2025-03-12

# Restauração de uma coleção específica
mongorestore --uri="mongodb://username:password@host:port/lytspot" --collection=services --dir=/backups/services-2025-03-12/lytspot
```

## Migração de Dados

Para alterações no esquema ou migração de dados, utilizamos scripts de migração:

```javascript
// Exemplo de script de migração
const migrateServices = async () => {
  const db = await connectToDatabase();
  
  // Adicionar novo campo a todos os documentos
  await db.collection("services").updateMany(
    {},
    { $set: { categoria: "outros" } }
  );
  
  // Migrar dados específicos
  await db.collection("services").updateMany(
    { nome: { $regex: /drone/i } },
    { $set: { categoria: "drone" } }
  );
  
  console.log("Migração concluída com sucesso");
};

migrateServices().catch(console.error);
```

## Segurança

### Controle de Acesso

Utilizamos o controle de acesso baseado em papéis (RBAC) do MongoDB:

```javascript
// Criação de usuários com permissões específicas
db.createUser({
  user: "api_user",
  pwd: "senha_segura",
  roles: [
    { role: "readWrite", db: "lytspot" }
  ]
});

db.createUser({
  user: "admin_user",
  pwd: "senha_admin_segura",
  roles: [
    { role: "dbAdmin", db: "lytspot" },
    { role: "readWrite", db: "lytspot" }
  ]
});

db.createUser({
  user: "backup_user",
  pwd: "senha_backup_segura",
  roles: [
    { role: "backup", db: "admin" },
    { role: "read", db: "lytspot" }
  ]
});
```

### Criptografia

- Dados em trânsito: Conexões TLS/SSL
- Dados em repouso: Criptografia de disco
- Campos sensíveis: Criptografia a nível de campo para dados como informações de pagamento

## Monitoramento

### Métricas Monitoradas

- Tempo de resposta de consultas
- Utilização de memória e CPU
- Tamanho das coleções
- Número de conexões
- Operações de leitura/escrita por segundo

### Ferramentas

- MongoDB Atlas Monitoring
- Prometheus para coleta de métricas
- Grafana para visualização

## Evolução do Esquema

O esquema do banco de dados evoluirá conforme as necessidades do projeto. Todas as alterações devem seguir este processo:

1. Documentar a alteração proposta
2. Criar script de migração
3. Testar em ambiente de desenvolvimento
4. Aplicar em ambiente de homologação
5. Validar a alteração
6. Aplicar em produção
7. Atualizar esta documentação

## Versão

Versão atual: 1.0.0 (Março/2025)
