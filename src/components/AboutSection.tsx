import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">About the Collective</h2>
          <div className="w-20 h-1 bg-indigo-600 mx-auto mb-6"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-lg text-slate-700 mb-6">
              The Kootenay AI Collective is a community-driven initiative bringing together 
              individuals passionate about artificial intelligence in the Kootenay region. 
              We believe in fostering an inclusive environment where knowledge sharing, 
              ethical discussions, and human-centric approaches to AI are prioritized.
            </p>
            <p className="text-lg text-slate-700 mb-6">
              Our monthly meetups feature presentations from local experts, open discussions, 
              and networking opportunities for professionals, enthusiasts, and the curious. 
              Whether you're an AI expert or just starting to explore this field, you're welcome to join us!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <div className="flex items-center text-indigo-600">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <span className="font-medium">Inclusive Community</span>
              </div>
              <div className="flex items-center text-indigo-600">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <span className="font-medium">Knowledge Sharing</span>
              </div>
              <div className="flex items-center text-indigo-600">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971z" />
                  </svg>
                </div>
                <span className="font-medium">Ethical AI Focus</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-100 p-4 rounded-lg">
            <div className="aspect-video relative">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Google Map iframe placeholder */}
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2599.3982126901476!2d-117.2931246!3d49.4938073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x537cb6a0878e85b7%3A0xb2217c37b07c8c3a!2sNelson%20Innovation%20Centre!5e0!3m2!1sen!2sca!4v1696376047294!5m2!1sen!2sca" 
                  className="w-full h-full rounded-lg border-0" 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Nelson Innovation Centre Map"
                ></iframe>
              </div>
            </div>
            <div className="bg-white p-6 mt-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Location</h3>
              <p className="text-slate-700">
                Nelson Innovation Centre<br />
                Box 752 - 560 Baker Street<br />
                Nelson, BC V1L 4E5
              </p>
              <p className="mt-3 text-slate-600">
                Hosted by <a href="#" className="text-indigo-600 hover:underline">Kootenay Association for Science & Technology (KAST)</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;