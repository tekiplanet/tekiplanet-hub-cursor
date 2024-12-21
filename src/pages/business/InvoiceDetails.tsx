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
  AlertCircle,
  Loader2,
  Calendar,
  Plus
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { toast } from 'sonner';
import PaymentFormDialog from '@/components/business/PaymentFormDialog';
import { getStatusBadgeProps, getPaymentStatusText } from "@/lib/format";
import { differenceInDays, isSameDay, isPast, format } from 'date-fns';

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

interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  date: string;
  notes?: string;
  created_at: string;
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
  payments: Payment[];
  currency: string;
}

// Helper function to get due date text and status
function getDueDateInfo(dueDate: string) {
  const dueDateObj = new Date(dueDate);
  const today = new Date();
  const isPastDue = isPast(dueDateObj) && !isSameDay(dueDateObj, today);
  const isDueToday = isSameDay(dueDateObj, today);
  const daysOverdue = differenceInDays(today, dueDateObj);
  
  let text = '';
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  
  if (isPastDue) {
    text = `Payment is ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} overdue`;
    variant = "destructive";
  } else if (isDueToday) {
    text = "Payment is due today";
    variant = "default";
  } else {
    const daysUntilDue = Math.abs(daysOverdue);
    text = `Payment due in ${daysUntilDue} ${daysUntilDue === 1 ? 'day' : 'days'}`;
    variant = "secondary";
  }
  
  return { text, variant, isPastDue };
}

export default function InvoiceDetails() {
  const { customerId, invoiceId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [isSending, setIsSending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);

  // Fetch invoice details
  const { 
    data: invoice, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => businessService.getInvoice(invoiceId!),
    enabled: !!invoiceId,
    retry: false,
    onError: (error) => {
      toast.error('Failed to load invoice details');
      console.error('Invoice fetch error:', error);
    }
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
      setIsDownloading(true);
      await businessService.downloadInvoice(invoice.id);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendInvoice = async () => {
    try {
      setIsSending(true);
      await businessService.sendInvoice(invoice.id);
      toast.success('Invoice sent successfully');
    } catch (error) {
      toast.error('Failed to send invoice');
    } finally {
      setIsSending(false);
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
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>
          <Button 
            size="sm"
            onClick={handleSendInvoice}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Invoice
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Summary Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Status and Amount */}
              <div className="flex-1 space-y-6">
                <div className="flex flex-col gap-2">
                  {invoice.status_details ? (
                    <>
                      {/* Status Badge */}
                      <div className="flex flex-col gap-2">
                        <Badge 
                          className="uppercase text-xs font-medium w-fit"
                          {...getStatusBadgeProps(invoice.status_details)}
                        >
                          {invoice.status_details.label.toUpperCase()}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {getPaymentStatusText(invoice.status_details, invoice.currency)}
                        </p>
                      </div>
                      {/* Due Date Info */}
                      {invoice.status !== 'paid' && (
                        <div className="border-t pt-2 mt-2">
                          {/* Due Date Badge */}
                          {(() => {
                            const { text, variant, isPastDue } = getDueDateInfo(invoice.due_date);
                            return (
                              <div className="flex flex-col gap-2">
                                <Badge 
                                  variant={variant}
                                  className="flex items-center gap-1.5 w-fit"
                                >
                                  {isPastDue ? <AlertCircle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                                  {text}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  ({format(new Date(invoice.due_date), 'MMM d, yyyy')})
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {/* Status Badge */}
                      <Badge 
                        className="uppercase text-xs font-medium w-fit"
                        variant="secondary"
                      >
                        {invoice.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {/* Due Date Info */}
                      {invoice.status !== 'paid' && (
                        <div className="border-t pt-2 mt-2">
                          {/* Due Date Badge */}
                          {(() => {
                            const { text, variant, isPastDue } = getDueDateInfo(invoice.due_date);
                            return (
                              <div className="flex flex-col gap-2">
                                <Badge 
                                  variant={variant}
                                  className="flex items-center gap-1.5 w-fit"
                                >
                                  {isPastDue ? <AlertCircle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                                  {text}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  ({format(new Date(invoice.due_date), 'MMM d, yyyy')})
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">Amount Due</p>
                    <p className="text-xl sm:text-2xl font-bold truncate" title={formatCurrency(invoice.amount - invoice.paid_amount, invoice.currency)}>
                      {formatCurrency(invoice.amount - invoice.paid_amount, invoice.currency)}
                    </p>
                  </div>
                  {invoice.paid_amount > 0 && (
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
                      <p className="text-xl sm:text-2xl font-bold text-success truncate" title={formatCurrency(invoice.paid_amount, invoice.currency)}>
                        {formatCurrency(invoice.paid_amount, invoice.currency)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Business and Customer Info */}
              <div className="flex-1 grid gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">From</p>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{invoice.business.business_name}</p>
                    <p>{invoice.business.email}</p>
                    <p>{invoice.business.phone}</p>
                    <p>{invoice.business.address}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">To</p>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{invoice.customer.name}</p>
                    <p>{invoice.customer.email}</p>
                    <p>{invoice.customer.phone}</p>
                    {invoice.customer.address && <p>{invoice.customer.address}</p>}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="items" className="space-y-6">
          <TabsList>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Items
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

          <TabsContent value="items">
            <div className="space-y-4">
              {invoice.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">
                          {item.description}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>Quantity:</span>
                            <span className="text-foreground font-medium">{item.quantity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Unit Price:</span>
                            <span className="text-foreground font-medium">{formatCurrency(item.unit_price, invoice.currency)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium">{formatCurrency(item.amount, invoice.currency)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Total Section */}
              <div className="mt-6 flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <p className="font-medium">Total Amount</p>
                <p className="text-lg font-bold">{formatCurrency(invoice.amount, invoice.currency)}</p>
              </div>

              {/* Notes Section */}
              {invoice.notes && (
                <div className="mt-6 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Notes</p>
                  <p className="whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Payment History</h3>
                  <p className="text-sm text-muted-foreground">
                    {invoice.paid_amount === 0 ? (
                      'No payments recorded yet'
                    ) : (
                      `${formatCurrency(invoice.paid_amount, invoice.currency)} paid of ${formatCurrency(invoice.amount, invoice.currency)}`
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsPaymentFormOpen(true)}
                  disabled={invoice.status === 'paid'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </div>

              {invoice.payments?.length > 0 ? (
                <div className="space-y-4">
                  {invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            {formatCurrency(payment.amount, invoice.currency)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Recorded on {formatDate(payment.payment_date)}
                          </p>
                          {payment.notes && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {payment.notes}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">
                          Payment #{payment.id.split('-')[0]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-8 w-8 mx-auto mb-4 opacity-50" />
                      <p>No payments have been recorded yet</p>
                      {invoice.status !== 'paid' && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setIsPaymentFormOpen(true)}
                        >
                          Record First Payment
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardContent className="p-6">
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

      <PaymentFormDialog
        open={isPaymentFormOpen}
        onOpenChange={setIsPaymentFormOpen}
        invoiceId={invoice.id}
        invoice={{
          amount: invoice.amount,
          paid_amount: invoice.paid_amount,
          currency: invoice.currency,
        }}
      />
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