import React, { useState, useMemo } from 'react';
import { Search, X, MapPin, Clock, Star } from 'lucide-react';
import { Building } from '../types';

interface BuildingSearchProps {
  buildings: Building[];
  onSelectBuilding: (building: Building) => void;
  onClose: () => void;
  isVisible: boolean;
}

export const BuildingSearch: React.FC<BuildingSearchProps> = ({
  buildings,
  onSelectBuilding,
  onClose,
  isVisible
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Buildings', icon: MapPin },
    { id: 'academic', name: 'Academic', icon: Star },
    { id: 'hostel', name: 'Hostels', icon: Clock },
    { id: 'facility', name: 'Facilities', icon: MapPin },
    { id: 'administrative', name: 'Administrative', icon: Star }
  ];

  const filteredBuildings = useMemo(() => {
    return buildings.filter(building => {
      const matchesSearch = building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           building.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || building.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [buildings, searchQuery, selectedCategory]);

  if (!isVisible) return null;

  return (
    <div className="absolute top-4 left-4 z-40 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Buildings
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search buildings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-3 h-3" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div className="max-h-96 overflow-y-auto">
        {filteredBuildings.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No buildings found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBuildings.map(building => (
              <button
                key={building.id}
                onClick={() => {
                  onSelectBuilding(building);
                  onClose();
                }}
                className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {building.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {building.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        building.category === 'academic' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        building.category === 'hostel' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        building.category === 'facility' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {building.category}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};