import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/axios';  
import { 
  Code, 
  Shield, 
  Briefcase, 
  ArrowRight, 
  Smartphone, 
  Palette,
  Search,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import PagePreloader from '@/components/ui/PagePreloader';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Helper function to map icon names to Lucide icons
const getLucideIcon = (iconName: string) => {
  const iconMap = {
    'Code': Code,
    'Shield': Shield,
    'Briefcase': Briefcase,
    'Smartphone': Smartphone,
    'Palette': Palette,
    default: Code // Fallback icon
  };

  return iconMap[iconName] || iconMap.default;
};

interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  subServices: {
    id: string;
    title: string;
    description?: string;
  }[];
}

const servicesImages = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
  'https://images.unsplash.com/photo-1522252234503-e356532cafd5',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'
];

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        const response = await apiClient.get('/services/categories');
        
        // Ensure response.data is an array
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data || []);
        
        setServiceCategories(categoriesData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching service categories:', err);
        setError(err.response?.data?.message || 'Failed to fetch service categories');
        setIsLoading(false);
      }
    };

    fetchServiceCategories();
  }, []);

  const handleServiceSelect = (categoryId: string, serviceId: string) => {
    navigate(`/dashboard/services/quote/${categoryId}/${serviceId}`);
  };

  // Filter services based on search
  const filteredServices = serviceCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.subServices.some(service => 
      service.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (isLoading) {
    return <PagePreloader />;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  if (!serviceCategories || serviceCategories.length === 0) {
    return <div className="text-center py-8">No services available</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto p-4 space-y-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative rounded-3xl overflow-hidden h-[500px] mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/40 z-10" />
          <img 
            src={servicesImages[0]} 
            alt="Services Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 h-full flex flex-col justify-center p-8 md:p-16 max-w-3xl">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Transform Your Business Digital Journey
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-white/90 mb-8"
            >
              Discover our comprehensive range of digital services designed to elevate your business
            </motion.p>
            
            {/* Search Bar */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative max-w-xl"
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search services..."
                className="w-full pl-12 pr-4 h-14 text-lg rounded-2xl bg-background/95 border-0 shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Categories Navigation */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide"
        >
          {serviceCategories.map((category) => {
            const ServiceIcon = getLucideIcon(category.icon);
            return (
              <Button
                key={category.id}
                variant={selectedCategory?.id === category.id ? "default" : "outline"}
                className="rounded-full px-6 py-2 whitespace-nowrap"
                onClick={() => setSelectedCategory(
                  selectedCategory?.id === category.id ? null : category
                )}
              >
                <ServiceIcon className="h-4 w-4 mr-2" />
                {category.title}
              </Button>
            );
          })}
        </motion.div>

        {/* Services Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredServices.map((category) => {
              const ServiceIcon = getLucideIcon(category.icon);
              return (
                <motion.div
                  key={category.id}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className={cn(
                    "overflow-hidden backdrop-blur-sm bg-background/95 border border-muted hover:border-primary/50 transition-all duration-300",
                    activeCategory === category.id && "ring-2 ring-primary"
                  )}>
                    <CardHeader className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-primary/10">
                          <ServiceIcon className="h-8 w-8 text-primary" />
                        </div>
                        <Badge variant="secondary" className="ml-auto">
                          {category.subServices.length} Services
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl mb-2">{category.title}</CardTitle>
                      <p className="text-muted-foreground">{category.description}</p>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="space-y-3">
                        {category.subServices.map((service) => (
                          <Button 
                            key={service.id}
                            variant="ghost" 
                            className="w-full justify-between hover:bg-primary/5 group"
                            onClick={() => handleServiceSelect(category.id, service.id)}
                          >
                            <span>{service.title}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">No services found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or browse all categories
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
