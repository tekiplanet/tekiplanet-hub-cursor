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

const Plans = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['workstation-plans'],
    queryFn: workstationService.getPlans
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
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    Subscribe Now
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
    </div>
  );
};

export default Plans; 