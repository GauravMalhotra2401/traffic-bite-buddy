
import React from 'react';
import { Link } from 'react-router-dom';
import { User, Search, MapPin, ShoppingBag, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <Link to="/" className="flex items-center space-x-2">
          <div className="traffic-light scale-50">
            <div className="traffic-light-circle red"></div>
            <div className="traffic-light-circle yellow"></div>
            <div className="traffic-light-circle green"></div>
          </div>
          <span className="font-bold text-xl text-traffic-dark">BiteStop</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/route-planner" className="text-sm font-medium transition-colors hover:text-primary">
            Plan Route
          </Link>
          <Link to="/vendors" className="text-sm font-medium transition-colors hover:text-primary">
            Food Vendors
          </Link>
          <Link to="/orders" className="text-sm font-medium transition-colors hover:text-primary">
            My Orders
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="outline" size="icon">
            <MapPin className="h-4 w-4" />
            <span className="sr-only">Location</span>
          </Button>
          <Button variant="outline" size="icon">
            <ShoppingBag className="h-4 w-4" />
            <span className="sr-only">Cart</span>
          </Button>
          <Button variant="outline" size="icon">
            <User className="h-4 w-4" />
            <span className="sr-only">Account</span>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Menu</span>
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col p-4 space-y-4">
            <Link 
              to="/" 
              className="text-sm font-medium p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/route-planner" 
              className="text-sm font-medium p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              Plan Route
            </Link>
            <Link 
              to="/vendors" 
              className="text-sm font-medium p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              Food Vendors
            </Link>
            <Link 
              to="/orders" 
              className="text-sm font-medium p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              My Orders
            </Link>
            <div className="flex items-center space-x-2 pt-2 border-t">
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
              <Button variant="outline" size="icon">
                <MapPin className="h-4 w-4" />
                <span className="sr-only">Location</span>
              </Button>
              <Button variant="outline" size="icon">
                <ShoppingBag className="h-4 w-4" />
                <span className="sr-only">Cart</span>
              </Button>
              <Button variant="outline" size="icon">
                <User className="h-4 w-4" />
                <span className="sr-only">Account</span>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navigation;
