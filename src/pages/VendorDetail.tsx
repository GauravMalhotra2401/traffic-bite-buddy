
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, Clock, MapPin, ChevronLeft, Plus, Minus, 
  ShoppingBag, Info, Phone, AlertCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useToast } from '@/hooks/use-toast';

// Mock vendor data
const mockVendors = [
  {
    id: '1',
    name: 'Sharma Ji Fast Food',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
    cuisine: 'Street Food',
    rating: 4.5,
    distance: '2 km',
    deliveryTime: '5-10 min',
    location: 'Signal #42, MG Road',
    popular: ['Veg Burger', 'Masala Chai', 'Samosa'],
    phone: '+91 98765 43210',
    description: 'Authentic street food available at traffic signals. Family run business with 15+ years of experience.',
    menu: [
      {
        category: 'Fast Food',
        items: [
          { id: 1, name: 'Veg Burger', price: 80, description: 'Fresh vegetables, cheese and our secret sauce', popular: true },
          { id: 2, name: 'Paneer Tikka Sandwich', price: 100, description: 'Grilled paneer with spices and veggies', popular: false },
          { id: 3, name: 'Aloo Tikki Burger', price: 70, description: 'Spicy potato patty with chutneys', popular: true },
          { id: 4, name: 'French Fries', price: 60, description: 'Crispy potato fries with masala', popular: false },
        ]
      },
      {
        category: 'Snacks',
        items: [
          { id: 5, name: 'Samosa (2 pcs)', price: 30, description: 'Crispy pastry with spiced potato filling', popular: true },
          { id: 6, name: 'Kachori (2 pcs)', price: 40, description: 'Spicy deep-fried snack', popular: false },
          { id: 7, name: 'Bread Pakora', price: 25, description: 'Bread fritters with potato stuffing', popular: false },
        ]
      },
      {
        category: 'Beverages',
        items: [
          { id: 8, name: 'Masala Chai', price: 20, description: 'Traditional Indian spiced tea', popular: true },
          { id: 9, name: 'Cold Coffee', price: 50, description: 'Refreshing cold coffee with ice cream', popular: false },
          { id: 10, name: 'Fresh Lime Soda', price: 30, description: 'Sweet and salty lime soda', popular: false },
        ]
      }
    ]
  }
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const VendorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vendor = mockVendors.find(v => v.id === id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [pickupSignal, setPickupSignal] = useState(vendor?.location || '');
  const { toast } = useToast();
  
  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow py-8">
          <div className="container px-4 md:px-6 text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Vendor Not Found</h1>
            <p className="text-gray-500 mb-6">
              The vendor you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/vendors">Back to Vendors</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const addToCart = (item: { id: number; name: string; price: number }) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    });
  };
  
  const removeFromCart = (itemId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem => 
          cartItem.id === itemId 
            ? { ...cartItem, quantity: cartItem.quantity - 1 } 
            : cartItem
        );
      } else {
        return prevCart.filter(cartItem => cartItem.id !== itemId);
      }
    });
  };
  
  const getItemQuantityInCart = (itemId: number) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };
  
  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };
  
  const getTotalCartPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const handlePlaceOrder = () => {
    // In a real app, this would call an API to place the order
    toast({
      title: "Order placed successfully!",
      description: `Your order will be ready for pickup at ${pickupSignal}`,
      variant: "default",
    });
    setCart([]);
    setIsCheckoutDialogOpen(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        {/* Vendor Header */}
        <div 
          className="h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${vendor.image}?w=1200&h=400&fit=crop&crop=entropy)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="container px-4 md:px-6 relative h-full flex flex-col justify-end pb-6">
            <Button 
              asChild
              variant="outline" 
              size="sm" 
              className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/90"
            >
              <Link to="/vendors">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Vendors
              </Link>
            </Button>
            
            <div className="flex flex-wrap items-end justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center mr-2">
                    <Star className="h-3 w-3 text-traffic-yellow fill-traffic-yellow mr-1" />
                    {vendor.rating}
                  </div>
                  <div className="bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center mr-2">
                    <Clock className="h-3 w-3 mr-1" />
                    {vendor.deliveryTime}
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-1">{vendor.name}</h1>
                <p className="text-white/90">{vendor.cuisine}</p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/90 mr-2"
                  onClick={() => window.open(`tel:${vendor.phone}`)}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/90"
                >
                  <Info className="h-4 w-4 mr-1" />
                  Info
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Location & Description */}
        <div className="bg-white border-b">
          <div className="container px-4 md:px-6 py-4">
            <div className="flex flex-wrap md:flex-nowrap justify-between">
              <div className="flex items-start w-full md:w-auto mb-4 md:mb-0">
                <MapPin className="h-5 w-5 text-traffic-red mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Pickup Location</div>
                  <div className="text-gray-500">{vendor.location}</div>
                </div>
              </div>
              
              <div className="w-full md:w-auto">
                <div className="text-sm">{vendor.description}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Menu Tabs */}
        <div className="container px-4 md:px-6 py-6">
          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {vendor.menu.map((category, index) => (
                    <div key={index} className="mb-8">
                      <h2 className="text-xl font-bold mb-4">{category.category}</h2>
                      <div className="space-y-4">
                        {category.items.map(item => (
                          <div 
                            key={item.id} 
                            className="flex justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                          >
                            <div className="flex-grow pr-4">
                              <div className="flex items-center">
                                <h3 className="font-medium">{item.name}</h3>
                                {item.popular && (
                                  <span className="ml-2 text-xs bg-traffic-red/10 text-traffic-red px-2 py-0.5 rounded-full">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                              <p className="font-medium mt-2">₹{item.price}</p>
                            </div>
                            
                            <div className="flex items-center">
                              {getItemQuantityInCart(item.id) > 0 ? (
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-6 text-center">{getItemQuantityInCart(item.id)}</span>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => addToCart(item)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  variant="outline"
                                  onClick={() => addToCart(item)}
                                >
                                  Add
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg border p-6 sticky top-24">
                    <h2 className="text-xl font-bold mb-4">Your Order</h2>
                    
                    {cart.length > 0 ? (
                      <>
                        <div className="space-y-4 mb-6">
                          {cart.map(item => (
                            <div key={item.id} className="flex justify-between">
                              <div className="flex">
                                <span className="font-medium">{item.quantity}×</span>
                                <span className="ml-2">{item.name}</span>
                              </div>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                          
                          <div className="border-t pt-4 flex justify-between font-bold">
                            <span>Total</span>
                            <span>₹{getTotalCartPrice()}</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full"
                          onClick={() => setIsCheckoutDialogOpen(true)}
                        >
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Checkout ({getTotalCartItems()} items)
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Your cart is empty</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Add items from the menu to place an order
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-2">Reviews Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  We're working on adding customer reviews for this vendor.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="info">
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg border p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">About {vendor.name}</h2>
                  <p className="text-gray-700 mb-4">{vendor.description}</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-traffic-red mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Location</h3>
                        <p className="text-gray-500">{vendor.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-traffic-yellow mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Delivery Time</h3>
                        <p className="text-gray-500">{vendor.deliveryTime}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-traffic-green mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Contact</h3>
                        <p className="text-gray-500">{vendor.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border p-6">
                  <h2 className="text-xl font-bold mb-4">Popular Items</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {vendor.menu.flatMap(category => 
                      category.items.filter(item => item.popular)
                    ).map(item => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="font-medium">₹{item.price}</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => addToCart(item)}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Checkout Dialog */}
        <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Checkout</DialogTitle>
              <DialogDescription>
                Confirm your order details and pickup location
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="font-medium">Order Summary</h3>
                <div className="border rounded-md p-3 space-y-2">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity} × {item.name}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{getTotalCartPrice()}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Pickup Location</h3>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-traffic-red" />
                  <Input 
                    value={pickupSignal}
                    onChange={(e) => setPickupSignal(e.target.value)}
                    placeholder="Confirm pickup signal"
                  />
                </div>
              </div>
              
              <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                <div className="flex">
                  <AlertCircle className="h-4 w-4 text-yellow-800 mr-2 mt-0.5" />
                  <div>
                    <p>Your order will be ready for pickup at the specified traffic signal.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCheckoutDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handlePlaceOrder}>
                Place Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default VendorDetail;
