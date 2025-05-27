'use client';

import { useState } from 'react';
import { Search, Briefcase, Heart, Coins, Users, Plus, X, Calendar, Mail, Building, Globe, Send } from 'lucide-react';

type OpportunityType = 'job' | 'volunteer' | 'funding' | 'community';

interface Opportunity {
  id: number;
  title: string;
  description: string;
  type: OpportunityType;
  organization: string;
  location: string;
  deadline?: string;
  commitment?: string;
  compensation?: string;
  fundingAmount?: string;
  contactEmail: string;
  postedAt: string;
  image?: string;
  postedBy: {
    name: string;
    image: string;
    title?: string;
    bio?: string;
  };
  website?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
}

const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  {
    id: 1,
    title: 'Senior Full Stack Developer',
    description: 'Looking for an experienced developer to join our growing team.',
    type: 'job',
    organization: 'Mountain Tech Solutions',
    location: 'Nelson, BC',
    compensation: '$90,000 - $120,000/year',
    deadline: '2025-04-30',
    contactEmail: 'jobs@mountaintech.com',
    website: 'https://mountaintech.com',
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
    postedAt: '2025-03-01',
    postedBy: {
      name: 'Sarah Johnson',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
      title: 'HR Manager',
      bio: 'Passionate about building great tech teams in the Kootenays.'
    },
    requirements: [
      '5+ years of full-stack development experience',
      'Strong knowledge of React and Node.js',
      'Experience with cloud platforms (AWS/GCP)',
      'Excellent communication skills'
    ],
    responsibilities: [
      'Lead development of new features',
      'Mentor junior developers',
      'Contribute to technical architecture decisions',
      'Collaborate with product and design teams'
    ],
    benefits: [
      'Flexible remote work options',
      'Extended health benefits',
      'Professional development budget',
      'Regular team events'
    ]
  },
  {
    id: 2,
    title: 'Tech Mentor for Youth Program',
    description: 'Volunteer to teach coding to local youth.',
    type: 'volunteer',
    organization: 'Kootenay Code Club',
    location: 'Rossland, BC',
    commitment: '4 hours/week',
    deadline: '2025-04-15',
    contactEmail: 'volunteer@kootcode.org',
    website: 'https://kootcode.org',
    image: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg',
    postedAt: '2025-03-02',
    postedBy: {
      name: 'Michael Chen',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      title: 'Program Coordinator',
      bio: 'Working to make tech education accessible to all youth in the Kootenays.'
    },
    requirements: [
      'Basic programming knowledge',
      'Experience working with youth',
      'Reliable and committed',
      'Police record check required'
    ],
    responsibilities: [
      'Lead weekly coding workshops',
      'Prepare lesson materials',
      'Provide mentorship to students',
      'Participate in program planning'
    ]
  },
  {
    id: 3,
    title: 'Community AI Project Funding',
    description: 'Seeking funding for an AI-powered local environmental monitoring system.',
    type: 'funding',
    organization: 'Kootenay Innovation Initiative',
    location: 'Cranbrook, BC',
    fundingAmount: '$25,000',
    deadline: '2025-05-01',
    contactEmail: 'grants@kii.org',
    website: 'https://kii.org',
    image: 'https://images.pexels.com/photos/3183132/pexels-photo-3183132.jpeg',
    postedAt: '2025-03-03',
    postedBy: {
      name: 'Emma Wilson',
      image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg',
      title: 'Project Lead',
      bio: 'Leading initiatives at the intersection of technology and environmental conservation.'
    },
    requirements: [
      'Clear project timeline and milestones',
      'Detailed budget breakdown',
      'Environmental impact assessment',
      'Community engagement plan'
    ]
  },
  {
    id: 4,
    title: 'Smart City Initiative Contributors',
    description: 'Looking for community members to participate in developing smart city solutions.',
    type: 'community',
    organization: 'Nelson Tech Coalition',
    location: 'Nelson, BC',
    commitment: 'Flexible',
    contactEmail: 'community@nelsontech.org',
    website: 'https://nelsontech.org',
    image: 'https://images.pexels.com/photos/3183190/pexels-photo-3183190.jpeg',
    postedAt: '2025-03-04',
    postedBy: {
      name: 'Alex Thompson',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
      title: 'Community Manager',
      bio: 'Building bridges between technology and community needs in Nelson.'
    },
    requirements: [
      'Interest in smart city technologies',
      'Commitment to community improvement',
      'Ability to attend monthly meetings',
      'Willingness to collaborate'
    ],
    responsibilities: [
      'Participate in planning sessions',
      'Contribute ideas and feedback',
      'Help with community outreach',
      'Test proposed solutions'
    ]
  }
];

interface OpportunityModalProps {
  onClose: () => void;
}

