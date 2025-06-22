import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import PrivacyPage from '../pages/PrivacyPage';
import TermsPage from '../pages/TermsPage';
import PartnersPage from '../pages/PartnersPage';
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
import SignInPage from '../pages/auth/SignInPage';
import SignUpPage from '../pages/auth/SignUpPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';
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
import AdminCompaniesPage from '../pages/admin/entities/CompaniesPage';
import AdminGroupsPage from '../pages/admin/entities/GroupsPage';
import AdminEventsPage from '../pages/admin/entities/EventsPage';
import AdminNewsPage from '../pages/admin/entities/NewsPage';
import AdminResourcesPage from '../pages/admin/entities/ResourcesPage';
import AdminMarketplacePage from '../pages/admin/entities/MarketplacePage';
import AdminOpportunitiesPage from '../pages/admin/entities/OpportunitiesPage';
import AdminPagesPage from '../pages/admin/entities/PagesPage';
import AuditPage from '../pages/admin/AuditPage';

// Newsletter pages
import NewsletterDashboard from '../pages/admin/newsletter/NewsletterDashboard';
import CampaignManager from '../pages/admin/newsletter/CampaignManager';
import SubscriberManager from '../pages/admin/newsletter/SubscriberManager';
import AnalyticsDashboard from '../pages/admin/newsletter/AnalyticsDashboard';
import UpdateNewsSlugs from '../pages/admin/UpdateNewsSlugs';

// Error page
import ErrorPage from '../pages/ErrorPage';

// Auth components
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import GroupGuard from '@/features/auth/components/GroupGuard';

// Onboarding pages
import OnboardingWizard from '@/features/onboarding/components/OnboardingWizard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'partners', element: <PartnersPage /> },
      { path: 'debug-data', element: <DebugDataPage /> },
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
      { path: 'news/:slug', element: <NewsDetailPage /> },
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
      { 
        path: 'onboarding/*', 
        element: <ProtectedRoute><OnboardingWizard /></ProtectedRoute> 
      },
      { path: 'invite/:token', element: <AcceptInvitationPage /> },
      { 
        path: 'profile/edit', 
        element: <ProtectedRoute><ProfileEditPage /></ProtectedRoute> 
      }
    ]
  },
  {
    path: '/admin',
    element: <ProtectedRoute requiredRoles={['superadmin', 'admin']}><AdminLayout /></ProtectedRoute>,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'roles', element: <RolesPage /> },
      { path: 'moderation', element: <ModerationPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'audit', element: <AuditPage /> },
      { path: 'entities/members', element: <AdminMembersPage /> },
      { path: 'entities/companies', element: <AdminCompaniesPage /> },
      { path: 'entities/groups', element: <AdminGroupsPage /> },
      { path: 'entities/events', element: <AdminEventsPage /> },
      { path: 'entities/news', element: <AdminNewsPage /> },
      { path: 'entities/resources', element: <AdminResourcesPage /> },
      { path: 'entities/marketplace', element: <AdminMarketplacePage /> },
      { path: 'entities/opportunities', element: <AdminOpportunitiesPage /> },
      { path: 'entities/pages', element: <AdminPagesPage /> },
      { path: 'newsletter', element: <NewsletterDashboard /> },
      { path: 'newsletter/campaigns', element: <CampaignManager /> },
      { path: 'newsletter/subscribers', element: <SubscriberManager /> },
      { path: 'newsletter/analytics', element: <AnalyticsDashboard /> },
      { path: 'utils/update-news-slugs', element: <UpdateNewsSlugs /> },
      // Temporary development access to slug updater
      { path: 'dev/update-news-slugs', element: <UpdateNewsSlugs /> }
    ]
  }
]);