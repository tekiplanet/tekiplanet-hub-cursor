import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { businessService } from "@/services/businessService";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState as useHookState } from "react";

const businessProfileSchema = z.object({
  // Step 1: Basic Info
  business_name: z.string().min(2, "Business name is required"),
  business_email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Valid phone number required"),
  business_type: z.string().min(2, "Business type is required"),
  
  // Step 2: Location
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  
  // Step 3: Additional Info
  registration_number: z.string().optional(),
  tax_number: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().min(20, "Please provide a brief description of your business")
});

const steps = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Start with your business basics',
    fields: ['business_name', 'business_email', 'phone_number', 'business_type']
  },
  {
    id: 'location',
    title: 'Location Details',
    description: 'Where is your business located?',
    fields: ['address', 'city', 'state', 'country']
  },
  {
    id: 'additional-info',
    title: 'Additional Information',
    description: 'Tell us more about your business',
    fields: ['registration_number', 'tax_number', 'website', 'description']
  }
];

const businessTypes = [
  "Accounting & Financial Services",
  "Advertising & Marketing",
  "Aerospace & Aviation",
  "Agriculture & Farming",
  "Artificial Intelligence & Machine Learning",
  "Automotive",
  "Banking & Investment",
  "Biotechnology",
  "Chemical Industry",
  "Cloud Computing & Services",
  "Construction & Real Estate",
  "Consulting Services",
  "Consumer Electronics",
  "Cybersecurity",
  "Data Analytics & Business Intelligence",
  "E-commerce & Online Retail",
  "Education & E-learning",
  "Energy & Utilities",
  "Entertainment & Media",
  "Environmental Services",
  "Fashion & Apparel",
  "Food & Beverage",
  "Gaming & Esports",
  "Healthcare & Medical Services",
  "Hospitality & Tourism",
  "Human Resources & Recruitment",
  "Industrial Manufacturing",
  "Information Technology",
  "Insurance",
  "Interior Design & Architecture",
  "Legal Services",
  "Logistics & Supply Chain",
  "Mining & Metals",
  "Mobile App Development",
  "NGO & Non-Profit",
  "Oil & Gas",
  "Pharmaceutical",
  "Photography & Visual Arts",
  "Print & Publishing",
  "Public Relations",
  "Real Estate Development",
  "Renewable Energy",
  "Research & Development",
  "Restaurant & Food Services",
  "Retail & Consumer Goods",
  "Social Media & Digital Marketing",
  "Software Development",
  "Sports & Fitness",
  "Telecommunications",
  "Transportation & Delivery",
  "Travel & Tourism",
  "Web Development & Design",
  "Wholesale & Distribution",
  "Other"
] as const;

export function BusinessProfileForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useHookState("");

  const form = useForm<z.infer<typeof businessProfileSchema>>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      business_name: "",
      business_email: "",
      phone_number: "",
      business_type: "",
      address: "",
      city: "",
      state: "",
      country: "",
      registration_number: "",
      tax_number: "",
      website: "",
      description: ""
    },
  });

  const nextStep = () => {
    const fields = steps[currentStep].fields;
    const isValid = fields.every(field => {
      const value = form.getValues(field as any);
      return value && value.length > 0;
    });

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  async function onSubmit(values: z.infer<typeof businessProfileSchema>) {
    try {
      await businessService.createProfile(values);
      queryClient.invalidateQueries({ queryKey: ['business-profile'] });
      toast.success("Business profile created successfully");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(
        "Failed to create profile", 
        { description: error.response?.data?.message || "Please try again" }
      );
    }
  }

  const currentFields = steps[currentStep].fields;
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open && !(event.target as HTMLElement).closest('.relative')) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{steps[currentStep].title}</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Step Title */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{steps[currentStep].title}</h3>
                <p className="text-sm text-muted-foreground">
                  {steps[currentStep].description}
                </p>
              </div>

              {/* Step Fields */}
              <div className="grid gap-6">
                {currentFields.map((field) => (
                  <FormField
                    key={field}
                    control={form.control}
                    name={field as any}
                    render={({ field: fieldProps }) => (
                      <FormItem>
                        <FormLabel className="capitalize">
                          {field.replace(/_/g, ' ')}
                        </FormLabel>
                        <FormControl>
                          {field === 'business_type' ? (
                            <FormItem className="flex flex-col">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={open}
                                      className={cn(
                                        "w-full justify-between",
                                        !fieldProps.value && "text-muted-foreground"
                                      )}
                                    >
                                      {fieldProps.value || "Select business type"}
                                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent 
                                  align="start"
                                  side="top"
                                  sideOffset={8}
                                  alignOffset={0}
                                  className={cn(
                                    "p-0 w-[var(--radix-popper-anchor-width)]",
                                    "max-w-[400px]"
                                  )}
                                >
                                  <Command className="w-full">
                                    <div className="flex items-center border-b px-3">
                                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                      <input
                                        placeholder="Search business types..."
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                      />
                                    </div>
                                    <div className="p-2 max-h-[300px] overflow-y-auto">
                                      {businessTypes
                                        .filter((type) =>
                                          type.toLowerCase().includes(searchValue.toLowerCase())
                                        )
                                        .map((type) => (
                                          <div
                                            key={type}
                                            onClick={() => {
                                              fieldProps.onChange(type);
                                              setOpen(false);
                                            }}
                                            className={cn(
                                              "flex items-center gap-2 w-full rounded-sm px-2 py-3 cursor-pointer hover:bg-muted",
                                              fieldProps.value === type && "bg-muted"
                                            )}
                                          >
                                            <div className="flex flex-col flex-1">
                                              <span className="font-medium">{type}</span>
                                            </div>
                                            {fieldProps.value === type && (
                                              <Check className="h-4 w-4 text-primary" />
                                            )}
                                          </div>
                                        ))}
                                    </div>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          ) : field === 'description' ? (
                            <Textarea 
                              {...fieldProps}
                              placeholder={`Enter your business ${field.replace(/_/g, ' ')}`}
                              className="resize-none"
                              rows={4}
                            />
                          ) : (
                            <Input 
                              {...fieldProps}
                              type={field.includes('email') ? 'email' : 'text'}
                              placeholder={`Enter your business ${field.replace(/_/g, ' ')}`}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button type="submit">
                Create Profile
              </Button>
            ) : (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
} 