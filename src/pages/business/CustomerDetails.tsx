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
  Clock,
  CircleDollarSign
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import CustomerFormDialog from '@/components/business/CustomerFormDialog';
import { DeleteConfirmDialog } from '@/components/business/DeleteConfirmDialog';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InvoiceFormDialog from '@/components/business/InvoiceFormDialog';
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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

function TransactionsTab({ customerId }: { customerId: string }) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["customer-transactions", customerId],
    queryFn: () => businessService.getCustomerTransactions(customerId),
  });

  if (isLoading) {
    return <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>;
  }

  if (!transactions?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions found for this customer.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{format(new Date(transaction.date), "PPP")}</TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(transaction.status)}>
                  {transaction.status}
                </Badge>
              </TableCell>
              <TableCell>{transaction.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function getStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
}

export default function CustomerDetails() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => businessService.getCustomer(customerId!),
    enabled: !!customerId
  });

  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['customer-invoices', customerId],
    queryFn: () => businessService.getCustomerInvoices(customerId!),
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
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/business/customers')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
            <p className="text-muted-foreground">
              Customer since {formatDate(customer.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Total Spent</span>
              <span className="text-2xl font-bold">{formatCurrency(customer.total_spent)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Status</span>
              <div className="flex items-center gap-2">
                <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                  {customer.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Last Order</span>
              <span className="font-medium">
                {customer.last_order_date 
                  ? formatDate(customer.last_order_date)
                  : 'No orders yet'}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Tags</span>
              <div className="flex flex-wrap gap-1">
                {customer.tags?.length ? (
                  customer.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">No tags</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{customer.email || 'Not provided'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{customer.phone || 'Not provided'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">
                {[customer.address, customer.city, customer.state, customer.country]
                  .filter(Boolean)
                  .join(', ') || 'Not provided'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{customer.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs Section */}
      <Tabs defaultValue="invoices" className="space-y-6">
        <div className="relative -mx-4 md:mx-0">
          <div className="border-b overflow-x-auto scrollbar-none">
            <div className="min-w-full inline-block px-4 md:px-0">
              <TabsList className="flex w-auto bg-transparent p-0">
                <TabsTrigger 
                  value="invoices" 
                  className="flex items-center gap-1 px-3 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none whitespace-nowrap text-sm"
                >
                  <FileText className="h-4 w-4" />
                  Invoices
                </TabsTrigger>
                <TabsTrigger 
                  value="transactions" 
                  className="flex items-center gap-1 px-3 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none whitespace-nowrap text-sm"
                >
                  <CircleDollarSign className="h-4 w-4" />
                  Transactions
                </TabsTrigger>
                <TabsTrigger 
                  value="activity" 
                  className="flex items-center gap-1 px-3 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none whitespace-nowrap text-sm"
                >
                  <Clock className="h-4 w-4" />
                  Activity
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Invoices</h3>
            <Button 
              size="sm"
              onClick={() => setIsInvoiceFormOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {isLoadingInvoices ? (
                <div className="p-8 flex items-center justify-center">
                  <div className="space-y-4 w-full max-w-md">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full animate-pulse" />
                        <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : !invoices?.length ? (
                <div className="p-8 text-center text-muted-foreground">
                  No invoices found
                </div>
              ) : (
                <>
                  {/* Desktop View */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                              {invoice.invoice_number}
                            </TableCell>
                            <TableCell>
                              {formatDate(invoice.created_at)}
                            </TableCell>
                            <TableCell>
                              {formatDate(invoice.due_date)}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">
                                {formatCurrency(invoice.amount)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  invoice.status === 'paid' 
                                    ? 'success' 
                                    : invoice.status === 'overdue'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                {invoice.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigate(`/dashboard/business/customers/${customerId}/invoices/${invoice.id}`);
                                }}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile View */}
                  <div className="block md:hidden divide-y divide-border">
                    {invoices.map((invoice) => (
                      <div 
                        key={invoice.id} 
                        className="p-4 space-y-3"
                        onClick={() => navigate(`/dashboard/business/customers/${customerId}/invoices/${invoice.id}`)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">#{invoice.invoice_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(invoice.created_at)}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              invoice.status === 'paid' 
                                ? 'success' 
                                : invoice.status === 'overdue'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div>
                            <p className="text-muted-foreground">Due Date</p>
                            <p>{formatDate(invoice.due_date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionsTab customerId={customerId!} />
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

      {/* Add Invoice Form Dialog */}
      <InvoiceFormDialog 
        open={isInvoiceFormOpen}
        onOpenChange={setIsInvoiceFormOpen}
        customerId={customerId!}
      />
    </div>
  );
} 