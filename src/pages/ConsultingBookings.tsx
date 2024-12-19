import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { consultingService } from '@/services/consultingService';
import PagePreloader from '@/components/ui/PagePreloader';

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

export default function ConsultingBookings() {
  const navigate = useNavigate();
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['consulting-bookings'],
    queryFn: consultingService.getUserBookings
  });

  if (isLoading) return <PagePreloader />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-4 max-w-4xl space-y-6"
    >
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Consulting Sessions</h1>
        <p className="text-muted-foreground">
          Manage your IT consulting sessions and appointments
        </p>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't booked any consulting sessions yet
              </p>
              <Button onClick={() => navigate('/dashboard/it-consulting')}>
                Book a Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          bookings?.map((booking) => {
            const StatusIcon = statusIcons[booking.status];
            return (
              <Card
                key={booking.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/dashboard/consulting/bookings/${booking.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      {/* Status Badge */}
                      <Badge 
                        variant="secondary" 
                        className={statusColors[booking.status]}
                      >
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>

                      {/* Date & Time */}
                      <div className="space-y-1">
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
                      </div>

                      {/* Duration & Cost */}
                      <div className="text-sm text-muted-foreground">
                        {booking.hours} hour{booking.hours > 1 ? 's' : ''} • {formatCurrency(booking.total_cost)}
                      </div>
                    </div>

                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </motion.div>
  );
} 