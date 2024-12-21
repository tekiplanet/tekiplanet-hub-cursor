import { useState, useEffect } from 'react';
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
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { businessService } from '@/services/businessService';
import { X, Plus, Trash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { currencies } from '@/data/currencies';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const invoiceFormSchema = z.object({
  invoice_number: z.string().optional(),
  due_date: z.date({
    required_error: "Due date is required",
  }),
  notes: z.string().optional(),
  theme_color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .default('#0000FF'),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unit_price: z.number().min(0, "Price must be positive"),
    amount: z.number()
  })).min(1, "At least one item is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().min(3, "Please select a currency"),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

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
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: customer } = useQuery({
    queryKey: ['business-customer', customerId],
    queryFn: () => businessService.getCustomer(customerId),
    enabled: !!customerId
  });

  const defaultValues: Partial<InvoiceFormValues> = {
    invoice_number: '',
    due_date: new Date(),
    notes: '',
    theme_color: '#0000FF',
    items: [{ description: '', quantity: 1, unit_price: 0, amount: 0 }],
    amount: 0,
    currency: customer?.currency || 'NGN',
  };

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: defaultValues
  });

  useEffect(() => {
    if (customer?.currency) {
      form.setValue('currency', customer.currency);
    }
  }, [customer]);

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
    
    // Update total amount in form
    const total = calculateTotal();
    form.setValue('amount', total);
  };

  const calculateTotal = () => {
    const items = form.getValues('items') || [];
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      setIsSubmitting(true);
      await businessService.createInvoice({
        ...values,
        customer_id: customerId
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
                    <FormItem className="flex flex-col relative">
                      <FormLabel>Due Date</FormLabel>
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
                            setDatePopoverOpen(!datePopoverOpen);
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
                      {datePopoverOpen && (
                        <div 
                          className="absolute top-[calc(100%+4px)] left-0 z-50 rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setDatePopoverOpen(false);
                            }}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </div>
                      )}
                      <FormDescription>
                        Select when this invoice is due. Past dates are disabled.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="theme_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2 items-center">
                          <Input 
                            type="color" 
                            {...field}
                            className="w-[60px] h-[38px] p-1 cursor-pointer"
                          />
                          <Input 
                            type="text" 
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            placeholder="#000000"
                            className="font-mono"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Choose a color for invoice headers and accents
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={true}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              <div className="flex items-center gap-2">
                                <span>{currency.symbol}</span>
                                <span>{currency.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Using customer's preferred currency
                      </FormDescription>
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
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Item description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-8"
                        onClick={() => removeItem(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

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
                              <Input
                                type="number"
                                disabled
                                value={field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <div className="text-right">
                    <Label>Total Amount</Label>
                    <p className="text-2xl font-bold">
                      {formatCurrency(calculateTotal(), form.getValues('currency'))}
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
                        placeholder="Add any additional notes for this invoice"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Creating...</>
                  ) : (
                    'Create Invoice'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 