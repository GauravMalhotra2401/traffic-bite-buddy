
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-b from-white to-gray-100 overflow-hidden">
      <div className="container flex flex-col lg:flex-row items-center py-12 md:py-24">
        <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Food Delivery at <span className="text-traffic-red">Traffic</span> <span className="text-traffic-yellow">Lights</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0">
            Order food from your favorite restaurants and get it delivered at traffic signals during your commute.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
            <Button asChild size="lg" className="bg-traffic-red hover:bg-traffic-red/90 text-white">
              <Link to="/route-planner">
                Plan Your Route
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/vendors">
                Browse Vendors
              </Link>
            </Button>
          </div>
          
          <div className="pt-4 flex items-center justify-center lg:justify-start space-x-6">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-traffic-red">200+</span>
              <span className="text-sm text-gray-500">Vendors</span>
            </div>
            <div className="h-12 border-l border-gray-300"></div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-traffic-yellow">15min</span>
              <span className="text-sm text-gray-500">Avg. Delivery</span>
            </div>
            <div className="h-12 border-l border-gray-300"></div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-traffic-green">24/7</span>
              <span className="text-sm text-gray-500">Service</span>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 mt-12 lg:mt-0 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-traffic-yellow/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-traffic-red/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-traffic-green/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            <div className="relative">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="traffic-light mx-auto">
                    <div className="traffic-light-circle red active"></div>
                    <div className="traffic-light-circle yellow"></div>
                    <div className="traffic-light-circle green"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold">🍔</span>
                    </div>
                    <div>
                      <h3 className="font-bold">Street Food Express</h3>
                      <p className="text-sm text-gray-500">Ready in 5 mins at Signal #42</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Veg Burger</span>
                      <span className="text-sm font-medium">₹80</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Masala Chai</span>
                      <span className="text-sm font-medium">₹20</span>
                    </div>
                    <div className="border-t border-dashed border-gray-200 my-2"></div>
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹100</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-traffic-green hover:bg-traffic-green/90">
                    Ready for Pickup
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