function OpportunityModal({ onClose }: OpportunityModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'job' as OpportunityType,
    organization: '',
    location: '',
    deadline: '',
    commitment: '',
    compensation: '',
    fundingAmount: '',
    contactEmail: '',
    website: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Opportunity submitted:', formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Post Opportunity</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields as before */}
        </form>
      </div>
    </div>
  );
}

interface OpportunityDetailsModalProps {
  opportunity: Opportunity;
  onClose: () => void;
}

function OpportunityDetailsModal({ opportunity, onClose }: OpportunityDetailsModalProps) {
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    resume: null as File | null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Application submitted:', formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{opportunity.title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {!showApplyForm ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {opportunity.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={opportunity.image}
                      alt={opportunity.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">About the Opportunity</h3>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{opportunity.description}</p>
                </div>
                {opportunity.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Requirements</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                      {opportunity.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300 mb-4">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {opportunity.organization}
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      {opportunity.location}
                    </div>
                    {opportunity.deadline && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                      </div>
                    )}
                    {opportunity.compensation && (
                      <div className="flex items-center">
                        <Coins className="h-4 w-4 mr-1" />
                        {opportunity.compensation}
                      </div>
                    )}
                    {opportunity.commitment && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {opportunity.commitment}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {opportunity.contactEmail}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowApplyForm(true)}
                    className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Apply Now
                  </button>
                </div>

                {opportunity.responsibilities && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Responsibilities</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                      {opportunity.responsibilities.map((resp, index) => (
                        <li key={index}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {opportunity.benefits && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Benefits</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                      {opportunity.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Posted By</h3>
                  <div className="flex items-start space-x-4">
                    <img
                      src={opportunity.postedBy.image}
                      alt={opportunity.postedBy.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">{opportunity.postedBy.name}</h4>
                      {opportunity.postedBy.title && (
                        <p className="text-slate-600 dark:text-slate-300">{opportunity.postedBy.title}</p>
                      )}
                      {opportunity.postedBy.bio && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{opportunity.postedBy.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
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
                  Email
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
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label htmlFor="coverLetter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Cover Letter
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Resume
                </label>
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Accepted formats: PDF, DOC, DOCX
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OpportunitiesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<OpportunityType | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const isLoggedIn = true;

  const getTypeIcon = (type: OpportunityType) => {
    switch (type) {
      case 'job':
        return <Briefcase className="h-5 w-5" />;
      case 'volunteer':
        return <Heart className="h-5 w-5" />;
      case 'funding':
        return <Coins className="h-5 w-5" />;
      case 'community':
        return <Users className="h-5 w-5" />;
    }
  };

  const types: OpportunityType[] = ['job', 'volunteer', 'funding', 'community'];

  const filteredOpportunities = SAMPLE_OPPORTUNITIES.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || opportunity.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="relative flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>
          {isLoggedIn && (
            <button
              onClick={() => setShowModal(true)}
              className="ml-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Post Opportunity
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${selectedType === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
          >
            All Types
          </button>
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center
                ${selectedType === type
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
            >
              {getTypeIcon(type)}
              <span className="ml-2 capitalize">{type}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOpportunities.map(opportunity => (
          <div
            key={opportunity.id}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedOpportunity(opportunity)}
          >
            {opportunity.image && (
              <div className="h-48 overflow-hidden">
                <img
                  src={opportunity.image}
                  alt={opportunity.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg mr-4">
                    {getTypeIcon(opportunity.type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                      {opportunity.title}
                    </h3>
                    <p className="text-orange-600 dark:text-orange-400 mb-1">
                      {opportunity.organization} • {opportunity.location}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">{opportunity.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {opportunity.compensation && (
                  <div className="text-slate-600 dark:text-slate-300">
                    <span className="font-medium">Compensation:</span> {opportunity.compensation}
                  </div>
                )}
                {opportunity.commitment && (
                  <div className="text-slate-600 dark:text-slate-300">
                    <span className="font-medium">Time Commitment:</span> {opportunity.commitment}
                  </div>
                )}
                {opportunity.fundingAmount && (
                  <div className="text-slate-600 dark:text-slate-300">
                    <span className="font-medium">Funding Amount:</span> {opportunity.fundingAmount}
                  </div>
                )}
                {opportunity.deadline && (
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium">Deadline:</span>{' '}
                    {new Date(opportunity.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={opportunity.postedBy.image}
                    alt={opportunity.postedBy.name}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Posted by {opportunity.postedBy.name} on {new Date(opportunity.postedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <OpportunityModal onClose={() => setShowModal(false)} />
      )}

      {selectedOpportunity && (
        <OpportunityDetailsModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
        />
      )}
    </div>
  );
}