import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays } from "date-fns";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7days");
  
  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/analytics', timeRange],
  });
  
  // Fetch templates for reference
  const { data: templates } = useQuery({
    queryKey: ['/api/templates'],
  });

  // Get template name by ID
  const getTemplateName = (id: number) => {
    const template = templates?.find((t: any) => t.id === id);
    return template?.name || `Template ${id}`;
  };

  // Format data for charts
  const formatTemplateUsage = () => {
    if (!analyticsData?.templateUsage) return [];
    return analyticsData.templateUsage.map((item: any) => ({
      ...item,
      name: getTemplateName(item.templateId),
    }));
  };

  const formatDailyResponses = () => {
    if (!analyticsData?.dailyResponses) return [];
    
    // Calculate date range based on selected timeRange
    let days;
    switch (timeRange) {
      case "30days": days = 30; break;
      case "90days": days = 90; break;
      default: days = 7;
    }
    
    // Fill in missing dates with 0 values
    const dateMap = new Map();
    for (let i = days; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      dateMap.set(date, 0);
    }
    
    // Add actual data
    analyticsData.dailyResponses.forEach((item: any) => {
      if (dateMap.has(item.date)) {
        dateMap.set(item.date, item.count);
      }
    });
    
    // Convert to array for chart
    return Array.from(dateMap).map(([date, count]) => ({
      date: format(new Date(date), 'MMM dd'),
      value: count,
    }));
  };

  const formatCategoryDistribution = () => {
    if (!analyticsData?.categoryDistribution) return [];
    return analyticsData.categoryDistribution;
  };

  // Define chart colors
  const COLORS = ['#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>
          <div className="w-48">
            <Select
              value={timeRange}
              onValueChange={setTimeRange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-8">Loading analytics data...</div>
        ) : !analyticsData ? (
          <div className="text-center py-8">No analytics data available</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Daily Responses Chart */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Daily Responses</CardTitle>
                <CardDescription>
                  Number of template responses generated per day
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={formatDailyResponses()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Responses"
                      stroke="#3B82F6"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Template Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Template Usage</CardTitle>
                <CardDescription>
                  Most frequently used templates
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatTemplateUsage()}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Usage Count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Template usage by category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatCategoryDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {formatCategoryDistribution().map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
