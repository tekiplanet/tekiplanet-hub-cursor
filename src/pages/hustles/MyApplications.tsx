import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  XCircle,
  Loader2,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { hustleService } from '@/services/hustleService';
import { formatCurrency } from '@/lib/utils';

const MyApplications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: hustleService.getMyApplications
  });

  const withdrawMutation = useMutation({
    mutationFn: hustleService.withdrawApplication,
    onSuccess: () => {
      toast.success('Application withdrawn successfully');
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
    onError: () => {
      toast.error('Failed to withdraw application');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground">
            Track and manage your hustle applications
          </p>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications?.map((application) => (
            <Card 
              key={application.id}
              className="p-6 hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex justify-between items-start">
                  <Badge variant={
                    application.status === 'approved' ? 'success' :
                    application.status === 'rejected' ? 'destructive' :
                    application.status === 'withdrawn' ? 'secondary' :
                    'default'
                  }>
                    {application.status.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Applied on {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Hustle Details */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    {application.hustle.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Deadline: {new Date(application.hustle.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{formatCurrency(application.hustle.budget)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/hustles/${application.hustle.id}`)}
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  {application.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => withdrawMutation.mutate(application.id)}
                      disabled={withdrawMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      {withdrawMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Withdraw
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {applications?.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't applied to any hustles yet.
              </p>
              <Button onClick={() => navigate('/dashboard/hustles')}>
                Browse Hustles
              </Button>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default MyApplications; 