import { Package, Briefcase, Monitor } from 'lucide-react';

// Helper function to get icon for marketplace listing type
export const getTypeIcon = (type: 'product' | 'service' | 'equipment') => {
  switch (type) {
    case 'product':
      return <Package className="h-4 w-4" />;
    case 'service':
      return <Briefcase className="h-4 w-4" />;
    case 'equipment':
      return <Monitor className="h-4 w-4" />;
  }
};
