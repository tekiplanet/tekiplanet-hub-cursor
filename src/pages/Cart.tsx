import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowRight,
  ChevronLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CartItem } from '@/types/store';
import { EmptyPlaceholder } from '@/components/empty-placeholder';

// Mock cart data
const cartItems: CartItem[] = [
  {
    product: {
      id: '1',
      name: 'Professional Powerstation X1',
      description: 'High-capacity portable power station...',
      price: 999.99,
      images: ['https://images.unsplash.com/photo-1592833159155-c62df1b65634?ixlib=rb-4.0.3...'],
      category: 'Powerstation',
      rating: 4.8,
      reviews: 124,
      stock: 15,
      specifications: {},
      features: []
    },
    quantity: 1
  },
  {
    product: {
      id: '2',
      name: 'Gaming PC RTX 4090',
      description: 'High-end gaming desktop...',
      price: 2499.99,
      images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?ixlib=rb-4.0.3...'],
      category: 'Desktop PCs',
      rating: 4.9,
      reviews: 89,
      stock: 5,
      specifications: {},
      features: []
    },
    quantity: 1
  },
];

export default function Cart() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>(cartItems);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setItems(items.map(item => 
      item.product.id === itemId 
        ? { ...item, quantity: Math.max(1, Math.min(newQuantity, item.product.stock)) }
        : item
    ));
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.product.id !== itemId));
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart",
    });
  };

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = 29.99;
  const total = subtotal + shipping;

  if (items.length === 0) {
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
            <Button onClick={() => navigate('/store')}>
              Continue Shopping
            </Button>
          </EmptyPlaceholder>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => navigate('/store')}
          >
            <ChevronLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
          <h1 className="text-2xl font-bold">Shopping Cart ({items.length})</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
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
                      <p className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} each</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Including VAT
                  </p>
                </div>
              </div>
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={() => navigate('/checkout')}
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