import React from 'react';

interface PortfolioFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'todos', label: 'Todos' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'corporativo', label: 'Corporativo' },
  // { id: 'publicidade', label: 'Publicidade' },
  { id: 'ensaios', label: 'Ensaios' },
];

export default function PortfolioFilter({ activeCategory, onCategoryChange }: PortfolioFilterProps) {
  return (
    <div className="flex gap-4 justify-center mb-12 overflow-x-auto pb-4">
      {categories.map((category, index) => (
        <button
          key={category.id} // Apenas para React
          data-category-index={index}
          onClick={() => onCategoryChange(category.id)}
          className={`px-6 py-2 rounded-full border transition-colors ${
            activeCategory === category.id
              ? 'border-primary-light text-primary-light bg-primary-light/10'
              : 'border-gray-700 text-gray-300 hover:border-primary-light hover:text-primary-light'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
