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
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Info,
  LayoutDashboard,
  X,
  AlertTriangle,
  Ban,
  AlertCircle,
  RotateCcw,
  HelpCircle,
  PauseCircle,
  MessageCircle,
  Star,
  Percent,
  Key,
  Check,
  ClipboardList,
  ArrowRight
} from "lucide-react";
import { formatCurrency, comparePlans } from "@/lib/utils";
import { workstationService } from "@/services/workstationService";
import { QRCodeSVG } from 'qrcode.react';
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { SubscriptionDialog } from "@/components/workstation/SubscriptionDialog";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useNavigate } from "react-router-dom";
import PagePreloader from "@/components/ui/PagePreloader";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    try {
      setIsProcessing(true);
      
      if (subscription?.status === 'cancelled') {
        // Handle reactivation
        const response = await workstationService.reactivateSubscription(selectedPlan, 'full');
        toast.success(response.message || 'Subscription reactivated successfully!', {
          description: response.subscription.plan.name
        });
      } else {
        // Handle normal plan change
        await handlePlanChange(
          selectedPlan,
          'full',
          undefined,
          subscription?.status !== 'cancelled'
        );
      }
      
      setShowUpgradeDialog(false);
      setSelectedPlan(null);
      queryClient.invalidateQueries(['current-subscription']);
    } catch (error: any) {
      toast.error('Failed to process subscription', {
        description: error.response?.data?.message || 'Please try again'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <PagePreloader />;
  }

  if (!subscription) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg p-4 -mx-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Workstation</h1>
          </div>
        </motion.div>

        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Active Subscription</h2>
          <p className="text-muted-foreground mb-6">
            You don't have an active workstation subscription. Choose a plan to get started.
          </p>
          <Button 
            onClick={() => navigate('/dashboard/workstation/plans')} 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Get Started
          </Button>
        </div>
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

                  {/* Quick Actions */}
                  <div className="border-t flex divide-x">
                    {subscription.status === 'active' && (
                      <>
                        <Button 
                          variant="ghost" 
                          className="flex-1 h-12 flex items-center justify-center gap-2 rounded-none hover:bg-muted/50"
                          onClick={() => setShowRenewDialog(true)}
                          disabled={isRenewing}
                        >
                          {isRenewing ? (
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          <span className="font-medium">Renew</span>
                        </Button>

                        <Button 
                          variant="ghost" 
                          className="flex-1 h-12 flex items-center justify-center gap-2 rounded-none text-destructive hover:bg-destructive/5 hover:text-destructive"
                          onClick={() => setShowCancelDialog(true)}
                          disabled={isCancelling}
                        >
                          {isCancelling ? (
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          <span className="font-medium">Cancel</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Move Expired Warning here - right after the overview card */}
          {subscription.status === 'expired' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-red-500">Subscription Expired</p>
                  <div className="text-sm text-muted-foreground">
                    Your subscription expired on {format(new Date(subscription.end_date), "MMMM d, yyyy")}. 
                    Renew now to continue accessing workspace facilities.
                  </div>
                  <div className="mt-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => setShowRenewDialog(true)}
                      disabled={isRenewing}
                    >
                      {isRenewing ? (
                        <>
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Renewing...
                        </>
                      ) : (
                        'Renew Subscription'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

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
                        {subscription.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await workstationService.downloadAccessCard(subscription.id);
                              } catch (error) {
                                toast.error('Failed to download access card');
                              }
                            }}
                            className="w-full"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Access Card
                          </Button>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center">
                            QR code download is not available for {subscription.status} subscriptions
                          </p>
                        )}
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
        action={selectedPlan ? 'upgrade' : 'subscribe'}
      >
        <DialogTitle>
          {selectedPlan 
            ? 'Change Plan' 
            : 'New Subscription'
          }
        </DialogTitle>
        <DialogDescription>
          {selectedPlan
            ? 'Review and confirm your plan change'
            : 'Select a plan that best suits your needs'
          }
        </DialogDescription>
        <Button 
          disabled={isProcessing} 
          onClick={handleSubmit}
          className="w-full mt-4"
        >
          {isProcessing ? (
            <>
              <span className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {selectedPlan 
                ? 'Confirm Change' 
                : 'Proceed to Payment'
              }
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </SubscriptionDialog>

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title={
          <div className="flex items-center gap-3 pb-2 mb-4 border-b">
            <div className="p-3 rounded-full bg-destructive/10">
              <X className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Cancel Subscription</h2>
              <p className="text-sm text-muted-foreground">We're sorry to see you go</p>
            </div>
          </div>
        }
        description={null}
        actionLabel="Cancel Subscription"
        variant="destructive"
        fields={[
          {
            type: 'select',
            name: 'reason',
            label: 'Why are you cancelling?',
            placeholder: 'Select a reason',
            options: CANCELLATION_REASONS,
            required: true
          },
          {
            type: 'textarea',
            name: 'feedback',
            label: 'Help us improve',
            placeholder: 'Share your experience and suggestions (optional)'
          }
        ]}
        onConfirm={async (data) => {
          if (!data?.reason) {
            toast.error('Please select a reason for cancellation');
            return;
          }

          try {
            setCancelling(true);
            await workstationService.cancelSubscription(subscription.id, {
              reason: data.reason,
              feedback: data.feedback
            });
            
            queryClient.invalidateQueries(['current-subscription']);
            toast.success('Subscription cancelled successfully');
            setShowCancelDialog(false);
          } catch (error: any) {
            toast.error('Failed to cancel subscription', {
              description: error.response?.data?.message || 'Please try again'
            });
          } finally {
            setCancelling(false);
          }
        }}
      >
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-destructive/5 border-destructive/20 border">
            <h4 className="font-medium text-destructive flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4" />
              Important Information
            </h4>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Your subscription will be cancelled immediately:</p>
              <div className="grid gap-2">
                {[
                  { icon: Calendar, text: `Access until ${format(new Date(subscription.end_date), "MMM d, yyyy")}` },
                  { icon: Ban, text: 'Access revoked after current period' },
                  { icon: AlertCircle, text: 'Unused features will be lost' },
                  { icon: RotateCcw, text: 'This action cannot be undone' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <item.icon className="h-4 w-4 text-muted-foreground/70" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <h4 className="font-medium flex items-center gap-2 mb-3 text-blue-500">
              <HelpCircle className="h-4 w-4" />
              Consider these alternatives
            </h4>
            <div className="grid gap-3">
              {[
                { icon: ArrowDownCircle, text: 'Switch to a lower-tier plan', action: 'View Plans' },
                { icon: PauseCircle, text: 'Pause your subscription temporarily', action: 'Learn More' },
                { icon: MessageCircle, text: 'Talk to our support team', action: 'Contact' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2 text-sm">
                    <item.icon className="h-4 w-4 text-muted-foreground/70" />
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.action}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={showRenewDialog}
        onOpenChange={setShowRenewDialog}
        title={
          <div className="flex items-center gap-3 pb-2 mb-4 border-b">
            <div className="p-3 rounded-full bg-primary/10">
              <RefreshCw className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Renew Subscription</h2>
              <p className="text-sm text-muted-foreground">Extend your workspace access</p>
            </div>
          </div>
        }
        description={null}
        actionLabel="Confirm Renewal"
        fields={[
          {
            type: 'select',
            name: 'plan_id',
            label: 'Choose Plan',
            placeholder: 'Select plan',
            options: plans?.map(plan => ({
              label: `${plan.name} (${plan.duration_days} days) - ${formatCurrency(plan.price)}`,
              value: plan.id
            })) || [],
            required: true
          }
        ]}
        onConfirm={async (data) => {
          try {
            setIsRenewing(true);
            if (!data.plan_id) {
              toast.error('Please select a plan');
              return;
            }
            await workstationService.renewSubscription(subscription.id, data.plan_id);
            queryClient.invalidateQueries(['current-subscription']);
            toast.success('Subscription renewed successfully');
            setShowRenewDialog(false);
          } catch (error: any) {
            toast.error('Failed to renew subscription', {
              description: error.response?.data?.message || 'Please try again'
            });
          } finally {
            setIsRenewing(false);
          }
        }}
      >
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="p-4 rounded-xl bg-muted">
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <ClipboardList className="h-4 w-4 text-primary" />
                Current Plan Details
              </h4>
              <div className="space-y-3">
                {[
                  { label: 'Plan Name', value: subscription.plan.name },
                  { label: 'Current End Date', value: format(new Date(subscription.end_date), "MMM d, yyyy") },
                  { label: 'Base Amount', value: formatCurrency(subscription.plan.price) }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <h4 className="font-medium flex items-center gap-2 mb-3 text-blue-500">
                <Star className="h-4 w-4" />
                Renewal Benefits
              </h4>
              <div className="grid gap-2">
                {[
                  { icon: Key, text: 'Uninterrupted workspace access' },
                  { icon: Clock, text: 'Keep your existing meeting room hours' },
                  { icon: Check, text: 'Continue using all plan features' },
                  { icon: Percent, text: 'Save more with longer durations' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <item.icon className="h-4 w-4 text-blue-500/70" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
};

export default Subscription; 