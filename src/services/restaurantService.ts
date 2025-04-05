import { TrafficLight } from './routeService';
import { toast } from "sonner";

export interface MenuItem {
  name: string;
  description?: string;
  price?: number;
  category?: string;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  image?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  type: string; // Type of food vendor (restaurant, food_stall, food_cart, etc.)
  rating?: number;
  cuisine?: string;
  distance?: number; // distance from traffic light in meters
  isOpen?: boolean;
  photoUrl?: string;
  address?: string;
  priceLevel?: number; // 1-4 representing $ to $$$$
  phoneNumber?: string;
  website?: string;
  openingHours?: {
    [key: string]: string; // e.g., "Monday": "9:00 AM - 10:00 PM"
  };
  menu?: MenuItem[];
  features?: string[]; // e.g., ["Outdoor Seating", "Delivery", "Takeout"]
  averageMealPrice?: number;
  popularDishes?: string[];
  dietaryOptions?: string[]; // e.g., ["Vegetarian", "Vegan", "Gluten-Free"]
  reviews?: {
    rating: number;
    text: string;
    author: string;
    date: string;
  }[];
  // Additional fields for food stalls and carts
  isTemporary?: boolean;
  paymentMethods?: string[];
  specialties?: string[];
  servingTime?: string;
  isMobile?: boolean;
  lastKnownLocation?: string;
}

export interface RestaurantsByTrafficLight {
  trafficLightId: string;
  trafficLightLocation: {
    lat: number;
    lng: number;
  };
  restaurants: Restaurant[];
}

// Function to fetch restaurants near a specific traffic light
export async function fetchNearbyRestaurants(
  lat: number,
  lng: number,
  radius: number = 200 // Default 200 meters radius
): Promise<Restaurant[]> {
  try {
    // Using Overpass API to fetch restaurants and food-related amenities
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"restaurant|cafe|fast_food|food_court"](around:${radius},${lat},${lng});
        way["amenity"~"restaurant|cafe|fast_food|food_court"](around:${radius},${lat},${lng});
      );
      out body;
      >;
      out skel qt;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch restaurants');
    }

    const data = await response.json();
    
    // Process and format the restaurant data
    const restaurants: Restaurant[] = data.elements
      .filter((element: any) => element.tags && (
        element.tags.amenity === 'restaurant' ||
        element.tags.amenity === 'cafe' ||
        element.tags.amenity === 'fast_food' ||
        element.tags.amenity === 'food_court'
      ))
      .map((element: any) => {
        const lat = element.lat || (element.center && element.center.lat);
        const lng = element.lon || (element.center && element.center.lon);
        
        if (!lat || !lng) return null;

        return {
          id: `${element.type}${element.id}`,
          name: element.tags.name || 'Unnamed Restaurant',
          location: { lat, lng },
          cuisine: element.tags.cuisine || undefined,
          address: element.tags.address || element.tags['addr:full'] || undefined,
          isOpen: element.tags.opening_hours ? true : undefined, // Basic open status
          priceLevel: element.tags.price_level ? parseInt(element.tags.price_level) : undefined,
          phoneNumber: element.tags.phone || element.tags['contact:phone'],
          website: element.tags.website || element.tags['contact:website'],
          openingHours: element.tags.opening_hours ? {
            'Hours': element.tags.opening_hours
          } : undefined,
          features: [
            element.tags.outdoor_seating && 'Outdoor Seating',
            element.tags.takeaway && 'Takeout',
            element.tags.delivery && 'Delivery',
            element.tags.wheelchair && 'Wheelchair Accessible',
            element.tags.internet_access && 'Wi-Fi'
          ].filter(Boolean),
          dietaryOptions: [
            element.tags.diet_vegetarian && 'Vegetarian',
            element.tags.diet_vegan && 'Vegan',
            element.tags.diet_halal && 'Halal',
            element.tags.diet_kosher && 'Kosher',
            element.tags.gluten_free && 'Gluten-Free'
          ].filter(Boolean)
        };
      })
      .filter(Boolean); // Remove null entries

    return restaurants;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    toast.error("Failed to fetch nearby restaurants");
    return [];
  }
}

