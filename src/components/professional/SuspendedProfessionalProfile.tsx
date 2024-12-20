import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Ban, Mail } from "lucide-react";

const SuspendedProfessionalProfile = () => {
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2 border-dashed">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Ban className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Profile Suspended
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              Your professional profile has been suspended. If you think this was a mistake, please contact support.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Button 
                onClick={() => window.location.href = 'mailto:support@tekiplanet.com'}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SuspendedProfessionalProfile; 