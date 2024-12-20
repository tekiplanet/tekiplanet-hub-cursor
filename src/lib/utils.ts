import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount);
};

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
