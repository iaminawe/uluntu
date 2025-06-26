export { EmployeesSection } from './EmployeesSection';
export { EventsSection } from './EventsSection';
export { ResourcesSection } from './ResourcesSection';
export { GalleriesSection } from './GalleriesSection';

// Export a combined associations component if needed
import React from 'react';
import { EmployeesSection } from './EmployeesSection';
import { EventsSection } from './EventsSection';
import { ResourcesSection } from './ResourcesSection';
import { GalleriesSection } from './GalleriesSection';
import { useCompanyAssociations } from '@/hooks/useCompanyAssociationQueries';

interface CompanyAssociationsProps {
  companyId: string;
}

export function CompanyAssociations({ companyId }: CompanyAssociationsProps) {
  const associations = useCompanyAssociations(companyId);

  return (
    <div className="space-y-8">
      <EmployeesSection
        employees={associations.employees.data}
        isLoading={associations.employees.isLoading}
        error={associations.employees.error}
      />
      
      <EventsSection
        events={associations.events.data}
        isLoading={associations.events.isLoading}
        error={associations.events.error}
      />
      
      <ResourcesSection
        resources={associations.resources.data}
        isLoading={associations.resources.isLoading}
        error={associations.resources.error}
      />
      
      <GalleriesSection
        galleries={associations.galleries.data}
        isLoading={associations.galleries.isLoading}
        error={associations.galleries.error}
      />
    </div>
  );
}