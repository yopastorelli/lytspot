// PortfolioItems.tsx

import React from 'react';

// Definição do tipo PortfolioItemsType
export type PortfolioItemsType = {
  id: string;
  title: string;
  category: string;
  client: string;
  thumbnail: string;
  tags: string[];
};

// Dados de exemplo do portfólio
export const PortfolioItems: PortfolioItemsType[] = [
  {
    id: '1',
    title: 'Projeto 1',
    category: 'web',
    client: 'Cliente 1',
    thumbnail: 'url_da_imagem_1',
    tags: ['React', 'JavaScript'],
  },
  {
    id: '2',
    title: 'Projeto 2',
    category: 'design',
    client: 'Cliente 2',
    thumbnail: 'url_da_imagem_2',
    tags: ['Figma', 'UI/UX'],
  },
  // Adicione mais itens aqui, conforme necessário...
];

// Componente para exibir os itens do portfólio
interface PortfolioItemsComponentProps {
  item: PortfolioItemsType;
  onClick: () => void;
}

export const PortfolioItemsComponent: React.FC<PortfolioItemsComponentProps> = ({ item, onClick }) => {
  return (
    <div className="portfolio-item cursor-pointer" onClick={onClick}>
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
              <span key={index} className="text-xs bg-primary-light/20 px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
