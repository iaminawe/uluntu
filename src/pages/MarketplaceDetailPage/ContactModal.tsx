import { useState } from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';
import { ContactModalProps } from './types';

const ContactModal: React.FC<ContactModalProps> = ({ listing, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // This would normally send the data to an API
      console.log('Message sent:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Contact Seller
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            disabled={isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Show contact information if available */}
        {(listing as any).showContactInfo && (listing.contactEmail || listing.contactPhone) ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-orange-500" />
                Contact Information
              </h4>
              
              {listing.contactEmail && listing.contactMethod && (listing.contactMethod === 'email' || listing.contactMethod === 'both') && (
                <div className="flex items-center mb-3">
                  <Mail className="h-5 w-5 mr-3 text-slate-400" />
                  <a 
                    href={`mailto:${listing.contactEmail}?subject=Inquiry about ${listing.title}`}
                    className="text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    {listing.contactEmail}
                  </a>
                </div>
              )}
              
              {listing.contactPhone && listing.contactMethod && (listing.contactMethod === 'phone' || listing.contactMethod === 'both') && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-slate-400" />
                  <a 
                    href={`tel:${listing.contactPhone}`}
                    className="text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    {listing.contactPhone}
                  </a>
                </div>
              )}
            </div>
            
            <div className="text-sm text-slate-600 dark:text-slate-300 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="font-medium mb-1">Tips for contacting sellers:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Be specific about what you're interested in</li>
                <li>Ask about availability and condition</li>
                <li>Suggest a meeting place if applicable</li>
                <li>Be respectful and professional</li>
              </ul>
            </div>
          </div>
        ) : submitSuccess ? (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-lg">
            <p>Message sent successfully! The seller will contact you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:text-white"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:text-white"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:text-white resize-none"
                  disabled={isSubmitting}
                  placeholder={`Hi, I'm interested in your ${listing.title}. Is it still available?`}
                ></textarea>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full px-4 py-2 bg-orange-500 text-white rounded-lg ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-600'
                  } transition-colors`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
