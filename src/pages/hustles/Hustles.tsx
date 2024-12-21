import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Briefcase, Calendar, Users, ArrowRight, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from '@/hooks/useDebounce';
import { hustleService, type Hustle, type Category } from '@/services/hustleService';
import { formatCurrency } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const Hustles = () => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const debouncedSearch = useDebounce(search, 500);

  const { data: hustles, isLoading } = useQuery({
    queryKey: ['hustles', debouncedSearch, selectedCategory?.id],
    queryFn: () => hustleService.getHustles({ 
      search: debouncedSearch,
      category_id: selectedCategory?.id 
    })
  });

  const { data: categories } = useQuery({
    queryKey: ['professional-categories'],
    queryFn: hustleService.getCategories
  });

  const handleHustleClick = (id: string) => {
    navigate(`/dashboard/hustles/${id}`);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header Section */}
        <div className="space-y-4">
          {/* Title and Description */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Explore Hustles</h1>
            <p className="text-muted-foreground">
              Find and apply for exciting opportunities in your field
            </p>
          </div>

          {/* My Applications Button - Full width on mobile */}
          <div className="w-full sm:flex sm:justify-end">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/hustles/applications')}
              className="w-full sm:w-auto"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              My Applications
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hustles..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                {selectedCategory ? selectedCategory.name : 'Filter'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {categories?.map((category: Category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className="cursor-pointer"
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {selectedCategory && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={clearFilters}
              className="hidden sm:flex"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </motion.div>

        {/* Active Filters */}
        {(selectedCategory || search) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2"
          >
            {selectedCategory && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedCategory.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={clearFilters}
                />
              </Badge>
            )}
            {search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {search}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setSearch('')}
                />
              </Badge>
            )}
          </motion.div>
        )}

        {/* No Results Message */}
        {!isLoading && hustles?.data.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hustles found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </motion.div>
        )}

        {/* Hustles Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[280px] rounded-xl" />
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {hustles?.data.map((hustle: Hustle) => (
                <motion.div
                  key={hustle.id}
                  variants={item}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  onClick={() => handleHustleClick(hustle.id)}
                >
                  <Card className="relative overflow-hidden cursor-pointer group h-full">
                    <div className="p-6 space-y-4">
                      {/* Category Badge */}
                      <Badge variant="secondary" className="mb-4">
                        {hustle.category.name}
                      </Badge>

                      {/* Title and Description */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg line-clamp-2">
                          {hustle.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {hustle.description}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{hustle.deadline}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{hustle.applications_count} applied</span>
                        </div>
                      </div>

                      {/* Budget and Apply Button */}
                      <div className="flex items-center justify-between pt-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Budget</p>
                          <p className="font-semibold">{formatCurrency(hustle.budget)}</p>
                        </div>
                        <Button 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={!hustle.can_apply || hustle.has_applied}
                        >
                          {hustle.has_applied ? 'Applied' : 'Apply Now'}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>

                    {/* Status Indicator */}
                    {hustle.has_applied && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="success">Applied</Badge>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
};

export default Hustles; 