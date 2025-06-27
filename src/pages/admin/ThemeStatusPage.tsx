import React, { useEffect, useState } from 'react';
import { useTheme } from '@/providers/EnhancedThemeProvider';
import { supabase } from '@/lib/supabase';
import { ThemeEditor } from '@/components/admin/theme';
import { AlertCircle, CheckCircle, Database, Palette } from 'lucide-react';

const ThemeStatusPage: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [tableStatus, setTableStatus] = useState<'checking' | 'exists' | 'missing'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      // Check database connection
      const { data: testData, error: testError } = await supabase
        .from('admin_features')
        .select('count')
        .limit(1);

      if (testError) {
        setDbStatus('error');
        setError('Database connection failed');
        return;
      }

      setDbStatus('connected');

      // Check if themes table exists
      const { data: tableData, error: tableError } = await supabase
        .from('themes')
        .select('count')
        .limit(1);

      if (tableError) {
        if (tableError.message?.includes('relation') && tableError.message?.includes('does not exist')) {
          setTableStatus('missing');
          setError('Theme tables not found. Please run migrations.');
        } else {
          setTableStatus('missing');
          setError(tableError.message);
        }
      } else {
        setTableStatus('exists');
      }
    } catch (err) {
      setDbStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (dbStatus === 'checking' || tableStatus === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking theme system status...</p>
        </div>
      </div>
    );
  }

  if (dbStatus === 'error') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-900">Database Connection Error</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <p className="mt-2 text-sm text-red-600">
                Please check your database configuration and ensure Supabase is running.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tableStatus === 'missing') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <Database className="h-6 w-6 text-yellow-600 mt-1" />
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-900">Theme System Not Initialized</h3>
              <p className="mt-2 text-sm text-yellow-700">{error}</p>
              <div className="mt-4 bg-gray-900 text-gray-100 rounded p-4 font-mono text-sm">
                <p className="mb-2">Run the following migrations:</p>
                <code className="block">1. 20250626000002_create_theme_system.sql</code>
                <code className="block">2. 20250626000003_seed_preset_themes.sql</code>
              </div>
              <p className="mt-4 text-sm text-yellow-600">
                After running migrations, refresh this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If we get here, everything is ready
  return <ThemePageContent />;
};

const ThemePageContent: React.FC = () => {
  const { 
    themes, 
    currentTheme, 
    loading
  } = useTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Palette className="h-12 w-12 text-orange-500 animate-pulse mx-auto" />
          <p className="mt-4 text-gray-600">Loading theme system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Theme Configuration</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Customize the visual appearance of your site
        </p>
      </div>

      {/* Status Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-green-900">Theme System Active</p>
            <p className="text-sm text-green-700">
              {themes.length} themes available • 
              Current theme: {currentTheme?.name || 'None'}
            </p>
          </div>
        </div>
      </div>

      {/* Theme Editor */}
      <ThemeEditor settings={[]} onRefresh={() => window.location.reload()} />
    </div>
  );
};

export default ThemeStatusPage;