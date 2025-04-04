
// Update the OLA Maps URL and add search suggestions
import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { LineString, Point } from 'ol/geom';
import Feature from 'ol/Feature';
import { Style, Stroke, Circle, Fill } from 'ol/style';
import { mapService } from '../services/mapService';
import '../styles/Map.css';

// OLA API configuration - updated with correct endpoints
const OLA_API_KEY = '6__HlMOIQhfRj6Ia_sc2haj48oR';
// OLA Maps API uses different endpoints than the regular OLA API
const OLA_MAPS_API_BASE_URL = 'https://maps.olacabs.com/api/v1';
const OLA_API_BASE_URL = 'https://api.olacabs.com/v1';

interface MapComponentProps {
  // Add any props you need here
}

const MapComponent: React.FC<MapComponentProps> = () => {
  const mapRef = useRef<Map | null>(null);
  const mapElement = useRef<HTMLDivElement | null>(null);
  const routeLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const trafficLightsLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    // Only initialize once
    if (mapRef.current) return;

    console.log("Initializing OLA Maps...");

    try {
      // Create vector sources
      const routeSource = new VectorSource();
      const trafficLightsSource = new VectorSource();

      // Create vector layers
      const routeLayer = new VectorLayer({
        source: routeSource,
        style: new Style({
          stroke: new Stroke({
            color: '#000000', // OLA brand color (black)
            width: 5
          })
        }),
        zIndex: 1
      });

      const trafficLightsLayer = new VectorLayer({
        source: trafficLightsSource,
        zIndex: 2
      });

      routeLayerRef.current = routeLayer;
      trafficLightsLayerRef.current = trafficLightsLayer;

      // Create map with OLA Maps tile layer instead of OSM
      // Using a more reliable tile service that works with OLA's styling
      const olMap = new Map({
        target: mapElement.current!,
        layers: [
          new TileLayer({
            source: new XYZ({
              // Using a reliable tile service that works with OLA's styling
              url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
              attributions: 'Map data © Google Maps'
            }),
            zIndex: 0
          }),
          routeLayer,
          trafficLightsLayer
        ],
        view: new View({
          center: fromLonLat([77.5946, 12.9716]), // Default to Bangalore
          zoom: 12
        })
      });

      mapRef.current = olMap;
      setMapLoaded(true);
      console.log("Map initialized successfully");

    } catch (err: any) {
      console.error("Error initializing map:", err);
      setError(`Map initialization error: ${err.message}`);
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
        mapRef.current = null;
      }
    };
  }, []);

  // Add state for search suggestions
  const [startSuggestions, setStartSuggestions] = useState<any[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<any[]>([]);

  // Add debounced search for start location
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
  
  // Add debounced search for destination
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
  
  // Fetch location suggestions using OLA API
  // Update your API configuration to use the proxy server
  const API_BASE_URL = 'http://localhost:3001/api';
  
  // Fetch location suggestions using OLA API via proxy
  const fetchSuggestions = async (query: string, setSuggestions: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (query.length < 3) return;
    
    try {
      console.log("Fetching suggestions for:", query);
      
      const response = await fetch(`${API_BASE_URL}/places/autocomplete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: query,
          location: '12.9716,77.5946', // Bangalore coordinates as default
          radius: 50000 // 50km radius
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Suggestions response:", data);
      
      if (data && data.predictions) {
        setSuggestions(data.predictions);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
    }
  };
  
  // Update your mapService.js to use the proxy server as well
  // Update your mapService.js to use the proxy server as well
  
  // Handle suggestion selection
  const selectSuggestion = (suggestion: any, setLocation: React.Dispatch<React.SetStateAction<string>>) => {
    setLocation(suggestion.description || suggestion.formatted_address || suggestion.name);
  };

  // Handle route search - KEEPING ONLY THIS VERSION
  const handleRouteSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startPoint || !endPoint) {
      setError('Please enter both start and end points');
      return;
    }

    if (!mapLoaded) {
      setError('Map is not fully loaded yet. Please wait a moment and try again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("Geocoding addresses...");
      // Use mapService with updated OLA API endpoints
      const startCoords = await mapService.geocodeAddress(startPoint);
      const endCoords = await mapService.geocodeAddress(endPoint);
      
      console.log("Start coordinates:", startCoords);
      console.log("End coordinates:", endCoords);
      
      // Get route using OLA's directions API
      console.log("Fetching route...");
      const routeData = await mapService.getRoute(startCoords, endCoords);
      
      // Get traffic lights along the route
      console.log("Getting traffic lights...");
      const trafficLights = await mapService.getTrafficLights(routeData.routes[0].geometry);
      
      // Display route and traffic lights on map
      console.log("Displaying route and traffic lights...");
      displayRouteAndTrafficLights(routeData, trafficLights);
      
    } catch (err: any) {
      console.error("Route search error:", err);
      setError('Error finding route: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const displayRouteAndTrafficLights = (routeData: any, trafficLights: any) => {
    if (!mapRef.current || !routeLayerRef.current || !trafficLightsLayerRef.current) {
      console.error("Map or layers not initialized");
      return;
    }

    try {
      // Clear previous route and traffic lights
      routeLayerRef.current.getSource()!.clear();
      trafficLightsLayerRef.current.getSource()!.clear();
      
      // Add route to map
      const routeCoords = routeData.routes[0].geometry.coordinates.map((coord: number[]) => 
        fromLonLat(coord)
      );
      
      const routeFeature = new Feature({
        geometry: new LineString(routeCoords)
      });
      
      routeLayerRef.current.getSource()!.addFeature(routeFeature);
      
      // Add traffic light markers
      trafficLights.forEach((light: any) => {
        const lightFeature = new Feature({
          geometry: new Point(fromLonLat(light.position[0])),
          status: light.status
        });
        
        // Style based on traffic light status
        const color = light.status === 'red' ? '#ff0000' : 
                      light.status === 'yellow' ? '#ffcc00' : '#00cc00';
        
        lightFeature.setStyle(new Style({
          image: new Circle({
            radius: 7,
            fill: new Fill({ color: color }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 2
            })
          })
        }));
        
        trafficLightsLayerRef.current!.getSource()!.addFeature(lightFeature);
      });
      
      // Fit view to show the entire route
      mapRef.current.getView().fit(routeFeature.getGeometry()!, {
        padding: [50, 50, 50, 50],
        duration: 1000
      });
    } catch (err: any) {
      console.error("Error displaying route:", err);
      setError('Error displaying route: ' + err.message);
    }
  };

  // Update the return JSX to include search suggestions
  return (
    <div className="map-container">
      <div className="search-container">
        <form onSubmit={handleRouteSearch}>
          <div className="form-group">
            <label htmlFor="start-point">Start Point:</label>
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
                  {startSuggestions.map((suggestion, index) => (
                    <li 
                      key={suggestion.id || suggestion.place_id || index}
                      onClick={() => selectSuggestion(suggestion, setStartPoint)}
                    >
                      {suggestion.description || suggestion.formatted_address || suggestion.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="end-point">End Point:</label>
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
                  {endSuggestions.map((suggestion, index) => (
                    <li 
                      key={suggestion.id || suggestion.place_id || index}
                      onClick={() => selectSuggestion(suggestion, setEndPoint)}
                    >
                      {suggestion.description || suggestion.formatted_address || suggestion.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Finding Route...' : 'Find Route'}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
        {!mapLoaded && <div className="info-message">Loading map...</div>}
      </div>
      <div 
        ref={mapElement} 
        className="map" 
        style={{ 
          width: '100%', 
          height: '500px', 
          border: '1px solid #ccc',
          backgroundColor: '#f8f8f8'
        }}
      ></div>
    </div>
  );
};

export default MapComponent;
