'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Building, Users, Calendar, BookOpen, Newspaper, Send, X, Package, Briefcase, Monitor, Globe, MapPin, Clock, Heart } from 'lucide-react';

interface MemberGroup {
  id: number;
  name: string;
  role: 'admin' | 'member';
  joinedDate: string;
}

interface MemberEvent {
  id: number;
  title: string;
  date: string;
  presentation: string;
}

interface MemberResource {
  id: number;
  title: string;
  type: string;
  date: string;
}

interface MemberPost {
  id: number;
  title: string;
  group: {
    id: number;
    name: string;
  };
  date: string;
}

interface Organization {
  id: number;
  name: string;
  role: string;
}

interface MarketplaceListing {
  id: number;
  title: string;
  type: 'product' | 'service' | 'equipment';
  price: number;
  image: string;
  createdAt: string;
}

interface Member {
  id: number;
  name: string;
  title: string;
  bio: string;
  location: string;
  image: string;
  skills: string[];
  organizations: Organization[];
  groups: MemberGroup[];
  events: MemberEvent[];
  resources: MemberResource[];
  posts: MemberPost[];
  website?: string;
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  employmentStatus: 'full-time' | 'freelance' | 'looking' | 'not-looking';
  openToVolunteering: boolean;
  arrivedInNelson: string;
  marketplaceListings: MarketplaceListing[];
}

// This would come from your database
const SAMPLE_MEMBER: Member = {
  id: 1,
  name: 'Sarah Johnson',
  title: 'Full Stack Developer',
  bio: `Sarah is a passionate developer with over 8 years of experience in web development and AI. 
        She specializes in building scalable applications and mentoring junior developers. 
        Originally from Vancouver, she moved to Nelson to pursue a better work-life balance 
        and contribute to the growing tech community in the Kootenays.`,
  location: 'Nelson, BC',
  image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
  skills: ['React', 'Node.js', 'TypeScript', 'AI/ML', 'Python'],
  website: 'https://sarahjohnson.dev',
  socialLinks: [
    { platform: 'GitHub', url: 'https://github.com/sarahjohnson' },
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/sarahjohnson' },
    { platform: 'Twitter', url: 'https://twitter.com/sarahjohnson' }
  ],
  employmentStatus: 'freelance',
  openToVolunteering: true,
  arrivedInNelson: '2023-06-15',
  organizations: [
    {
      id: 1,
      name: 'Mountain Tech Solutions',
      role: 'Senior Developer'
    },
    {
      id: 2,
      name: 'Kootenay Code Club',
      role: 'Mentor'
    }
  ],
  groups: [
    {
      id: 1,
      name: 'AI Enthusiasts Kootenay',
      role: 'admin',
      joinedDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Kootenay Tech Organizers',
      role: 'member',
      joinedDate: '2024-02-01'
    }
  ],
  events: [
    {
      id: 1,
      title: 'AI Ethics Workshop',
      date: '2024-02-15',
      presentation: 'Ethics in Healthcare AI'
    },
    {
      id: 2,
      title: 'Machine Learning Study Group',
      date: '2024-03-01',
      presentation: 'Introduction to Neural Networks'
    }
  ],
  resources: [
    {
      id: 1,
      title: 'Getting Started with AI',
      type: 'document',
      date: '2024-02-01'
    },
    {
      id: 2,
      title: 'ML Workshop Slides',
      type: 'presentation',
      date: '2024-03-01'
    }
  ],
  posts: [
    {
      id: 1,
      title: 'Recap: February AI Ethics Workshop',
      group: {
        id: 1,
        name: 'AI Enthusiasts Kootenay'
      },
      date: '2024-02-16'
    }
  ],
  marketplaceListings: [
    {
      id: 1,
      title: 'Web Development Services',
      type: 'service',
      price: 75,
      image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
      createdAt: '2025-03-14'
    },
    {
      id: 2,
      title: 'MacBook Pro 16" M1 Pro',
      type: 'equipment',
      price: 2000,
      image: 'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg',
      createdAt: '2025-03-15'
    }
  ]
};

interface ContactModalProps {
  member: Member;
  onClose: () => void;
}

interface EditProfileModalProps {
  member: Member;
  onClose: () => void;
  onSave: (data: Partial<Member>) => void;
}

