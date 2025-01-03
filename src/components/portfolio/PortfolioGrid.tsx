import React, { useState } from 'react';
// import PortfolioFilter from '@/components/portfolio/PortfolioFilter'; // Commented out temporarily
// import PortfolioModal from '@/components/portfolio/PortfolioModal'; // Commented out temporarily
// import type { PortfolioItemType } from '@/data/portfolioItems'; // Commented out temporarily
// import { portfolioItemsData } from '@/data/portfolioItems'; // Commented out temporarily

interface PortfolioGridProps {
  initialCategory?: string;
}

// Define a temporary mock type and data for build
type PortfolioItemType = {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  tags: string[];
  client?: string;
};

const mockPortfolioItems: PortfolioItemType[] = [
  {
    id: '1',
    title: 'Placeholder Item',
    category: 'default',
    thumbnail: 'placeholder.jpg',
    tags: ['Tag1', 'Tag2'],
  },
];

export default function PortfolioGrid({ initialCategory = 'todos' }: PortfolioGridProps) {
  const [portfolioItems] = useState<PortfolioItemType[]>(mockPortfolioItems);
  const [activeCategory] = useState(initialCategory);
  const [selectedItem] = useState<PortfolioItemType | null>(null);

  const filteredItems =
    activeCategory === 'todos'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

  return (
    <div className="container mx-auto px-4">
      {/* Commented out PortfolioFilter */}
      {/* <PortfolioFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} /> */}
      <div className="portfolio-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="portfolio-item relative cursor-pointer">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-48 object-cover rounded-md"
            />
            <div className="portfolio-item-overlay bg-black/50 absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="text-white text-center p-4">
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-200">{item.client || 'No Client Info'}</p>
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
      {/* Commented out PortfolioModal */}
      {/* {selectedItem && <PortfolioModal item={selectedItem} onClose={() => setSelectedItem(null)} />} */}
    </div>
  );
}
