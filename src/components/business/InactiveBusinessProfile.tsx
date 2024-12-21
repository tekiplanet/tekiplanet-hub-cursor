import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, ShoppingBag, Mail } from "lucide-react";

const InactiveBusinessProfile = () => {
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
            <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Profile Pending Approval
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              Your business profile has been created and is pending system approval.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.location.href = 'mailto:support@tekiplanet.com'}
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Contact Support
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/dashboard/store')}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Browse Products
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default InactiveBusinessProfile; 