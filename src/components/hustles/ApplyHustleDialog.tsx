import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserCheck, Loader2 } from 'lucide-react';

interface ApplyHustleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  hustleTitle: string;
}

const ApplyHustleDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  hustleTitle
}: ApplyHustleDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for Hustle</DialogTitle>
          <DialogDescription>
            Are you sure you want to apply for "{hustleTitle}"? 
            Your profile information will be shared with the admin.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Confirm Application
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyHustleDialog; 