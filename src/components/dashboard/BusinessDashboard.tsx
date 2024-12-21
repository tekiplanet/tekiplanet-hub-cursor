import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DollarSign, 
  Users, 
  Package, 
  FileText,
  TrendingUp,
  ShoppingBag,
  AlertCircle,
  Plus,
  ArrowRight,
  Bell,
  BarChart3,
  Calendar,
  CircleDollarSign,
  Wallet
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { businessService } from '@/services/businessService';
import NoBusinessProfile from '../business/NoBusinessProfile';
import InactiveBusinessProfile from '../business/InactiveBusinessProfile';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Quick Action Component
const QuickAction = ({ icon: Icon, title, onClick, variant = "default" }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-all",
        variant === "primary" && "bg-primary text-primary-foreground"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            variant === "primary" ? "bg-primary-foreground/10" : "bg-primary/10"
          )}>
            <Icon className={cn(
              "h-4 w-4",
              variant === "primary" ? "text-primary-foreground" : "text-primary"
            )} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium">{title}</h3>
          </div>
          <ArrowRight className={cn(
            "h-4 w-4 opacity-50",
            variant === "primary" ? "text-primary-foreground" : "text-foreground"
          )} />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Metric Card Component with Animation
const MetricCard = ({ title, value, trend, icon: Icon, trendValue, isLoading, color = "primary" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="relative overflow-hidden">
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 transform translate-x-8 -translate-y-8",
        `bg-${color}-500`
      )} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "p-3 rounded-xl",
              `bg-${color}-500/10`
            )}>
              <Icon className={cn(
                "h-6 w-6",
                `text-${color}-500`
              )} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {isLoading ? (
                <div className="h-8 w-24 animate-pulse bg-muted rounded" />
              ) : (
                <h3 className="text-2xl font-bold">{value}</h3>
              )}
            </div>
          </div>
          {trend && (
            <Badge variant={trend === 'up' ? 'success' : 'destructive'} className="h-6">
              <TrendingUp className={cn(
                "h-4 w-4 mr-1",
                trend === 'down' && "rotate-180"
              )} />
              {trendValue}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Recent Activity Item
const ActivityItem = ({ icon: Icon, title, time, amount, status }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg cursor-pointer"
  >
    <div className="p-2 bg-primary/10 rounded-xl">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium truncate">{title}</p>
      <p className="text-sm text-muted-foreground">{time}</p>
    </div>
    <div className="text-right">
      <p className="font-medium">{amount}</p>
      <Badge variant={status === 'completed' ? 'success' : 'secondary'}>
        {status}
      </Badge>
    </div>
  </motion.div>
);

export default function BusinessDashboard() {
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['business-profile'],
    queryFn: businessService.checkProfile,
    retry: false
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['business-metrics'],
    queryFn: businessService.getMetrics,
    enabled: !!profileData?.has_profile
  });

  if (profileLoading) {
    return <LoadingSkeleton />;
  }

  if (!profileData?.has_profile) {
    return <NoBusinessProfile />;
  }

  if (profileData?.profile?.status === 'inactive') {
    return <InactiveBusinessProfile />;
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={profileData?.profile?.logo} />
            <AvatarFallback>BP</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {profileData?.profile?.business_name}
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM do yyyy')}
            </p>
          </div>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsQuickActionOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Quick Action
        </Button>
      </div>

      {/* Quick Actions Dialog */}
      <Dialog open={isQuickActionOpen} onOpenChange={setIsQuickActionOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Quick Actions</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <QuickAction
              icon={CircleDollarSign}
              title="Create Invoice"
              onClick={() => {
                setIsQuickActionOpen(false);
                // Add navigation logic
              }}
              variant="primary"
            />
            <QuickAction
              icon={Package}
              title="Add Inventory"
              onClick={() => {
                setIsQuickActionOpen(false);
                // Add navigation logic
              }}
            />
            <QuickAction
              icon={Users}
              title="Add Customer"
              onClick={() => {
                setIsQuickActionOpen(false);
                // Add navigation logic
              }}
            />
            <QuickAction
              icon={Wallet}
              title="Record Payment"
              onClick={() => {
                setIsQuickActionOpen(false);
                // Add navigation logic
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Metrics Section */}
      <div className="space-y-4">
        {/* Monthly Revenue - Full Width */}
        <div className="w-full">
          <MetricCard
            title="Monthly Revenue"
            value={metrics?.revenue || "₦0"}
            trend="up"
            trendValue="12%"
            icon={DollarSign}
            isLoading={metricsLoading}
            color="green"
          />
        </div>
        
        {/* Inventory and Customers - Two columns on mobile */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Total Customers"
            value={metrics?.customers || "0"}
            trend="up"
            trendValue="8%"
            icon={Users}
            isLoading={metricsLoading}
            color="blue"
          />
          <MetricCard
            title="Inventory Items"
            value={metrics?.inventory || "0"}
            trend="down"
            trendValue="3%"
            icon={Package}
            isLoading={metricsLoading}
            color="orange"
          />
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics?.revenueData || []}>
                      <defs>
                        <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#revenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest business transactions</CardDescription>
                </div>
                <Button variant="ghost" className="text-xs">View All</Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <ActivityItem
                    icon={CircleDollarSign}
                    title="Payment from John Doe"
                    time="2 minutes ago"
                    amount="₦45,000"
                    status="completed"
                  />
                  {/* Add more activity items */}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alert */}
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-orange-500">Low Stock Alert</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {/* Low stock items list */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add other tab contents */}
      </Tabs>
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-8 p-8">
    <div className="h-20 bg-muted rounded-lg animate-pulse" />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="h-[400px] bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  </div>
);