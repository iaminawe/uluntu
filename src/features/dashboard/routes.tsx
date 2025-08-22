import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardOverview } from './components/DashboardOverview';
import { MyContentPage } from './components/MyContentPage';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { ActivityPage } from './components/ActivityPage';
import { DashboardSettings } from './components/DashboardSettings';
import { ContentTypePages } from './components/ContentTypePages';

export const DashboardRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="content" element={<MyContentPage />} />
        <Route path="content/:type" element={<ContentTypePages />} />
        <Route path="analytics" element={<DashboardAnalytics />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="settings" element={<DashboardSettings />} />
      </Route>
    </Routes>
  );
};

export default DashboardRoutes;