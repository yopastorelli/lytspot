# Atualização da Estrutura de Serviços

## Resumo das Alterações

Para resolver o problema de discrepância na estrutura de dados entre o backend e o frontend do simulador de preços, foram realizadas as seguintes alterações:

1. **Adição do campo `detalhes` ao modelo `Servico`**:
   - Alterado o schema do Prisma para incluir um campo `detalhes` do tipo `String` para armazenar uma estrutura JSON
   - Aplicada migração do banco de dados para adicionar a coluna

2. **Atualização dos serviços existentes**:
   - Criado script para adicionar a estrutura aninhada `detalhes` a todos os serviços existentes
   - Garantido backup automático do banco de dados antes de qualquer alteração

3. **Atualização do transformador de serviços**:
   - Modificado `serviceTransformer.js` para lidar corretamente com o campo `detalhes` como uma string JSON
   - Implementada lógica para manter compatibilidade com os campos diretos existentes

4. **Atualização da função de sanitização de dados**:
   - Modificada a função `sanitizeServiceData` em `popularServicos.js` para garantir a criação da estrutura aninhada `detalhes`

## Como Funciona

Agora, quando um serviço é carregado do banco de dados:

1. O campo `detalhes` é armazenado como uma string JSON contendo:
   ```json
   {
     "captura": "1 a 2 horas",
     "tratamento": "7 dias úteis",
     "entregaveis": "20 fotos editadas em alta resolução",
     "adicionais": "Edição Mediana, Edição Avançada",
     "deslocamento": "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)"
   }
   ```

2. O `serviceTransformer` converte essa string JSON em um objeto JavaScript antes de enviar para o frontend, garantindo que a estrutura aninhada esteja disponível:
   ```javascript
   servico.detalhes.captura
   servico.detalhes.tratamento
   ```

3. Os campos diretos originais (`duracao_media_captura`, `duracao_media_tratamento`, etc.) são mantidos para compatibilidade com código legado.

## Ambiente Render

Esta solução foi projetada para funcionar corretamente no ambiente Render, onde:

1. O banco de dados SQLite é usado com a limitação de não suportar o tipo `Json` nativo
2. A detecção automática do ambiente Render é feita através das variáveis `RENDER_SERVICE_ID` e `RENDER_INSTANCE_ID`
3. Os backups são armazenados em diretórios apropriados para cada ambiente

## Próximos Passos

1. **Monitorar o funcionamento**: Verificar se o simulador de preços está exibindo corretamente os dados de tempo estimado de captura e tratamento
2. **Remover código legado**: Após confirmar que tudo está funcionando corretamente, considerar a remoção dos campos diretos redundantes
3. **Documentar a estrutura**: Atualizar a documentação da API para refletir a nova estrutura de dados

## Versão

- **Data**: 2025-03-14
- **Versão**: 1.0.0
