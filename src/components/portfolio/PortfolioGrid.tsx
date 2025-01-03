import React, { useState, useEffect } from 'react';
import PortfolioFilter from '@/components/portfolio/PortfolioFilter';
import PortfolioModal from '@/components/portfolio/PortfolioModal';
import type { PortfolioItem } from '@/data/PortfolioItemsTO'; // Type-only import
import { getPortfolioItems } from '@/data/PortfolioItemsTO';

interface PortfolioGridProps {
  initialCategory?: string;
}

export default function PortfolioGrid({ initialCategory = 'todos' }: PortfolioGridProps) {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  // Dynamically load portfolio items when the component mounts
  useEffect(() => {
    async function fetchItems() {
      const items = await getPortfolioItems(); // Dynamically fetch portfolio items
      setPortfolioItems(items);
    }
    fetchItems();
  }, []);

  // Filter items based on the active category
  const filteredItems =
    activeCategory === 'todos'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

  return (
    <div className="container mx-auto px-4">
      {/* Portfolio filter component */}
      <PortfolioFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Portfolio grid */}
      <div className="portfolio-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="portfolio-item relative cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-48 object-cover rounded-md"
            />
            <div className="portfolio-item-overlay bg-black/50 absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="text-white text-center p-4">
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-200">{item.client}</p>
                <div className="flex gap-2 justify-center mt-3">
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-primary-light/20 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio modal */}
      {selectedItem && <PortfolioModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}
