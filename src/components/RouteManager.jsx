import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/RouteManager.css';

// OLA API configuration
// Update the OLA API configuration
const OLA_API_KEY = '6__HlMOIQhfRj6Ia_sc2haj48oR';
// Use local proxy server
const OLA_API_BASE_URL = 'http://localhost:5000/api/ola';
const FALLBACK_API_URL = 'http://localhost:5000/api/fallback';

// Later in the calculateRoute function:
const calculateRoute = async (e) => {
  e.preventDefault();
  
  if (!startPoint || !endPoint) {
    setError('Please enter both start and end points');
    return;
  }
  
  if (!startCoords || !endCoords) {
    setError('Please select valid locations from the suggestions');
    return;
  }
  
  setLoading(true);
  setError(null);
  
  try {
    // Try to get route from OLA API through our proxy
    const routeResponse = await axios.get(
      `${OLA_API_BASE_URL}/directions`,
      {
        params: {
          origin: `${startCoords.lat},${startCoords.lng}`,
          destination: `${endCoords.lat},${endCoords.lng}`,
          mode: 'driving'
        },
        headers: {
          'Authorization': OLA_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 8000 // 8 second timeout
      }
    );
    
    // Process the response as before
    // ...
  } catch (err) {
    console.error('Error calculating route:', err);
    
    // Try fallback API
    try {
      const fallbackResponse = await axios.get(
        `${FALLBACK_API_URL}/directions`,
        {
          params: {
            origin: `${startCoords.lng},${startCoords.lat}`,
            destination: `${endCoords.lng},${endCoords.lat}`
          }
        }
      );
      
      if (fallbackResponse.data && fallbackResponse.data.routes && fallbackResponse.data.routes.length > 0) {
        const route = fallbackResponse.data.routes[0];
        
        // Display route on map
        displayRoute(route);
        
        // Set route info
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1), // Convert to km
          duration: Math.round(route.duration / 60), // Convert to minutes
          trafficSignals: route.traffic_signals || Math.floor(route.distance / 2000) // Use API data or estimate
        });
        
        // Set cab options with simulated data
        setCabOptions([
          {
            id: 'mini',
            display_name: 'OLA Mini',
            currency: 'INR',
            estimate: Math.round((route.distance / 1000) * 10 + 50),
            duration: Math.round(route.duration / 60),
            distance: (route.distance / 1000).toFixed(1)
          },
          {
            id: 'sedan',
            display_name: 'OLA Prime Sedan',
            currency: 'INR',
            estimate: Math.round((route.distance / 1000) * 15 + 100),
            duration: Math.round(route.duration / 60),
            distance: (route.distance / 1000).toFixed(1)
          },
          {
            id: 'suv',
            display_name: 'OLA Prime SUV',
            currency: 'INR',
            estimate: Math.round((route.distance / 1000) * 20 + 150),
            duration: Math.round(route.duration / 60),
            distance: (route.distance / 1000).toFixed(1)
          }
        ]);
      } else {
        throw new Error('No route found in fallback response');
      }
    } catch (fallbackErr) {
      console.error('Fallback route calculation failed:', fallbackErr);
      setError('Failed to calculate route. Please try again later.');
      
      // Use local calculation as last resort
      simulateRouteData();
    }
  } finally {
    setLoading(false);
  }
};

