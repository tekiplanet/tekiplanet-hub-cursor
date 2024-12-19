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
  ChevronRight,
  Sparkles,
  Users,
  Clock,
  MessagesSquare
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

const consultingImage = "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070";

const MobileCategoryPicker: React.FC<{
  categories: ServiceCategory[];
  selectedCategory: ServiceCategory | null;
  onSelect: (category: ServiceCategory | null) => void;
}> = ({ categories, selectedCategory, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <Button
        variant="outline"
        className="w-full flex items-center justify-between p-4 h-auto"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCategory ? (
          <div className="flex items-center gap-2">
            {getLucideIcon(selectedCategory.icon)({ className: "h-4 w-4" })}
            <span>{selectedCategory.title}</span>
          </div>
        ) : (
          <span>All Categories</span>
        )}
        <ChevronRight className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "rotate-90"
        )} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-full rounded-lg border bg-background shadow-lg"
          >
            <div className="p-2">
              <Button
                key="all"
                variant={!selectedCategory ? "default" : "ghost"}
                className="w-full justify-start mb-1"
                onClick={() => {
                  onSelect(null);
                  setIsOpen(false);
                }}
              >
                All Categories
              </Button>
              {categories.map((category) => {
                const ServiceIcon = getLucideIcon(category.icon);
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory?.id === category.id ? "default" : "ghost"}
                    className="w-full justify-start mb-1"
                    onClick={() => {
                      onSelect(selectedCategory?.id === category.id ? null : category);
                      setIsOpen(false);
                    }}
                  >
                    <ServiceIcon className="h-4 w-4 mr-2" />
                    {category.title}
                    <Badge variant="secondary" className="ml-auto">
                      {category.subServices.length}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
        <div>
          {/* Mobile Category Picker */}
          <MobileCategoryPicker
            categories={serviceCategories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {/* Desktop Categories */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="hidden md:flex gap-2 overflow-x-auto pb-4 scrollbar-hide"
          >
            <Button
              variant={!selectedCategory ? "default" : "outline"}
              className="rounded-full px-6 py-2 whitespace-nowrap"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
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
        </div>

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
                            className="w-full justify-between hover:text-destructive hover:bg-primary/5 group"
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

        {/* Move IT Consultation Section here, after Services Grid */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 text-white mt-16"
        >
          <div className="absolute inset-0">
            <img 
              src={consultingImage} 
              alt="IT Consultation" 
              className="w-full h-full object-cover mix-blend-overlay opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent" />
          </div>

          <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Expert Consultation</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Get Professional IT Consultation
                <span className="block text-primary">From Industry Experts</span>
              </h2>

              <p className="text-zinc-200 text-lg">
                Transform your business with expert guidance. Our consultants provide strategic insights 
                and practical solutions tailored to your needs.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">1-on-1 Session</p>
                    <p className="text-sm text-zinc-300">Personalized Guidance</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Flexible Hours</p>
                    <p className="text-sm text-zinc-300">Book Any Time</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() => {
                    console.log('Navigating to IT Consulting');
                    navigate('/dashboard/it-consulting');
                  }}
                >
                  <MessagesSquare className="mr-2 h-5 w-5" />
                  Consult an Expert
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-zinc-700 hover:bg-white/5 text-white"
                  onClick={() => navigate('/dashboard/services/quote/consultation/rates')}
                >
                  View Pricing
                </Button>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="relative"
              >
                <div className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl" />
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
                      <h3 className="font-bold text-xl">500+</h3>
                      <p className="text-sm text-zinc-300">Projects Completed</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
                      <h3 className="font-bold text-xl">24/7</h3>
                      <p className="text-sm text-zinc-300">Support Available</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
                      <h3 className="font-bold text-xl">98%</h3>
                      <p className="text-sm text-zinc-300">Client Satisfaction</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
                      <h3 className="font-bold text-xl">15+</h3>
                      <p className="text-sm text-zinc-300">Years Experience</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default ServicesPage;
