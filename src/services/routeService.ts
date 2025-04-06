
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

// Mock traffic light data for vendors information - in a real app, this would come from a backend
const trafficLightVendorData: Record<string, number> = {
  // Will be used to assign vendor counts to discovered traffic lights
  "default": 5,
};

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
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_API_KEY}&autocomplete=true&limit=5&types=address,place,locality,neighborhood,poi`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch suggestions: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Suggestions API response:', data);
    
    if (!data.features || data.features.length === 0) {
      return [];
    }
    
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
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_API_KEY}&limit=1&types=address,place,locality,neighborhood,poi`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    console.log('Geocode response:', data);
    
    if (!data.features || data.features.length === 0) {
      console.warn('No geocoding results found for address:', address);
      toast.error("Address not found. Please try a different search term.");
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

// Function to find traffic lights near the route using Overpass API
async function fetchTrafficLightsAlongRoute(routeCoordinates: Array<[number, number]>): Promise<TrafficLight[]> {
  if (!routeCoordinates || routeCoordinates.length === 0) {
    console.warn('No route coordinates provided for traffic light search');
    return [];
  }
  
  try {
    console.log('Fetching traffic lights along route with coordinates:', routeCoordinates);
    
    // Create a bounding box that encompasses the entire route with some padding
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    routeCoordinates.forEach(([lng, lat]) => {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });
    
    // Add padding to the bounding box (approximately 500m)
    const padding = 0.005; // ~500m in decimal degrees
    minLat -= padding;
    maxLat += padding;
    minLng -= padding;
    maxLng += padding;
    
    // Construct Overpass API query
    // This query finds traffic signals within the bounding box
    const overpassQuery = `
      [out:json];
      (
        node["highway"="traffic_signals"](${minLat},${minLng},${maxLat},${maxLng});
      );
      out body;
    `;
    
    console.log('Overpass query:', overpassQuery);
    
    // Make request to Overpass API
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });
    
    if (!response.ok) {
      throw new Error(`Overpass API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Overpass API response:', data);
    
    if (!data.elements) {
      return [];
    }
    
    // Process traffic lights from Overpass API response
    const MAX_DISTANCE = 0.002; // ~200m in decimal degrees
    const nearbyLights: TrafficLight[] = [];
    const processedIds = new Set<string>();
    
    // Helper function to check if a traffic light is near the route
    function isNearRoute(lightLng: number, lightLat: number): boolean {
      for (let i = 0; i < routeCoordinates.length; i++) {
        const [routeLng, routeLat] = routeCoordinates[i];
        // Simple distance check in decimal degrees
        if (
          Math.abs(lightLng - routeLng) < MAX_DISTANCE &&
          Math.abs(lightLat - routeLat) < MAX_DISTANCE
        ) {
          return true;
        }
      }
      return false;
    }
    
    // Extract relevant information from each traffic light
    data.elements.forEach((element: any) => {
      const id = `tl${element.id}`;
      
      // Skip if already processed
      if (processedIds.has(id)) return;
      
      // Check if the traffic light is close enough to the route
      if (isNearRoute(element.lon, element.lat)) {
        processedIds.add(id);
        
        const name = element.tags?.name || `Traffic Signal #${element.id.toString().slice(-4)}`;
        const location = element.tags?.road || element.tags?.description || 'Unknown Intersection';
        
        // Random duration between 40-180 seconds
        const duration = Math.floor(Math.random() * 140) + 40;
        
        // Random vendor count or use default
        const vendorCount = trafficLightVendorData[id] || trafficLightVendorData.default || 
                         Math.floor(Math.random() * 10) + 1;
        
        nearbyLights.push({
          id,
          name,
          location,
          coordinates: { lng: element.lon, lat: element.lat },
          duration,
          vendorCount
        });
      }
    });
    
    console.log(`Found ${nearbyLights.length} traffic lights near the route`);
    return nearbyLights;
  } catch (error) {
    console.error('Error fetching traffic lights:', error);
    toast.error("Failed to fetch traffic signals data. Using estimated data instead.");
    
    // Fallback to estimated traffic lights if the API fails
    return estimateTrafficLights(routeCoordinates);
  }
}

// Fallback function to estimate traffic lights based on route distance
function estimateTrafficLights(routeCoordinates: Array<[number, number]>): TrafficLight[] {
  if (routeCoordinates.length < 2) return [];
  
  // Estimate one traffic light every ~1km
  const estimatedCount = Math.max(1, Math.floor(calculateRouteDistance(routeCoordinates) / 1000));
  const lights: TrafficLight[] = [];
  
  // Place traffic lights at regular intervals along the route
  for (let i = 1; i < estimatedCount + 1; i++) {
    const index = Math.floor((routeCoordinates.length - 1) * (i / (estimatedCount + 1)));
    const [lng, lat] = routeCoordinates[index];
    
    lights.push({
      id: `estimated-${i}`,
      name: `Estimated Signal #${i}`,
      location: `Route Point ${i}`,
      coordinates: { lng, lat },
      duration: Math.floor(Math.random() * 120) + 60, // 60-180 seconds
      vendorCount: Math.floor(Math.random() * 8) + 1 // 1-8 vendors
    });
  }
  
  return lights;
}

// Calculate route distance in meters
function calculateRouteDistance(coordinates: Array<[number, number]>): number {
  let distance = 0;
  
  for (let i = 1; i < coordinates.length; i++) {
    distance += getDistanceFromLatLonInMeters(
      coordinates[i-1][1], coordinates[i-1][0],
      coordinates[i][1], coordinates[i][0]
    );
  }
  
  return distance;
}

// Haversine formula to calculate distance between two points
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
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
    
    // Find traffic lights along the route using Overpass API
    const trafficLights = await fetchTrafficLightsAlongRoute(routeGeometry.coordinates);
    
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
