import { Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from '@/shared/components/layout/Header';
import Footer from '@/shared/components/layout/Footer';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useState, useEffect } from 'react';

export default function AppLayout() {
  const { loading } = useSession();
  const [showContent, setShowContent] = useState(false);

  // Show content after a short delay to prevent flash of loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Show minimal loading only for initial auth check
  if (loading && !showContent) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Show header skeleton immediately */}
        <div className="h-16 bg-gradient-to-r from-orange-500 to-red-500"></div>
        
        <div className="flex flex-col justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mb-3"></div>
          <p className="text-slate-600 dark:text-slate-300 text-sm">Initializing...</p>
        </div>
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
      </div>
    </HelmetProvider>
  );
}