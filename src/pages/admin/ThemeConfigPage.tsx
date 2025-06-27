import React from 'react';
import { ThemeEditor } from '@/components/admin/theme';
import { useTheme } from '@/providers/EnhancedThemeProvider';

const ThemeConfigPage: React.FC = () => {
  const { loading } = useTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Theme Configuration</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Customize the visual appearance of your site
        </p>
      </div>

      <ThemeEditor settings={[]} onRefresh={() => window.location.reload()} />
    </div>
  );
};

export default ThemeConfigPage;