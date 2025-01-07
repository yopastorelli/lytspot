import React, { useState } from 'react';
import PortfolioFilter from '@/components/portfolio/PortfolioFilter';
import PortfolioModal from '@/components/portfolio/PortfolioModal';
import type { PortfolioItem } from '@/data/portfolioItems';
import { portfolioItems } from '@/data/portfolioItems';

interface PortfolioGridProps {
  initialCategory?: string;
}

export default function PortfolioGrid({ initialCategory = 'todos' }: PortfolioGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  // Filtra os itens do portfólio com base na categoria ativa
  const filteredItems: PortfolioItem[] = portfolioItems.filter((item: PortfolioItem) =>
    activeCategory === 'todos' ? true : item.category === activeCategory
  );

  return (
    <div>
      {/* Componente de filtro para alternar categorias */}
      <PortfolioFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      
      {/* Grid de portfólio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4 bg-gray-800">
        {filteredItems.map((item: PortfolioItem) => (
          <div
            key={item.id}
            className="cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            {item.media[0]?.type === 'image' ? (
              // Renderiza a imagem como thumbnail
              <img
                src={item.media[0]?.url}
                alt={item.title}
                className="w-full h-64 object-cover rounded-lg border border-gray-300"
              />
            ) : (
              // Renderiza o vídeo como thumbnail
              <video
                src={item.media[0]?.url}
                className="w-full h-64 object-cover rounded-lg border border-gray-300"
                autoPlay
                muted
                loop
              />
            )}
            <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
          </div>
        ))}
      </div>

      {/* Modal para exibir detalhes do item selecionado */}
      {selectedItem && (
        <PortfolioModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
