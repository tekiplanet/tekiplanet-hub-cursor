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

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

// Mock data for featured products
const featuredProducts = [
  {
    id: 1,
    name: 'MacBook Pro M2',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2026&q=80',
    price: 1299.99,
    category: 'Laptops',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Gaming PC RTX 4090',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80',
    price: 2499.99,
    category: 'Desktop PCs',
    rating: 4.9,
  },
  {
    id: 3,
    name: 'Professional Powerstation',
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80',
    price: 3499.99,
    category: 'Powerstation',
    rating: 4.7,
  },
  {
    id: 4,
    name: 'Mechanical Keyboard',
    image: 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
    price: 159.99,
    category: 'Accessories',
    rating: 4.6,
  },
  {
    id: 5,
    name: 'Gaming Monitor 32"',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    price: 499.99,
    category: 'Gaming',
    rating: 4.8,
  },
  {
    id: 6,
    name: 'Wireless Mouse',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1767&q=80',
    price: 79.99,
    category: 'Accessories',
    rating: 4.5,
  },
  {
    id: 7,
    name: 'Cyber Security Kit',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    price: 299.99,
    category: 'Security',
    rating: 4.7,
  },
  {
    id: 8,
    name: 'Power Station 1000W',
    image: 'https://images.unsplash.com/photo-1623126908029-58cb08a2b272?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    price: 899.99,
    category: 'Power',
    rating: 4.9,
  }
];

// Categories with icons
const categories = [
  { id: 1, name: 'Laptops', count: 124 },
  { id: 2, name: 'Desktop PCs', count: 89 },
  { id: 3, name: 'Powerstation', count: 45 },
  { id: 4, name: 'Gaming', count: 78 },
  { id: 5, name: 'Accessories', count: 234 },
];

// Hero slider data
const heroSlides = [
  {
    id: 1,
    title: 'Unique Powerstation',
    subtitle: 'Built for Performance',
    image: 'https://www.motortrend.com/uploads/2023/02/001-kelin-tools-blackfire-pac-1000-1500-watt-portable-power-station-review.jpg',
    cta: 'Shop Now',
  },
  {
    id: 2,
    title: 'Gaming Desktops',
    subtitle: 'Ultimate Gaming Experience',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2942&q=80',
    cta: 'Explore Gaming PCs',
  },
  {
    id: 3,
    title: 'Premium Laptops',
    subtitle: 'Powerful & Portable',
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80',
    cta: 'View Collection',
  },
  {
    id: 4,
    title: 'Cyber Security Tools',
    subtitle: 'Professional Grade Equipment',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80',
    cta: 'Shop Security',
  },
];

// Add this mock data
const brands = [
  "Apple", "Dell", "HP", "Lenovo", "ASUS", "Acer", "MSI", "Samsung"
];

export default function Store() {
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Move the state declarations here
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
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
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id} className="relative">
              <div className="absolute inset-0 bg-black/40 z-10 rounded-2xl" />
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center text-white text-center p-4">
                <div className="max-w-2xl">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-6xl font-bold mb-2 md:mb-4"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-base md:text-xl mb-4 md:mb-8"
                  >
                    {slide.subtitle}
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
                      {slide.cta}
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Sheet>
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
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.name.toLowerCase().replace(/\s+/g, '-')}
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
                      defaultValue={[0, 5000]}
                      max={5000}
                      step={100}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Brands Filter */}
                <div className="space-y-2">
                  <Label>Brands</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={brand}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedBrands([...selectedBrands, brand]);
                            } else {
                              setSelectedBrands(selectedBrands.filter(b => b !== brand));
                            }
                          }}
                        />
                        <label
                          htmlFor={brand}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Filters */}
                {(selectedCategory || selectedBrands.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 5000) && (
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
                      {(priceRange[0] !== 0 || priceRange[1] !== 5000) && (
                        <Badge variant="secondary">
                          ${priceRange[0]} - ${priceRange[1]}
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
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedBrands([]);
                      setPriceRange([0, 5000]);
                    }}
                  >
                    Reset
                  </Button>
                  <Button className="flex-1">Apply Filters</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.02 }}
              className="bg-card rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
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
          {featuredProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -5 }}
              className="bg-card rounded-lg overflow-hidden group"
            >
              <div className="relative aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button size="icon" variant="secondary" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <Badge variant="secondary" className="mb-2">
                  {product.category}
                </Badge>
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold">${product.price}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{product.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>
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