import { useState, useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { Home, BookOpen, Briefcase, ShoppingBag, Wallet, Settings, LogOut, UserCircle2, GraduationCap, Menu, ArrowLeft, Bell, ChevronDown, ShoppingCart, Package, BrainCircuit, Calendar, Building2, LayoutDashboard, CreditCard, Users } from "lucide-react"
import { useNavigate, Routes, Route, useLocation, Outlet } from "react-router-dom"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import useAuthStore from '@/store/useAuthStore';
import StudentDashboard from "@/components/dashboard/StudentDashboard"
import BusinessDashboard from "@/components/dashboard/BusinessDashboard"
import ProfessionalDashboard from "@/components/dashboard/ProfessionalDashboard"
import Academy from "./Academy"
import WalletDashboard from "@/components/wallet/WalletDashboard"
import CourseDetails from "@/components/academy/CourseDetails"
import MyCourses from "@/pages/MyCourses"
import CourseManagement from "@/pages/CourseManagement"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Header from '../components/Header';
import SettingsPage from "./Settings"
import ServicesPage from "./Services"
import ServiceQuoteRequestPage from "./ServiceQuoteRequest"
import SoftwareEngineeringQuote from "./SoftwareEngineeringQuote"
import CyberSecurityQuote from "./CyberSecurityQuote"
import { FileText, Server } from "lucide-react"
import QuoteRequestsListPage from "./QuoteRequestsList"
import QuoteDetailsPage from "./QuoteDetails"
import ProjectsListPage from "./ProjectsList"
import ProjectDetailsPage from "./ProjectDetails"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import ThemeToggle from '@/components/ThemeToggle'
import PaymentConfirmation from "@/pages/PaymentConfirmation";
import TransactionDetails from "@/pages/TransactionDetails";
import Store from "./Store";
import Cart from "./Cart";
import ProductDetails from "./ProductDetails";
import Checkout from "./Checkout";
import Orders from "./Orders";
import OrderTracking from "./OrderTracking";
import Products from "./Products";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { storeService } from '@/services/storeService';
import ITConsulting from "./ITConsulting";
import ConsultingBookings from "./ConsultingBookings";
import ConsultingBookingDetails from "./ConsultingBookingDetails";

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  submenu?: MenuItem[];
  show?: boolean;
}

