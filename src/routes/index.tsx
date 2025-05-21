import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import HomePage from '../pages/HomePage';
import DirectoryPage from '../pages/DirectoryPage';
import CompaniesPage from '../pages/CompaniesPage';
import EventsPage from '../pages/EventsPage';
import NewsPage from '../pages/NewsPage';
import GroupsPage from '../pages/GroupsPage';
import ResourcesPage from '../pages/ResourcesPage';
import MarketplacePage from '../pages/MarketplacePage';
import OpportunitiesPage from '../pages/OpportunitiesPage';

// Detail pages
import DirectoryDetailPage from '../pages/DirectoryDetailPage';
import CompanyDetailPage from '../pages/CompanyDetailPage';
import EventDetailPage from '../pages/EventDetailPage';
import NewsDetailPage from '../pages/NewsDetailPage';
import GroupDetailPage from '../pages/GroupDetailPage';

// Edit pages
import NewsEditPage from '../pages/NewsEditPage';
import EventEditPage from '../pages/EventEditPage';
import GroupEditPage from '../pages/GroupEditPage';
import CompanyEditPage from '../pages/CompanyEditPage';
import DirectoryEditPage from '../pages/DirectoryEditPage';
import OpportunityEditPage from '../pages/OpportunityEditPage';
import OpportunityDetailPage from '../pages/OpportunityDetailPage';
import ResourceDetailPage from '../pages/ResourceDetailPage';
import ResourceEditPage from '../pages/ResourceEditPage';
import MarketplaceDetailPage from '../pages/MarketplaceDetailPage';
import MarketplaceEditPage from '../pages/MarketplaceEditPage';

// Error page
import ErrorPage from '../pages/ErrorPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'directory', element: <DirectoryPage /> },
      { path: 'directory/create', element: <DirectoryEditPage /> },
      { path: 'directory/:id', element: <DirectoryDetailPage /> },
      { path: 'directory/:id/edit', element: <DirectoryEditPage /> },
      { path: 'companies', element: <CompaniesPage /> },
      { path: 'companies/create', element: <CompanyEditPage /> },
      { path: 'companies/:id', element: <CompanyDetailPage /> },
      { path: 'companies/:id/edit', element: <CompanyEditPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/create', element: <EventEditPage /> },
      { path: 'events/:id', element: <EventDetailPage /> },
      { path: 'events/:id/edit', element: <EventEditPage /> },
      { path: 'news', element: <NewsPage /> },
      { path: 'news/create', element: <NewsEditPage /> },
      { path: 'news/:id', element: <NewsDetailPage /> },
      { path: 'news/:id/edit', element: <NewsEditPage /> },
      { path: 'groups', element: <GroupsPage /> },
      { path: 'groups/create', element: <GroupEditPage /> },
      { path: 'groups/:id', element: <GroupDetailPage /> },
      { path: 'groups/:id/edit', element: <GroupEditPage /> },
      { path: 'resources', element: <ResourcesPage /> },
      { path: 'resources/create', element: <ResourceEditPage /> },
      { path: 'resources/:id', element: <ResourceDetailPage /> },
      { path: 'resources/:id/edit', element: <ResourceEditPage /> },
      { path: 'marketplace', element: <MarketplacePage /> },
      { path: 'marketplace/create', element: <MarketplaceEditPage /> },
      { path: 'marketplace/:id', element: <MarketplaceDetailPage /> },
      { path: 'marketplace/:id/edit', element: <MarketplaceEditPage /> },
      { path: 'opportunities', element: <OpportunitiesPage /> },
      { path: 'opportunities/create', element: <OpportunityEditPage /> },
      { path: 'opportunities/:id', element: <OpportunityDetailPage /> },
      { path: 'opportunities/:id/edit', element: <OpportunityEditPage /> }
    ]
  }
]);
