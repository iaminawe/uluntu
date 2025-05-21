import { Globe, Lock, EyeOff } from 'lucide-react';
import { VisibilityHelperProps } from './types';

export const getVisibilityIcon = (visibility?: 'open' | 'closed' | 'secret') => {
  if (!visibility) return null;
  
  switch (visibility) {
    case 'open':
      return <Globe className="h-5 w-5 text-green-500" aria-label="Open Group" />;
    case 'closed':
      return <Lock className="h-5 w-5 text-amber-500" aria-label="Closed Group - Request Required" />;
    case 'secret':
      return <EyeOff className="h-5 w-5 text-red-500" aria-label="Secret Group" />;
  }
};

export const getVisibilityLabel = (visibility?: 'open' | 'closed' | 'secret') => {
  if (!visibility) return '';
  
  switch (visibility) {
    case 'open':
      return 'Open Group';
    case 'closed':
      return 'Closed Group - Request Required';
    case 'secret':
      return 'Secret Group';
  }
};

const VisibilityHelper: React.FC<VisibilityHelperProps> = ({ 
  getVisibilityIcon, 
  getVisibilityLabel 
}) => {
  return null; // This is a utility component, it doesn't render anything
};

export default VisibilityHelper;
