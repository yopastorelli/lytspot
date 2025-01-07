import React from 'react';

interface PortfolioFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'todos', label: 'Todos' },
  { id: 'festas', label: 'Festas' },
  { id: 'empresas', label: 'Empresas' },
  { id: 'imobiliário', label: 'Imobiliario' },
  { id: 'projetos', label: 'Projetos' },
];

export default function PortfolioFilter({ activeCategory, onCategoryChange }: PortfolioFilterProps) {
  return (
    <div className="flex gap-4 justify-center flex-wrap py-4">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`px-4 py-2 rounded-lg ${
            activeCategory === category.id
              ? 'bg-black text-white'
              : 'bg-gray-200 text-black'
          }`}
          onClick={() => onCategoryChange(category.id)}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
