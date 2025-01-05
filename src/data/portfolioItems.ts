// Define the interface for a portfolio item
export interface PortfolioItem {
  id: string;
  title: string;
  category: 'eventos' | 'empresas' | 'ensaios' | 'imobiliário';
  media: { url: string; type: 'image' | 'video' }[];
  description: string;
  tags: string[];
  client?: string;
  date: string;
}

const realPortfolioItems: PortfolioItem[] = [
  {
    id: 'eventos',
    title: 'Festas',
    category: 'eventos',
    media: [
      { url: '/images/portfolio/festas1.jpg', type: 'image' },
      { url: '/images/portfolio/festas2.jpg', type: 'image' },
    ],
    description: 'Festa de Aniversário em condições ideais.',
    tags: ['infantil', 'festa', 'aniversário'],
    client: 'TBD',
    date: '2024-05-01',
  },
  {
    id: 'empresas',
    title: 'Divulgação empresarial',
    category: 'empresas',
    media: [
      { url: '/images/portfolio/empresas1.jpg', type: 'image' },
      { url: '/videos/portfolio/empresas_promo.mp4', type: 'video' },
    ],
    description: 'Cobertura de uma importante conferência empresarial.',
    tags: ['conferência', 'negócios', 'networking'],
    client: 'ABC Corp',
    date: '2023-04-15',
  },
  {
    id: 'ensaios',
    title: 'Ensaio Artístico',
    category: 'ensaios',
    media: [
      { url: '/images/portfolio/ensaios1.jpg', type: 'image' },
      { url: '/images/portfolio/ensaios2.jpg', type: 'image' },
    ],
    description: 'Ensaio artístico capturando emoções e cores.',
    tags: ['arte', 'fotografia', 'emoção'],
    date: '2023-06-10',
  },
  {
    id: 'imobiliário',
    title: 'Ensaio Imobiliário',
    category: 'imobiliário',
    media: [
      { url: '/images/portfolio/imobiliario1.jpg', type: 'image' },
      { url: '/videos/portfolio/imobiliario_tour.mp4', type: 'video' },
    ],
    description: 'Ensaio para melhor exposição das virtudes do imóvel.',
    tags: ['imóvel', 'fotografia', 'arquitetura'],
    date: '2023-06-10',
  },
];

export const portfolioItems = realPortfolioItems;
