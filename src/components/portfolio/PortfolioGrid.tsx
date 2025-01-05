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

  const filteredItems: PortfolioItem[] = portfolioItems.filter((item: PortfolioItem) =>
    activeCategory === 'todos' ? true : item.category === activeCategory
  );

  return (
    <div>
      <PortfolioFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {filteredItems.map((item: PortfolioItem) => (
          <div
            key={item.id}
            className="cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            <img
              src={item.media[0]?.url} // Usa a primeira mídia como thumbnail
              alt={item.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
          </div>
        ))}
      </div>
      {selectedItem && (
        <PortfolioModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
