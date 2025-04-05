import React, { useState } from 'react';
import { Search, Navigation2, AlertCircle, Clock, Users, MapPin, Utensils, X, ExternalLink, Phone, Wifi, Car, Accessibility, CreditCard, DollarSign, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useToast } from '@/hooks/use-toast';
import MapComponent from '../components/MapComponent';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { TrafficLight, geocodeAddress, getRoute } from '../services/routeService';
import { Restaurant, RestaurantsByTrafficLight, fetchRestaurantsForRoute } from '../services/restaurantService';

const RoutePlanner: React.FC = () => {
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [routeCalculated, setRouteCalculated] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
    trafficLightsCount: number;
  } | null>(null);
  const [startCoordinates, setStartCoordinates] = useState<{ lng: number; lat: number } | undefined>(undefined);
  const [endCoordinates, setEndCoordinates] = useState<{ lng: number; lat: number } | undefined>(undefined);
  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([]);
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [restaurantsByLight, setRestaurantsByLight] = useState<RestaurantsByTrafficLight[]>([]);
  const [selectedTrafficLight, setSelectedTrafficLight] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStartLocationChange = (location: string, coordinates?: { lng: number; lat: number }) => {
    setStartLocation(location);
    if (coordinates) {
      setStartCoordinates(coordinates);
    }
  };

  const handleDestinationChange = (location: string, coordinates?: { lng: number; lat: number }) => {
    setDestination(location);
    if (coordinates) {
      setEndCoordinates(coordinates);
    }
  };

  const handleCalculateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startLocation || !destination) {
      toast({
        title: "Missing information",
        description: "Please enter both start and destination locations",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setSelectedTrafficLight(null);
    
    try {
      // Convert addresses to coordinates if not already available from autocomplete
      let start = startCoordinates;
      let end = endCoordinates;
      
      if (!start) {
        start = await geocodeAddress(startLocation);
      }
      
      if (!end) {
        end = await geocodeAddress(destination);
      }
      
      if (!start || !end) {
        toast({
          title: "Location error",
          description: "Could not find one or both locations. Please check the addresses.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      setStartCoordinates(start);
      setEndCoordinates(end);
      
      // Get route information
      const routeData = await getRoute(start, end);
      
      if (!routeData) {
        setIsLoading(false);
        return;
      }
      
      // Update state with route data
      setTrafficLights(routeData.trafficLights);
      setRouteGeometry(routeData.geometry);
      setRouteInfo({
        distance: Math.round(routeData.distance / 100) / 10,
        duration: Math.round(routeData.duration / 60),
        trafficLightsCount: routeData.trafficLights.length
      });

      // Fetch restaurants for all traffic lights
      const restaurants = await fetchRestaurantsForRoute(routeData.trafficLights);
      setRestaurantsByLight(restaurants);
      
      setRouteCalculated(true);
      
      toast({
        title: "Route calculated",
        description: `Found ${routeData.trafficLights.length} traffic signals on your route`,
      });
    } catch (error) {
      console.error("Error calculating route:", error);
      toast({
        title: "Route calculation failed",
        description: "There was an error calculating your route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewVendors = (signalId: string) => {
    setSelectedTrafficLight(selectedTrafficLight === signalId ? null : signalId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow py-8">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Plan Your Route</h1>
            <p className="text-gray-500 mt-2">
              Find traffic signals on your route and discover food vendors available at each stop
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Enter Route Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCalculateRoute} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="start-location">
                        Start Location
                      </label>
                      <LocationAutocomplete
                        value={startLocation}
                        onChange={handleStartLocationChange}
                        placeholder="Enter starting point"
                        icon={<MapPin className="h-4 w-4 text-gray-500" />}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="destination">
                        Destination
                      </label>
                      <LocationAutocomplete
                        value={destination}
                        onChange={handleDestinationChange}
                        placeholder="Enter destination"
                        icon={<Navigation2 className="h-4 w-4 text-gray-500" />}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Calculate Route
                        </>
                      )}
                    </Button>
                  </form>
                  
                  {routeCalculated && routeInfo && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Route Information</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Estimated distance: {routeInfo.distance} km<br />
                            Estimated time: {routeInfo.duration} minutes<br />
                            Traffic signals: {routeInfo.trafficLightsCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              {routeCalculated ? (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Traffic Signals On Your Route</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-4rem)]">
                    <Tabs defaultValue="map" className="w-full h-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="list">List View</TabsTrigger>
                        <TabsTrigger value="map">Map View</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="list" className="mt-4 space-y-4 overflow-auto max-h-[400px]">
                        {trafficLights.length > 0 ? (
                          trafficLights.map((signal) => {
                            const restaurants = restaurantsByLight.find(r => r.trafficLightId === signal.id)?.restaurants || [];
                            const isSelected = selectedTrafficLight === signal.id;
                            
                            return (
                              <div key={signal.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{signal.name}</h3>
                                    <p className="text-sm text-gray-500">{signal.location}</p>
                                    <div className="flex items-center mt-2 text-sm text-gray-500">
                                      <span className="inline-flex items-center mr-4">
                                        <Clock className="h-3 w-3 mr-1 text-traffic-red" />
                                        {signal.duration}s wait time
                                      </span>
                                      <span className="inline-flex items-center">
                                        <Utensils className="h-3 w-3 mr-1" />
                                        {restaurants.length} restaurants
                                      </span>
                                    </div>
                                  </div>
                                  <Button 
                                    size="sm"
                                    variant={isSelected ? "secondary" : "default"}
                                    onClick={() => handleViewVendors(signal.id)}
                                  >
                                    {isSelected ? (
                                      <>
                                        <X className="h-3 w-3 mr-1" />
                                        Close
                                      </>
                                    ) : (
                                      <>
                                        <Utensils className="h-3 w-3 mr-1" />
                                        View Restaurants
                                      </>
                                    )}
                                  </Button>
                                </div>
                                
                                {isSelected && restaurants.length > 0 && (
                                  <div className="mt-4 pl-4 border-l-2 border-amber-500">
                                    <h4 className="text-sm font-medium mb-2">Nearby Restaurants</h4>
                                    <div className="space-y-6">
                                      {restaurants.map(restaurant => (
                                        <div key={restaurant.id} className="text-sm bg-gray-50 rounded-lg p-4">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <div className="font-medium text-base">{restaurant.name}</div>
                                              <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                                                  {restaurant.type}
                                                </span>
                                                {restaurant.isMobile && (
                                                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                                    Mobile Vendor
                                                  </span>
                                                )}
                                                {restaurant.isTemporary && (
                                                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                                                    Temporary
                                                  </span>
                                                )}
                                              </div>
                                              {restaurant.cuisine && (
                                                <div className="text-gray-600 mt-1">{restaurant.cuisine}</div>
                                              )}
                                            </div>
                                            {restaurant.website && (
                                              <a 
                                                href={restaurant.website} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-amber-600 hover:text-amber-700"
                                              >
                                                <ExternalLink className="h-4 w-4" />
                                              </a>
                                            )}
                                          </div>

                                          <div className="mt-2 space-y-2">
                                            {restaurant.address && (
                                              <div className="flex items-start text-gray-600">
                                                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                <span>{restaurant.address}</span>
                                              </div>
                                            )}
                                            
                                            {restaurant.phoneNumber && (
                                              <div className="flex items-center text-gray-600">
                                                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                                                <a href={`tel:${restaurant.phoneNumber}`} className="hover:text-amber-600">
                                                  {restaurant.phoneNumber}
                                                </a>
                                              </div>
                                            )}

                                            {(restaurant.openingHours || restaurant.servingTime) && (
                                              <div className="flex items-start text-gray-600">
                                                <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                <div>
                                                  {restaurant.servingTime ? (
                                                    <div>Serving Time: {restaurant.servingTime}</div>
                                                  ) : (
                                                    Object.entries(restaurant.openingHours!).map(([day, hours]) => (
                                                      <div key={day}>{hours}</div>
                                                    ))
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                          {restaurant.specialties && restaurant.specialties.length > 0 && (
                                            <div className="mt-3">
                                              <div className="text-xs font-medium text-gray-500 mb-1">Specialties:</div>
                                              <div className="flex flex-wrap gap-2">
                                                {restaurant.specialties.map(specialty => (
                                                  <span 
                                                    key={specialty}
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-50 text-orange-700"
                                                  >
                                                    {specialty}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {restaurant.paymentMethods && restaurant.paymentMethods.length > 0 && (
                                            <div className="mt-3">
                                              <div className="text-xs font-medium text-gray-500 mb-1">Payment Accepted:</div>
                                              <div className="flex flex-wrap gap-2">
                                                {restaurant.paymentMethods.map(method => (
                                                  <span 
                                                    key={method}
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700"
                                                  >
                                                    <CreditCard className="h-3 w-3 mr-1" />
                                                    {method}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          <div className="mt-3 flex flex-wrap gap-2">
                                            {restaurant.features?.map(feature => (
                                              <span 
                                                key={feature}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                                              >
                                                {feature === 'Wi-Fi' && <Wifi className="h-3 w-3 mr-1" />}
                                                {feature === 'Outdoor Seating' && <Users className="h-3 w-3 mr-1" />}
                                                {feature === 'Takeout' && <Car className="h-3 w-3 mr-1" />}
                                                {feature === 'Wheelchair Accessible' && <Accessibility className="h-3 w-3 mr-1" />}
                                                {feature}
                                              </span>
                                            ))}
                                          </div>

                                          {restaurant.dietaryOptions && restaurant.dietaryOptions.length > 0 && (
                                            <div className="mt-3">
                                              <div className="text-xs font-medium text-gray-500 mb-1">Dietary Options:</div>
                                              <div className="flex flex-wrap gap-2">
                                                {restaurant.dietaryOptions.map(option => (
                                                  <span 
                                                    key={option}
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700"
                                                  >
                                                    {option}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          <div className="mt-3 flex items-center gap-4">
                                            {restaurant.isOpen !== undefined && (
                                              <span className={`text-xs font-medium ${restaurant.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                                {restaurant.isOpen ? 'Open' : 'Closed'}
                                              </span>
                                            )}
                                            {restaurant.rating && (
                                              <span className="text-xs text-amber-600 font-medium">
                                                Rating: {restaurant.rating}/5
                                              </span>
                                            )}
                                            {restaurant.priceLevel && (
                                              <span className="text-xs text-gray-600">
                                                {'$'.repeat(restaurant.priceLevel)}
                                              </span>
                                            )}
                                          </div>

                                          {restaurant.popularDishes && restaurant.popularDishes.length > 0 && (
                                            <div className="mt-3">
                                              <div className="text-xs font-medium text-gray-500 mb-1">Popular Dishes:</div>
                                              <div className="flex flex-wrap gap-2">
                                                {restaurant.popularDishes.map(dish => (
                                                  <span 
                                                    key={dish}
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-50 text-amber-700"
                                                  >
                                                    {dish}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {restaurant.reviews && restaurant.reviews.length > 0 && (
                                            <div className="mt-4">
                                              <div className="text-xs font-medium text-gray-500 mb-2">Recent Reviews</div>
                                              <div className="space-y-2">
                                                {restaurant.reviews.slice(0, 2).map((review, index) => (
                                                  <div key={index} className="bg-white p-2 rounded border text-xs">
                                                    <div className="flex justify-between">
                                                      <span className="font-medium">{review.author}</span>
                                                      <span className="text-amber-600">{review.rating}/5</span>
                                                    </div>
                                                    <p className="mt-1 text-gray-600">{review.text}</p>
                                                    <div className="mt-1 text-gray-400">{review.date}</div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {isSelected && restaurants.length === 0 && (
                                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                                    <p className="text-sm text-gray-500">No restaurants found near this traffic light.</p>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8">
                            <p className="text-gray-500 text-center">
                              No traffic signals found on this route.
                            </p>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="map" className="mt-4 h-[400px]">
                        <MapComponent 
                          startCoordinates={startCoordinates}
                          endCoordinates={endCoordinates}
                          routeGeometry={routeGeometry}
                          trafficLights={trafficLights}
                          isLoading={isLoading}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent>
                    <div className="text-center">
                      <p className="text-gray-500">
                        Enter your route details to see traffic signals and nearby restaurants
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RoutePlanner;
