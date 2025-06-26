import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppLayout from '../layouts/AppLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Wrap lazy-loaded components with Suspense
const withSuspense = (Component: React.LazyExoticComponent<any>) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  );
};

// Eagerly loaded pages (for better initial load)
import HomePage from '../pages/HomePage';
import SignInPage from '../pages/auth/SignInPage';
import SignUpPage from '../pages/auth/SignUpPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';
import ErrorPage from '../pages/ErrorPage';

// Lazy load main pages
const AboutPage = lazy(() => import('../pages/AboutPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const PrivacyPage = lazy(() => import('../pages/PrivacyPage'));
const TermsPage = lazy(() => import('../pages/TermsPage'));
const PartnersPage = lazy(() => import('../pages/PartnersPage'));
const TestPage = lazy(() => import('../pages/TestPage'));
const DebugPage = lazy(() => import('../pages/DebugPage'));

// Lazy load feature pages
const DirectoryPage = lazy(() => import('../pages/DirectoryPage'));
const CompaniesPage = lazy(() => import('../pages/CompaniesPage'));
const EventsPage = lazy(() => import('../pages/EventsPage'));
const NewsPage = lazy(() => import('../pages/NewsPage'));
const GroupsPage = lazy(() => import('../pages/GroupsPage'));
const ResourcesPage = lazy(() => import('../pages/ResourcesPage'));
const MarketplacePage = lazy(() => import('../pages/MarketplacePage'));
const OpportunitiesPage = lazy(() => import('../pages/OpportunitiesPage'));

// Lazy load detail pages
const DirectoryDetailPage = lazy(() => import('../pages/DirectoryDetailPage'));
const CompanyDetailPage = lazy(() => import('../pages/CompanyDetailPage'));
const EventDetailPage = lazy(() => import('../pages/EventDetailPage'));
const NewsDetailPage = lazy(() => import('../pages/NewsDetailPage'));
const GroupDetailPage = lazy(() => import('../pages/GroupDetailPage'));
const OpportunityDetailPage = lazy(() => import('../pages/OpportunityDetailPage'));
const ResourceDetailPage = lazy(() => import('../pages/ResourceDetailPage'));
const MarketplaceDetailPage = lazy(() => import('../pages/MarketplaceDetailPage'));

// Lazy load edit pages
const NewsEditPage = lazy(() => import('../pages/NewsEditPage'));
const EventEditPage = lazy(() => import('../pages/EventEditPage'));
const GroupEditPage = lazy(() => import('../pages/GroupEditPage'));
const CompanyEditPage = lazy(() => import('../pages/CompanyEditPage'));
const DirectoryEditPage = lazy(() => import('../pages/DirectoryEditPage'));
const OpportunityEditPage = lazy(() => import('../pages/OpportunityEditPage'));
const ResourceEditPage = lazy(() => import('../pages/ResourceEditPage'));
const MarketplaceEditPage = lazy(() => import('../pages/MarketplaceEditPage'));

// Lazy load auth pages
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const ProfileEditPage = lazy(() => import('../pages/ProfileEditPage'));
const AcceptInvitationPage = lazy(() => import('../pages/AcceptInvitationPage'));

// Lazy load admin pages
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const UsersPage = lazy(() => import('../pages/admin/UsersPage'));
const SettingsPage = lazy(() => import('../pages/admin/SettingsPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));
const ModerationPage = lazy(() => import('../pages/admin/ModerationPage'));
const RolesPage = lazy(() => import('../pages/admin/RolesPage'));
const AdminMembersPage = lazy(() => import('../pages/admin/entities/MembersPage'));
const AdminCompaniesPage = lazy(() => import('../pages/admin/entities/CompaniesPage'));
const AdminGroupsPage = lazy(() => import('../pages/admin/entities/GroupsPage'));
const AdminEventsPage = lazy(() => import('../pages/admin/entities/EventsPage'));
const AdminNewsPage = lazy(() => import('../pages/admin/entities/NewsPage'));
const AdminResourcesPage = lazy(() => import('../pages/admin/entities/ResourcesPage'));
const AdminMarketplacePage = lazy(() => import('../pages/admin/entities/MarketplacePage'));
const AdminOpportunitiesPage = lazy(() => import('../pages/admin/entities/OpportunitiesPage'));
const AdminPagesPage = lazy(() => import('../pages/admin/entities/PagesPage'));
const AuditPage = lazy(() => import('../pages/admin/AuditPage'));
const ContactInboxPage = lazy(() => import('../pages/admin/ContactInboxPage'));
const ContactInboxDetailPage = lazy(() => import('../pages/admin/ContactInboxDetailPage'));
const PerformanceMetricsPage = lazy(() => import('../pages/admin/PerformanceMetricsPage'));

// Lazy load newsletter pages
const NewsletterDashboard = lazy(() => import('../pages/admin/newsletter/NewsletterDashboard'));
const CampaignManager = lazy(() => import('../pages/admin/newsletter/CampaignManager'));
const SubscriberManager = lazy(() => import('../pages/admin/newsletter/SubscriberManager'));
const AnalyticsDashboard = lazy(() => import('../pages/admin/newsletter/AnalyticsDashboard'));
const UpdateNewsSlugs = lazy(() => import('../pages/admin/UpdateNewsSlugs'));
const UpdateCompanySlugs = lazy(() => import('../pages/admin/UpdateCompanySlugs'));


// Auth components
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import GroupGuard from '@/features/auth/components/GroupGuard';

// Lazy load onboarding
const OnboardingWizard = lazy(() => import('@/features/onboarding/components/OnboardingWizard'));

// Lazy load gallery pages
const GalleriesPage = lazy(() => import('../pages/GalleriesPage'));
const GalleryDetailPage = lazy(() => import('../pages/GalleryDetailPage'));
const MyGalleriesPage = lazy(() => import('../pages/MyGalleriesPage'));
const GalleryEditPage = lazy(() => import('../pages/GalleryEditPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: withSuspense(AboutPage) },
      { path: 'contact', element: withSuspense(ContactPage) },
      { path: 'privacy', element: withSuspense(PrivacyPage) },
      { path: 'terms', element: withSuspense(TermsPage) },
      { path: 'partners', element: withSuspense(PartnersPage) },
      { path: 'test', element: withSuspense(TestPage) },
      { path: 'debug', element: withSuspense(DebugPage) },
      { path: 'directory', element: withSuspense(DirectoryPage) },
      { 
        path: 'directory/create', 
        element: <ProtectedRoute>{withSuspense(DirectoryEditPage)}</ProtectedRoute> 
      },
      { path: 'directory/:id', element: withSuspense(DirectoryDetailPage) },
      { 
        path: 'directory/:id/edit', 
        element: <ProtectedRoute>{withSuspense(DirectoryEditPage)}</ProtectedRoute> 
      },
      { path: 'companies', element: withSuspense(CompaniesPage) },
      { 
        path: 'companies/create', 
        element: <ProtectedRoute>{withSuspense(CompanyEditPage)}</ProtectedRoute> 
      },
      { path: 'companies/:id', element: withSuspense(CompanyDetailPage) },
      { 
        path: 'companies/:id/edit', 
        element: <ProtectedRoute>{withSuspense(CompanyEditPage)}</ProtectedRoute> 
      },
      { path: 'events', element: withSuspense(EventsPage) },
      { 
        path: 'events/create', 
        element: <ProtectedRoute>{withSuspense(EventEditPage)}</ProtectedRoute> 
      },
      { path: 'events/:id', element: withSuspense(EventDetailPage) },
      { 
        path: 'events/:id/edit', 
        element: <ProtectedRoute>{withSuspense(EventEditPage)}</ProtectedRoute> 
      },
      { path: 'news', element: withSuspense(NewsPage) },
      { 
        path: 'news/create', 
        element: <ProtectedRoute>{withSuspense(NewsEditPage)}</ProtectedRoute> 
      },
      { path: 'news/:slug', element: withSuspense(NewsDetailPage) },
      { 
        path: 'news/:id/edit', 
        element: <ProtectedRoute>{withSuspense(NewsEditPage)}</ProtectedRoute> 
      },
      { path: 'groups', element: withSuspense(GroupsPage) },
      { 
        path: 'groups/create', 
        element: <ProtectedRoute>{withSuspense(GroupEditPage)}</ProtectedRoute> 
      },
      { 
        path: 'groups/:id', 
        element: <GroupGuard>{withSuspense(GroupDetailPage)}</GroupGuard> 
      },
      { 
        path: 'groups/:id/edit', 
        element: <ProtectedRoute><GroupGuard>{withSuspense(GroupEditPage)}</GroupGuard></ProtectedRoute> 
      },
      { path: 'resources', element: withSuspense(ResourcesPage) },
      { 
        path: 'resources/create', 
        element: <ProtectedRoute>{withSuspense(ResourceEditPage)}</ProtectedRoute> 
      },
      { path: 'resources/:id', element: withSuspense(ResourceDetailPage) },
      { 
        path: 'resources/:id/edit', 
        element: <ProtectedRoute>{withSuspense(ResourceEditPage)}</ProtectedRoute> 
      },
      { path: 'marketplace', element: withSuspense(MarketplacePage) },
      { 
        path: 'marketplace/create', 
        element: <ProtectedRoute>{withSuspense(MarketplaceEditPage)}</ProtectedRoute> 
      },
      { path: 'marketplace/:id', element: withSuspense(MarketplaceDetailPage) },
      { 
        path: 'marketplace/:id/edit', 
        element: <ProtectedRoute>{withSuspense(MarketplaceEditPage)}</ProtectedRoute> 
      },
      { path: 'opportunities', element: withSuspense(OpportunitiesPage) },
      { 
        path: 'opportunities/create', 
        element: <ProtectedRoute>{withSuspense(OpportunityEditPage)}</ProtectedRoute> 
      },
      { path: 'opportunities/:id', element: withSuspense(OpportunityDetailPage) },
      { 
        path: 'opportunities/:id/edit', 
        element: <ProtectedRoute>{withSuspense(OpportunityEditPage)}</ProtectedRoute> 
      },
      { path: 'signin', element: <SignInPage /> },
      { path: 'signup', element: <SignUpPage /> },
      { path: 'forgot-password', element: withSuspense(ForgotPasswordPage) },
      { path: 'reset-password', element: withSuspense(ResetPasswordPage) },
      { path: 'unauthorized', element: <UnauthorizedPage /> },
      { 
        path: 'onboarding/*', 
        element: <ProtectedRoute>{withSuspense(OnboardingWizard)}</ProtectedRoute> 
      },
      { path: 'invite/:token', element: withSuspense(AcceptInvitationPage) },
      { 
        path: 'profile/edit', 
        element: <ProtectedRoute>{withSuspense(ProfileEditPage)}</ProtectedRoute> 
      },
      
      // Gallery routes
      { path: 'galleries', element: withSuspense(GalleriesPage) },
      { 
        path: 'galleries/create', 
        element: <ProtectedRoute>{withSuspense(GalleryEditPage)}</ProtectedRoute> 
      },
      { path: 'galleries/:id', element: withSuspense(GalleryDetailPage) },
      { 
        path: 'galleries/:id/edit', 
        element: <ProtectedRoute>{withSuspense(GalleryEditPage)}</ProtectedRoute> 
      },
      { 
        path: 'my-galleries', 
        element: <ProtectedRoute>{withSuspense(MyGalleriesPage)}</ProtectedRoute> 
      }
    ]
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: withSuspense(AdminDashboard) },
      { path: 'users', element: withSuspense(UsersPage) },
      { path: 'roles', element: withSuspense(RolesPage) },
      { path: 'moderation', element: withSuspense(ModerationPage) },
      { 
        path: 'settings', 
        element: withSuspense(AdminSettingsPage)
      },
      { path: 'contact-inbox', element: withSuspense(ContactInboxPage) },
      { path: 'contact-inbox/:id', element: withSuspense(ContactInboxDetailPage) },
      { path: 'audit', element: withSuspense(AuditPage) },
      { path: 'performance', element: withSuspense(PerformanceMetricsPage) },
      { path: 'entities/members', element: withSuspense(AdminMembersPage) },
      { path: 'entities/companies', element: withSuspense(AdminCompaniesPage) },
      { path: 'entities/groups', element: withSuspense(AdminGroupsPage) },
      { path: 'entities/events', element: withSuspense(AdminEventsPage) },
      { path: 'entities/news', element: withSuspense(AdminNewsPage) },
      { path: 'entities/resources', element: withSuspense(AdminResourcesPage) },
      { path: 'entities/marketplace', element: withSuspense(AdminMarketplacePage) },
      { path: 'entities/opportunities', element: withSuspense(AdminOpportunitiesPage) },
      { path: 'entities/pages', element: withSuspense(AdminPagesPage) },
      { path: 'newsletter', element: withSuspense(NewsletterDashboard) },
      { path: 'newsletter/campaigns', element: withSuspense(CampaignManager) },
      { path: 'newsletter/subscribers', element: withSuspense(SubscriberManager) },
      { path: 'newsletter/analytics', element: withSuspense(AnalyticsDashboard) },
      { path: 'utils/update-news-slugs', element: withSuspense(UpdateNewsSlugs) },
      { path: 'utils/update-company-slugs', element: withSuspense(UpdateCompanySlugs) },
      // Temporary development access to slug updaters
      { path: 'dev/update-news-slugs', element: withSuspense(UpdateNewsSlugs) },
      { path: 'dev/update-company-slugs', element: withSuspense(UpdateCompanySlugs) }
    ]
  }
]);