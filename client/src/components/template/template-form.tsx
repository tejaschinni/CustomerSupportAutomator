import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplatePreview } from "./template-preview";
import { BrandSettings } from "@/components/brand/brand-settings";
import { ColorPicker } from "@/components/ui/color-picker";
import { VariablePicker } from "./variable-picker";

// Define type interfaces
interface Category {
  id: number;
  name: string;
  color: string;
}

interface Template {
  id: number;
  name: string;
  content: string;
  categoryId: number;
  headerColor?: string;
  accentColor?: string;
  logoUrl?: string;
  updatedAt: string;
}

interface BrandSetting {
  id: number;
  companyName: string;
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
}

// Form schema
const templateFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  headerColor: z.string().default("#3B82F6"),
  accentColor: z.string().default("#6366F1"),
  logoUrl: z.string().optional(),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface TemplateFormProps {
  id?: string;
}

export function TemplateForm({ id }: TemplateFormProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch template if editing
  const { data: template, isLoading: isLoadingTemplate } = useQuery<Template>({
    queryKey: ['/api/templates', id],
    enabled: !!id,
  });

  // Fetch brand settings for defaults
  const { data: brandSettings } = useQuery<BrandSetting>({
    queryKey: ['/api/brand-settings'],
  });

  // Setup form with default values
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      content: "",
      categoryId: "",
      headerColor: "#3B82F6",
      accentColor: "#6366F1",
      logoUrl: "",
    },
  });

  // Set form values when template data is loaded
  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        content: template.content,
        categoryId: template.categoryId.toString(),
        headerColor: template.headerColor || "#3B82F6",
        accentColor: template.accentColor || "#6366F1",
        logoUrl: template.logoUrl || "",
      });
    }
  }, [template, form]);

  // Create/Update template mutation
  const mutation = useMutation({
    mutationFn: async (values: TemplateFormValues) => {
      const payload = {
        ...values,
        categoryId: parseInt(values.categoryId),
      };

      if (id) {
        return apiRequest("PUT", `/api/templates/${id}`, payload);
      } else {
        return apiRequest("POST", "/api/templates", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: id ? "Template updated" : "Template created",
        description: id ? "Your template has been updated" : "Your new template has been created",
      });
      navigate("/templates");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${id ? "update" : "create"} template: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: TemplateFormValues) => {
    mutation.mutate(values);
  };

  // Handle preview
  const handlePreview = () => {
    setPreviewOpen(true);
  };

  // Insert variable into the content
  const insertVariable = (variable: string) => {
    const content = form.getValues("content");
    const textArea = document.getElementById("content") as HTMLTextAreaElement;
    const cursorPos = textArea?.selectionStart || content.length;
    const textBefore = content.substring(0, cursorPos);
    const textAfter = content.substring(cursorPos);
    
    const newContent = `${textBefore}{{${variable}}}${textAfter}`;
    form.setValue("content", newContent, { shouldValidate: true });
    
    // Set focus back to textarea and place cursor after inserted variable
    setTimeout(() => {
      textArea?.focus();
      const newPos = cursorPos + variable.length + 4; // +4 for {{ and }}
      textArea?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Use company defaults
  const useCompanyDefaults = () => {
    if (brandSettings) {
      form.setValue("headerColor", brandSettings.primaryColor, { shouldValidate: true });
      form.setValue("accentColor", brandSettings.accentColor, { shouldValidate: true });
      form.setValue("logoUrl", brandSettings.logoUrl || "", { shouldValidate: true });
    }
  };

  if (isLoadingTemplate && id) {
    return <div className="p-8 text-center">Loading template...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
            {/* Template name and category - responsive layout */}
            <div className="sm:col-span-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category: any) => (
                          <SelectItem 
                            key={category.id} 
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tabs section */}
            <div className="sm:col-span-6">
              <Tabs 
                defaultValue="content" 
                className="w-full"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Template Content</TabsTrigger>
                  <TabsTrigger value="branding">Brand Settings</TabsTrigger>
                </TabsList>
                
                {/* Content Tab */}
                <TabsContent value="content" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <FormLabel htmlFor="content" className="mb-0">Template Content</FormLabel>
                      <VariablePicker onSelectVariable={insertVariable} />
                    </div>

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              id="content"
                              {...field} 
                              className="min-h-[250px] md:min-h-[300px] font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-sm text-gray-500">
                      Use variables like {"{{customer.name}}"} to personalize responses.
                    </p>
                  </div>
                </TabsContent>
                
                {/* Branding Tab */}
                <TabsContent value="branding" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                      <h4 className="text-sm font-medium text-gray-900">Brand Settings</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-blue-700 xs:w-auto w-full justify-center"
                        onClick={useCompanyDefaults}
                      >
                        Use company defaults
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 xs:grid-cols-2 sm:grid-cols-6">
                      <div className="xs:col-span-1 sm:col-span-3">
                        <FormField
                          control={form.control}
                          name="headerColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Header Color</FormLabel>
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
                      <div className="xs:col-span-1 sm:col-span-3">
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
                      <div className="xs:col-span-2 sm:col-span-6">
                        <FormField
                          control={form.control}
                          name="logoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Logo URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://example.com/logo.png" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Form actions - responsive layout */}
          <div className="flex flex-col-reverse xs:flex-row xs:justify-between pt-5 gap-3 xs:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/templates")}
              className="w-full xs:w-auto"
            >
              Cancel
            </Button>
            <div className="flex flex-col xs:flex-row gap-2 xs:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                className="w-full xs:w-auto"
              >
                Preview
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full xs:w-auto"
              >
                {mutation.isPending ? "Saving..." : (id ? "Update Template" : "Create Template")}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Preview Modal */}
      <TemplatePreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={{
          id: id ? parseInt(id) : 0,
          name: form.getValues("name"),
          content: form.getValues("content"),
          headerColor: form.getValues("headerColor"),
          accentColor: form.getValues("accentColor"),
          logoUrl: form.getValues("logoUrl"),
        }}
      />
    </div>
  );
}
