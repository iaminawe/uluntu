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
const AIEditorDemo = lazy(() => import('../pages/AIEditorDemo'));
const TestSimpleEditor = lazy(() => import('../pages/TestSimpleEditor'));
const TestNoEditor = lazy(() => import('../pages/TestNoEditor'));
const WorkingAIEditor = lazy(() => import('../pages/WorkingAIEditor'));
const IsolatedAIEditor = lazy(() => import('../pages/IsolatedAIEditor'));
const FixedAIEditor = lazy(() => import('../pages/FixedAIEditor'));
const EditorFeatureDemo = lazy(() => import('../pages/EditorFeatureDemo'));
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
const MediaManagementPage = lazy(() => import('../pages/admin/MediaManagementPage'));
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
const DebugRoles = lazy(() => import('../pages/admin/DebugRoles'));

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
      { path: 'ai-editor', element: withSuspense(WorkingAIEditor) },
      { path: 'test-simple', element: withSuspense(TestSimpleEditor) },
      { path: 'test-no-editor', element: withSuspense(TestNoEditor) },
      { path: 'working-ai', element: withSuspense(WorkingAIEditor) },
      { path: 'isolated-ai', element: withSuspense(IsolatedAIEditor) },
      { path: 'fixed-ai', element: withSuspense(FixedAIEditor) },
      { path: 'editor-demo', element: withSuspense(EditorFeatureDemo) },
      { path: 'check-admin', element: withSuspense(CheckAdminStatus) },
      { path: 'simple-page-test', element: withSuspense(SimplePageTest) },
      { path: 'debug-admin', element: withSuspense(DebugAdminAccess) },
      { path: 'direct-admin-pages', element: withSuspense(DirectAdminPages) },
      { path: 'pages/:id/advanced', element: withSuspense(AdvancedPageEdit) },
      { path: 'feature-test', element: withSuspense(FeatureTestPage) },
      
      // Dynamic pages (must come after specific routes)
      { path: 'pages/:slug', element: withSuspense(DynamicPage) },
      {
        path: 'directory',
        element: (
          <FeatureGate feature="members_directory" fallback={<NotFoundError />}>
            {withSuspense(DirectoryPage)}
          </FeatureGate>
        )
      },
      {
        path: 'directory/create',
        element: (
          <FeatureGate feature="members_directory" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(DirectoryEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      {
        path: 'directory/:slug',
        element: (
          <FeatureGate feature="members_directory" fallback={<NotFoundError />}>
            {withSuspense(DirectoryDetailPage)}
          </FeatureGate>
        )
      },
      {
        path: 'directory/:slug/edit',
        element: (
          <FeatureGate feature="members_directory" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(DirectoryEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      {
        path: 'companies',
        element: (
          <FeatureGate feature="companies_listing" fallback={<NotFoundError />}>
            {withSuspense(CompaniesPage)}
          </FeatureGate>
        )
      },
      {
        path: 'companies/create',
        element: (
          <FeatureGate feature="companies_listing" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(CompanyEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      {
        path: 'companies/:slug',
        element: (
          <FeatureGate feature="companies_listing" fallback={<NotFoundError />}>
            {withSuspense(CompanyDetailPage)}
          </FeatureGate>
        )
      },
      {
        path: 'companies/:slug/edit',
        element: (
          <FeatureGate feature="companies_listing" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(CompanyEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      {
        path: 'events',
        element: (
          <FeatureGate feature="events_system" fallback={<NotFoundError />}>
            {withSuspense(EventsPage)}
          </FeatureGate>
        )
      },
      {
        path: 'events/create',
        element: (
          <FeatureGate feature="events_system" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(EventEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      {
        path: 'events/:slug',
        element: (
          <FeatureGate feature="events_system" fallback={<NotFoundError />}>
            {withSuspense(EventDetailPage)}
          </FeatureGate>
        )
      },
      {
        path: 'events/:slug/edit',
        element: (
          <FeatureGate feature="events_system" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(EventEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      {
        path: 'news',
        element: (
          <FeatureGate feature="news_blog" fallback={<NotFoundError />}>
            {withSuspense(NewsPage)}
          </FeatureGate>
        )
      },
      {
        path: 'news/create',
        element: (
          <FeatureGate feature="news_blog" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(NewsEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      {
        path: 'news/:slug',
        element: (
          <FeatureGate feature="news_blog" fallback={<NotFoundError />}>
            {withSuspense(NewsDetailPage)}
          </FeatureGate>
        )
      },
      {
        path: 'news/:id/edit',
        element: (
          <FeatureGate feature="news_blog" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(NewsEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      {
        path: 'groups',
        element: (
          <FeatureGate feature="groups_communities" fallback={<NotFoundError />}>
            {withSuspense(GroupsPage)}
          </FeatureGate>
        )
      },
      {
        path: 'groups/create',
        element: (
          <FeatureGate feature="groups_communities" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(GroupEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      {
        path: 'groups/:slug',
        element: (
          <FeatureGate feature="groups_communities" fallback={<NotFoundError />}>
            <GroupGuard>{withSuspense(GroupDetailPage)}</GroupGuard>
          </FeatureGate>
        )
      },
      {
        path: 'groups/:slug/edit',
        element: (
          <FeatureGate feature="groups_communities" fallback={<NotFoundError />}>
            <ProtectedRoute><GroupGuard>{withSuspense(GroupEditPage)}</GroupGuard></ProtectedRoute>
          </FeatureGate>
        )
      },
      {
        path: 'resources',
        element: (
          <FeatureGate feature="resources_library" fallback={<NotFoundError />}>
            {withSuspense(ResourcesPage)}
          </FeatureGate>
        )
      },
      {
        path: 'resources/create',
        element: (
          <FeatureGate feature="resources_library" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(ResourceEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      {
        path: 'resources/:slug',
        element: (
          <FeatureGate feature="resources_library" fallback={<NotFoundError />}>
            {withSuspense(ResourceDetailPage)}
          </FeatureGate>
        )
      },
      {
        path: 'resources/:slug/edit',
        element: (
          <FeatureGate feature="resources_library" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(ResourceEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      {
        path: 'marketplace',
        element: (
          <FeatureGate feature="marketplace" fallback={<NotFoundError />}>
            {withSuspense(MarketplacePage)}
          </FeatureGate>
        )
      },
      {
        path: 'marketplace/create',
        element: (
          <FeatureGate feature="marketplace" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(MarketplaceEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      {
        path: 'marketplace/:slug',
        element: (
          <FeatureGate feature="marketplace" fallback={<NotFoundError />}>
            {withSuspense(MarketplaceDetailPage)}
          </FeatureGate>
        )
      },
      {
        path: 'marketplace/:slug/edit',
        element: (
          <FeatureGate feature="marketplace" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(MarketplaceEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      {
        path: 'opportunities',
        element: (
          <FeatureGate feature="opportunities_board" fallback={<NotFoundError />}>
            {withSuspense(OpportunitiesPage)}
          </FeatureGate>
        )
      },
      {
        path: 'opportunities/create',
        element: (
          <FeatureGate feature="opportunities_board" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(OpportunityEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      {
        path: 'opportunities/:slug',
        element: (
          <FeatureGate feature="opportunities_board" fallback={<NotFoundError />}>
            {withSuspense(OpportunityDetailPage)}
          </FeatureGate>
        )
      },
      {
        path: 'opportunities/:slug/edit',
        element: (
          <FeatureGate feature="opportunities_board" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(OpportunityEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
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
      { 
        path: 'galleries', 
        element: (
          <FeatureGate feature="photo_galleries" fallback={<NotFoundError />}>
            {withSuspense(GalleriesPage)}
          </FeatureGate>
        )
      },
      { 
        path: 'galleries/create', 
        element: (
          <FeatureGate feature="photo_galleries" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(GalleryEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      { 
        path: 'galleries/:slug', 
        element: (
          <FeatureGate feature="photo_galleries" fallback={<NotFoundError />}>
            {withSuspense(GalleryDetailPage)}
          </FeatureGate>
        )
      },
      { 
        path: 'galleries/:slug/edit', 
        element: (
          <FeatureGate feature="photo_galleries" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(GalleryEditPage)}</ProtectedRoute>
          </FeatureGate>
        )
      },
      { 
        path: 'my-galleries', 
        element: (
          <FeatureGate feature="photo_galleries" fallback={<NotFoundError />}>
            <ProtectedRoute>{withSuspense(MyGalleriesPage)}</ProtectedRoute>
          </FeatureGate>
        )
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
      {
        path: 'users',
        element: (
          <FeatureGate feature="user_management" fallback={<NotFoundError />}>
            {withSuspense(SimpleUnifiedUsersPage)}
          </FeatureGate>
        )
      },
      {
        path: 'users-advanced',
        element: (
          <FeatureGate feature="user_management" fallback={<NotFoundError />}>
            {withSuspense(UnifiedUsersPage)}
          </FeatureGate>
        )
      },
      {
        path: 'users-debug',
        element: (
          <FeatureGate feature="user_management" fallback={<NotFoundError />}>
            {withSuspense(UnifiedUsersDebug)}
          </FeatureGate>
        )
      },
      {
        path: 'users-legacy',
        element: (
          <FeatureGate feature="user_management" fallback={<NotFoundError />}>
            {withSuspense(UsersPage)}
          </FeatureGate>
        )
      },
      {
        path: 'roles',
        element: (
          <FeatureGate feature="user_management" fallback={<NotFoundError />}>
            {withSuspense(RolesPage)}
          </FeatureGate>
        )
      },
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
      { 
        path: 'media', 
        element: (
          <FeatureGate feature="photo_galleries" fallback={<NotFoundError />}>
            {withSuspense(MediaManagementPage)}
          </FeatureGate>
        )
      },
      { path: 'debug-roles', element: withSuspense(DebugRoles) },
      { path: 'contact-inbox', element: withSuspense(ContactInboxPage) },
      { path: 'contact-inbox/:id', element: withSuspense(ContactInboxDetailPage) },
      {
        path: 'audit',
        element: (
          <FeatureGate feature="audit_logging" fallback={<NotFoundError />}>
            {withSuspense(AuditPage)}
          </FeatureGate>
        )
      },
      {
        path: 'performance',
        element: (
          <FeatureGate feature="analytics_dashboard" fallback={<NotFoundError />}>
            {withSuspense(PerformanceMetricsPage)}
          </FeatureGate>
        )
      },
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
      {
        path: 'newsletter',
        element: (
          <FeatureGate feature="newsletter_system" fallback={<NotFoundError />}>
            {withSuspense(NewsletterDashboard)}
          </FeatureGate>
        )
      },
      {
        path: 'newsletter/campaigns',
        element: (
          <FeatureGate feature="newsletter_system" fallback={<NotFoundError />}>
            {withSuspense(CampaignManager)}
          </FeatureGate>
        )
      },
      {
        path: 'newsletter/campaigns/new',
        element: (
          <FeatureGate feature="newsletter_system" fallback={<NotFoundError />}>
            {withSuspense(NewsletterEditor)}
          </FeatureGate>
        )
      },
      {
        path: 'newsletter/campaigns/:id/edit',
        element: (
          <FeatureGate feature="newsletter_system" fallback={<NotFoundError />}>
            {withSuspense(NewsletterEditor)}
          </FeatureGate>
        )
      },
      {
        path: 'newsletter/campaigns/:id',
        element: (
          <FeatureGate feature="newsletter_system" fallback={<NotFoundError />}>
            {withSuspense(NewsletterEditor)}
          </FeatureGate>
        )
      },
      {
        path: 'newsletter/calendar',
        element: (
          <FeatureGate feature="newsletter_system" fallback={<NotFoundError />}>
            {withSuspense(CampaignCalendar)}
          </FeatureGate>
        )
      },
      {
        path: 'newsletter/templates',
        element: (
          <FeatureGate feature="newsletter_system" fallback={<NotFoundError />}>
            {withSuspense(TemplateManager)}
          </FeatureGate>
        )
      },
      {
        path: 'newsletter/subscribers',
        element: (
          <FeatureGate feature="newsletter_system" fallback={<NotFoundError />}>
            {withSuspense(SubscriberManager)}
          </FeatureGate>
        )
      },
      {
        path: 'newsletter/analytics',
        element: (
          <FeatureGate feature="newsletter_system" fallback={<NotFoundError />}>
            {withSuspense(AnalyticsDashboard)}
          </FeatureGate>
        )
      },
      { path: 'utils/update-news-slugs', element: withSuspense(UpdateNewsSlugs) },
      { path: 'utils/update-company-slugs', element: withSuspense(UpdateCompanySlugs) },
      // Temporary development access to slug updaters
      { path: 'dev/update-news-slugs', element: withSuspense(UpdateNewsSlugs) },
      { path: 'dev/update-company-slugs', element: withSuspense(UpdateCompanySlugs) }
    ]
  }
]);