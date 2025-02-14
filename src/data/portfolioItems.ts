// Define a interface para os itens do portfolio
export interface PortfolioItem {
  id: string;
  title: string;
  category: 'aventuras' | 'festasepalco' | 'empresas' | 'arquitetura' | 'palco' | 'projetos';
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
    id: '1',
    title: 'aventuras',
    category: 'aventuras',
    media: [
      { url: getAssetUrl('images/portimages/aventuras/aventuras1.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/aventuras/aventuras2.jpeg'), type: 'image' },
    ],
    description: 'aventuras e viagens incríveis capturadas em fotos e vídeos.',
    tags: ['viagem', 'aventuras', 'familia', 'amigos'],
    date: '2025',
  },
  {
    id: '2',
    title: 'Arquitetura',
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
    id: '3',
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
    id: '4',
    title: 'Festas e Palco',
    category: 'festasepalco',
    media: [
      { url: getAssetUrl('images/portimages/festas/festas1.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/festas/festas2.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/festas/festas3.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/festas/festas4.jpeg'), type: 'image' },
      { url: getAssetUrl('images/portimages/palco/palco1.jpeg'), type: 'image' },
    ],
    description: 'Festa de Aniversário em condições ideais.',
    tags: ['infantil', 'festa', 'aniversário', 'palco', 'shows', 'festivais', 'apresentações'],
    date: '2023/2024',
  },
  {
    id: '5',
    title: 'Projetos Especiais',
    category: 'projetos',
    media: [
      { url: getAssetUrl('images/portimages/projetos/projetos1.jpeg'), type: 'image' },
      { url: getAssetUrl('videos/portvideos/projetos/projetos2.mp4'), type: 'video' },
      { url: getAssetUrl('images/portimages/projetos/projetos3.jpeg'), type: 'image' },
      { url: getAssetUrl('videos/portvideos/projetos/projetos4.mp4'), type: 'video' },
      { url: getAssetUrl('images/portimages/projetos/projetos5.jpeg'), type: 'image' },
      { url: getAssetUrl('videos/portvideos/projetos/projetos6.mp4'), type: 'video' },
      { url: getAssetUrl('images/portimages/projetos/projetos7.jpeg'), type: 'image' },
      { url: getAssetUrl('videos/portvideos/projetos/projetos8.mp4'), type: 'video' },
      { url: getAssetUrl('images/portimages/projetos/projetos9.jpeg'), type: 'image' },
      { url: getAssetUrl('videos/portvideos/projetos/projetos10.mp4'), type: 'video' },
    ],
    description: 'Oportunidades únicas, trabalhos únicos e personalizados.',
    tags: ['projetos', 'personalizado', 'oportunidade'],
    date: '2023/2024',
  },
];
