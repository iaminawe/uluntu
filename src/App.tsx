import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import VotingSection from './components/VotingSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import DataSourceIndicator from './components/DataSourceIndicator';

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