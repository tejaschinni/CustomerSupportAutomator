import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/color-picker";

// Form schema
const brandSettingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  primaryColor: z.string().default("#3B82F6"),
  accentColor: z.string().default("#6366F1"),
  logoUrl: z.string().optional(),
});

type BrandSettingsValues = z.infer<typeof brandSettingsSchema>;

export function BrandSettings() {
  const { toast } = useToast();
  
  // Fetch existing brand settings
  const { data: brandSettings, isLoading } = useQuery({
    queryKey: ['/api/brand-settings'],
  });

  // Setup form with default values
  const form = useForm<BrandSettingsValues>({
    resolver: zodResolver(brandSettingsSchema),
    defaultValues: {
      companyName: "",
      primaryColor: "#3B82F6",
      accentColor: "#6366F1",
      logoUrl: "",
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (brandSettings) {
      form.reset({
        companyName: brandSettings.companyName,
        primaryColor: brandSettings.primaryColor,
        accentColor: brandSettings.accentColor,
        logoUrl: brandSettings.logoUrl || "",
      });
    }
  }, [brandSettings, form]);

  // Save settings mutation
  const mutation = useMutation({
    mutationFn: async (values: BrandSettingsValues) => {
      if (brandSettings?.id) {
        return apiRequest("PUT", `/api/brand-settings/${brandSettings.id}`, values);
      } else {
        return apiRequest("POST", "/api/brand-settings", values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand-settings'] });
      toast({
        title: "Settings saved",
        description: "Your brand settings have been updated"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save brand settings: ${error.message}`,
        variant: "destructive"
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: BrandSettingsValues) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading brand settings...</div>;
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>Brand Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/logo.png" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <FormControl>
                      <ColorPicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accentColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accent Color</FormLabel>
                    <FormControl>
                      <ColorPicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
        
        {brandSettings && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="p-4 border-b" 
                style={{ backgroundColor: `${form.watch("primaryColor")}20` }}
              >
                {form.watch("logoUrl") ? (
                  <img src={form.watch("logoUrl")} alt="Company Logo" className="h-8" />
                ) : (
                  <div className="font-medium" style={{ color: form.watch("primaryColor") }}>
                    {form.watch("companyName") || "Company Name"}
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-gray-700 mb-2">Sample email with your branding:</p>
                <p className="text-gray-800 mb-3">Hello John,</p>
                <p className="text-gray-800 mb-3">Thank you for your request. Here's the information you needed.</p>
                <p className="text-gray-800 mb-3">
                  <a 
                    href="#" 
                    className="font-medium" 
                    style={{ color: form.watch("accentColor") }}
                  >
                    Click here
                  </a> for more details.
                </p>
                <p className="text-gray-800 mb-1">Best regards,</p>
                <p className="text-gray-800 font-medium">{form.watch("companyName")} Team</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
