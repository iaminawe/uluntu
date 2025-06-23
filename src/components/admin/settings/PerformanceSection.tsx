import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TrendingUp } from 'lucide-react';

interface PerformanceSectionProps {
  isLoading: boolean;
}

const PerformanceSection: React.FC<PerformanceSectionProps> = ({ isLoading }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Performance & Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Performance monitoring and analytics dashboard will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceSection;
