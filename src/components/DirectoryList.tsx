'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';

const SAMPLE_MEMBERS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Full Stack Developer',
    company: 'Mountain Tech Solutions',
    location: 'Nelson, BC',
    skills: ['React', 'Node.js', 'TypeScript'],
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'UX Designer',
    company: 'Design Forward',
    location: 'Rossland, BC',
    skills: ['UI/UX', 'Figma', 'User Research'],
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
  },
  {
    id: 3,
    name: 'Emma Wilson',
    title: 'Data Scientist',
    company: 'Data Insights Co',
    location: 'Cranbrook, BC',
    skills: ['Python', 'Machine Learning', 'Data Analysis'],
    image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg'
  }
];

export default function DirectoryList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Get unique skills from all members
  const allSkills = Array.from(
    new Set(SAMPLE_MEMBERS.flatMap(member => member.skills))
  ).sort();

  // Filter members based on search term and selected skills
  const filteredMembers = SAMPLE_MEMBERS.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkills = selectedSkills.length === 0 ||
      selectedSkills.some(skill => member.skills.includes(skill));
    
    return matchesSearch && matchesSkills;
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div>
      <div className="mb-8">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        </div>

        <div className="flex flex-wrap gap-2">
          {allSkills.map(skill => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${selectedSkills.includes(skill)
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <Link
            key={member.id}
            href={`/directory/${member.id}`}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                {member.name}
              </h3>
              <p className="text-orange-600 dark:text-orange-400 mb-2">{member.title}</p>
              <p className="text-slate-600 dark:text-slate-300 mb-2">{member.company}</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{member.location}</p>
              <div className="flex flex-wrap gap-2">
                {member.skills.map(skill => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm"
                  >
                    {skill}
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