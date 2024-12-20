import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Clock,
  CreditCard,
  Calendar,
  Bell,
  TrendingUp,
  ChevronRight,
  LayoutDashboard,
  ArrowUpRight,
  Users,
} from "lucide-react";
import { useState } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Enhanced mock data
const earningsData = [
  { month: "Jan", amount: 2400, clients: 15 },
  { month: "Feb", amount: 3600, clients: 18 },
  { month: "Mar", amount: 2800, clients: 14 },
  { month: "Apr", amount: 4200, clients: 22 },
  { month: "May", amount: 3800, clients: 20 },
  { month: "Jun", amount: 5600, clients: 28 }
];

const quickActions = [
  {
    title: "Start Consultation",
    description: "Begin a new session",
    icon: Briefcase,
    color: "from-blue-600 to-blue-400",
    link: "/consultation",
    stat: "8 pending"
  },
  {
    title: "Book Workstation",
    description: "Reserve your space",
    icon: LayoutDashboard,
    color: "from-purple-600 to-purple-400",
    link: "/dashboard/workstation/plans",
    stat: "3 available"
  },
  {
    title: "Update Availability",
    description: "Manage your schedule",
    icon: Clock,
    color: "from-green-600 to-green-400",
    link: "/availability",
    stat: "Next: 2PM"
  },
  {
    title: "Manage Earnings",
    description: "Track your income",
    icon: CreditCard,
    color: "from-orange-600 to-orange-400",
    link: "/dashboard/wallet",
    stat: "+$1,200"
  }
];

const recentActivity = [
  {
    type: "booking",
    title: "New Consultation Request",
    message: "Sarah Johnson requested a consultation",
    time: "5 min ago",
    avatar: "/avatars/sarah.jpg",
    action: "Review"
  },
  {
    type: "payment",
    title: "Payment Received",
    message: "Received $150 for last week's session",
    time: "1 hour ago",
    action: "View"
  },
  {
    type: "system",
    title: "System Update",
    message: "Your profile has been verified",
    time: "2 hours ago",
    action: "Details"
  }
];

interface DashboardProps {
  isLoading?: boolean;
}

const ProfessionalDashboard = ({ isLoading = false }: DashboardProps) => {
  const navigate = useNavigate();
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px] hidden sm:block" />
          <Skeleton className="h-[200px] hidden lg:block" />
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container mx-auto px-4 py-6 space-y-6"
      >
        {/* Welcome Section */}
        <motion.div variants={item} className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, Professional!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your business today.
          </p>
        </motion.div>

        {/* Quick Stats Cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full transform translate-x-12 -translate-y-6 sm:translate-x-16 sm:-translate-y-8" />
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium">Monthly Revenue</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-3xl font-bold">$5,600</h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full transform translate-x-12 -translate-y-6 sm:translate-x-16 sm:-translate-y-8" />
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium">Active Clients</span>
                <Users className="h-4 w-4 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-3xl font-bold">24</h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  8 consultations today
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full transform translate-x-12 -translate-y-6 sm:translate-x-16 sm:-translate-y-8" />
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium">Completion Rate</span>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-3xl font-bold">98%</h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  +2% this week
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div variants={item}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer relative overflow-hidden h-full group"
                  onClick={() => navigate(action.link)}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-10 transition-opacity group-hover:opacity-20",
                    action.color
                  )} />
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={cn(
                        "p-2 rounded-lg bg-gradient-to-br transition-transform group-hover:scale-110",
                        action.color
                      )}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-1 truncate">{action.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2 truncate">
                          {action.description}
                        </p>
                        <Badge variant="secondary" className="group-hover:bg-primary/10">
                          {action.stat}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
              <Badge variant="secondary">3 new</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <div className={cn(
                      "rounded-full p-2 transition-transform hover:scale-110",
                      activity.type === "booking" && "bg-blue-500",
                      activity.type === "payment" && "bg-green-500",
                      activity.type === "system" && "bg-orange-500"
                    )}>
                      {activity.type === "booking" && <Calendar className="h-4 w-4 text-white" />}
                      {activity.type === "payment" && <CreditCard className="h-4 w-4 text-white" />}
                      {activity.type === "system" && <Bell className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">{activity.title}</p>
                        <Badge variant="outline" className="ml-2 shrink-0">
                          {activity.time}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {activity.message}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 h-8 text-xs"
                      >
                        {activity.action}
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ScrollArea>
  );
};

export default ProfessionalDashboard;