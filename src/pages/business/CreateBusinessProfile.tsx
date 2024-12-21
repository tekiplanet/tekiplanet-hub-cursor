import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessProfileForm } from "@/components/forms/BusinessProfileForm";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

export default function CreateBusinessProfile() {
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">
                Create Business Profile
              </CardTitle>
              <p className="text-muted-foreground">
                Fill in your business details to get started
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <BusinessProfileForm />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 