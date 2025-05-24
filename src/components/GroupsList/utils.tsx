import { Globe, Lock, EyeOff } from 'lucide-react';
import { GroupVisibility } from './types';

// Get the appropriate icon for a group's visibility level
export const getVisibilityIcon = (visibility: GroupVisibility) => {
  switch (visibility) {
    case 'open':
      return <Globe className="h-5 w-5 text-green-500" />;
    case 'closed':
      return <Lock className="h-5 w-5 text-amber-500" />;
    case 'secret':
      return <EyeOff className="h-5 w-5 text-red-500" />;
  }
};

// Get a readable label for a group's visibility level
export const getVisibilityLabel = (visibility: GroupVisibility) => {
  switch (visibility) {
    case 'open':
      return 'Open';
    case 'closed':
      return 'Closed';
    case 'secret':
      return 'Secret';
  }
};
