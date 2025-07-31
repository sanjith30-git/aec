import React from 'react';
import { Sun, Moon, Navigation, MapPin, Search } from 'lucide-react';

interface MapControlsProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onRecenterMap: () => void;
  onToggleSearch: () => void;
  isNavigating: boolean;
}

export const MapControls: React.FC<MapControlsProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onRecenterMap,
  onToggleSearch,
  isNavigating
}) => {
  return (
    <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
      {/* Dark/Light Mode Toggle */}
      <button
        onClick={onToggleDarkMode}
        className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? (
          <Sun className="w-6 h-6 text-yellow-500" />
        ) : (
          <Moon className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Recenter Map */}
      <button
        onClick={onRecenterMap}
        className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
        title="Center on My Location"
      >
        <Navigation className="w-6 h-6 text-blue-500" />
      </button>

      {/* Search Toggle */}
      <button
        onClick={onToggleSearch}
        className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
        title="Search Buildings"
      >
        <Search className="w-6 h-6 text-green-500" />
      </button>

      {/* Navigation Status */}
      {isNavigating && (
        <div className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">Navigating</span>
        </div>
      )}
    </div>
  );
};