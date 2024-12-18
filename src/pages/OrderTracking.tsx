import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  ArrowLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock data for order tracking
const orderDetails = {
  id: 'ORD-001',
  date: '2024-03-15',
  total: 999.99,
  status: 'in_transit',
  items: [
    {
      id: 1,
      name: 'Professional Powerstation X1',
      quantity: 1,
      price: 999.99,
      image: 'https://www.motortrend.com/uploads/2023/02/001-kelin-tools-blackfire-pac-1000-1500-watt-portable-power-station-review.jpg',
    }
  ],
  tracking: {
    number: 'TRK123456789',
    carrier: 'DHL',
    status: 'In Transit',
    estimatedDelivery: '2024-03-18',
    currentLocation: 'Lagos, Nigeria',
    timeline: [
      {
        status: 'Delivered',
        date: '2024-03-18 14:30',
        location: 'Lagos, Nigeria',
        description: 'Package delivered successfully',
        completed: false,
      },
      {
        status: 'Out for Delivery',
        date: '2024-03-18 09:15',
        location: 'Lagos, Nigeria',
        description: 'Package is out for delivery',
        completed: false,
      },
      {
        status: 'In Transit',
        date: '2024-03-17 15:45',
        location: 'Lagos Distribution Center',
        description: 'Package arrived at local facility',
        completed: true,
      },
      {
        status: 'Shipped',
        date: '2024-03-16 10:20',
        location: 'Warehouse',
        description: 'Package has been shipped',
        completed: true,
      },
      {
        status: 'Order Confirmed',
        date: '2024-03-15 16:00',
        location: 'Online',
        description: 'Order has been confirmed',
        completed: true,
      },
    ],
  },
  shippingAddress: {
    name: 'John Doe',
    address: '123 Main Street',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    phone: '+234 123 456 7890',
  },
};

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tracking Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Status */}
              <div className="bg-card rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{orderDetails.tracking.status}</h3>
                      <p className="text-sm text-muted-foreground">
                        Estimated Delivery: {new Date(orderDetails.tracking.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {orderDetails.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Current Location: {orderDetails.tracking.currentLocation}</span>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="bg-card rounded-lg p-6">
                <h3 className="font-semibold mb-6">Tracking History</h3>
                <div className="relative space-y-8">
                  {orderDetails.tracking.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            event.completed
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {event.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        {index !== orderDetails.tracking.timeline.length - 1 && (
                          <div
                            className={cn(
                              "absolute top-8 left-1/2 w-0.5 h-12 -translate-x-1/2",
                              event.completed ? "bg-primary" : "bg-muted"
                            )}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <h4 className="font-medium">{event.status}</h4>
                          <time className="text-sm text-muted-foreground">
                            {event.date}
                          </time>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                        <p className="text-sm mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {event.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-card rounded-lg p-6">
                <h3 className="font-semibold mb-4">Shipping Information</h3>
                <div className="space-y-3 text-sm">
                  <p className="font-medium">{orderDetails.shippingAddress.name}</p>
                  <p>{orderDetails.shippingAddress.address}</p>
                  <p>{`${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state}`}</p>
                  <p>{orderDetails.shippingAddress.country}</p>
                  <p className="text-muted-foreground">{orderDetails.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-card rounded-lg p-6">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-4">
                  {orderDetails.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Invoice
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 