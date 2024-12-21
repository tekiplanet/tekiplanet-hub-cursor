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
import { useQueryClient } from '@tanstack/react-query';
import { businessService } from '@/services/businessService';
import { CreateCustomerDto, CustomerDto } from '@/types/business';
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { getAllCountries, getStatesByCountry } from '@/data/locations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currencies } from '@/data/currencies';

const customerFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  currency: z.string().min(3, "Currency is required"),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
});

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerDto;
  mode?: 'create' | 'edit';
}

export default function CustomerFormDialog({ 
  open, 
  onOpenChange, 
  customer,
  mode = 'create' 
}: CustomerFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const queryClient = useQueryClient();
  const [availableStates, setAvailableStates] = useState<{ code: string; name: string; }[]>([]);

  const form = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      city: customer?.city || '',
      state: customer?.state || '',
      country: customer?.country || 'NG',
      currency: customer?.currency || 'NGN',
      notes: customer?.notes || '',
      tags: customer?.tags || []
    }
  });

  useEffect(() => {
    const countryCode = form.watch('country');
    if (countryCode) {
      setAvailableStates(getStatesByCountry(countryCode));
      if (!availableStates.find(state => state.name === form.getValues('state'))) {
        form.setValue('state', '');
      }
    }
  }, [form.watch('country')]);

  useEffect(() => {
    if (customer && mode === 'edit') {
      form.reset({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city,
        state: customer.state,
        country: customer.country,
        currency: customer.currency,
        notes: customer.notes || '',
        tags: customer.tags || []
      });
    }
  }, [customer, mode]);

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues('tags') || [];
      form.setValue('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (values: z.infer<typeof customerFormSchema>) => {
    try {
      setIsSubmitting(true);
      const customerData = {
        name: values.name,
        email: values.email || '',
        phone: values.phone || '',
        address: values.address || '',
        city: values.city,
        state: values.state,
        country: values.country,
        currency: values.currency,
        notes: values.notes || '',
        tags: values.tags || []
      } satisfies CreateCustomerDto;

      if (mode === 'create') {
        await businessService.createCustomer(customerData);
        toast.success('Customer created successfully');
      } else {
        if (!customer?.id) return;
        await businessService.updateCustomer(customer.id, customerData);
        toast.success('Customer updated successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['business-customers'] });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast.error(
        'Failed to save customer',
        { description: error.response?.data?.message || 'Please try again' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] mt-8">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Customer' : 'Edit Customer'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new customer to your business profile.' 
              : 'Update customer information.'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(80vh-8rem)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="customer@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAllCountries().map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableStates.map((state) => (
                            <SelectItem key={state.code} value={state.name}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes about this customer"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Tags</FormLabel>
                <FormDescription>
                  Add tags to categorize and organize your customers (e.g., VIP, Wholesale, Regular). Press Enter to add a tag.
                </FormDescription>
                <div className="flex flex-wrap gap-2">
                  {form.getValues('tags')?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddTag}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

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
                    <>Saving...</>
                  ) : mode === 'create' ? (
                    'Create Customer'
                  ) : (
                    'Update Customer'
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