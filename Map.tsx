import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Building, UserLocation, NavigationState } from '../types';

interface MapProps {
  userLocation: UserLocation | null;
  buildings: Building[];
  selectedBuilding: Building | null;
  navigationState: NavigationState;
  isDarkMode: boolean;
  onBuildingClick: (building: Building) => void;
  onMapReady: (map: any) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

export const Map: React.FC<MapProps> = ({
  userLocation,
  buildings,
  selectedBuilding,
  navigationState,
  isDarkMode,
  onBuildingClick,
  onMapReady
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const routeControlRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = window.L.map(mapRef.current).setView([12.192850, 79.083730], 18);

    // Add tile layer based on theme
    const tileLayer = isDarkMode
      ? window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 22,
          attribution: '&copy; OpenStreetMap contributors, &copy; CARTO'
        })
      : window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 22,
          attribution: '&copy; OpenStreetMap contributors'
        });

    tileLayer.addTo(map);
    mapInstanceRef.current = map;
    onMapReady(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isDarkMode, onMapReady]);

  // Update user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    if (userMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
    }

    const userIcon = window.L.divIcon({
      html: `
        <div class="relative">
          <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
          <div class="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75"></div>
        </div>
      `,
      className: 'user-location-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    userMarkerRef.current = window.L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon
    }).addTo(mapInstanceRef.current);

    userMarkerRef.current.bindPopup('You are here').openPopup();
  }, [userLocation]);

  // Update building markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add building markers
    buildings.forEach(building => {
      const isSelected = selectedBuilding?.id === building.id;
      const isDestination = navigationState.destination?.id === building.id;
      
      const markerColor = isDestination ? 'red' : isSelected ? 'blue' : 'green';
      const markerIcon = window.L.divIcon({
        html: `
          <div class="relative">
            <div class="w-6 h-6 bg-${markerColor}-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
            </div>
            ${isDestination ? '<div class="absolute inset-0 w-6 h-6 bg-red-500 rounded-full animate-ping opacity-75"></div>' : ''}
          </div>
        `,
        className: 'building-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = window.L.marker([building.lat, building.lng], {
        icon: markerIcon
      }).addTo(mapInstanceRef.current);

      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-gray-900">${building.name}</h3>
          <p class="text-sm text-gray-600 mt-1">${building.description}</p>
          <button 
            onclick="window.selectBuilding('${building.id}')" 
            class="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            View Details
          </button>
        </div>
      `);

      marker.on('click', () => {
        onBuildingClick(building);
      });

      markersRef.current.push(marker);
    });

    // Global function for popup buttons
    (window as any).selectBuilding = (buildingId: string) => {
      const building = buildings.find(b => b.id === buildingId);
      if (building) {
        onBuildingClick(building);
      }
    };
  }, [buildings, selectedBuilding, navigationState.destination, onBuildingClick]);

  // Update navigation route
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing route
    if (routeControlRef.current) {
      mapInstanceRef.current.removeControl(routeControlRef.current);
      routeControlRef.current = null;
    }

    if (navigationState.isNavigating && navigationState.destination && userLocation) {
      // Create route line
      const routeCoordinates = navigationState.route.flatMap(step => 
        step.coordinates.map(coord => [coord[1], coord[0]]) // Convert [lng, lat] to [lat, lng]
      );

      if (routeCoordinates.length > 0) {
        const routeLine = window.L.polyline(routeCoordinates, {
          color: '#3B82F6',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 5'
        }).addTo(mapInstanceRef.current);

        // Fit map to show the route
        mapInstanceRef.current.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
      }
    }
  }, [navigationState, userLocation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Loading overlay */}
      {!mapInstanceRef.current && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};