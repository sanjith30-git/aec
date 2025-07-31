import React from 'react';
import { X, MapPin, Navigation, Image as ImageIcon } from 'lucide-react';
import { Building } from '../types';

interface BuildingModalProps {
  building: Building | null;
  onClose: () => void;
  onNavigate: (building: Building) => void;
}

export const BuildingModal: React.FC<BuildingModalProps> = ({
  building,
  onClose,
  onNavigate
}) => {
  if (!building) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'hostel':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'facility':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'administrative':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          {building.image3d ? (
            <img
              src={building.image3d}
              alt={building.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-white opacity-50" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {building.name}
              </h2>
              <span className={`px-3 py-1 text-sm rounded-full ${getCategoryColor(building.category)}`}>
                {building.category}
              </span>
            </div>
            <MapPin className="w-6 h-6 text-gray-400 flex-shrink-0" />
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {building.description}
          </p>

          {/* Location Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Location</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Latitude: {building.lat.toFixed(6)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Longitude: {building.lng.toFixed(6)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate(building)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Navigate Here
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};