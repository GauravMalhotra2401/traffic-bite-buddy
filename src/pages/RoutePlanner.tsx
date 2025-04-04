
import React, { useState } from 'react';
import { Search, MapPin, Navigation2, AlertCircle, Clock, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useToast } from '@/hooks/use-toast';
import MapComponent from '../components/MapComponent';
import { TrafficLight, geocodeAddress, getRoute } from '../services/routeService';

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
  const { toast } = useToast();

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
    
    try {
      // Convert addresses to coordinates
      const startCoords = await geocodeAddress(startLocation);
      const endCoords = await geocodeAddress(destination);
      
      if (!startCoords || !endCoords) {
        toast({
          title: "Location error",
          description: "Could not find one or both locations. Please check the addresses.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      setStartCoordinates(startCoords);
      setEndCoordinates(endCoords);
      
      // Get route information
      const routeData = await getRoute(startCoords, endCoords);
      
      if (!routeData) {
        setIsLoading(false);
        return;
      }
      
      // Update state with route data
      setTrafficLights(routeData.trafficLights);
      setRouteInfo({
        distance: Math.round(routeData.distance / 100) / 10, // Convert to km with 1 decimal
        duration: Math.round(routeData.duration / 60), // Convert to minutes
        trafficLightsCount: routeData.trafficLights.length
      });
      
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
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="start-location"
                          placeholder="Enter starting point"
                          value={startLocation}
                          onChange={(e) => setStartLocation(e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="destination">
                        Destination
                      </label>
                      <div className="relative">
                        <Navigation2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="destination"
                          placeholder="Enter destination"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
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
                        {trafficLights.map((signal) => (
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
                                    <Users className="h-3 w-3 mr-1" />
                                    {signal.vendorCount} vendors
                                  </span>
                                </div>
                              </div>
                              <Button size="sm">
                                View Vendors
                              </Button>
                            </div>
                          </div>
                        ))}
                      </TabsContent>
                      
                      <TabsContent value="map" className="mt-4 h-[400px]">
                        <MapComponent 
                          startCoordinates={startCoordinates}
                          endCoordinates={endCoordinates}
                          trafficLights={trafficLights}
                          isLoading={isLoading}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-dashed border-gray-200 p-12">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 mb-4">
                      <div className="traffic-light">
                        <div className="traffic-light-circle red"></div>
                        <div className="traffic-light-circle yellow"></div>
                        <div className="traffic-light-circle green"></div>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Plan your route</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Enter your start and destination locations to find traffic signals along your route and available food vendors.
                    </p>
                  </div>
                </div>
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
