
import React from 'react';
import { MapPin, Clock, ShoppingBag } from 'lucide-react';

const steps = [
  {
    icon: <MapPin className="h-8 w-8 text-traffic-red" />,
    title: 'Plan Your Route',
    description: 'Enter your destination and we\'ll identify all traffic signals along your route.'
  },
  {
    icon: <ShoppingBag className="h-8 w-8 text-traffic-yellow" />,
    title: 'Order Food',
    description: 'Browse and order from vendors near the traffic signals on your route.'
  },
  {
    icon: <Clock className="h-8 w-8 text-traffic-green" />,
    title: 'Pickup at Signal',
    description: 'Collect your order when you stop at the traffic signal during your commute.'
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">How BiteStop Works</h2>
          <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
            Get your favorite food delivered to you while you wait at traffic signals. It's convenient, quick, and efficient.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-500">{step.description}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="sr-only">Next</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
