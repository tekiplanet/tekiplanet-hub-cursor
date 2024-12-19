import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/formatters';
import { Product } from '@/types/store';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { storeService } from '@/services/storeService';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  currency: string;
  onNavigate: () => void;
}

export function ProductCard({ product, currency, onNavigate }: ProductCardProps) {
  const queryClient = useQueryClient();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    storeService.checkWishlistStatus(product.id)
      .then(status => setIsWishlisted(status))
      .catch(() => {});
  }, [product.id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      await storeService.addToCart(product.id, 1);
      queryClient.invalidateQueries(['cart', 'cartCount']);
      toast.success('Added to cart', {
        description: `${product.name} added to your cart`
      });
    } catch (error: any) {
      if (error.response?.status === 422) {
        toast.error('Cannot add to cart', {
          description: error.response.data.message
        });
      } else {
        toast.error('Error', {
          description: 'Failed to add item to cart'
        });
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTogglingWishlist(true);
    try {
      const response = await storeService.toggleWishlist(product.id);
      setIsWishlisted(response.is_wishlisted);
      queryClient.invalidateQueries(['wishlistCount']);
      toast.success(response.message);
    } catch (error) {
      toast.error('Failed to update wishlist');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card rounded-lg overflow-hidden group cursor-pointer"
      onClick={onNavigate}
    >
      <div className="relative aspect-square">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Button 
            size="icon" 
            variant="secondary" 
            className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
          >
            {isTogglingWishlist ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-current text-red-500")} />
            )}
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock === 0}
          >
            {isAddingToCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="p-4">
        <Badge variant="secondary" className="mb-2">
          {product.category}
        </Badge>
        <h3 className="font-semibold mb-2">{product.name}</h3>
        <div className="flex justify-between items-center">
          <p className="text-lg font-bold">
            {formatPrice(product.price, currency)}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.reviews_count})
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 