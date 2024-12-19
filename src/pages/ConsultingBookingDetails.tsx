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
  Star
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
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusIcons = {
  pending: AlertCircle,
  confirmed: CheckCircle2,
  ongoing: Loader2,
  completed: CheckCircle2,
  cancelled: XCircle
};

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-4 max-w-4xl space-y-6"
    >
      {/* Back Button */}
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => navigate('/dashboard/consulting/bookings')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bookings
      </Button>

      {/* Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Badge 
                variant="secondary" 
                className={statusColors[booking.status]}
              >
                <StatusIcon className="w-4 h-4 mr-1" />
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
              <h2 className="text-2xl font-bold">IT Consulting Session</h2>
            </div>

            {canBeCancelled && (
              <Button 
                variant="destructive" 
                onClick={() => setShowCancelDialog(true)}
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {new Date(booking.selected_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{booking.selected_time}</span>
              </div>
              <div className="flex items-center text-sm">
                <Timer className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{booking.hours} hour{booking.hours > 1 ? 's' : ''}</span>
              </div>
            </div>

            {booking.requirements && (
              <>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Requirements:</label>
                  <p className="text-sm text-muted-foreground">{booking.requirements}</p>
                </div>
              </>
            )}
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

      {/* Review Section */}
      {booking.review ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < booking.review.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {booking.review.comment && (
              <p className="text-muted-foreground">{booking.review.comment}</p>
            )}
          </CardContent>
        </Card>
      ) : canBeReviewed ? (
        <Card>
          <CardContent className="p-6">
            <Button 
              className="w-full"
              onClick={() => setShowReviewDialog(true)}
            >
              <Star className="mr-2 h-4 w-4" />
              Leave a Review
            </Button>
          </CardContent>
        </Card>
      ) : null}

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
                  className={`h-6 w-6 cursor-pointer transition-colors ${
                    i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
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