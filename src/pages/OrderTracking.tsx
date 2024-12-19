import { useState, useEffect } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { settingsService } from '@/services/settingsService';

const timelineVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const eventVariants = {
  hidden: { 
    opacity: 0, 
    x: -20,
  },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState(settingsService.getDefaultCurrency());

  // Fetch tracking data
  const { data: tracking, isLoading, error, isError } = useQuery({
    queryKey: ['order-tracking', orderId],
    queryFn: async () => {
      try {
        const response = await axios.get(`/orders/${orderId}/tracking`);
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch tracking information');
      }
    }
  });

  // Load currency
  useEffect(() => {
    const loadCurrency = async () => {
      await settingsService.fetchSettings();
      setCurrency(settingsService.getDefaultCurrency());
    };
    loadCurrency();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Truck className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-sm text-muted-foreground">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg max-w-md text-center">
          <p className="font-medium mb-2">Error loading tracking information</p>
          <p className="text-sm">{(error as Error)?.message || 'Please try again later.'}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/dashboard/orders')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return null;
  }

  // Format currency
  const formatAmount = (amount: number) => {
    return `${currency}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Back button */}
          <Button
            variant="ghost"
            className="w-fit gap-2"
            onClick={() => navigate('/dashboard/orders')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>

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
                      <h3 className="font-semibold">{tracking.status}</h3>
                      <p className="text-sm text-muted-foreground">
                        Estimated Delivery: {tracking.estimated_delivery}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {tracking.status.toLowerCase()}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Current Location: {tracking.current_location}</span>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="bg-card rounded-lg p-6">
                <h3 className="font-semibold mb-6">Tracking History</h3>
                <motion.div 
                  className="relative space-y-8"
                  variants={timelineVariants}
                  initial="hidden"
                  animate="show"
                >
                  {tracking.timeline.map((event, index) => (
                    <motion.div 
                      key={index} 
                      className="flex gap-4"
                      variants={eventVariants}
                    >
                      <div className="relative">
                        <motion.div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            event.completed
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: index * 0.1 
                          }}
                        >
                          {event.completed ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </motion.div>
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </motion.div>
                        {index !== tracking.timeline.length - 1 && (
                          <motion.div
                            className={cn(
                              "absolute top-8 left-1/2 w-0.5 -translate-x-1/2",
                              event.completed ? "bg-primary" : "bg-muted"
                            )}
                            initial={{ height: 0 }}
                            animate={{ height: 48 }}
                            transition={{ 
                              duration: 0.4,
                              delay: index * 0.2 
                            }}
                          />
                        )}
                      </div>
                      <motion.div 
                        className="flex-1 pb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.4,
                          delay: index * 0.2 + 0.2
                        }}
                      >
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
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-card rounded-lg p-6">
                <h3 className="font-semibold mb-4">Shipping Information</h3>
                <div className="space-y-3 text-sm">
                  <p className="font-medium">{tracking.shipping_address.name}</p>
                  <p>{tracking.shipping_address.address}</p>
                  <p>{`${tracking.shipping_address.city}, ${tracking.shipping_address.state}`}</p>
                  <p className="text-muted-foreground">{tracking.shipping_address.phone}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-card rounded-lg p-6">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-4">
                  {tracking.order_summary.items.map((item) => (
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
                          {formatAmount(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-medium">
                        {formatAmount(tracking.order_summary.total)}
                      </span>
                    </div>
                  </div>
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