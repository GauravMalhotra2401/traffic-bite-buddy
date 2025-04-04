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

const MapView = ({ startPoint, endPoint, routeData, trafficLights, error }) => {
  const mapRef = useRef(null);
  const mapElement = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;

    console.log("Initializing OpenLayers map...");

    try {
      // Create map with OSM (OpenStreetMap) layer
      const olMap = new Map({
        target: mapElement.current,
        layers: [
          new TileLayer({
            source: new OSM(),
            zIndex: 0
          })
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
      setMapError(`Map initialization error: ${err.message}`);
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
        mapRef.current = null;
      }
    };
  }, []);

  // Update map when route data changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !startPoint || !endPoint) return;

    // Clear previous layers
    const layers = mapRef.current.getLayers().getArray();
    for (let i = layers.length - 1; i > 0; i--) {
      mapRef.current.removeLayer(layers[i]);
    }

    if (!routeData) return;

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

      // Add layers to map
      mapRef.current.addLayer(routeLayer);
      mapRef.current.addLayer(trafficLightsLayer);

      // Geocode start and end points
      const displayRoute = async () => {
        try {
          const startCoords = await mapService.geocodeAddress(startPoint);
          const endCoords = await mapService.geocodeAddress(endPoint);
          
          // Get route
          const routeData = await mapService.getRoute(startCoords, endCoords);
          
          // Add route to map
          const routeCoords = routeData.routes[0].geometry.coordinates.map(coord => 
            fromLonLat(coord)
          );
          
          const routeFeature = new Feature({
            geometry: new LineString(routeCoords)
          });
          
          routeSource.addFeature(routeFeature);
          
          // Add traffic light markers
          if (trafficLights && trafficLights.length > 0) {
            trafficLights.forEach((light) => {
              if (!light.position || !Array.isArray(light.position[0])) return;
              
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
              
              trafficLightsSource.addFeature(lightFeature);
            });
          }
          
          // Fit view to show the entire route
          mapRef.current.getView().fit(routeFeature.getGeometry(), {
            padding: [50, 50, 50, 50],
            duration: 1000
          });
        } catch (err) {
          console.error("Error displaying route:", err);
          setMapError('Error displaying route: ' + err.message);
        }
      };

      displayRoute();
    } catch (err) {
      console.error("Error setting up map layers:", err);
      setMapError('Error setting up map: ' + err.message);
    }
  }, [mapLoaded, startPoint, endPoint, routeData, trafficLights]);

  return (
    <div className="map-container">
      {(error || mapError) && <div className="error-message">{error || mapError}</div>}
      <div 
        ref={mapElement} 
        className="map" 
        style={{ 
          width: '100%', 
          height: '400px', 
          border: '1px solid #ccc',
          backgroundColor: '#f8f8f8'
        }}
      ></div>
      {!mapLoaded && <div className="map-loading-overlay">Loading map...</div>}
      {!startPoint || !endPoint ? (
        <div className="map-info-overlay">Enter start and end points to see the route</div>
      ) : null}
    </div>
  );
};

export default MapView;