import { motion } from "framer-motion";
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

// Mock data
const earningsData = [
  { month: "Jan", amount: 2400 },
  { month: "Feb", amount: 3600 },
  { month: "Mar", amount: 2800 },
  { month: "Apr", amount: 4200 },
  { month: "May", amount: 3800 },
  { month: "Jun", amount: 5600 }
];

const quickActions = [
  {
    title: "Start Consultation",
    description: "Begin a new session",
    icon: Briefcase,
    color: "from-blue-600 to-blue-400",
    link: "/consultation"
  },
  {
    title: "Book Workstation",
    description: "Reserve your space",
    icon: LayoutDashboard,
    color: "from-purple-600 to-purple-400",
    link: "/dashboard/workstation/plans"
  },
  {
    title: "Update Availability",
    description: "Manage your schedule",
    icon: Clock,
    color: "from-green-600 to-green-400",
    link: "/availability"
  },
  {
    title: "Manage Earnings",
    description: "Track your income",
    icon: CreditCard,
    color: "from-orange-600 to-orange-400",
    link: "/earnings"
  }
];

const recentActivity = [
  {
    type: "booking",
    title: "New Consultation Request",
    message: "Sarah Johnson requested a consultation",
    time: "5 min ago",
    avatar: "/avatars/sarah.jpg"
  },
  {
    type: "payment",
    title: "Payment Received",
    message: "Received $150 for last week's session",
    time: "1 hour ago"
  },
  {
    type: "system",
    title: "System Update",
    message: "Your profile has been verified",
    time: "2 hours ago"
  }
];

interface DashboardProps {
  isLoading?: boolean;
}

const ProfessionalDashboard = ({ isLoading = false }: DashboardProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-[150px]" />
          <Skeleton className="h-[150px]" />
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="container mx-auto p-4 space-y-6"
    >
      {/* Stats Overview */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Earnings Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <h3 className="text-2xl font-bold">$5,600</h3>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Clients</p>
              <h4 className="text-2xl font-bold">24</h4>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <h4 className="text-2xl font-bold">98%</h4>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer relative overflow-hidden h-full"
                onClick={() => navigate(action.link)}
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-10 transition-opacity",
                  action.color
                )} />
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br",
                      action.color
                    )}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
                  className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <div className={cn(
                    "rounded-full p-2",
                    activity.type === "booking" && "bg-blue-500",
                    activity.type === "payment" && "bg-green-500",
                    activity.type === "system" && "bg-orange-500"
                  )}>
                    {activity.type === "booking" && <Calendar className="h-4 w-4 text-white" />}
                    {activity.type === "payment" && <CreditCard className="h-4 w-4 text-white" />}
                    {activity.type === "system" && <Bell className="h-4 w-4 text-white" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.title}</p>
                      <Badge variant="outline" className="ml-2">
                        {activity.time}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.message}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ProfessionalDashboard;