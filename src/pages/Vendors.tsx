
import React, { useState } from 'react';
import { Search, Filter, MapPin, Star, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

// Mock vendor data
const mockVendors = [
  {
    id: 1,
    name: 'Sharma Ji Fast Food',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
    cuisine: 'Street Food',
    rating: 4.5,
    distance: '2 km',
    deliveryTime: '5-10 min',
    location: 'Signal #42, MG Road',
    popular: ['Veg Burger', 'Masala Chai', 'Samosa']
  },
  {
    id: 2,
    name: 'Royal Tea Stall',
    image: 'https://images.unsplash.com/photo-1571066811602-716837d681de',
    cuisine: 'Beverages',
    rating: 4.3,
    distance: '1.5 km',
    deliveryTime: '3-5 min',
    location: 'Signal #28, Ring Road',
    popular: ['Cutting Chai', 'Bun Maska', 'Lemon Tea']
  },
  {
    id: 3,
    name: 'Punjabi Dhaba',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84',
    cuisine: 'North Indian',
    rating: 4.7,
    distance: '3 km',
    deliveryTime: '7-12 min',
    location: 'Signal #15, GT Road',
    popular: ['Paratha', 'Chole', 'Lassi']
  },
  {
    id: 4,
    name: 'South Express',
    image: 'https://images.unsplash.com/photo-1630383249896-24fce8eea5cd',
    cuisine: 'South Indian',
    rating: 4.4,
    distance: '2.2 km',
    deliveryTime: '6-8 min',
    location: 'Signal #36, Outer Ring Road',
    popular: ['Dosa', 'Idli', 'Filter Coffee']
  },
  {
    id: 5,
    name: 'Chaat Corner',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
    cuisine: 'Chaat & Snacks',
    rating: 4.2,
    distance: '1.8 km',
    deliveryTime: '4-7 min',
    location: 'Signal #42, MG Road',
    popular: ['Pani Puri', 'Bhel Puri', 'Aloo Tikki']
  },
  {
    id: 6,
    name: 'Juice Junction',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba',
    cuisine: 'Beverages',
    rating: 4.0,
    distance: '2.5 km',
    deliveryTime: '5-8 min',
    location: 'Signal #28, Ring Road',
    popular: ['Fresh Orange Juice', 'Watermelon Juice', 'Mixed Fruit']
  }
];

const Vendors: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [cuisineFilter, setCuisineFilter] = useState('all');

  // Get unique cuisines from mock data
  const cuisines = ['all', ...new Set(mockVendors.map(vendor => vendor.cuisine))];

  // Filter and sort vendors
  const filteredVendors = mockVendors
    .filter(vendor => 
      (cuisineFilter === 'all' || vendor.cuisine === cuisineFilter) &&
      (vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       vendor.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
       vendor.location.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance);
      if (sortBy === 'deliveryTime') {
        const aTime = parseInt(a.deliveryTime.split('-')[0]);
        const bTime = parseInt(b.deliveryTime.split('-')[0]);
        return aTime - bTime;
      }
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow py-8">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Food Vendors</h1>
            <p className="text-gray-500 mt-2">
              Browse and order from vendors available at traffic signals
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Search</h3>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search vendors..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3">Sort By</h3>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rating">Highest Rating</SelectItem>
                          <SelectItem value="distance">Nearest</SelectItem>
                          <SelectItem value="deliveryTime">Fastest Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3">Cuisine</h3>
                      <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Cuisine" />
                        </SelectTrigger>
                        <SelectContent>
                          {cuisines.map((cuisine, index) => (
                            <SelectItem key={index} value={cuisine}>
                              {cuisine === 'all' ? 'All Cuisines' : cuisine}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full" onClick={() => {
                        setSearchQuery('');
                        setSortBy('rating');
                        setCuisineFilter('all');
                      }}>
                        <Filter className="mr-2 h-4 w-4" />
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Showing {filteredVendors.length} vendors
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortBy === 'rating' ? 'Sorted by rating' : 
                   sortBy === 'distance' ? 'Sorted by distance' : 
                   'Sorted by delivery time'}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVendors.map((vendor) => (
                  <Card key={vendor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <Link to={`/vendors/${vendor.id}`}>
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
                    </Link>
                    
                    <CardContent className="p-4">
                      <div className="mb-2">
                        <Link to={`/vendors/${vendor.id}`}>
                          <h3 className="font-bold text-lg hover:text-primary transition-colors">
                            {vendor.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500">{vendor.cuisine}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {vendor.distance}
                        </div>
                        <div className="flex items-center">
                          <span className="text-traffic-green font-medium">
                            {vendor.deliveryTime}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mb-3 flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-traffic-red" />
                        {vendor.location}
                      </div>
                      <div className="text-xs mb-3">
                        <span className="text-gray-500">Popular:</span>{' '}
                        {vendor.popular.join(', ')}
                      </div>
                      <Button asChild className="w-full mt-2">
                        <Link to={`/vendors/${vendor.id}`}>
                          View Menu
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredVendors.length === 0 && (
                <div className="bg-gray-50 rounded-lg border border-dashed border-gray-200 p-12 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No vendors found</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    We couldn't find any vendors matching your search criteria. Try adjusting your filters or search term.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('');
                    setSortBy('rating');
                    setCuisineFilter('all');
                  }}>
                    Reset Filters
                  </Button>
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

export default Vendors;
