import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Wallet,
  Timer,
  MessageSquare,
  Star,
  CalendarClock,
  Receipt,
  CircleDot,
  ChevronRight,
  Users,
  Mail,
  Github,
  Linkedin,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { consultingService } from '@/services/consultingService';
import PagePreloader from '@/components/ui/PagePreloader';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { format, formatDistanceToNow, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  ongoing: 'bg-purple-100 text-purple-800 border-purple-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
};

const statusIcons = {
  pending: AlertCircle,
  confirmed: CheckCircle2,
  ongoing: Loader2,
  completed: CheckCircle2,
  cancelled: XCircle
};

const formatTime = (time: string) => {
  try {
    if (time.includes('T')) {
      const date = new Date(time);
      return new Intl.DateTimeFormat('en-NG', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'Africa/Lagos'
      }).format(date);
    }

    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));

    return new Intl.DateTimeFormat('en-NG', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Africa/Lagos'
    }).format(date);
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
};

const TimelineItem = ({ 
  title, 
  description, 
  icon: Icon, 
  isActive = false,
  isCompleted = false,
  isLast = false
}) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center",
        isCompleted ? "bg-primary text-primary-foreground" :
        isActive ? "bg-primary/20 text-primary border-2 border-primary" :
        "bg-muted text-muted-foreground"
      )}>
        <Icon className="w-4 h-4" />
      </div>
      {!isLast && (
        <div className={cn(
          "w-0.5 h-full mt-2",
          isCompleted ? "bg-primary" : "bg-muted"
        )} />
      )}
    </div>
    <div className="flex-1 pb-8">
      <p className={cn(
        "font-medium",
        isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
      )}>
        {title}
      </p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const formatBookingTime = (date: string, time: string) => {
  try {
    const cleanDate = date.split('T')[0];
    const cleanTime = time.split('T')[1]?.split('.')[0] || time.split('.')[0];
    
    const bookingDate = new Date(cleanDate);
    const [hours, minutes] = cleanTime.split(':').map(Number);
    
    bookingDate.setHours(hours, minutes, 0, 0);

    return bookingDate;
  } catch (error) {
    console.error('Error formatting booking time:', {
      error,
      date,
      time
    });
    return new Date();
  }
};

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = React.useState('');

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        if (isNaN(targetDate.getTime())) {
          throw new Error('Invalid target date');
        }

        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();

        if (difference <= 0) {
          setTimeLeft('Session starting soon');
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        if (hours > 0 || days > 0) timeString += `${hours}h `;
        timeString += `${minutes}m`;

        setTimeLeft(timeString.trim());
      } catch (error) {
        console.error('Error in CountdownTimer:', error);
        setTimeLeft('Time not available');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <CalendarClock className="w-4 h-4 text-muted-foreground" />
      <span>{timeLeft}</span>
    </div>
  );
};

