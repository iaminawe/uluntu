import { Package, Briefcase, Monitor } from 'lucide-react';
import { ListingType } from '@/features/marketplace/components/MarketplaceItemDetail/types';

// Helper function to get the appropriate icon for a listing type
export const getTypeIcon = (type: ListingType) => {
  switch (type) {
    case 'product':
      return <Package className="h-5 w-5" />;
    case 'service':
      return <Briefcase className="h-5 w-5" />;
    case 'equipment':
      return <Monitor className="h-5 w-5" />;
  }
};
