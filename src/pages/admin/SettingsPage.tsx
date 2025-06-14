import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFeaturesApi } from '@/api/admin/features';
import { LANGUAGES } from '@/constants/languages';
import {
  Settings,
  Globe,
  ToggleLeft,
  ToggleRight,
  Save,
  Plus,
  Trash2,
  Edit,
  Check,
  X
} from 'lucide-react';

interface FeatureTranslations {
  title: string;
  description: string;
  [key: string]: string;
}

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'features' | 'translations'>('features');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [configValue, setConfigValue] = useState<string>('');

  // Fetch features
  const { data: features, isLoading: featuresLoading } = useQuery({
    queryKey: ['admin-features'],
    queryFn: () => adminFeaturesApi.getFeatures()
  });

  // Fetch translations for selected feature
  const { data: translations } = useQuery({
    queryKey: ['admin-feature-translations', selectedFeature],
    queryFn: () => selectedFeature ? adminFeaturesApi.getFeatureTranslations(selectedFeature) : null,
    enabled: !!selectedFeature
  });

  // Toggle feature mutation
  const toggleFeatureMutation = useMutation({
    mutationFn: ({ featureKey, enabled }: { featureKey: string; enabled: boolean }) =>
      adminFeaturesApi.toggleFeature(featureKey, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
    }
  });

  // Update feature config
  const updateConfigMutation = useMutation({
    mutationFn: ({ featureKey, config }: { featureKey: string; config: Record<string, any> }) =>
      adminFeaturesApi.updateFeatureConfig(featureKey, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
      setEditingConfig(null);
    }
  });

  // Update translations
  const updateTranslationsMutation = useMutation({
    mutationFn: ({ featureId, languageCode, translations }: {
      featureId: string;
      languageCode: string;
      translations: FeatureTranslations;
    }) => adminFeaturesApi.upsertFeatureTranslation(featureId, languageCode, translations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-translations'] });
    }
  });

  const handleConfigSave = (featureKey: string, configKey: string) => {
    const feature = features?.find(f => f.feature_key === featureKey);
    if (!feature) return;

    const newConfig = {
      ...feature.config,
      [configKey]: configKey.includes('max') || configKey.includes('Max') 
        ? parseInt(configValue) 
        : configValue === 'true' ? true : configValue === 'false' ? false : configValue
    };

    updateConfigMutation.mutate({ featureKey, config: newConfig });
  };

  const getFeatureIcon = (featureKey: string) => {
    const icons: Record<string, string> = {
      members: '👤',
      companies: '🏢',
      groups: '👥',
      events: '📅',
      news: '📰',
      resources: '📚',
      marketplace: '🛍️',
      opportunities: '💼'
    };
    return icons[featureKey] || '📦';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage feature flags and translations
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('features')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'features'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Feature Flags
          </button>
          <button
            onClick={() => setActiveTab('translations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'translations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Translations
          </button>
        </nav>
      </div>

      {activeTab === 'features' ? (
        <div className="space-y-4">
          {featuresLoading ? (
            <div className="text-center py-8 text-gray-500">Loading features...</div>
          ) : (
            features?.map(feature => (
              <div key={feature.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl">{getFeatureIcon(feature.feature_key)}</span>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 capitalize">
                        {feature.feature_key.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage settings and configuration for {feature.feature_key}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFeatureMutation.mutate({
                      featureKey: feature.feature_key,
                      enabled: !feature.enabled
                    })}
                    className={`p-2 rounded-lg ${
                      feature.enabled ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {feature.enabled ? (
                      <ToggleRight className="h-8 w-8" />
                    ) : (
                      <ToggleLeft className="h-8 w-8" />
                    )}
                  </button>
                </div>

                {/* Feature Configuration */}
                <div className="mt-6 border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Configuration</h4>
                  <div className="space-y-3">
                    {Object.entries(feature.config).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        {editingConfig === `${feature.feature_key}-${key}` ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type={typeof value === 'boolean' ? 'checkbox' : 'text'}
                              value={configValue}
                              onChange={(e) => setConfigValue(
                                e.type === 'checkbox' ? e.target.checked.toString() : e.target.value
                              )}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <button
                              onClick={() => handleConfigSave(feature.feature_key, key)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingConfig(null)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {value?.toString() || 'null'}
                            </span>
                            <button
                              onClick={() => {
                                setEditingConfig(`${feature.feature_key}-${key}`);
                                setConfigValue(value?.toString() || '');
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Translation Link */}
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      setSelectedFeature(feature.id);
                      setActiveTab('translations');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Manage translations for this feature
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div>
          {/* Feature Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Feature
            </label>
            <select
              value={selectedFeature || ''}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a feature...</option>
              {features?.map(feature => (
                <option key={feature.id} value={feature.id}>
                  {feature.feature_key.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {selectedFeature && (
            <>
              {/* Language Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(LANGUAGES).map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => setSelectedLanguage(code)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedLanguage === code
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Translation Editor */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Translations for {LANGUAGES[selectedLanguage as keyof typeof LANGUAGES]}
                </h3>
                
                <TranslationEditor
                  featureId={selectedFeature}
                  languageCode={selectedLanguage}
                  existingTranslations={
                    translations?.find(t => t.language_code === selectedLanguage)?.translations || {}
                  }
                  onSave={(translations) => {
                    updateTranslationsMutation.mutate({
                      featureId: selectedFeature,
                      languageCode: selectedLanguage,
                      translations
                    });
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Translation Editor Component
const TranslationEditor: React.FC<{
  featureId: string;
  languageCode: string;
  existingTranslations: FeatureTranslations;
  onSave: (translations: FeatureTranslations) => void;
}> = ({ featureId, languageCode, existingTranslations, onSave }) => {
  const [translations, setTranslations] = useState<FeatureTranslations>({
    title: '',
    description: '',
    ...existingTranslations
  });

  const defaultKeys = [
    'title',
    'description',
    'createButton',
    'editButton',
    'deleteButton',
    'searchPlaceholder',
    'emptyState',
    'loadingState',
    'errorState'
  ];

  const handleSave = () => {
    onSave(translations);
  };

  return (
    <div className="space-y-4">
      {defaultKeys.map(key => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </label>
          <input
            type="text"
            value={translations[key] || ''}
            onChange={(e) => setTranslations({
              ...translations,
              [key]: e.target.value
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter ${key} in ${languageCode}...`}
          />
        </div>
      ))}

      <div className="flex justify-end space-x-4 pt-4">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Translations
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;