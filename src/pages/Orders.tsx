import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { useInView } from 'react-intersection-observer';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDebounce } from '@/hooks/useDebounce';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  processing: 'bg-blue-500/10 text-blue-600',
  shipped: 'bg-purple-500/10 text-purple-600',
  delivered: 'bg-green-500/10 text-green-600',
  cancelled: 'bg-red-500/10 text-red-600',
};

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Package,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

export default function Orders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const { ref, inView } = useInView();

  // Fetch orders with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ['orders', statusFilter, sortBy, debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get('/orders', {
        params: {
          page: pageParam,
          status: statusFilter,
          sort_by: sortBy,
          search: debouncedSearch
        }
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined;
    },
    initialPageParam: 1
  });

  // Load more when bottom is reached
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  // Flatten all pages of orders
  const orders = data?.pages.flatMap(page => page.data) ?? [];

  // Loading state component
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading your orders...</p>
    </div>
  );

  // Error state component
  const ErrorState = ({ error }: { error: Error }) => (
    <Alert variant="destructive" className="my-4">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error.message || 'Failed to load orders. Please try again later.'}
      </AlertDescription>
    </Alert>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Package className="h-12 w-12 text-muted-foreground" />
      <div className="text-center">
        <h3 className="text-lg font-semibold">No orders found</h3>
        <p className="text-sm text-muted-foreground">
          You haven't placed any orders yet.
        </p>
      </div>
      <Button onClick={() => navigate('/dashboard/store')}>
        Start Shopping
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Orders</h1>
              <p className="text-muted-foreground">
                Track and manage your orders
              </p>
            </div>
            <Button
              onClick={() => navigate('/dashboard/store')}
              className="w-full md:w-auto"
            >
              Continue Shopping
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2",
                searchQuery !== debouncedSearch 
                  ? "animate-pulse text-primary"
                  : "text-muted-foreground"
              )} />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="total">Total</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Orders List with improved states */}
          <div className="space-y-4">
            {isLoading ? (
              <LoadingState />
            ) : isError ? (
              <ErrorState error={error as Error} />
            ) : orders.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-lg overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-4 border-b flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Order {order.id}</h3>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "capitalize",
                              statusColors[order.status as keyof typeof statusColors]
                            )}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Invoice
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => navigate(`/dashboard/orders/${order.id}/tracking`)}
                        >
                          Track Order
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 border-b last:border-0"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                            <p className="font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/dashboard/store/product/${item.id}`)}
                          >
                            Buy Again
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Info */}
                    {order.tracking && (
                      <div className="p-4 bg-muted/50 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4" />
                          <span className="font-medium">
                            Tracking Number: {order.tracking.number}
                          </span>
                          <span className="text-muted-foreground">
                            via {order.tracking.carrier}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          Estimated Delivery: {new Date(order.tracking.estimatedDelivery).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Infinite scroll loading indicator */}
                {hasNextPage && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                
                {/* Infinite scroll trigger */}
                <div ref={ref} className="h-10" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 