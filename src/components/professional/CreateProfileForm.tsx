import React from "react";
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
  FormDescription,
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
import { professionalService } from "@/services/professionalService";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { professionalCategoryService } from "@/services/professionalCategoryService";
import { Icons, type Icon } from "@/components/ui/icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState as useHookState } from "react";
import { Search } from "lucide-react";
import { TagInput } from "@/components/ui/tag-input";
import { toast } from "sonner";

// Form schemas for each step
const basicInfoSchema = z.object({
  title: z.string().min(1, "Professional title is required"),
  category_id: z.string().min(1, "Category is required"),
  specialization: z.string().min(1, "Specialization is required"),
  years_of_experience: z.string()
    .min(1, "Years of experience is required")
    .transform(Number)
    .refine((val) => val >= 0, "Years must be 0 or greater"),
  bio: z.string().min(10, "Bio must be at least 10 characters long"),
});

const expertiseSchema = z.object({
  expertise_areas: z.array(z.string())
    .min(1, "At least one area of expertise is required")
    .refine((val) => val.length > 0, "Please add at least one expertise area"),
  languages: z.array(z.string())
    .min(1, "At least one language is required")
    .refine((val) => val.length > 0, "Please add at least one language"),
  certifications: z.array(z.string())
    .min(1, "At least one certification is required")
    .refine((val) => val.length > 0, "Please add at least one certification"),
});

