
import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="text-center px-4">
          <div className="relative mb-6">
            <div className="traffic-light mx-auto">
              <div className="traffic-light-circle red active"></div>
              <div className="traffic-light-circle yellow"></div>
              <div className="traffic-light-circle green"></div>
            </div>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <div className="flex items-center justify-center mb-6">
            <AlertCircle className="h-5 w-5 text-traffic-red mr-2" />
            <p className="text-xl text-gray-600">Oops! This page doesn't exist</p>
          </div>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            It seems you've taken a wrong turn. The page you're looking for has been moved or doesn't exist.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button asChild variant="default">
              <Link to="/">
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/vendors">
                Browse Vendors
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
