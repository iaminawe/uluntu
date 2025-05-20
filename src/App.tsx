import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import PresenterSection from './components/PresenterSection';
import EventsSection from './components/EventsSection';
import VotingSection from './components/VotingSection';
import NewsletterSection from './components/NewsletterSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="font-sans bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <PresenterSection />
        <EventsSection />
        <VotingSection />
        <NewsletterSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;