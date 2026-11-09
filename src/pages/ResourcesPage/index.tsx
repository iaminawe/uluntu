import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import ResourcesList from '@/components/ResourcesList';
import PageHeader from './PageHeader';

// Resource type is already defined in the types.ts file

export default function ResourcesPage() {
  return (
    <>
      <Helmet>
        <title>Resources - Uluntu</title>
        <meta name="description" content="Resources and learning materials shared by the Uluntu community" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ResourcesList />
      </ContentContainer>
    </>
  );
}
