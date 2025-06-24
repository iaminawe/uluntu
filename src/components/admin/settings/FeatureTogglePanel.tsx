import React, { useState } from 'react';
import { 
  ToggleLeft, 
  ToggleRight, 
  Settings, 
  Users, 
  Shield, 
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import type { FeatureToggle, UpdateFeatureToggleRequest } from '@/types/settings';
import { useAdminSettings } from '@/hooks/useSettings';

interface FeatureTogglePanelProps {
  features: FeatureToggle[];
  onRefresh: () => void;
}

interface FeatureGroup {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  features: FeatureToggle[];
  color: string;
}

export const FeatureTogglePanel: React.FC<FeatureTogglePanelProps> = ({ 
  features, 
  onRefresh 
}) => {
  const { updateFeature, deleteFeature } = useAdminSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFeature, setEditingFeature] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UpdateFeatureToggleRequest>>({});
  const [loading, setLoading] = useState<string | null>(null);

  // Group features by category
  const featureGroups: FeatureGroup[] = [
    {
      name: 'Core Features',
      icon: Settings,
      color: 'blue',
      features: features.filter(f => 
        ['directory', 'companies', 'events', 'groups', 'resources', 'marketplace', 'opportunities', 'news'].includes(f.feature_key)
      ),
    },
    {
      name: 'Social & Communication',
      icon: Users,
      color: 'green',
      features: features.filter(f => 
        ['social_features', 'real_time_notifications', 'newsletter', 'gallery'].includes(f.feature_key)
      ),
    },
    {
      name: 'Advanced Features',
      icon: Shield,
      color: 'purple',
      features: features.filter(f => 
        ['analytics', 'api_access', 'advanced_search', 'content_moderation', 'sso_integration'].includes(f.feature_key)
      ),
    },
  ];

  const filteredGroups = featureGroups.map(group => ({
    ...group,
    features: group.features.filter(feature => 
      feature.feature_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(group => group.features.length > 0);

  const handleToggle = async (featureKey: string, enabled: boolean) => {
    setLoading(featureKey);
    try {
      await updateFeature({ feature_key: featureKey, enabled });
      onRefresh();
    } catch (error) {
      console.error('Failed to toggle feature:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleEdit = (feature: FeatureToggle) => {
    setEditingFeature(feature.id);
    setEditForm({
      feature_key: feature.feature_key,
      enabled: feature.enabled || false,
      config: feature.config || undefined,
      rollout_percentage: feature.rollout_percentage ?? undefined,
      enabled_for_users: feature.enabled_for_users || undefined,
      enabled_for_roles: feature.enabled_for_roles || undefined,
      description: feature.description || undefined,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingFeature || !editForm.feature_key) return;
    
    setLoading(editingFeature);
    try {
      await updateFeature(editForm as UpdateFeatureToggleRequest);
      setEditingFeature(null);
      setEditForm({});
      onRefresh();
    } catch (error) {
      console.error('Failed to update feature:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingFeature(null);
    setEditForm({});
  };

  const handleDelete = async (featureId: string) => {
    if (!confirm('Are you sure you want to delete this feature toggle?')) return;
    
    setLoading(featureId);
    try {
      await deleteFeature(featureId);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete feature:', error);
    } finally {
      setLoading(null);
    }
  };

  const getFeatureIcon = (featureKey: string) => {
    const icons: Record<string, string> = {
      directory: '👤',
      companies: '🏢',
      events: '📅',
      groups: '👥',
      resources: '📚',
      marketplace: '🛍️',
      opportunities: '💼',
      news: '📰',
      gallery: '📸',
      newsletter: '📧',
      analytics: '📊',
      api_access: '🔌',
      advanced_search: '🔍',
      real_time_notifications: '🔔',
      user_profiles: '👤',
      social_features: '💬',
      content_moderation: '🛡️',
      mobile_app: '📱',
      sso_integration: '🔐',
      custom_themes: '🎨'
    };
    return icons[featureKey] || '⚙️';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Feature Toggles</h3>
          <p className="text-sm text-gray-500 mt-1">
            Control which features are available to users
          </p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Feature Groups */}
      {filteredGroups.map((group) => {
        const Icon = group.icon;
        
        return (
          <div key={group.name} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className={`px-6 py-4 border-b border-gray-200 bg-${group.color}-50`}>
              <div className="flex items-center">
                <Icon className={`h-5 w-5 text-${group.color}-600 mr-2`} />
                <h4 className={`font-medium text-${group.color}-900`}>
                  {group.name}
                </h4>
                <span className={`ml-2 px-2 py-1 text-xs bg-${group.color}-100 text-${group.color}-700 rounded-full`}>
                  {group.features.length}
                </span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {group.features.map((feature) => {
                const isEditing = editingFeature === feature.id;
                const isLoading = loading === feature.id || loading === feature.feature_key;
                
                return (
                  <div key={feature.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <span className="text-2xl">
                          {getFeatureIcon(feature.feature_key)}
                        </span>
                        
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Feature Key
                                </label>
                                <input
                                  type="text"
                                  value={editForm.feature_key || ''}
                                  onChange={(e) => setEditForm({ ...editForm, feature_key: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  disabled
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Description
                                </label>
                                <textarea
                                  value={editForm.description || ''}
                                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rollout Percentage
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editForm.rollout_percentage ?? 0}
                                    onChange={(e) => setEditForm({ ...editForm, rollout_percentage: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Enabled for Roles
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="admin,moderator"
                                    value={(editForm.enabled_for_roles || []).join(',')}
                                    onChange={(e) => setEditForm({ 
                                      ...editForm, 
                                      enabled_for_roles: e.target.value.split(',').filter(r => r.trim()) 
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                  disabled={isLoading}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveEdit}
                                  disabled={isLoading}
                                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                                >
                                  <Save className="h-4 w-4 mr-1" />
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h5 className="font-medium text-gray-900 capitalize">
                                {feature.feature_key.replace(/_/g, ' ')}
                              </h5>
                              <p className="text-sm text-gray-500 mt-1">
                                {feature.description || 'No description available'}
                              </p>
                              
                              {/* Feature Config */}
                              {((feature.rollout_percentage ?? 0) > 0) && (
                                <div className="mt-2 flex items-center text-xs text-amber-600">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Gradual rollout: {feature.rollout_percentage ?? 0}%
                                </div>
                              )}
                              
                              {((feature.enabled_for_roles || []).length > 0) && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {(feature.enabled_for_roles || []).map(role => (
                                    <span key={role} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                      {role}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <div className="mt-2 text-xs text-gray-400">
                                Last updated: {feature.updated_at ? new Date(feature.updated_at).toLocaleDateString() : 'Never'}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {!isEditing && (
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(feature)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(feature.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggle(feature.feature_key, !(feature.enabled || false))}
                            disabled={isLoading}
                            className={`p-2 rounded-lg transition-colors ${
                              (feature.enabled || false) 
                                ? 'text-green-600 hover:bg-green-50' 
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            {isLoading ? (
                              <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                            ) : (feature.enabled || false) ? (
                              <ToggleRight className="h-6 w-6" />
                            ) : (
                              <ToggleLeft className="h-6 w-6" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      
      {filteredGroups.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No features found matching your search.</p>
        </div>
      )}
    </div>
  );
};