import React, { useEffect, useRef, useState } from 'react';
import { TrafficLight } from '../services/routeService';
import { Restaurant, RestaurantsByTrafficLight, fetchRestaurantsForRoute } from '../services/restaurantService';

// Define the props interface
interface MapComponentProps {
  startCoordinates?: { lng: number; lat: number };
  endCoordinates?: { lng: number; lat: number };
  routeGeometry?: any;
  trafficLights?: TrafficLight[];
  isLoading?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  startCoordinates,
  endCoordinates,
  routeGeometry,
  trafficLights = [],
  isLoading = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [restaurantsByLight, setRestaurantsByLight] = useState<RestaurantsByTrafficLight[]>([]);
  const [mapboxToken] = useState<string>(
    'pk.eyJ1IjoidGVzdGluZ2JybyIsImEiOiJjbTkzMnRia3EwZ3E5MmtyNG9mbm1icTY4In0.2GNGgL3GHFrv5uqnToZ3Iw'
  );

  // Fetch restaurants when traffic lights change
  useEffect(() => {
    if (trafficLights.length > 0) {
      fetchRestaurantsForRoute(trafficLights).then(setRestaurantsByLight);
    }
  }, [trafficLights]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const loadMap = async () => {
      try {
        const mapboxgl = await import('mapbox-gl');
        await import('mapbox-gl/dist/mapbox-gl.css');
        
        if (!mapContainer.current) return;

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
      if (map.current) {
        try {
          map.current.remove();
        } catch (e) {
          console.error('Error removing map:', e);
        }
        map.current = null;
      }
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || !mapInitialized || isLoading || mapError) return;

    const updateMap = async () => {
      try {
        const mapboxgl = await import('mapbox-gl');
        
        const mapElement = map.current;
        
        // Remove existing markers
        document.querySelectorAll('.mapboxgl-marker').forEach(marker => {
          marker.remove();
        });
        
        // Remove existing layers and sources
        try {
          if (mapElement.getLayer('route')) {
            mapElement.removeLayer('route');
          }
          if (mapElement.getSource('route')) {
            mapElement.removeSource('route');
          }
        } catch (e) {
          console.log('Layer or source did not exist', e);
        }
        
        if (startCoordinates && endCoordinates) {
          // Add start marker
          new mapboxgl.default.Marker({ color: '#22C55E' })
            .setLngLat([startCoordinates.lng, startCoordinates.lat])
            .addTo(mapElement);
          
          // Add end marker
          new mapboxgl.default.Marker({ color: '#F97316' })
            .setLngLat([endCoordinates.lng, endCoordinates.lat])
            .addTo(mapElement);
          
          // Add traffic light markers with restaurant info
          trafficLights.forEach(signal => {
            const el = document.createElement('div');
            el.className = 'traffic-light-marker';
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.background = '#F97316';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.boxShadow = '0 0 0 2px #F97316';
            
            const restaurants = restaurantsByLight.find(r => r.trafficLightId === signal.id)?.restaurants || [];
            
            const popup = new mapboxgl.default.Popup({ offset: 25 })
              .setHTML(
                `<div class="p-2">
                  <h3 class="font-bold">${signal.name}</h3>
                  <p>${signal.location}</p>
                  <p>Wait time: ${signal.duration}s</p>
                  <p>Restaurants nearby: ${restaurants.length}</p>
                </div>`
              );
              
            new mapboxgl.default.Marker(el)
              .setLngLat([signal.coordinates.lng, signal.coordinates.lat])
              .setPopup(popup)
              .addTo(mapElement);

            // Add restaurant markers
            restaurants.forEach(restaurant => {
              const restaurantEl = document.createElement('div');
              restaurantEl.className = 'restaurant-marker';
              restaurantEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#D97706" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18v2H3zM3 10h18v2H3zM3 14h18v2H3zM3 18h18v2H3z"/></svg>`;
              
              const restaurantPopup = new mapboxgl.default.Popup({ offset: 25 })
                .setHTML(
                  `<div class="p-2">
                    <h3 class="font-bold">${restaurant.name}</h3>
                    ${restaurant.cuisine ? `<p class="text-sm">Cuisine: ${restaurant.cuisine}</p>` : ''}
                    ${restaurant.address ? `<p class="text-sm">${restaurant.address}</p>` : ''}
                    ${restaurant.isOpen !== undefined ? `<p class="text-sm">${restaurant.isOpen ? 'Open' : 'Closed'}</p>` : ''}
                  </div>`
                );

              new mapboxgl.default.Marker(restaurantEl)
                .setLngLat([restaurant.location.lng, restaurant.location.lat])
                .setPopup(restaurantPopup)
                .addTo(mapElement);
            });
          });
          
          if (routeGeometry) {
            mapElement.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: routeGeometry
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
            
            const bounds = new mapboxgl.default.LngLatBounds();
            
            // Extend bounds with route coordinates
            if (routeGeometry && routeGeometry.coordinates) {
              routeGeometry.coordinates.forEach((coord: [number, number]) => {
                bounds.extend(coord);
              });
            }
            
            // Extend bounds with traffic lights and their restaurants
            restaurantsByLight.forEach(({ trafficLightLocation, restaurants }) => {
              bounds.extend([trafficLightLocation.lng, trafficLightLocation.lat]);
              restaurants.forEach(restaurant => {
                bounds.extend([restaurant.location.lng, restaurant.location.lat]);
              });
            });
            
            mapElement.fitBounds(bounds, {
              padding: 50,
              maxZoom: 15
            });
          }
        }
      } catch (error) {
        console.error('Error updating map:', error);
        setMapError('Error updating map. Please refresh the page.');
      }
    };
    
    updateMap();
  }, [startCoordinates, endCoordinates, routeGeometry, trafficLights, mapInitialized, isLoading, mapError, restaurantsByLight]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
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
