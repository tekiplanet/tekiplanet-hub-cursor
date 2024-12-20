import { Check, X, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { WorkstationPlan } from "@/services/workstationService";

interface PlanComparisonProps {
  currentPlan: WorkstationPlan;
  targetPlan: WorkstationPlan;
}

export function PlanComparison({ currentPlan, targetPlan }: PlanComparisonProps) {
  const compareValue = (current: number, target: number) => {
    if (current === target) return <Minus className="w-4 h-4 text-muted-foreground" />;
    return target > current ? (
      <ArrowUp className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-orange-500" />
    );
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Plan Comparison</h4>
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>Feature</div>
          <div>Current Plan</div>
          <div>New Plan</div>
        </div>
        <div className="grid grid-cols-3 gap-4 items-center p-2 rounded-lg bg-muted/50">
          <div>Duration</div>
          <div>{currentPlan.duration_days} days</div>
          <div className="flex items-center gap-2">
            {targetPlan.duration_days} days
            {compareValue(currentPlan.duration_days, targetPlan.duration_days)}
          </div>
        </div>
        {/* Add more feature comparisons */}
      </div>
    </div>
  );
} 