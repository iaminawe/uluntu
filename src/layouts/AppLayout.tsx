import { Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ContentManagementPanel } from '../components/ContentEditor';
import { useAuth } from '../contexts/AuthContext';

export default function AppLayout() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <div className="font-sans bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
        <Header />
        <main className="min-h-screen pt-16">
          <Outlet />
        </main>
        <Footer />
        <ContentManagementPanel />
      </div>
    </HelmetProvider>
  );
}