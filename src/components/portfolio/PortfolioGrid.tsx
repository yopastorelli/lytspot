import React, { useState, useEffect } from 'react';
import PortfolioFilter from '@/components/portfolio/PortfolioFilter';
import PortfolioModal from '@/components/portfolio/PortfolioModal';
import { PortfolioItems as StaticPortfolioItems } from '@/data/PortfolioItems'; // Static Import

interface PortfolioItem {
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

// Placeholder PortfolioItems in case the real file is missing
const placeholderPortfolioItems: PortfolioItem[] = [
  {
    id: 'placeholder',
    title: 'Placeholder Item',
    category: 'eventos',
    thumbnail: '/images/placeholder.jpg',
    url: '/images/placeholder.jpg',
    type: 'image',
    description: 'This is a placeholder portfolio item.',
    tags: ['Placeholder'],
    date: '2024-01-01',
  },
];

export default function PortfolioGrid({ initialCategory = 'todos' }: { initialCategory?: string }) {
  const [PortfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(placeholderPortfolioItems);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  // Load PortfolioItems dynamically on mount
  useEffect(() => {
    try {
      setPortfolioItems(StaticPortfolioItems);
      console.log('PortfolioItems loaded:', StaticPortfolioItems);
    } catch (error) {
      console.warn('PortfolioItems file is missing. Using placeholder items.', error);
      setPortfolioItems(placeholderPortfolioItems);
    }
  }, []);

  // Filter items based on active category
  const filteredItems =
    activeCategory === 'todos'
      ? PortfolioItems
      : PortfolioItems.filter((item) => item.category === activeCategory);

  return (
    <div className="container mx-auto px-4">
      <PortfolioFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
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
      {selectedItem && <PortfolioModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}
