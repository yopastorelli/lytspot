// Define a interface para os itens do portfolio
export interface PortfolioItem {
  id: string;
  title: string;
  category: 'festas' | 'empresas' | 'arquitetura' | 'palco' | 'projetos';
  media: { url: string; type: 'image' | 'video' }[];
  description: string;
  tags: string[];
  client?: string;
  date: string;
}

// Função utilitária para gerar URLs com base no ambiente
function getAssetUrl(path: string): string {
  // Retorna a URL correta sem 'public/'
  const baseUrl = import.meta.env?.BASE_URL || '/';
  return `${baseUrl}${path}`;
}

// Itens reais do portfolio
export const portfolioItems: PortfolioItem[] = [
  {
    id: 'festas',
    title: 'Festas e comemorações',
    category: 'festas',
    media: [
      { url: getAssetUrl('images/portimages/festas/festas1.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/festas/festas2.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/festas/festas3.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/festas/festas4.jpeg'), type: 'image' },
    ],
    description: 'Festa de Aniversário em condições ideais.',
    tags: ['infantil', 'festa', 'aniversário'],
    date: '2023/2024',
  },
  {
    id: 'empresas',
    title: 'Imagens empresariais',
    category: 'empresas',
    media: [
      { url: getAssetUrl('images/portimages/empresas/empresas1.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/empresas/empresas2.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/empresas/empresas3.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/empresas/empresas4.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/empresas/empresas5.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/empresas/empresas6.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/empresas/empresas7.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/empresas/empresas8.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/empresas/empresas9.jpeg'), type: 'image' },
    ],
    description: 'Cobertura de uma importante conferência empresarial.',
    tags: ['conferência', 'negócios', 'networking'],
    date: '2023/2024',
  },
  {
    id: 'arquitetura',
    title: 'Registros Arquiteturas',
    category: 'arquitetura',
    media: [
      { url: getAssetUrl('images/portimages/arquitetura/arquitetura1.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/arquitetura/arquitetura2.jpeg'), type: 'image' },
    ],
    description: 'Fotos e vídeos de imóveis à venda, aluguel ou divulgação.',
    tags: ['imóveis', 'profissionalismo', 'imagens'],
    date: '2023/2024',
  },
  {
    id: 'palco',
    title: 'Palco e Festivais',
    category: 'arquitetura',
    media: [
      { url: getAssetUrl('images/portimages/arquitetura/palco1.jpeg'), type: 'image' },
    ],
    description: 'Shows, festivais e apresentações de todo tipo',
    tags: ['shows', 'festivais', 'apresentações'],
    date: '2023/2024',
  },
  {
    id: 'projetos',
    title: 'Projetos Especiais',
    category: 'projetos',
    media: [
      { url: getAssetUrl('videos/portvideos/projetos/projetos1.mp4'), type: 'video' },
      { url: getAssetUrl('videos/portvideos/projetos/projetos2.mp4'), type: 'video' },
      { url: getAssetUrl('videos/portvideos/projetos/projetos3.mp4'), type: 'video' },
      { url: getAssetUrl('videos/portvideos/projetos/projetos4.mp4'), type: 'video' },
      { url: getAssetUrl('videos/portvideos/projetos/projetos6.mp4'), type: 'video' },
      { url: getAssetUrl('videos/portvideos/projetos/projetos5.mp4'), type: 'video' },
    ],
    description: 'Oportunidades únicas, trabalhos únicos e personalizados.',
    tags: ['projetos', 'personalizado', 'oportunidade'],
    date: '2023/2024',
  },
];
