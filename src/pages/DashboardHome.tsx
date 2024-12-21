import { useAuthStore } from "@/store/useAuthStore";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import BusinessDashboard from "@/components/dashboard/BusinessDashboard";
import ProfessionalDashboard from "@/components/dashboard/ProfessionalDashboard";

const DashboardHome = () => {
  const { user } = useAuthStore();

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
  };

  return (
    <>
      {/* <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">
          Here's an overview of your activities
        </p>
      </div> */}
      {renderDashboard()}
    </>
  );
};

export default DashboardHome; 