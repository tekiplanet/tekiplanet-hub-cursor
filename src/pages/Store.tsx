import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Search,
  ShoppingCart,
  Heart,
  Star,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from 'react-router-dom';
import { storeService } from '@/services/storeService';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { formatPrice } from '@/lib/formatters';
import { ProductCard } from '@/components/ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

export default function Store() {
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState([10000, 10000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Fetch data using React Query
  const { data: featuredData } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: storeService.getFeaturedProducts
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: storeService.getCategories
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: storeService.getBrands
  });

  const { data: promotionsData } = useQuery({
    queryKey: ['promotions'],
    queryFn: storeService.getPromotions
  });

  // Products query with filters
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', debouncedSearch, selectedCategory, selectedBrands, priceRange],
    queryFn: () => storeService.getProducts({
      search: debouncedSearch || undefined,
      category: selectedCategory || undefined,
      brands: selectedBrands.length > 0 ? selectedBrands : undefined,
      min_price: priceRange[0] !== 10000 ? priceRange[0] : undefined,
      max_price: priceRange[1] !== 10000000 ? priceRange[1] : undefined
    }),
    // Only fetch if we have active filters
    enabled: !!(debouncedSearch || selectedCategory || selectedBrands.length > 0 || 
      priceRange[0] !== 10000 || priceRange[1] !== 10000000)
  });

  const currency = featuredData?.currency || '₦';

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === 'all' ? '' : value);
  };

  // Handle brand selection
  const handleBrandToggle = (brandName: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands(prev => [...prev, brandName]);
    } else {
      setSelectedBrands(prev => prev.filter(b => b !== brandName));
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedBrands([]);
    setPriceRange([10000, 10000000]);
    setSearchQuery('');
    setIsSheetOpen(false);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setIsSheetOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Update image sources from promotionsData */}
      <section className="relative w-full h-[50vh] md:h-[60vh] min-h-[300px] md:min-h-[400px] px-4 md:px-6">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          effect="fade"
          pagination={{ 
            clickable: true,
            bulletActiveClass: 'swiper-pagination-bullet-active bg-primary',
          }}
          navigation={!isMobile}
          autoplay={{ delay: 5000 }}
          className={cn(
            "w-full h-full rounded-2xl overflow-hidden",
            "swiper-custom",
          )}
        >
          {promotionsData?.map((promotion) => (
            <SwiperSlide key={promotion.id} className="relative">
              <div className="absolute inset-0 bg-black/40 z-10 rounded-2xl" />
              <img
                src={promotion.image_url}
                alt={promotion.title}
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center text-white text-center p-4">
                <div className="max-w-2xl">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-6xl font-bold mb-2 md:mb-4"
                  >
                    {promotion.title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-base md:text-xl mb-4 md:mb-8"
                  >
                    {promotion.description}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button 
                      size={isMobile ? "default" : "lg"} 
                      className="bg-primary hover:bg-primary/90"
                    >
                      {promotion.button_text}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Search and Filter Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 whitespace-nowrap">
                <Filter className="h-4 w-4" />
                {!isMobile && "Filters"}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filter Products</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                {/* Category Filter */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoriesData?.map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.name.toLowerCase()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <div className="pt-2">
                    <Slider
                      defaultValue={[10000, 10000000]}
                      min={10000}
                      max={10000000}
                      step={10000}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatPrice(priceRange[0], currency)}</span>
                      <span>{formatPrice(priceRange[1], currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Brands Filter */}
                <div className="space-y-2">
                  <Label>Brands</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {brandsData?.map((brand) => (
                      <div key={brand.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={brand.name}
                          checked={selectedBrands.includes(brand.name)}
                          onCheckedChange={(checked) => 
                            handleBrandToggle(brand.name, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={brand.name}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {brand.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Filters */}
                {(selectedCategory || selectedBrands.length > 0 || priceRange[0] !== 10000 || priceRange[1] !== 10000000) && (
                  <div className="space-y-2">
                    <Label>Active Filters</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategory && (
                        <Badge variant="secondary" className="gap-1">
                          {selectedCategory}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 px-1 hover:bg-transparent"
                            onClick={() => setSelectedCategory("")}
                          >
                            ×
                          </Button>
                        </Badge>
                      )}
                      {selectedBrands.map(brand => (
                        <Badge key={brand} variant="secondary" className="gap-1">
                          {brand}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 px-1 hover:bg-transparent"
                            onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                      {(priceRange[0] !== 10000 || priceRange[1] !== 10000000) && (
                        <Badge variant="secondary">
                          {formatPrice(priceRange[0], currency)} - {formatPrice(priceRange[1], currency)}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleResetFilters}
                  >
                    Reset
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleApplyFilters}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Show filtered results if any filters are active */}
        {(debouncedSearch || selectedCategory || selectedBrands.length > 0 || 
          priceRange[0] !== 10000 || priceRange[1] !== 10000000) && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                // Add loading skeleton here
                <div>Loading...</div>
              ) : !productsData?.products.data || productsData.products.data.length === 0 ? (
                <div>No products found</div>
              ) : (
                productsData.products.data.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    currency={currency}
                    onNavigate={() => navigate(`/dashboard/store/product/${product.id}`)}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categoriesData?.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.02 }}
              className="bg-card rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/dashboard/products?category=${category.name.toLowerCase()}`)}
            >
              <h3 className="font-semibold">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.count} items</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Button variant="ghost" className="gap-2">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredData?.products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              currency={currency}
              onNavigate={() => navigate(`/dashboard/store/product/${product.id}`)}
            />
          ))}
        </div>
      </section>

      {/* Special Offers */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative h-[200px] rounded-lg overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 z-10" />
            <img
              src="https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80"
              alt="Gaming Setup"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">Gaming Setup</h3>
              <p className="mb-4">Up to 30% off on gaming accessories</p>
              <Button variant="secondary" className="w-fit">Learn More</Button>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative h-[200px] rounded-lg overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-secondary/40 z-10" />
            <img
              src="https://images.unsplash.com/photo-1592833159155-c62df1b65634?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
              alt="Powerstation Setup"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">Unique Powerstation</h3>
              <p className="mb-4">Complete setup starting from $999</p>
              <Button variant="secondary" className="w-fit">Learn More</Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 