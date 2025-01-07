import React from 'react';

interface PortfolioFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { key: 'todos', label: 'Todos' },
  { key: 'festas', label: 'Festas' },
  { key: 'empresas', label: 'Empresas' },
  { key: 'imobiliário', label: 'Imobiliário' },
  { key: 'projetos', label: 'Projetos' },
];

export default function PortfolioFilter({ activeCategory, onCategoryChange }: PortfolioFilterProps) {
  return (
    <div className="flex justify-center gap-4 my-4">
      {categories.map((category) => (
        <button
          key={category.key}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeCategory === category.key
              ? 'bg-primary text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-primary hover:text-white'
          }`}
          onClick={() => onCategoryChange(category.key)}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
