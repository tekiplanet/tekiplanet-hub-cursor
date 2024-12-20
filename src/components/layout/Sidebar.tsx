import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Wallet,
  Building2
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

  const navigationItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />
    },
    {
      label: "Academy",
      href: "/dashboard/academy",
      icon: <GraduationCap className="h-4 w-4 mr-2" />
    },
    {
      label: "My Courses",
      href: "/dashboard/academy/my-courses",
      icon: <GraduationCap className="h-4 w-4 mr-2" />
    },
    {
      label: "Wallet",
      href: "/dashboard/wallet",
      icon: <Wallet className="h-4 w-4 mr-2" />
    }
  ];

  const workstationItems = [
    {
      label: "Plans",
      href: "/dashboard/workstation/plans",
    },
    {
      label: "My Subscription",
      href: "/dashboard/workstation/subscription",
    }
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0">
        <ScrollArea className="h-full py-6">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={location.pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                    onClick={onClose}
                  >
                    <Link to={item.href}>
                      {item.icon}
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            {/* Workstation Section */}
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Workstation
              </h2>
              <div className="space-y-1">
                {workstationItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={location.pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start pl-6"
                    asChild
                    onClick={onClose}
                  >
                    <Link to={item.href}>
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default Sidebar; 