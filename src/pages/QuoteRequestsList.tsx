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
}

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
          setQuotes(response.data.quotes.data);
          setFilteredQuotes(response.data.quotes.data);
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
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Quote Requests</h1>
              <p className="text-muted-foreground">Manage and track your service quote requests</p>
            </div>
            <Button
              onClick={() => navigate('/service-quote-request')}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              New Quote Request
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            <div className="relative md:col-span-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by service, industry or budget..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="md:col-span-4">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quotes List */}
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-10 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">No quote requests found</h3>
              <p className="text-muted-foreground mb-4">
                {quotes.length === 0 
                  ? "Start by creating your first quote request"
                  : "Try adjusting your search or filters"}
              </p>
              {quotes.length === 0 && (
                <Button 
                  onClick={() => navigate('/service-quote-request')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Create New Quote Request
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredQuotes.map((quote) => (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{quote.service.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Submitted {format(new Date(quote.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(quote.status)}>
                          {getStatusText(quote.status)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Download PDF</DropdownMenuItem>
                            {quote.status === 'pending' && (
                              <DropdownMenuItem className="text-destructive">
                                Cancel Request
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Industry</p>
                          <p className="text-sm mt-1">{quote.industry}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Budget Range</p>
                          <p className="text-sm mt-1">{quote.budget_range}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Project Deadline</p>
                          <p className="text-sm mt-1">
                            {format(new Date(quote.project_deadline), 'MMM d, yyyy')}
                          </p>
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
