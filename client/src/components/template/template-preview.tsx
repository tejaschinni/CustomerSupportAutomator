import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TemplatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    id: number;
    name: string;
    content: string;
    headerColor: string;
    accentColor: string;
    logoUrl?: string;
  };
}

export function TemplatePreview({ isOpen, onClose, template }: TemplatePreviewProps) {
  const { toast } = useToast();
  const [renderedContent, setRenderedContent] = useState("");
  
  // Fetch variables to use for preview
  const { data: variables } = useQuery({
    queryKey: ['/api/variables'],
  });

  useEffect(() => {
    if (template && variables) {
      let content = template.content;
      
      // Replace variables with sample values
      variables.forEach((variable: any) => {
        const regex = new RegExp(`{{${variable.name}}}`, 'g');
        content = content.replace(regex, variable.exampleValue || `[${variable.name}]`);
      });
      
      // Replace any remaining variables with placeholders
      content = content.replace(/{{(.*?)}}/g, (match, p1) => `[${p1}]`);
      
      // Add line breaks
      content = content.replace(/\n/g, '<br>');
      
      setRenderedContent(content);
    }
  }, [template, variables]);

  const copyToClipboard = async () => {
    try {
      // Get clean text without HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = renderedContent;
      const textContent = tempDiv.textContent || tempDiv.innerText || "";
      
      await navigator.clipboard.writeText(textContent);
      
      // Log copy event
      if (template.id) {
        await apiRequest("POST", `/api/analytics/templates/${template.id}/copy`, {});
      }
      
      toast({
        title: "Copied to clipboard",
        description: "Response content has been copied to your clipboard"
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the content to clipboard",
        variant: "destructive"
      });
    }
  };

  const downloadAsPDF = async () => {
    try {
      if (template.id) {
        const response = await apiRequest("GET", `/api/templates/${template.id}/pdf`, {});
        
        // Handle PDF download from response
        toast({
          title: "Download initiated",
          description: "Your PDF is being generated and will download shortly"
        });
      }
    } catch (error) {
      toast({
        title: "Failed to download",
        description: "Could not generate PDF for download",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Response Preview</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="border border-gray-200 rounded-lg">
            <div 
              className="p-4 border-b border-gray-200 flex items-center"
              style={{ backgroundColor: `${template.headerColor}20` }}
            >
              {template.logoUrl ? (
                <img src={template.logoUrl} alt="Company Logo" className="h-10" />
              ) : (
                <div className="h-10 w-32 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                  Company Logo
                </div>
              )}
            </div>
            <div className="p-4">
              <div 
                className="text-gray-800"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm text-gray-600">Generated via ResponseCraft</span>
              <span className="text-sm text-gray-600">{format(new Date(), 'MMMM d, yyyy')}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-row sm:justify-between">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadAsPDF}>
              Download as PDF
            </Button>
            <Button onClick={copyToClipboard}>
              Copy to Clipboard
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
