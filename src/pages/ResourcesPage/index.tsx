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
        <meta name="description" content="Tech resources and learning materials for the Kootenay tech community" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ResourcesList />
      </ContentContainer>
    </>
  );
}
