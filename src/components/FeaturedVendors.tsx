
import React from 'react';
import { Star, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Sample data - in a real app this would come from an API
const vendors = [
  {
    id: 1,
    name: 'Sharma Ji Fast Food',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
    cuisine: 'Street Food',
    rating: 4.5,
    distance: '2 km',
    deliveryTime: '5-10 min',
    location: 'Signal #42, MG Road'
  },
  {
    id: 2,
    name: 'Royal Tea Stall',
    image: 'https://images.unsplash.com/photo-1571066811602-716837d681de',
    cuisine: 'Beverages',
    rating: 4.3,
    distance: '1.5 km',
    deliveryTime: '3-5 min',
    location: 'Signal #28, Ring Road'
  },
  {
    id: 3,
    name: 'Punjabi Dhaba',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84',
    cuisine: 'North Indian',
    rating: 4.7,
    distance: '3 km',
    deliveryTime: '7-12 min',
    location: 'Signal #15, GT Road'
  },
  {
    id: 4,
    name: 'South Express',
    image: 'https://images.unsplash.com/photo-1630383249896-24fce8eea5cd',
    cuisine: 'South Indian',
    rating: 4.4,
    distance: '2.2 km',
    deliveryTime: '6-8 min',
    location: 'Signal #36, Outer Ring Road'
  }
];

const FeaturedVendors: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Vendors</h2>
            <p className="mt-2 text-gray-500">Popular food vendors available at traffic signals near you</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/vendors">
              View All
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={`${vendor.image}?w=600&h=400&fit=crop&crop=entropy`} 
                  alt={vendor.name}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
                <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center">
                  <Star className="h-3 w-3 text-traffic-yellow fill-traffic-yellow mr-1" />
                  {vendor.rating}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-bold text-lg">{vendor.name}</h3>
                  <p className="text-sm text-gray-500">{vendor.cuisine}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {vendor.distance}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {vendor.deliveryTime}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-3 flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-traffic-red" />
                  {vendor.location}
                </div>
                <Button asChild className="w-full mt-2">
                  <Link to={`/vendors/${vendor.id}`}>
                    Order Now
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedVendors;
