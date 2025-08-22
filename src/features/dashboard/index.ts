// Main exports for the dashboard feature
export * from './components';
export * from './types';
export * from './hooks/useDashboard';
export { dashboardApi } from './api/dashboardApi';

// Main dashboard component
export { default as UserDashboard } from './components/UserDashboard';

// Individual components for flexibility
export { default as DashboardTabs } from './components/DashboardTabs';
export { default as AnalyticsOverview } from './components/AnalyticsOverview';
export { default as AnalyticsWidget } from './components/AnalyticsWidget';
export { default as ActivityStream } from './components/ActivityStream';
export { default as ActivityItem } from './components/ActivityItem';
export { default as PhotoGalleryTab } from './components/PhotoGalleryTab';
export { default as EventsTab } from './components/EventsTab';
export { default as MessagesTab } from './components/MessagesTab';
export { default as GenericContentTab } from './components/GenericContentTab';
export { default as ContentCard } from './components/ContentCard';
export { default as QuickActions } from './components/QuickActions';