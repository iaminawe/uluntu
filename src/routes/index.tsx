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
const AboutUluntuPage = lazy(() => import('../pages/AboutUluntuPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const PrivacyPage = lazy(() => import('../pages/PrivacyPage'));
const TermsPage = lazy(() => import('../pages/TermsPage'));
const PartnersPage = lazy(() => import('../pages/PartnersPage'));
const TestPage = lazy(() => import('../pages/TestPage'));
const DebugPage = lazy(() => import('../pages/DebugPage'));
const TestFontsPage = lazy(() => import('../pages/TestFontsPage'));
const TestBlockEditor = lazy(() => import('../pages/TestBlockEditor'));
const DynamicPage = lazy(() => import('../pages/DynamicPage'));
const CheckAdminStatus = lazy(() => import('../pages/CheckAdminStatus'));
const SimplePageTest = lazy(() => import('../pages/SimplePageTest'));
const DebugAdminAccess = lazy(() => import('../pages/debug/DebugAdminAccess'));
const DirectAdminPages = lazy(() => import('../pages/admin/DirectAdminPages'));
const AdvancedPageEdit = lazy(() => import('../pages/admin/AdvancedPageEdit'));
const FeatureTestPage = lazy(() => import('../pages/debug/FeatureTestPage'));

// Lazy load page builder components
const EditablePageDisplay = lazy(() => import('../features/pages/components/EditablePageDisplay'));
const EnhancedPageEditor = lazy(() => import('../features/pages/components/EnhancedPageEditor'));

// Lazy load feature pages
const DirectoryPage = lazy(() => import('../pages/DirectoryPage'));
const CompaniesPage = lazy(() => import('../pages/CompaniesPage'));
const EventsPage = lazy(() => import('../pages/EventsPage'));
const NewsPage = lazy(() => import('../pages/NewsPage'));
const GroupsPage = lazy(() => import('../pages/GroupsPage'));
const ResourcesPage = lazy(() => import('../pages/ResourcesPage/index'));
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
const CurrentUserProfilePage = lazy(() => import('../pages/CurrentUserProfilePage'));
const AcceptInvitationPage = lazy(() => import('../pages/AcceptInvitationPage'));
const UserSettingsPage = lazy(() => import('../pages/UserSettingsPage'));
const NewsletterConfirmPage = lazy(() => import('../pages/NewsletterConfirmPage'));
const AdminSetupPage = lazy(() => import('../pages/AdminSetupPage'));
const UnifiedUsersDebug = lazy(() => import('../pages/admin/UnifiedUsersDebug'));
const SimpleUnifiedUsersPage = lazy(() => import('../pages/admin/SimpleUnifiedUsersPage'));

// Lazy load admin pages
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const UsersPage = lazy(() => import('../pages/admin/UsersPage'));
const UnifiedUsersPage = lazy(() => import('../pages/admin/UnifiedUsersPage'));
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
const AdminTopicsPage = lazy(() => import('../pages/admin/entities/TopicsPage'));
const AdminPagesPage = lazy(() => import('../pages/admin/entities/PagesPage'));
const PagesAdminTable = lazy(() => import('../pages/admin/PagesAdminTable'));
const PagesManagement = lazy(() => import('../pages/admin/PagesManagement'));
const QuickPageTest = lazy(() => import('../pages/admin/QuickPageTest'));
const AuditPage = lazy(() => import('../pages/admin/AuditPage'));
const ContactInboxPage = lazy(() => import('../pages/admin/ContactInboxPage'));
const ContactInboxDetailPage = lazy(() => import('../pages/admin/ContactInboxDetailPage'));
const PerformanceMetricsPage = lazy(() => import('../pages/admin/PerformanceMetricsPage'));

// Lazy load newsletter pages
const NewsletterDashboard = lazy(() => import('../pages/admin/newsletter/NewsletterDashboard'));
const CampaignManager = lazy(() => import('../pages/admin/newsletter/CampaignManager'));
const SubscriberManager = lazy(() => import('../pages/admin/newsletter/SubscriberManager'));
const AnalyticsDashboard = lazy(() => import('../pages/admin/newsletter/AnalyticsDashboard'));
const NewsletterEditor = lazy(() => import('../pages/admin/newsletter/NewsletterEditor'));
const TemplateManager = lazy(() => import('../pages/admin/newsletter/TemplateManager'));
const CampaignCalendar = lazy(() => import('../pages/admin/newsletter/CampaignCalendar'));
const UpdateNewsSlugs = lazy(() => import('../pages/admin/UpdateNewsSlugs'));
const UpdateCompanySlugs = lazy(() => import('../pages/admin/UpdateCompanySlugs'));
const ThemeConfigPage = lazy(() => import('../pages/admin/ThemeStatusPage'));
const FeaturesPage = lazy(() => import('../pages/admin/FeaturesPage'));
const MenuManagementPage = lazy(() => import('../pages/admin/MenuManagementPage'));
const EnhancedMenuManagementPage = lazy(() => import('../pages/admin/EnhancedMenuManagementPage'));
const MenuToggleDemo = lazy(() => import('../features/menu/components/MenuToggleDemo'));
const MenuManagementDebug = lazy(() => import('../pages/admin/MenuManagementDebug'));

// Lazy load topic pages
const TopicsIndexPage = lazy(() => import('../pages/TopicsIndexPage'));
const TopicLandingPage = lazy(() => import('../pages/TopicLandingPage'));
const ImprovedSettingsPage = lazy(() => import('../pages/admin/ImprovedSettingsPage'));
const EnhancedSettingsPage = lazy(() => import('../pages/admin/EnhancedSettingsPage'));


// Auth components
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import GroupGuard from '@/features/auth/components/GroupGuard';

// Feature toggle components
import { FeatureGate } from '@/utils/featureToggle';
import NotFoundError from '@/shared/components/ui/ErrorDisplay/NotFoundError';

// Lazy load onboarding
const OnboardingWizard = lazy(() => import('@/features/onboarding/components/OnboardingWizard'));

// Lazy load gallery pages
const GalleriesPage = lazy(() => import('../pages/GalleriesPage'));
const GalleryDetailPage = lazy(() => import('../pages/GalleryDetailPage'));
const MyGalleriesPage = lazy(() => import('../pages/MyGalleriesPage'));
const GalleryEditPage = lazy(() => import('../pages/GalleryEditPage'));

// Lazy load topics pages
const TopicsPage = lazy(() => import('../pages/TopicsPage'));
const TopicDetailPage = lazy(() => import('../pages/TopicDetailPage'));


// Lazy load messaging pages
const MessagesPage = lazy(() => import('../pages/MessagesPage'));
const TestConversations = lazy(() => import('../components/TestConversations'));

// Lazy load dashboard pages
const UserDashboard = lazy(() => import('../features/dashboard/components/UserDashboard'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: withSuspense(AboutPage) },
      { path: 'about-uluntu', element: withSuspense(AboutUluntuPage) },
      { path: 'contact', element: withSuspense(ContactPage) },
      { path: 'privacy', element: withSuspense(PrivacyPage) },
      { path: 'terms', element: withSuspense(TermsPage) },
      { path: 'partners', element: withSuspense(PartnersPage) },
      { path: 'test', element: withSuspense(TestPage) },
      { path: 'debug', element: withSuspense(DebugPage) },
      { path: 'test-fonts', element: withSuspense(TestFontsPage) },
      { path: 'test-editor', element: withSuspense(TestBlockEditor) },
      { path: 'check-admin', element: withSuspense(CheckAdminStatus) },
      { path: 'simple-page-test', element: withSuspense(SimplePageTest) },
      { path: 'debug-admin', element: withSuspense(DebugAdminAccess) },
      { path: 'direct-admin-pages', element: withSuspense(DirectAdminPages) },
      { path: 'pages/:id/advanced', element: withSuspense(AdvancedPageEdit) },
      { path: 'feature-test', element: withSuspense(FeatureTestPage) },
      
      // Dynamic pages (must come after specific routes)
      { path: 'pages/:slug', element: withSuspense(DynamicPage) },
      { path: 'directory', element: withSuspense(DirectoryPage) },
      { 
        path: 'directory/create', 
        element: <ProtectedRoute>{withSuspense(DirectoryEditPage)}</ProtectedRoute> 
      },
      { path: 'directory/:slug', element: withSuspense(DirectoryDetailPage) },
      { 
        path: 'directory/:slug/edit', 
        element: <ProtectedRoute>{withSuspense(DirectoryEditPage)}</ProtectedRoute> 
      },
      { path: 'companies', element: withSuspense(CompaniesPage) },
      { 
        path: 'companies/create', 
        element: <ProtectedRoute>{withSuspense(CompanyEditPage)}</ProtectedRoute> 
      },
      { path: 'companies/:slug', element: withSuspense(CompanyDetailPage) },
      { 
        path: 'companies/:slug/edit', 
        element: <ProtectedRoute>{withSuspense(CompanyEditPage)}</ProtectedRoute> 
      },
      { path: 'events', element: withSuspense(EventsPage) },
      { 
        path: 'events/create', 
        element: <ProtectedRoute>{withSuspense(EventEditPage)}</ProtectedRoute> 
      },
      { path: 'events/:slug', element: withSuspense(EventDetailPage) },
      { 
        path: 'events/:slug/edit', 
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
        path: 'groups/:slug', 
        element: <GroupGuard>{withSuspense(GroupDetailPage)}</GroupGuard> 
      },
      { 
        path: 'groups/:slug/edit', 
        element: <ProtectedRoute><GroupGuard>{withSuspense(GroupEditPage)}</GroupGuard></ProtectedRoute> 
      },
      { path: 'resources', element: withSuspense(ResourcesPage) },
      { 
        path: 'resources/create', 
        element: <ProtectedRoute>{withSuspense(ResourceEditPage)}</ProtectedRoute> 
      },
      { path: 'resources/:slug', element: withSuspense(ResourceDetailPage) },
      { 
        path: 'resources/:slug/edit', 
        element: <ProtectedRoute>{withSuspense(ResourceEditPage)}</ProtectedRoute> 
      },
      { path: 'marketplace', element: withSuspense(MarketplacePage) },
      { 
        path: 'marketplace/create', 
        element: <ProtectedRoute>{withSuspense(MarketplaceEditPage)}</ProtectedRoute> 
      },
      { path: 'marketplace/:slug', element: withSuspense(MarketplaceDetailPage) },
      { 
        path: 'marketplace/:slug/edit', 
        element: <ProtectedRoute>{withSuspense(MarketplaceEditPage)}</ProtectedRoute> 
      },
      { path: 'opportunities', element: withSuspense(OpportunitiesPage) },
      { 
        path: 'opportunities/create', 
        element: <ProtectedRoute>{withSuspense(OpportunityEditPage)}</ProtectedRoute> 
      },
      { path: 'opportunities/:slug', element: withSuspense(OpportunityDetailPage) },
      { 
        path: 'opportunities/:slug/edit', 
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
        path: 'profile', 
        element: <ProtectedRoute>{withSuspense(CurrentUserProfilePage)}</ProtectedRoute> 
      },
      { 
        path: 'profile/edit', 
        element: <ProtectedRoute>{withSuspense(ProfileEditPage)}</ProtectedRoute> 
      },
      { 
        path: 'settings', 
        element: <ProtectedRoute>{withSuspense(UserSettingsPage)}</ProtectedRoute> 
      },
      { 
        path: 'newsletter/confirm', 
        element: withSuspense(NewsletterConfirmPage)
      },
      {
        path: 'admin-setup',
        element: <ProtectedRoute>{withSuspense(AdminSetupPage)}</ProtectedRoute>
      },
      
      // Gallery routes
      { path: 'galleries', element: withSuspense(GalleriesPage) },
      { 
        path: 'galleries/create', 
        element: <ProtectedRoute>{withSuspense(GalleryEditPage)}</ProtectedRoute> 
      },
      { path: 'galleries/:slug', element: withSuspense(GalleryDetailPage) },
      { 
        path: 'galleries/:slug/edit', 
        element: <ProtectedRoute>{withSuspense(GalleryEditPage)}</ProtectedRoute> 
      },
      { 
        path: 'my-galleries', 
        element: <ProtectedRoute>{withSuspense(MyGalleriesPage)}</ProtectedRoute> 
      },
      {
        path: 'test-conversations',
        element: withSuspense(TestConversations)
      },
      
      // Topics routes
      { path: 'topics', element: withSuspense(TopicsIndexPage) },
      { path: 'topics/:slug', element: withSuspense(TopicLandingPage) },
      
      // Messaging routes
      { 
        path: 'messages', 
        element: (
          <FeatureGate feature="user_messaging" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(MessagesPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      
      // Dashboard routes
      { 
        path: 'dashboard', 
        element: <ProtectedRoute>{withSuspense(UserDashboard)}</ProtectedRoute> 
      },
      { 
        path: 'dashboard/:tab', 
        element: <ProtectedRoute>{withSuspense(UserDashboard)}</ProtectedRoute> 
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
      { path: 'users', element: withSuspense(SimpleUnifiedUsersPage) },
      { path: 'users-advanced', element: withSuspense(UnifiedUsersPage) },
      { path: 'users-debug', element: withSuspense(UnifiedUsersDebug) },
      { path: 'users-legacy', element: withSuspense(UsersPage) },
      { path: 'roles', element: withSuspense(RolesPage) },
      { path: 'features', element: withSuspense(FeaturesPage) },
      { path: 'menu-management', element: withSuspense(MenuManagementPage) },
      { path: 'menu-management-enhanced', element: withSuspense(EnhancedMenuManagementPage) },
      { path: 'menu-toggle-demo', element: withSuspense(MenuToggleDemo) },
      { path: 'menu-debug', element: withSuspense(MenuManagementDebug) },
      { path: 'moderation', element: withSuspense(ModerationPage) },
      { 
        path: 'settings', 
        element: withSuspense(EnhancedSettingsPage)
      },
      { 
        path: 'settings-v2', 
        element: withSuspense(EnhancedSettingsPage)
      },
      { 
        path: 'settings-old', 
        element: withSuspense(ImprovedSettingsPage)
      },
      { 
        path: 'theme', 
        element: withSuspense(ThemeConfigPage)
      },
      { path: 'contact-inbox', element: withSuspense(ContactInboxPage) },
      { path: 'contact-inbox/:id', element: withSuspense(ContactInboxDetailPage) },
      { path: 'audit', element: withSuspense(AuditPage) },
      { path: 'performance', element: withSuspense(PerformanceMetricsPage) },
      { path: 'entities/companies', element: withSuspense(AdminCompaniesPage) },
      { path: 'entities/groups', element: withSuspense(AdminGroupsPage) },
      { path: 'entities/events', element: withSuspense(AdminEventsPage) },
      { path: 'entities/news', element: withSuspense(AdminNewsPage) },
      { path: 'entities/resources', element: withSuspense(AdminResourcesPage) },
      { path: 'entities/marketplace', element: withSuspense(AdminMarketplacePage) },
      { path: 'entities/opportunities', element: withSuspense(AdminOpportunitiesPage) },
      { path: 'entities/topics', element: withSuspense(AdminTopicsPage) },
      { path: 'entities/pages', element: withSuspense(AdminPagesPage) },
      { path: 'pages', element: withSuspense(PagesAdminTable) },
      { path: 'pages/test', element: withSuspense(QuickPageTest) },
      { path: 'pages/new', element: withSuspense(EnhancedPageEditor) },
      { path: 'pages/:id/edit', element: withSuspense(EnhancedPageEditor) },
      { path: 'debug-admin', element: withSuspense(DebugAdminAccess) },
      { path: 'newsletter', element: withSuspense(NewsletterDashboard) },
      { path: 'newsletter/campaigns', element: withSuspense(CampaignManager) },
      { path: 'newsletter/campaigns/new', element: withSuspense(NewsletterEditor) },
      { path: 'newsletter/campaigns/:id/edit', element: withSuspense(NewsletterEditor) },
      { path: 'newsletter/campaigns/:id', element: withSuspense(NewsletterEditor) },
      { path: 'newsletter/calendar', element: withSuspense(CampaignCalendar) },
      { path: 'newsletter/templates', element: withSuspense(TemplateManager) },
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