const ExpertCard = ({ expert }: { expert: ConsultingExpert }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        Assigned Expert
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Expert Profile Header */}
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={expert.user?.avatar} />
          <AvatarFallback>
            {expert.user?.first_name?.[0]}{expert.user?.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h3 className="font-medium">
            {expert.user?.first_name} {expert.user?.last_name}
          </h3>
          <p className="text-sm text-muted-foreground">{expert.title}</p>
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              {expert.total_sessions} completed sessions
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Expertise & Experience */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Specialization</h4>
          <p className="text-sm text-muted-foreground">{expert.specialization}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Experience</h4>
          <p className="text-sm text-muted-foreground">
            {expert.years_of_experience} years of experience
          </p>
        </div>

        {/* Expertise Areas */}
        {expert.expertise_areas && expert.expertise_areas.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Expertise Areas</h4>
            <div className="flex flex-wrap gap-2">
              {expert.expertise_areas.map(area => (
                <Badge key={area} variant="secondary">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {expert.certifications && expert.certifications.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Certifications</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {expert.certifications.map(cert => (
                <li key={cert} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Languages */}
        {expert.languages && expert.languages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Languages</h4>
            <div className="flex flex-wrap gap-2">
              {expert.languages.map(lang => (
                <Badge key={lang} variant="outline">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Professional Bio */}
      <div>
        <h4 className="text-sm font-medium mb-2">About</h4>
        <p className="text-sm text-muted-foreground">{expert.bio}</p>
      </div>

      {/* Professional Links */}
      <div className="flex flex-wrap gap-3">
        {expert.github_url && (
          <a 
            href={expert.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        )}
        {expert.linkedin_url && (
          <a 
            href={expert.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </a>
        )}
        {expert.portfolio_url && (
          <a 
            href={expert.portfolio_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <Globe className="h-4 w-4" />
            Portfolio
          </a>
        )}
      </div>

      {/* Contact Info */}
      {expert.user?.email && (
        <div className="bg-muted p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-primary" />
            <span>{expert.user.email}</span>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

export default function ConsultingBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);
  const [showReviewDialog, setShowReviewDialog] = React.useState(false);
  const [cancellationReason, setCancellationReason] = React.useState('');
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data: booking, isLoading, refetch } = useQuery({
    queryKey: ['consulting-booking', id],
    queryFn: () => consultingService.getBookingDetails(id!)
  });

  const sessionDate = React.useMemo(() => {
    if (!booking) return new Date();
    
    return formatBookingTime(booking.selected_date, booking.selected_time);
  }, [booking]);

  const timelineSteps = React.useMemo(() => {
    if (!booking) return [];
    
    return [
      {
        title: 'Booking Placed',
        description: format(new Date(booking.created_at), 'MMM d, yyyy h:mm a', {
          timeZone: 'Africa/Lagos'
        }),
        icon: CircleDot,
        isCompleted: true
      },
      {
        title: 'Booking Confirmed',
        description: booking.status === 'pending' ? 'Awaiting confirmation' : 'Payment confirmed',
        icon: CheckCircle2,
        isCompleted: booking.status !== 'pending',
        isActive: booking.status === 'pending'
      },
      {
        title: 'Session Time',
        description: booking.status === 'ongoing' ? 'Currently in session' : 
          booking.status === 'completed' ? 'Session completed' :
          `${format(sessionDate, 'MMM d, yyyy', { timeZone: 'Africa/Lagos' })} at ${
            new Intl.DateTimeFormat('en-NG', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
              timeZone: 'Africa/Lagos'
            }).format(sessionDate)
          }`,
        icon: Timer,
        isCompleted: ['completed', 'cancelled'].includes(booking.status),
        isActive: booking.status === 'ongoing'
      },
      {
        title: 'Session Completed',
        description: booking.status === 'completed' ? 
          'Session successfully completed' : 
          booking.status === 'cancelled' ? 'Session cancelled' : 'Pending completion',
        icon: CheckCircle2,
        isCompleted: booking.status === 'completed',
        isActive: booking.status === 'cancelled',
        isLast: true
      }
    ];
  }, [booking]);

  const handleCancel = async () => {
    if (!cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    setIsSubmitting(true);
    try {
      await consultingService.cancelBooking(id!, cancellationReason);
      toast.success("Booking cancelled successfully");
      setShowCancelDialog(false);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await consultingService.submitReview(id!, { rating, comment });
      toast.success("Review submitted successfully");
      setShowReviewDialog(false);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !booking) return <PagePreloader />;

  const StatusIcon = statusIcons[booking.status];
  const canBeCancelled = ['pending', 'confirmed'].includes(booking.status);
  const canBeReviewed = booking.status === 'completed' && !booking.review;
  const isUpcoming = ['pending', 'confirmed'].includes(booking.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-4 max-w-5xl space-y-8"
    >
      {/* Status Header - Full Width */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Badge 
              variant="secondary" 
              className={`${statusColors[booking.status]} px-3 py-1.5 text-sm`}
            >
              <StatusIcon className="w-4 h-4 mr-2" />
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
            <h1 className="text-2xl font-bold">IT Consulting Session</h1>
            {isUpcoming && (
              <div className="flex items-center gap-2 text-sm bg-background/50 px-3 py-2 rounded-lg w-fit">
                <CalendarClock className="w-4 h-4 text-primary" />
                <CountdownTimer targetDate={sessionDate} />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {canBeReviewed && (
              <Button className="gap-2" onClick={() => setShowReviewDialog(true)}>
                <Star className="w-4 h-4" />
                Leave Review
              </Button>
            )}
            {canBeCancelled && (
              <Button variant="destructive" className="gap-2" onClick={() => setShowCancelDialog(true)}>
                <XCircle className="w-4 h-4" />
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline and Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Timeline Card */}
        <Card>
          <CardHeader>
            <CardTitle>Session Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {timelineSteps.map((step, index) => (
              <TimelineItem key={index} {...step} />
            ))}
          </CardContent>
        </Card>

        {/* Session Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">
                    {format(sessionDate, 'EEEE, MMMM d, yyyy', {
                      timeZone: 'Africa/Lagos'
                    })}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">
                    {new Intl.DateTimeFormat('en-NG', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                      timeZone: 'Africa/Lagos'
                    }).format(sessionDate)}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Timer className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">
                    {booking.hours} hour{booking.hours > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Rate per Hour</span>
                  <span>{formatCurrency(booking.total_cost / booking.hours)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Duration</span>
                  <span>{booking.hours} hour{booking.hours > 1 ? 's' : ''}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Paid</span>
                  <span>{formatCurrency(booking.total_cost)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                <Wallet className="h-4 w-4" />
                <span>Paid via Wallet</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Expert Section - Now at the bottom */}
      {booking.assigned_expert_id && booking.expert ? (
        <div className="bg-card rounded-xl shadow-sm overflow-hidden">
          <div className="bg-primary/5 border-b p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Your Expert
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-[300px,1fr] gap-8">
              {/* Expert Profile Column */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={booking.expert.user?.avatar} />
                    <AvatarFallback className="text-lg">
                      {booking.expert.user?.first_name?.[0]}{booking.expert.user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">
                      {booking.expert.user?.first_name} {booking.expert.user?.last_name}
                    </h3>
                    <p className="text-muted-foreground">{booking.expert.title}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{booking.expert.total_sessions} completed sessions</span>
                    </div>
                  </div>
                </div>

                {/* Contact & Social Links */}
                <div className="space-y-3">
                  {booking.expert.user?.email && (
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Mail className="h-4 w-4" />
                      {booking.expert.user.email}
                    </Button>
                  )}
                  
                  <div className="flex gap-2">
                    {booking.expert.github_url && (
                      <Button variant="outline" size="icon" asChild>
                        <a href={booking.expert.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {booking.expert.linkedin_url && (
                      <Button variant="outline" size="icon" asChild>
                        <a href={booking.expert.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {booking.expert.portfolio_url && (
                      <Button variant="outline" size="icon" asChild>
                        <a href={booking.expert.portfolio_url} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expert Details Column */}
              <div className="space-y-6">
                {/* Bio Section */}
                <div className="space-y-2">
                  <h4 className="font-medium">About</h4>
                  <p className="text-muted-foreground">{booking.expert.bio}</p>
                </div>

                {/* Expertise Grid */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Specialization</h4>
                    <p className="text-muted-foreground">{booking.expert.specialization}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Experience</h4>
                    <p className="text-muted-foreground">
                      {booking.expert.years_of_experience} years
                    </p>
                  </div>
                </div>

                {/* Expertise Areas */}
                {booking.expert.expertise_areas?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Expertise Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {booking.expert.expertise_areas.map(area => (
                        <Badge key={area} variant="secondary">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {booking.expert.certifications?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Certifications</h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {booking.expert.certifications.map(cert => (
                        <div key={cert} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          {cert}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {booking.expert.languages?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {booking.expert.languages.map(lang => (
                        <Badge key={lang} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">Expert Assignment Pending</p>
              <p className="text-sm text-muted-foreground">
                An expert will be assigned to your session soon
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Please provide a reason for cancellation"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isSubmitting}
            >
              Keep Booking
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with the consulting session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-8 w-8 cursor-pointer transition-colors",
                    i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                  )}
                  onClick={() => setRating(i + 1)}
                />
              ))}
            </div>
            <Textarea
              placeholder="Share your thoughts about the session (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReview}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 