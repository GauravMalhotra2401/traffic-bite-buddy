
import React from 'react';
import Navigation from '../components/Navigation';
import HowItWorks from '../components/HowItWorks';
import FeaturedVendors from '../components/FeaturedVendors';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

const StaticHero = () => {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 h-80 sm:h-96 md:h-[500px] w-full flex items-center justify-center">
      <div className="container px-4 md:px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span className="text-primary">Signal</span> Snacks
        </h1>
        <p className="max-w-[700px] text-lg text-gray-500 md:text-xl mx-auto mb-8">
          Order delicious food from vendors at traffic signals and make the most of your wait time
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/route-planner" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
            Plan Your Route
          </a>
          <a href="/vendors" className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            Browse Vendors
          </a>
        </div>
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <StaticHero />
        <HowItWorks />
        <FeaturedVendors />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
