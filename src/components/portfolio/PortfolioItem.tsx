import React from 'react';
import type { PortfolioItem as PortfolioItemType } from '../../data/portfolioItems';

interface PortfolioItemProps {
  item: PortfolioItemType;
  onClick: () => void;
}

export default function PortfolioItem({ item, onClick }: PortfolioItemProps) {
  return (
    <div className="portfolio-item" onClick={onClick}>
      <img
        src={item.thumbnail}
        alt={item.title}
      />
      <div className="portfolio-item-overlay">
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
  );
}