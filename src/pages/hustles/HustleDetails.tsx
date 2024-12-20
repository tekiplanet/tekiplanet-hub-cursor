import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle,
  ArrowLeft,
  Send,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { hustleService } from '@/services/hustleService';
import { formatCurrency } from '@/lib/utils';

const HustleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['hustle', id],
    queryFn: () => hustleService.getHustleDetails(id!),
    enabled: !!id
  });

  const hustle = data?.hustle;

  const applyMutation = useMutation({
    mutationFn: hustleService.applyForHustle,
    onSuccess: () => {
      toast.success('Application submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['hustle', id] });
    },
    onError: () => {
      toast.error('Failed to submit application');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !hustle) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Hustle not found</h2>
        <Button 
          variant="link" 
          onClick={() => navigate('/dashboard/hustles')}
          className="mt-4"
        >
          Back to Hustles
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-5xl">
      {/* Back Button */}
      {/* <Button
        variant="ghost"
        className="gap-2"
        onClick={() => navigate('/dashboard/hustles')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Hustles
      </Button> */}

      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <Badge variant="secondary">
              {hustle.category.name}
            </Badge>
            <h1 className="text-2xl font-bold">{hustle.title}</h1>
          </div>
          <div className="flex gap-2">
            {hustle.can_apply ? (
              <Button 
                onClick={() => applyMutation.mutate(id!)}
                disabled={applyMutation.isPending}
              >
                {applyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  'Apply Now'
                )}
              </Button>
            ) : hustle.application_status === 'pending' ? (
              <Badge>Application Pending</Badge>
            ) : hustle.application_status === 'approved' ? (
              <Badge variant="success">Application Approved</Badge>
            ) : hustle.application_status === 'rejected' ? (
              <Badge variant="destructive">Application Rejected</Badge>
            ) : null}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="font-medium">{hustle.deadline}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="font-medium">{hustle.applications_count}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-medium">{formatCurrency(hustle.budget)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          {hustle.application_status === 'approved' && (
            <TabsTrigger value="chat">Chat</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{hustle.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hustle.requirements.split('\n').map((req, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="h-6 w-6 flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <p>{req}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {hustle.application_status === 'approved' && (
          <TabsContent value="chat">
            <Card className="h-[500px]">
              <CardHeader>
                <CardTitle>Chat with Admin</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(500px-4rem)]">
                {/* Chat interface will be implemented next */}
                <div className="text-center text-muted-foreground">
                  Chat feature coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default HustleDetails; 