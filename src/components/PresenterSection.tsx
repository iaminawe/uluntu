import React from 'react';
import { presenters } from '../data/sampleData';

const PresenterSection: React.FC = () => {
  return (
    <section id="presenters" className="py-16 bg-slate-50 dark:bg-slate-800">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Featured Presenters</h2>
          <div className="w-20 h-1 bg-orange-500 mx-auto mb-6"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Meet our upcoming speakers who will share their knowledge and insights on AI.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {presenters.map((presenter, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-slate-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="h-56 overflow-hidden">
                <img 
                  src={presenter.image} 
                  alt={presenter.name} 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-1 dark:text-white">{presenter.name}</h3>
                <p className="text-orange-600 dark:text-orange-400 mb-3">{presenter.title}</p>
                <h4 className="font-semibold text-lg mb-2 dark:text-slate-200">"{presenter.talkTitle}"</h4>
                <p className="text-slate-600 dark:text-slate-300 mb-4">{presenter.bio}</p>
                <div className="flex space-x-3">
                  {presenter.socialLinks.map((link, i) => (
                    <a 
                      key={i} 
                      href={link.url} 
                      className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400"
                      aria-label={`${presenter.name}'s ${link.platform}`}
                    >
                      <span className="sr-only">{link.platform}</span>
                      {link.platform}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a 
            href="#contact" 
            className="inline-block px-6 py-3 bg-purple-500 text-white rounded-md font-medium hover:bg-purple-600 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              const contactForm = document.getElementById('contact-form');
              if (contactForm) {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                // Select the "Present" radio button
                const presentRadio = document.getElementById('volunteer-present') as HTMLInputElement;
                if (presentRadio) {
                  presentRadio.checked = true;
                }
              }
            }}
          >
            Apply to Present
          </a>
        </div>
      </div>
    </section>
  );
};

export default PresenterSection;