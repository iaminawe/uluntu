import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  subtitle?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  children,
  icon: Icon,
  className = '',
  subtitle
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
            {Icon && <Icon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />}
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default MetricsCard;