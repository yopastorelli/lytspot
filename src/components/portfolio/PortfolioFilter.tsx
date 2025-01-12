import React from 'react';

interface PortfolioFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'todos', label: 'TODOS' },
  { id: 'festas', label: 'Festas' },
  { id: 'empresas', label: 'Empresas' },
  { id: 'arquitetura', label: 'Arquitetura' },
  { id: 'projetos', label: 'Projetos' },
];

export default function PortfolioFilter({
  activeCategory,
  onCategoryChange,
}: PortfolioFilterProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center mb-6">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 text-sm font-semibold rounded-lg focus:outline-none ${
            activeCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
