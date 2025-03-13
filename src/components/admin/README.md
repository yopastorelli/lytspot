# Componentes de Administração

Este diretório contém os componentes utilizados no painel administrativo do Lytspot.

## Componentes

### ServicoForm

**Versão:** 1.6.0 (2025-03-13)

Componente de formulário para adicionar e editar serviços fotográficos.

#### Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `servico` | `Object` | Não | Objeto contendo os dados do serviço a ser editado. Se não fornecido, o formulário será inicializado para criação de um novo serviço. |
| `onSave` | `Function` | Sim | Função de callback chamada quando o formulário é enviado com sucesso. Recebe os dados do formulário como parâmetro. |
| `onCancel` | `Function` | Sim | Função de callback chamada quando o usuário cancela a edição. |
| `loading` | `Boolean` | Não | Indica se uma operação de salvamento está em andamento. |

#### Formato de Dados

O componente suporta dois formatos de dados para o objeto `servico`:

1. **Formato do Banco de Dados:**
```javascript
{
  id: 1,
  nome: "Ensaio Fotográfico",
  descricao: "Descrição do serviço",
  preco_base: 300.00,
  duracao_media_captura: "1 hora",
  duracao_media_tratamento: "3 dias úteis",
  entregaveis: "10 fotos em alta resolução",
  possiveis_adicionais: "Fotos extras, Álbum impresso",
  valor_deslocamento: "Gratuito até 10 km"
}
```

2. **Formato do Simulador (com objeto detalhes):**
```javascript
{
  id: 1,
  nome: "Ensaio Fotográfico",
  descricao: "Descrição do serviço",
  preco_base: 300.00,
  duracao_media: 3,
  detalhes: {
    captura: "1 hora",
    tratamento: "3 dias úteis",
    entregaveis: "10 fotos em alta resolução",
    adicionais: "Fotos extras, Álbum impresso",
    deslocamento: "Gratuito até 10 km"
  }
}
```

O componente detecta automaticamente o formato e normaliza os dados para o formato esperado pelo backend.

#### Validação

O componente implementa validação robusta para os seguintes campos obrigatórios:
- `nome` (mínimo 3 caracteres)
- `descricao` (mínimo 10 caracteres)
- `preco_base` (número positivo)
- `duracao_media_captura`
- `duracao_media_tratamento`
- `entregaveis`

A validação inclui:
- Verificação de campos vazios
- Validação de comprimento mínimo para campos de texto
- Conversão e validação de valores numéricos
- Feedback visual imediato para o usuário
- Mensagens de erro específicas para cada tipo de validação

#### Exemplo de Uso

```jsx
import React, { useState } from 'react';
import ServicoForm from './ServicoForm';

const ServicoEditor = () => {
  const [loading, setLoading] = useState(false);
  const [servico, setServico] = useState(null);

  const handleSave = async (dadosServico) => {
    setLoading(true);
    try {
      // Lógica para salvar o serviço
      const response = await api.saveServico(dadosServico);
      console.log('Serviço salvo:', response);
      // Outras ações após salvar
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Lógica para cancelar a edição
    console.log('Edição cancelada');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editor de Serviço</h1>
      <ServicoForm 
        servico={servico}
        onSave={handleSave}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
};

export default ServicoEditor;
```

#### Notas de Implementação

1. **Formato de Dados:** O componente converte automaticamente entre os formatos do simulador e do banco de dados.
2. **Validação:** Implementa validação rigorosa de campos obrigatórios e formatos específicos.
3. **Sanitização de Dados:** Realiza limpeza e formatação de dados antes do envio para o backend:
   - Remove espaços em branco extras com `trim()`
   - Converte valores numéricos corretamente
   - Garante que todos os campos obrigatórios estejam presentes e válidos
4. **Feedback Visual:** Fornece feedback visual imediato para campos com erro e durante o carregamento.
5. **Acessibilidade:** Implementa atributos ARIA para melhorar a acessibilidade.
6. **Prevenção de Erros:** Impede o envio do formulário se houver campos inválidos.

#### Histórico de Alterações

- **1.6.0 (2025-03-13):** Implementada validação mais rigorosa e sanitização de dados para resolver erros 400 e 500 na API
- **1.5.0 (2025-03-12):** Melhorada a validação e formatação de dados para compatibilidade com o backend
- **1.4.0 (2025-03-10):** Corrigido problema de formato de dados para edição
- **1.3.0 (2025-03-05):** Implementada validação de campos obrigatórios
- **1.2.0 (2025-03-01):** Adicionado suporte para diferentes formatos de dados
- **1.1.0 (2025-02-25):** Melhorada a interface do usuário e feedback visual
- **1.0.0 (2025-02-20):** Versão inicial
