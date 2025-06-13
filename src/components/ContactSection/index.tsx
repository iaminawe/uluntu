import React, { useState } from 'react';
import { ContactSectionProps, FormData, VolunteerType } from '@/shared/components/layout/ContactSection/types';
import ContactForm from '@/shared/components/layout/ContactSection/ContactForm';
import SuccessMessage from '@/shared/components/layout/ContactSection/SuccessMessage';

// Default volunteer options
const DEFAULT_VOLUNTEER_OPTIONS = [
  {
    value: 'attend' as VolunteerType,
    label: 'RSVP for the next meetup / Get notified'
  },
  {
    value: 'present' as VolunteerType,
    label: 'Present at a meetup'
  },
  {
    value: 'organize' as VolunteerType,
    label: 'Help organize events'
  },
  {
    value: 'sponsor' as VolunteerType,
    label: 'Sponsor a meetup'
  }
];

const ContactSection: React.FC<ContactSectionProps> = ({
  title = "Get Involved",
  description = "Want to attend, present, or help organize our meetups? Let us know!",
  volunteerOptions = DEFAULT_VOLUNTEER_OPTIONS,
  onSubmit
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    volunteerType: 'attend',
    name: '',
    email: '',
    message: ''
  });
  
  const handleSubmit = async (data: FormData) => {
    // Store the form data
    setFormData(data);
    
    // Call the custom onSubmit handler if provided
    if (onSubmit) {
      await onSubmit(data);
    }
    
    // Set the form to submitted state
    setSubmitted(true);
    
    // If no custom onSubmit, reset the form after 3 seconds
    if (!onSubmit) {
      setTimeout(() => {
        handleReset();
      }, 3000);
    }
  };
  
  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      volunteerType: 'attend',
      name: '',
      email: '',
      message: ''
    });
  };

  return (
    <section id="contact" className="py-16 bg-white dark:bg-slate-800">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
          <div className="w-20 h-1 bg-orange-500 mx-auto mb-6"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-8">
            {submitted ? (
              <SuccessMessage onReset={handleReset} />
            ) : (
              <ContactForm 
                volunteerOptions={volunteerOptions}
                onSubmit={handleSubmit}
                initialData={formData}
              />
            )}
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-600 text-center text-sm text-slate-600 dark:text-slate-400">
              <p>
                Kootenay AI Collective is supported by the{' '}
                <a href="#" className="text-orange-600 dark:text-orange-400 hover:underline">Kootenay Association for Science & Technology (KAST)</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
