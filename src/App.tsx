import Header from '@/shared/components/layout/Header';
import HeroSection from '@/shared/components/layout/HeroSection';
import AboutSection from '@/shared/components/layout/AboutSection';
import VotingSection from './components/VotingSection';
import ContactSection from '@/shared/components/layout/ContactSection';
import Footer from '@/shared/components/layout/Footer';
import DataSourceIndicator from '@/shared/components/ui/DataSourceIndicator';

function App() {
  return (
    <div className="font-sans bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <VotingSection />
        <ContactSection />
      </main>
      <Footer />
      <DataSourceIndicator />
    </div>
  );
}

export default App;