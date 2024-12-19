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
import { storeService } from '@/services/storeService';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { formatPrice } from '@/lib/formatters';
import { ProductCard } from '@/components/ProductCard';
import PagePreloader from '@/components/ui/PagePreloader';

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
  const [priceRange, setPriceRange] = useState([10000, 10000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const category = searchParams.get('category') || 'all';
  const query = searchParams.get('q') || '';
  const debouncedSearch = useDebounce(query, 300);

  // Fetch categories and brands
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: storeService.getCategories
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: storeService.getBrands
  });

  // Fetch products with filters
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', debouncedSearch, category, selectedBrands, priceRange, sortBy],
    queryFn: () => storeService.getProducts({
      search: debouncedSearch || undefined,
      category: category !== 'all' ? category : undefined,
      brands: selectedBrands.length > 0 ? selectedBrands : undefined,
      min_price: priceRange[0] !== 10000 ? priceRange[0] : undefined,
      max_price: priceRange[1] !== 10000000 ? priceRange[1] : undefined
    })
  });

  const currency = productsData?.currency || '₦';

  const clearFilters = () => {
    setPriceRange([10000, 10000000]);
    setSelectedBrands([]);
    setSortBy('featured');
    setSearchParams({ category });
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
                {category === 'all' 
                  ? 'All Products' 
                  : categoriesData?.find(c => c.name.toLowerCase() === category.toLowerCase())?.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {productsData?.products.total || 0} products found
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
                          defaultValue={[10000, 10000000]}
                          min={10000}
                          max={10000000}
                          step={10000}
                          value={priceRange}
                          onValueChange={setPriceRange}
                        />
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                          <span>{formatPrice(priceRange[0], currency)}</span>
                          <span>{formatPrice(priceRange[1], currency)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Brands */}
                    <div className="space-y-4">
                      <Label>Brands</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {brandsData?.map((brand) => (
                          <div key={brand.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={brand.name}
                              checked={selectedBrands.includes(brand.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedBrands([...selectedBrands, brand.name]);
                                } else {
                                  setSelectedBrands(selectedBrands.filter(b => b !== brand.name));
                                }
                              }}
                            />
                            <label htmlFor={brand.name}>{brand.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Active Filters */}
                    {(selectedBrands.length > 0 || priceRange[0] !== 10000 || priceRange[1] !== 10000000) && (
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
                          {(priceRange[0] !== 10000 || priceRange[1] !== 10000000) && (
                            <Badge variant="secondary">
                              {formatPrice(priceRange[0], currency)} - {formatPrice(priceRange[1], currency)}
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
            {isLoading ? (
              <PagePreloader />
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
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 