// Function to fetch restaurants for all traffic lights on a route
export async function fetchRestaurantsForRoute(trafficLights: TrafficLight[]): Promise<RestaurantsByTrafficLight[]> {
  try {
    const results: RestaurantsByTrafficLight[] = [];
    
    for (const signal of trafficLights) {
      // Create a comprehensive query for all types of food vendors
      const query = `
        [out:json][timeout:25];
        (
          // Traditional restaurants
          node["amenity"="restaurant"](around:200, ${signal.coordinates.lat}, ${signal.coordinates.lng});
          node["amenity"="cafe"](around:200, ${signal.coordinates.lat}, ${signal.coordinates.lng});
          node["amenity"="fast_food"](around:200, ${signal.coordinates.lat}, ${signal.coordinates.lng});
          
          // Food stalls and street vendors
          node["amenity"="food_court"](around:200, ${signal.coordinates.lat}, ${signal.coordinates.lng});
          node["shop"="food"](around:200, ${signal.coordinates.lat}, ${signal.coordinates.lng});
          node["stall"="food"](around:200, ${signal.coordinates.lat}, ${signal.coordinates.lng});
          node["amenity"="marketplace"]["food"="yes"](around:200, ${signal.coordinates.lat}, ${signal.coordinates.lng});
          
          // Street food and mobile vendors
          node["amenity"="food_cart"](around:200, ${signal.coordinates.lat}, ${signal.coordinates.lng});
          node["amenity"="street_vendor"]["food"="yes"](around:200, ${signal.coordinates.lat}, ${signal.coordinates.lng});
          node["shop"="street_food"](around:200, ${signal.coordinates.lat}, ${signal.coordinates.lng});
          
          // Additional food places
          node["shop"="convenience"]["food"="yes"](around:200, ${signal.coordinates.lat}, ${signal.coordinates.lng});
          node["amenity"="ice_cream"](around:200, ${signal.coordinates.lat}, ${signal.coordinates.lng});
          node["shop"="bakery"](around:200, ${signal.coordinates.lat}, ${signal.coordinates.lng});
          node["shop"="deli"](around:200, ${signal.coordinates.lat}, ${signal.coordinates.lng});
        );
        out body;
        >;
        out skel qt;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch food vendors');
      }
      
      const data = await response.json();
      
      // Process food vendors from the response
      const restaurants: Restaurant[] = data.elements.map((element: any) => {
        // Determine the type of food vendor
        let vendorType = 'unknown';
        if (element.tags.amenity === 'restaurant') vendorType = 'Restaurant';
        else if (element.tags.amenity === 'cafe') vendorType = 'Cafe';
        else if (element.tags.amenity === 'fast_food') vendorType = 'Fast Food';
        else if (element.tags.amenity === 'food_court') vendorType = 'Food Court';
        else if (element.tags.amenity === 'food_cart') vendorType = 'Food Cart';
        else if (element.tags.amenity === 'street_vendor') vendorType = 'Street Vendor';
        else if (element.tags.shop === 'food') vendorType = 'Food Shop';
        else if (element.tags.stall === 'food') vendorType = 'Food Stall';
        else if (element.tags.shop === 'bakery') vendorType = 'Bakery';
        else if (element.tags.shop === 'deli') vendorType = 'Delicatessen';
        else if (element.tags.amenity === 'ice_cream') vendorType = 'Ice Cream Shop';

        // Check if it's a mobile vendor
        const isMobile = element.tags.mobile === 'yes' || 
                        element.tags.amenity === 'food_cart' || 
                        element.tags.amenity === 'street_vendor';

        return {
          id: element.id.toString(),
          name: element.tags.name || `Unnamed ${vendorType}`,
          type: vendorType,
          location: {
            lat: element.lat,
            lng: element.lon
          },
          cuisine: element.tags.cuisine,
          address: element.tags['addr:full'] || [
            element.tags['addr:street'],
            element.tags['addr:housenumber'],
            element.tags['addr:city']
          ].filter(Boolean).join(', '),
          isOpen: element.tags.opening_hours ? !element.tags.opening_hours.includes('closed') : undefined,
          phoneNumber: element.tags.phone || element.tags['contact:phone'],
          website: element.tags.website || element.tags['contact:website'],
          openingHours: element.tags.opening_hours ? {
            'Hours': element.tags.opening_hours
          } : undefined,
          features: [
            element.tags.outdoor_seating && 'Outdoor Seating',
            element.tags.takeaway && 'Takeout',
            element.tags.delivery && 'Delivery',
            element.tags.wheelchair && 'Wheelchair Accessible',
            element.tags.internet_access && 'Wi-Fi',
            element.tags.drive_through && 'Drive Through'
          ].filter(Boolean),
          dietaryOptions: [
            element.tags.diet_vegetarian && 'Vegetarian',
            element.tags.diet_vegan && 'Vegan',
            element.tags.diet_halal && 'Halal',
            element.tags.diet_kosher && 'Kosher',
            element.tags.gluten_free && 'Gluten-Free'
          ].filter(Boolean),
          priceLevel: element.tags.price_range ? 
            element.tags.price_range.split('').length :
            undefined,
          specialties: element.tags.specialties ? element.tags.specialties.split(';') : undefined,
          isMobile,
          isTemporary: element.tags.temporary === 'yes',
          paymentMethods: [
            element.tags.payment_cash && 'Cash',
            element.tags.payment_cards && 'Cards',
            element.tags.payment_debit_cards && 'Debit Cards',
            element.tags.payment_credit_cards && 'Credit Cards',
            element.tags.payment_mobile && 'Mobile Payment'
          ].filter(Boolean),
          servingTime: element.tags.service_hours || element.tags.opening_hours
        };
      });
      
      results.push({
        trafficLightId: signal.id,
        trafficLightLocation: {
          lat: signal.coordinates.lat,
          lng: signal.coordinates.lng
        },
        restaurants
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching food vendors:', error);
    toast.error('Failed to fetch nearby food vendors');
    return [];
  }
} 