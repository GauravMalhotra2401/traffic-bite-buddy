import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import '../styles/RouteManager.css';

// Mapbox access token - replace with your own from mapbox.com
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

const RouteManager = () => {
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const startMarker = useRef(null);
  const endMarker = useRef(null);
  const routeLine = useRef(null);
  const trafficLights = useRef([]);

  // Initialize map
  useEffect(() => {
    if (map.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40], // Default center (will be updated with user location)
      zoom: 9
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    
    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    
    map.current.addControl(geolocate, 'bottom-right');
    
    // Try to get user location when map loads
    map.current.on('load', () => {
      geolocate.trigger();
      
      // Listen for the geolocate event
      geolocate.on('geolocate', (e) => {
        const { longitude, latitude } = e.coords;
        reverseGeocode(longitude, latitude);
      });
    });
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Handle location input changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (startPoint.length > 2) {
        fetchSuggestions(startPoint, setStartSuggestions);
      } else {
        setStartSuggestions([]);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [startPoint]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (endPoint.length > 2) {
        fetchSuggestions(endPoint, setEndSuggestions);
      } else {
        setEndSuggestions([]);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [endPoint]);
  
  const fetchSuggestions = async (query, setSuggestions) => {
    if (query.length < 3) return;
    
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
        {
          params: {
            access_token: mapboxgl.accessToken,
            autocomplete: true,
            limit: 5
          }
        }
      );
      
      if (response.data && response.data.features) {
        setSuggestions(response.data.features);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };
  
  const reverseGeocode = async (longitude, latitude) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
        {
          params: {
            access_token: mapboxgl.accessToken,
            limit: 1
          }
        }
      );
      
      if (response.data && response.data.features && response.data.features.length > 0) {
        setStartPoint(response.data.features[0].place_name);
      }
    } catch (err) {
      console.error('Error reverse geocoding:', err);
    }
  };
  
  const selectSuggestion = (suggestion, setLocation, setSuggestions) => {
    setLocation(suggestion.place_name);
    setSuggestions([]);
  };
  
  const calculateRoute = async (e) => {
    e.preventDefault();
    
    if (!startPoint || !endPoint) {
      setError('Please enter both start and end points');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Geocode start point
      const startResponse = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(startPoint)}.json`,
        {
          params: {
            access_token: mapboxgl.accessToken,
            limit: 1
          }
        }
      );
      
      // Geocode end point
      const endResponse = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endPoint)}.json`,
        {
          params: {
            access_token: mapboxgl.accessToken,
            limit: 1
          }
        }
      );
      
      if (!startResponse.data.features.length || !endResponse.data.features.length) {
        throw new Error('Could not find one or both locations');
      }
      
      const startCoords = startResponse.data.features[0].center;
      const endCoords = endResponse.data.features[0].center;
      
      // Get directions
      const directionsResponse = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}`,
        {
          params: {
            access_token: mapboxgl.accessToken,
            geometries: 'geojson',
            overview: 'full',
            steps: true
          }
        }
      );
      
      if (!directionsResponse.data.routes || !directionsResponse.data.routes.length) {
        throw new Error('No route found between these locations');
      }
      
      const route = directionsResponse.data.routes[0];
      
      // Display route on map
      displayRoute(startCoords, endCoords, route);
      
      // Calculate traffic lights (mock data based on distance)
      const distance = route.distance / 1000; // Convert to km
      const duration = Math.round(route.duration / 60); // Convert to minutes
      const trafficSignals = Math.max(1, Math.floor(distance / 2)); // Approximately 1 signal every 2km
      
      setRouteInfo({
        distance: distance.toFixed(1),
        duration: duration,
        trafficSignals: trafficSignals
      });
      
    } catch (err) {
      console.error('Error calculating route:', err);
      setError('Failed to calculate route: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const displayRoute = (startCoords, endCoords, route) => {
    if (!map.current) return;
    
    // Remove previous markers and route
    if (startMarker.current) startMarker.current.remove();
    if (endMarker.current) endMarker.current.remove();
    
    // Remove previous traffic lights
    trafficLights.current.forEach(marker => marker.remove());
    trafficLights.current = [];
    
    // Add start marker
    startMarker.current = new mapboxgl.Marker({ color: '#4285F4' })
      .setLngLat(startCoords)
      .addTo(map.current);
    
    // Add end marker
    endMarker.current = new mapboxgl.Marker({ color: '#EA4335' })
      .setLngLat(endCoords)
      .addTo(map.current);
    
    // Add route to map
    if (map.current.getSource('route')) {
      map.current.getSource('route').setData({
        type: 'Feature',
        properties: {},
        geometry: route.geometry
      });
    } else {
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        }
      });
      
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#4285F4',
          'line-width': 6,
          'line-opacity': 0.8
        }
      });
    }
    
    // Add traffic lights (mock data)
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
          const color = status === 'red' ? '#EA4335' : status === 'yellow' ? '#FBBC05' : '#34A853';
          
          // Create custom element for traffic light
          const el = document.createElement('div');
          el.className = 'traffic-light-marker';
          el.style.backgroundColor = color;
          el.title = `Traffic Light ${i}: ${status.toUpperCase()}`;
          
          // Add marker to map
          const marker = new mapboxgl.Marker(el)
            .setLngLat(coordinates[index])
            .setPopup(new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<h3>Traffic Light ${i}</h3><p>Status: ${status.toUpperCase()}</p>`))
            .addTo(map.current);
          
          trafficLights.current.push(marker);
        }
      }
    }
    
    // Fit map to show the entire route
    const bounds = new mapboxgl.LngLatBounds()
      .extend(startCoords)
      .extend(endCoords);
    
    // Extend bounds to include all coordinates
    coordinates.forEach(coord => {
      bounds.extend(coord);
    });
    
    map.current.fitBounds(bounds, {
      padding: 50,
      duration: 1000
    });
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
                        key={suggestion.id} 
                        onClick={() => selectSuggestion(suggestion, setStartPoint, setStartSuggestions)}
                      >
                        {suggestion.place_name}
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
                        key={suggestion.id} 
                        onClick={() => selectSuggestion(suggestion, setEndPoint, setEndSuggestions)}
                      >
                        {suggestion.place_name}
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
        </div>
        
        <div className="map-wrapper">
          <div ref={mapContainer} className="map-container"></div>
        </div>
      </div>
    </div>
  );
};

export default RouteManager;