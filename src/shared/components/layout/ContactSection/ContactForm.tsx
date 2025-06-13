import React, { useState } from 'react';
import { ContactFormProps, FormData, VolunteerType } from './types';

const ContactForm: React.FC<ContactFormProps> = ({ 
  volunteerOptions, 
  onSubmit,
  initialData
}) => {
  const [formData, setFormData] = useState<FormData>(initialData || {
    volunteerType: 'attend',
    name: '',
    email: '',
    message: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, volunteerType: e.target.value as VolunteerType });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form id="contact-form" onSubmit={handleSubmit}>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">I would like to:</h3>
        <div className="space-y-2">
          {volunteerOptions.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                type="radio"
                id={`volunteer-${option.value}`}
                name="volunteerType"
                value={option.value}
                checked={formData.volunteerType === option.value}
                onChange={handleRadioChange}
                className="h-4 w-4 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor={`volunteer-${option.value}`} className="ml-2 text-slate-700 dark:text-slate-300">
                {option.label}
              </label>
            </div>
          ))}
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
        />
      </div>
      
      <button
        type="submit"
        className="w-full px-4 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium"
      >
        Submit
      </button>
    </form>
  );
};

export default ContactForm;
