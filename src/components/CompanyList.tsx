'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';

const SAMPLE_COMPANIES = [
  {
    id: 1,
    name: 'Mountain Tech Solutions',
    description: 'Custom software development and digital transformation services',
    location: 'Nelson, BC',
    industry: 'Software Development',
    size: '10-50 employees',
    image: 'https://images.pexels.com/photos/1181373/pexels-photo-1181373.jpeg',
    technologies: ['React', 'Node.js', 'AWS']
  },
  {
    id: 2,
    name: 'Design Forward',
    description: 'User experience design and digital product strategy',
    location: 'Rossland, BC',
    industry: 'Design',
    size: '1-10 employees',
    image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
    technologies: ['Figma', 'Adobe Creative Suite']
  },
  {
    id: 3,
    name: 'Data Insights Co',
    description: 'Data analytics and machine learning solutions',
    location: 'Cranbrook, BC',
    industry: 'Data Science',
    size: '10-50 employees',
    image: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg',
    technologies: ['Python', 'TensorFlow', 'SQL']
  }
];

export default function CompanyList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  const industries = ['all', ...new Set(SAMPLE_COMPANIES.map(company => company.industry))];

  const filteredCompanies = SAMPLE_COMPANIES.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry;
    
    return matchesSearch && matchesIndustry;
  });

  return (
    <div>
      <div className="mb-8">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        </div>

        <div className="flex flex-wrap gap-2">
          {industries.map(industry => (
            <button
              key={industry}
              onClick={() => setSelectedIndustry(industry)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${selectedIndustry === industry
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
            >
              {industry === 'all' ? 'All Industries' : industry}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredCompanies.map(company => (
          <Link
            key={company.id}
            href={`/companies/${company.id}`}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={company.image}
                alt={company.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {company.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                {company.description}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Location:</span>
                  <span className="ml-1 text-slate-700 dark:text-slate-300">{company.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Size:</span>
                  <span className="ml-1 text-slate-700 dark:text-slate-300">{company.size}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Industry:</span>
                  <span className="ml-1 text-slate-700 dark:text-slate-300">{company.industry}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {company.technologies.map(tech => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}