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
  Loader2,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { consultingService } from '@/services/consultingService';
import PagePreloader from '@/components/ui/PagePreloader';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  // If time is already in 12-hour format, return as is
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }
  
  // Convert 24-hour format to 12-hour format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

export default function ConsultingBookings() {
  const navigate = useNavigate();
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['consulting-bookings'],
    queryFn: consultingService.getUserBookings
  });

  const groupedBookings = React.useMemo(() => {
    return bookings.reduce((acc, booking) => {
      const status = booking.status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(booking);
      return acc;
    }, {} as Record<string, typeof bookings>);
  }, [bookings]);

  if (isLoading) return <PagePreloader />;

  const renderBookingCard = (booking: any) => {
    const StatusIcon = statusIcons[booking.status];
    const isUpcoming = ['pending', 'confirmed'].includes(booking.status);
    const date = new Date(booking.selected_date);
    
    return (
      <Card
        key={booking.id}
        className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${
          isUpcoming ? 'border-l-primary' : ''
        }`}
        onClick={() => navigate(`/dashboard/consulting/bookings/${booking.id}`)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              {/* Status Badge */}
              <Badge 
                variant="secondary" 
                className={`${statusColors[booking.status]} px-2 py-1`}
              >
                <StatusIcon className="w-4 h-4 mr-1" />
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>

              {/* Date & Time */}
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">{formatTime(booking.selected_time)}</span>
                </div>
              </div>

              {/* Duration & Cost */}
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-normal">
                  {booking.hours} hour{booking.hours > 1 ? 's' : ''}
                </Badge>
                <Badge variant="secondary" className="font-medium">
                  {formatCurrency(booking.total_cost)}
                </Badge>
              </div>
            </div>

            <ArrowRight className="h-5 w-5 text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (bookings.length === 0) {
    return (
      <Card className="border-dashed">
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
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(groupedBookings.pending?.length || 0) + (groupedBookings.confirmed?.length || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupedBookings.completed?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {[...(groupedBookings.pending || []), ...(groupedBookings.confirmed || [])]
            .sort((a, b) => new Date(a.selected_date).getTime() - new Date(b.selected_date).getTime())
            .map(renderBookingCard)}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {(groupedBookings.completed || [])
            .sort((a, b) => new Date(b.selected_date).getTime() - new Date(a.selected_date).getTime())
            .map(renderBookingCard)}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {(groupedBookings.cancelled || [])
            .sort((a, b) => new Date(b.selected_date).getTime() - new Date(a.selected_date).getTime())
            .map(renderBookingCard)}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
} 