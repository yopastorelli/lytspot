import React, { useState } from 'react';
import PortfolioFilter from '../components/portfolio/PortfolioFilter';
import { portfolioItems } from '../data/portfolioItems';
import type { PortfolioItem } from '../data/portfolioItems';

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const filteredItems = activeCategory === 'todos'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeCategory);

  return (
    <div>
      <PortfolioFilter
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
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