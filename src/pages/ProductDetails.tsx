import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs, Pagination } from 'swiper/modules';
import {
  ShoppingCart,
  Heart,
  Star,
  Check,
  Minus,
  Plus,
  Share2,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { storeService } from '@/services/storeService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatPrice } from '@/lib/formatters';
import PagePreloader from '@/components/ui/PagePreloader';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const queryClient = useQueryClient();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Fetch product details
  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => storeService.getProductDetails(id!),
    enabled: !!id
  });

  const product = productData?.product;
  const currency = productData?.currency || '₦';

  useEffect(() => {
    if (product?.id) {
      storeService.checkWishlistStatus(product.id)
        .then(status => setIsWishlisted(status))
        .catch(() => {});
    }
  }, [product?.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      await storeService.addToCart(product.id, quantity);
      
      // Invalidate cart query to refresh cart data
      queryClient.invalidateQueries(['cart']);
      
      toast.success('Added to cart', {
        description: `${product.name} x ${quantity} added to your cart`
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

  const handleToggleWishlist = async () => {
    if (!product) return;
    
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

  const handleBuyNow = async () => {
    if (!product) return;
    
    setIsBuyingNow(true);
    try {
      await storeService.addToCart(product.id, quantity);
      queryClient.invalidateQueries(['cart', 'cartCount']);
      navigate('/dashboard/cart');
    } catch (error: any) {
      if (error.response?.status === 422) {
        toast.error('Cannot proceed to cart', {
          description: error.response.data.message
        });
      } else {
        toast.error('Error', {
          description: 'Failed to proceed to cart'
        });
      }
    } finally {
      setIsBuyingNow(false);
    }
  };

  if (isLoading) {
    return <PagePreloader />;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const reviewStats = {
    average: product.rating || 0,
    total: product.reviews_count || 0,
    distribution: {
      5: product.reviews?.filter(r => Math.floor(r.rating) === 5).length || 0,
      4: product.reviews?.filter(r => Math.floor(r.rating) === 4).length || 0,
      3: product.reviews?.filter(r => Math.floor(r.rating) === 3).length || 0,
      2: product.reviews?.filter(r => Math.floor(r.rating) === 2).length || 0,
      1: product.reviews?.filter(r => Math.floor(r.rating) === 1).length || 0,
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Product Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <Swiper
              spaceBetween={10}
              navigation={!isMobile}
              pagination={isMobile ? { 
                clickable: true,
                dynamicBullets: true 
              } : false}
              thumbs={{ swiper: thumbsSwiper }}
              modules={[FreeMode, Navigation, Thumbs, Pagination]}
              className={cn(
                "aspect-square rounded-lg overflow-hidden product-swiper",
                isMobile && "mobile-swiper"
              )}
            >
              {product.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="relative aspect-square">
                    <img
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {!isMobile && (
              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
                className="thumbs-swiper h-20"
              >
                {product.images.map((image, index) => (
                  <SwiperSlide key={index} className="cursor-pointer rounded-md overflow-hidden">
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      )}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({product.reviews_count} reviews)
                  </span>
                </div>
                <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-3xl font-bold">
                {formatPrice(product.price, currency)}
              </p>
              <p className="text-sm text-muted-foreground">
                Inclusive of all taxes
              </p>
            </div>

            <div className="prose max-w-none">
              <p>{product.description}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleWishlist}
                  className={cn(
                    isWishlisted && "text-red-500 hover:text-red-600"
                  )}
                  disabled={isTogglingWishlist}
                >
                  {isTogglingWishlist ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                  <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || isBuyingNow}
                >
                  {isBuyingNow ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Buy Now'
                  )}
                </Button>
              </div>
            </div>

            {/* Product Features */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Key Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="specifications">
            <TabsList>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>
            <TabsContent value="specifications" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-2 border-b last:border-0"
                  >
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Review Summary */}
                <Card className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{reviewStats.average.toFixed(1)}</h3>
                    <div className="flex justify-center items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.floor(reviewStats.average)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-muted text-muted"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on {reviewStats.total} reviews
                    </p>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(reviewStats.distribution)
                      .reverse()
                      .map(([rating, count]) => (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm w-6">{rating}★</span>
                          <Progress
                            value={(count / reviewStats.total) * 100}
                            className="h-2"
                          />
                          <span className="text-sm text-muted-foreground w-10">
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                </Card>

                {/* Reviews List */}
                <div className="md:col-span-2 space-y-6">
                  {product.reviews?.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {review.user_name ? review.user_name.substring(0, 2).toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{review.user_name || 'Anonymous User'}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-3 w-3",
                                    i < Math.floor(review.rating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-muted text-muted"
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {review.created_at}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                      {review.is_verified && (
                        <Badge variant="secondary" className="mt-2">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="mt-6">
              <div className="space-y-6">
                {productData?.shipping_methods.map((method) => (
                  <Card key={method.id} className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{method.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(method.base_cost, currency)}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Estimated delivery: {method.estimated_days_min}-{method.estimated_days_max} business days
                    </div>
                  </Card>
                ))}
                <div className="text-sm text-muted-foreground">
                  * Delivery times may vary based on your location and order time
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Keep existing styles */}
      <style>
        {`
          .mobile-swiper .swiper-button-next,
          .mobile-swiper .swiper-button-prev {
            display: none !important;
          }

          .mobile-swiper .swiper-pagination-bullet {
            width: 8px;
            height: 8px;
            background: hsl(var(--primary));
            opacity: 0.5;
          }

          .mobile-swiper .swiper-pagination-bullet-active {
            opacity: 1;
            width: 24px;
            border-radius: 4px;
          }

          @media (max-width: 768px) {
            .product-swiper {
              border-radius: 1rem;
              overflow: hidden;
            }

            .product-swiper .swiper-slide {
              border-radius: 1rem;
              overflow: hidden;
            }

            .product-swiper img {
              border-radius: 1rem;
            }
          }
        `}
      </style>
    </div>
  );
} 