function EditProfileModal({ member, onClose, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: member.name,
    title: member.title,
    bio: member.bio,
    location: member.location,
    website: member.website || '',
    employmentStatus: member.employmentStatus,
    openToVolunteering: member.openToVolunteering,
    arrivedInNelson: member.arrivedInNelson,
    skills: member.skills.join(', ')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      skills: formData.skills.split(',').map(skill => skill.trim())
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Edit Profile</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Name
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
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="employmentStatus" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Employment Status
            </label>
            <select
              id="employmentStatus"
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="full-time">Full-time Employed</option>
              <option value="freelance">Freelancing</option>
              <option value="looking">Looking for Work</option>
              <option value="not-looking">Not Looking</option>
            </select>
          </div>

          <div>
            <label htmlFor="arrivedInNelson" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Arrived in Nelson
            </label>
            <input
              type="date"
              id="arrivedInNelson"
              name="arrivedInNelson"
              value={formData.arrivedInNelson}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="openToVolunteering"
              name="openToVolunteering"
              checked={formData.openToVolunteering}
              onChange={(e) => setFormData(prev => ({ ...prev, openToVolunteering: e.target.checked }))}
              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-300 dark:border-slate-600 rounded"
            />
            <label htmlFor="openToVolunteering" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              Open to Volunteering
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ContactModal({ member, onClose }: ContactModalProps) {
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
            Contact {member.name}
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

function getTypeIcon(type: 'product' | 'service' | 'equipment') {
  switch (type) {
    case 'product':
      return <Package className="h-5 w-5" />;
    case 'service':
      return <Briefcase className="h-5 w-5" />;
    case 'equipment':
      return <Monitor className="h-5 w-5" />;
  }
}

export default function MemberProfile({ memberId }: { memberId: string }) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // In a real app, you'd fetch the member data based on the memberId
  const member = SAMPLE_MEMBER;

  const handleProfileUpdate = (data: Partial<Member>) => {
    console.log('Profile updated:', data);
    // In a real app, you'd send this to your backend
  };

  return (
    <div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <div className="h-64 md:h-full">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="p-6 md:w-2/3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {member.name}
                </h1>
                <p className="text-orange-600 dark:text-orange-400 text-lg mb-2">
                  {member.title}
                </p>
                <div className="flex items-center text-slate-600 dark:text-slate-300 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  {member.location}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Edit Profile
                </button>
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
                {member.bio}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <Globe className="h-4 w-4 mr-2" />
                <a
                  href={member.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-600"
                >
                  {member.website?.replace(/^https?:\/\//, '')}
                </a>
              </div>
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <Clock className="h-4 w-4 mr-2" />
                In Nelson since {new Date(member.arrivedInNelson).toLocaleDateString()}
              </div>
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <Briefcase className="h-4 w-4 mr-2" />
                {member.employmentStatus === 'full-time' && 'Full-time Employed'}
                {member.employmentStatus === 'freelance' && 'Freelancing'}
                {member.employmentStatus === 'looking' && 'Looking for Work'}
                {member.employmentStatus === 'not-looking' && 'Not Looking for Work'}
              </div>
              {member.openToVolunteering && (
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <Heart className="h-4 w-4 mr-2" />
                  Open to Volunteering
                </div>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {member.socialLinks && (
              <div className="flex gap-4">
                {member.socialLinks.map(link => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Building className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Organizations</h2>
          </div>
          <div className="space-y-4">
            {member.organizations.map(org => (
              <div key={org.id} className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">{org.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{org.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Groups</h2>
          </div>
          <div className="space-y-4">
            {member.groups.map(group => (
              <div key={group.id} className="flex justify-between items-center">
                <div>
                  <Link
                    to={`/groups/${group.id}`}
                    className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                  >
                    {group.name}
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {group.role.charAt(0).toUpperCase() + group.role.slice(1)} • 
                    Joined {new Date(group.joinedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Presentations</h2>
          </div>
          <div className="space-y-4">
            {member.events.map(event => (
              <div key={event.id} className="flex justify-between items-center">
                <div>
                  <Link
                    to={`/events/${event.id}`}
                    className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                  >
                    {event.title}
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {event.presentation} • {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
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
            {member.resources.map(resource => (
              <div key={resource.id} className="flex justify-between items-center">
                <div>
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
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Package className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Marketplace Listings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {member.marketplaceListings.map(listing => (
              <Link
                key={listing.id}
                to={`/marketplace/${listing.id}`}
                className="bg-slate-50 dark:bg-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-48">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-slate-900 dark:text-white">{listing.title}</h3>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                      {getTypeIcon(listing.type)}
                    </div>
                  </div>
                  <p className="text-orange-600 dark:text-orange-400">
                    ${listing.price}{listing.type === 'service' && '/hr'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Listed {new Date(listing.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Newspaper className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Posts</h2>
          </div>
          <div className="space-y-4">
            {member.posts.map(post => (
              <div key={post.id} className="flex justify-between items-center">
                <div>
                  <Link
                    to={`/groups/${post.group.id}/posts/${post.id}`}
                    className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                  >
                    {post.title}
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Posted in {post.group.name} • {new Date(post.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showContactModal && (
        <ContactModal
          member={member}
          onClose={() => setShowContactModal(false)}
        />
      )}

      {showEditModal && (
        <EditProfileModal
          member={member}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
}