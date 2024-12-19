import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Truck,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CartItem, ShippingAddress } from '@/types/store';
import { cn } from "@/lib/utils";
import { useAuthStore } from '@/store/useAuthStore';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { AddressList } from '@/components/shipping/AddressList';
import { shippingService, ShippingAddress as IShippingAddress } from '@/services/shippingService';
import { useCartStore } from '@/store/useCartStore';
import { settingsService } from '@/services/settingsService';
import { storeService } from '@/services/storeService';
import { formatPrice } from '@/lib/formatters';
import { toast } from "sonner";
import { queryClient } from '@/lib/queryClient';

const steps = [
  { id: 'shipping', title: 'Shipping' },
  { id: 'review', title: 'Review' },
  { id: 'payment', title: 'Payment' },
  { id: 'confirmation', title: 'Confirmation' }
];

export default function Checkout() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('shipping');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuthStore();
  const [orderData, setOrderData] = useState<any>(null);

  // Fetch cart data
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: storeService.getCart
  });

  // Get addresses and shipping methods
  const { data: addresses = [] } = useQuery({
    queryKey: ['shipping-addresses'],
    queryFn: shippingService.getAddresses
  });

  const { data: shippingMethods = [], isError: isShippingMethodsError } = useQuery({
    queryKey: ['shipping-methods', selectedAddressId],
    queryFn: () => shippingService.getShippingMethods(selectedAddressId),
    enabled: !!selectedAddressId,
    onError: (error: any) => {
      toast({
        title: "Shipping Not Available",
        description: error.response?.data?.message || "Shipping is not available for this location",
        variant: "destructive"
      });
    }
  });

  // Find selected address and shipping method
  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
  const selectedShippingMethod = shippingMethods.find(method => method.id === selectedShippingMethodId);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && (!cartData || cartData.items.length === 0) && currentStep !== 'confirmation') {
      navigate('/dashboard/cart');
      toast.error("Empty Cart", {
        description: "Your cart is empty. Please add items before checkout."
      });
    }
  }, [cartData, isLoading, navigate, currentStep]);

  if (isLoading || !cartData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">◌</div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = cartData.totals.current;
  const shippingCost = selectedShippingMethod?.rate ?? 0;
  const total = subtotal + shippingCost;

  const handleShippingSubmit = () => {
    if (!selectedAddress) {
      toast.error("Missing Information", {
        description: "Please select a shipping address"
      });
      return;
    }

    if (!selectedShippingMethod) {
      toast.error("Missing Information", {
        description: "Please select a shipping method"
      });
      return;
    }

    setCurrentStep('review');
  };

  const handlePaymentSubmit = async () => {
    console.log('Order Data:', {
      shipping_address_id: selectedAddressId,
      shipping_method_id: selectedShippingMethodId,
      payment_method: paymentMethod
    });

    if (!user?.wallet_balance || user.wallet_balance < total) {
      toast.error("Insufficient Balance", {
        description: "Your wallet balance is insufficient for this purchase."
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await storeService.createOrder({
        shipping_address_id: selectedAddressId!,
        shipping_method_id: selectedShippingMethodId!,
        payment_method: 'wallet',
      });

      setOrderData(response.order);
      setCurrentStep('confirmation');
      
      queryClient.invalidateQueries(['cart']);
      queryClient.invalidateQueries(['wallet']);
      queryClient.invalidateQueries(['orders']);

      toast.success("Order Placed Successfully", {
        description: "Your order has been confirmed and is being processed."
      });

    } catch (error: any) {
      console.error('Payment Error:', error.response?.data);
      
      // Show detailed error with sonner
      toast.error("Payment Failed", {
        description: error.response?.data?.message || "Failed to process payment. Please try again."
      });

      // If there are validation errors, show them
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((errorMessages: any) => {
          errorMessages.forEach((message: string) => {
            toast.error(message);
          });
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center px-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2",
                    currentStep === step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted bg-background",
                    index < steps.findIndex(s => s.id === currentStep)
                      && "border-primary bg-primary text-primary-foreground"
                  )}
                >
                  {index < steps.findIndex(s => s.id === currentStep) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 mx-1 md:mx-2",
                      "w-12 md:w-20",
                      index < steps.findIndex(s => s.id === currentStep)
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <p className="text-sm font-medium">
              {steps.find(step => step.id === currentStep)?.title}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary - Will appear first on mobile */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="bg-card p-6 rounded-lg space-y-4 sticky top-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="space-y-4">
                {cartData.items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                      <p className="font-medium">
                        {formatPrice(item.product.price * item.quantity, cartData.currency)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal, cartData.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Shipping
                      {selectedShippingMethod && (
                        <span className="text-xs block">
                          ({selectedShippingMethod.name})
                        </span>
                      )}
                    </span>
                    <span>{formatPrice(shippingCost, cartData.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2">
                    <span>Total</span>
                    <span>{formatPrice(total, cartData.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Will appear second on mobile */}
          <div className="lg:col-span-2 order-last lg:order-first">
            <AnimatePresence mode="wait">
              {currentStep === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <AddressList 
                    selectedId={selectedAddressId}
                    onSelect={setSelectedAddressId}
                  />

                  {selectedAddressId && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Select Shipping Method</h3>
                      {shippingMethods.length > 0 ? (
                        <RadioGroup
                          value={selectedShippingMethodId || undefined}
                          onValueChange={setSelectedShippingMethodId}
                          className="space-y-3"
                        >
                          {shippingMethods.map((method) => (
                            <div key={method.id} className="flex items-center">
                              <RadioGroupItem value={method.id} id={method.id} className="peer" />
                              <label
                                htmlFor={method.id}
                                className="flex flex-1 items-center justify-between rounded-lg border p-4 ml-2 cursor-pointer peer-data-[state=checked]:border-primary"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{method.name}</p>
                                    {!method.is_zone_specific && (
                                      <Badge variant="secondary" className="text-xs">
                                        Base Rate
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {method.description}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Estimated delivery: {method.estimated_days_min}-{method.estimated_days_max} days
                                  </p>
                                </div>
                                <p className="font-medium">
                                  {formatPrice(method.rate, cartData.currency)}
                                </p>
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
                          Shipping is not available for this location. Please select a different delivery address.
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/dashboard/cart')}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to Cart
                    </Button>
                    <Button 
                      onClick={handleShippingSubmit}
                      disabled={!selectedAddressId || !selectedShippingMethodId}
                      className="gap-2"
                    >
                      Review Purchase
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Shipping Address Review */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Shipping Address</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setCurrentStep('shipping')}
                        className="text-primary"
                      >
                        Edit
                      </Button>
                    </div>
                    {selectedAddress && (
                      <div className="text-sm space-y-1">
                        <p className="font-medium">
                          {selectedAddress.first_name} {selectedAddress.last_name}
                        </p>
                        <p>{selectedAddress.address}</p>
                        <p>{`${selectedAddress.city}, ${selectedAddress.state.name}`}</p>
                        <p>{selectedAddress.phone}</p>
                        <p>{selectedAddress.email}</p>
                      </div>
                    )}
                  </div>

                  {/* Order Review */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold">Order Details</h3>
                    <div className="space-y-4">
                      {cartData.items.map((item) => (
                        <div key={item.product.id} className="flex gap-4">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                            <p className="font-medium">
                              {formatPrice(item.product.price * item.quantity, cartData.currency)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold">Cost Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal, cartData.currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>{formatPrice(shippingCost, cartData.currency)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>{formatPrice(total, cartData.currency)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('shipping')}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to Shipping
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep('payment')} 
                      className="gap-2"
                    >
                      Make Payment
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-muted/50 p-6 rounded-lg space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Payment Method</h3>
                      <Badge variant="secondary">Wallet Payment</Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-4">
                        {/* Wallet Balance Card */}
                        <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <Wallet className="h-5 w-5 shrink-0 text-primary" />
                            <div className="min-w-0"> {/* Prevent text overflow */}
                              <p className="font-medium truncate">Wallet Balance</p>
                              <p className="text-sm text-muted-foreground">
                                Available: {formatPrice(user?.wallet_balance || 0, cartData.currency)}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-start sm:justify-end items-center">
                            {user?.wallet_balance && user.wallet_balance >= total ? (
                              <Badge 
                                variant="success" 
                                className="bg-green-500/10 text-green-500 whitespace-nowrap"
                              >
                                Sufficient Balance
                              </Badge>
                            ) : (
                              <Badge 
                                variant="destructive"
                                className="whitespace-nowrap"
                              >
                                Insufficient Balance
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Order Total Card */}
                        <div className="p-4 border rounded-lg space-y-3">
                          <p className="font-medium">Order Total</p>
                          <p className="text-2xl font-bold">
                            {formatPrice(total, cartData.currency)}
                          </p>
                          {user?.wallet_balance && user.wallet_balance < total && (
                            <div className="space-y-3">
                              <p className="text-sm text-destructive break-words">
                                You need {formatPrice(total - user.wallet_balance, cartData.currency)} more in your wallet
                              </p>
                              <Button 
                                variant="outline" 
                                className="w-full gap-2"
                                onClick={() => navigate('/dashboard/wallet')}
                              >
                                <Wallet className="h-4 w-4 shrink-0" />
                                Fund Wallet
                              </Button>
                              <p className="text-xs text-muted-foreground text-center">
                                You'll be redirected to the wallet dashboard to add funds
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('review')}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to Review
                    </Button>
                    <Button 
                      onClick={handlePaymentSubmit}
                      disabled={isProcessing || !user?.wallet_balance || user.wallet_balance < total}
                      className="gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Complete Purchase
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'confirmation' && orderData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="text-center mb-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Order Confirmed!</h2>
                    <p className="text-muted-foreground">
                      Your order #{orderData.id} has been placed successfully
                    </p>
                  </div>

                  <div className="bg-card p-6 rounded-lg space-y-4">
                    <div className="border-b pb-4">
                      <h3 className="font-semibold mb-2">Shipping Details</h3>
                      <p>{orderData.shipping_address.first_name} {orderData.shipping_address.last_name}</p>
                      <p>{orderData.shipping_address.address}</p>
                      <p>{orderData.shipping_address.city}, {orderData.shipping_address.state.name}</p>
                      <p>Phone: {orderData.shipping_address.phone}</p>
                    </div>

                    <div className="border-b pb-4">
                      <h3 className="font-semibold mb-2">Order Summary</h3>
                      {orderData.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between py-2">
                          <div>
                            <p>{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p>{formatPrice(item.total)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p>Subtotal</p>
                        <p>{formatPrice(orderData.subtotal)}</p>
                      </div>
                      <div className="flex justify-between">
                        <p>Shipping</p>
                        <p>{formatPrice(orderData.shipping_cost)}</p>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <p>Total</p>
                        <p>{formatPrice(orderData.total)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <Button 
                      onClick={() => navigate('/dashboard/orders')} 
                      className="gap-2"
                    >
                      View Orders
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
} 