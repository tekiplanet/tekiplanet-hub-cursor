import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { storeService } from '@/services/storeService';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/lib/formatters';
import PagePreloader from '@/components/ui/PagePreloader';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Fetch product details
  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => storeService.getProductDetails(id!),
    enabled: !!id
  });

  const product = productData?.product;
  const currency = productData?.currency || '₦';

  const handleAddToCart = () => {
    if (!product) return;
    
    toast({
      title: "Added to cart",
      description: `${product.name} x ${quantity} added to your cart`,
    });
    // Add to cart logic here
  };

  if (isLoading) {
    return <PagePreloader />;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

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
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={cn(
                    isWishlisted && "text-red-500 hover:text-red-600"
                  )}
                >
                  <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
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
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => navigate('/dashboard/checkout')}
                  disabled={product.stock === 0}
                >
                  Buy Now
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
            <TabsContent value="reviews">Reviews content...</TabsContent>
            <TabsContent value="shipping">Shipping information...</TabsContent>
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