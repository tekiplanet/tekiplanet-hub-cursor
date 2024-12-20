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
import { formatCurrency, formatDate, formatShortDate, cn } from '@/lib/utils';
import WithdrawApplicationDialog from '@/components/hustles/WithdrawApplicationDialog';

const MyApplications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: hustleService.getMyApplications
  });

  const [withdrawalDialog, setWithdrawalDialog] = React.useState<{
    isOpen: boolean;
    applicationId: string | null;
    hustleTitle: string;
  }>({
    isOpen: false,
    applicationId: null,
    hustleTitle: ''
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

  const handleWithdraw = (applicationId: string, hustleTitle: string) => {
    setWithdrawalDialog({
      isOpen: true,
      applicationId,
      hustleTitle
    });
  };

  const handleConfirmWithdraw = () => {
    if (withdrawalDialog.applicationId) {
      withdrawMutation.mutate(withdrawalDialog.applicationId, {
        onSuccess: () => {
          setWithdrawalDialog({ isOpen: false, applicationId: null, hustleTitle: '' });
        }
      });
    }
  };

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
              className="relative overflow-hidden group hover:shadow-lg transition-all duration-300"
            >
              {/* Status Indicator Line */}
              <div 
                className={cn(
                  "absolute top-0 left-0 w-full h-1",
                  application.status === 'approved' ? "bg-green-500" :
                  application.status === 'rejected' ? "bg-red-500" :
                  application.status === 'withdrawn' ? "bg-gray-500" :
                  "bg-blue-500"
                )}
              />

              <div className="p-6 space-y-4">
                {/* Header Section */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Badge variant={
                      application.status === 'approved' ? 'success' :
                      application.status === 'rejected' ? 'destructive' :
                      application.status === 'withdrawn' ? 'secondary' :
                      'default'
                    } className="rounded-md">
                      {application.status.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Applied on {formatDate(application.applied_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-background">
                      {application.hustle.category}
                    </Badge>
                  </div>
                </div>

                {/* Hustle Title */}
                <div>
                  <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {application.hustle.title}
                  </h3>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Deadline
                    </p>
                    <p className="text-sm font-medium">
                      {formatShortDate(application.hustle.deadline)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Budget
                    </p>
                    <p className="text-sm font-medium">
                      {formatCurrency(application.hustle.budget)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/hustles/${application.hustle.id}`)}
                    className="group/button"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2 group-hover/button:translate-x-1 transition-transform" />
                  </Button>

                  {application.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleWithdraw(application.id, application.hustle.title)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {applications?.length === 0 && (
            <div className="col-span-full">
              <Card className="p-12">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
                    <div className="relative flex items-center justify-center w-24 h-24 bg-primary/5 rounded-full">
                      <Briefcase className="h-12 w-12 text-primary/50" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't applied to any hustles yet. Start exploring opportunities!
                  </p>
                  <Button 
                    onClick={() => navigate('/dashboard/hustles')}
                    className="gap-2"
                  >
                    Browse Hustles
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      <WithdrawApplicationDialog
        isOpen={withdrawalDialog.isOpen}
        onClose={() => setWithdrawalDialog({ isOpen: false, applicationId: null, hustleTitle: '' })}
        onConfirm={handleConfirmWithdraw}
        isLoading={withdrawMutation.isPending}
        hustleTitle={withdrawalDialog.hustleTitle}
      />
    </ScrollArea>
  );
};

export default MyApplications; 