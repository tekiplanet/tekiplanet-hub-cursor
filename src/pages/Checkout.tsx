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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
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

const steps = [
  { id: 'shipping', title: 'Shipping' },
  { id: 'review', title: 'Review' },
  { id: 'payment', title: 'Payment' },
  { id: 'confirmation', title: 'Confirmation' }
];

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState('shipping');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuthStore();

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

  const { data: shippingMethods = [] } = useQuery({
    queryKey: ['shipping-methods', selectedAddressId],
    queryFn: () => shippingService.getShippingMethods(selectedAddressId),
    enabled: !!selectedAddressId // Only fetch when address is selected
  });

  // Find selected address and shipping method
  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
  const selectedShippingMethod = shippingMethods.find(method => method.id === selectedShippingMethodId);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && (!cartData || cartData.items.length === 0)) {
      navigate('/dashboard/cart');
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive"
      });
    }
  }, [cartData, isLoading, navigate]);

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
      toast({
        title: "Missing Information",
        description: "Please select a shipping address",
        variant: "destructive"
      });
      return;
    }

    if (!selectedShippingMethod) {
      toast({
        title: "Missing Information",
        description: "Please select a shipping method",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep('review');
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
                        {cartData.currency}{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{cartData.currency}{subtotal.toFixed(2)}</span>
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
                    <span>{cartData.currency}{shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2">
                    <span>Total</span>
                    <span>{cartData.currency}{total.toFixed(2)}</span>
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

                  {selectedAddressId && shippingMethods.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Select Shipping Method</h3>
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
                                <p className="font-medium">{method.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {method.description}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Estimated delivery: {method.estimated_days_min}-{method.estimated_days_max} days
                                </p>
                              </div>
                              <p className="font-medium">
                                {cartData.currency}{typeof method.rate === 'number' 
                                    ? method.rate.toFixed(2) 
                                    : parseFloat(method.rate).toFixed(2)}
                              </p>
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
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
                              {cartData.currency}{(item.product.price * item.quantity).toFixed(2)}
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
                        <span>{cartData.currency}{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>{cartData.currency}{shippingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>{cartData.currency}{total.toFixed(2)}</span>
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
                      Continue to Payment
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

                    <div className="flex items-center justify-between p-4 bg-black rounded-lg">
                      <p className="font-medium text-white">Wallet Balance</p>
                      <span className="text-xl font-bold text-white">${user?.wallet_balance?.toFixed(2) || '0.00'}</span>
                    </div>



                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-4 bg-background rounded-lg border">
                        <div>
                          <p className="font-medium">Amount to Pay</p>
                          <p className="text-sm text-muted-foreground">Total order value</p>
                        </div>
                        <p className="text-xl font-bold text-primary">${total.toFixed(2)}</p>
                      </div>

                      {user?.wallet_balance < total && (
                        <div className="flex items-start gap-2 bg-destructive/10 text-destructive p-4 rounded-lg">
                          <div className="shrink-0 mt-0.5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-5 w-5"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Insufficient Balance</p>
                            <p className="text-sm mt-1">
                              Please add ${(total - (user?.wallet_balance || 0)).toFixed(2)} to your wallet to complete this purchase.
                            </p>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="mt-2"
                              onClick={() => navigate('/dashboard/wallet')}
                            >
                              Fund Wallet
                            </Button>
                          </div>
                        </div>
                      )}

                      {user?.wallet_balance >= total && (
                        <div className="flex items-start gap-2 bg-green-500/10 text-green-600 p-4 rounded-lg">
                          <div className="shrink-0 mt-0.5">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Sufficient Balance</p>
                            <p className="text-sm mt-1">
                              Your wallet balance is sufficient to complete this purchase.
                            </p>
                          </div>
                        </div>
                      )}
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
                      disabled={isProcessing || user?.wallet_balance < total}
                      className="gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <span className="animate-spin">◌</span>
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

              {currentStep === 'confirmation' && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 mb-8">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Order Confirmed!</h2>
                  <p className="text-muted-foreground mb-8">
                    Your order has been placed successfully.
                    We'll send you an email with your order details.
                  </p>
                  <Button 
                    onClick={() => navigate('/dashboard/orders')} 
                    className="gap-2"
                  >
                    View Orders
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
} 