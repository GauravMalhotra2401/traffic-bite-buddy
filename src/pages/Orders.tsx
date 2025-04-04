
import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

// Mock order data
const mockOrders = [
  {
    id: 'ORD-1234',
    vendorName: 'Sharma Ji Fast Food',
    items: [
      { name: 'Veg Burger', quantity: 1, price: 80 },
      { name: 'Masala Chai', quantity: 2, price: 20 }
    ],
    total: 120,
    status: 'active',
    pickupLocation: 'Signal #42, MG Road',
    estimatedTime: '5 min',
    placedAt: '2023-04-04T15:30:00'
  },
  {
    id: 'ORD-1235',
    vendorName: 'Punjabi Dhaba',
    items: [
      { name: 'Butter Paratha', quantity: 2, price: 40 },
      { name: 'Lassi', quantity: 1, price: 50 }
    ],
    total: 130,
    status: 'completed',
    pickupLocation: 'Signal #15, GT Road',
    estimatedTime: '0 min',
    placedAt: '2023-04-04T12:15:00',
    completedAt: '2023-04-04T12:50:00'
  },
  {
    id: 'ORD-1236',
    vendorName: 'Royal Tea Stall',
    items: [
      { name: 'Cutting Chai', quantity: 4, price: 15 },
      { name: 'Bun Maska', quantity: 2, price: 30 }
    ],
    total: 120,
    status: 'cancelled',
    pickupLocation: 'Signal #28, Ring Road',
    estimatedTime: '0 min',
    placedAt: '2023-04-03T18:30:00',
    cancelledAt: '2023-04-03T18:45:00',
    cancellationReason: 'Vendor could not prepare order in time'
  },
  {
    id: 'ORD-1237',
    vendorName: 'South Express',
    items: [
      { name: 'Masala Dosa', quantity: 1, price: 80 },
      { name: 'Filter Coffee', quantity: 1, price: 30 }
    ],
    total: 110,
    status: 'completed',
    pickupLocation: 'Signal #36, Outer Ring Road',
    estimatedTime: '0 min',
    placedAt: '2023-04-03T09:00:00',
    completedAt: '2023-04-03T09:30:00'
  }
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <Clock className="h-5 w-5 text-blue-500" />;
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'cancelled':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  }
};

const getStatusBadge = (status: string) => {
  let bgColor, textColor;
  
  switch (status) {
    case 'active':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'completed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'cancelled':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    default:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const OrderCard: React.FC<{ order: typeof mockOrders[0] }> = ({ order }) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex flex-wrap justify-between items-start mb-4">
          <div>
            <div className="flex items-center mb-1">
              <h3 className="font-bold text-lg mr-3">{order.vendorName}</h3>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-sm text-gray-500">
              Order {order.id} • {formatDate(order.placedAt)}
            </p>
          </div>
          <div className="flex items-center mt-2 sm:mt-0">
            {getStatusIcon(order.status)}
            <span className="ml-2 text-sm font-medium">
              {order.status === 'active' 
                ? `Ready in ${order.estimatedTime}` 
                : order.status === 'completed'
                ? `Completed ${formatDate(order.completedAt)}`
                : `Cancelled ${formatDate(order.cancelledAt)}`}
            </span>
          </div>
        </div>
        
        <div className="border-t border-dashed border-gray-200 pt-4 mt-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Order Items</h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Pickup Location</h4>
            <p className="text-sm text-gray-600">{order.pickupLocation}</p>
          </div>
          
          {order.status === 'cancelled' && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 text-red-600">Cancellation Reason</h4>
              <p className="text-sm text-gray-600">{order.cancellationReason}</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            {order.status === 'active' && (
              <>
                <Button variant="outline" size="sm">
                  Cancel Order
                </Button>
                <Button size="sm">
                  Track Order
                </Button>
              </>
            )}
            {order.status === 'completed' && (
              <Button variant="outline" size="sm">
                Reorder
              </Button>
            )}
            {order.status === 'cancelled' && (
              <Button variant="outline" size="sm">
                Reorder
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Orders: React.FC = () => {
  const activeOrders = mockOrders.filter(order => order.status === 'active');
  const completedOrders = mockOrders.filter(order => order.status === 'completed');
  const cancelledOrders = mockOrders.filter(order => order.status === 'cancelled');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow py-8">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-gray-500 mt-2">
              Track and manage your current and past orders
            </p>
          </div>
          
          <Tabs defaultValue="active" className="w-full">
            <div className="border-b mb-6">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="active" className="relative">
                  Active
                  {activeOrders.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-traffic-red text-[10px] font-medium text-white">
                      {activeOrders.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                <TabsTrigger value="all">All Orders</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="active">
              {activeOrders.length > 0 ? (
                activeOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No active orders</h3>
                  <p className="text-gray-500 mb-6">
                    You don't have any active orders at the moment.
                  </p>
                  <Button asChild>
                    <a href="/vendors">Browse Vendors</a>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {completedOrders.length > 0 ? (
                completedOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No completed orders</h3>
                  <p className="text-gray-500 mb-6">
                    You don't have any completed orders yet.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="cancelled">
              {cancelledOrders.length > 0 ? (
                cancelledOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <div className="text-center py-12">
                  <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No cancelled orders</h3>
                  <p className="text-gray-500 mb-6">
                    You don't have any cancelled orders.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all">
              {mockOrders.length > 0 ? (
                mockOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
                  <p className="text-gray-500 mb-6">
                    You haven't placed any orders yet.
                  </p>
                  <Button asChild>
                    <a href="/vendors">Browse Vendors</a>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
