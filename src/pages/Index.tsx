
import React, { Suspense } from 'react';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import FeaturedVendors from '../components/FeaturedVendors';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

// Use lazy loading for the 3D components to improve initial page load
const LazyHero = () => {
  return (
    <Suspense fallback={
      <div className="h-80 sm:h-96 md:h-[500px] w-full flex items-center justify-center bg-gray-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-300 h-16 w-16 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    }>
      <Hero />
    </Suspense>
  );
};

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <LazyHero />
        <HowItWorks />
        <FeaturedVendors />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
