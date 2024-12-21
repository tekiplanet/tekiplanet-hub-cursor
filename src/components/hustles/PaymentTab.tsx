import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PaymentTabProps {
  hustle: {
    budget: number;
    status: string;
    payments?: Array<{
      id: string;
      amount: number;
      payment_type: 'initial' | 'final';
      status: 'pending' | 'completed' | 'failed';
      paid_at: string | null;
    }>;
  };
}

const PaymentTab = ({ hustle }: PaymentTabProps) => {
  const payments = hustle.payments || [];
  
  const initialPayment = payments.find(p => p.payment_type === 'initial');
  const finalPayment = payments.find(p => p.payment_type === 'final');
  
  const totalPayments = 2;
  const completedPayments = payments.filter(p => p.status === 'completed').length;
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
                  <Badge variant={initialPayment?.status === 'completed' ? "success" : "secondary"}>
                    Initial Payment
                  </Badge>
                  {initialPayment?.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(initialPayment?.amount || 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Released upon project approval
                </p>
                {initialPayment?.paid_at && (
                  <p className="text-xs text-muted-foreground">
                    Paid on {initialPayment.paid_at}
                  </p>
                )}
              </div>
              <Badge variant={initialPayment?.status === 'completed' ? "success" : "outline"}>
                {initialPayment?.status.toUpperCase() || 'PENDING'}
              </Badge>
            </div>

            {/* Final Payment */}
            <div className="flex items-start justify-between p-4 rounded-lg border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={finalPayment?.status === 'completed' ? "success" : "secondary"}>
                    Final Payment
                  </Badge>
                  {finalPayment?.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(finalPayment?.amount || 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Released upon project completion
                </p>
                {finalPayment?.paid_at && (
                  <p className="text-xs text-muted-foreground">
                    Paid on {finalPayment.paid_at}
                  </p>
                )}
              </div>
              <Badge variant={finalPayment?.status === 'completed' ? "success" : "outline"}>
                {finalPayment?.status.toUpperCase() || 'PENDING'}
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