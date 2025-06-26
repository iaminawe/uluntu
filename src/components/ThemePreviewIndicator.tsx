import React from 'react';
import { useTheme } from '@/providers/EnhancedThemeProvider';
import { Eye } from 'lucide-react';

export const ThemePreviewIndicator: React.FC = () => {
  const { isPreviewMode, setPreviewTheme } = useTheme();

  if (!isPreviewMode) return null;

  return (
    <div className="theme-preview-indicator flex items-center gap-2">
      <Eye className="w-4 h-4" />
      <span>Preview Mode</span>
      <button
        onClick={() => setPreviewTheme(null)}
        className="ml-2 text-xs underline hover:no-underline"
      >
        Exit
      </button>
    </div>
  );
};