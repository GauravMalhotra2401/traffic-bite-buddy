import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ThreeDCarAnimation from './ThreeDCarAnimation';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({ vendors: 0, delivery: 0 });

  useEffect(() => {
    setIsVisible(true);
    
    // Animate counters
    const duration = 2000; // 2 seconds
    const steps = 50;
    const vendorsTarget = 200;
    const deliveryTarget = 15;
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCounts({
        vendors: Math.round((vendorsTarget / steps) * step),
        delivery: Math.round((deliveryTarget / steps) * step)
      });
      
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="relative min-h-[90vh] bg-gradient-to-b from-white to-gray-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-traffic-red/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-traffic-yellow/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-traffic-green/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container relative flex flex-col lg:flex-row items-center py-12 md:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="w-full lg:w-1/2 space-y-8 text-center lg:text-left"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
          >
            Food Delivery at{' '}
            <span className="text-traffic-red hover:text-traffic-red/80 transition-colors duration-300">
              Traffic
            </span>{' '}
            <span className="text-traffic-yellow hover:text-traffic-yellow/80 transition-colors duration-300">
              Lights
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0"
          >
            Order food from your favorite restaurants and get it delivered at traffic signals during your commute.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start"
          >
            <Button 
              asChild 
              size="lg" 
              className="bg-traffic-red hover:bg-traffic-red/90 text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Link to="/route-planner" className="flex items-center">
                Plan Your Route
                <ArrowRight className="ml-2 h-5 w-5 animate-bounce-x" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Link to="/vendors">
                Browse Vendors
              </Link>
            </Button>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="pt-4 flex items-center justify-center lg:justify-start space-x-6"
          >
            <div className="flex flex-col items-center transform hover:scale-110 transition-transform duration-300">
              <span className="text-2xl font-bold text-traffic-red">{counts.vendors}+</span>
              <span className="text-sm text-gray-500">Vendors</span>
            </div>
            <div className="h-12 border-l border-gray-300"></div>
            <div className="flex flex-col items-center transform hover:scale-110 transition-transform duration-300">
              <span className="text-2xl font-bold text-traffic-yellow">{counts.delivery}min</span>
              <span className="text-sm text-gray-500">Avg. Delivery</span>
            </div>
            <div className="h-12 border-l border-gray-300"></div>
            <div className="flex flex-col items-center transform hover:scale-110 transition-transform duration-300">
              <span className="text-2xl font-bold text-traffic-green">24/7</span>
              <span className="text-sm text-gray-500">Service</span>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-full lg:w-1/2 mt-12 lg:mt-0"
        >
          <div className="relative w-full max-w-lg mx-auto">
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <ThreeDCarAnimation />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
