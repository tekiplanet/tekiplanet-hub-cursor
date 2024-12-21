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
import { CreateCustomerDto } from '@/types/business';
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

const customerFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
});

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Partial<CreateCustomerDto>;
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
  const [availableStates, setAvailableStates] = useState<readonly string[]>([]);

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
      notes: customer?.notes || '',
      tags: customer?.tags || []
    }
  });

  useEffect(() => {
    const countryCode = form.watch('country');
    if (countryCode) {
      const states = getStatesByCountry(countryCode);
      setAvailableStates(states);
      if (!states.find(state => state.name === form.getValues('state'))) {
        form.setValue('state', '');
      }
    }
  }, [form.watch('country')]);

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
      if (mode === 'create') {
        await businessService.createCustomer(values);
        toast.success('Customer created successfully');
      } else {
        // Add edit logic here when needed
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
            Add a new customer to your business profile. Fill in the details below.
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
                      <FormDescription>
                        The primary contact email for this customer
                      </FormDescription>
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAllCountries().map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <div className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>{country.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the country where your customer is located
                      </FormDescription>
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!form.getValues('country')}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state" />
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
                      <FormDescription>
                        Select the state or region
                      </FormDescription>
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
                        <Input 
                          placeholder="Enter city name" 
                          {...field}
                          disabled={!form.getValues('state')}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the city or town name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Tags</FormLabel>
                <FormDescription>
                  Add tags to categorize your customer (e.g., VIP, Wholesale, Regular). Press Enter or click + to add a tag.
                </FormDescription>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Type and press Enter..."
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.watch('tags')?.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
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
                        placeholder="Add any additional notes..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add any important information about this customer that you want to remember
                    </FormDescription>
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
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Customer' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 