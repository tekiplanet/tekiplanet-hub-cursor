import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const NoProfessionalProfile = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-4"
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Complete Your Professional Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              You have not updated your professional profile. Update to get access to professional features.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/dashboard/professional/profile/create')}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              Create Professional Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NoProfessionalProfile; 