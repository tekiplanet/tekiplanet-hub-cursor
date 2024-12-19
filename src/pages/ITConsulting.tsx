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
import { toast } from 'sonner';
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

const formatTime = (time: string) => {
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

export default function ITConsulting() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const { 
    getBalance, 
    deductBalance, 
    addTransaction 
  } = useWalletStore();

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

  const balance = user?.wallet_balance ?? 0;
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
        toast.error("Error", {
          description: "Failed to fetch available time slots"
        });
      } finally {
        setLoadingSlots(false);
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, []);

  const handleBookSession = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Select Appointment Time", {
        description: "Please select your preferred appointment date and time."
      });
      return;
    }

    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const selectedDateTime = new Date(selectedDate);
      selectedDateTime.setHours(0, 0, 0, 0);

      if (selectedDateTime < today) {
        toast.error("Invalid Date", {
          description: "Please select today or a future date"
        });
        return;
      }

      const formattedDate = selectedDateTime.toISOString().split('T')[0];
      const formattedTime = selectedTime;

      console.log('Booking Request:', {
        hours,
        selected_date: formattedDate,
        selected_time: formattedTime,
        payment_method: 'wallet'
      });

      const response = await consultingService.createBooking({
        hours,
        selected_date: formattedDate,
        selected_time: formattedTime,
        requirements: '', 
        payment_method: 'wallet'
      });

      console.log('Booking Response:', response);

      toast.success("Booking Successful", {
        description: `Your ${hours}-hour consulting session has been scheduled.`
      });

      await useAuthStore.getState().refreshToken();
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Booking Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: error.response?.data
      });

      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const firstError = Object.values(validationErrors)[0];
          toast.error("Validation Error", {
            description: Array.isArray(firstError) ? firstError[0] : firstError
          });
        } else {
          toast.error("Validation Error", {
            description: error.response.data.message || "Please check your input"
          });
        }
      } else if (error.response?.status === 403) {
        toast.error("Access Denied", {
          description: "You don't have permission to make this booking"
        });
      } else if (error.response?.status === 404) {
        toast.error("Not Found", {
          description: "The requested time slot is no longer available"
        });
      } else {
        toast.error("Booking Failed", {
          description: error.response?.data?.message || "Unable to process your booking. Please try again."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFundWallet = () => {
    setShowInsufficientFundsModal(false);
    navigate('/dashboard/wallet');
  };

  const ScheduleModal = () => {
    const isDateTimeDisabled = (date: string, time: string) => {
      const now = new Date();
      const selectedDate = new Date(date);
      const [hours, minutes] = time.replace(/\s?[AP]M/, '').split(':');
      const isPM = time.includes('PM');
      
      // Convert to 24-hour format
      let hour = parseInt(hours);
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      
      selectedDate.setHours(hour, parseInt(minutes), 0, 0);
      
      return selectedDate < now;
    };

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
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  parsedDate.setHours(0, 0, 0, 0);
                  
                  // Skip past dates entirely
                  if (parsedDate < today) return null;
                  
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
                          const formattedTime = formatTime(time);
                          const isDisabled = isDateTimeDisabled(date, time);
                          
                          return (
                            <Button
                              key={`${date}-${time}`}
                              variant={isTimeSelected ? "default" : "outline"}
                              className={cn(
                                "h-auto py-3",
                                isTimeSelected && "border-primary",
                                isDisabled && "opacity-50 cursor-not-allowed"
                              )}
                              disabled={isDisabled}
                              onClick={() => {
                                setSelectedDate(date);
                                setSelectedTime(time);
                                setShowScheduleModal(false);
                              }}
                            >
                              <div className="text-sm">
                                <p className="font-medium">{formattedTime}</p>
                                {isDisabled && (
                                  <p className="text-xs text-muted-foreground">
                                    Not available
                                  </p>
                                )}
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
                selectedDate={selectedDate}
                selectedTime={selectedTime}
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
                selectedDate={selectedDate}
                selectedTime={selectedTime}
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
        currentBalance={user?.wallet_balance ?? 0}
        type="consultation"
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
  selectedDate: string | null;
  selectedTime: string | null;
}

function PriceContent({ 
  hours, 
  totalCost, 
  balance, 
  loading, 
  onBook, 
  hourlyRate,
  selectedDate,
  selectedTime 
}: PriceContentProps) {
  const navigate = useNavigate();
  const isTimeSlotSelected = selectedDate && selectedTime;

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
          disabled={loading || balance < totalCost || !isTimeSlotSelected}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <span className="flex items-center">
              {!isTimeSlotSelected ? 'Select Time Slot' : 'Book Session'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Wallet className="h-4 w-4" />
          <span>Wallet Balance: {formatCurrency(balance)}</span>
        </div>

        {balance < totalCost && (
          <div className="rounded-lg bg-destructive/10 p-3 space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <div>
                <p className="font-medium text-destructive">Insufficient Balance</p>
                <p className="text-muted-foreground">
                  You need {formatCurrency(totalCost - balance)} more to book this session
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => navigate('/dashboard/wallet')}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Fund Wallet
            </Button>
          </div>
        )}

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
