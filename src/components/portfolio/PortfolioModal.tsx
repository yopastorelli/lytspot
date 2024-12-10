import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function PortfolioModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">{item.title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
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
            <p className="text-gray-600">{item.description}</p>
            <div className="flex gap-2">
              {item.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}