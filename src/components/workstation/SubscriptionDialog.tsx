import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { WorkstationPlan, WorkstationSubscription } from "@/services/workstationService";
import { formatCurrency, calculatePlanChange } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, ArrowRight, Building2 } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { comparePlans } from "@/lib/utils";

interface SubscriptionDialogProps {
  plan: WorkstationPlan | null;
  currentSubscription?: WorkstationSubscription | null;
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (planId: string, paymentType: 'full' | 'installment', startDate?: Date, isUpgrade?: boolean) => void;
  action: 'upgrade' | 'downgrade' | 'subscribe' | 'change';
}

export const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  plan,
  currentSubscription,
  isOpen,
  onClose,
  onSubscribe,
  action
}) => {
  const user = useAuthStore(state => state.user);
  const [step, setStep] = useState(1);
  const [paymentType, setPaymentType] = useState<'full' | 'installment'>('full');
  const [startType, setStartType] = useState<'immediate' | 'later'>('immediate');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const walletBalance = user?.wallet_balance || 0;
  const paymentAmount = paymentType === 'full' ? plan?.price : plan?.installment_amount;
  const hasEnoughBalance = walletBalance >= (paymentAmount || 0);

  if (!plan) return null;

  const steps = [
    { number: 1, title: "Plan Details", icon: Building2 },
    { number: 2, title: "Payment Option", icon: CreditCard },
    { number: 3, title: "Start Date", icon: CalendarIcon },
  ];

  const isUpgrade = action === 'upgrade';
  const isDowngrade = action === 'downgrade';

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!hasEnoughBalance) {
        toast.error("Insufficient wallet balance", {
          description: "Please fund your wallet to continue",
          action: {
            label: "Fund Wallet",
            onClick: () => navigate("/dashboard/wallet")
          }
        });
        return;
      }
      
      if (startType === 'later' && !selectedDate) {
        toast.error("Please select a start date");
        return;
      }

      try {
        setIsProcessing(true);
        await onSubscribe(
          plan!.id, 
          paymentType, 
          startType === 'later' ? selectedDate : undefined,
          isUpgrade
        );
      } catch (error) {
        setIsProcessing(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {currentSubscription ? (
              action === 'upgrade' ? 'Upgrade to ' :
              action === 'downgrade' ? 'Downgrade to ' : 
              'Change to '
            ) : 'Subscribe to '} 
            {plan?.name}
          </DialogTitle>
          <DialogDescription>
            {currentSubscription ? (
              action === 'upgrade' ? 'Upgrade your current subscription for better features' :
              action === 'downgrade' ? 'Downgrade your subscription to a more basic plan' :
              'Change your current subscription plan'
            ) : 'Complete the following steps to activate your subscription'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="relative mb-8">
          <div className="absolute top-5 w-full h-0.5 bg-muted" />
          <div className="relative flex justify-between">
            {steps.map((s, i) => (
              <div key={s.number} className="flex flex-col items-center">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center 
                    relative bg-background border-2 transition-colors
                    ${step >= s.number ? 'border-primary' : 'border-muted'}
                  `}
                >
                  <s.icon className={`w-5 h-5 ${step >= s.number ? 'text-primary' : 'text-muted-foreground'}`} />
                  {step > s.number && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary text-primary-foreground rounded-full">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <span className={`text-xs mt-2 ${step >= s.number ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Make this section scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-4"
            >
              {step === 1 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <h4 className="font-medium mb-3">Plan Features</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{plan.duration_days} days access</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{plan.meeting_room_hours}hr meeting room</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{plan.print_pages_limit} print pages</span>
                      </li>
                      {plan.has_locker && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm">Personal locker</span>
                        </li>
                      )}
                      {plan.has_dedicated_support && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm">Dedicated support</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {currentSubscription && plan && (
                    <div className="p-4 rounded-lg border bg-muted/50">
                      <h4 className="font-medium mb-3">Plan Change Calculation</h4>
                      {(() => {
                        const calculation = calculatePlanChange(currentSubscription, plan);
                        return calculation ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>New Plan Cost:</span>
                              <span>{formatCurrency(calculation.newPlanCost)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Current Plan Remaining Value:</span>
                              <span className="text-red-500">
                                -{formatCurrency(calculation.remainingValue)}
                              </span>
                            </div>
                            <div className="border-t pt-2 font-medium flex justify-between">
                              <span>{calculation.finalAmount > 0 ? 'Amount to Pay:' : 'Amount to Refund:'}</span>
                              <span className={calculation.finalAmount > 0 ? '' : 'text-green-500'}>
                                {formatCurrency(Math.abs(calculation.finalAmount))}
                              </span>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Select Payment Option</h4>
                  <RadioGroup value={paymentType} onValueChange={(v) => setPaymentType(v as 'full' | 'installment')}>
                    <div className="grid gap-4">
                      <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="full" id="full" />
                        <div className="flex-1">
                          <Label htmlFor="full" className="font-medium">Full Payment</Label>
                          <p className="text-sm text-muted-foreground">
                            One-time payment of {formatCurrency(plan.price)}
                          </p>
                        </div>
                      </div>
                      {plan.allows_installments && (
                        <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                          <RadioGroupItem value="installment" id="installment" />
                          <div className="flex-1">
                            <Label htmlFor="installment" className="font-medium">Monthly Installments</Label>
                            <p className="text-sm text-muted-foreground">
                              {plan.installment_months} payments of {formatCurrency(plan.installment_amount)}/month
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </RadioGroup>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Choose Start Date</h4>
                  <RadioGroup value={startType} onValueChange={(v) => setStartType(v as 'immediate' | 'later')}>
                    <div className="grid gap-4">
                      <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="immediate" id="immediate" />
                        <div className="flex-1">
                          <Label htmlFor="immediate" className="font-medium">Start Immediately</Label>
                          <p className="text-sm text-muted-foreground">
                            Access your workspace right after payment
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="later" id="later" />
                        <div className="flex-1">
                          <Label htmlFor="later" className="font-medium">Start Later</Label>
                          <p className="text-sm text-muted-foreground">
                            Schedule your access for a future date
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Date Picker */}
                  {startType === 'later' && (
                    <div className="mt-4 space-y-4">
                      <div className="border rounded-lg p-4">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                          fromDate={new Date()}
                          toDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
                          className="rounded-md border"
                        />
                      </div>
                      {selectedDate && (
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">
                            Selected start date:
                          </span>
                          <span className="font-medium">
                            {format(selectedDate, "MMMM d, yyyy")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Information */}
                  <div className="mt-6 p-4 rounded-lg border bg-muted/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Wallet Balance:</span>
                      <span className="font-medium">{formatCurrency(user?.wallet_balance || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium">Amount to Pay:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          currentSubscription && plan
                            ? Math.max(0, calculatePlanChange(currentSubscription, plan)?.finalAmount || 0)
                            : paymentAmount || 0
                        )}
                      </span>
                    </div>
                    {!hasEnoughBalance && (
                      <div className="text-sm text-destructive flex items-center gap-2">
                        <span>Insufficient balance</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate("/dashboard/wallet")}
                        >
                          Fund Wallet
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Keep footer outside scrollable area */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row justify-between gap-2 mt-6 border-t pt-4">
          <div>
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="w-full sm:w-auto"
                disabled={isProcessing}
              >
                Back
              </Button>
            )}
          </div>
          <Button 
            onClick={handleNext} 
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
            disabled={
              isProcessing || 
              (step === 3 && (!hasEnoughBalance || (startType === 'later' && !selectedDate)))
            }
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {step === 3 ? (
                  currentSubscription ? (
                    action === 'upgrade' ? 'Confirm Upgrade' :
                    action === 'downgrade' ? 'Confirm Downgrade' :
                    'Confirm Change'
                  ) : 'Proceed to Payment'
                ) : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 