const RouteManager = () => {
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [cabOptions, setCabOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  
  const mapContainer = useRef(null);
  const olaMapInstance = useRef(null);

  // Initialize OLA map on component mount
  useEffect(() => {
    // Load OLA Maps SDK
    const script = document.createElement('script');
    script.src = `https://api.olacabs.com/maps/v1/js?key=${OLA_API_KEY}`;
    script.async = true;
    
    script.onload = () => {
      if (window.OlaMaps && mapContainer.current) {
        olaMapInstance.current = new window.OlaMaps.Map({
          container: mapContainer.current,
          style: 'ola-streets-v1',
          center: [77.5946, 12.9716], // Bangalore coordinates
          zoom: 12
        });
        
        // Add navigation controls
        olaMapInstance.current.addControl(new window.OlaMaps.NavigationControl());
        
        // Add geolocation control
        const geolocateControl = new window.OlaMaps.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        });
        
        olaMapInstance.current.addControl(geolocateControl);
        
        // Get user's current location when map loads
        olaMapInstance.current.on('load', () => {
          geolocateControl.trigger();
          
          geolocateControl.on('geolocate', (e) => {
            const { longitude, latitude } = e.coords;
            fetchCurrentLocation(longitude, latitude);
          });
        });
      }
    };
    
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  // Fetch current location details
  const fetchCurrentLocation = async (longitude, latitude) => {
    try {
      const response = await axios.get(
        `${OLA_API_BASE_URL}/geocode/reverse`,
        {
          params: {
            lat: latitude,
            lng: longitude
          },
          headers: {
            'Authorization': `Bearer ${OLA_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.address) {
        setStartPoint(response.data.address);
        setStartCoords({ lat: latitude, lng: longitude });
      }
    } catch (err) {
      console.error('Error fetching current location:', err);
    }
  };
  
  // Handle location input changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (startPoint.length > 2) {
        fetchLocationSuggestions(startPoint, setStartSuggestions);
      } else {
        setStartSuggestions([]);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [startPoint]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (endPoint.length > 2) {
        fetchLocationSuggestions(endPoint, setEndSuggestions);
      } else {
        setEndSuggestions([]);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [endPoint]);
  
  // Fetch location suggestions from OLA API
  const fetchLocationSuggestions = async (query, setSuggestions) => {
    if (query.length < 3) return;
    
    try {
      const response = await axios.get(
        `${OLA_API_BASE_URL}/autocomplete`,
        {
          params: {
            query: query,
            limit: 5
          },
          headers: {
            'Authorization': `Bearer ${OLA_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.predictions) {
        setSuggestions(response.data.predictions);
      }
    } catch (err) {
      console.error('Error fetching location suggestions:', err);
      
      // Simulate suggestions for testing if API fails
      const mockSuggestions = [
        { id: '1', description: `${query} - Location 1`, place_id: 'place1' },
        { id: '2', description: `${query} - Location 2`, place_id: 'place2' },
        { id: '3', description: `${query} - Location 3`, place_id: 'place3' }
      ];
      setSuggestions(mockSuggestions);
    }
  };
  
  // Handle suggestion selection
  const selectSuggestion = async (suggestion, setLocation, setSuggestions, isStart) => {
    setLocation(suggestion.description || suggestion.formatted_address);
    setSuggestions([]);
    
    try {
      // Get coordinates for the selected place
      const response = await axios.get(
        `${OLA_API_BASE_URL}/place/details`,
        {
          params: {
            place_id: suggestion.place_id
          },
          headers: {
            'Authorization': `Bearer ${OLA_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.result && response.data.result.geometry) {
        const coords = {
          lat: response.data.result.geometry.location.lat,
          lng: response.data.result.geometry.location.lng
        };
        
        if (isStart) {
          setStartCoords(coords);
        } else {
          setEndCoords(coords);
        }
        
        // Add marker to map
        if (olaMapInstance.current) {
          // Remove existing markers
          const markers = document.querySelectorAll(isStart ? '.start-marker' : '.end-marker');
          markers.forEach(marker => marker.remove());
          
          // Add new marker
          new window.OlaMaps.Marker({
            element: createMarkerElement(isStart ? 'start-marker' : 'end-marker', isStart ? '#4285F4' : '#EA4335')
          })
            .setLngLat([coords.lng, coords.lat])
            .addTo(olaMapInstance.current);
          
          // Center map on the selected location
          olaMapInstance.current.flyTo({
            center: [coords.lng, coords.lat],
            zoom: 14
          });
        }
      }
    } catch (err) {
      console.error('Error getting place details:', err);
      
      // Simulate coordinates for testing if API fails
      const mockCoords = { lat: 12.9716 + Math.random() * 0.1, lng: 77.5946 + Math.random() * 0.1 };
      
      if (isStart) {
        setStartCoords(mockCoords);
      } else {
        setEndCoords(mockCoords);
      }
    }
  };
  
  // Create custom marker element
  const createMarkerElement = (className, color) => {
    const el = document.createElement('div');
    el.className = `marker ${className}`;
    el.style.backgroundColor = color;
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
    return el;
  };
  
  // Calculate route between start and end points
  const calculateRoute = async (e) => {
    e.preventDefault();
    
    if (!startPoint || !endPoint) {
      setError('Please enter both start and end points');
      return;
    }
    
    if (!startCoords || !endCoords) {
      setError('Please select valid locations from the suggestions');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get route from OLA API
      const routeResponse = await axios.get(
        `${OLA_API_BASE_URL}/directions`,
        {
          params: {
            origin: `${startCoords.lat},${startCoords.lng}`,
            destination: `${endCoords.lat},${endCoords.lng}`,
            mode: 'driving'
          },
          headers: {
            'Authorization': `Bearer ${OLA_API_KEY}`,
            'Content-Type': 'application/json',
            // Remove User-Agent header to avoid CORS issues
          }
        }
      );
      
      // Get ride estimates from OLA API
      const rideResponse = await axios.get(
        `${OLA_API_BASE_URL}/products`,
        {
          params: {
            pickup_lat: startCoords.lat,
            pickup_lng: startCoords.lng,
            drop_lat: endCoords.lat,
            drop_lng: endCoords.lng
          },
          headers: {
            'Authorization': `Bearer ${OLA_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (routeResponse.data && routeResponse.data.routes && routeResponse.data.routes.length > 0) {
        const route = routeResponse.data.routes[0];
        
        // Display route on map
        displayRoute(route);
        
        // Set route info
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1), // Convert to km
          duration: Math.round(route.duration / 60), // Convert to minutes
          trafficSignals: route.traffic_signals || Math.floor(route.distance / 2000) // Use API data or estimate
        });
        
        // Set cab options
        if (rideResponse.data && rideResponse.data.ride_estimate) {
          setCabOptions(rideResponse.data.ride_estimate);
        } else {
          // Fallback to simulated data
          setCabOptions([
            {
              id: 'mini',
              display_name: 'OLA Mini',
              currency: 'INR',
              estimate: Math.round((route.distance / 1000) * 10 + 50), // Base fare + per km charge
              duration: Math.round(route.duration / 60),
              distance: (route.distance / 1000).toFixed(1)
            },
            {
              id: 'sedan',
              display_name: 'OLA Prime Sedan',
              currency: 'INR',
              estimate: Math.round((route.distance / 1000) * 15 + 100),
              duration: Math.round(route.duration / 60),
              distance: (route.distance / 1000).toFixed(1)
            },
            {
              id: 'suv',
              display_name: 'OLA Prime SUV',
              currency: 'INR',
              estimate: Math.round((route.distance / 1000) * 20 + 150),
              duration: Math.round(route.duration / 60),
              distance: (route.distance / 1000).toFixed(1)
            }
          ]);
        }
      } else {
        throw new Error('No route found between these locations');
      }
    } catch (err) {
      console.error('Error calculating route:', err);
      setError('Failed to calculate route: ' + (err.response?.data?.message || err.message));
      
      // Simulate route data for testing if API fails
      simulateRouteData();
    } finally {
      setLoading(false);
    }
  };
  
  // Display route on map
  const displayRoute = (route) => {
    if (!olaMapInstance.current || !window.OlaMaps) return;
    
    // Remove existing route
    if (olaMapInstance.current.getLayer('route-line')) {
      olaMapInstance.current.removeLayer('route-line');
    }
    
    if (olaMapInstance.current.getSource('route')) {
      olaMapInstance.current.removeSource('route');
    }
    
    // Add route to map
    olaMapInstance.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: route.geometry
      }
    });
    
    olaMapInstance.current.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#000',
        'line-width': 6,
        'line-opacity': 0.8
      }
    });
    
    // Add traffic lights
    addTrafficLights(route);
    
    // Fit map to show the entire route
    const bounds = new window.OlaMaps.LngLatBounds()
      .extend([startCoords.lng, startCoords.lat])
      .extend([endCoords.lng, endCoords.lat]);
    
    // Extend bounds to include all coordinates in the route
    if (route.geometry && route.geometry.coordinates) {
      route.geometry.coordinates.forEach(coord => {
        bounds.extend(coord);
      });
    }
    
    olaMapInstance.current.fitBounds(bounds, {
      padding: 50,
      duration: 1000
    });
  };
  
  // Add traffic lights to the map
  const addTrafficLights = (route) => {
    // Remove existing traffic lights
    const trafficLights = document.querySelectorAll('.traffic-light-marker');
    trafficLights.forEach(light => light.remove());
    
    // Add traffic lights from API or simulate them
    const lights = route.traffic_signals || [];
    
    if (lights.length === 0 && route.geometry && route.geometry.coordinates) {
      // Simulate traffic lights if none provided by API
      const coordinates = route.geometry.coordinates;
      const numLights = Math.max(1, Math.floor(route.distance / 2000)); // 1 light every 2km
      
      if (numLights > 0 && coordinates.length > 0) {
        const step = Math.floor(coordinates.length / (numLights + 1));
        
        for (let i = 1; i <= numLights; i++) {
          const index = i * step;
          if (index < coordinates.length) {
            // Randomly assign status
            const statuses = ['red', 'yellow', 'green'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            lights.push({
              location: coordinates[index],
              status: status
            });
          }
        }
      }
    }
    
    // Add traffic lights to map
    lights.forEach((light, index) => {
      const location = light.location || [light.lng, light.lat];
      const status = light.status || 'red';
      const color = status === 'red' ? '#EA4335' : status === 'yellow' ? '#FBBC05' : '#34A853';
      
      // Create custom element for traffic light
      const el = document.createElement('div');
      el.className = 'traffic-light-marker';
      el.style.backgroundColor = color;
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
      
      // Add marker to map
      new window.OlaMaps.Marker({ element: el })
        .setLngLat(location)
        .setPopup(new window.OlaMaps.Popup({ offset: 25 })
          .setHTML(`<h3>Traffic Light ${index + 1}</h3><p>Status: ${status.toUpperCase()}</p>`))
        .addTo(olaMapInstance.current);
    });
  };
  
  // Simulate route data for testing
  const simulateRouteData = () => {
    if (!startCoords || !endCoords) return;
    
    // Calculate straight-line distance
    const distance = calculateDistance(
      startCoords.lat, startCoords.lng,
      endCoords.lat, endCoords.lng
    );
    
    // Estimate duration (3 minutes per km)
    const duration = Math.round(distance * 3);
    
    // Create a simple route geometry (straight line)
    const route = {
      distance: distance * 1000, // Convert to meters
      duration: duration * 60, // Convert to seconds
      geometry: {
        type: 'LineString',
        coordinates: [
          [startCoords.lng, startCoords.lat],
          [endCoords.lng, endCoords.lat]
        ]
      }
    };
    
    // Display route on map
    displayRoute(route);
    
    // Set route info
    setRouteInfo({
      distance: distance.toFixed(1),
      duration: duration,
      trafficSignals: Math.max(1, Math.floor(distance / 2))
    });
    
    // Set cab options
    setCabOptions([
      {
        id: 'mini',
        display_name: 'OLA Mini',
        currency: 'INR',
        estimate: Math.round(distance * 10 + 50),
        duration: duration,
        distance: distance.toFixed(1)
      },
      {
        id: 'sedan',
        display_name: 'OLA Prime Sedan',
        currency: 'INR',
        estimate: Math.round(distance * 15 + 100),
        duration: duration,
        distance: distance.toFixed(1)
      },
      {
        id: 'suv',
        display_name: 'OLA Prime SUV',
        currency: 'INR',
        estimate: Math.round(distance * 20 + 150),
        duration: duration,
        distance: distance.toFixed(1)
      }
    ]);
  };
  
  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  // Book a ride
  const bookRide = async (cabId) => {
    try {
      setLoading(true);
      
      // Call OLA API to book a ride
      const response = await axios.post(
        `${OLA_API_BASE_URL}/bookings`,
        {
          product_id: cabId,
          pickup: {
            lat: startCoords.lat,
            lng: startCoords.lng,
            address: startPoint
          },
          dropoff: {
            lat: endCoords.lat,
            lng: endCoords.lng,
            address: endPoint
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${OLA_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.booking_id) {
        alert(`Ride booked successfully! Booking ID: ${response.data.booking_id}`);
      } else {
        alert('Ride booking successful!');
      }
    } catch (err) {
      console.error('Error booking ride:', err);
      alert('Failed to book ride: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="route-manager">
      <div className="route-container">
        <div className="route-panel">
          <h2>Plan Your Route</h2>
          <p>Find traffic signals on your route and discover food vendors available at each stop</p>
          
          <form onSubmit={calculateRoute}>
            <div className="form-group">
              <label htmlFor="start-point">Start Location</label>
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  id="start-point"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  placeholder="Enter start address"
                  required
                />
                {startSuggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {startSuggestions.map((suggestion) => (
                      <li 
                        key={suggestion.id || suggestion.place_id} 
                        onClick={() => selectSuggestion(suggestion, setStartPoint, setStartSuggestions, true)}
                      >
                        {suggestion.description || suggestion.formatted_address}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="end-point">Destination</label>
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  id="end-point"
                  value={endPoint}
                  onChange={(e) => setEndPoint(e.target.value)}
                  placeholder="Enter destination address"
                  required
                />
                {endSuggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {endSuggestions.map((suggestion) => (
                      <li 
                        key={suggestion.id || suggestion.place_id} 
                        onClick={() => selectSuggestion(suggestion, setEndPoint, setEndSuggestions, false)}
                      >
                        {suggestion.description || suggestion.formatted_address}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <button type="submit" className="calculate-button" disabled={loading}>
              {loading ? 'Calculating...' : 'Calculate Route'}
            </button>
          </form>
          
          {error && <div className="error-message">{error}</div>}
          
          {routeInfo && (
            <div className="route-info">
              <h3>Route Information</h3>
              <div className="info-item">
                <span className="info-label">Distance:</span>
                <span className="info-value">{routeInfo.distance} km</span>
              </div>
              <div className="info-item">
                <span className="info-label">Estimated time:</span>
                <span className="info-value">{routeInfo.duration} minutes</span>
              </div>
              <div className="info-item">
                <span className="info-label">Traffic signals:</span>
                <span className="info-value">{routeInfo.trafficSignals}</span>
              </div>
            </div>
          )}
          
          {cabOptions.length > 0 && (
            <div className="cab-options">
              <h3>OLA Ride Options</h3>
              {cabOptions.map((option) => (
                <div key={option.id} className="cab-option">
                  <div className="cab-option-header">
                    <span className="cab-name">{option.display_name}</span>
                    <span className="cab-price">{option.currency} {option.estimate}</span>
                  </div>
                  <div className="cab-option-details">
                    <span>{option.duration} min</span>
                    <span>{option.distance} km</span>
                  </div>
                  <button 
                    className="book-cab-button" 
                    onClick={() => bookRide(option.id)}
                    disabled={loading}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="map-wrapper">
          <div ref={mapContainer} className="map-container">
            {!olaMapInstance.current && (
              <div className="map-loading">Loading OLA Maps...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteManager;