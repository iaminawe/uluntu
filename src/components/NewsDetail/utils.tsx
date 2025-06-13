import { Building, Users, Calendar } from 'lucide-react';
import { NewsAssociation } from '@/features/news/components/NewsDetail/types';

// Returns the appropriate icon for a news association type
export const getAssociationIcon = (type: NewsAssociation['type']) => {
  switch (type) {
    case 'company':
      return <Building className="h-4 w-4 mr-1" />;
    case 'group':
      return <Users className="h-4 w-4 mr-1" />;
    case 'event':
      return <Calendar className="h-4 w-4 mr-1" />;
    case 'member':
      return <Users className="h-4 w-4 mr-1" />;
    default:
      return null;
  }
};
