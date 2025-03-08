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

  // Filtra os itens do portfolio com base na categoria ativa
  const filteredItems: PortfolioItem[] = portfolioItems.filter((item: PortfolioItem) =>
    activeCategory === 'todos' ? true : item.category === activeCategory
  );

  return (
    <div>
      {/* Filtro para alternar categorias */}
      <PortfolioFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Grid de itens do portfolio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2 bg-gray-800">
        {filteredItems.map((item: PortfolioItem) => (
          <div
            key={item.id}
            className="cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            {/* Container externo com background azul */}
            <div className="h-64 p-[4px] bg-blue-700 rounded-lg" style={{ boxShadow: 'none' }}>
              {/* Container interno para a imagem */}
              <div className="h-full w-full overflow-hidden rounded-md bg-blue-800">
                {item.media[0]?.type === 'image' ? (
                  <img
                    src={item.media[0]?.url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    style={{ display: 'block', margin: '0', border: 'none', boxShadow: 'none' }}
                  />
                ) : (
                  <video
                    src={item.media[0]?.url}
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    style={{ display: 'block', margin: '0', border: 'none', boxShadow: 'none' }}
                  />
                )}
              </div>
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
