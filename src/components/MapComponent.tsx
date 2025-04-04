
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { TrafficLight } from '../services/routeService';

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
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Initialize the map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // For demo purposes, we'll use a temporary token
    // In production, this should come from environment variables or user input
    mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xoNnZ5MGRsMDI0dzNzcDdzamJzaDlmdCJ9.xmCJJoGABmEVWxGPBLWgQA';
    
    const defaultCenter = { lng: 77.5946, lat: 12.9716 }; // Bangalore, India
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [defaultCenter.lng, defaultCenter.lat],
      zoom: 12
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    map.current.on('load', () => {
      setMapInitialized(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map when route data changes
  useEffect(() => {
    if (!map.current || !mapInitialized || isLoading) return;

    // Clear existing markers and layers
    const mapElement = map.current;
    document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());
    
    if (mapElement.getLayer('route')) mapElement.removeLayer('route');
    if (mapElement.getSource('route')) mapElement.removeSource('route');
    
    // If we have start and end coordinates, show them and fit the map
    if (startCoordinates && endCoordinates) {
      // Add start marker
      new mapboxgl.Marker({ color: '#22C55E' })
        .setLngLat([startCoordinates.lng, startCoordinates.lat])
        .addTo(mapElement);
      
      // Add end marker
      new mapboxgl.Marker({ color: '#F97316' })
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
        const marker = new mapboxgl.Marker(el)
          .setLngLat([signal.coordinates.lng, signal.coordinates.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
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
      const bounds = new mapboxgl.LngLatBounds()
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
  }, [startCoordinates, endCoordinates, trafficLights, mapInitialized, isLoading]);

  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden ${isLoading ? 'opacity-50' : ''}`}>
      <div ref={mapContainer} className="absolute inset-0 map-container" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-10">
          <div className="loader animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
