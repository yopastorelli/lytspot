import React, { useState } from 'react';
import { portfolioItems, type PortfolioItem } from '../../data/portfolioItems';
import PortfolioFilter from './PortfolioFilter';
import PortfolioItem from './PortfolioItem';
import PortfolioModal from './PortfolioModal';

interface PortfolioGridProps {
  initialCategory?: string;
}

export default function PortfolioGrid({ initialCategory = 'todos' }: PortfolioGridProps) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const filteredItems = activeCategory === 'todos'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeCategory);

  return (
    <div className="container mx-auto px-4">
      <PortfolioFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      
      <div className="portfolio-grid">
        {filteredItems.map((item) => (
          <PortfolioItem
            key={item.id}
            item={item}
            onClick={() => setSelectedItem(item)}
          />
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