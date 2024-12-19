import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AddressFormDialog } from './AddressFormDialog';
import { AddressCard } from './AddressCard';
import { shippingService } from '@/services/shippingService';

interface AddressListProps {
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export function AddressList({ selectedId, onSelect }: AddressListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: addresses = [], isLoading, refetch } = useQuery({
    queryKey: ['shipping-addresses'],
    queryFn: shippingService.getAddresses
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Select Shipping Address</h2>
        <Button onClick={() => setShowAddDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No addresses found. Add your first shipping address.
          </CardContent>
        </Card>
      ) : (
        <RadioGroup
          value={selectedId || undefined}
          onValueChange={onSelect}
          className="grid gap-4 md:grid-cols-2"
        >
          {addresses.map((address) => (
            <div key={address.id} className="relative">
              <RadioGroupItem
                value={address.id}
                id={address.id}
                className="absolute top-4 right-4 z-10"
              />
              <AddressCard
                address={address}
                onUpdate={refetch}
              />
            </div>
          ))}
        </RadioGroup>
      )}

      <AddressFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={refetch}
      />
    </div>
  );
} 