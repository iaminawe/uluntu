import { Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AppLayout() {
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
