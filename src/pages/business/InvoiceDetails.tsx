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
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft,
  Download,
  Mail,
  FileText,
  Clock,
  DollarSign,
  Send,
  AlertCircle
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from 'sonner';

// Status badge variants mapping
const statusVariants: Record<string, "default" | "secondary" | "destructive" | "success"> = {
  draft: "secondary",
  pending: "default",
  sent: "default",
  partially_paid: "secondary",
  paid: "success",
  overdue: "destructive",
  cancelled: "destructive"
};

interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Invoice {
  id: string;
  business_id: string;
  customer_id: string;
  invoice_number: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  status: string;
  payment_reminder_sent: boolean;
  theme_color: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: InvoiceItem[];
  business: {
    id: string;
    business_name: string;
    email: string;
    phone: string;
    address: string;
    logo_url?: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
}

export default function InvoiceDetails() {
  const { customerId, invoiceId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  // Fetch invoice details
  const { 
    data: invoice, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => businessService.getInvoice(invoiceId!),
    enabled: !!invoiceId
  });

  if (isLoading) {
    return <InvoiceDetailsSkeleton />;
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Error Loading Invoice</h2>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'Failed to load invoice details'}
        </p>
        <Button
          onClick={() => navigate(`/dashboard/business/customers/${customerId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customer
        </Button>
      </div>
    );
  }

  const handleDownloadInvoice = async () => {
    try {
      await businessService.downloadInvoice(invoice.id);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handleSendInvoice = async () => {
    try {
      await businessService.sendInvoice(invoice.id);
      toast.success('Invoice sent successfully');
    } catch (error) {
      toast.error('Failed to send invoice');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/dashboard/business/customers/${customerId}`)}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Invoice #{invoice.invoice_number}
            </h1>
            <p className="text-muted-foreground">
              Created on {formatDate(invoice.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleDownloadInvoice}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            size="sm"
            onClick={handleSendInvoice}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Invoice
          </Button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={statusVariants[invoice.status]}>
                {invoice.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="text-2xl font-bold">
                {formatCurrency(invoice.amount)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Paid Amount</span>
              <span className="text-2xl font-bold">
                {formatCurrency(invoice.paid_amount)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Due Date</span>
              <span className="font-medium">
                {formatDate(invoice.due_date)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Invoice Details Content */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{invoice.business.business_name}</p>
                <p className="text-sm text-muted-foreground">{invoice.business.email}</p>
                <p className="text-sm text-muted-foreground">{invoice.business.phone}</p>
                <p className="text-sm text-muted-foreground">{invoice.business.address}</p>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{invoice.customer.name}</p>
                <p className="text-sm text-muted-foreground">{invoice.customer.email}</p>
                <p className="text-sm text-muted-foreground">{invoice.customer.phone}</p>
                {invoice.customer.address && (
                  <p className="text-sm text-muted-foreground">{invoice.customer.address}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                      <th className="px-4 py-3 text-center text-sm font-medium">Quantity</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Unit Price</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/50">
                      <td colSpan={3} className="px-4 py-3 text-sm font-medium text-right">
                        Total:
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-right">
                        {formatCurrency(invoice.amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          {/* Payments Content - To be implemented */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No payments recorded yet
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Activity Timeline - To be implemented */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Invoice Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(invoice.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Loading skeleton component
function InvoiceDetailsSkeleton() {
  return (
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

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        <div className="h-10 w-64 bg-muted rounded animate-pulse" />
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 