
import { toast } from "sonner";

// Define typescript interfaces
interface Coordinates {
  lng: number;
  lat: number;
}

export interface TrafficLight {
  id: string;
  name: string;
  location: string;
  coordinates: Coordinates;
  duration: number; // in seconds
  vendorCount: number;
}

export interface RouteData {
  distance: number; // in meters
  duration: number; // in seconds
  trafficLights: TrafficLight[];
  geometry: any; // GeoJSON LineString for the route
}

// Mock traffic light data - in a real app, this would come from a backend
const trafficLightDatabase: TrafficLight[] = [
  {
    id: "tl1",
    name: "Signal #42",
    location: "MG Road & 11th Cross",
    coordinates: { lng: 77.5946, lat: 12.9716 },
    duration: 90,
    vendorCount: 5
  },
  {
    id: "tl2",
    name: "Signal #28",
    location: "Ring Road & KR Puram",
    coordinates: { lng: 77.7006, lat: 13.0025 },
    duration: 120,
    vendorCount: 8
  },
  {
    id: "tl3",
    name: "Signal #15",
    location: "Silk Board Junction",
    coordinates: { lng: 77.6227, lat: 12.9170 },
    duration: 180,
    vendorCount: 12
  },
  {
    id: "tl4",
    name: "Signal #36",
    location: "Hebbal Flyover",
    coordinates: { lng: 77.5957, lat: 13.0358 },
    duration: 75,
    vendorCount: 4
  },
];

// Mapbox API constants
const MAPBOX_API_KEY = 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xoNnZ5MGRsMDI0dzNzcDdzamJzaDlmdCJ9.xmCJJoGABmEVWxGPBLWgQA';

// Function to get location suggestions from Mapbox API
export async function getSuggestions(query: string): Promise<Array<{
  place_name: string;
  center: [number, number];
}>> {
  if (!query || query.length < 3) return [];
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_API_KEY}&autocomplete=true&limit=5`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }
    
    const data = await response.json();
    return data.features.map((feature: any) => ({
      place_name: feature.place_name,
      center: feature.center // [longitude, latitude] array
    }));
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
}

// Function to geocode addresses (convert text to coordinates)
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  if (!address) return null;
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_API_KEY}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    if (!data.features || data.features.length === 0) {
      return null;
    }
    
    const [lng, lat] = data.features[0].center;
    return { lng, lat };
  } catch (error) {
    console.error("Error geocoding address:", error);
    toast.error("Failed to find location. Please check the address and try again.");
    return null;
  }
}

// Function to find traffic lights near the route
function findNearbyTrafficLights(routeCoordinates: Array<[number, number]>): TrafficLight[] {
  // Simple implementation: find traffic lights within a certain distance of the route
  const nearbyLights: TrafficLight[] = [];
  const MAX_DISTANCE = 0.01; // ~1km in decimal degrees
  
  routeCoordinates.forEach(([lng, lat]) => {
    trafficLightDatabase.forEach(light => {
      if (
        !nearbyLights.find(l => l.id === light.id) && 
        Math.abs(light.coordinates.lng - lng) < MAX_DISTANCE &&
        Math.abs(light.coordinates.lat - lat) < MAX_DISTANCE
      ) {
        nearbyLights.push(light);
      }
    });
  });
  
  return nearbyLights;
}

// Function to get route from Mapbox Directions API
export async function getRoute(
  startCoordinates: Coordinates,
  endCoordinates: Coordinates
): Promise<RouteData | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoordinates.lng},${startCoordinates.lat};${endCoordinates.lng},${endCoordinates.lat}?geometries=geojson&overview=full&access_token=${MAPBOX_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Direction request failed');
    }
    
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      toast.error("No routes found between these locations");
      return null;
    }
    
    const route = data.routes[0];
    const routeGeometry = route.geometry;
    
    // Find traffic lights along the route
    const trafficLights = findNearbyTrafficLights(routeGeometry.coordinates);
    
    return {
      distance: route.distance,
      duration: route.duration,
      trafficLights,
      geometry: routeGeometry
    };
  } catch (error) {
    console.error("Error fetching route:", error);
    toast.error("Failed to calculate route. Please try again.");
    return null;
  }
}
