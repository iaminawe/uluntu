import React, { useState } from 'react';
import { User, Users, Building2, ChevronDown } from 'lucide-react';

interface GallerySelectorProps {
  value: {
    type: 'user' | 'group' | 'company';
    id?: string;
    name?: string;
  };
  onChange: (selection: {
    type: 'user' | 'group' | 'company';
    id?: string;
    name?: string;
  }) => void;
  userGroups?: Array<{ id: string; name: string; role: string }>;
  userCompanies?: Array<{ id: string; name: string; role: string }>;
  disabled?: boolean;
}

export const GallerySelector: React.FC<GallerySelectorProps> = ({
  value,
  onChange,
  userGroups = [],
  userCompanies = [],
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const adminGroups = userGroups.filter(group => group.role === 'admin');
  const adminCompanies = userCompanies.filter(company => company.role === 'admin');

  const getDisplayText = () => {
    switch (value.type) {
      case 'user':
        return 'Personal Gallery';
      case 'group':
        return value.name ? `${value.name} (Group)` : 'Select Group';
      case 'company':
        return value.name ? `${value.name} (Company)` : 'Select Company';
      default:
        return 'Select Owner';
    }
  };

  const getIcon = () => {
    switch (value.type) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'group':
        return <Users className="w-4 h-4" />;
      case 'company':
        return <Building2 className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Gallery Owner
      </label>
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-2 border rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          disabled 
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
            : 'bg-white border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="flex items-center gap-2">
          {getIcon()}
          <span>{getDisplayText()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
            {/* Personal Option */}
            <button
              type="button"
              onClick={() => {
                onChange({ type: 'user' });
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 ${
                value.type === 'user' ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              <User className="w-4 h-4" />
              <div>
                <div className="font-medium">Personal Gallery</div>
                <div className="text-sm text-gray-500">Create a gallery in your personal profile</div>
              </div>
            </button>

            {/* Groups */}
            {adminGroups.length > 0 && (
              <>
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Groups You Manage
                  </div>
                </div>
                {adminGroups.map((group) => (
                  <button
                    key={`group-${group.id}`}
                    type="button"
                    onClick={() => {
                      onChange({ 
                        type: 'group', 
                        id: group.id, 
                        name: group.name 
                      });
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 ${
                      value.type === 'group' && value.id === group.id ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-gray-500">Group gallery</div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Companies */}
            {adminCompanies.length > 0 && (
              <>
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Companies You Manage
                  </div>
                </div>
                {adminCompanies.map((company) => (
                  <button
                    key={`company-${company.id}`}
                    type="button"
                    onClick={() => {
                      onChange({ 
                        type: 'company', 
                        id: company.id, 
                        name: company.name 
                      });
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 ${
                      value.type === 'company' && value.id === company.id ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-gray-500">Company gallery</div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* No admin options */}
            {adminGroups.length === 0 && adminCompanies.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500 border-t border-gray-200">
                You don't manage any groups or companies.
                <br />
                Only administrators can create galleries for organizations.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};