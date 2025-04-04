import axios from 'axios';

// OLA API configuration
const OLA_API_KEY = '6__HlMOIQhfRj6Ia_sc2haj48oR';
const OLA_MAPS_API_BASE_URL = 'https://maps.olacabs.com/api/v1';

// Create axios instance with common config for OLA Maps API
const olaMapsApi = axios.create({
  baseURL: OLA_MAPS_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${OLA_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

export const mapService = {
  // Get location suggestions
  async getLocationSuggestions(query) {
    console.log("Fetching suggestions for:", query);
    
    try {
      // Use OLA Maps Places API for autocomplete
      const response = await olaMapsApi.post('/places/autocomplete', {
        input: query,
        location: '12.9716,77.5946', // Bangalore coordinates as default
        radius: 50000, // 50km radius
        language: 'en'
      });
      
      if (response.data && response.data.predictions) {
        return response.data.predictions;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      
      // Fallback to simulated suggestions
      return [
        { description: `${query} - Location 1`, place_id: 'place1' },
        { description: `${query} - Location 2`, place_id: 'place2' },
        { description: `${query} - Location 3`, place_id: 'place3' }
      ];
    }
  },
  
  // Geocode address to coordinates
  async geocodeAddress(address) {
    console.log("Geocoding address:", address);
    
    try {
      // Use OLA Maps Geocoding API
      const response = await olaMapsApi.post('/geocode', {
        address: address
      });
      
      if (response.data && response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        const coordinates = [location.lng, location.lat]; // OpenLayers expects [lon, lat]
        console.log("Geocoded coordinates:", coordinates);
        return coordinates;
      } else {
        throw new Error("No results found for address: " + address);
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      
      // If OLA API fails, try a direct geocoding approach
      try {
        // Try using a more reliable geocoding service
        const backupResponse = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
        );
        
        if (backupResponse.data && backupResponse.data.length > 0) {
          const result = backupResponse.data[0];
          const coordinates = [parseFloat(result.lon), parseFloat(result.lat)];
          console.log("Backup geocoded coordinates:", coordinates);
          return coordinates;
        }
      } catch (backupError) {
        console.error("Backup geocoding also failed:", backupError);
      }
      
      // Fallback to simulated geocoding
      return simulateGeocode(address);
    }
  },
  
  // Get route between two points
  async getRoute(startCoords, endCoords) {
    console.log("Fetching route between", startCoords, "and", endCoords);
    
    try {
      // Use OLA Maps Directions API
      const response = await olaMapsApi.post('/directions', {
        origin: {
          lat: startCoords[1],
          lng: startCoords[0]
        },
        destination: {
          lat: endCoords[1],
          lng: endCoords[0]
        },
        mode: 'driving'
      });
      
      if (response.data && response.data.routes && response.data.routes.length > 0) {
        return response.data;
      } else {
        throw new Error("No routes found");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      
      // Try backup routing service
      try {
        const backupResponse = await axios.get(
          `https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson`
        );
        
        if (backupResponse.data && backupResponse.data.routes && backupResponse.data.routes.length > 0) {
          // Convert OSRM format to our expected format
          const route = backupResponse.data.routes[0];
          
          return {
            routes: [{
              distance: route.distance,
              duration: route.duration,
              geometry: route.geometry
            }]
          };
        }
      } catch (backupError) {
        console.error("Backup routing also failed:", backupError);
      }
      
      // Fallback to simulated route
      return simulateRoute(startCoords, endCoords);
    }
  },
  
  // Get traffic lights along a route
  async getTrafficLights(routeGeometry) {
    try {
      // Use OLA Maps Traffic API
      const response = await olaMapsApi.post('/traffic/signals', {
        path: routeGeometry
      });
      
      if (response.data && response.data.signals) {
        return response.data.signals;
      } else {
        throw new Error("No traffic signals found");
      }
    } catch (error) {
      console.error("Error fetching traffic lights:", error);
      
      // Fallback to simulated traffic lights
      return simulateTrafficLights(routeGeometry);
    }
  }
};

// Simulate geocoding
function simulateGeocode(address) {
  console.log("Using simulated geocoding for:", address);
  
  // Generate coordinates based on address string to ensure consistency
  const hash = address.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Base coordinates (Delhi, India)
  const baseLat = 28.6139;
  const baseLng = 77.2090;
  
  // Add some variation based on the hash
  const lat = baseLat + (hash % 100) / 1000;
  const lng = baseLng + ((hash >> 8) % 100) / 1000;
  
  return [lng, lat]; // OpenLayers expects [lon, lat]
}

// Simulate route
function simulateRoute(startCoords, endCoords) {
  console.log("Using simulated route");
  
  // Calculate distance
  const distance = calculateDistance(
    startCoords[1], startCoords[0], 
    endCoords[1], endCoords[0]
  );
  
  // Estimate duration (3 minutes per km)
  const duration = Math.round(distance * 180); // seconds
  
  // Create a more realistic route with intermediate points
  const numPoints = Math.max(10, Math.round(distance * 2));
  const coordinates = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;
    const lat = startCoords[1] + fraction * (endCoords[1] - startCoords[1]);
    const lng = startCoords[0] + fraction * (endCoords[0] - startCoords[0]);
    
    // Add some randomness to make it look like a real road
    const jitter = 0.001 * Math.sin(i * Math.PI / 5);
    coordinates.push([lng + jitter, lat + jitter]);
  }
  
  return {
    routes: [{
      distance: distance * 1000, // meters
      duration: duration, // seconds
      geometry: {
        type: 'LineString',
        coordinates: coordinates
      }
    }]
  };
}

// Simulate traffic lights
function simulateTrafficLights(routeGeometry) {
  console.log("Using simulated traffic lights");
  
  const trafficLights = [];
  const coordinates = routeGeometry.coordinates;
  
  // Add traffic lights along the route
  if (coordinates && coordinates.length > 1) {
    // Place traffic lights at regular intervals
    const numLights = Math.max(1, Math.floor(coordinates.length / 10));
    const interval = Math.floor(coordinates.length / (numLights + 1));
    
    for (let i = 1; i <= numLights; i++) {
      const index = i * interval;
      if (index < coordinates.length) {
        const statuses = ['red', 'yellow', 'green'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        trafficLights.push({
          position: [coordinates[index]],
          status: status
        });
      }
    }
  }
  
  return trafficLights;
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}