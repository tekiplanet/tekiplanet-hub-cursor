import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Search, Filter, MoreVertical, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import Dashboard from './Dashboard';
import { motion } from 'framer-motion';

interface Quote {
  id: number;
  service: {
    name: string;
  };
  industry: string;
  budget_range: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  project_deadline: string;
  created_at: string;
  unread_messages_count: number;
}

const NotificationBadge = () => (
  <span className="absolute h-3 w-3 rounded-full bg-destructive animate-fade-pulse" />
);

const QuoteRequestsList: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await apiClient.get('/quotes');
        
        if (response.data.success) {
          setQuotes(response.data.quotes);
          setFilteredQuotes(response.data.quotes);
        } else {
          toast.error('Failed to load quote requests');
        }
      } catch (error) {
        toast.error('Error fetching quote requests');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  useEffect(() => {
    let result = quotes;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(quote => 
        quote.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.budget_range.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(quote => quote.status === statusFilter);
    }

    setFilteredQuotes(result);
  }, [searchTerm, statusFilter, quotes]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'outline';
      case 'accepted': return 'success';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleQuoteClick = (quoteId: string) => {
    navigate(`/dashboard/quotes/${quoteId}`);
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header Section - Mobile Optimized */}
        <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 -mx-4 px-4 py-3 mb-4 border-b">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold tracking-tight">Quote Requests</h1>
              <Button
                onClick={() => navigate('/dashboard/services')}
                size="sm"
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">New Quote</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>

            {/* Mobile Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quotes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[100px] h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Status</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Quotes List - Mobile Optimized */}
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-10 px-4 bg-muted/50 rounded-lg mt-4">
            <h3 className="text-lg font-semibold mb-2">You have no quote requests</h3>
            <p className="text-muted-foreground mb-4">
              {quotes.length === 0 
                ? "Start by creating your first quote request"
                : "Try adjusting your search or filters"}
            </p>
            {quotes.length === 0 && (
              <div className="flex justify-center">
                <Button 
                  onClick={() => navigate('/dashboard/services')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Request New Quote
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuotes.map((quote) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleQuoteClick(quote.id)}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-base font-medium truncate flex items-center gap-2">
                          {quote.service.name}
                          {quote.unread_messages_count > 0 && (
                            <div className="relative flex items-center justify-center">
                              <NotificationBadge />
                              <Badge 
                                variant="destructive" 
                                className="relative h-5 w-5 rounded-full p-0 flex items-center justify-center"
                              >
                                {quote.unread_messages_count}
                              </Badge>
                            </div>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant={getStatusVariant(quote.status)} className="rounded-full">
                            {getStatusText(quote.status)}
                          </Badge>
                          <span>•</span>
                          <span>{format(new Date(quote.created_at), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => handleQuoteClick(quote.id)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Download PDF
                          </DropdownMenuItem>
                          {quote.status === 'pending' && (
                            <DropdownMenuItem className="text-destructive">
                              Cancel Request
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground font-medium">Industry</p>
                        <p className="truncate">{quote.industry}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">Budget</p>
                        <p className="truncate">{quote.budget_range}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground font-medium">Deadline</p>
                        <p>{format(new Date(quote.project_deadline), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default QuoteRequestsList;
