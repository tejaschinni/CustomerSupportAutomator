import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { TemplatePreview } from "./template-preview";
import { Pencil, Trash2, ArrowRight, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface TemplateCardProps {
  id: number;
  name: string;
  content: string;
  description?: string;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  headerColor?: string;
  accentColor?: string;
  updatedAt: string;
  logoUrl?: string;
}

export function TemplateCard({
  id,
  name,
  content,
  description,
  categoryId,
  categoryName,
  categoryColor,
  headerColor,
  accentColor,
  updatedAt,
  logoUrl,
}: TemplateCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  const handleEditClick = () => {
    navigate(`/templates/edit/${id}`);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiRequest("DELETE", `/api/templates/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: "Template deleted",
        description: "The template has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the template",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleUseClick = async () => {
    try {
      // Log template usage
      await apiRequest("POST", `/api/analytics/templates/${id}/use`, {});
      // Open preview
      setIsPreviewOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log template usage",
        variant: "destructive",
      });
    }
  };

  const getRelativeTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "some time ago";
    }
  };

  return (
    <>
      <Card className="template-card">
        <CardContent className="p-5 flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900 mb-1">{name}</h3>
            <Badge style={{ backgroundColor: categoryColor + "33", color: categoryColor }}>{categoryName}</Badge>
          </div>
          <p className="text-gray-600 text-sm mt-2 line-clamp-3">
            {description || content.substring(0, 100).replace(/{{.*?}}/g, '...')}
          </p>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            Last updated {getRelativeTime(updatedAt)}
          </div>
        </CardContent>
        <CardFooter className="border-t border-gray-200 bg-gray-50 px-5 py-3 flex justify-between">
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={handleEditClick}>
              <Pencil className="h-5 w-5" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDeleteClick}>
              <Trash2 className="h-5 w-5" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
          <Button variant="ghost" className="text-primary font-medium hover:text-blue-700 flex items-center" onClick={handleUseClick}>
            Use
            <ArrowRight className="h-5 w-5 ml-1" />
          </Button>
        </CardFooter>
      </Card>

      {/* Template Preview Dialog */}
      <TemplatePreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={{
          id,
          name,
          content,
          headerColor: headerColor || "#3B82F6",
          accentColor: accentColor || "#6366F1",
          logoUrl,
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
