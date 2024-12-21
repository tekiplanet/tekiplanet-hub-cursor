import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Search, 
  Plus,
  UserPlus,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Tag
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { businessService } from '@/services/businessService';
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";
import CustomerFormDialog from '@/components/business/CustomerFormDialog';
import { DeleteConfirmDialog } from "@/components/business/DeleteConfirmDialog";
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Customer } from '@/types/business';

const CustomerCard = ({ 
  customer, 
  onEdit, 
  onDelete 
}: { 
  customer: Customer; 
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <div 
        className="p-4 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer flex flex-col"
        onClick={() => navigate(`/dashboard/business/customers/${customer.id}`)}
      >
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 border">
            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold truncate">{customer.name}</h3>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span>{customer.phone}</span>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(customer)}>
                    Edit Customer
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => onDelete(customer)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {customer.tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {customer.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Total Spent</p>
            <p className="font-medium">{formatCurrency(customer.total_spent, customer.currency)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Last Order</p>
            <p className="font-medium">{customer.last_order_date}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ onAddCustomer }: { onAddCustomer: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center"
  >
    <div className="p-12 rounded-lg border border-dashed flex flex-col items-center gap-4">
      <div className="p-4 bg-primary/10 rounded-full">
        <Users className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">No Customers Yet</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Start building your customer base by adding your first customer.
        </p>
      </div>
      <Button 
        onClick={onAddCustomer}
        className="mt-4"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Customer
      </Button>
    </div>
  </motion.div>
);

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ['business-customers'],
    queryFn: businessService.getCustomers,
    initialData: [],
  });

  const queryClient = useQueryClient();

  const handleAddCustomer = () => {
    setIsCustomerFormOpen(true);
  };

  const stats = [
    { label: 'Total Customers', value: customers?.length || '0', icon: Users },
    { label: 'Active This Month', value: '0', icon: UserPlus },
  ];

  const handleDelete = async () => {
    if (!customerToDelete) return;

    try {
      setIsDeleting(true);
      await businessService.deleteCustomer(customerToDelete.id);
      
      queryClient.setQueryData(['business-customers'], (old: Customer[] | undefined) => 
        old?.filter(c => c.id !== customerToDelete.id) ?? []
      );

      toast.success('Customer deleted successfully');
      setCustomerToDelete(null);
    } catch (error) {
      toast.error('Failed to delete customer', {
        id: 'delete-customer-error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row gap-6 md:items-center">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Customers</h1>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{customers?.length || '0'} total</span>
            </div>
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>0 this month</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search customers..." 
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            className="shrink-0" 
            size="sm"
            onClick={handleAddCustomer}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Customer List or Empty State */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border animate-pulse">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between">
                <div className="space-y-1">
                  <div className="h-2 bg-muted rounded w-16" />
                  <div className="h-3 bg-muted rounded w-20" />
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-muted rounded w-16" />
                  <div className="h-3 bg-muted rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !customers || customers.length === 0 ? (
        <EmptyState onAddCustomer={handleAddCustomer} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <CustomerCard 
              key={customer.id} 
              customer={customer} 
              onEdit={setCustomerToEdit}
              onDelete={setCustomerToDelete}
            />
          ))}
        </div>
      )}

      <DeleteConfirmDialog 
        open={!!customerToDelete}
        onOpenChange={(open) => !open && setCustomerToDelete(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title={`Delete ${customerToDelete?.name}?`}
        description={`Are you sure you want to delete ${customerToDelete?.name}? This action cannot be undone.`}
      />

      <CustomerFormDialog 
        open={isCustomerFormOpen || !!customerToEdit}
        onOpenChange={(open) => {
          setIsCustomerFormOpen(open);
          if (!open) setCustomerToEdit(null);
        }}
        mode={customerToEdit ? 'edit' : 'create'}
        customer={customerToEdit}
      />
    </div>
  );
} 