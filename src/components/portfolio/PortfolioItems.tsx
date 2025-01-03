// src/data/portfolioItems.ts

// Define the type for a portfolio item
export type PortfolioItemType = {
  id: string;
  title: string;
  category: 'web' | 'design' | 'marketing' | 'eventos' | 'corporativo' | 'publicidade' | 'ensaios';
  client: string;
  thumbnail: string;
  tags: string[];
};

// Define the array of portfolio items
export const portfolioItemsData: PortfolioItemType[] = [
  {
    id: '1',
    title: 'Projeto 1',
    category: 'web',
    client: 'Cliente 1',
    thumbnail: 'url_da_imagem_1',
    tags: ['React', 'JavaScript'],
  },
  {
    id: '2',
    title: 'Projeto 2',
    category: 'design',
    client: 'Cliente 2',
    thumbnail: 'url_da_imagem_2',
    tags: ['Figma', 'UI/UX'],
  },
  {
    id: '3',
    title: 'Evento Aéreo',
    category: 'eventos',
    client: 'Cliente 3',
    thumbnail: 'url_da_imagem_3',
    tags: ['Fotografia', 'Drone'],
  },
  {
    id: '4',
    title: 'Lançamento Corporativo',
    category: 'corporativo',
    client: 'Cliente 4',
    thumbnail: 'url_da_imagem_4',
    tags: ['Evento', 'Corporativo'],
  },
  {
    id: '5',
    title: 'Campanha Publicitária',
    category: 'publicidade',
    client: 'Cliente 5',
    thumbnail: 'url_da_imagem_5',
    tags: ['Vídeo', 'Publicidade'],
  },
  {
    id: '6',
    title: 'Ensaio de Moda',
    category: 'ensaios',
    client: 'Cliente 6',
    thumbnail: 'url_da_imagem_6',
    tags: ['Fotografia', 'Moda'],
  },
];
