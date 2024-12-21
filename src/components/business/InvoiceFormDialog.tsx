import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQueryClient } from '@tanstack/react-query';
import { businessService } from '@/services/businessService';
import { X, Plus, Trash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const invoiceFormSchema = z.object({
  invoice_number: z.string().optional(),
  due_date: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
  theme_color: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unit_price: z.number().min(0, "Price must be positive"),
    amount: z.number()
  })).min(1, "At least one item is required")
});

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
}

export default function InvoiceFormDialog({ 
  open, 
  onOpenChange,
  customerId
}: InvoiceFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof invoiceFormSchema>>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoice_number: '',
      due_date: '',
      notes: '',
      theme_color: '#0000FF',
      items: [{ description: '', quantity: 1, unit_price: 0, amount: 0 }]
    }
  });

  const addItem = () => {
    const currentItems = form.getValues('items') || [];
    form.setValue('items', [
      ...currentItems,
      { description: '', quantity: 1, unit_price: 0, amount: 0 }
    ]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues('items') || [];
    form.setValue('items', currentItems.filter((_, i) => i !== index));
  };

  const calculateItemAmount = (index: number) => {
    const items = form.getValues('items');
    const item = items[index];
    const amount = item.quantity * item.unit_price;
    form.setValue(`items.${index}.amount`, amount);
  };

  const calculateTotal = () => {
    const items = form.getValues('items') || [];
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const onSubmit = async (values: z.infer<typeof invoiceFormSchema>) => {
    try {
      setIsSubmitting(true);
      await businessService.createInvoice({
        ...values,
        customer_id: customerId,
        amount: calculateTotal()
      });
      
      queryClient.invalidateQueries({ queryKey: ['customer-invoices', customerId] });
      toast.success('Invoice created successfully');
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast.error(
        'Failed to create invoice',
        { description: error.response?.data?.message || 'Please try again' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] mt-8">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for this customer
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(80vh-8rem)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoice_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input placeholder="INV-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Invoice Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel>Items</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {form.watch('items')?.map((item, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <FormLabel>Item {index + 1}</FormLabel>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.value));
                                  calculateItemAmount(index);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.unit_price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Price</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.value));
                                  calculateItemAmount(index);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="text"
                                  disabled
                                  value={formatCurrency(field.value)}
                                  className="bg-muted"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-4 border-t">
                  <div className="space-y-1">
                    <FormLabel>Total Amount</FormLabel>
                    <p className="text-2xl font-bold">
                      {formatCurrency(calculateTotal())}
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any notes or payment instructions..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>

        <div className="flex justify-end gap-4 pt-4 border-t mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              form.reset();
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 