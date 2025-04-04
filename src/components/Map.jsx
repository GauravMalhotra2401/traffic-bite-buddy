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

const MapComponent = ({ startPoint, endPoint, onRouteFound }) => {
  const mapRef = useRef(null);
  const mapElement = useRef(null);
  const routeLayerRef = useRef(null);
  const trafficLightsLayerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
        target: mapElement.current,
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
      
      // Force map to update its size after rendering
      setTimeout(() => {
        if (olMap) {
          olMap.updateSize();
          console.log("Map size updated");
          setMapLoaded(true);
        }
      }, 300);

    } catch (err) {
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

  // Find route when startPoint and endPoint change
  useEffect(() => {
    if (!mapLoaded || !startPoint || !endPoint) return;
    
    const findRoute = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Geocode start and end points
        const startCoords = await mapService.geocodeAddress(startPoint);
        const endCoords = await mapService.geocodeAddress(endPoint);
        
        console.log("Start coordinates:", startCoords);
        console.log("End coordinates:", endCoords);
        
        // Get route
        const routeData = await mapService.getRoute(startCoords, endCoords);
        
        // Get traffic lights along the route
        const trafficLights = await mapService.getTrafficLights(routeData.routes[0].geometry);
        
        // Display route and traffic lights on map
        displayRouteAndTrafficLights(routeData, trafficLights);
        
        // Send data back to parent component
        if (onRouteFound) {
          onRouteFound({
            distance: (routeData.routes[0].summary.distance / 1000).toFixed(1),
            duration: Math.round(routeData.routes[0].summary.duration / 60)
          }, trafficLights);
        }
        
      } catch (err) {
        setError('Error finding route: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    findRoute();
  }, [mapLoaded, startPoint, endPoint, onRouteFound]);

  const displayRouteAndTrafficLights = (routeData, trafficLights) => {
    if (!mapRef.current || !routeLayerRef.current || !trafficLightsLayerRef.current) {
      console.error("Map or layers not initialized");
      setError("Map not fully initialized. Please refresh the page and try again.");
      return;
    }
  
    try {
      // Clear previous route and traffic lights
      routeLayerRef.current.getSource().clear();
      trafficLightsLayerRef.current.getSource().clear();
      
      // Validate route data
      if (!routeData.routes || !routeData.routes[0] || !routeData.routes[0].geometry || 
          !routeData.routes[0].geometry.coordinates || routeData.routes[0].geometry.coordinates.length === 0) {
        throw new Error('Invalid route data structure');
      }
      
      // Add route to map
      const routeCoords = routeData.routes[0].geometry.coordinates.map(coord => {
        if (!Array.isArray(coord) || coord.length < 2) {
          throw new Error('Invalid coordinate format in route data');
        }
        return fromLonLat(coord);
      });
      
      const routeFeature = new Feature({
        geometry: new LineString(routeCoords)
      });
      
      routeLayerRef.current.getSource().addFeature(routeFeature);
      
      // Add traffic light markers
      if (Array.isArray(trafficLights)) {
        trafficLights.forEach((light) => {
          if (!light.position || !Array.isArray(light.position[0])) {
            console.warn("Invalid traffic light position:", light);
            return; // Skip this traffic light
          }
          
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
          
          trafficLightsLayerRef.current.getSource().addFeature(lightFeature);
        });
      }
      
      // Fit view to show the entire route
      mapRef.current.getView().fit(routeFeature.getGeometry(), {
        padding: [50, 50, 50, 50],
        duration: 1000
      });
    } catch (err) {
      console.error("Error displaying route:", err);
      setError('Error displaying route: ' + err.message);
    }
  };

  return (
    <div className="map-container">
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
      {!mapLoaded && <div className="map-loading-overlay">Loading map...</div>}
      {loading && <div className="map-loading-overlay">Finding route...</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default MapComponent;