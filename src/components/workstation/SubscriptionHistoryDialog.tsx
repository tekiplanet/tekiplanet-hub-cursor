import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Clock, Calendar, CreditCard } from "lucide-react";

interface SubscriptionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  history: any[];
  isLoading: boolean;
}

export function SubscriptionHistoryDialog({ 
  isOpen, 
  onClose, 
  history,
  isLoading 
}: SubscriptionHistoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Subscription History</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No subscription history found
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{item.plan.name}</h3>
                    <Badge variant={
                      item.status === 'active' ? 'default' :
                      item.status === 'expired' ? 'secondary' :
                      item.status === 'cancelled' ? 'destructive' :
                      'outline'
                    }>
                      {item.status}
                    </Badge>
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(item.start_date), 'MMM d, yyyy')} - {format(new Date(item.end_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{item.plan.duration_days} days</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="w-4 h-4" />
                      <span>{formatCurrency(item.total_amount)} ({item.payment_type})</span>
                    </div>
                  </div>

                  {item.cancellation_reason && (
                    <div className="mt-2 text-sm">
                      <p className="text-muted-foreground">
                        Cancellation reason: {item.cancellation_reason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 