const Dashboard = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, updateUserType } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data: cartCount = 0 } = useQuery({
    queryKey: ['cartCount'],
    queryFn: storeService.getCartCount,
    initialData: 0
  });

  useEffect(() => {
    console.group('User Data Debug');
    console.log('Full User Object:', user);
    console.log('User Name:', user?.name);
    console.log('User Email:', user?.email);
    console.log('User Avatar:', user?.avatar);
    console.log('User First Name:', user?.first_name);
    console.log('User Last Name:', user?.last_name);
    console.groupEnd();
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Force a refresh of user data
        const freshUserData = await useAuthStore.getState().refreshToken();
        
        // Log the fetched data for debugging
        console.group('User Data Refresh');
        console.log('Fresh User Data:', freshUserData);
        console.log('Current Wallet Balance:', freshUserData?.wallet_balance);
        console.groupEnd();
      } catch (error) {
        console.error('Failed to refresh user data:', error);
        toast.error('Failed to fetch latest user information');
      }
    };

    // Fetch user data immediately on mount
    fetchUserData();

    // Optional: Set up an interval to periodically refresh user data
    const intervalId = setInterval(fetchUserData, 5 * 60 * 1000); // Every 5 minutes

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    // Use the logout method from auth store
    useAuthStore.getState().logout();
    
    toast.success("Logged out successfully");
    navigate("/login");
  }

  const handleProfileSwitch = async (type: 'student' | 'business' | 'professional') => {
    try {
      await updateUserType(type);
      
      // Navigate to dashboard after profile type switch
      navigate('/dashboard', { 
        replace: true,  // Replace current history entry
        state: { profileSwitched: true }  // Optional: pass state to indicate profile switch
      });

      // Show success toast
      toast.success(`Switched to ${type} profile`);
    } catch (error) {
      console.error('Profile switch error:', error);
      toast.error('Failed to switch profile type');
    }
  }

  const renderDashboard = () => {
    switch (user?.account_type) {
      case "student":
        return <StudentDashboard />;
      case "business":
        return <BusinessDashboard />;
      case "professional":
        return <ProfessionalDashboard />;
      default:
        return <div>Invalid user type</div>;
    }
  }

  const getPageTitle = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return "Dashboard";
    return segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setIsSheetOpen(false); // Close the sheet when menu item is clicked
  };

  const handleFundWallet = async () => {
    try {
      console.log('Fund Wallet Clicked', { amount: 1000, paymentMethod: 'bank-transfer' });
      console.log('Navigating to payment confirmation page...');
      
      if (!1000) {
        toast.error('Please enter an amount');
        return;
      }

      navigate('/dashboard/payment-confirmation', { 
        state: { 
          amount: 1000, 
          paymentMethod: 'bank-transfer'.toLowerCase() 
        } 
      });
      console.log('Navigation successful');
    } catch (error) {
      console.error('Fund Wallet Error:', error);
      toast.error('Failed to process wallet funding');
    }
  };

  const menuItems: MenuItem[] = [
    {
      label: "Home",
      path: "/dashboard",
      icon: <Home className="w-4 h-4" />
    },
    {
      label: "Store",
      path: "/dashboard/store",
      icon: <ShoppingBag className="w-4 h-4" />
    },
    {
      label: "Cart",
      path: "/dashboard/cart",
      icon: <ShoppingCart className="w-4 h-4" />,
      badge: cartCount > 0 ? cartCount.toString() : undefined
    },
    {
      label: "Orders",
      path: "/dashboard/orders",
      icon: <Package className="w-4 h-4" />
    },
    {
      label: "Wallet",
      path: "/dashboard/wallet",
      icon: <Wallet className="w-4 h-4" />
    },  
    {
      label: "Academy",
      path: "/dashboard/academy",
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      label: "My Courses",
      path: "/dashboard/academy/my-courses",
      icon: <GraduationCap className="w-4 h-4" />
    }, 
    {
      label: "Services",
      path: "/dashboard/services",
      icon: <Briefcase className="w-4 h-4" />
    },
    {
      label: "Quotes",
      path: "/dashboard/quotes",
      icon: <FileText className="w-4 h-4" />
    },
    {
      label: "Projects",
      path: "/dashboard/projects",
      icon: <Server className="w-4 h-4" />
    },
    {
      label: "Settings",
      path: "/dashboard/settings",
      icon: <Settings className="w-4 h-4" />
    },
    {
      label: 'IT Consulting',
      path: '/dashboard/it-consulting',
      icon: <BrainCircuit className="h-5 w-5" />
    },
    {
      path: '/dashboard/workstation/plans',
      label: 'Workstation',
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      label: "Hustles",
      path: "/dashboard/hustles",
      icon: <Briefcase className="h-4 w-4" />,
      badge: "New"
    },
    {
      path: '/dashboard/business/customers',
      label: 'Customers',
      icon: <Users className="h-5 w-5" />,
      show: user?.account_type === 'business'
    }
  ];



  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col border-r">
          <div className="flex flex-col h-full">
            {/* Fixed Header - User Profile Section */}
            <div className="border-b px-6 py-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                    <AvatarImage 
                      src={user?.avatar || undefined} 
                      alt={user?.name || user?.first_name || user?.last_name || "User Avatar"} 
                    />
                    <AvatarFallback>
                      {user?.name 
                        ? user.name.charAt(0).toUpperCase() 
                        : (user?.first_name 
                          ? user.first_name.charAt(0).toUpperCase() 
                          : '?')
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="truncate text-sm font-medium">
                    {user?.name || 
                     (user?.first_name && user?.last_name 
                       ? `${user.first_name} ${user.last_name}` 
                       : user?.first_name || 
                         user?.last_name || 
                         user?.email || 
                         'User')}
                  </h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email || 'No email'}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Menu Items */}
            <div className="flex-1 overflow-y-auto">
              <nav className="flex-1 space-y-1 px-4 py-2 overflow-y-auto">
                {menuItems.map((item) => (
                  <div key={item.path}>
                    {/* Main Menu Item */}
                    <Button
                      variant={location.pathname === item.path ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start mb-1",
                        item.submenu && "mb-2"
                      )}
                      onClick={() => {
                        if (item.submenu) {
                        } else {
                          navigate(item.path);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          {item.icon}
                          <span className="ml-3">{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto mr-2">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </Button>
                  </div>
                ))}
              </nav>
            </div>

            {/* Fixed Bottom Section */}
            <div className="border-t p-3 space-y-2 shrink-0">
              {/* Profile Type Switcher */}
              <div className="px-3 py-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {user?.account_type === "student" ? "Student" : user?.account_type === "business" ? "Business" : "Professional"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      disabled={user?.account_type === "student"}
                      onClick={() => handleProfileSwitch("student")}
                    >
                      Switch to Student
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      disabled={user?.account_type === "business"}
                      onClick={() => handleProfileSwitch("business")}
                    >
                      Switch to Business
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      disabled={user?.account_type === "professional"}
                      onClick={() => handleProfileSwitch("professional")}
                    >
                      Switch to Professional
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between px-3 py-2">
                <h4 className="text-xs font-medium text-muted-foreground">
                  Theme
                </h4>
                <ThemeToggle />
              </div>

              {/* Settings & Logout */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => navigate('/dashboard/settings')}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-red-500 hover:text-red-500 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile Header and Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
            <div className="flex items-center gap-3 flex-1">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <div className="flex flex-col h-full">
                    {/* Fixed Header */}
                    <div className="border-b p-4 shrink-0">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={user?.avatar || undefined} 
                            alt={user?.name || user?.first_name || user?.last_name || "User Avatar"} 
                          />
                          <AvatarFallback>
                            {user?.name 
                              ? user.name.charAt(0).toUpperCase() 
                              : (user?.first_name 
                                ? user.first_name.charAt(0).toUpperCase() 
                                : '?')
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{user?.name || 
                           (user?.first_name && user?.last_name 
                             ? `${user.first_name} ${user.last_name}` 
                             : user?.first_name || 
                               user?.last_name || 
                               user?.email || 
                               'User')}</h3>
                          <p className="text-sm text-muted-foreground">{user?.email || 'No email'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto">
                      {/* Menu Items */}
                      <nav className="space-y-1 p-4">
                        {menuItems.map((item) => (
                          <div key={item.path}>
                            {/* Main Menu Item */}
                            <Button
                              variant={location.pathname === item.path ? "default" : "ghost"}
                              className="w-full justify-start gap-2"
                              onClick={() => {
                                navigate(item.path);
                                setIsSheetOpen(false);
                              }}
                            >
                              {item.icon}
                              <span>{item.label}</span>
                              {item.badge && (
                                <Badge variant="secondary" className="ml-auto">
                                  {item.badge}
                                </Badge>
                              )}
                            </Button>
                          </div>
                        ))}
                      </nav>
                    </div>

                    {/* Fixed Footer */}
                    <div className="border-t p-4 mt-auto shrink-0">
                      <div className="space-y-2">
                        {/* Profile Switcher */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-start gap-2">
                              <GraduationCap className="h-4 w-4" />
                              {user?.account_type === "student" ? "Student" : user?.account_type === "business" ? "Business" : "Professional"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem 
                              disabled={user?.account_type === "student"}
                              onClick={() => {
                                handleProfileSwitch("student");
                                setIsSheetOpen(false);
                              }}
                            >
                              Switch to Student
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              disabled={user?.account_type === "business"}
                              onClick={() => {
                                handleProfileSwitch("business");
                                setIsSheetOpen(false);
                              }}
                            >
                              Switch to Business
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              disabled={user?.account_type === "professional"}
                              onClick={() => {
                                handleProfileSwitch("professional");
                                setIsSheetOpen(false);
                              }}
                            >
                              Switch to Professional
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between px-3 py-2">
                          <h4 className="text-xs font-medium text-muted-foreground">
                            Theme
                          </h4>
                          <ThemeToggle />
                        </div>

                        {/* Logout Button */}
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2 text-red-500"
                          onClick={() => {
                            handleLogout();
                            setIsSheetOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {location.pathname !== "/dashboard" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="md:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}

              <h3 className="text-sm font-semibold">
                {getPageTitle(location.pathname)}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                      3
                    </span>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent align="end" className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Recent Notifications</h4>
                    <div className="space-y-3">
                      {[
                        {
                          title: "New Course Available",
                          desc: "Advanced React Patterns course is now live",
                          time: "2 hours ago"
                        },
                        {
                          title: "Assignment Due",
                          desc: "Web Development Basics assignment due in 24 hours",
                          time: "5 hours ago"
                        },
                        {
                          title: "Wallet Funded",
                          desc: "Your wallet has been credited with ₦50,000",
                          time: "1 day ago"
                        }
                      ].map((notification, i) => (
                        <div key={i} className="flex gap-2 text-sm">
                          <div className="h-2 w-2 mt-1.5 rounded-full bg-primary shrink-0" />
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-muted-foreground text-xs">
                              {notification.desc}
                            </p>
                            <p className="text-xs text-primary">{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-primary text-sm">
                      View All Notifications
                    </Button>
                  </div>
                </HoverCardContent>
              </HoverCard>

              {/* Add Cart Icon */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => navigate('/dashboard/cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user?.avatar || undefined} 
                        alt={user?.name || user?.first_name || user?.last_name || "User Avatar"} 
                      />
                      <AvatarFallback>
                        {user?.name 
                          ? user.name.charAt(0).toUpperCase() 
                          : (user?.first_name 
                            ? user.first_name.charAt(0).toUpperCase() 
                            : '?')
                        }
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2 border-b">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || 
                       (user?.first_name && user?.last_name 
                         ? `${user.first_name} ${user.last_name}` 
                         : user?.first_name || 
                           user?.last_name || 
                           user?.email || 
                           'User')}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || 'No email'}</p>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="container mx-auto p-4 md:p-6 max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;