import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'react-hot-toast';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import PagePreloader from '@/components/ui/PagePreloader';
import { LoadingProvider, useLoading } from '@/context/LoadingContext';
import { ThemeProvider as ThemeStoreProvider } from '@/theme/ThemeProvider';
import { ThemeProvider as ThemeContextProvider } from '@/context/ThemeContext';
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminUsers from "@/pages/admin/Users";
import AdminCourses from "@/pages/admin/Courses";
import AdminTransactions from "@/pages/admin/Transactions";
import AdminSettings from "@/pages/admin/Settings";
import { queryClient } from '@/lib/queryClient';

// Lazy load pages
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const TransactionDetails = React.lazy(() => import('@/pages/TransactionDetails'));
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const CourseManagement = React.lazy(() => import('@/pages/CourseManagement'));
const Services = React.lazy(() => import('@/pages/Services'));
const ServiceQuoteRequest = React.lazy(() => import('@/pages/ServiceQuoteRequest'));
const ITConsulting = React.lazy(() => import('@/pages/ITConsulting'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const PaymentConfirmation = React.lazy(() => import('@/pages/PaymentConfirmation'));
const PaystackCallback = React.lazy(() => import('@/pages/PaystackCallback'));
const CourseDetails = React.lazy(() => import('@/components/academy/CourseDetails'));
const Academy = React.lazy(() => import('@/pages/Academy'));
const OrderTracking = React.lazy(() => import('@/pages/OrderTracking'));
const Orders = React.lazy(() => import('@/pages/Orders'));
const MyCourses = React.lazy(() => import('@/pages/MyCourses'));

// Add these new imports
const Store = React.lazy(() => import('@/pages/Store'));
const Products = React.lazy(() => import('@/pages/Products'));
const ProductDetails = React.lazy(() => import('@/pages/ProductDetails'));
const Cart = React.lazy(() => import('@/pages/Cart'));
const Checkout = React.lazy(() => import('@/pages/Checkout'));
const WalletDashboard = React.lazy(() => import('@/components/wallet/WalletDashboard'));
const SettingsPage = React.lazy(() => import('@/pages/Settings'));
const ServicesPage = React.lazy(() => import('@/pages/Services'));
const SoftwareEngineeringQuote = React.lazy(() => import('@/pages/SoftwareEngineeringQuote'));
const CyberSecurityQuote = React.lazy(() => import('@/pages/CyberSecurityQuote'));
const ServiceQuoteRequestPage = React.lazy(() => import('@/pages/ServiceQuoteRequest'));
const QuoteRequestsListPage = React.lazy(() => import('@/pages/QuoteRequestsList'));
const QuoteDetailsPage = React.lazy(() => import('@/pages/QuoteDetails'));
const ProjectsListPage = React.lazy(() => import('@/pages/ProjectsList'));
const ProjectDetailsPage = React.lazy(() => import('@/pages/ProjectDetails'));
const ITConsultingPage = React.lazy(() => import('@/pages/ITConsulting'));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AppContent = () => {
  const { isLoading } = useLoading();

  return (
    <Router>
      {isLoading && <PagePreloader />}
      <Suspense fallback={<PagePreloader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="store" element={<Store />} />
            <Route path="products" element={<Products />} />
            <Route path="store/product/:id" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="academy" element={<Academy />} />
            <Route path="academy/my-courses" element={<MyCourses />} />
            <Route path="academy/:courseId" element={<CourseDetails />} />
            <Route path="academy/:courseId/manage" element={<CourseManagement />} />
            <Route path="wallet" element={<WalletDashboard />} />
            <Route path="wallet/transactions/:transactionId" element={<TransactionDetails />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/quote/software-engineering/:serviceId" element={<SoftwareEngineeringQuote />} />
            <Route path="services/quote/cyber-security/:serviceId" element={<CyberSecurityQuote />} />
            <Route path="services/quote/:categoryId/:serviceId" element={<ServiceQuoteRequestPage />} />
            <Route path="quotes" element={<QuoteRequestsListPage />} />
            <Route path="quotes/:quoteId" element={<QuoteDetailsPage />} />
            <Route path="projects" element={<ProjectsListPage />} />
            <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="services/consulting" element={<ITConsultingPage />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId/tracking" element={<OrderTracking />} />
            <Route path="payment-confirmation" element={<PaymentConfirmation />} />
          </Route>

          <Route path="/academy/course/:courseId" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />
          
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/courses/:courseId/manage" element={<CourseManagement />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/quote/:category/:serviceId" element={<ServiceQuoteRequest />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <AdminGuard>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="courses" element={<AdminCourses />} />
                  <Route path="transactions" element={<AdminTransactions />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Routes>
              </AdminLayout>
            </AdminGuard>
          } />
          <Route path="/paystack-callback" element={<ProtectedRoute><PaystackCallback /></ProtectedRoute>} />
        </Routes>
      </Suspense>
      <Toaster />
      <Sonner />
    </Router>
  );
};

const App = () => {
  const { isAuthenticated, initialize, theme } = useAuthStore();

  // Apply theme on component mount and when theme changes
  React.useEffect(() => {
    console.log('🎨 Theme Changed:', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  React.useEffect(() => {
    // Call initialize when the app loads
    const initializeApp = async () => {
      console.group('🚀 App Initialization');
      console.log('Authentication State:', {
        isAuthenticated,
        token: localStorage.getItem('token'),
        storedTheme: localStorage.getItem('theme')
      });

      if (isAuthenticated) {
        try {
          const result = await initialize();
          console.log('🔑 Initialization Result:', result);
        } catch (error) {
          console.error('❌ App Initialization Failed:', error);
        }
      } else {
        console.log('❌ Not Authenticated. Skipping initialization.');
      }

      console.groupEnd();
    };

    initializeApp();
  }, [isAuthenticated, initialize]);

  return (
    <ThemeStoreProvider>
      <ThemeContextProvider>
        <QueryClientProvider client={queryClient}>
          <LoadingProvider>
            <TooltipProvider>
              <div className="min-h-screen transition-colors duration-300">
                <AppContent />
              </div>
            </TooltipProvider>
          </LoadingProvider>
        </QueryClientProvider>
      </ThemeContextProvider>
    </ThemeStoreProvider>
  );
};

export default App;