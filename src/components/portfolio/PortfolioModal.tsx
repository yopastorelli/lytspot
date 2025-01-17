import React from 'react';
import type { PortfolioItem } from '@/data/portfolioItems';

interface PortfolioModalProps {
  item: PortfolioItem;
  onClose: () => void;
}

export default function PortfolioModal({ item, onClose }: PortfolioModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      {/* 
        Adicionamos 'overflow-y-auto' e 'max-h-[80vh]' para permitir a rolagem. 
        Também incluímos 'relative' para posicionar o botão de fechar adequadamente.
      */}
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 max-w-4xl w-full overflow-y-auto max-h-[80vh] relative">
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white absolute top-4 right-4 text-2xl font-semibold"
          aria-label="Fechar"
        >
          &times;
        </button>

        {/* Título do Item */}
        <h2 className="text-2xl font-bold text-white mb-4">{item.title}</h2>

        {/* Mídia Principal */}
        <div className="mb-6">
          {item.media.map((mediaItem, index) =>
            mediaItem.type === 'image' ? (
              <img
                key={index}
                src={mediaItem.url}
                alt={`${item.title} media ${index + 1}`}
                className="w-full h-auto rounded-lg mb-4"
              />
            ) : (
              <video
                key={index}
                src={mediaItem.url}
                controls
                className="w-full h-auto rounded-lg mb-4"
              />
            )
          )}
        </div>

        {/* Descrição */}
        <p className="text-gray-300 mb-4">{item.description}</p>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Data e Cliente */}
        <div className="text-gray-400 text-sm">
          <p>
            <strong>Data:</strong> {item.date}
          </p>
          {item.client && (
            <p>
              <strong>Cliente:</strong> {item.client}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
