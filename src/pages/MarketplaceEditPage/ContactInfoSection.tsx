import React from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';

interface ContactInfoSectionProps {
  formData: {
    contactEmail: string;
    contactPhone: string;
    contactMethod: 'email' | 'phone' | 'both' | '';
    showContactInfo: boolean;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isSubmitting: boolean;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ 
  formData, 
  handleChange, 
  isSubmitting 
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Contact Information
      </h2>
      
      <div className="space-y-4">
        {/* Show Contact Info Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showContactInfo"
            name="showContactInfo"
            checked={formData.showContactInfo}
            onChange={(e) => handleChange({
              ...e,
              target: {
                ...e.target,
                value: String(e.target.checked)
              }
            } as React.ChangeEvent<HTMLInputElement>)}
            disabled={isSubmitting}
            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
          />
          <label htmlFor="showContactInfo" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Display contact information to potential buyers
          </label>
        </div>

        {formData.showContactInfo && (
          <>
            {/* Contact Method */}
            <div>
              <label htmlFor="contactMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Preferred Contact Method
              </label>
              <select
                id="contactMethod"
                name="contactMethod"
                value={formData.contactMethod}
                onChange={handleChange}
                disabled={isSubmitting}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-slate-700 dark:text-white"
              >
                <option value="">Select contact method</option>
                <option value="email">Email Only</option>
                <option value="phone">Phone Only</option>
                <option value="both">Email & Phone</option>
              </select>
            </div>

            {/* Email Field */}
            {(formData.contactMethod === 'email' || formData.contactMethod === 'both') && (
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="your@email.com"
                    className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Phone Field */}
            {(formData.contactMethod === 'phone' || formData.contactMethod === 'both') && (
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="(250) 555-0123"
                    className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Help Text */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex">
            <MessageSquare className="h-5 w-5 text-blue-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your contact information will only be shown to interested buyers when your listing is published.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;