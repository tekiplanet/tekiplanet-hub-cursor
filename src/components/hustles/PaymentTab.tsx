import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PaymentTabProps {
  hustle: {
    budget: number;
    initial_payment_released: boolean;
    final_payment_released: boolean;
    status: string;
  };
}

const PaymentTab = ({ hustle }: PaymentTabProps) => {
  const totalPayments = 2; // Initial and Final payments
  const completedPayments = 
    (hustle.initial_payment_released ? 1 : 0) + 
    (hustle.final_payment_released ? 1 : 0);
  
  const progress = (completedPayments / totalPayments) * 100;

  return (
    <div className="space-y-6">
      {/* Payment Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Payment Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {completedPayments} of {totalPayments} payments released
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Initial Payment */}
            <div className="flex items-start justify-between p-4 rounded-lg border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={hustle.initial_payment_released ? "success" : "secondary"}>
                    Initial Payment
                  </Badge>
                  {hustle.initial_payment_released ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(hustle.budget * 0.4)} {/* 40% of budget */}
                </p>
                <p className="text-sm text-muted-foreground">
                  Released upon project approval
                </p>
              </div>
              <Badge variant={hustle.initial_payment_released ? "success" : "outline"}>
                {hustle.initial_payment_released ? "Released" : "Pending"}
              </Badge>
            </div>

            {/* Final Payment */}
            <div className="flex items-start justify-between p-4 rounded-lg border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={hustle.final_payment_released ? "success" : "secondary"}>
                    Final Payment
                  </Badge>
                  {hustle.final_payment_released ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(hustle.budget * 0.6)} {/* 60% of budget */}
                </p>
                <p className="text-sm text-muted-foreground">
                  Released upon project completion
                </p>
              </div>
              <Badge variant={hustle.final_payment_released ? "success" : "outline"}>
                {hustle.final_payment_released ? "Released" : "Pending"}
              </Badge>
            </div>

            {/* Total Amount */}
            <div className="flex items-start justify-between p-4 rounded-lg bg-muted">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(hustle.budget)}</p>
              </div>
              <Badge variant="secondary">
                {hustle.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTab; 