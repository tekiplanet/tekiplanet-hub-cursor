import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/axios';
import PagePreloader from '@/components/ui/PagePreloader';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './Dashboard';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from "@/components/ui/calendar"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { settingsService } from '@/services/settingsService';
import { ArrowRightIcon, ArrowLeftIcon, CalendarIcon, CheckIcon } from 'lucide-react';
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ServiceQuoteField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface ServiceDetails {
  id: string;
  name: string;
  description: string;
  short_description: string;
  category: {
    id: string;
    name: string;
  };
}

const INDUSTRY_OPTIONS = [
  'Technology & Software',
  'Healthcare & Medical',
  'Financial Services & Banking',
  'Education & E-learning',
  'Retail & E-commerce',
  'Manufacturing & Industrial',
  'Media & Entertainment',
  'Real Estate & Construction',
  'Travel & Hospitality',
  'Professional Services',
  'Telecommunications',
  'Energy & Utilities',
  'Automotive & Transportation',
  'Agriculture & Farming',
  'Food & Beverage',
  'Fashion & Apparel',
  'Non-Profit & NGO',
  'Government & Public Sector',
  'Sports & Recreation',
  'Arts & Culture',
  'Other'
] as const;

const getBudgetRanges = (currency: string) => [
  `Below ${currency}50,000`,
  `${currency}50,000 - ${currency}100,000`,
  `${currency}100,000 - ${currency}250,000`,
  `${currency}250,000 - ${currency}500,000`,
  `${currency}500,000 - ${currency}1,000,000`,
  `${currency}1,000,000 - ${currency}2,500,000`,
  `${currency}2,500,000 - ${currency}5,000,000`,
  `${currency}5,000,000 - ${currency}10,000,000`,
  `Above ${currency}10,000,000`
] as const;

