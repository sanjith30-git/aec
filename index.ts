export interface Building {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  image3d?: string;
  category: 'academic' | 'hostel' | 'facility' | 'administrative';
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: string;
  coordinates: [number, number][];
}

export interface NavigationState {
  isNavigating: boolean;
  currentStep: number;
  totalSteps: number;
  destination: Building | null;
  route: RouteStep[];
  remainingDistance: number;
  estimatedTime: number;
}

export interface AIAssistantState {
  isActive: boolean;
  isSpeaking: boolean;
  currentMessage: string;
  avatar: {
    x: number;
    y: number;
    animation: 'idle' | 'pointing' | 'waving' | 'turning';
  };
}