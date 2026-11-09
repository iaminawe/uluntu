import React, { useState } from 'react';

interface FormData {
  volunteerType: string;
  name: string;
  email: string;
  message: string;
}

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    volunteerType: 'attend',
    name: '',
    email: '',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, volunteerType: e.target.value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, you would submit to a backend service
    // For now, just simulate success
    setSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        volunteerType: 'attend',
        name: '',
        email: '',
        message: ''
      });
    }, 3000);
  };

  return (
    <section id="contact" className="py-16 bg-white dark:bg-slate-800">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Get Involved</h2>
          <div className="w-20 h-1 bg-orange-500 mx-auto mb-6"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Want to attend, present, or help organize our meetups? Let us know!
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Thank You!</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Your message has been received. We'll get back to you soon!
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form id="contact-form" onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">I would like to:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="volunteer-attend"
                        name="volunteerType"
                        value="attend"
                        checked={formData.volunteerType === 'attend'}
                        onChange={handleRadioChange}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                      />
                      <label htmlFor="volunteer-attend" className="ml-2 text-slate-700 dark:text-slate-300">
                        RSVP for the next meetup / Get notified
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="volunteer-present"
                        name="volunteerType"
                        value="present"
                        checked={formData.volunteerType === 'present'}
                        onChange={handleRadioChange}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                      />
                      <label htmlFor="volunteer-present" className="ml-2 text-slate-700 dark:text-slate-300">
                        Present a talk at an upcoming meetup
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="volunteer-organize"
                        name="volunteerType"
                        value="organize"
                        checked={formData.volunteerType === 'organize'}
                        onChange={handleRadioChange}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                      />
                      <label htmlFor="volunteer-organize" className="ml-2 text-slate-700 dark:text-slate-300">
                        Help organize events
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="volunteer-sponsor"
                        name="volunteerType"
                        value="sponsor"
                        checked={formData.volunteerType === 'sponsor'}
                        onChange={handleRadioChange}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                      />
                      <label htmlFor="volunteer-sponsor" className="ml-2 text-slate-700 dark:text-slate-300">
                        Sponsor a meetup
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder={formData.volunteerType === 'present' ? 'Tell us about your proposed talk' : 'How can we help you?'}
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium"
                >
                  Submit
                </button>
              </form>
            )}
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-600 text-center text-sm text-slate-600 dark:text-slate-400">
              <p>
                Uluntu AI Collective is supported by the{' '}
                <a href="#" className="text-orange-600 dark:text-orange-400 hover:underline">Uluntu Association for Science & Technology (KAST)</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;