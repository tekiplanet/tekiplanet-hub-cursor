import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserCog } from "lucide-react";

const NoProfessionalProfile = () => {
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
              <UserCog className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Complete Your Professional Profile
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              You need to set up your professional profile to access the dashboard features.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Create your professional profile to:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Showcase your expertise and skills</li>
                <li>• Connect with potential clients</li>
                <li>• Access professional tools and features</li>
              </ul>
              <Button 
                size="lg"
                onClick={() => navigate('/dashboard/professional/profile/create')}
                className="mt-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                Create Professional Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NoProfessionalProfile; 