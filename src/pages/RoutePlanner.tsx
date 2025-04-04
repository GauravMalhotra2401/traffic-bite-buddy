
import React, { useState } from 'react';
import { Search, Navigation2, MapPin, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useToast } from '@/hooks/use-toast';

// Mock traffic light data for demo purposes
const mockTrafficLights = [
  { id: 1, name: 'Signal #42', location: 'MG Road & 11th Cross', duration: 90, vendorCount: 5 },
  { id: 2, name: 'Signal #28', location: 'Ring Road & KR Puram', duration: 120, vendorCount: 8 },
  { id: 3, name: 'Signal #15', location: 'Silk Board Junction', duration: 180, vendorCount: 12 },
  { id: 4, name: 'Signal #36', location: 'Hebbal Flyover', duration: 75, vendorCount: 4 },
];

const RoutePlanner: React.FC = () => {
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [routeCalculated, setRouteCalculated] = useState(false);
  const { toast } = useToast();

  const handleCalculateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startLocation || !destination) {
      toast({
        title: "Missing information",
        description: "Please enter both start and destination locations",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would call a mapping API
    // For demo, just set the state to show the mock data
    setRouteCalculated(true);
    
    toast({
      title: "Route calculated",
      description: "We found 4 traffic signals on your route",
    });
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
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full">
                      <Search className="mr-2 h-4 w-4" />
                      Calculate Route
                    </Button>
                  </form>
                  
                  {routeCalculated && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Route Information</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Estimated distance: 42 km<br />
                            Estimated time: 1 hour 20 minutes<br />
                            Traffic signals: 4
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
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Signals On Your Route</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="list" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="list">List View</TabsTrigger>
                        <TabsTrigger value="map">Map View</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="list" className="mt-4">
                        <div className="space-y-4">
                          {mockTrafficLights.map((signal) => (
                            <div key={signal.id} className="border rounded-lg p-4 hover:bg-gray-50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{signal.name}</h3>
                                  <p className="text-sm text-gray-500">{signal.location}</p>
                                  <div className="flex items-center mt-2 text-sm text-gray-500">
                                    <span className="inline-flex items-center mr-4">
                                      <div className="w-3 h-3 bg-traffic-red rounded-full mr-1"></div>
                                      {signal.duration}s wait time
                                    </span>
                                    <span>
                                      {signal.vendorCount} vendors available
                                    </span>
                                  </div>
                                </div>
                                <Button size="sm">
                                  View Vendors
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="map">
                        <div className="bg-gray-100 rounded-md h-[400px] flex items-center justify-center">
                          <div className="text-center">
                            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">Map view will be available soon!</p>
                          </div>
                        </div>
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
