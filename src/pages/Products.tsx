import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Heart,
  ShoppingCart,
  Star,
  SlidersHorizontal,
  X,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

// Mock data for products
const products = [
  {
    id: 1,
    name: 'MacBook Pro M2',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2026&q=80',
    price: 1299.99,
    category: 'Laptops',
    rating: 4.8,
    brand: 'Apple',
  },
  {
    id: 2,
    name: 'Gaming PC RTX 4090',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80',
    price: 2499.99,
    category: 'Desktop PCs',
    rating: 4.9,
    brand: 'MSI',
  },
  {
    id: 3,
    name: 'Professional Powerstation',
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80',
    price: 3499.99,
    category: 'Powerstation',
    rating: 4.7,
    brand: 'Dell',
  },
  {
    id: 4,
    name: 'Mechanical Keyboard',
    image: 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
    price: 159.99,
    category: 'Accessories',
    rating: 4.6,
    brand: 'ASUS',
  },
  {
    id: 5,
    name: 'Gaming Monitor 32"',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    price: 499.99,
    category: 'Gaming',
    rating: 4.8,
    brand: 'Samsung',
  },
  {
    id: 6,
    name: 'Wireless Mouse',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1767&q=80',
    price: 79.99,
    category: 'Accessories',
    rating: 4.5,
    brand: 'Lenovo',
  },
  {
    id: 7,
    name: 'Cyber Security Kit',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    price: 299.99,
    category: 'Security',
    rating: 4.7,
    brand: 'HP',
  },
  {
    id: 8,
    name: 'Power Station 1000W',
    image: 'https://images.unsplash.com/photo-1623126908029-58cb08a2b272?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    price: 899.99,
    category: 'Power',
    rating: 4.9,
    brand: 'Acer',
  },
  {
    id: 9,
    name: 'Gaming Laptop RTX 4080',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80',
    price: 1899.99,
    category: 'Laptops',
    rating: 4.7,
    brand: 'ASUS',
  },
  {
    id: 10,
    name: 'Professional Monitor 4K',
    image: 'https://images.unsplash.com/photo-1616763355603-9755a640a287?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    price: 699.99,
    category: 'Accessories',
    rating: 4.6,
    brand: 'Dell',
  },
  {
    id: 11,
    name: 'Mini PC',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    price: 599.99,
    category: 'Desktop PCs',
    rating: 4.5,
    brand: 'HP',
  },
  {
    id: 12,
    name: 'Gaming Headset',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2088&q=80',
    price: 129.99,
    category: 'Gaming',
    rating: 4.8,
    brand: 'MSI',
  }
];

const categories = [
  { id: 'laptops', name: 'Laptops', count: 124 },
  { id: 'desktops', name: 'Desktop PCs', count: 89 },
  { id: 'powerstation', name: 'Powerstation', count: 45 },
  { id: 'gaming', name: 'Gaming', count: 78 },
  { id: 'accessories', name: 'Accessories', count: 234 },
];

const brands = [
  "Apple", "Dell", "HP", "Lenovo", "ASUS", "Acer", "MSI", "Samsung"
];

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const category = searchParams.get('category') || 'all';
  const query = searchParams.get('q') || '';

  // Filter products based on criteria
  const filteredProducts = products.filter(product => {
    if (category !== 'all' && product.category.toLowerCase() !== category.toLowerCase()) return false;
    if (query && !product.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    if (selectedBrands.length && !selectedBrands.includes(product.brand)) return false;
    return true;
  });

  const clearFilters = () => {
    setPriceRange([0, 5000]);
    setSelectedBrands([]);
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Back button and Title */}
          <div className="flex flex-col gap-2">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">
                {category === 'all' ? 'All Products' : categories.find(c => c.id === category)?.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} products found
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search in results..."
                className="pl-10 w-full"
                value={query}
                onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), q: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none sm:w-[120px] gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    {/* Price Range */}
                    <div className="space-y-4">
                      <Label>Price Range</Label>
                      <div className="px-2">
                        <Slider
                          defaultValue={[0, 5000]}
                          max={5000}
                          step={100}
                          value={priceRange}
                          onValueChange={setPriceRange}
                        />
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Brands */}
                    <div className="space-y-4">
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
                    {(selectedBrands.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 5000) && (
                      <div className="space-y-4">
                        <Label>Active Filters</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedBrands.map(brand => (
                            <Badge key={brand} variant="secondary" className="gap-1">
                              {brand}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 px-1 hover:bg-transparent"
                                onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))}
                              >
                                <X className="h-3 w-3" />
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

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={clearFilters}
                      >
                        Clear All
                      </Button>
                      <SheetClose asChild>
                        <Button className="flex-1">Apply Filters</Button>
                      </SheetClose>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <select
                className="flex h-10 w-full sm:w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-lg overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/dashboard/store/product/${product.id}`)}
              >
                <div className="relative aspect-square">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to wishlist
                      }}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to cart
                      }}
                    >
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
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 