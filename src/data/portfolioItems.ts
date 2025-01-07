// Define a interface para um item do portfólio
export interface PortfolioItem {
  id: string;
  title: string;
  category: 'festas' | 'empresas' | 'imobiliário' | 'projetos';
  media: { url: string; type: 'image' | 'video' }[];
  description: string;
  tags: string[];
  client?: string;
  date: string;
}

// Itens reais do portfólio
const realPortfolioItems: PortfolioItem[] = [
  {
    id: 'festas',
    title: 'Festas',
    category: 'festas',
    media: [
      { url: `/public/images/portfolio/festas/festas1.jpg`, type: 'image' },
      { url: `/public/images/portfolio/festas/festas2.jpg`, type: 'image' },
    ],
    description: 'Festa de Aniversário em condições ideais.',
    tags: ['infantil', 'festa', 'aniversário'],
    date: '2023/2024',
  },
  {
    id: 'empresas',
    title: 'Divulgação empresarial',
    category: 'empresas',
    media: [
      { url: `/public/images/portfolio/empresas/empresas1.jpeg`, type: 'image' },
      { url: `/public/videos/portfolio/empresas/empresas2.mp4`, type: 'video' },
    ],
    description: 'Cobertura de uma importante conferência empresarial.',
    tags: ['conferência', 'negócios', 'networking'],
    date: '2023/2024',
  },
  {
    id: 'imobiliário',
    title: 'Ensaio Imobiliário',
    category: 'imobiliário',
    media: [
      { url: `/public/images/portfolio/imobiliário/imobiliário1.jpg`, type: 'image' },
      { url: `/public/images/portfolio/imobiliário/imobiliário2.jpg`, type: 'image' },
    ],
    description: 'Fotos e vídeos de imóveis à venda, aluguel ou divulgação.',
    tags: ['imóveis', 'profissionalismo', 'imagens'],
    date: '2023/2024',
  },
  {
    id: 'projetos',
    title: 'Projetos Especiais',
    category: 'projetos',
    media: [
      { url: `/public/videos/portfolio/projetos/projetos1.mp4`, type: 'video' },
      { url: `/public/videos/portfolio/projetos/projetos2.mp4`, type: 'video' },
      { url: `/public/videos/portfolio/projetos/projetos3.mp4`, type: 'video' },
      { url: `/public/videos/portfolio/projetos/projetos4.mp4`, type: 'video' },
      { url: `/public/videos/portfolio/projetos/projetos6.mp4`, type: 'video' },
      { url: `/public/videos/portfolio/projetos/projetos5.mp4`, type: 'video' },
    ],
    description: 'Oportunidades únicas, trabalhos únicos e personalizados.',
    tags: ['projetos', 'personalizado', 'oportunidade'],
    date: '2023/2024',
  },
];

// Exporta os itens do portfólio
export const portfolioItems = realPortfolioItems;
