
import React, { useEffect, useRef, useState } from 'react';
import { TrafficLight } from '../services/routeService';

// Define the props interface
interface MapComponentProps {
  startCoordinates?: { lng: number; lat: number };
  endCoordinates?: { lng: number; lat: number };
  trafficLights?: TrafficLight[];
  isLoading?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  startCoordinates,
  endCoordinates,
  trafficLights = [],
  isLoading = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>(
    'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xoNnZ5MGRsMDI0dzNzcDdzamJzaDlmdCJ9.xmCJJoGABmEVWxGPBLWgQA'
  );

  // Dynamic import of mapbox-gl to handle SSR and potential load failures
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // For demo purposes only - in production, use environment variables
    const loadMap = async () => {
      try {
        // Dynamically import mapbox-gl
        const mapboxgl = await import('mapbox-gl');
        await import('mapbox-gl/dist/mapbox-gl.css');
        
        if (!mapContainer.current) return;

        // For demo purposes, we'll use a temporary token
        // In production, this should come from environment variables or user input
        mapboxgl.default.accessToken = mapboxToken;
        
        const defaultCenter = { lng: 77.5946, lat: 12.9716 }; // Bangalore, India
        
        map.current = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [defaultCenter.lng, defaultCenter.lat],
          zoom: 12
        });

        map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right');
        
        map.current.on('load', () => {
          setMapInitialized(true);
        });

        map.current.on('error', (e: any) => {
          console.error('Mapbox error:', e);
          setMapError('Error loading map');
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Could not load map. Please check your internet connection.');
      }
    };

    loadMap();

    return () => {
      if (map.current && map.current.remove) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Update map when route data changes
  useEffect(() => {
    if (!map.current || !mapInitialized || isLoading || mapError) return;

    // Dynamically import mapboxgl to handle operations
    const updateMap = async () => {
      try {
        const mapboxgl = await import('mapbox-gl');
        
        // Clear existing markers and layers
        const mapElement = map.current;
        document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());
        
        try {
          if (mapElement.getLayer('route')) mapElement.removeLayer('route');
          if (mapElement.getSource('route')) mapElement.removeSource('route');
        } catch (e) {
          console.log('Layer or source did not exist', e);
        }
        
        // If we have start and end coordinates, show them and fit the map
        if (startCoordinates && endCoordinates) {
          // Add start marker
          new mapboxgl.default.Marker({ color: '#22C55E' })
            .setLngLat([startCoordinates.lng, startCoordinates.lat])
            .addTo(mapElement);
          
          // Add end marker
          new mapboxgl.default.Marker({ color: '#F97316' })
            .setLngLat([endCoordinates.lng, endCoordinates.lat])
            .addTo(mapElement);
          
          // Add traffic light markers
          trafficLights.forEach(signal => {
            // Create custom element for the traffic light marker
            const el = document.createElement('div');
            el.className = 'traffic-light-marker';
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.background = '#F97316';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.boxShadow = '0 0 0 2px #F97316';
            
            // Add the marker
            new mapboxgl.default.Marker(el)
              .setLngLat([signal.coordinates.lng, signal.coordinates.lat])
              .setPopup(
                new mapboxgl.default.Popup({ offset: 25 })
                  .setHTML(
                    `<h3 class="font-bold">${signal.name}</h3>
                    <p>${signal.location}</p>
                    <p>Wait time: ${signal.duration}s</p>
                    <p>Vendors: ${signal.vendorCount}</p>`
                  )
              )
              .addTo(mapElement);
          });
          
          // For a real implementation, we would make an API call here to get the route
          // For the demo, we'll just draw a straight line
          mapElement.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [startCoordinates.lng, startCoordinates.lat],
                  [endCoordinates.lng, endCoordinates.lat]
                ]
              }
            }
          });
          
          mapElement.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#F97316',
              'line-width': 4,
              'line-opacity': 0.8
            }
          });
          
          // Fit the map to the route
          const bounds = new mapboxgl.default.LngLatBounds()
            .extend([startCoordinates.lng, startCoordinates.lat])
            .extend([endCoordinates.lng, endCoordinates.lat]);
          
          // Extend bounds to include traffic lights
          trafficLights.forEach(signal => {
            bounds.extend([signal.coordinates.lng, signal.coordinates.lat]);
          });
          
          mapElement.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15
          });
        }
      } catch (error) {
        console.error('Error updating map:', error);
        setMapError('Error updating map. Please refresh the page.');
      }
    };
    
    updateMap();
  }, [startCoordinates, endCoordinates, trafficLights, mapInitialized, isLoading, mapError]);

  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden ${isLoading ? 'opacity-50' : ''}`}>
      {mapError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <div className="mb-4 text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg">{mapError}</h3>
            <p className="text-gray-600 mt-2">
              Please check your internet connection or try again later.
            </p>
          </div>
        </div>
      ) : (
        <div ref={mapContainer} className="absolute inset-0 map-container" />
      )}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-10">
          <div className="loader animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
