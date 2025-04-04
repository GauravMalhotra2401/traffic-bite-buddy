
import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { LineString, Point } from 'ol/geom';
import Feature from 'ol/Feature';
import { Style, Stroke, Circle, Fill } from 'ol/style';
import { mapService } from '../services/mapService';
import '../styles/Map.css';

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

    console.log("Initializing OpenLayers map...");

    try {
      // Create vector sources
      const routeSource = new VectorSource();
      const trafficLightsSource = new VectorSource();

      // Create vector layers
      const routeLayer = new VectorLayer({
        source: routeSource,
        style: new Style({
          stroke: new Stroke({
            color: '#3887be',
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

      // Create map with OSM (OpenStreetMap) layer
      const olMap = new Map({
        target: mapElement.current!,
        layers: [
          new TileLayer({
            source: new OSM(),
            zIndex: 0
          }),
          routeLayer,
          trafficLightsLayer
        ],
        view: new View({
          center: fromLonLat([0, 0]),
          zoom: 2
        })
      });

      mapRef.current = olMap;
      setMapLoaded(true);
      console.log("OpenLayers map initialized successfully");

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
      // Geocode start and end points
      const startCoords = await mapService.geocodeAddress(startPoint);
      const endCoords = await mapService.geocodeAddress(endPoint);
      
      console.log("Start coordinates:", startCoords);
      console.log("End coordinates:", endCoords);
      
      // Get route
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
      setError('Error finding route: ' + (err.response?.data?.error?.message || err.message));
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

  return (
    <div className="map-container">
      <div className="search-container">
        <form onSubmit={handleRouteSearch}>
          <div className="form-group">
            <label htmlFor="start-point">Start Point:</label>
            <input
              type="text"
              id="start-point"
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              placeholder="Enter start address"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="end-point">End Point:</label>
            <input
              type="text"
              id="end-point"
              value={endPoint}
              onChange={(e) => setEndPoint(e.target.value)}
              placeholder="Enter destination address"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Finding Route...' : 'Find Route'}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
        {!mapLoaded && <div className="info-message">Loading map...</div>}
      </div>
      {!mapLoaded && <div className="info-message">Initializing OpenLayers map...</div>}
      {error && <div className="error-message">Map Error: {error}</div>}
      <div 
        ref={mapElement} 
        className="map" 
        style={{ 
          width: '100%', 
          height: '500px', 
          border: '1px solid #ccc',
          backgroundColor: '#f8f8f8'
        }}
        data-map-type="openlayers"
      ></div>
    </div>
  );
};

export default MapComponent;
