import React from 'react';
import type { PortfolioItem } from '@/data/portfolioItems';

interface PortfolioModalProps {
  item: PortfolioItem;
  onClose: () => void;
}

export default function PortfolioModal({ item, onClose }: PortfolioModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg overflow-hidden max-w-4xl w-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">{item.title}</h2>
          <button
            className="text-gray-400 hover:text-white"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* Exibição de mídia */}
          <div className="relative">
            {item.media.map((mediaItem, index) =>
              mediaItem.type === 'image' ? (
                <img
                  key={index}
                  src={mediaItem.url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <video
                  key={index}
                  src={mediaItem.url}
                  className="w-full h-64 object-cover rounded-lg"
                  controls
                />
              )
            )}
          </div>

          {/* Descrição e informações adicionais */}
          <div>
            <p className="text-gray-300">{item.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary text-white text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Informações do cliente e data */}
          {item.client && (
            <p className="text-gray-400 text-sm">
              <strong>Cliente:</strong> {item.client}
            </p>
          )}
          <p className="text-gray-400 text-sm">
            <strong>Data:</strong> {item.date}
          </p>
        </div>
      </div>
    </div>
  );
}
