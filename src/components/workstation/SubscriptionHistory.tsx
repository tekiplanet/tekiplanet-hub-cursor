import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { workstationService } from "@/services/workstationService";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export function SubscriptionHistory() {
  const [filters, setFilters] = useState<SubscriptionHistoryFilters>({
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    perPage: 10
  });

  const { data: history, isLoading } = useQuery({
    queryKey: ['subscription-history', filters],
    queryFn: () => workstationService.getSubscriptionHistory(filters)
  });

  const handleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <DateRangePicker
          value={filters.dateRange}
          onChange={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
        />
      </div>

      {/* History List */}
      <div className="space-y-4">
        {history?.data?.map((item) => (
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

      {/* Pagination */}
      {history?.meta && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {history.meta.from} to {history.meta.to} of {history.meta.total} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={history.meta.current_page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={history.meta.current_page === history.meta.last_page}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 