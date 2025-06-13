import { Globe, Lock, EyeOff } from 'lucide-react';

// Helper function to get the appropriate icon for a group's visibility
export const getVisibilityIcon = (visibility: 'open' | 'closed' | 'secret') => {
  switch (visibility) {
    case 'open':
      return <Globe className="h-4 w-4" />;
    case 'closed':
      return <Lock className="h-4 w-4" />;
    case 'secret':
      return <EyeOff className="h-4 w-4" />;
  }
};
