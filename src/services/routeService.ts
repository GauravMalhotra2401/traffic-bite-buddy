
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

// Mock traffic light vendor data for vendors information - in a real app, this would come from a backend
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
    
    // Create a tighter bounding box that encompasses the entire route with minimal padding
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    routeCoordinates.forEach(([lng, lat]) => {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });
    
    // Add minimal padding to the bounding box (approximately 20m)
    const padding = 0.0002; // ~20m in decimal degrees, very small buffer
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
    // MUCH stricter distance threshold - only signals directly on route
    const MAX_DISTANCE_METERS = 10; // Reduced from 25m to 10m to ensure signals are directly on route
    const nearbyLights: TrafficLight[] = [];
    const processedIds = new Set<string>();
    
    // Helper function to check if a traffic light is directly on the route
    // Using a more precise calculation
    function isDirectlyOnRoute(lightLng: number, lightLat: number): boolean {
      // Find the closest point on the route to this traffic light
      let minDistance = Infinity;
      
      for (let i = 0; i < routeCoordinates.length - 1; i++) {
        const [p1Lng, p1Lat] = routeCoordinates[i];
        const [p2Lng, p2Lat] = routeCoordinates[i + 1];
        
        // Calculate exact distance from traffic light to this route segment
        const distance = getDistanceFromPointToLineSegment(
          lightLat, lightLng,
          p1Lat, p1Lng,
          p2Lat, p2Lng
        );
        
        minDistance = Math.min(minDistance, distance);
      }
      
      console.log(`Traffic light distance to route: ${minDistance} meters`);
      return minDistance <= MAX_DISTANCE_METERS;
    }
    
    // Extract relevant information from each traffic light
    data.elements.forEach((element: any) => {
      const id = `tl${element.id}`;
      
      // Skip if already processed
      if (processedIds.has(id)) return;
      
      // Only include traffic lights that are DIRECTLY on the route
      if (isDirectlyOnRoute(element.lon, element.lat)) {
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
    
    console.log(`Found ${nearbyLights.length} traffic lights directly on the route`);
    
    // If we didn't find any lights, place some along the route as a fallback
    if (nearbyLights.length === 0) {
      console.log("No actual traffic lights found on route, using estimated positions");
      return estimateTrafficLights(routeCoordinates);
    }
    
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
  
  // Estimate one traffic light every ~250m (increased frequency)
  const routeDistance = calculateRouteDistance(routeCoordinates);
  const estimatedCount = Math.max(2, Math.floor(routeDistance / 250));
  console.log(`Estimated route distance: ${routeDistance}m, estimating ${estimatedCount} traffic lights`);
  const lights: TrafficLight[] = [];
  
  // Place traffic lights at regular intervals along the route at actual route points
  for (let i = 1; i < estimatedCount + 1; i++) {
    // Choose actual points from the route for more realism
    const index = Math.floor((routeCoordinates.length - 1) * (i / (estimatedCount + 1)));
    const [lng, lat] = routeCoordinates[index];
    
    lights.push({
      id: `estimated-${i}`,
      name: `Traffic Signal #${i}`,
      location: `Route Point ${Math.floor(index/routeCoordinates.length * 100)}%`,
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

// Calculate the distance from a point to a line segment (used for determining if traffic lights are on route)
// This is a more accurate implementation to ensure traffic signals are truly on the route
function getDistanceFromPointToLineSegment(
  pointLat: number, pointLng: number, 
  lineLat1: number, lineLng1: number, 
  lineLat2: number, lineLng2: number
): number {
  // First convert coordinates to a flat projection for more accurate Euclidean distance measurements
  // This uses a simple equirectangular approximation which is good enough for short distances
  const earth_radius = 6371000; // meters
  
  // Convert latitude and longitude to radians
  const lat1_rad = deg2rad(lineLat1);
  const lon1_rad = deg2rad(lineLng1);
  const lat2_rad = deg2rad(lineLat2);
  const lon2_rad = deg2rad(lineLng2);
  const point_lat_rad = deg2rad(pointLat);
  const point_lon_rad = deg2rad(pointLng);
  
  // Convert to flat coordinates (x = longitude, y = latitude) 
  // Scale by cos(latitude) to account for longitude convergence at poles
  const x1 = earth_radius * lon1_rad * Math.cos(lat1_rad);
  const y1 = earth_radius * lat1_rad;
  
  const x2 = earth_radius * lon2_rad * Math.cos(lat2_rad);
  const y2 = earth_radius * lat2_rad;
  
  const x = earth_radius * point_lon_rad * Math.cos(point_lat_rad);
  const y = earth_radius * point_lat_rad;
  
  // Now use standard point-to-line-segment distance formula in 2D space
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  
  // Handle degenerate case where the segment is actually a point
  if (len_sq == 0) return Math.sqrt(A * A + B * B);
  
  let param = dot / len_sq;
  
  // Find the nearest point on the segment
  let xx, yy;
  
  // Clamp param to the segment
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  // Calculate distance to the nearest point
  const dx = x - xx;
  const dy = y - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
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
