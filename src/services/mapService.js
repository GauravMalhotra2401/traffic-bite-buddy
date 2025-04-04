import axios from 'axios';

// Use a free API key for OpenRouteService
const ORS_API_KEY = '5b3ce3597851110001cf624882d937b658824ad6a2f6c73c1abdbcf2'; 
const ORS_API_URL = 'https://api.openrouteservice.org/v2';

export const mapService = {
  getRoute: async (startCoords, endCoords) => {
    try {
      console.log('Fetching route between', startCoords, 'and', endCoords);
      
      // OpenRouteService expects coordinates in [lon, lat] format
      const response = await axios.post(
        `${ORS_API_URL}/directions/driving-car/geojson`,
        {
          coordinates: [startCoords, endCoords]
        },
        {
          headers: {
            'Authorization': ORS_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json, application/geo+json'
          }
        }
      );
      
      console.log('Raw API response:', response.data);
      
      // Extract the route data in the correct format
      const routeData = {
        routes: [{
          geometry: response.data.features[0].geometry,
          summary: {
            distance: response.data.features[0].properties.summary.distance,
            duration: response.data.features[0].properties.summary.duration
          }
        }]
      };
      
      return routeData;
    } catch (error) {
      console.error('Error fetching route:', error);
      if (error.response) {
        console.error('API error response:', error.response.data);
      }
      throw new Error('Failed to fetch route: ' + (error.response?.data?.error?.message || error.message));
    }
  },

  geocodeAddress: async (address) => {
    try {
      console.log('Geocoding address:', address);
      
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: address,
            format: 'json',
            limit: 1
          },
          headers: {
            'User-Agent': 'TrafficBiteBuddy/1.0'
          }
        }
      );
      
      if (response.data && response.data.length > 0) {
        const coords = [parseFloat(response.data[0].lon), parseFloat(response.data[0].lat)];
        console.log('Geocoded coordinates:', coords);
        return coords;
      }
      throw new Error('No results found for address: ' + address);
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw new Error('Failed to geocode address: ' + error.message);
    }
  },

  getLocationSuggestions: async (query) => {
    try {
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: query,
            format: 'json',
            limit: 5
          },
          headers: {
            'User-Agent': 'TrafficBiteBuddy/1.0'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      return [];
    }
  },

  getTrafficLights: async (routeGeometry) => {
    try {
      console.log('Getting traffic lights for route');
      
      // This is a mock implementation
      const totalPoints = routeGeometry.coordinates.length;
      
      if (totalPoints === 0) {
        return [];
      }
      
      // Create mock traffic lights at different points along the route
      const mockTrafficLights = [];
      
      // Only add traffic lights if we have enough points
      if (totalPoints > 4) {
        mockTrafficLights.push({ 
          position: [routeGeometry.coordinates[Math.floor(totalPoints * 0.25)]], 
          status: 'green' 
        });
        
        mockTrafficLights.push({ 
          position: [routeGeometry.coordinates[Math.floor(totalPoints * 0.5)]], 
          status: 'red' 
        });
        
        mockTrafficLights.push({ 
          position: [routeGeometry.coordinates[Math.floor(totalPoints * 0.75)]], 
          status: 'yellow' 
        });
      }
      
      console.log('Found traffic lights:', mockTrafficLights.length);
      return mockTrafficLights;
    } catch (error) {
      console.error('Error getting traffic lights:', error);
      return [];
    }
  }
};