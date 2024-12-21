import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { WorkstationPlan, WorkstationSubscription } from "@/services/workstationService"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export const PLAN_HIERARCHY = {
  1: 'daily',     // duration_days: 1
  7: 'weekly',    // duration_days: 7
  30: 'monthly',  // duration_days: 30
  90: 'quarterly',// duration_days: 90
  365: 'yearly'   // duration_days: 365
};

export const getPlanLevel = (durationDays: number) => {
  return Object.keys(PLAN_HIERARCHY).indexOf(durationDays.toString());
};

export const comparePlans = (currentPlan: number, targetPlan: number) => {
  const currentLevel = getPlanLevel(currentPlan);
  const targetLevel = getPlanLevel(targetPlan);
  
  if (currentLevel === targetLevel) return 'current';
  if (targetPlan > currentPlan) return 'upgrade';
  return 'downgrade';
};

export const calculatePlanChange = (currentSubscription: WorkstationSubscription | null, selectedPlan: WorkstationPlan) => {
  if (!currentSubscription) return null;

  const now = new Date();
  const endDate = new Date(currentSubscription.end_date);
  const startDate = new Date(currentSubscription.start_date);
  
  // For future subscriptions, calculate from start date to end date
  if (startDate > now) {
    return {
      newPlanCost: selectedPlan.price,
      remainingValue: currentSubscription.total_amount,
      finalAmount: selectedPlan.price - currentSubscription.total_amount
    };
  }
  
  // For current subscriptions, calculate remaining days from now
  if (now <= endDate) {
    const remainingDuration = endDate.getTime() - now.getTime();
    const totalDuration = endDate.getTime() - startDate.getTime();
    const remainingDays = remainingDuration / (1000 * 60 * 60 * 24);
    const totalDays = totalDuration / (1000 * 60 * 60 * 24);
    
    const remainingValue = (remainingDays / totalDays) * currentSubscription.total_amount;
    return {
      newPlanCost: selectedPlan.price,
      remainingValue: remainingValue,
      finalAmount: selectedPlan.price - remainingValue
    };
  }
  
  // If subscription has ended
  return {
    newPlanCost: selectedPlan.price,
    remainingValue: 0,
    finalAmount: selectedPlan.price
  };
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatShortDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
