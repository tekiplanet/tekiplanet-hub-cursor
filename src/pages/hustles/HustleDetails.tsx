import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2,
  Briefcase,
  ArrowLeft,
  Send,
  Loader2,
  DollarSign,
  Timer,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { hustleService, type Hustle } from '@/services/hustleService';
import { cn, formatCurrency } from '@/lib/utils';
import ApplyHustleDialog from '@/components/hustles/ApplyHustleDialog';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const HustleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isApplyDialogOpen, setIsApplyDialogOpen] = React.useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['hustle', id],
    queryFn: () => hustleService.getHustleDetails(id!),
    enabled: !!id
  });

  const hustle = data?.hustle;

  console.log('Hustle Data:', {
    data,
    hustle,
    can_apply: hustle?.can_apply,
    status: hustle?.status,
    deadline: hustle?.deadline,
    assigned_professional_id: hustle?.assigned_professional_id,
    application_status: hustle?.application_status,
    cannot_apply_reason: hustle?.cannot_apply_reason
  });

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

  const { data: profileData } = useQuery({
    queryKey: ['professional-profile'],
    queryFn: hustleService.checkProfessionalProfile
  });

  console.log('Application Status Check:', {
    hasProfile: profileData?.has_profile,
    profileStatus: profileData?.profile?.status,
    profileCategory: profileData?.profile?.category_id,
    hustleCategory: hustle?.category?.id,
    canApply: hustle?.can_apply,
    hustleStatus: hustle?.status,
    deadline: hustle?.deadline,
    applicationStatus: hustle?.application_status
  });

  const getApplicationStatus = (hustle: Hustle) => {
    // First check if user has a professional profile
    if (!profileData?.has_profile) {
      return {
        can_apply: false,
        reason: 'You need to create a professional profile to apply for hustles'
      };
    }

    // Check if professional profile is active
    if (profileData?.profile?.status !== 'active') {
      return {
        can_apply: false,
        reason: 'Your professional profile must be active to apply for hustles'
      };
    }

    // Check if professional's category matches the hustle category
    if (profileData?.profile?.category_id !== hustle.category.id) {
      return {
        can_apply: false,
        reason: 'This hustle is for a different professional category'
      };
    }

    // Rest of the existing checks...
    if (hustle.status !== 'open') {
      return {
        can_apply: false,
        reason: 'This hustle is no longer accepting applications'
      };
    }

    if (hustle.assigned_professional_id) {
      return {
        can_apply: false,
        reason: 'A professional has already been assigned to this hustle'
      };
    }

    const currentDate = new Date();
    const deadlineDate = new Date(hustle.deadline);
    if (deadlineDate < currentDate) {
      return {
        can_apply: false,
        reason: 'The application deadline has passed'
      };
    }

    if (hustle.application_status) {
      return {
        can_apply: false,
        reason: hustle.application_status === 'pending' ? 'Your application is under review' :
               hustle.application_status === 'approved' ? 'Your application has been approved' :
               hustle.application_status === 'rejected' ? 'Your application was not successful' :
               'You have withdrawn your application'
      };
    }

    // If all checks pass, user can apply
    return {
      can_apply: true,
      reason: null
    };
  };

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

  // Calculate days remaining
  const daysRemaining = Math.max(0, Math.ceil(
    (new Date(hustle.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  ));

  const applicationStatus = getApplicationStatus(hustle);

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="container mx-auto p-4 space-y-6 max-w-5xl"
      >
        {/* Header Section */}
        <motion.div variants={item} className="relative">
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg" />
          <div className="relative pt-6 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <Badge variant="secondary" className="mb-2">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {hustle.category.name}
                </Badge>
                <h1 className="text-2xl md:text-3xl font-bold">{hustle.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                {/* Apply Button with Status */}
                <div className="flex items-center gap-2">
                  <Button 
                    size="lg"
                    onClick={() => setIsApplyDialogOpen(true)}
                    disabled={!applicationStatus.can_apply}
                    className={cn(
                      "relative",
                      applicationStatus.can_apply 
                        ? "bg-primary text-white hover:bg-primary/90" 
                        : "bg-muted"
                    )}
                  >
                    <UserCheck className="h-5 w-5 mr-2" />
                    {applicationStatus.can_apply ? 'Apply for Hustle' : (
                      hustle.application_status === 'pending' ? 'Application Pending' :
                      hustle.application_status === 'approved' ? 'Application Approved' :
                      hustle.application_status === 'rejected' ? 'Application Rejected' :
                      'Cannot Apply'
                    )}
                  </Button>

                  {/* Show reason why user can't apply */}
                  {!applicationStatus.can_apply && (
                    <p className="text-sm text-muted-foreground">
                      {applicationStatus.reason}
                    </p>
                  )}

                  {/* Show application status badge */}
                  {hustle.application_status && (
                    <Badge variant={
                      hustle.application_status === 'approved' ? 'success' :
                      hustle.application_status === 'rejected' ? 'destructive' :
                      'secondary'
                    }>
                      {hustle.application_status.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent group-hover:from-primary/10 transition-colors" />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Timer className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Left</p>
                  <p className="font-semibold">{daysRemaining} days</p>
                </div>
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, (daysRemaining / 30) * 100))} 
                className="mt-3"
              />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent group-hover:from-blue-500/10 transition-colors" />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-semibold">{new Date(hustle.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent group-hover:from-green-500/10 transition-colors" />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold">{formatCurrency(hustle.budget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent group-hover:from-purple-500/10 transition-colors" />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="font-semibold">{hustle.applications_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={item}>
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Details
              </TabsTrigger>
              {hustle.application_status === 'approved' && (
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Chat
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {hustle.description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hustle.requirements.split('\n').map((req, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 group"
                      >
                        <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-sm leading-relaxed">{req}</p>
                      </motion.div>
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
        </motion.div>
      </motion.div>
    </ScrollArea>
  );
};

export default HustleDetails; 