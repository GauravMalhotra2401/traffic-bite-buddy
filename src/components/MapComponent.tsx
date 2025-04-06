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
  onCoordinatesChange?: (start: { lng: number; lat: number }, end: { lng: number; lat: number }) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  startCoordinates,
  endCoordinates,
  routeGeometry,
  trafficLights = [],
  isLoading = false,
  onCoordinatesChange
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [restaurantsByLight, setRestaurantsByLight] = useState<RestaurantsByTrafficLight[]>([]);
  const [mapboxToken] = useState<string>(
    'pk.eyJ1IjoidGVzdGluZ2JybyIsImEiOiJjbTkzMnRia3EwZ3E5MmtyNG9mbm1icTY4In0.2GNGgL3GHFrv5uqnToZ3Iw'
  );
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

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
        // First, try to access the mapbox library to see if it's available
        const mapboxgl = await import('mapbox-gl');
        
        // Then try to load the styles
        await import('mapbox-gl/dist/mapbox-gl.css');
        
        if (!mapContainer.current) return;

        if (!mapboxToken) {
          setMapError('Mapbox token is missing. Please check your configuration.');
          return;
        }

        mapboxgl.default.accessToken = mapboxToken;
        
        // Verify that the Mapbox GL JS library can be initialized
        try {
          const defaultCenter = { lng: 77.5946, lat: 12.9716 }; // Bangalore, India
          
          map.current = new mapboxgl.default.Map({
            container: mapContainer.current,
            style: isDarkMode 
              ? 'mapbox://styles/mapbox/navigation-night-v1' 
              : 'mapbox://styles/mapbox/streets-v11',
            center: [defaultCenter.lng, defaultCenter.lat],
            zoom: 12,
            pitch: 30, // Add pitch for a more engaging 3D view
            antialias: true // Enable antialiasing for smoother lines
          });

          map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right');
          
          // Add dark mode toggle control
          class DarkModeControl {
            _container: HTMLDivElement;
            _map: any;

            onAdd(map: any) {
              this._map = map;
              this._container = document.createElement('div');
              this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
              
              const button = document.createElement('button');
              button.className = 'mapboxgl-ctrl-icon';
              button.innerHTML = isDarkMode 
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>' 
                : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
              button.title = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';
              button.setAttribute('aria-label', isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
              button.style.cssText = 'display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;';

              button.onclick = () => {
                const newMode = !isDarkMode;
                setIsDarkMode(newMode);
                
                try {
                  map.setStyle(newMode 
                    ? 'mapbox://styles/mapbox/navigation-night-v1' 
                    : 'mapbox://styles/mapbox/streets-v11'
                  );
                  
                  button.innerHTML = newMode 
                    ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
                    : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
                  button.title = newMode ? 'Switch to light mode' : 'Switch to dark mode';
                  button.setAttribute('aria-label', newMode ? 'Switch to light mode' : 'Switch to dark mode');
                } catch (styleError) {
                  console.error('Error changing map style:', styleError);
                }
              };
              
              this._container.appendChild(button);
              return this._container;
            }

            onRemove() {
              this._container.parentNode?.removeChild(this._container);
            }
          }

          map.current.addControl(new DarkModeControl(), 'top-right');

          // Add click event for selecting locations on the map if onCoordinatesChange is provided
          if (onCoordinatesChange) {
            map.current.on('click', (e: any) => {
              const lngLat = e.lngLat;
              
              if (startCoordinates && !endCoordinates) {
                const newEndCoordinates = { lng: lngLat.lng, lat: lngLat.lat };
                onCoordinatesChange(startCoordinates, newEndCoordinates);
              } else if (!startCoordinates) {
                const newStartCoordinates = { lng: lngLat.lng, lat: lngLat.lat };
                onCoordinatesChange(newStartCoordinates, { lng: 0, lat: 0 });
              }
            });
          }
        } catch (mapInitError) {
          console.error('Map initialization error:', mapInitError);
          setMapError('Error initializing map. Please try again later.');
          return;
        }
        
        map.current.on('load', () => {
          // Add 3D buildings if in dark mode for more visual appeal
          try {
            if (isDarkMode) {
              map.current.addLayer({
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 14,
                'paint': {
                  'fill-extrusion-color': '#222',
                  'fill-extrusion-height': [
                    'interpolate', ['linear'], ['zoom'],
                    15, 0,
                    16, ['get', 'height']
                  ],
                  'fill-extrusion-base': [
                    'interpolate', ['linear'], ['zoom'],
                    15, 0,
                    16, ['get', 'min_height']
                  ],
                  'fill-extrusion-opacity': 0.6
                }
              });
            }
          } catch (layerError) {
            console.error('Error adding 3D buildings layer:', layerError);
            // Non-critical error, we can continue
          }
          
          setMapInitialized(true);
          setMapError(null); // Clear any errors since map loaded successfully
        });

        map.current.on('error', (e: any) => {
          console.error('Mapbox error:', e);
          if (e.error && e.error.message) {
            setMapError(`Error loading map: ${e.error.message}`);
          } else {
            setMapError('Error loading map. Please try again.');
          }
        });

      } catch (error) {
        console.error('Error loading map libraries:', error);
        if (error instanceof Error) {
          setMapError(`Could not load map: ${error.message}`);
        } else {
          setMapError('Could not load map. Please check your internet connection.');
        }
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
  }, [mapboxToken, isDarkMode, startCoordinates, endCoordinates, onCoordinatesChange]);

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
            // Create a custom HTML element for the traffic light marker
            const el = document.createElement('div');
            el.className = 'traffic-light-marker';
            el.style.width = '24px';
            el.style.height = '24px';
            el.style.borderRadius = '50%';
            el.style.background = 'rgba(255, 0, 0, 0.8)';
            el.style.border = '2px solid white';
            el.style.boxShadow = '0 0 0 2px rgba(0, 0, 0, 0.2)';
            el.style.position = 'relative';
            
            // Pulsating effect
            const pulse = document.createElement('div');
            pulse.style.position = 'absolute';
            pulse.style.top = '-4px';
            pulse.style.left = '-4px';
            pulse.style.right = '-4px';
            pulse.style.bottom = '-4px';
            pulse.style.borderRadius = '50%';
            pulse.style.border = '3px solid rgba(255, 0, 0, 0.5)';
            pulse.style.animation = 'pulse 1.5s infinite';
            el.appendChild(pulse);
            
            // Add keyframes for the pulse animation if they don't exist yet
            if (!document.querySelector('#pulse-keyframes')) {
              const style = document.createElement('style');
              style.id = 'pulse-keyframes';
              style.textContent = `
                @keyframes pulse {
                  0% {
                    transform: scale(1);
                    opacity: 1;
                  }
                  100% {
                    transform: scale(1.5);
                    opacity: 0;
                  }
                }
              `;
              document.head.appendChild(style);
            }
            
            const restaurants = restaurantsByLight.find(r => r.trafficLightId === signal.id)?.restaurants || [];
            
            const popup = new mapboxgl.default.Popup({ offset: 25, closeButton: false, maxWidth: '300px' })
              .setHTML(`
                <div class="p-3 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg">
                  <h3 class="font-bold text-lg mb-1">${signal.name}</h3>
                  <p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">${signal.location}</p>
                  <div class="flex items-center gap-3 mt-2">
                    <span class="inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 ${isDarkMode ? 'text-red-400' : 'text-red-500'}" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>
                      </svg>
                      ${signal.duration}s wait
                    </span>
                    <span class="inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-500'}" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" />
                      </svg>
                      ${restaurants.length} places to eat
                    </span>
                  </div>
                  ${restaurants.length > 0 ? `
                    <div class="mt-3 pt-2 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}">
                      <div class="font-medium text-sm ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}">Featured restaurants:</div>
                      <div class="mt-1 space-y-2 max-h-32 overflow-y-auto">
                        ${restaurants.slice(0, 3).map(r => `
                          <div class="text-sm ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} p-2 rounded-md transition-colors cursor-pointer">
                            <div class="font-medium">${r.name}</div>
                            <div class="flex justify-between items-center mt-1">
                              <span class="${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-xs">${r.cuisine || 'Various cuisines'}</span>
                              <span class="${r.isOpen ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')} text-xs font-medium">
                                ${r.isOpen ? 'Open' : 'Closed'}
                              </span>
                            </div>
                          </div>
                        `).join('')}
                        ${restaurants.length > 3 ? `
                          <div class="text-center text-xs ${isDarkMode ? 'text-amber-300' : 'text-amber-600'} mt-1">
                            + ${restaurants.length - 3} more restaurants
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  ` : ''}
                </div>
              `);
              
            new mapboxgl.default.Marker(el)
              .setLngLat([signal.coordinates.lng, signal.coordinates.lat])
              .setPopup(popup)
              .addTo(mapElement);

            // Add restaurant markers
            restaurants.forEach(restaurant => {
              // Create a custom HTML element for the restaurant marker
              const restaurantEl = document.createElement('div');
              restaurantEl.className = 'restaurant-marker';
              restaurantEl.style.width = '24px';
              restaurantEl.style.height = '24px';
              restaurantEl.style.cursor = 'pointer';
              
              // Different icons for different types of restaurants
              let iconColor = '#D97706'; // Default amber color
              let iconShape = '';
              
              if (restaurant.cuisine?.toLowerCase().includes('coffee') || 
                  restaurant.type?.toLowerCase().includes('cafe')) {
                iconShape = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${iconColor}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>`;
              } else if (restaurant.cuisine?.toLowerCase().includes('fast') || 
                        restaurant.type?.toLowerCase().includes('cart')) {
                iconColor = '#EF4444'; // Red for fast food
                iconShape = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${iconColor}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11H7a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2Z"></path><path d="M11 11V3a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v8"></path><path d="M11 15h2"></path></svg>`;
              } else {
                iconShape = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${iconColor}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18v2H3zM3 10h18v2H3zM3 14h18v2H3zM3 18h18v2H3z"></path></svg>`;
              }
              
              restaurantEl.innerHTML = iconShape;
              restaurantEl.style.filter = "drop-shadow(0px 2px 3px rgba(0,0,0,0.3))";
              
              // Create a rich HTML popup for the restaurant
              const restaurantPopup = new mapboxgl.default.Popup({ offset: 25, closeButton: false, maxWidth: '350px' })
                .setHTML(`
                  <div class="p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg">
                    <div class="flex justify-between items-start">
                      <h3 class="font-bold text-lg">${restaurant.name}</h3>
                      ${restaurant.rating ? `
                        <span class="inline-flex items-center bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          ${restaurant.rating}/5
                        </span>
                      ` : ''}
                    </div>

                    <div class="flex flex-wrap gap-2 mt-1">
                      ${restaurant.cuisine ? `
                        <span class="${isDarkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-50 text-indigo-700'} text-xs px-2 py-1 rounded-full">
                          ${restaurant.cuisine}
                        </span>
                      ` : ''}
                      ${restaurant.type ? `
                        <span class="${isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-700'} text-xs px-2 py-1 rounded-full">
                          ${restaurant.type}
                        </span>
                      ` : ''}
                      ${restaurant.priceLevel ? `
                        <span class="${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} text-xs px-2 py-1 rounded-full">
                          ${'$'.repeat(restaurant.priceLevel)}
                        </span>
                      ` : ''}
                    </div>
                    
                    <div class="mt-3 space-y-2">
                      ${restaurant.address ? `
                        <div class="flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">
                          <svg class="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>
                          </svg>
                          <span class="text-sm">${restaurant.address}</span>
                        </div>
                      ` : ''}
                      
                      ${restaurant.openingHours ? `
                        <div class="flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">
                          <svg class="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <div class="text-sm">
                            ${Object.entries(restaurant.openingHours).map(([day, hours]) => 
                              `<div>${day}: ${hours}</div>`
                            ).join('')}
                          </div>
                        </div>
                      ` : restaurant.servingTime ? `
                        <div class="flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">
                          <svg class="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span class="text-sm">Serving Time: ${restaurant.servingTime}</span>
                        </div>
                      ` : ''}
                      
                      ${restaurant.isOpen !== undefined ? `
                        <div class="flex items-center">
                          <span class="inline-flex items-center ${restaurant.isOpen ? 
                            (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') : 
                            (isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                          } text-xs px-2 py-1 rounded">
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              ${restaurant.isOpen ? 
                                '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>' : 
                                '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>'
                              }
                            </svg>
                            ${restaurant.isOpen ? "Currently Open" : "Currently Closed"}
                          </span>
                        </div>
                      ` : ''}
                    </div>
                    
                    ${restaurant.specialties && restaurant.specialties.length > 0 ? `
                      <div class="mt-3">
                        <h4 class="text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}">Specialties</h4>
                        <div class="flex flex-wrap gap-1 mt-1">
                          ${restaurant.specialties.map(specialty => `
                            <span class="${isDarkMode ? 'bg-amber-900 text-amber-200' : 'bg-amber-50 text-amber-700'} text-xs px-2 py-0.5 rounded">
                              ${specialty}
                            </span>
                          `).join('')}
                        </div>
                      </div>
                    ` : ''}

                    ${restaurant.features && restaurant.features.length > 0 ? `
                      <div class="mt-3">
                        <h4 class="text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}">Features</h4>
                        <div class="flex flex-wrap gap-1 mt-1">
                          ${restaurant.features.map(feature => `
                            <span class="${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-700'} text-xs px-2 py-0.5 rounded">
                              ${feature}
                            </span>
                          `).join('')}
                        </div>
                      </div>
                    ` : ''}

                    ${restaurant.website ? `
                      <div class="mt-3">
                        <a href="${restaurant.website}" target="_blank" rel="noopener noreferrer" 
                           class="${isDarkMode ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-600'} text-white text-sm px-3 py-1 rounded inline-flex items-center transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Visit Website
                        </a>
                      </div>
                    ` : ''}
                  </div>
                `);

              new mapboxgl.default.Marker(restaurantEl)
                .setLngLat([restaurant.location.lng, restaurant.location.lat])
                .setPopup(restaurantPopup)
                .addTo(mapElement);
            });
          });
          
          if (routeGeometry) {
            // Add route with animated dash line for more visual appeal
            mapElement.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: routeGeometry
              }
            });
            
            // Main route line
            mapElement.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': isDarkMode ? '#FF9800' : '#F97316',
                'line-width': 6,
                'line-opacity': 0.8
              }
            });
            
            // Animated dash line on top
            mapElement.addLayer({
              id: 'route-dash',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': isDarkMode ? '#FFEB3B' : '#FFFFFF',
                'line-width': 2,
                'line-opacity': 0.9,
                'line-dasharray': [0.2, 2],
                'line-dasharray-transition': {
                  duration: 4000,
                  delay: 0
                }
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
              padding: { top: 100, bottom: 100, left: 100, right: 100 },
              maxZoom: 15,
              pitch: 45,
              bearing: 0,
              duration: 2000
            });
            
            // Animate dash line
            let dashArraySeq = [
              [0, 4],
              [0.5, 3.5],
              [1, 3],
              [1.5, 2.5],
              [2, 2],
              [2.5, 1.5],
              [3, 1],
              [3.5, 0.5],
              [0, 4]
            ];
            
            let step = 0;
            
            const animateDashArray = () => {
              if (step < dashArraySeq.length - 1) {
                step++;
                mapElement.setPaintProperty('route-dash', 'line-dasharray', dashArraySeq[step]);
                setTimeout(animateDashArray, 500);
              } else {
                step = 0;
                mapElement.setPaintProperty('route-dash', 'line-dasharray', dashArraySeq[step]);
                setTimeout(animateDashArray, 500);
              }
            };
            
            setTimeout(animateDashArray, 500);
          }
        }
      } catch (error) {
        console.error('Error updating map:', error);
        setMapError('Error updating map. Please refresh the page.');
      }
    };
    
    updateMap();
  }, [startCoordinates, endCoordinates, routeGeometry, trafficLights, mapInitialized, isLoading, mapError, restaurantsByLight, isDarkMode]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {mapError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center p-6 max-w-md">
            <div className="mb-4 text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{mapError}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2 mb-4">
              Please check your internet connection or try again later.
            </p>
            <button 
              className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
              onClick={() => {
                setMapError(null);
                if (map.current) {
                  try {
                    map.current.remove();
                  } catch (e) {
                    console.error('Error removing map:', e);
                  }
                  map.current = null;
                }
                window.location.reload();
              }}
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div ref={mapContainer} className="absolute inset-0 map-container" />
      )}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg flex flex-col items-center">
            <div className="loader animate-spin h-10 w-10 border-4 border-amber-500 rounded-full border-t-transparent mb-2"></div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-200">Loading map data...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
