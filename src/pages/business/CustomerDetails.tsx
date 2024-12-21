import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { businessService } from '@/services/businessService';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Tag,
  Edit,
  Trash,
  FileText,
  Plus,
  Clock
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import CustomerFormDialog from '@/components/business/CustomerFormDialog';
import { DeleteConfirmDialog } from '@/components/business/DeleteConfirmDialog';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

const CustomerDetailsSkeleton = () => (
  <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-8">
    {/* Header Skeleton */}
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
      <div className="flex-1">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="w-20 h-8 bg-muted rounded animate-pulse" />
        <div className="w-20 h-8 bg-muted rounded animate-pulse" />
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="grid md:grid-cols-3 gap-6">
      {/* Main Info Card Skeleton */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Card Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-24 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <div className="w-full h-9 bg-muted rounded animate-pulse" />
        </CardFooter>
      </Card>
    </div>

    {/* Tabs Skeleton */}
    <div className="space-y-6">
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <Card>
        <CardContent className="p-8">
          <div className="h-32 flex items-center justify-center">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default function CustomerDetails() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => businessService.getCustomer(customerId!),
    enabled: !!customerId
  });

  const handleDelete = async () => {
    if (!customer) return;

    try {
      setIsDeleting(true);
      await businessService.deleteCustomer(customer.id);
      toast.success('Customer deleted successfully');
      navigate('/dashboard/business/customers');
    } catch (error) {
      toast.error('Failed to delete customer');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <CustomerDetailsSkeleton />;
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard/business/customers')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Customer Details</h1>
          <p className="text-muted-foreground">
            View and manage customer information
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Customer Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-1">
                <h2 className="text-xl font-semibold">{customer.name}</h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{customer.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{customer.phone || 'No phone provided'}</span>
                </div>
                {customer.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {[customer.address, customer.city, customer.state, customer.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>
              <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                {customer.status}
              </Badge>
            </div>

            {customer.tags && customer.tags.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {customer.notes && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <p className="text-muted-foreground">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Total Spent</label>
              <p className="text-2xl font-bold">{formatCurrency(customer.total_spent)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Last Order</label>
              <p className="font-medium">
                {customer.last_order_date 
                  ? formatDate(customer.last_order_date)
                  : 'No orders yet'}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Customer Since</label>
              <p className="font-medium">{formatDate(customer.created_at)}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => {}}>
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Invoices</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {/* Add invoices table/list here */}
              <div className="p-8 text-center text-muted-foreground">
                No invoices found
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {/* Add transactions table/list here */}
              <div className="p-8 text-center text-muted-foreground">
                No transactions found
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Customer Created</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(customer.created_at)}
                      </p>
                    </div>
                  </div>
                  {/* Add more activity items here */}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CustomerFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        customer={customer}
        mode="edit"
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title={`Delete ${customer.name}?`}
        description="Are you sure you want to delete this customer? This action cannot be undone."
      />
    </div>
  );
} 