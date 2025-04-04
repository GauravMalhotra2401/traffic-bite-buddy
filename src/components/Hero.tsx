
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ThreeDCarAnimation from './ThreeDCarAnimation';

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
        
        <div className="w-full lg:w-1/2 mt-12 lg:mt-0">
          <div className="relative w-full max-w-lg mx-auto">
            {/* 3D Car Animation */}
            <ThreeDCarAnimation />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
