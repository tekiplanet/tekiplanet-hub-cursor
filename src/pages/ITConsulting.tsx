import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Wallet,
  BrainCircuit,
  Users,
  CheckCircle2,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useWalletStore } from '@/store/useWalletStore';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InsufficientFundsModal } from "@/components/wallet/InsufficientFundsModal";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import PagePreloader from '@/components/ui/PagePreloader';
import { consultingService } from '@/services/consultingService';
import type { TimeSlot, ConsultingSettings } from '@/services/consultingService';

export default function ITConsulting() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const { 
    getBalance, 
    deductBalance, 
    addTransaction 
  } = useWalletStore();
  const { toast } = useToast();

  // State
  const [hours, setHours] = useState(1);
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [settings, setSettings] = useState<ConsultingSettings | null>(null);

  const balance = getBalance(user?.id || '');
  const hourlyRate = settings?.hourly_rate ?? 10000;
  const totalCost = hours * hourlyRate;

  // Fetch available slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        const { slots, settings: consultingSettings } = await consultingService.getAvailableSlots();
        setAvailableSlots(slots);
        setSettings(consultingSettings);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch available time slots",
          variant: "destructive"
        });
      } finally {
        setLoadingSlots(false);
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [toast]);

  const handleBookSession = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Select Appointment Time",
        description: "Please select your preferred appointment date and time.",
        variant: "destructive"
      });
      return;
    }

    if (balance < totalCost) {
      setShowInsufficientFundsModal(true);
      return;
    }

    setLoading(true);
    try {
      const response = await consultingService.createBooking({
        hours,
        selected_date: selectedDate,
        selected_time: selectedTime,
        requirements: '', // Add a text area for requirements if needed
        payment_method: 'wallet'
      });

      toast({
        title: "Booking Successful",
        description: `Your ${hours}-hour consulting session has been scheduled.`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.response?.data?.message || "Unable to process your booking",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFundWallet = () => {
    setShowInsufficientFundsModal(false);
    navigate('/dashboard/wallet');
  };

  const ScheduleModal = () => {
    return (
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Appointment Time</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-4">
            {loadingSlots ? (
              <div className="flex items-center justify-center p-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6 pr-4">
                {Object.entries(availableSlots).map(([date, slots]) => {
                  const parsedDate = new Date(date);
                  const isSelected = selectedDate === date;
                  
                  return (
                    <div key={date} className="space-y-3">
                      <div className="sticky top-0 bg-background/95 backdrop-blur-sm py-2">
                        <h3 className="font-medium">
                          {parsedDate.toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {slots.map((time) => {
                          const isTimeSelected = selectedDate === date && selectedTime === time;
                          
                          return (
                            <Button
                              key={`${date}-${time}`}
                              variant={isTimeSelected ? "default" : "outline"}
                              className={cn(
                                "h-auto py-3",
                                isTimeSelected && "border-primary"
                              )}
                              onClick={() => {
                                setSelectedDate(date);
                                setSelectedTime(time);
                                setShowScheduleModal(false);
                              }}
                            >
                              <div className="text-sm">
                                <p className="font-medium">{time}</p>
                                <p className="text-xs text-muted-foreground">
                                  {parseInt(time) < 12 ? 'AM' : 'PM'}
                                </p>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return <PagePreloader />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-4 max-w-4xl space-y-6"
    >
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5 p-6 md:p-8">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <Badge variant="secondary">Expert Consultation</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Book an IT Consulting Session</h1>
          <p className="text-muted-foreground max-w-2xl">
            Get personalized guidance from our expert consultants. Whether you need 
            technical advice, project planning, or strategic insights, we're here to help.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr,300px]">
        {/* Main Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>Configure your consulting session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hours Selection */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Number of Hours</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setHours(h => Math.max(1, h - 1))}
                    disabled={hours <= 1}
                  >
                    -
                  </Button>
                  <Input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setHours(h => Math.min(10, h + 1))}
                    disabled={hours >= 10}
                  >
                    +
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    hour{hours > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Add Appointment Selection */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Appointment Time</label>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowScheduleModal(true)}
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {selectedDate && selectedTime ? (
                      <span>
                        {new Date(selectedDate).toLocaleDateString('en-US', { 
                          month: 'short',
                          day: 'numeric'
                        })} at {selectedTime}
                      </span>
                    ) : (
                      "Select Date & Time"
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Features */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
                  <Users className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">1-on-1 Session</p>
                    <p className="text-muted-foreground">Direct expert access</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">Follow-up Support</p>
                    <p className="text-muted-foreground">24hr post-session</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Session Duration</span>
                  <span>{hours} hour{hours > 1 ? 's' : ''}</span>
                </div>
                <Progress value={(hours / 10) * 100} />
              </div>
            </CardContent>
          </Card>

          {/* Mobile Price Card */}
          <Card className="md:hidden">
            <CardContent className="p-6">
              <PriceContent 
                hours={hours}
                totalCost={totalCost}
                balance={balance}
                loading={loading}
                onBook={handleBookSession}
                hourlyRate={hourlyRate}
              />
            </CardContent>
          </Card>
        </div>

        {/* Desktop Price Card */}
        <div className="hidden md:block">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <PriceContent 
                hours={hours}
                totalCost={totalCost}
                balance={balance}
                loading={loading}
                onBook={handleBookSession}
                hourlyRate={hourlyRate}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <ScheduleModal />
      <InsufficientFundsModal
        open={showInsufficientFundsModal}
        onClose={() => setShowInsufficientFundsModal(false)}
        onFundWallet={handleFundWallet}
        requiredAmount={totalCost}
        currentBalance={balance}
        type="enrollment"
      />
    </motion.div>
  );
}

interface PriceContentProps {
  hours: number;
  totalCost: number;
  balance: number;
  loading: boolean;
  onBook: () => void;
  hourlyRate: number;
}

function PriceContent({ hours, totalCost, balance, loading, onBook, hourlyRate }: PriceContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{formatCurrency(totalCost)}</h2>
        <p className="text-sm text-muted-foreground">Total Cost</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Rate per Hour:</span>
          <span>{formatCurrency(hourlyRate)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Duration:</span>
          <span>{hours} hour{hours > 1 ? 's' : ''}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between text-sm font-medium">
          <span>Total:</span>
          <span>{formatCurrency(totalCost)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          className="w-full text-white" 
          onClick={onBook}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <span className="flex items-center">
              Book Session
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Wallet className="h-4 w-4" />
          <span>Wallet Balance: {formatCurrency(balance)}</span>
        </div>

        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Secure Booking</p>
              <p className="text-muted-foreground">
                Your session will be confirmed instantly after payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
