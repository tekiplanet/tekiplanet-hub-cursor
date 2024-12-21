import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { businessService } from '@/services/businessService';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/format';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const paymentFormSchema = z.object({
  amount: z.number()
    .min(0, 'Amount must be greater than 0')
    .max(Number.MAX_SAFE_INTEGER, 'Amount is too large'),
  date: z.date(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoice: {
    amount: number;
    paid_amount: number;
    currency?: string;
  };
}

export default function PaymentFormDialog({
  open,
  onOpenChange,
  invoiceId,
  invoice,
}: PaymentFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const queryClient = useQueryClient();
  const remainingAmount = invoice.amount - invoice.paid_amount;

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: remainingAmount,
      date: new Date(),
      notes: '',
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    if (data.amount <= 0) {
      toast.error('Payment amount must be greater than 0');
      return;
    }

    if (data.amount > remainingAmount) {
      toast.error('Payment amount cannot exceed the remaining balance');
      return;
    }

    try {
      setIsSubmitting(true);
      await businessService.recordPayment(invoiceId, {
        amount: data.amount,
        payment_date: format(data.date, 'yyyy-MM-dd'),
        notes: data.notes,
      });

      toast.success('Payment recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      form.reset({
        amount: remainingAmount,
        date: new Date(),
        notes: '',
      });
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to record payment';
      toast.error(errorMessage);
      console.error('Payment error:', error.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for this invoice. The remaining balance is{" "}
            {formatCurrency(remainingAmount, invoice.currency || 'USD')}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Remaining amount: {formatCurrency(remainingAmount, invoice.currency)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col relative">
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsCalendarOpen(!isCalendarOpen);
                      }}
                      type="button"
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                  {isCalendarOpen && (
                    <div 
                      className="absolute top-[calc(100%+4px)] left-0 z-50 rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setIsCalendarOpen(false);
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this payment"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 