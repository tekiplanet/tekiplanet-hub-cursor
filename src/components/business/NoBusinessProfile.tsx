import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";

const NoBusinessProfile = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2 border-dashed">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Complete Your Business Profile
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              You need to set up your business profile to access the dashboard features.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Create your business profile to:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Access business tools and services</li>
                <li>• Manage your business workspace</li>
                <li>• Track business performance</li>
              </ul>
              <Button 
                size="lg"
                onClick={() => navigate('/dashboard/business/profile/create')}
                className="mt-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                Create Business Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NoBusinessProfile; 