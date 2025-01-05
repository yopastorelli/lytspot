import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { PortfolioItem } from '@/data/portfolioItems';

interface PortfolioModalProps {
  item: PortfolioItem;
  onClose: () => void;
}

export default function PortfolioModal({ item, onClose }: PortfolioModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-gray-900 text-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-700 p-4">
          <h2 className="text-xl font-semibold">{item.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {item.media.map((media, index) => (
            <div key={index}>
              {media.type === 'image' ? (
                <img
                  src={media.url}
                  alt={item.title}
                  className="w-full h-auto rounded-lg mb-4 border border-gray-700"
                />
              ) : (
                <video
                  src={media.url}
                  controls
                  className="w-full h-auto rounded-lg mb-4 border border-gray-700"
                />
              )}
            </div>
          ))}
          <p className="text-gray-300 mb-4">{item.description}</p>
          <ul className="space-y-2 text-sm">
            <li>
              <strong className="text-gray-400">Categoria:</strong> {item.category}
            </li>
            {item.client && (
              <li>
                <strong className="text-gray-400">Cliente:</strong> {item.client}
              </li>
            )}
            <li>
              <strong className="text-gray-400">Data:</strong> {item.date}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
