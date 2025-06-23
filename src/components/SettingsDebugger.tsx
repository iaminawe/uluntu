import React, { useState } from 'react';
import { useSettingsContext } from '@/providers/SettingsProvider';
import { 
  useAppearanceSettings, 
  useSiteInfo, 
  useFeatures, 
  useLimits 
} from '@/hooks/useEnhancedSettings';
import { SettingsCacheManager } from '@/utils/settingsCache';

/**
 * Debug component for testing settings integration
 * This component can be used in development to verify settings are working
 */
export function SettingsDebugger() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, features, loading, error, refreshSettings } = useSettingsContext();
  const appearance = useAppearanceSettings();
  const siteInfo = useSiteInfo();
  const featuresData = useFeatures();
  const limits = useLimits();

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  const cacheStats = SettingsCacheManager.getMetrics();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
      >
        Settings Debug
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-96 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Settings Debug</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-4 text-sm">
            {/* Loading & Error Status */}
            <div>
              <h4 className="font-medium mb-2">Status</h4>
              <div className="space-y-1">
                <div>Loading: {loading ? '✓' : '✗'}</div>
                <div>Error: {error ? error : 'None'}</div>
                <button
                  onClick={refreshSettings}
                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  Refresh Settings
                </button>
              </div>
            </div>

            {/* Cache Statistics */}
            <div>
              <h4 className="font-medium mb-2">Cache Stats</h4>
              <div className="text-xs space-y-1">
                <div>Total Entries: {cacheStats.total}</div>
                <div>Valid: {cacheStats.valid}</div>
                <div>Expired: {cacheStats.expired}</div>
                <div>Hit Rate: {(cacheStats.hitRate * 100).toFixed(1)}%</div>
              </div>
            </div>

            {/* Site Information */}
            <div>
              <h4 className="font-medium mb-2">Site Info</h4>
              <div className="text-xs space-y-1">
                <div>Name: {siteInfo.name}</div>
                <div>Tagline: {siteInfo.tagline}</div>
                <div>Email: {siteInfo.email || 'Not set'}</div>
              </div>
            </div>

            {/* Appearance Settings */}
            <div>
              <h4 className="font-medium mb-2">Appearance</h4>
              <div className="text-xs space-y-1">
                <div>Primary: 
                  <span 
                    className="inline-block w-4 h-4 rounded ml-2" 
                    style={{ backgroundColor: appearance.primaryColor }}
                  ></span>
                  {appearance.primaryColor}
                </div>
                <div>Font: {appearance.fontFamily}</div>
                <div>Dark Mode: {appearance.darkMode ? '✓' : '✗'}</div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div>
              <h4 className="font-medium mb-2">Features ({featuresData.enabledCount} enabled)</h4>
              <div className="text-xs max-h-20 overflow-y-auto">
                {Object.entries(featuresData.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex justify-between">
                    <span>{feature}</span>
                    <span>{enabled ? '✓' : '✗'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Limits */}
            <div>
              <h4 className="font-medium mb-2">Limits</h4>
              <div className="text-xs space-y-1">
                <div>Max Upload: {(limits.maxUploadSize / 1024 / 1024).toFixed(1)}MB</div>
                <div>Gallery Images: {limits.maxGalleryImages}</div>
                <div>Rate Limit: {limits.rateLimitRequests}/min</div>
              </div>
            </div>

            {/* Raw Settings */}
            <div>
              <h4 className="font-medium mb-2">Raw Settings</h4>
              <details className="text-xs">
                <summary className="cursor-pointer">View JSON</summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify({ settings, features }, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}