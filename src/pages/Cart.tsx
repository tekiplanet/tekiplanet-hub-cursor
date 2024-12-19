import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowRight,
  ChevronLeft,
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CartItem } from '@/types/store';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { storeService } from '@/services/storeService';
import PagePreloader from '@/components/ui/PagePreloader';
import { formatPrice } from '@/lib/formatters';

export default function Cart() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  // Fetch cart data
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: storeService.getCart
  });

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingItemId(itemId);
    
    try {
      await storeService.updateCartItemQuantity(itemId, newQuantity);
      queryClient.invalidateQueries(['cart', 'cartCount']);
    } catch (error: any) {
      if (error.response?.status === 422) {
        toast({
          title: "Cannot update quantity",
          description: error.response.data.message,
          variant: "destructive"
        });
      }
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdatingItemId(itemId);
    try {
      await storeService.removeCartItem(itemId);
      queryClient.invalidateQueries(['cart', 'cartCount']);
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      });
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (isLoading) {
    return <PagePreloader />;
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon>
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </EmptyPlaceholder.Icon>
            <EmptyPlaceholder.Title>Your cart is empty</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              Start shopping to add items to your cart
            </EmptyPlaceholder.Description>
            <Button onClick={() => navigate('/dashboard/store')}>
              Continue Shopping
            </Button>
          </EmptyPlaceholder>
        </div>
      </div>
    );
  }

  const subtotal = cartData.totals.current;
  const shipping = 2999.99; // We can make this dynamic later
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Shopping Cart ({cartData.items.length})</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cartData.items.map((item) => (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex gap-4 bg-card p-4 rounded-lg"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="font-bold">
                        {formatPrice(item.product.price * item.quantity, cartData.currency)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.product.price, cartData.currency)} each
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingItemId === item.id}
                        >
                          {updatingItemId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Minus className="h-4 w-4" />
                          )}
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updatingItemId === item.id}
                        >
                          {updatingItemId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => removeItem(item.id)}
                        disabled={updatingItemId === item.id}
                      >
                        {updatingItemId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card p-6 rounded-lg space-y-4 sticky top-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">
                    {formatPrice(cartData.totals.current, cartData.currency)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  * Shipping costs will be calculated at checkout
                </p>
              </div>
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={() => navigate('/dashboard/checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 