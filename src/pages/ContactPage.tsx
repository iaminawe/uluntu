import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useContactSubmissions } from '@/hooks/useContactSubmissions';
import { useSetting } from '@/hooks/useSettings';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general' as 'general' | 'support' | 'partnership' | 'volunteer' | 'speaker_request'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { createSubmission } = useContactSubmissions({ autoFetch: false });

  // Get contact settings with fallbacks
  const { value: contactEmail } = useSetting('contact', 'contact_email', 'hello@nelsontech.community');
  const { value: contactPhone } = useSetting('contact', 'contact_phone', '+1 (250) 555-0123');
  const { value: contactAddress } = useSetting('contact', 'contact_address', 'Nelson, British Columbia\nCanada');
  const { value: organizationName } = useSetting('contact', 'organization_name', 'Nelson Tech Community');
  const { value: responseTimeGeneral } = useSetting('contact', 'response_time_general', '24-48 hours');
  const { value: responseTimePartnership } = useSetting('contact', 'response_time_partnership', '3-5 business days');
  const { value: responseTimeSupport } = useSetting('contact', 'response_time_support', '12-24 hours');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError(null);
    
    try {
      // Get client IP and user agent for analytics
      const clientInfo = {
        ip_address: undefined, // Would be set by server
        user_agent: navigator.userAgent
      };

      const result = await createSubmission({
        ...formData,
        metadata: {
          source: 'contact_page',
          referrer: document.referrer,
          ...clientInfo
        }
      });

      if (result.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '', type: 'general' });
      } else {
        setSubmitError(result.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Message Sent!
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Thank you for reaching out. We'll get back to you as soon as possible.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-orange-100">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
              Contact Information
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-orange-500 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Email
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {contactEmail}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-6 w-6 text-orange-500 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Phone
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {contactPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-orange-500 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Location
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {contactAddress?.split('\n').map((line: string, index: number) => (
                      <React.Fragment key={index}>
                        {line}
                        {index < contactAddress.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Response Times
              </h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>General Inquiries:</span>
                  <span>{responseTimeGeneral}</span>
                </div>
                <div className="flex justify-between">
                  <span>Partnership Requests:</span>
                  <span>{responseTimePartnership}</span>
                </div>
                <div className="flex justify-between">
                  <span>Technical Support:</span>
                  <span>{responseTimeSupport}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Display */}
                {submitError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-red-700 dark:text-red-300 text-sm">
                      {submitError}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Inquiry Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="volunteer">Volunteer Interest</option>
                    <option value="speaker_request">Speaking Request</option>
                  </select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Help us route your message to the right team
                  </p>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Send className="h-5 w-5 mr-2" />
                  )}
                  {isLoading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}