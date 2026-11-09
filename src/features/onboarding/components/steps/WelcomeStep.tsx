import React from 'react';
import { Shield, Users, Briefcase, Calendar, Heart } from 'lucide-react';
import type { OnboardingStepProps } from '../../types';

const WelcomeStep: React.FC<OnboardingStepProps> = ({ onNext }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Welcome to the Uluntu Community! 🎉
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          We're excited to have you join our vibrant community of neighbours, 
          makers, and organizers on Uluntu.
        </p>
      </div>

      {/* What to expect */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          What's next?
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This quick setup will take about 5-10 minutes and help you:
        </p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-orange-600 dark:text-orange-400 text-sm">1</span>
            </div>
            <span className="text-slate-700 dark:text-slate-300">
              Create your professional profile to showcase your skills and experience
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-orange-600 dark:text-orange-400 text-sm">2</span>
            </div>
            <span className="text-slate-700 dark:text-slate-300">
              Connect with local companies and professionals
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-orange-600 dark:text-orange-400 text-sm">3</span>
            </div>
            <span className="text-slate-700 dark:text-slate-300">
              Control your privacy settings and choose what to share
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-orange-600 dark:text-orange-400 text-sm">4</span>
            </div>
            <span className="text-slate-700 dark:text-slate-300">
              Discover groups, events, and opportunities that match your interests
            </span>
          </li>
        </ul>
      </div>

      {/* Privacy assurance */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
              Your Privacy is Important
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Your profile is private by default. You control what information is shared and 
              when to make your profile visible in the directory. You can change these settings 
              at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Community benefits */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <Users className="w-8 h-8 text-orange-500 mb-2" />
          <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
            Connect & Network
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Meet fellow members and build meaningful connections
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <Briefcase className="w-8 h-8 text-orange-500 mb-2" />
          <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
            Find Opportunities
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Discover jobs, projects, and collaboration opportunities
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <Calendar className="w-8 h-8 text-orange-500 mb-2" />
          <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
            Join Events
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Attend meetups, workshops, and community gatherings
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <Heart className="w-8 h-8 text-orange-500 mb-2" />
          <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
            Give Back
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Mentor others and contribute to the community
          </p>
        </div>
      </div>

      {/* Skip notice */}
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        You can skip any step and come back to complete your profile later
      </p>
    </div>
  );
};

export default WelcomeStep;