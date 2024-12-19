import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AddressFormDialog } from './AddressFormDialog';
import { ShippingAddress, shippingService } from '@/services/shippingService';

interface AddressCardProps {
    address: ShippingAddress;
    onUpdate: () => void;
}

export function AddressCard({ address, onUpdate }: AddressCardProps) {
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        try {
            setIsDeleting(true);
            await shippingService.deleteAddress(address.id);
            toast.success('Address deleted successfully');
            onUpdate();
        } catch (error) {
            toast.error('Failed to delete address');
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    }

    return (
        <>
            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium">
                                {address.first_name} {address.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {address.phone}
                            </p>
                        </div>
                        {address.is_default && (
                            <Badge variant="secondary">Default</Badge>
                        )}
                    </div>
                    <div className="mt-4 space-y-1 text-sm">
                        <p>{address.address}</p>
                        <p>
                            {address.city}, {address.state.name}
                        </p>
                        <p>{address.email}</p>
                    </div>
                </CardContent>
                <CardFooter className="px-6 py-4 bg-muted/50">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowEditDialog(true)}
                        >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            <AddressFormDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                address={address}
                onSuccess={onUpdate}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Address</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this address? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 