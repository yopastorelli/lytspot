import React from 'react';

interface PortfolioFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onShowAllPhotos: (category: string) => void;
}

const categories = [
  { id: 'todos', label: 'TODOS' },
  { id: 'aventuras', label: 'Aventuras' },
  { id: 'arquitetura', label: 'Arquitetura' },
  { id: 'empresas', label: 'Empresas' },
  { id: 'festasepalco', label: 'Festas e Palco' },
  { id: 'projetos', label: 'Projetos' },
];

export default function PortfolioFilter({
  activeCategory,
  onCategoryChange,
  onShowAllPhotos,
}: PortfolioFilterProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-0 mb-6">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => {
            onCategoryChange(category.id);
            onShowAllPhotos(category.id);
          }}
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
