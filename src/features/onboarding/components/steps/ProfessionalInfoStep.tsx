import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfessionalInfo } from '../../store/onboardingSlice';
import type { OnboardingStepProps } from '../../types';

const ProfessionalInfoStep: React.FC<OnboardingStepProps> = ({ onNext }) => {
  const dispatch = useAppDispatch();
  const { professional } = useAppSelector((state) => state.onboarding.formData);
  const { user } = useAppSelector((state) => state.auth);
  
  const [bio, setBio] = useState(professional.bio || '');
  const [title, setTitle] = useState(professional.title || '');
  const [skills, setSkills] = useState<string[]>(professional.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState(professional.employmentStatus || 'employed');
  const [yearsOfExperience, setYearsOfExperience] = useState(professional.yearsOfExperience || 0);
  const [professionalGoals, setProfessionalGoals] = useState(professional.professionalGoals || '');

  // Auto-save on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(updateProfessionalInfo({
        bio,
        title,
        skills,
        employmentStatus: employmentStatus as any,
        yearsOfExperience,
        professionalGoals,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, bio, title, skills, employmentStatus, yearsOfExperience, professionalGoals]);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Tell us about your professional background
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          This helps other members understand your expertise and connect with you
        </p>
      </div>

      <div className="space-y-6">
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Job Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Full Stack Developer, Product Manager"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Professional Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Share a brief overview of your professional background, experience, and what you're passionate about..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                     resize-none"
          />
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {bio.length}/500 characters
          </p>
        </div>

        {/* Employment Status */}
        <div>
          <label htmlFor="employment" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Employment Status
          </label>
          <select
            id="employment"
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value as 'employed' | 'self_employed' | 'looking' | 'student' | 'retired' | 'other')}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="employed">Employed</option>
            <option value="self_employed">Self-Employed</option>
            <option value="looking">Looking for opportunities</option>
            <option value="student">Student</option>
            <option value="retired">Retired</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Years of Experience */}
        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Years of Experience
          </label>
          <select
            id="experience"
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value={0}>Less than 1 year</option>
            <option value={1}>1-2 years</option>
            <option value={3}>3-5 years</option>
            <option value={6}>6-10 years</option>
            <option value={11}>11-15 years</option>
            <option value={16}>15+ years</option>
          </select>
        </div>

        {/* Skills */}
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Skills & Expertise
          </label>
          <div className="flex gap-2 mb-2">
            <input
              id="skills"
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a skill and press Enter"
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                       focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium 
                       rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
          
          {/* Skill Tags */}
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 
                         text-orange-700 dark:text-orange-300 rounded-full text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 text-orange-500 hover:text-orange-700 dark:hover:text-orange-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Professional Goals */}
        <div>
          <label htmlFor="goals" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Professional Goals (Optional)
          </label>
          <textarea
            id="goals"
            value={professionalGoals}
            onChange={(e) => setProfessionalGoals(e.target.value)}
            rows={3}
            placeholder="What are you looking to achieve in the community? (e.g., find collaborators, learn new skills, mentor others)"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                     resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInfoStep;