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

// Auth pages
import SignInPage from '../pages/SignInPage';
import SignUpPage from '../pages/SignUpPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import ProfileEditPage from '../pages/ProfileEditPage';
import AcceptInvitationPage from '../pages/AcceptInvitationPage';

// Admin pages
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import UsersPage from '../pages/admin/UsersPage';
import SettingsPage from '../pages/admin/SettingsPage';
import ModerationPage from '../pages/admin/ModerationPage';
import RolesPage from '../pages/admin/RolesPage';
import AdminMembersPage from '../pages/admin/entities/MembersPage';
import AuditPage from '../pages/admin/AuditPage';

// Error page
import ErrorPage from '../pages/ErrorPage';

// Auth components
import ProtectedRoute from '../components/auth/ProtectedRoute';
import GroupGuard from '../components/auth/GroupGuard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'directory', element: <DirectoryPage /> },
      { 
        path: 'directory/create', 
        element: <ProtectedRoute><DirectoryEditPage /></ProtectedRoute> 
      },
      { path: 'directory/:id', element: <DirectoryDetailPage /> },
      { 
        path: 'directory/:id/edit', 
        element: <ProtectedRoute><DirectoryEditPage /></ProtectedRoute> 
      },
      { path: 'companies', element: <CompaniesPage /> },
      { 
        path: 'companies/create', 
        element: <ProtectedRoute><CompanyEditPage /></ProtectedRoute> 
      },
      { path: 'companies/:id', element: <CompanyDetailPage /> },
      { 
        path: 'companies/:id/edit', 
        element: <ProtectedRoute><CompanyEditPage /></ProtectedRoute> 
      },
      { path: 'events', element: <EventsPage /> },
      { 
        path: 'events/create', 
        element: <ProtectedRoute><EventEditPage /></ProtectedRoute> 
      },
      { path: 'events/:id', element: <EventDetailPage /> },
      { 
        path: 'events/:id/edit', 
        element: <ProtectedRoute><EventEditPage /></ProtectedRoute> 
      },
      { path: 'news', element: <NewsPage /> },
      { 
        path: 'news/create', 
        element: <ProtectedRoute><NewsEditPage /></ProtectedRoute> 
      },
      { path: 'news/:id', element: <NewsDetailPage /> },
      { 
        path: 'news/:id/edit', 
        element: <ProtectedRoute><NewsEditPage /></ProtectedRoute> 
      },
      { path: 'groups', element: <GroupsPage /> },
      { 
        path: 'groups/create', 
        element: <ProtectedRoute><GroupEditPage /></ProtectedRoute> 
      },
      { 
        path: 'groups/:id', 
        element: <GroupGuard><GroupDetailPage /></GroupGuard> 
      },
      { 
        path: 'groups/:id/edit', 
        element: <ProtectedRoute><GroupGuard><GroupEditPage /></GroupGuard></ProtectedRoute> 
      },
      { path: 'resources', element: <ResourcesPage /> },
      { 
        path: 'resources/create', 
        element: <ProtectedRoute><ResourceEditPage /></ProtectedRoute> 
      },
      { path: 'resources/:id', element: <ResourceDetailPage /> },
      { 
        path: 'resources/:id/edit', 
        element: <ProtectedRoute><ResourceEditPage /></ProtectedRoute> 
      },
      { path: 'marketplace', element: <MarketplacePage /> },
      { 
        path: 'marketplace/create', 
        element: <ProtectedRoute><MarketplaceEditPage /></ProtectedRoute> 
      },
      { path: 'marketplace/:id', element: <MarketplaceDetailPage /> },
      { 
        path: 'marketplace/:id/edit', 
        element: <ProtectedRoute><MarketplaceEditPage /></ProtectedRoute> 
      },
      { path: 'opportunities', element: <OpportunitiesPage /> },
      { 
        path: 'opportunities/create', 
        element: <ProtectedRoute><OpportunityEditPage /></ProtectedRoute> 
      },
      { path: 'opportunities/:id', element: <OpportunityDetailPage /> },
      { 
        path: 'opportunities/:id/edit', 
        element: <ProtectedRoute><OpportunityEditPage /></ProtectedRoute> 
      },
      { path: 'signin', element: <SignInPage /> },
      { path: 'signup', element: <SignUpPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'unauthorized', element: <UnauthorizedPage /> },
      { path: 'invite/:token', element: <AcceptInvitationPage /> },
      { path: 'profile', element: <DirectoryDetailPage /> },
      { 
        path: 'profile/edit', 
        element: <ProtectedRoute><ProfileEditPage /></ProtectedRoute> 
      }
    ]
  },
  {
    path: '/admin',
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'roles', element: <RolesPage /> },
      { path: 'moderation', element: <ModerationPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'audit', element: <AuditPage /> },
      { path: 'entities/members', element: <AdminMembersPage /> }
    ]
  }
]);