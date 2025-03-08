import React, { useState } from 'react';
import PortfolioFilter from '@/components/portfolio/PortfolioFilter';
import PortfolioModal from '@/components/portfolio/PortfolioModal';
import { portfolioItems } from '@/data/portfolioItems';

// Define the PortfolioItem type based on the structure in portfolioItems
interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  media: {
    url: string;
    type: string;
  }[];
  description: string;
  tags: string[];
  date: string;
}

interface PortfolioGridProps {
  initialCategory?: string;
}

export default function PortfolioGrid({ initialCategory = 'todos' }: PortfolioGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  // Filtra os itens do portfolio com base na categoria ativa
  const filteredItems: PortfolioItem[] = portfolioItems.filter((item: any) =>
    activeCategory === 'todos' ? true : item.category === activeCategory
  );

  return (
    <div>
      {/* Filtro para alternar categorias */}
      <PortfolioFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Grid de itens do portfolio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2 bg-gray-800 p-6">
        {filteredItems.map((item: PortfolioItem) => (
          <div
            key={item.id}
            className="cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            {/* Container para a imagem - removida a borda azul */}
            <div className="h-64 w-full overflow-hidden rounded-lg flex justify-center items-center">
              {item.media[0]?.type === 'image' ? (
                <img
                  src={item.media[0]?.url}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <video
                  src={item.media[0]?.url}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                />
              )}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
          </div>
        ))}
      </div>

      {/* Modal com detalhes do item selecionado */}
      {selectedItem && (
        <PortfolioModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
