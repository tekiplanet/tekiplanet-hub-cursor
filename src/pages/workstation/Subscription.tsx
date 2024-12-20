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
  ArrowDownCircle
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
                <div className="border-t divide-x grid grid-cols-3">
                  <Button variant="ghost" className="p-3 h-auto flex flex-col items-center gap-1 rounded-none">
                    <History className="h-4 w-4" />
                    <span className="text-xs">History</span>
                  </Button>
                  <Button variant="ghost" className="p-3 h-auto flex flex-col items-center gap-1 rounded-none">
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-xs">Renew</span>
                  </Button>
                  <Button variant="ghost" className="p-3 h-auto flex flex-col items-center gap-1 rounded-none">
                    <Download className="h-4 w-4" />
                    <span className="text-xs">Invoice</span>
                  </Button>
                </div>

                <div className="flex gap-2 mt-4">
                  {plans?.map(plan => {
                    if (plan.duration_days === subscription.plan.duration_days) return null;
                    
                    const action = comparePlans(subscription.plan.duration_days, plan.duration_days);
                    const isUpgrade = action === 'upgrade';
                    
                    return (
                      <Button
                        key={plan.id}
                        variant={isUpgrade ? "default" : "outline"}
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          setSelectedPlan(plan.id);
                          setShowUpgradeDialog(true);
                        }}
                      >
                        {isUpgrade ? (
                          <>
                            <ArrowUpCircle className="w-4 h-4" />
                            Upgrade to {plan.name}
                          </>
                        ) : (
                          <>
                            <ArrowDownCircle className="w-4 h-4" />
                            Downgrade to {plan.name}
                          </>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Access Card */}
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

          {/* Payment Details */}
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