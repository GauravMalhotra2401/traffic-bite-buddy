
import React from 'react';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import FeaturedVendors from '../components/FeaturedVendors';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <FeaturedVendors />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
