import React, { useState, useEffect } from 'react';
import { Search, Building, Plus, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateCompanyAssociation } from '../../store/onboardingSlice';
import type { OnboardingStepProps } from '../../types';

// Mock company data - in real implementation, this would come from API
const mockCompanies = [
  { id: '1', name: 'Uluntu Solutions', industry: ['Software Development'], employeeCount: 25 },
  { id: '2', name: 'Uluntu Digital', industry: ['Web Design', 'Marketing'], employeeCount: 12 },
  { id: '3', name: 'Mountain View Systems', industry: ['IT Consulting'], employeeCount: 8 },
  { id: '4', name: 'Selkirk Software', industry: ['Mobile Development'], employeeCount: 15 },
  { id: '5', name: 'RedMountain Analytics', industry: ['Data Science'], employeeCount: 6 },
];

const CompanyAssociationStep: React.FC<OnboardingStepProps> = ({ onNext }) => {
  const dispatch = useAppDispatch();
  const { company } = useAppSelector((state) => state.onboarding.formData);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState(mockCompanies);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(company.companyId || null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCompanyData, setNewCompanyData] = useState({
    name: '',
    website: '',
    description: '',
    industry: [] as string[],
  });
  const [role, setRole] = useState(company.role || '');

  // Filter companies based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCompanies(mockCompanies);
    } else {
      const filtered = mockCompanies.filter(comp =>
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.industry.some(ind => ind.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCompanies(filtered);
    }
  }, [searchTerm]);

  // Auto-save changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedCompany) {
        const selectedCompanyData = mockCompanies.find(c => c.id === selectedCompany);
        dispatch(updateCompanyAssociation({
          companyId: selectedCompany,
          companyName: selectedCompanyData?.name,
          role: role,
          isVerified: false,
          createNewCompany: false,
        }));
      } else if (showCreateForm && newCompanyData.name) {
        dispatch(updateCompanyAssociation({
          createNewCompany: true,
          newCompanyData,
          role: role,
          isVerified: false,
        }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, selectedCompany, role, newCompanyData, showCreateForm]);

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId);
    setShowCreateForm(false);
  };

  const handleCreateNew = () => {
    setSelectedCompany(null);
    setShowCreateForm(true);
  };

  const handleSkipCompany = () => {
    setSelectedCompany(null);
    setShowCreateForm(false);
    dispatch(updateCompanyAssociation({}));
  };

  const addIndustry = (industry: string) => {
    if (industry && !newCompanyData.industry.includes(industry)) {
      setNewCompanyData(prev => ({
        ...prev,
        industry: [...prev.industry, industry]
      }));
    }
  };

  const removeIndustry = (industry: string) => {
    setNewCompanyData(prev => ({
      ...prev,
      industry: prev.industry.filter(i => i !== industry)
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Connect with your company
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Link your profile to your current company or create a new company profile (optional)
        </p>
      </div>

      {!showCreateForm ? (
        <div className="space-y-6">
          {/* Search Section */}
          <div>
            <label htmlFor="company-search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Search for your company
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                id="company-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type company name or industry..."
                className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Company Results */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Local companies ({filteredCompanies.length} found)
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredCompanies.map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => handleCompanySelect(comp.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedCompany === comp.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-slate-500" />
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">{comp.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {comp.industry.join(', ')} • {comp.employeeCount} employees
                        </p>
                      </div>
                    </div>
                    {selectedCompany === comp.id && (
                      <Check className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Input */}
          {selectedCompany && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Your role at this company
              </label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Software Developer, Product Manager"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleCreateNew}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed 
                       border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 
                       hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Can't find your company? Create a new one
            </button>
            
            <button
              type="button"
              onClick={handleSkipCompany}
              className="text-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 
                       dark:hover:text-slate-300 transition-colors"
            >
              Skip this step - I'll add my company later
            </button>
          </div>
        </div>
      ) : (
        /* Create New Company Form */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Create New Company
            </h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              ← Back to search
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="company-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Company Name *
              </label>
              <input
                id="company-name"
                type="text"
                value={newCompanyData.name}
                onChange={(e) => setNewCompanyData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your Company Name"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label htmlFor="company-website" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Website
              </label>
              <input
                id="company-website"
                type="url"
                value={newCompanyData.website}
                onChange={(e) => setNewCompanyData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://yourcompany.com"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label htmlFor="company-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                id="company-description"
                value={newCompanyData.description}
                onChange={(e) => setNewCompanyData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Brief description of what your company does..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                         resize-none"
              />
            </div>

            <div>
              <label htmlFor="your-role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Your Role *
              </label>
              <input
                id="your-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Founder, CTO, Software Developer"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyAssociationStep;