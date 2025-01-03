export interface PortfolioItem {
    id: string;
    title: string;
    category: 'eventos' | 'corporativo' | 'publicidade' | 'ensaios';
    thumbnail: string;
    url: string;
    type: 'image' | 'video';
    description: string;
    tags: string[];
    client?: string;
    date: string;
  }
  
  export const PortfolioItems: PortfolioItem[] = [
    {
      id: 'placeholder',
      title: 'Placeholder Item',
      category: 'eventos',
      thumbnail: '/images/placeholder.jpg', // Use uma imagem que você sabe que existe
      url: '/images/placeholder.jpg',
      type: 'image',
      description: 'This is a placeholder portfolio item.',
      tags: ['Placeholder'],
      date: '2024-01-01',
    },
  ];
  