const ServiceQuoteRequest: React.FC = () => {
  const { categoryId, serviceId } = useParams<{ categoryId: string; serviceId: string }>();
  const navigate = useNavigate();
  const [serviceDetails, setServiceDetails] = useState<ServiceDetails | null>(null);
  const [quoteFields, setQuoteFields] = useState<ServiceQuoteField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultCurrency, setDefaultCurrency] = useState('$');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [currentStep, setCurrentStep] = useState(0);
  const [isIndustryOpen, setIsIndustryOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const allSettings = await settingsService.getAllSettings();
        
        const currency = allSettings.default_currency || 'USD';
        const symbol = allSettings.currency_symbol || '$';
        
        setDefaultCurrency(symbol);
        setCurrencySymbol(symbol);
        
        console.log('Settings loaded:', {
          currency,
          symbol,
          allSettings
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
        setDefaultCurrency('$');
        setCurrencySymbol('$');
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchServiceQuoteDetails = async () => {
      try {
        const response = await apiClient.get(`/services/${serviceId}/quote-details`);
        
        setServiceDetails(response.data.service);
        setQuoteFields(response.data.quote_fields);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching service quote details:', err);
        setError('Failed to fetch service quote details');
        setIsLoading(false);
      }
    };

    fetchServiceQuoteDetails();
  }, [serviceId]);

  const formSchema = z.object({
    industry: z.string().min(1, { message: "Industry is required" }),
    budgetRange: z.string().min(1, { message: "Budget range is required" }),
    contactMethod: z.string().min(1, { message: "Contact method is required" }),
    projectDescription: z.string().min(10, { message: "Project description is required (minimum 10 characters)" }),
    projectDeadline: z.preprocess((arg) => {
      if (arg instanceof Date) return arg;
      if (typeof arg === 'string') {
        const date = new Date(arg);
        return !isNaN(date.getTime()) ? date : null;
      }
      return null;
    }, z.date({ required_error: "Project deadline is required" })),
    dynamicFields: z.record(z.string(), z.union([
      z.string(), 
      z.array(z.string()), 
      z.boolean(), 
      z.number(),
      z.preprocess((arg) => {
        if (arg instanceof Date) return arg;
        if (typeof arg === 'string') {
          const date = new Date(arg);
          return !isNaN(date.getTime()) ? date : null;
        }
        return null;
      }, z.date().nullable())
    ]).optional()).optional()
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industry: '',
      budgetRange: '',
      contactMethod: '',
      projectDescription: '',
      projectDeadline: new Date(),
      dynamicFields: {}
    }
  });

  useEffect(() => {
    if (quoteFields.length > 0) {
      const defaultValues = quoteFields.reduce((acc, field) => {
        switch(field.type) {
          case 'multi-select':
            acc[field.id] = [];
            break;
          case 'checkbox':
            acc[field.id] = false;
            break;
          case 'number':
            acc[field.id] = 0;
            break;
          case 'date':
            acc[field.id] = null;
            break;
          default:
            acc[field.id] = '';
        }
        return acc;
      }, {} as any);

      form.reset({ 
        ...form.getValues(), 
        dynamicFields: defaultValues 
      });
    }
  }, [quoteFields, form.reset]);

  const nextStep = async () => {
    if (currentStep === 0) {
      // Validate Quote Details
      const quoteDetailsFields = ['industry', 'budgetRange', 'contactMethod', 'projectDescription', 'projectDeadline'];
      
      // Check if all required fields are filled
      const hasEmptyFields = quoteDetailsFields.some(fieldName => {
        const value = form.getValues(fieldName);
        return !value || (typeof value === 'string' && value.trim() === '');
      });

      if (hasEmptyFields) {
        toast.error("Please fill all required fields");
        return;
      }

      // Trigger validation
      const isValid = await form.trigger(quoteDetailsFields);
      if (!isValid) {
        toast.error("Please correct the errors before proceeding");
        return;
      }
    }

    if (currentStep === 1) {
      // Validate Project Details
      if (quoteFields.length > 0) {
        const requiredFields = quoteFields
          .filter(field => field.required)
          .map(field => `dynamicFields.${field.id}`);

        // Check if required fields are filled
        const hasEmptyFields = requiredFields.some(fieldName => {
          const value = form.getValues(fieldName);
          return value === undefined || value === null || value === '' || 
                 (Array.isArray(value) && value.length === 0);
        });

        if (hasEmptyFields) {
          toast.error("Please fill all required fields");
          return;
        }

        // Trigger validation
        const isValid = await form.trigger(requiredFields);
        if (!isValid) {
          toast.error("Please correct the errors before proceeding");
          return;
        }
      }
    }

    // If validation passes, move to next step
    setCurrentStep(prev => Math.min(prev + 1, 2));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Prepare dynamic fields
    const processedDynamicFields = values.dynamicFields 
      ? Object.fromEntries(
          Object.entries(values.dynamicFields).map(([key, value]) => {
            // Convert arrays to comma-separated strings
            if (Array.isArray(value)) {
              return [key, value.join(',')];
            }
            // Convert dates to formatted strings
            if (value instanceof Date) {
              return [key, format(value, 'yyyy-MM-dd')];
            }
            // Handle string dates
            if (typeof value === 'string' && !isNaN(Date.parse(value))) {
              return [key, format(new Date(value), 'yyyy-MM-dd')];
            }
            return [key, value];
          })
        )
      : undefined;

    try {
      const response = await apiClient.post('/quotes', {
        service_id: serviceId,
        industry: values.industry,
        budget_range: values.budgetRange,
        contact_method: values.contactMethod,
        project_description: values.projectDescription,
        project_deadline: values.projectDeadline ? format(values.projectDeadline, 'yyyy-MM-dd') : null,
        quote_fields: processedDynamicFields
      });

      if (response.data.success) {
        // Show success toast
        toast.success('Quote submitted successfully!');
        
        // Redirect to quotes list
        navigate('/dashboard/quotes');
      }
    } catch (error: any) {
      // Handle submission error
      if (error.response && error.response.status === 422) {
        // Validation errors
        const errors = error.response.data.errors;
        
        // Display validation errors
        Object.keys(errors).forEach(field => {
          errors[field].forEach((errorMessage: string) => {
            toast.error(`${field}: ${errorMessage}`);
          });
        });
      } else {
        // Generic error
        toast.error('Failed to submit quote. Please try again.');
      }
      console.error('Quote submission error:', error);
    }
  };

  if (isLoading) {
    return <PagePreloader />;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  return (
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header Section */}
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight">{serviceDetails?.name} Request</h1>
            <p className="text-muted-foreground text-lg">{serviceDetails?.description}</p>
          </div>

          {/* Progress Steps */}
          <div className="w-full bg-card rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="flex justify-between items-center relative">
              {['Quote Details', 'Project Details', 'Review'].map((step, index) => (
                <div key={step} className="flex flex-col items-center z-10">
                  <div 
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                      currentStep === index 
                        ? "bg-primary text-primary-foreground border-primary"
                        : currentStep > index
                        ? "bg-primary/20 border-primary/20"
                        : "bg-muted border-muted-foreground/20"
                    )}
                  >
                    {currentStep > index ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs sm:text-sm mt-2 font-medium text-center",
                    currentStep === index ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step}
                  </span>
                </div>
              ))}
              {/* Progress line */}
              <div 
                className="absolute top-5 left-0 h-[2px] bg-muted-foreground/20 w-full -z-0"
                style={{
                  background: `linear-gradient(to right, 
                    var(--primary) ${(currentStep / 2) * 100}%, 
                    var(--muted) ${(currentStep / 2) * 100}%)`
                }}
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <Form {...form}>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault(); // Always prevent default form submission
                    
                    // Only process submission in Review step with Submit Quote Request button
                    if (currentStep === 2) {
                      form.handleSubmit(onSubmit)(e);
                    }
                  }} 
                  className="space-y-6"
                >
                  <AnimatePresence mode="wait">
                    {currentStep === 0 && (
                      <motion.div
                        key="quote-details"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="grid gap-6">
                          {/* Industry Field */}
                          <FormField
                            control={form.control}
                            name="industry"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="font-semibold flex items-center gap-2">
                                  Industry/Sector 
                                  <Badge variant="outline" className="font-normal">Required</Badge>
                                </FormLabel>
                                <Popover open={isIndustryOpen} onOpenChange={setIsIndustryOpen}>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                          "w-full justify-between",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value
                                          ? INDUSTRY_OPTIONS.find(
                                              (industry) => industry === field.value
                                            )
                                          : "Select industry"}
                                        <CheckIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command>
                                      <CommandInput placeholder="Search industry..." />
                                      <CommandList>
                                        <CommandEmpty>No industry found.</CommandEmpty>
                                        <CommandGroup>
                                          {INDUSTRY_OPTIONS.map((industry) => (
                                            <CommandItem
                                              value={industry}
                                              key={industry}
                                              onSelect={() => {
                                                form.setValue("industry", industry);
                                                setIsIndustryOpen(false);
                                              }}
                                            >
                                              <CheckIcon
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  industry === field.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                              {industry}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Budget Range Field */}
                          <FormField
                            control={form.control}
                            name="budgetRange"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="font-semibold flex items-center gap-2">
                                  Estimated Budget Range 
                                  <Badge variant="outline" className="font-normal">Required</Badge>
                                </FormLabel>
                                <Popover open={isBudgetOpen} onOpenChange={setIsBudgetOpen}>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                          "w-full justify-between",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value || `Select budget range`}
                                        <CheckIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command>
                                      <CommandInput placeholder="Search budget range..." />
                                      <CommandList>
                                        <CommandEmpty>No range found.</CommandEmpty>
                                        <CommandGroup>
                                          {getBudgetRanges(currencySymbol).map((range) => (
                                            <CommandItem
                                              value={range}
                                              key={range}
                                              onSelect={() => {
                                                form.setValue("budgetRange", range);
                                                setIsBudgetOpen(false);
                                              }}
                                            >
                                              <CheckIcon
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  range === field.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                              {range}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Contact Method Field */}
                          <FormField
                            control={form.control}
                            name="contactMethod"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="font-semibold flex items-center gap-2">
                                  Preferred Contact Method 
                                  <Badge variant="outline" className="font-normal">Required</Badge>
                                </FormLabel>
                                <FormControl>
                                  <RadioGroup 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                    className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                                  >
                                    {['Email', 'Phone', 'WhatsApp'].map((method) => (
                                      <div 
                                        key={method} 
                                        className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors"
                                      >
                                        <RadioGroupItem value={method} id={`contactMethod-${method}`} />
                                        <label 
                                          htmlFor={`contactMethod-${method}`}
                                          className="text-sm font-medium leading-none cursor-pointer flex-grow"
                                        >
                                          {method}
                                        </label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Project Description Field */}
                          <FormField
                            control={form.control}
                            name="projectDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold flex items-center gap-2">
                                  Project/Service Description 
                                  <Badge variant="outline" className="font-normal">Required</Badge>
                                </FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Provide a detailed description of your project or service requirements"
                                    className="min-h-[120px] resize-none"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Project Deadline Field */}
                          <FormField
                            control={form.control}
                            name="projectDeadline"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="font-semibold flex items-center gap-2">
                                  Estimated Project Timeline/Deadline 
                                  <Badge variant="outline" className="font-normal">Required</Badge>
                                </FormLabel>
                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(new Date(field.value), "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[calc(100vw-2rem)] sm:w-full p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value ? new Date(field.value) : undefined}
                                      onSelect={(date) => {
                                        field.onChange(date);
                                        setIsCalendarOpen(false);
                                      }}
                                      disabled={(date) => date < new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Project Details Step */}
                    {currentStep === 1 && (
                      <motion.div
                        key="project-details"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="grid gap-6">
                          {quoteFields.map((field) => (
                            <FormField
                              key={field.id}
                              control={form.control}
                              name={`dynamicFields.${field.id}`}
                              render={({ field: formField }) => (
                                <FormItem className="bg-card rounded-lg p-4 shadow-sm">
                                  <FormLabel className="font-semibold flex items-center">
                                    {field.label}
                                    {field.required && (
                                      <Badge variant="outline" className="ml-2 font-normal">Required</Badge>
                                    )}
                                  </FormLabel>

                                  {/* Text, Email, Phone inputs */}
                                  {(field.type === 'text' || field.type === 'email' || field.type === 'phone') && (
                                    <FormControl>
                                      <Input
                                        type={field.type}
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                        {...formField}
                                      />
                                    </FormControl>
                                  )}

                                  {/* Textarea */}
                                  {field.type === 'textarea' && (
                                    <FormControl>
                                      <Textarea
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                        className="min-h-[100px]"
                                        {...formField}
                                      />
                                    </FormControl>
                                  )}

                                  {/* Select */}
                                  {field.type === 'select' && field.options && (
                                    <Select
                                      onValueChange={formField.onChange}
                                      defaultValue={formField.value}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {field.options.map((option) => (
                                          <SelectItem key={option} value={option}>
                                            {option}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}

                                  {/* Multi-select */}
                                  {field.type === 'multi-select' && field.options && (
                                    <div className="grid grid-cols-2 gap-4">
                                      {field.options.map((option) => (
                                        <div key={option} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`${field.id}-${option}`}
                                            checked={(formField.value ?? []).includes(option)}
                                            onCheckedChange={(checked) => {
                                              const currentValue = formField.value ?? [];
                                              const newValue = checked
                                                ? [...currentValue, option]
                                                : currentValue.filter(v => v !== option);
                                              formField.onChange(newValue);
                                            }}
                                          />
                                          <label
                                            htmlFor={`${field.id}-${option}`}
                                            className="text-sm font-medium leading-none"
                                          >
                                            {option}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Radio */}
                                  {field.type === 'radio' && field.options && (
                                    <RadioGroup
                                      onValueChange={formField.onChange}
                                      defaultValue={formField.value}
                                      className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                                    >
                                      {field.options.map((option) => (
                                        <div key={option} className="flex items-center space-x-2 rounded-lg border p-3">
                                          <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                                          <label
                                            htmlFor={`${field.id}-${option}`}
                                            className="text-sm font-medium leading-none"
                                          >
                                            {option}
                                          </label>
                                        </div>
                                      ))}
                                    </RadioGroup>
                                  )}

                                  {/* Checkbox single */}
                                  {field.type === 'checkbox' && (
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={field.id}
                                        checked={formField.value}
                                        onCheckedChange={formField.onChange}
                                      />
                                      <label
                                        htmlFor={field.id}
                                        className="text-sm font-medium leading-none"
                                      >
                                        {field.label}
                                      </label>
                                    </div>
                                  )}

                                  {/* Number input */}
                                  {field.type === 'number' && (
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                        {...formField}
                                      />
                                    </FormControl>
                                  )}

                                  {/* Date input */}
                                  {field.type === 'date' && (
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !formField.value && "text-muted-foreground"
                                          )}
                                        >
                                          {formField.value ? (
                                            format(new Date(formField.value), "PPP")
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-full p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={formField.value ? new Date(formField.value) : undefined}
                                          onSelect={(date) => {
                                            formField.onChange(date);
                                          }}
                                          disabled={(date) => date < new Date()}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  )}

                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Review Step */}
                    {currentStep === 2 && (
                      <motion.div
                        key="review"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="rounded-lg border bg-card p-6">
                          <h2 className="text-xl font-semibold mb-4">Review Your Quote Request</h2>
                          
                          {/* Quote Details Review */}
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-medium mb-4">Quote Details</h3>
                              <div className="grid gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Industry/Sector</p>
                                    <p className="text-sm mt-1">{form.getValues("industry")}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Budget Range</p>
                                    <p className="text-sm mt-1">{form.getValues("budgetRange")}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Contact Method</p>
                                    <p className="text-sm mt-1">{form.getValues("contactMethod")}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Project Deadline</p>
                                    <p className="text-sm mt-1">
                                      {form.getValues("projectDeadline") 
                                        ? format(new Date(form.getValues("projectDeadline")), "PPP")
                                        : "Not specified"}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Project Description</p>
                                  <p className="text-sm mt-1 whitespace-pre-wrap">{form.getValues("projectDescription")}</p>
                                </div>
                              </div>
                            </div>

                            {/* Project Details Review */}
                            {quoteFields.length > 0 && (
                              <div>
                                <Separator className="my-6" />
                                <h3 className="text-lg font-medium mb-4">Project Details</h3>
                                <div className="grid gap-4">
                                  {quoteFields.map((field) => {
                                    const value = form.getValues(`dynamicFields.${field.id}`);
                                    return (
                                      <div key={field.id}>
                                        <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
                                        <p className="text-sm mt-1">
                                          {field.type === 'multi-select' 
                                            ? (Array.isArray(value) ? value.join(', ') : value)
                                            : field.type === 'date' 
                                            ? (value ? format(new Date(value), "PPP") : "Not specified")
                                            : field.type === 'checkbox'
                                            ? (value ? "Yes" : "No")
                                            : value || "Not specified"}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Review Notice */}
                            <div className="mt-6 p-4 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Please review all the information above carefully before submitting your quote request. 
                                You can go back to make changes if needed.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-6">
                    {currentStep > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Previous
                      </Button>
                    )}
                    
                    {currentStep < 2 ? (
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent any form submission
                          nextStep();
                        }}
                        className="flex items-center gap-2 ml-auto"
                      >
                        Next Step
                        <ArrowRightIcon className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="flex items-center gap-2 ml-auto"
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Quote Request
                            <ArrowRightIcon className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  );
};

export default ServiceQuoteRequest;