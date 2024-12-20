import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { workstationService } from "@/services/workstationService";
import { formatCurrency } from "@/lib/utils";
import { SubscriptionDialog } from "@/components/workstation/SubscriptionDialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { comparePlans } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

const Plans = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['workstation-plans'],
    queryFn: workstationService.getPlans
  });

  const { data: currentSubscription } = useQuery({
    queryKey: ['current-subscription'],
    queryFn: workstationService.getCurrentSubscription
  });

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

  const handleSubscribe = async (planId: string, paymentType: 'full' | 'installment', startDate?: Date, isUpgrade?: boolean) => {
    try {
      const response = await workstationService.createSubscription(planId, paymentType, startDate, isUpgrade);
      
      // Only close dialog after successful subscription
      setShowDialog(false);
      
      // Handle different response structures for new vs upgrade
      if (isUpgrade) {
        toast.success(response.message || 'Plan updated successfully!', {
          description: response.subscription.plan.name
        });
      } else {
        toast.success(response.message || 'Plan subscribed successfully!', {
          description: response.transaction_reference 
            ? `Carn Number: ${response.transaction_reference}`
            : response.subscription.plan.name
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['current-subscription']);
      
      // Navigate to subscription page
      navigate('/dashboard/workstation/subscription');
    } catch (error: any) {
      console.error('Subscription error:', error);
      
      // Handle existing subscription error
      if (error.response?.status === 400 && error.response?.data?.subscription) {
        toast.error('Subscription Failed', {
          description: error.response.data.message,
          action: {
            label: 'View Subscription',
            onClick: () => navigate('/dashboard/workstation/subscription')
          }
        });
        setShowDialog(false);
      } else {
        // For other errors, keep dialog open and show error
        toast.error('Failed to process subscription', {
          description: error.response?.data?.message || 'Please try again'
        });
      }
      
      throw error;
    }
  };

  const getSubscriptionAction = (plan: WorkstationPlan) => {
    if (!currentSubscription) return 'subscribe';
    
    const action = comparePlans(
      currentSubscription.plan.duration_days,
      plan.duration_days
    );
    
    return action;
  };

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-bold mb-2">Error Loading Plans</h2>
          <p>{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="text-center">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 bg-muted rounded mx-auto" />
            <div className="h-4 w-96 bg-muted rounded mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-[500px] bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Workstation Plans 🏢
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose the perfect workspace plan for your needs
            </p>
          </div>
        </motion.div>

        {currentSubscription && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Active Subscription</h3>
                <p className="text-sm text-muted-foreground">
                  You have an active {currentSubscription.plan.name} subscription
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard/workstation/subscription')}
              >
                View Subscription
              </Button>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {plans?.map((plan) => (
            <motion.div key={plan.id} variants={item} className="flex">
              <Card
                className={cn(
                  "flex flex-col w-full hover:shadow-lg transition-all duration-300",
                  selectedPlan === plan.id && "ring-2 ring-primary"
                )}
              >
                <div className="p-6 flex flex-col flex-grow">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="text-muted-foreground">
                        /{plan.duration_days === 1 ? 'day' : 
                          plan.duration_days === 7 ? 'week' : 
                          plan.duration_days === 30 ? 'month' : 
                          plan.duration_days === 90 ? 'quarter' : 'year'}
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 flex-grow">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Plan Highlights */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {plan.has_locker && (
                      <Badge variant="secondary">Locker Access</Badge>
                    )}
                    {plan.has_dedicated_support && (
                      <Badge variant="secondary">Dedicated Support</Badge>
                    )}
                    {plan.meeting_room_hours > 0 && (
                      <Badge variant="secondary">
                        {plan.meeting_room_hours === -1 ? 'Unlimited' : `${plan.meeting_room_hours}hr`} Meeting Room
                      </Badge>
                    )}
                  </div>

                  {/* Installment Info */}
                  {plan.allows_installments && (
                    <div className="mt-4 bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Info className="h-4 w-4 shrink-0" />
                        <span>
                          Available in {plan.installment_months} installments of{' '}
                          {formatCurrency(plan.installment_amount)}/month
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button 
                    className="w-full mt-6" 
                    variant={getSubscriptionAction(plan) === 'current' ? 'outline' : 'default'}
                    onClick={() => {
                      const action = getSubscriptionAction(plan);
                      
                      if (action === 'current') {
                        toast.info("You're currently subscribed to this plan", {
                          action: {
                            label: "View Subscription",
                            onClick: () => navigate('/dashboard/workstation/subscription')
                          }
                        });
                        return;
                      }
                      
                      setSelectedPlan(plan.id);
                      setShowDialog(true);
                    }}
                    disabled={getSubscriptionAction(plan) === 'current'}
                  >
                    {(() => {
                      const action = getSubscriptionAction(plan);
                      switch (action) {
                        case 'current':
                          return 'Current Plan';
                        case 'upgrade':
                          return 'Upgrade Plan';
                        case 'downgrade':
                          return 'Downgrade Plan';
                        default:
                          return 'Subscribe Now';
                      }
                    })()}
                  </Button>
                </div>

                {/* 3D Effect Gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-lg pointer-events-none" />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info - update styling */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <span>All plans include high-speed Wi-Fi and basic amenities</span>
          <span>•</span>
          <Button variant="link" className="text-sm h-auto p-0">
            Contact us
          </Button>
        </motion.div>
      </div>

      <SubscriptionDialog 
        plan={plans?.find(p => p.id === selectedPlan) ?? null}
        isOpen={showDialog}
        onClose={() => {
          setShowDialog(false);
          setSelectedPlan(null);
        }}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
};

export default Plans; 