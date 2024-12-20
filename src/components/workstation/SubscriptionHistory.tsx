import { useQuery } from "@tanstack/react-query";
import { workstationService } from "@/services/workstationService";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function SubscriptionHistory() {
  const { data: history, isLoading } = useQuery({
    queryKey: ['subscription-history'],
    queryFn: workstationService.getSubscriptionHistory
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {history?.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{item.plan.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(item.start_date), "MMM d, yyyy")} - {format(new Date(item.end_date), "MMM d, yyyy")}
                </p>
                {item.cancelled_at && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Cancelled on {format(new Date(item.cancelled_at), "MMM d, yyyy")}
                    {item.cancellation_reason && (
                      <span className="block">
                        Reason: {CANCELLATION_REASONS.find(r => r.value === item.cancellation_reason)?.label}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <Badge variant="outline" className={getStatusColor(item.status)}>
                {item.status.toUpperCase()}
              </Badge>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-medium">{formatCurrency(item.total_amount)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 