
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
const MAPBOX_API_KEY = 'pk.eyJ1IjoidGVzdGluZ2JybyIsImEiOiJjbTkzMnRia3EwZ3E5MmtyNG9mbm1icTY4In0.2GNGgL3GHFrv5uqnToZ3Iw';

// Function to get location suggestions from Mapbox API
export async function getSuggestions(query: string): Promise<Array<{
  place_name: string;
  center: [number, number];
}>> {
  if (!query || query.length < 3) return [];
  
  try {
    console.log('Fetching suggestions for:', query);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_API_KEY}&autocomplete=true&limit=5`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch suggestions: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Suggestions API response:', data);
    
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
    console.log('Geocoding address:', address);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_API_KEY}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    console.log('Geocode response:', data);
    
    if (!data.features || data.features.length === 0) {
      console.warn('No geocoding results found for address:', address);
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
  
  console.log(`Found ${nearbyLights.length} traffic lights near the route`);
  return nearbyLights;
}

// Function to get route from Mapbox Directions API
export async function getRoute(
  startCoordinates: Coordinates,
  endCoordinates: Coordinates
): Promise<RouteData | null> {
  try {
    console.log('Calculating route from', startCoordinates, 'to', endCoordinates);
    
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoordinates.lng},${startCoordinates.lat};${endCoordinates.lng},${endCoordinates.lat}?geometries=geojson&overview=full&access_token=${MAPBOX_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Direction request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Route data:', data);
    
    if (!data.routes || data.routes.length === 0) {
      console.warn('No routes found between locations');
      toast.error("No routes found between these locations");
      return null;
    }
    
    const route = data.routes[0];
    const routeGeometry = route.geometry;
    
    if (!routeGeometry || !routeGeometry.coordinates || routeGeometry.coordinates.length === 0) {
      console.warn('Route geometry is invalid', routeGeometry);
      toast.error("Invalid route data received. Please try again.");
      return null;
    }
    
    // Find traffic lights along the route
    const trafficLights = findNearbyTrafficLights(routeGeometry.coordinates);
    
    const routeData = {
      distance: route.distance,
      duration: route.duration,
      trafficLights,
      geometry: routeGeometry
    };
    
    console.log('Processed route data:', routeData);
    return routeData;
  } catch (error) {
    console.error("Error fetching route:", error);
    toast.error("Failed to calculate route. Please try again.");
    return null;
  }
}
