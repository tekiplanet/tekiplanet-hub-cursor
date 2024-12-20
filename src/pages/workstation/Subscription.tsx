import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { workstationService } from "@/services/workstationService";
import { QRCodeSVG } from 'qrcode.react';

const Subscription = () => {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['workstation-subscription'],
    queryFn: workstationService.getCurrentSubscription
  });

  const statusColors = {
    active: "bg-green-500/10 text-green-500",
    expired: "bg-red-500/10 text-red-500",
    cancelled: "bg-orange-500/10 text-orange-500",
    pending: "bg-blue-500/10 text-blue-500"
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-3xl font-bold">My Workstation</h1>
        <div className="flex flex-wrap gap-4">
          {subscription && (
            <Badge 
              variant="secondary" 
              className={`${statusColors[subscription.status]} px-3 py-1.5`}
            >
              {subscription.status.toUpperCase()}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Access Card Section */}
      {subscription?.accessCards?.[0] && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Access Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* QR Code */}
              <div className="flex flex-col items-center space-y-4 p-6 bg-card/50 rounded-lg">
                <QRCodeSVG 
                  value={subscription.accessCards[0].qr_code}
                  size={200}
                  level="H"
                  includeMargin
                />
                <p className="text-sm font-medium">
                  Card Number: {subscription.accessCards[0].card_number}
                </p>
                <Button variant="outline" className="w-full">
                  Download Card
                </Button>
              </div>

              {/* Card Details */}
              <div className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">Valid until: {new Date(subscription.accessCards[0].valid_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm">Member: {subscription.user.first_name} {subscription.user.last_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-primary" />
                    <span className="text-sm">Plan: {subscription.plan.name}</span>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Present this QR code at the reception for check-in and check-out.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{subscription?.plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{subscription?.plan.duration_days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{formatCurrency(subscription?.total_amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Type</span>
                <span className="font-medium capitalize">{subscription?.payment_type}</span>
              </div>
            </div>

            {subscription?.status === 'active' && (
              <Button className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Renew Subscription
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Last Check-in</span>
                </div>
                <span className="font-medium">
                  {subscription?.last_check_in ? 
                    new Date(subscription.last_check_in).toLocaleString() : 
                    'N/A'
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Last Check-out</span>
                </div>
                <span className="font-medium">
                  {subscription?.last_check_out ? 
                    new Date(subscription.last_check_out).toLocaleString() : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      {subscription?.payments && subscription.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscription.payments.map((payment) => (
                <div 
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {payment.type === 'installment' ? 
                        `Installment ${payment.installment_number}` : 
                        'Full Payment'
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(payment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(payment.amount)}</p>
                    <Badge 
                      variant={payment.status === 'paid' ? 'success' : 'destructive'}
                      className="mt-1"
                    >
                      {payment.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Subscription; 