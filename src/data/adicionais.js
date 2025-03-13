/**
 * Definição dos adicionais disponíveis para os serviços
 * @version 1.0.0 - 2025-03-12
 */

export const adicionais = [
  {
    id: 1,
    nome: 'Edição Mediana (Fotos)',
    descricao: 'Retoques moderados, ajustes de cor e contraste para um resultado natural.',
    valor_base: 50.00,
    observacao: 'Valor pode variar dependendo do volume de imagens',
    categoria: 'foto'
  },
  {
    id: 2,
    nome: 'Edição Avançada (Fotos)',
    descricao: 'Tratamento completo com retoques minuciosos, remoção de imperfeições e finalização profissional.',
    valor_base: 100.00,
    observacao: 'Valor pode variar dependendo do volume de imagens',
    categoria: 'foto'
  },
  {
    id: 3,
    nome: 'Edição Mediana (Vídeo)',
    descricao: 'Montagem e cortes básicos, correção de cor e inserção de trilha simples para um vídeo coeso.',
    valor_base: 150.00,
    observacao: 'Valor pode variar dependendo da duração do vídeo',
    categoria: 'video'
  },
  {
    id: 4,
    nome: 'Edição Avançada (Vídeo)',
    descricao: 'Pós-produção completa com efeitos, legendas, trilha sonora, correções minuciosas e finalização profissional.',
    valor_base: 250.00,
    observacao: 'Valor pode variar dependendo da duração e complexidade',
    categoria: 'video'
  },
  {
    id: 5,
    nome: 'Pacote Completo (Captura + Edição Avançada)',
    descricao: 'Combinação do serviço de captura + edição avançada a preço promocional, com desconto em relação à soma dos valores individuais.',
    valor_base: null,
    observacao: 'Valor varia conforme o serviço escolhido (fotografia ou vídeo)',
    categoria: 'combo'
  },
  {
    id: 6,
    nome: 'Horas Extras de Cobertura',
    descricao: 'Caso seja necessário estender a duração de captura além do previsto no pacote básico.',
    valor_base: 100.00,
    observacao: 'Valor por hora adicional, pode variar dependendo do tipo de serviço',
    categoria: 'tempo'
  },
  {
    id: 7,
    nome: 'Fotos Extras',
    descricao: 'Para quem deseja mais fotos editadas além do número padrão incluso no pacote.',
    valor_base: 10.00,
    observacao: 'Valor por foto adicional',
    categoria: 'foto'
  },
  {
    id: 8,
    nome: 'Entrega Expressa',
    descricao: 'Reduz o prazo de entrega pela metade (sujeito à disponibilidade de agenda).',
    valor_base: 150.00,
    observacao: 'Sujeito à disponibilidade',
    categoria: 'tempo'
  },
  {
    id: 9,
    nome: 'Álbum Impresso ou Fotolivro',
    descricao: 'Criação de um álbum físico de alta qualidade, com diagramação personalizada.',
    valor_base: 200.00,
    observacao: 'Valor varia de acordo com o tamanho e número de páginas',
    categoria: 'produto'
  },
  {
    id: 10,
    nome: 'Deslocamento Adicional',
    descricao: 'Para locais fora do raio de 20 km do centro de Curitiba.',
    valor_base: 1.20,
    observacao: 'Valor por km adicional (inclui quilometragem extra; pedágios e outras despesas não incluídos)',
    categoria: 'deslocamento'
  }
];

/**
 * Retorna os adicionais filtrados por categoria
 * @param {string} categoria - Categoria dos adicionais (foto, video, combo, tempo, produto, deslocamento)
 * @returns {Array} Lista de adicionais filtrados
 */
export function getAdicionaisPorCategoria(categoria) {
  if (!categoria) return adicionais;
  return adicionais.filter(adicional => adicional.categoria === categoria);
}

/**
 * Retorna um adicional pelo ID
 * @param {number} id - ID do adicional
 * @returns {Object|null} Adicional encontrado ou null
 */
export function getAdicionalPorId(id) {
  return adicionais.find(adicional => adicional.id === id) || null;
}

export default adicionais;
