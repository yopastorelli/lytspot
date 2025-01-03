import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { PortfolioItem } from '../../data/PortfolioItems'; // Importing the correct type

interface PortfolioModalProps {
  item: PortfolioItem; // Using the type instead of the constant
  onClose: () => void;
}

export default function PortfolioModal({ item, onClose }: PortfolioModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div className="bg-dark-lighter rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-white">{item.title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-full text-gray-300 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="aspect-video mb-6">
            {item.type === 'video' ? (
              <video
                src={item.url}
                controls
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>

          <div className="space-y-4">
            <p className="text-gray-300">{item.description}</p>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag: string, index: number) => ( // Added explicit types
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-light/20 rounded-full text-sm text-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
            {item.client && (
              <p className="text-gray-400">
                <span className="font-semibold">Cliente:</span> {item.client}
              </p>
            )}
            <p className="text-gray-400">
              <span className="font-semibold">Data:</span>{' '}
              {new Date(item.date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
