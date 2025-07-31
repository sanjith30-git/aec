import { Building, UserLocation, RouteStep } from '../types';

interface Node {
  lat: number;
  lng: number;
  g: number; // Cost from start
  h: number; // Heuristic cost to goal
  f: number; // Total cost
  parent: Node | null;
}

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Find the nearest building to a given location
export const findNearestBuilding = (location: UserLocation, buildings: Building[]): Building | null => {
  if (buildings.length === 0) return null;

  let nearest = buildings[0];
  let minDistance = calculateDistance(location.lat, location.lng, nearest.lat, nearest.lng);

  for (let i = 1; i < buildings.length; i++) {
    const distance = calculateDistance(location.lat, location.lng, buildings[i].lat, buildings[i].lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = buildings[i];
    }
  }

  return nearest;
};

// Calculate bearing between two points
export const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return (θ * 180 / Math.PI + 360) % 360;
};

// Convert bearing to direction
export const bearingToDirection = (bearing: number): string => {
  const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};

// Generate turn instruction based on bearing change
export const getTurnInstruction = (prevBearing: number, currentBearing: number): string => {
  const diff = ((currentBearing - prevBearing + 540) % 360) - 180;
  
  if (Math.abs(diff) < 15) return 'Continue straight';
  if (diff > 15 && diff < 75) return 'Turn slight right';
  if (diff >= 75 && diff < 105) return 'Turn right';
  if (diff >= 105 && diff < 165) return 'Turn sharp right';
  if (Math.abs(diff) >= 165) return 'Make a U-turn';
  if (diff < -15 && diff > -75) return 'Turn slight left';
  if (diff <= -75 && diff > -105) return 'Turn left';
  if (diff <= -105 && diff > -165) return 'Turn sharp left';
  
  return 'Continue straight';
};

// Simple pathfinding algorithm (for demonstration - in real app, use proper routing service)
export const findShortestPath = (
  start: UserLocation,
  destination: Building,
  buildings: Building[]
): RouteStep[] => {
  const steps: RouteStep[] = [];
  
  // For simplicity, create a direct route with intermediate waypoints
  const distance = calculateDistance(start.lat, start.lng, destination.lat, destination.lng);
  const bearing = calculateBearing(start.lat, start.lng, destination.lat, destination.lng);
  const direction = bearingToDirection(bearing);
  
  // Create waypoints for more realistic navigation
  const numWaypoints = Math.max(2, Math.floor(distance / 100)); // One waypoint per 100m
  
  for (let i = 0; i <= numWaypoints; i++) {
    const progress = i / numWaypoints;
    const lat = start.lat + (destination.lat - start.lat) * progress;
    const lng = start.lng + (destination.lng - start.lng) * progress;
    
    let instruction = '';
    let maneuver = 'straight';
    
    if (i === 0) {
      instruction = `Head ${direction.toLowerCase()} towards ${destination.name}`;
      maneuver = 'depart';
    } else if (i === numWaypoints) {
      instruction = `Arrive at ${destination.name}`;
      maneuver = 'arrive';
    } else {
      // Check if we're near any building for landmark-based instructions
      const nearbyBuilding = findNearestBuilding({ lat, lng }, buildings);
      if (nearbyBuilding && calculateDistance(lat, lng, nearbyBuilding.lat, nearbyBuilding.lng) < 50) {
        instruction = `Continue past ${nearbyBuilding.name}`;
      } else {
        instruction = `Continue ${direction.toLowerCase()}`;
      }
    }
    
    const stepDistance = i === 0 ? 0 : calculateDistance(
      start.lat + (destination.lat - start.lat) * ((i - 1) / numWaypoints),
      start.lng + (destination.lng - start.lng) * ((i - 1) / numWaypoints),
      lat,
      lng
    );
    
    steps.push({
      instruction,
      distance: stepDistance,
      duration: stepDistance / 1.4, // Assume walking speed of 1.4 m/s
      maneuver,
      coordinates: [[lng, lat]]
    });
  }
  
  return steps;
};

// Find buildings within a radius
export const findBuildingsInRadius = (
  center: UserLocation,
  buildings: Building[],
  radiusMeters: number
): Building[] => {
  return buildings.filter(building => 
    calculateDistance(center.lat, center.lng, building.lat, building.lng) <= radiusMeters
  );
};