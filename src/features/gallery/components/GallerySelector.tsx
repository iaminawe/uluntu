import React from 'react';
import { Globe, Users, Lock, Building, User } from 'lucide-react';

interface GallerySelectorProps {
  ownerType: 'user' | 'group' | 'company';
  ownerId?: string;
  onOwnerChange: (type: 'user' | 'group' | 'company', id?: string) => void;
  userGroups?: Array<{ id: string; name: string }>;
  userCompanies?: Array<{ id: string; name: string }>;
  disabled?: boolean;
}

export const GallerySelector: React.FC<GallerySelectorProps> = ({
  ownerType,
  ownerId,
  onOwnerChange,
  userGroups = [],
  userCompanies = [],
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Gallery Owner
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Personal Gallery */}
          <label className="relative">
            <input
              type="radio"
              name="ownerType"
              value="user"
              checked={ownerType === 'user'}
              onChange={() => onOwnerChange('user')}
              disabled={disabled}
              className="sr-only"
            />
            <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              ownerType === 'user'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
            }`}>
              <div className="flex items-center space-x-3">
                <User className={`w-5 h-5 ${
                  ownerType === 'user' ? 'text-orange-500' : 'text-slate-400'
                }`} />
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    Personal
                  </div>
                  <div className="text-sm text-slate-500">
                    Your personal gallery
                  </div>
                </div>
              </div>
            </div>
          </label>

          {/* Group Gallery */}
          <label className="relative">
            <input
              type="radio"
              name="ownerType"
              value="group"
              checked={ownerType === 'group'}
              onChange={() => onOwnerChange('group')}
              disabled={disabled || userGroups.length === 0}
              className="sr-only"
            />
            <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              ownerType === 'group'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
            } ${userGroups.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className="flex items-center space-x-3">
                <Users className={`w-5 h-5 ${
                  ownerType === 'group' ? 'text-orange-500' : 'text-slate-400'
                }`} />
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    Group
                  </div>
                  <div className="text-sm text-slate-500">
                    Share with group members
                  </div>
                </div>
              </div>
            </div>
          </label>

          {/* Company Gallery */}
          <label className="relative">
            <input
              type="radio"
              name="ownerType"
              value="company"
              checked={ownerType === 'company'}
              onChange={() => onOwnerChange('company')}
              disabled={disabled || userCompanies.length === 0}
              className="sr-only"
            />
            <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              ownerType === 'company'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
            } ${userCompanies.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className="flex items-center space-x-3">
                <Building className={`w-5 h-5 ${
                  ownerType === 'company' ? 'text-orange-500' : 'text-slate-400'
                }`} />
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    Company
                  </div>
                  <div className="text-sm text-slate-500">
                    Company gallery
                  </div>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Group Selection */}
      {ownerType === 'group' && userGroups.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Select Group
          </label>
          <select
            value={ownerId || ''}
            onChange={(e) => onOwnerChange('group', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">Choose a group...</option>
            {userGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Company Selection */}
      {ownerType === 'company' && userCompanies.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Select Company
          </label>
          <select
            value={ownerId || ''}
            onChange={(e) => onOwnerChange('company', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">Choose a company...</option>
            {userCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};