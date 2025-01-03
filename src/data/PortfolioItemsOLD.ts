// Define the interface for a portfolio item
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
  
  // Define actual portfolio items
  const actualPortfolioItems: PortfolioItem[] = [
    {
      id: 'casamento-praia',
      title: 'Casamento na Praia',
      category: 'eventos',
      thumbnail: '/images/portfolio/casamento-thumb.jpg',
      url: '/images/portfolio/casamento.jpg',
      type: 'image',
      description:
        'Cobertura completa de um lindo casamento à beira-mar, com imagens aéreas e terrestres.',
      tags: ['Casamento', 'Drone', 'Praia'],
      client: 'João e Maria',
      date: '2024-02-15',
    },
    {
      id: 'lancamento-empreendimento',
      title: 'Lançamento Residencial',
      category: 'publicidade',
      thumbnail: '/images/portfolio/imovel-thumb.jpg',
      url: '/videos/imovel.mp4',
      type: 'video',
      description:
        'Produção audiovisual para lançamento de empreendimento imobiliário de alto padrão.',
      tags: ['Imobiliário', 'Drone', 'Vídeo'],
      client: 'Construtora XYZ',
      date: '2024-01-20',
    },
    {
      id: 'evento-corporativo',
      title: 'Convenção Anual',
      category: 'corporativo',
      thumbnail: '/images/portfolio/corporate-thumb.jpg',
      url: '/images/portfolio/corporate.jpg',
      type: 'image',
      description:
        'Cobertura fotográfica de evento corporativo para multinacional.',
      tags: ['Corporativo', 'Fotografia', 'Evento'],
      client: 'Empresa ABC',
      date: '2024-03-01',
    },
    {
      id: 'ensaio-moda',
      title: 'Ensaio Coleção Verão',
      category: 'ensaios',
      thumbnail: '/images/portfolio/moda-thumb.jpg',
      url: '/images/portfolio/moda.jpg',
      type: 'image',
      description: 'Ensaio fotográfico para coleção de moda verão 2024.',
      tags: ['Moda', 'Fotografia', 'Verão'],
      client: 'Marca Fashion',
      date: '2024-02-28',
    },
  ];
  
  // Define placeholder portfolio items
  const placeholderPortfolioItems: PortfolioItem[] = [
    {
      id: 'placeholder-1',
      title: 'Placeholder Item',
      category: 'eventos',
      thumbnail: '/images/placeholder.jpg',
      url: '/images/placeholder.jpg',
      type: 'image',
      description: 'This is a placeholder item.',
      tags: ['Placeholder'],
      date: '2024-01-01',
    },
  ];
  
  // Function to get portfolio items dynamically
  export async function getPortfolioItems(): Promise<PortfolioItem[]> {
    try {
      // If actual items are available, return them
      if (actualPortfolioItems.length > 0) {
        return actualPortfolioItems;
      }
      throw new Error('No actual portfolio items available.');
    } catch (error) {
      console.warn('Error loading portfolio items. Using placeholder items as fallback:', error);
      return placeholderPortfolioItems;
    }
  }
  
  // Export the portfolio items for static usage
  export const PortfolioItems: PortfolioItem[] =
    actualPortfolioItems.length > 0 ? actualPortfolioItems : placeholderPortfolioItems;
  