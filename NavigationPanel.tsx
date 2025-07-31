import React from 'react';
import { Navigation, MapPin, Clock, Route, X } from 'lucide-react';
import { NavigationState, RouteStep } from '../types';

interface NavigationPanelProps {
  navigationState: NavigationState;
  onStopNavigation: () => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  navigationState,
  onStopNavigation
}) => {
  if (!navigationState.isNavigating || !navigationState.destination) {
    return null;
  }

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const currentStep = navigationState.route[navigationState.currentStep];

  return (
    <div className="absolute bottom-4 left-4 z-40 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Navigating to</h3>
              <p className="text-sm opacity-90">{navigationState.destination.name}</p>
            </div>
          </div>
          <button
            onClick={onStopNavigation}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Current Step */}
      {currentStep && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Route className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {currentStep.instruction}
              </p>
              {currentStep.distance > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  in {formatDistance(currentStep.distance)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trip Summary */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Distance</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDistance(navigationState.remainingDistance)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">ETA</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatTime(navigationState.estimatedTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
            <span>Step {navigationState.currentStep + 1} of {navigationState.totalSteps}</span>
            <span>{Math.round(((navigationState.currentStep + 1) / navigationState.totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((navigationState.currentStep + 1) / navigationState.totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};