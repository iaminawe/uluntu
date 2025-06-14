'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe, Users, Calendar, BookOpen, Newspaper, Mail, Send, X, Briefcase } from 'lucide-react';

interface CompanyMember {
  id: number;
  name: string;
  title: string;
  image: string;
  joinedDate: string;
}

interface CompanyEvent {
  id: number;
  title: string;
  date: string;
  type: string;
}

interface CompanyResource {
  id: number;
  title: string;
  type: string;
  date: string;
}

interface CompanyPost {
  id: number;
  title: string;
  date: string;
}

interface CompanyOpportunity {
  id: number;
  title: string;
  type: string;
  date: string;
}

interface Company {
  id: number;
  name: string;
  description: string;
  industry: string;
  size: string;
  founded: string;
  location: string;
  image: string;
  website: string;
  socialLinks: {
    platform: string;
    url: string;
  }[];
  technologies: string[];
  members: CompanyMember[];
  events: CompanyEvent[];
  resources: CompanyResource[];
  posts: CompanyPost[];
  opportunities: CompanyOpportunity[];
}

// This would come from your database
const SAMPLE_COMPANY: Company = {
  id: 1,
  name: 'Mountain Tech Solutions',
  description: 'Mountain Tech Solutions is a leading software development company based in Nelson, BC.\n\n' +
               'We specialize in creating custom software solutions for businesses of all sizes, with a ' +
               'focus on web applications, mobile development, and cloud infrastructure.\n\n' +
               'Our team of experienced developers and designers is passionate about delivering ' +
               'high-quality solutions that help our clients succeed in the digital world.',
  industry: 'Software Development',
  size: '10-50 employees',
  founded: '2018',
  location: 'Nelson, BC',
  image: 'https://images.pexels.com/photos/1181373/pexels-photo-1181373.jpeg',
  website: 'https://example.com',
  socialLinks: [
    { platform: 'LinkedIn', url: '#' },
    { platform: 'Twitter', url: '#' },
    { platform: 'GitHub', url: '#' }
  ],
  technologies: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
  members: [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Senior Developer',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
      joinedDate: '2020-01-15'
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'UX Designer',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      joinedDate: '2021-03-01'
    }
  ],
  events: [
    {
      id: 1,
      title: 'Tech Talk: Modern Web Development',
      date: '2024-04-15',
      type: 'Presentation'
    },
    {
      id: 2,
      title: 'Open House',
      date: '2024-05-01',
      type: 'Community Event'
    }
  ],
  resources: [
    {
      id: 1,
      title: 'Best Practices Guide',
      type: 'Document',
      date: '2024-02-15'
    },
    {
      id: 2,
      title: 'Tech Stack Overview',
      type: 'Presentation',
      date: '2024-03-01'
    }
  ],
  posts: [
    {
      id: 1,
      title: 'Introducing Our New Cloud Services',
      date: '2024-03-15'
    },
    {
      id: 2,
      title: 'Join Our Growing Team',
      date: '2024-03-01'
    }
  ],
  opportunities: [
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      type: 'Full-time',
      date: '2024-03-01'
    },
    {
      id: 2,
      title: 'Summer Internship Program',
      type: 'Internship',
      date: '2024-03-15'
    }
  ]
};

interface ContactModalProps {
  company: Company;
  onClose: () => void;
}

function ContactModal({ company, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Message sent:', formData);
    onClose();
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
            Contact {company.name}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
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
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
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
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CompanyProfile({ companyId: _companyId }: { companyId: string }) {
  const [showContactModal, setShowContactModal] = useState(false);
  
  // In a real app, you'd fetch the company data based on the companyId
  const company = SAMPLE_COMPANY;

  return (
    <div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <div className="h-64 md:h-full">
              <img
                src={company.image}
                alt={company.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="p-6 md:w-2/3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {company.name}
                </h1>
                <p className="text-orange-600 dark:text-orange-400 text-lg mb-2">
                  {company.industry}
                </p>
                <div className="flex items-center text-slate-600 dark:text-slate-300 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  {company.location}
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400"
                >
                  <Globe className="h-5 w-5" />
                </a>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">About</h2>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
                {company.description}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-slate-600 dark:text-slate-300">
                <span className="font-medium">Founded:</span> {company.founded}
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                <span className="font-medium">Size:</span> {company.size}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {company.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Team Members</h2>
          </div>
          <div className="space-y-4">
            {company.members.map(member => (
              <div key={member.id} className="flex items-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <Link
                    to={`/directory/${member.id}`}
                    className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                  >
                    {member.name}
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {member.title} • Joined {new Date(member.joinedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Events</h2>
          </div>
          <div className="space-y-4">
            {company.events.map(event => (
              <div key={event.id}>
                <Link
                  to={`/events/${event.id}`}
                  className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                >
                  {event.title}
                </Link>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {event.type} • {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <BookOpen className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Resources</h2>
          </div>
          <div className="space-y-4">
            {company.resources.map(resource => (
              <div key={resource.id}>
                <Link
                  to={`/resources/${resource.id}`}
                  className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                >
                  {resource.title}
                </Link>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {resource.type} • {new Date(resource.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Briefcase className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Opportunities</h2>
          </div>
          <div className="space-y-4">
            {company.opportunities.map(opportunity => (
              <div key={opportunity.id}>
                <Link
                  to={`/opportunities/${opportunity.id}`}
                  className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                >
                  {opportunity.title}
                </Link>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {opportunity.type} • Posted {new Date(opportunity.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Newspaper className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Latest News</h2>
          </div>
          <div className="space-y-4">
            {company.posts.map(post => (
              <div key={post.id}>
                <Link
                  to={`/posts/${post.id}`}
                  className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                >
                  {post.title}
                </Link>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Posted on {new Date(post.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showContactModal && (
        <ContactModal
          company={company}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
}