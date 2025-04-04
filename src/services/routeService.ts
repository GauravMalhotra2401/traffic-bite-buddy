
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

interface RouteData {
  distance: number; // in meters
  duration: number; // in seconds
  trafficLights: TrafficLight[];
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

// Open Route Service API
const ORS_API_KEY = "YOUR_OPEN_ROUTE_SERVICE_API_KEY"; // This should come from environment variables
const ORS_API_URL = "https://api.openrouteservice.org/v2/directions/driving-car";

export async function getRoute(
  startCoordinates: Coordinates,
  endCoordinates: Coordinates
): Promise<RouteData | null> {
  try {
    // In a real implementation, this would make an actual API call to Open Route Service
    // For now, we'll simulate a response
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, we'll randomly select traffic lights that would be on the route
    const randomTrafficLights = [...trafficLightDatabase]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 2);
    
    // Calculate mock distance and duration
    const distance = Math.floor(Math.random() * 20000) + 10000; // 10-30 km
    const duration = Math.floor(distance / 10) + 600; // Simple calculation for demo
    
    return {
      distance,
      duration,
      trafficLights: randomTrafficLights
    };
  } catch (error) {
    console.error("Error fetching route:", error);
    toast.error("Failed to calculate route. Please try again.");
    return null;
  }
}

// Function to geocode addresses (convert text to coordinates)
// In a real app, this would use a geocoding API
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For demo purposes, return randomized coordinates near Bangalore, India
    const baseCoordinates = { lng: 77.5946, lat: 12.9716 }; // Approximate center of Bangalore
    const randomOffset = () => (Math.random() - 0.5) * 0.1; // +/- 0.05 degrees
    
    return {
      lng: baseCoordinates.lng + randomOffset(),
      lat: baseCoordinates.lat + randomOffset()
    };
  } catch (error) {
    console.error("Error geocoding address:", error);
    toast.error("Failed to find location. Please check the address and try again.");
    return null;
  }
}
