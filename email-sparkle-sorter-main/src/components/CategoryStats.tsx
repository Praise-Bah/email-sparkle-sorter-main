import React from 'react';
import { Category } from '@/utils/emailUtils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface CategoryStatsProps {
  distribution: Record<Category, number>;
}

// Category colors matching our CategoryBadge component
const CATEGORY_COLORS: Record<Category, string> = {
  'Sports': '#3b82f6', // blue-500
  'Entertainment': '#ec4899', // pink-500
  'Tech': '#8b5cf6', // violet-500
  'Finance': '#10b981', // emerald-500
  'Travel': '#f59e0b', // amber-500
  'Other': '#6b7280', // gray-500
};

const CategoryStats: React.FC<CategoryStatsProps> = ({ distribution }) => {
  // Convert distribution object to array for chart
  const data = Object.entries(distribution).map(([category, count]) => ({
    category,
    count
  })).sort((a, b) => b.count - a.count); // Sort by count descending
  
  // Calculate total emails
  const totalEmails = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { category, count } = payload[0].payload;
      const percentage = Math.round((count / totalEmails) * 100);
      
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{category}</p>
          <p className="text-sm">{count} emails ({percentage}%)</p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Categories</CardTitle>
        <CardDescription>Distribution of your emails by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
              <XAxis 
                dataKey="category" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#8884d8">
                {data.map((entry) => (
                  <Cell 
                    key={entry.category} 
                    fill={CATEGORY_COLORS[entry.category as Category]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-2">
          {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-xs">{category}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryStats;
