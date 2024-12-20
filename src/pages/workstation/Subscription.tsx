import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  CreditCard,
  QrCode,
  RefreshCw,
  Timer,
  User,
  Wallet,
  ChevronRight,
  Building2,
  History,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Info,
  LayoutDashboard,
  X
} from "lucide-react";
import { formatCurrency, comparePlans } from "@/lib/utils";
import { workstationService } from "@/services/workstationService";
import { QRCodeSVG } from 'qrcode.react';
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { SubscriptionDialog } from "@/components/workstation/SubscriptionDialog";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const CANCELLATION_REASONS = [
  { label: 'No longer need the service', value: 'no_need' },
  { label: 'Switching to a different service', value: 'switching' },
  { label: 'Cost concerns', value: 'cost' },
  { label: 'Not satisfied with the service', value: 'not_satisfied' },
  { label: 'Temporary break', value: 'temporary' },
  { label: 'Other', value: 'other' }
];

const Subscription = () => {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['workstation-subscription'],
    queryFn: workstationService.getCurrentSubscription
  });

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: plans } = useQuery({
    queryKey: ['workstation-plans'],
    queryFn: workstationService.getPlans
  });

  const statusColors = {
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    expired: "bg-red-500/10 text-red-500 border-red-500/20",
    cancelled: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    pending: "bg-blue-500/10 text-blue-500 border-blue-500/20"
  };

  // Calculate subscription progress
  const calculateProgress = () => {
    if (!subscription) return 0;
    const start = new Date(subscription.start_date).getTime();
    const end = new Date(subscription.end_date).getTime();
    const now = new Date().getTime();
    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const handlePlanChange = async (planId: string, paymentType: 'full' | 'installment', startDate?: Date, isUpgrade?: boolean) => {
    try {
      const response = await workstationService.createSubscription(planId, paymentType, startDate, isUpgrade);
      
      setShowUpgradeDialog(false);
      
      toast.success(response.message || 'Plan updated successfully!', {
        description: response.subscription.plan.name
      });
      
      queryClient.invalidateQueries(['current-subscription']);
    } catch (error: any) {
      console.error('Plan change error:', error);
      toast.error('Failed to change plan', {
        description: error.response?.data?.message || 'Please try again'
      });
    }
  };

  const [isRenewing, setIsRenewing] = useState(false);
  const [isCancelling, setCancelling] = useState(false);

  const handleRenewSubscription = async () => {
    try {
      setIsRenewing(true);
      await workstationService.renewSubscription(subscription.id);
      queryClient.invalidateQueries(['current-subscription']);
      toast.success('Subscription renewed successfully');
    } catch (error: any) {
      toast.error('Failed to renew subscription', {
        description: error.response?.data?.message || 'Please try again'
      });
    } finally {
      setIsRenewing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      await workstationService.cancelSubscription(subscription.id);
      queryClient.invalidateQueries(['current-subscription']);
      toast.success('Subscription cancelled successfully');
    } catch (error: any) {
      toast.error('Failed to cancel subscription', {
        description: error.response?.data?.message || 'Please try again'
      });
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 animate-pulse">
        {/* Add loading skeleton here */}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      {/* Sticky Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg p-4 -mx-4 mb-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Workstation</h1>
          {subscription && (
            <Badge 
              variant="outline" 
              className={`${statusColors[subscription.status]} px-3 py-1`}
            >
              {subscription.status.toUpperCase()}
            </Badge>
          )}
        </div>
      </motion.div>

      {subscription && (
        <div className="space-y-6">
          {/* Plan Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{subscription.plan.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(subscription.start_date), "MMM d, yyyy")} - {format(new Date(subscription.end_date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  
                  {/* Subscription Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subscription Progress</span>
                      <span className="font-medium">{Math.round(calculateProgress())}%</span>
                    </div>
                    <Progress value={calculateProgress()} className="h-2" />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="border-t grid grid-cols-2 divide-x">
                  <Button 
                    variant="ghost" 
                    className="p-3 h-auto flex items-center justify-center gap-2 rounded-none"
                    onClick={() => {
                      toast.custom((t) => (
                        <ConfirmDialog
                          open={true}
                          onOpenChange={() => toast.dismiss(t)}
                          title="Renew Subscription"
                          description="Are you sure you want to renew your subscription? This will extend your current plan for another period."
                          actionLabel="Renew"
                          onConfirm={handleRenewSubscription}
                        />
                      ));
                    }}
                    disabled={isRenewing}
                  >
                    {isRenewing ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span>Renew</span>
                  </Button>

                  <Button 
                    variant="ghost" 
                    className="p-3 h-auto flex items-center justify-center gap-2 rounded-none text-destructive hover:text-destructive"
                    onClick={() => {
                      toast.custom((t) => (
                        <ConfirmDialog
                          open={true}
                          onOpenChange={() => toast.dismiss(t)}
                          title="Cancel Subscription"
                          description="We're sorry to see you go. Please help us understand why you're cancelling."
                          actionLabel="Cancel Subscription"
                          variant="destructive"
                          fields={[
                            {
                              type: 'select',
                              name: 'reason',
                              label: 'Reason for cancellation',
                              placeholder: 'Select a reason',
                              options: CANCELLATION_REASONS,
                              required: true
                            },
                            {
                              type: 'textarea',
                              name: 'feedback',
                              label: 'Additional feedback',
                              placeholder: 'Please provide any additional feedback (optional)'
                            }
                          ]}
                          onConfirm={async (data) => {
                            try {
                              setCancelling(true);
                              await workstationService.cancelSubscription(subscription.id, data);
                              queryClient.invalidateQueries(['current-subscription']);
                              toast.success('Subscription cancelled successfully');
                            } catch (error: any) {
                              toast.error('Failed to cancel subscription', {
                                description: error.response?.data?.message || 'Please try again'
                              });
                            } finally {
                              setCancelling(false);
                            }
                          }}
                        />
                      ));
                    }}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    <span>Cancel</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs Section */}
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-[400px]">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Plan Details
              </TabsTrigger>
              <TabsTrigger value="management" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Plan Management
              </TabsTrigger>
            </TabsList>

            {/* Plan Details Tab */}
            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Access Card Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-primary" />
                        Access Card
                      </h3>
                      <Button variant="outline" size="sm">
                        View History
                      </Button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                      {/* QR Code */}
                      <div className="flex-1 flex flex-col items-center space-y-4">
                        <div className="p-4 bg-white rounded-xl">
                          <QRCodeSVG 
                            value={subscription.tracking_code}
                            size={200}
                            level="H"
                            includeMargin
                          />
                        </div>
                        <Button variant="outline" className="w-full gap-2">
                          <Download className="h-4 w-4" />
                          Download QR Code
                        </Button>
                      </div>

                      {/* Card Details */}
                      <div className="flex-1 space-y-4">
                        <div className="grid gap-4">
                          <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                            <p className="text-sm text-muted-foreground">Card Number</p>
                            <p className="font-mono font-medium">{subscription.tracking_code}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                            <p className="text-sm text-muted-foreground">Last Check-in</p>
                            <p className="font-medium">
                              {subscription.last_check_in 
                                ? format(new Date(subscription.last_check_in), "MMM d, yyyy h:mm a")
                                : "No check-in recorded"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Details Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Payment Details
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="font-semibold">{formatCurrency(subscription.total_amount)}</p>
                        </div>
                        <Badge variant="secondary">{subscription.payment_type}</Badge>
                      </div>

                      {subscription.payments?.map((payment, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="space-y-1">
                            <p className="font-medium">Payment #{payment.installment_number || 1}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(payment.due_date), "MMM d, yyyy")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                            <Badge 
                              variant="secondary" 
                              className={payment.status === 'paid' ? 'bg-green-500/10 text-green-500' : ''}
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Plan Management Tab */}
            <TabsContent value="management" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Plan Management
                      </h3>
                      <Badge variant="outline" className="font-medium">
                        {subscription.plan.duration_days} Days Plan
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {plans?.map(plan => {
                        if (plan.duration_days === subscription.plan.duration_days) {
                          return (
                            <Card key={plan.id} className="bg-primary/5 border-primary">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="default" className="bg-primary">Current Plan</Badge>
                                </div>
                                <h4 className="font-semibold">{plan.name}</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                  {plan.duration_days} days access
                                </p>
                                <p className="font-medium">{formatCurrency(plan.price)}</p>
                              </CardContent>
                            </Card>
                          );
                        }

                        const action = comparePlans(subscription.plan.duration_days, plan.duration_days);
                        const isUpgrade = action === 'upgrade';
                        
                        return (
                          <Card 
                            key={plan.id} 
                            className={cn(
                              "relative group hover:shadow-lg transition-all duration-300",
                              isUpgrade ? "hover:border-green-500/50" : "hover:border-orange-500/50"
                            )}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    isUpgrade 
                                      ? "border-green-500/20 bg-green-500/10 text-green-500" 
                                      : "border-orange-500/20 bg-orange-500/10 text-orange-500"
                                  )}
                                >
                                  {isUpgrade ? 'Upgrade Available' : 'Downgrade Option'}
                                </Badge>
                              </div>
                              <h4 className="font-semibold">{plan.name}</h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                {plan.duration_days} days access
                              </p>
                              <div className="flex items-baseline gap-2">
                                <p className="font-medium">{formatCurrency(plan.price)}</p>
                                {isUpgrade && (
                                  <span className="text-xs text-muted-foreground">
                                    (+{formatCurrency(plan.price - subscription.plan.price)})
                                  </span>
                                )}
                              </div>

                              {/* Feature Comparison */}
                              <div className="mt-4 space-y-2">
                                {plan.meeting_room_hours > subscription.plan.meeting_room_hours && (
                                  <div className="flex items-center gap-2 text-xs text-green-500">
                                    <ArrowUpCircle className="w-3 h-3" />
                                    <span>+{plan.meeting_room_hours - subscription.plan.meeting_room_hours}hr meeting room</span>
                                  </div>
                                )}
                                {plan.print_pages_limit > subscription.plan.print_pages_limit && (
                                  <div className="flex items-center gap-2 text-xs text-green-500">
                                    <ArrowUpCircle className="w-3 h-3" />
                                    <span>+{plan.print_pages_limit - subscription.plan.print_pages_limit} print pages</span>
                                  </div>
                                )}
                                {!subscription.plan.has_locker && plan.has_locker && (
                                  <div className="flex items-center gap-2 text-xs text-green-500">
                                    <Plus className="w-3 h-3" />
                                    <span>Includes locker access</span>
                                  </div>
                                )}
                              </div>

                              <Button
                                className="w-full mt-4 gap-2"
                                variant={isUpgrade ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  setSelectedPlan(plan.id);
                                  setShowUpgradeDialog(true);
                                }}
                              >
                                {isUpgrade ? (
                                  <>
                                    <ArrowUpCircle className="w-4 h-4" />
                                    Upgrade Now
                                  </>
                                ) : (
                                  <>
                                    <ArrowDownCircle className="w-4 h-4" />
                                    Downgrade
                                  </>
                                )}
                              </Button>
                            </CardContent>

                            {/* Decorative Elements */}
                            <div 
                              className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
                                isUpgrade 
                                  ? "bg-gradient-to-tr from-green-500/5 to-transparent" 
                                  : "bg-gradient-to-tr from-orange-500/5 to-transparent"
                              )}
                            />
                          </Card>
                        );
                      })}
                    </div>

                    {/* Additional Info */}
                    <div className="mt-6 p-4 rounded-lg bg-muted/50">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Plan Change Information</p>
                          <p className="text-sm text-muted-foreground">
                            When upgrading, we'll calculate the remaining value of your current plan. 
                            Downgrades will take effect at the end of your current billing period.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <SubscriptionDialog 
        plan={plans?.find(p => p.id === selectedPlan) ?? null}
        currentSubscription={subscription}
        isOpen={showUpgradeDialog}
        onClose={() => {
          setShowUpgradeDialog(false);
          setSelectedPlan(null);
        }}
        onSubscribe={handlePlanChange}
      />
    </div>
  );
};

export default Subscription; 