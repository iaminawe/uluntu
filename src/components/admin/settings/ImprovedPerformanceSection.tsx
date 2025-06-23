import React, { useState, useEffect } from 'react';
import { ApplicationSetting, FeatureToggle, UpdateSettingRequest } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  TrendingUp, 
  Database, 
  Zap, 
  Monitor,
  Activity,
  Server,
  Eye,
  EyeOff,
  Save, 
  RotateCcw, 
  Info,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImprovedPerformanceSectionProps {
  settings: ApplicationSetting[];
  features: FeatureToggle[];
  onUpdateSetting: (request: UpdateSettingRequest) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

interface SettingField {
  key: string;
  label: string;
  type: 'number' | 'boolean' | 'select';
  placeholder?: string;
  description?: string;
  unit?: string;
  validation?: {
    min?: number;
    max?: number;
    step?: number;
  };
  options?: { value: string; label: string }[];
}

const cacheFields: SettingField[] = [
  {
    key: 'enable_redis_cache',
    label: 'Enable Redis Cache',
    type: 'boolean',
    description: 'Use Redis for caching to improve response times'
  },
  {
    key: 'cache_ttl_minutes',
    label: 'Default Cache TTL',
    type: 'number',
    placeholder: '60',
    unit: 'minutes',
    description: 'Default time-to-live for cached items',
    validation: { min: 1, max: 1440, step: 1 }
  },
  {
    key: 'page_cache_enabled',
    label: 'Enable Page Caching',
    type: 'boolean',
    description: 'Cache rendered pages for faster loading'
  },
  {
    key: 'api_cache_enabled',
    label: 'Enable API Caching',
    type: 'boolean',
    description: 'Cache API responses to reduce database load'
  }
];

const databaseFields: SettingField[] = [
  {
    key: 'connection_pool_size',
    label: 'Database Connection Pool Size',
    type: 'number',
    placeholder: '10',
    unit: 'connections',
    description: 'Number of database connections to maintain',
    validation: { min: 1, max: 100, step: 1 }
  },
  {
    key: 'query_timeout_seconds',
    label: 'Query Timeout',
    type: 'number',
    placeholder: '30',
    unit: 'seconds',
    description: 'Maximum time to wait for database queries',
    validation: { min: 5, max: 300, step: 5 }
  },
  {
    key: 'enable_query_logging',
    label: 'Enable Slow Query Logging',
    type: 'boolean',
    description: 'Log queries that take longer than threshold'
  },
  {
    key: 'slow_query_threshold_ms',
    label: 'Slow Query Threshold',
    type: 'number',
    placeholder: '1000',
    unit: 'milliseconds',
    description: 'Log queries slower than this threshold',
    validation: { min: 100, max: 10000, step: 100 }
  }
];

const optimizationFields: SettingField[] = [
  {
    key: 'enable_compression',
    label: 'Enable Response Compression',
    type: 'boolean',
    description: 'Compress HTTP responses to reduce bandwidth'
  },
  {
    key: 'compression_level',
    label: 'Compression Level',
    type: 'select',
    description: 'Balance between compression ratio and CPU usage',
    options: [
      { value: '1', label: 'Level 1 - Fastest, least compression' },
      { value: '6', label: 'Level 6 - Balanced (recommended)' },
      { value: '9', label: 'Level 9 - Best compression, slowest' }
    ]
  },
  {
    key: 'enable_image_optimization',
    label: 'Enable Image Optimization',
    type: 'boolean',
    description: 'Automatically optimize uploaded images'
  },
  {
    key: 'max_image_size_mb',
    label: 'Maximum Image Size',
    type: 'number',
    placeholder: '10',
    unit: 'MB',
    description: 'Maximum allowed image upload size',
    validation: { min: 1, max: 100, step: 1 }
  }
];

const monitoringFields: SettingField[] = [
  {
    key: 'enable_performance_monitoring',
    label: 'Enable Performance Monitoring',
    type: 'boolean',
    description: 'Track response times and system metrics'
  },
  {
    key: 'metrics_retention_days',
    label: 'Metrics Retention Period',
    type: 'number',
    placeholder: '30',
    unit: 'days',
    description: 'How long to keep performance metrics',
    validation: { min: 7, max: 365, step: 1 }
  },
  {
    key: 'alert_threshold_response_time_ms',
    label: 'Response Time Alert Threshold',
    type: 'number',
    placeholder: '2000',
    unit: 'milliseconds',
    description: 'Alert when response times exceed this threshold',
    validation: { min: 500, max: 10000, step: 100 }
  }
];

const ImprovedPerformanceSection: React.FC<ImprovedPerformanceSectionProps> = ({
  settings,
  features,
  onUpdateSetting,
  onRefresh,
  isLoading
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Initialize form data from settings
  useEffect(() => {
    const initialData: Record<string, any> = {};
    settings.forEach(setting => {
      const key = `${setting.category}.${setting.setting_key}`;
      initialData[key] = setting.setting_value;
    });
    setFormData(initialData);
    setChangedFields(new Set());
  }, [settings]);

  const handleFieldChange = (category: string, settingKey: string, value: any) => {
    const fieldKey = `${category}.${settingKey}`;
    setFormData(prev => ({ ...prev, [fieldKey]: value }));
    setChangedFields(prev => new Set([...prev, fieldKey]));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const updates: UpdateSettingRequest[] = [];
      
      for (const fieldKey of changedFields) {
        const [category, settingKey] = fieldKey.split('.');
        const value = formData[fieldKey];
        
        const setting = settings.find(s => s.setting_key === settingKey && s.category === category);
        updates.push({
          setting_key: settingKey,
          setting_value: value,
          category: category as any,
          data_type: setting?.data_type || 'string'
        });
      }
      
      await Promise.all(updates.map(update => onUpdateSetting(update)));
      
      setChangedFields(new Set());
      toast.success(`Saved ${updates.length} performance settings successfully`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save performance settings');
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const resetData: Record<string, any> = {};
    settings.forEach(setting => {
      const key = `${setting.category}.${setting.setting_key}`;
      resetData[key] = setting.setting_value;
    });
    setFormData(resetData);
    setChangedFields(new Set());
    toast.success('Changes reset');
  };

  const renderField = (category: string, field: SettingField) => {
    const fieldKey = `${category}.${field.key}`;
    const value = formData[fieldKey];
    const hasChanged = changedFields.has(fieldKey);
    
    return (
      <div key={fieldKey} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.unit && <span className="text-gray-500 ml-1">({field.unit})</span>}
        </label>
        
        {field.type === 'boolean' ? (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {value ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm font-medium">
                  {value ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <Switch
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(category, field.key, checked)}
              className={hasChanged ? 'ring-2 ring-green-300' : ''}
            />
          </div>
        ) : field.type === 'select' ? (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(category, field.key, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
              hasChanged ? 'border-green-300 bg-green-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select an option...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(category, field.key, parseInt(e.target.value) || 0)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            step={field.validation?.step}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
              hasChanged ? 'border-green-300 bg-green-50' : 'border-gray-300'
            }`}
          />
        )}
        
        {field.description && (
          <p className="text-xs text-gray-500 flex items-start">
            <Info className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
            {field.description}
          </p>
        )}
      </div>
    );
  };

  // Calculate performance score
  const calculatePerformanceScore = () => {
    let score = 0;
    let maxScore = 0;

    // Caching (40 points)
    maxScore += 40;
    if (formData['performance.enable_redis_cache']) score += 15;
    if (formData['performance.page_cache_enabled']) score += 10;
    if (formData['performance.api_cache_enabled']) score += 15;

    // Database optimization (25 points)
    maxScore += 25;
    if (formData['performance.connection_pool_size'] >= 5) score += 10;
    if (formData['performance.query_timeout_seconds'] <= 30) score += 5;
    if (formData['performance.enable_query_logging']) score += 10;

    // Response optimization (25 points)
    maxScore += 25;
    if (formData['performance.enable_compression']) score += 15;
    if (formData['performance.enable_image_optimization']) score += 10;

    // Monitoring (10 points)
    maxScore += 10;
    if (formData['performance.enable_performance_monitoring']) score += 10;

    return Math.round((score / maxScore) * 100);
  };

  const performanceScore = calculatePerformanceScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const performanceFeatures = features.filter(f => 
    f.feature_key.includes('performance') || 
    f.feature_key.includes('cache') || 
    f.feature_key.includes('optimization') ||
    f.feature_key.includes('monitoring')
  );

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Performance & Optimization</h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure caching, database optimization, and performance monitoring
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-2"
          >
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{previewMode ? 'Hide Dashboard' : 'Show Dashboard'}</span>
          </Button>
          
          {changedFields.size > 0 && (
            <>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </Button>
              
              <Button
                onClick={handleSaveAll}
                disabled={saving}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
                <span className="ml-1 px-2 py-0.5 bg-green-500 text-xs rounded-full">
                  {changedFields.size}
                </span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Performance Dashboard */}
      {previewMode && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-green-800">Performance Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Performance Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(performanceScore)}`}>
                {performanceScore}%
              </div>
              <p className="text-sm text-gray-600">Performance Score</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    performanceScore >= 80 ? 'bg-green-500' :
                    performanceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${performanceScore}%` }}
                />
              </div>
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Database className="h-4 w-4 mr-2 text-blue-600" />
                  Caching
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Redis Cache</span>
                    {formData['performance.enable_redis_cache'] ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Page Cache</span>
                    {formData['performance.page_cache_enabled'] ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Cache</span>
                    {formData['performance.api_cache_enabled'] ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Server className="h-4 w-4 mr-2 text-purple-600" />
                  Database
                </h4>
                <div className="space-y-1 text-xs">
                  <div>Pool Size: {formData['performance.connection_pool_size'] || 'Default'}</div>
                  <div>Timeout: {formData['performance.query_timeout_seconds'] || '30'}s</div>
                  <div className="flex items-center justify-between">
                    <span>Slow Query Log</span>
                    {formData['performance.enable_query_logging'] ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-yellow-600" />
                  Optimization
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Compression</span>
                    {formData['performance.enable_compression'] ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <div>Level: {formData['performance.compression_level'] || 'Default'}</div>
                  <div className="flex items-center justify-between">
                    <span>Image Optimization</span>
                    {formData['performance.enable_image_optimization'] ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-green-600" />
                  Monitoring
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Performance Tracking</span>
                    {formData['performance.enable_performance_monitoring'] ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <div>Retention: {formData['performance.metrics_retention_days'] || '30'} days</div>
                  <div>Alert: {formData['performance.alert_threshold_response_time_ms'] || '2000'}ms</div>
                </div>
              </div>
            </div>

            {/* Simulated Metrics */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-3">Simulated Performance Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {formData['performance.enable_redis_cache'] ? '45ms' : '180ms'}
                  </div>
                  <div className="text-xs text-gray-500">Avg Response Time</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {formData['performance.page_cache_enabled'] ? '95%' : '78%'}
                  </div>
                  <div className="text-xs text-gray-500">Cache Hit Rate</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-purple-600">
                    {formData['performance.connection_pool_size'] || 10}
                  </div>
                  <div className="text-xs text-gray-500">DB Connections</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-yellow-600">
                    {formData['performance.enable_compression'] ? '65%' : '0%'}
                  </div>
                  <div className="text-xs text-gray-500">Bandwidth Saved</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Caching Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span>Caching & Memory</span>
            <Badge variant={formData['performance.enable_redis_cache'] ? 'success' : 'secondary'}>
              {formData['performance.enable_redis_cache'] ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cacheFields.map(field => renderField('performance', field))}
          </div>
        </CardContent>
      </Card>

      {/* Database Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-purple-600" />
            <span>Database Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {databaseFields.map(field => renderField('performance', field))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <span>Response & Asset Optimization</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {optimizationFields.map(field => renderField('performance', field))}
          </div>
        </CardContent>
      </Card>

      {/* Monitoring & Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5 text-green-600" />
            <span>Performance Monitoring</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {monitoringFields.map(field => renderField('performance', field))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Features */}
      {performanceFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span>Performance Features</span>
              <Badge variant="secondary">
                {performanceFeatures.filter(f => f.enabled).length}/{performanceFeatures.length} enabled
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {performanceFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {feature.feature_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      {feature.enabled && (
                        <Badge variant="success" size="sm">Active</Badge>
                      )}
                    </div>
                    {feature.description && (
                      <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                    )}
                  </div>
                  <Switch
                    checked={feature.enabled}
                    onCheckedChange={(checked) => {
                      toast.success('Performance feature toggle functionality coming soon');
                    }}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Guidelines */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Info className="h-5 w-5" />
            <span>Performance Optimization Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-green-700">
            <li><strong>Enable caching:</strong> Redis caching can reduce response times by 60-80%</li>
            <li><strong>Monitor database:</strong> Keep connection pools optimized and track slow queries</li>
            <li><strong>Use compression:</strong> Gzip compression can reduce bandwidth usage by 50-70%</li>
            <li><strong>Optimize images:</strong> Automatic image optimization saves storage and improves load times</li>
            <li><strong>Set reasonable timeouts:</strong> Prevent long-running queries from blocking resources</li>
            <li><strong>Monitor performance:</strong> Regular monitoring helps identify bottlenecks early</li>
          </ul>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
                {performanceScore}%
              </div>
              <div className="text-sm text-gray-600">Performance Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {cacheFields.filter(f => formData[`performance.${f.key}`]).length}
              </div>
              <div className="text-sm text-gray-600">Cache Features</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {optimizationFields.filter(f => formData[`performance.${f.key}`]).length}
              </div>
              <div className="text-sm text-gray-600">Optimizations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {changedFields.size}
              </div>
              <div className="text-sm text-gray-600">Unsaved Changes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprovedPerformanceSection;