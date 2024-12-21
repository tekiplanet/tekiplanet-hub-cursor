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

const businessProfileSchema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  business_email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Valid phone number required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  business_type: z.string().min(2, "Business type is required"),
  registration_number: z.string().optional(),
  tax_number: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().min(20, "Please provide a brief description of your business")
});

export function BusinessProfileForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof businessProfileSchema>>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      business_name: "",
      business_email: "",
      phone_number: "",
      address: "",
      city: "",
      state: "",
      country: "",
      business_type: "",
      registration_number: "",
      tax_number: "",
      website: "",
      description: ""
    },
  });

  async function onSubmit(values: z.infer<typeof businessProfileSchema>) {
    try {
      await businessService.createProfile(values);
      
      // Invalidate and refetch
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="business_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your business name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="business_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="business@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Add other form fields following the same pattern */}
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Business Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your business..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Create Business Profile
        </Button>
      </form>
    </Form>
  );
} 