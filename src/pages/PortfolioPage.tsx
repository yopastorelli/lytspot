import React, { useState } from 'react';
import PortfolioFilter from '../components/portfolio/PortfolioFilter';
import { portfolioItems } from '../data/portfolioItems';
// Certifique-se de que o caminho do módulo esteja correto
import Container from '../components/common/Container';

const allPhotos: { [key: string]: string[] } = {
  aventuras: ['aventura1.jpg', 'aventura2.jpg'],
  arquitetura: ['arquitetura1.jpg'],
  empresas: ['empresa1.jpg'],
  festasepalco: ['festa1.jpg'],
  projetos: ['projeto1.jpg'],
};

const categories = [
  { id: 'todos', label: 'Todos' },
  { id: 'aventuras', label: 'Aventuras' },
  { id: 'arquitetura', label: 'Arquitetura' },
  { id: 'festasepalco', label: 'Festas e Palco' },
  { id: 'empresas', label: 'Empresas' },
  { id: 'projetos', label: 'Projetos' }
];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleShowAllPhotos = (category: string) => {
    if (category === 'todos') {
      const all = Object.values(allPhotos).flat();
      setPhotos(all);
    } else {
      setPhotos(allPhotos[category] || []);
    }
  };

  const filteredItems = activeCategory === 'todos'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeCategory);

  return (
    <div>
      <PortfolioFilter
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onShowAllPhotos={handleShowAllPhotos}
      />
      <div className="bg-gray py-8">
        <Container>
          <div className="flex gap-4 justify-center flex-wrap">
            {categories.map(category => (
              <button
                className="px-6 py-2 rounded-full bg-white text-black hover:bg-gray-200"
                onClick={() => handleShowAllPhotos(category.id)}
                key={category.id}
              >
                {category.label}
              </button>
            ))}
          </div>
        </Container>
      </div>
      <div className="photo-gallery">
        {photos.map((photo, index) => (
          <img key={index} src={photo} alt={photo} className="portfolio-imagem" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="portfolio-item">
            {item.media.map((media, index) => (
              <div key={index} className="media-item">
                {media.type === 'image' ? (
                  <img src={media.url} alt={item.title} className="w-full h-auto" />
                ) : (
                  <video src={media.url} controls className="w-full h-auto" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}