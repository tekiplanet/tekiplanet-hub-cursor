import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { professionalService } from "@/services/professionalService";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Form schemas for each step
const basicInfoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  specialization: z.string().min(1, "Specialization is required"),
  years_of_experience: z.string().transform(Number),
  hourly_rate: z.string().transform(Number),
  bio: z.string().optional(),
});

const expertiseSchema = z.object({
  expertise_areas: z.array(z.string()).min(1, "At least one expertise area is required"),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  certifications: z.array(z.string()).optional(),
});

const contactSchema = z.object({
  preferred_contact_method: z.enum(["email", "phone", "whatsapp"]),
  timezone: z.string().min(1, "Timezone is required"),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  github_url: z.string().url().optional().or(z.literal("")),
  portfolio_url: z.string().url().optional().or(z.literal("")),
});

// Form steps
const steps = [
  {
    id: "basic-info",
    title: "Basic Information",
    description: "Let's start with your basic professional information",
  },
  {
    id: "expertise",
    title: "Expertise & Skills",
    description: "Tell us about your expertise and skills",
  },
  {
    id: "contact",
    title: "Contact & Links",
    description: "How would you like to be contacted?",
  },
];

const CreateProfileForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form for basic info
  const basicInfoForm = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: "",
      specialization: "",
      years_of_experience: "",
      hourly_rate: "",
      bio: "",
    },
  });

  // Form for expertise
  const expertiseForm = useForm({
    resolver: zodResolver(expertiseSchema),
    defaultValues: {
      expertise_areas: [],
      languages: [],
      certifications: [],
    },
  });

  // Form for contact
  const contactForm = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      preferred_contact_method: "email",
      timezone: "",
      linkedin_url: "",
      github_url: "",
      portfolio_url: "",
    },
  });

  const handleNext = async (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    
    if (currentStep === steps.length - 1) {
      // Submit the complete form
      try {
        const completeData = {
          ...formData,
          ...data,
          availability_status: "available",
        };

        await professionalService.createProfile(completeData);
        
        toast({
          title: "Profile Created",
          description: "Your professional profile has been created successfully.",
        });

        navigate("/dashboard/professional");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create profile. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const currentForm = [basicInfoForm, expertiseForm, contactForm][currentStep];

  return (
    <div className="container max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {steps[currentStep].title}
          </CardTitle>
          <p className="text-muted-foreground">
            {steps[currentStep].description}
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index !== steps.length - 1 ? "flex-1" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index !== steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        index < currentStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Form {...currentForm}>
                <form onSubmit={currentForm.handleSubmit(handleNext)}>
                  {/* Step 1: Basic Info */}
                  {currentStep === 0 && (
                    <div className="space-y-4">
                      <FormField
                        control={basicInfoForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Senior Software Engineer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Add other basic info fields */}
                    </div>
                  )}

                  {/* Step 2: Expertise */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      {/* Add expertise fields */}
                    </div>
                  )}

                  {/* Step 3: Contact */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      {/* Add contact fields */}
                    </div>
                  )}

                  <div className="flex justify-between mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                      disabled={currentStep === 0}
                    >
                      Previous
                    </Button>
                    <Button type="submit">
                      {currentStep === steps.length - 1 ? "Create Profile" : "Next"}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProfileForm; 