const contactSchema = z.object({
  preferred_contact_method: z.enum(["email", "phone", "whatsapp"], {
    required_error: "Please select a preferred contact method",
  }),
  timezone: z.string().min(1, "Timezone is required"),
  portfolio_url: z.string().url("Please enter a valid URL").min(1, "Portfolio URL is required"),
  linkedin_url: z.string().optional(),
  github_url: z.string().optional(),
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

// Add this interface near the top of the file
interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
  order: number;
}

const CreateProfileForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading, error } = useQuery<ProfessionalCategory[]>({
    queryKey: ['professional-categories'],
    queryFn: professionalCategoryService.getCategories,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.filter(category => category.is_active),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to load categories. Please try again.");
    }
  });

  // Forms
  const basicInfoForm = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: "",
      category_id: "",
      specialization: "",
      years_of_experience: "",
      bio: "",
    },
  });

  const expertiseForm = useForm({
    resolver: zodResolver(expertiseSchema),
    defaultValues: {
      expertise_areas: [],
      languages: [],
      certifications: [],
    },
  });

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
    try {
      // Validate current step before proceeding
      await currentForm.trigger();
      
      if (!currentForm.formState.isValid) {
        toast.error("Please fill in all required fields correctly before proceeding.");
        return;
      }

      setFormData((prev) => ({ ...prev, ...data }));
      
      if (currentStep === steps.length - 1) {
        setIsSubmitting(true);
        try {
          const completeData = {
            ...formData,
            ...data,
            availability_status: "available",
          };

          await professionalService.createProfile(completeData);
          
          toast.success("Professional profile created successfully! You can now access professional features.");
          
          navigate("/dashboard", { 
            replace: true
          });
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Failed to create profile. Please try again.");
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Form validation error:', error);
      toast.error("Please check all required fields and try again.");
    }
  };

  const currentForm = [basicInfoForm, expertiseForm, contactForm][currentStep];

  if (categoriesLoading) {
    return (
      <div className="container max-w-3xl mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-72 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          {/* Step Progress */}
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

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Form {...currentForm}>
                <form onSubmit={currentForm.handleSubmit(handleNext)} className="space-y-4">
                  {/* Step 1: Basic Info */}
                  {currentStep === 0 && (
                    <div className="space-y-4">
                      <FormField
                        control={basicInfoForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              Professional Title
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Senior Software Engineer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={basicInfoForm.control}
                        name="category_id"
                        render={({ field }) => {
                          const [open, setOpen] = useHookState(false);
                          const [searchValue, setSearchValue] = useHookState("");

                          return (
                            <FormItem className="flex flex-col">
                              <FormLabel>Category</FormLabel>
                              <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={open}
                                      className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        categories.find((category) => category.id === field.value)?.name
                                      ) : (
                                        "Select category"
                                      )}
                                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                  <Command
                                    filter={(value, search) => {
                                      if (value.toLowerCase().includes(search.toLowerCase())) return 1
                                      return 0
                                    }}
                                  >
                                    <div className="flex items-center border-b px-3">
                                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                      <input
                                        placeholder="Search categories..."
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                      />
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                      {categoriesLoading ? (
                                        <div className="p-4 space-y-2">
                                          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                                          <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                                        </div>
                                      ) : categories.length === 0 ? (
                                        <p className="p-4 text-sm text-center text-muted-foreground">
                                          No categories available
                                        </p>
                                      ) : (
                                        <div className="p-2">
                                          {categories
                                            .filter((category) =>
                                              category.name
                                                .toLowerCase()
                                                .includes(searchValue.toLowerCase())
                                            )
                                            .map((category) => {
                                              const IconComponent = Icons[category.icon as Icon];
                                              return (
                                                <div
                                                  key={category.id}
                                                  onClick={() => {
                                                    field.onChange(category.id);
                                                    setOpen(false);
                                                  }}
                                                  className={cn(
                                                    "flex items-center gap-2 w-full rounded-sm px-2 py-3 cursor-pointer hover:bg-muted",
                                                    field.value === category.id && "bg-muted"
                                                  )}
                                                >
                                                  {IconComponent && (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-muted/50">
                                                      <IconComponent className="h-5 w-5 text-primary" />
                                                    </div>
                                                  )}
                                                  <div className="flex flex-col flex-1">
                                                    <span className="font-medium">{category.name}</span>
                                                    <span className="text-xs text-muted-foreground line-clamp-1">
                                                      {category.description}
                                                    </span>
                                                  </div>
                                                  {field.value === category.id && (
                                                    <Check className="h-4 w-4 text-primary" />
                                                  )}
                                                </div>
                                              );
                                            })}
                                        </div>
                                      )}
                                    </div>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={basicInfoForm.control}
                        name="specialization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialization</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. Frontend Development, Cloud Architecture" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={basicInfoForm.control}
                        name="years_of_experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                placeholder="e.g. 5" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={basicInfoForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about your professional background and expertise..." 
                                className="resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 2: Expertise */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <FormField
                        control={expertiseForm.control}
                        name="expertise_areas"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Areas of Expertise</FormLabel>
                            <FormControl>
                              <TagInput
                                placeholder="Add expertise (press enter)"
                                tags={field.value}
                                className="sm:min-h-[120px]"
                                onTagsChange={(tags) => field.onChange(tags)}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter your key areas of expertise (e.g., React, Node.js, AWS)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={expertiseForm.control}
                        name="languages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Languages</FormLabel>
                            <FormControl>
                              <TagInput
                                placeholder="Add languages (press enter)"
                                tags={field.value}
                                className="sm:min-h-[120px]"
                                onTagsChange={(tags) => field.onChange(tags)}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter languages you can communicate in (e.g., English, French, Yoruba, Hausa)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={expertiseForm.control}
                        name="certifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Certifications</FormLabel>
                            <FormControl>
                              <TagInput
                                placeholder="Add certifications (press enter)"
                                tags={field.value}
                                className="sm:min-h-[120px]"
                                onTagsChange={(tags) => field.onChange(tags)}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter any relevant certifications you hold
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 3: Contact */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <FormField
                        control={contactForm.control}
                        name="preferred_contact_method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Contact Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select contact method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contactForm.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your timezone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                                {/* Add more timezones as needed */}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <FormField
                          control={contactForm.control}
                          name="linkedin_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>LinkedIn Profile</FormLabel>
                              <FormControl>
                                <Input placeholder="https://linkedin.com/in/..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={contactForm.control}
                          name="github_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GitHub Profile</FormLabel>
                              <FormControl>
                                <Input placeholder="https://github.com/..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={contactForm.control}
                          name="portfolio_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Portfolio Website</FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                      disabled={currentStep === 0}
                    >
                      Previous
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="min-w-[100px]"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Creating...
                        </>
                      ) : currentStep === steps.length - 1 ? (
                        "Create Profile"
                      ) : (
                        "Next"
                      )}
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