import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import {
    Dialog,
    DialogContent,
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { shippingService, ShippingAddress } from '@/services/shippingService';
import { toast } from 'sonner';

const formSchema = z.object({
    first_name: z.string().min(2).max(255),
    last_name: z.string().min(2).max(255),
    phone: z.string().min(10).max(20),
    email: z.string().email(),
    address: z.string().min(5),
    city: z.string().min(2).max(255),
    state_id: z.string().uuid(),
    is_default: z.boolean().default(false)
});

interface AddressFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    address?: ShippingAddress;
    onSuccess: () => void;
}

export function AddressFormDialog({ open, onOpenChange, address, onSuccess }: AddressFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: states = [] } = useQuery({
        queryKey: ['states'],
        queryFn: shippingService.getStates
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: address?.first_name ?? '',
            last_name: address?.last_name ?? '',
            phone: address?.phone ?? '',
            email: address?.email ?? '',
            address: address?.address ?? '',
            city: address?.city ?? '',
            state_id: address?.state.id ?? '',
            is_default: address?.is_default ?? false
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true);
            if (address) {
                await shippingService.updateAddress(address.id, values);
                toast.success('Address updated successfully');
            } else {
                await shippingService.addAddress(values);
                toast.success('Address added successfully');
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {address ? 'Edit Address' : 'Add New Address'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="state_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>State</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a state" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {states.map((state) => (
                                                    <SelectItem
                                                        key={state.id}
                                                        value={state.id}
                                                    >
                                                        {state.name}
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
                            name="is_default"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Set as default address
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {address ? 'Update Address' : 'Add Address'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 