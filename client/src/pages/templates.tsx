import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, FileText, MessageSquare, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TemplateCard } from "@/components/template/template-card";

export default function Templates() {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch templates
  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['/api/templates'],
  });

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Fetch analytics data
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['/api/analytics/summary'],
  });

  // Filter templates by search query and category
  const filteredTemplates = templates?.filter((template: any) => {
    const matchesSearch = 
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" || 
      template.categoryId === parseInt(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = () => {
    navigate("/templates/new");
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900">Templates</h1>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search templates..."
                className="w-full sm:w-64 pl-10 pr-4 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <Button onClick={handleCreateTemplate}>
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              New Template
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        {/* Stats Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
              title="Total Templates"
              value={isLoadingAnalytics ? "..." : analyticsData?.totalTemplates || 0}
              icon={<FileText className="h-6 w-6" />}
              iconColor="#3B82F6"
              iconBgColor="rgba(59, 130, 246, 0.1)"
            />
            <StatsCard 
              title="Responses This Week"
              value={isLoadingAnalytics ? "..." : analyticsData?.responsesThisWeek || 0}
              icon={<MessageSquare className="h-6 w-6" />}
              iconColor="#10B981"
              iconBgColor="rgba(16, 185, 129, 0.1)"
            />
            <StatsCard 
              title="Avg. Response Time"
              value={isLoadingAnalytics ? "..." : analyticsData?.avgResponseTime || "< 1 min"}
              icon={<Clock className="h-6 w-6" />}
              iconColor="#6366F1"
              iconBgColor="rgba(99, 102, 241, 0.1)"
            />
            <StatsCard 
              title="Popular Template"
              value={isLoadingAnalytics ? "..." : analyticsData?.popularTemplate || "None"}
              icon={<Flame className="h-6 w-6" />}
              iconColor="#F59E0B"
              iconBgColor="rgba(245, 158, 11, 0.1)"
            />
          </div>
        </div>

        {/* Template Categories / Filter */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Template Categories</h2>
          <div className="flex flex-wrap gap-3">
            <button
              className={`${
                selectedCategory === "all" ? "category-pill-active" : "category-pill-inactive"
              } category-pill`}
              onClick={() => handleCategoryClick("all")}
            >
              All Templates
            </button>
            
            {isLoadingCategories ? (
              <div className="py-2">Loading categories...</div>
            ) : (
              categories?.map((category: any) => (
                <button
                  key={category.id}
                  className={`${
                    selectedCategory === category.id.toString() 
                      ? "category-pill-active" 
                      : "category-pill-inactive"
                  } category-pill`}
                  style={
                    selectedCategory === category.id.toString() 
                      ? { backgroundColor: category.color, color: "white" } 
                      : {}
                  }
                  onClick={() => handleCategoryClick(category.id.toString())}
                >
                  {category.name}
                </button>
              ))
            )}
            
            <button 
              className="category-pill-inactive category-pill flex items-center justify-center"
              onClick={() => navigate("/branding")}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoadingTemplates ? (
            <div className="col-span-full py-8 text-center">Loading templates...</div>
          ) : filteredTemplates?.length === 0 ? (
            <div className="col-span-full py-8 text-center">
              <p className="text-gray-500">
                {searchQuery ? "No templates match your search" : "No templates found"}
              </p>
            </div>
          ) : (
            <>
              {filteredTemplates?.map((template: any) => (
                <TemplateCard 
                  key={template.id}
                  id={template.id}
                  name={template.name}
                  content={template.content}
                  categoryId={template.categoryId}
                  categoryName={template.category.name}
                  categoryColor={template.category.color}
                  headerColor={template.headerColor}
                  accentColor={template.accentColor}
                  logoUrl={template.logoUrl}
                  updatedAt={template.updatedAt}
                />
              ))}
              
              {/* Empty "Add New" Card */}
              <div 
                className="rounded-lg border-2 border-dashed border-gray-300 flex flex-col justify-center items-center p-6 hover:border-gray-400 transition-colors cursor-pointer"
                onClick={handleCreateTemplate}
              >
                <Plus className="h-12 w-12 text-gray-400" />
                <span className="mt-2 text-sm font-medium text-gray-900">Create new template</span>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
