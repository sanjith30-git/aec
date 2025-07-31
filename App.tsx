import React, { useState, useEffect, useCallback } from 'react';
import { Map } from './components/Map';
import { AIAssistant } from './components/AIAssistant';
import { MapControls } from './components/MapControls';
import { BuildingSearch } from './components/BuildingSearch';
import { NavigationPanel } from './components/NavigationPanel';
import { BuildingModal } from './components/BuildingModal';
import { useGeolocation } from './hooks/useGeolocation';
import { buildings } from './data/buildings';
import { findShortestPath, calculateDistance } from './utils/pathfinding';
import { Building, NavigationState, AIAssistantState } from './types';

function App() {
  const { location: userLocation, error: locationError } = useGeolocation();
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    currentStep: 0,
    totalSteps: 0,
    destination: null,
    route: [],
    remainingDistance: 0,
    estimatedTime: 0
  });

  const [aiState, setAiState] = useState<AIAssistantState>({
    isActive: true,
    isSpeaking: false,
    currentMessage: 'Welcome to the campus navigation system! I can help you find any building on campus. Just ask me where you want to go.',
    avatar: {
      x: 0,
      y: 0,
      animation: 'idle'
    }
  });

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load Leaflet scripts
  useEffect(() => {
    const loadLeaflet = async () => {
      if (window.L) return;

      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css';
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js';
      script.onload = () => {
        console.log('Leaflet loaded successfully');
      };
      document.head.appendChild(script);
    };

    loadLeaflet();
  }, []);

  const handleBuildingClick = useCallback((building: Building) => {
    setSelectedBuilding(building);
    setShowBuildingModal(true);
  }, []);

  const handleNavigateToBuilding = useCallback((building: Building) => {
    if (!userLocation) {
      setAiState(prev => ({
        ...prev,
        currentMessage: 'I need to know your current location to provide navigation. Please enable location services.'
      }));
      return;
    }

    const route = findShortestPath(userLocation, building, buildings);
    const totalDistance = route.reduce((sum, step) => sum + step.distance, 0);
    const totalTime = route.reduce((sum, step) => sum + step.duration, 0);

    setNavigationState({
      isNavigating: true,
      currentStep: 0,
      totalSteps: route.length,
      destination: building,
      route,
      remainingDistance: totalDistance,
      estimatedTime: totalTime
    });

    setAiState(prev => ({
      ...prev,
      currentMessage: `Starting navigation to ${building.name}. Follow the directions on your screen. I'll guide you step by step.`,
      avatar: { ...prev.avatar, animation: 'pointing' }
    }));

    setShowBuildingModal(false);
  }, [userLocation]);

  const handleStopNavigation = useCallback(() => {
    setNavigationState({
      isNavigating: false,
      currentStep: 0,
      totalSteps: 0,
      destination: null,
      route: [],
      remainingDistance: 0,
      estimatedTime: 0
    });

    setAiState(prev => ({
      ...prev,
      currentMessage: 'Navigation stopped. How else can I help you find your way around campus?',
      avatar: { ...prev.avatar, animation: 'idle' }
    }));
  }, []);

  const handleDestinationRequest = useCallback((buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    if (building) {
      handleNavigateToBuilding(building);
    }
  }, [handleNavigateToBuilding]);

  const handleRecenterMap = useCallback(() => {
    if (mapInstance && userLocation) {
      mapInstance.setView([userLocation.lat, userLocation.lng], 18);
    }
  }, [mapInstance, userLocation]);

  const updateAiState = useCallback((updates: Partial<AIAssistantState>) => {
    setAiState(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Map Container */}
      <Map
        userLocation={userLocation}
        buildings={buildings}
        selectedBuilding={selectedBuilding}
        navigationState={navigationState}
        isDarkMode={isDarkMode}
        onBuildingClick={handleBuildingClick}
        onMapReady={setMapInstance}
      />

      {/* Map Controls */}
      <MapControls
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onRecenterMap={handleRecenterMap}
        onToggleSearch={() => setShowSearch(!showSearch)}
        isNavigating={navigationState.isNavigating}
      />

      {/* Building Search */}
      <BuildingSearch
        buildings={buildings}
        onSelectBuilding={handleBuildingClick}
        onClose={() => setShowSearch(false)}
        isVisible={showSearch}
      />

      {/* Navigation Panel */}
      <NavigationPanel
        navigationState={navigationState}
        onStopNavigation={handleStopNavigation}
      />

      {/* AI Assistant */}
      <AIAssistant
        state={aiState}
        onStateChange={updateAiState}
        onDestinationRequest={handleDestinationRequest}
        buildings={buildings}
        isNavigating={navigationState.isNavigating}
      />

      {/* Building Modal */}
      <BuildingModal
        building={selectedBuilding}
        onClose={() => {
          setShowBuildingModal(false);
          setSelectedBuilding(null);
        }}
        onNavigate={handleNavigateToBuilding}
      />

      {/* Location Error */}
      {locationError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">Location Error: {locationError}</p>
        </div>
      )}
    </div>
  );
}

export default App;
