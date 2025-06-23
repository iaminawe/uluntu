import React, { useState, useMemo } from 'react';
import { 
  History, 
  Calendar,
  User,
  Filter,
  Search,
  Eye,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import type { SettingsHistory } from '@/types/settings';

interface SettingsHistoryPanelProps {
  history: SettingsHistory[];
  onRefresh: () => void;
}

type FilterType = 'all' | 'created' | 'updated' | 'deleted';
type DateRange = 'all' | 'today' | 'week' | 'month';

export const SettingsHistoryPanel: React.FC<SettingsHistoryPanelProps> = ({ 
  history = [], 
  onRefresh 
}) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<SettingsHistory | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Get unique categories from history
  const categories = useMemo(() => {
    const cats = new Set(history.map(entry => entry.category));
    return ['all', ...Array.from(cats)];
  }, [history]);

  // Filter history based on current filters
  const filteredHistory = useMemo(() => {
    let filtered = [...history];

    // Filter by change type
    if (filterType !== 'all') {
      filtered = filtered.filter(entry => entry.change_type === filterType);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(entry => entry.category === categoryFilter);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (dateRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(entry => 
        new Date(entry.changed_at) >= cutoff
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.setting_key.toLowerCase().includes(term) ||
        entry.category.toLowerCase().includes(term) ||
        (typeof entry.new_value === 'string' && entry.new_value.toLowerCase().includes(term)) ||
        (typeof entry.old_value === 'string' && entry.old_value.toLowerCase().includes(term))
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
    );
  }, [history, filterType, dateRange, searchTerm, categoryFilter]);

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'updated':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'deleted':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'created': return 'bg-green-50 border-green-200';
      case 'updated': return 'bg-blue-50 border-blue-200';
      case 'deleted': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'true' : 'false'}
        </span>
      );
    }
    
    if (typeof value === 'object') {
      return (
        <pre className="text-xs bg-gray-100 p-2 rounded max-w-xs overflow-x-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    
    const stringValue = String(value);
    if (stringValue.length > 50) {
      return (
        <span title={stringValue}>
          {stringValue.substring(0, 50)}...
        </span>
      );
    }
    
    return <span>{stringValue}</span>;
  };

  const stats = useMemo(() => {
    const total = history.length;
    const created = history.filter(h => h.change_type === 'created').length;
    const updated = history.filter(h => h.change_type === 'updated').length;
    const deleted = history.filter(h => h.change_type === 'deleted').length;
    
    return { total, created, updated, deleted };
  }, [history]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Settings History</h3>
          <p className="text-sm text-gray-500 mt-1">
            View all configuration changes and their details
          </p>
        </div>
        
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Changes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <History className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-2xl font-bold text-green-600">{stats.created}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Updated</p>
              <p className="text-2xl font-bold text-blue-600">{stats.updated}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Deleted</p>
              <p className="text-2xl font-bold text-red-600">{stats.deleted}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search settings, categories, or values..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Change Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Changes</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
          </select>
          
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          
          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
          </select>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              Change History ({filteredHistory.length})
            </h4>
            {filteredHistory.length !== history.length && (
              <button
                onClick={() => {
                  setFilterType('all');
                  setDateRange('all');
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No history entries found matching your filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredHistory.map((entry) => (
                <div key={entry.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getChangeIcon(entry.change_type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {entry.category}.{entry.setting_key}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            entry.change_type === 'created' ? 'bg-green-100 text-green-800' :
                            entry.change_type === 'updated' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {entry.change_type}
                          </span>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {entry.change_type !== 'created' && entry.old_value !== undefined && (
                            <div>
                              <span className="text-gray-500">Previous:</span>
                              <div className="mt-1">
                                {formatValue(entry.old_value)}
                              </div>
                            </div>
                          )}
                          
                          {entry.change_type !== 'deleted' && entry.new_value !== undefined && (
                            <div>
                              <span className="text-gray-500">
                                {entry.change_type === 'created' ? 'Value:' : 'New:'}
                              </span>
                              <div className="mt-1">
                                {formatValue(entry.new_value)}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(entry.changed_at).toLocaleString()}
                          </div>
                          
                          {entry.changed_by && (
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              User ID: {entry.changed_by}
                            </div>
                          )}
                          
                          {entry.ip_address && (
                            <div>
                              IP: {entry.ip_address}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedEntry(entry)}
                      className="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Change Details</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Setting:</span>
                    <p className="mt-1">{selectedEntry.category}.{selectedEntry.setting_key}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Change Type:</span>
                    <p className="mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedEntry.change_type === 'created' ? 'bg-green-100 text-green-800' :
                        selectedEntry.change_type === 'updated' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedEntry.change_type}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Changed At:</span>
                    <p className="mt-1">{new Date(selectedEntry.changed_at).toLocaleString()}</p>
                  </div>
                  
                  {selectedEntry.changed_by && (
                    <div>
                      <span className="font-medium text-gray-700">Changed By:</span>
                      <p className="mt-1">User ID: {selectedEntry.changed_by}</p>
                    </div>
                  )}
                  
                  {selectedEntry.ip_address && (
                    <div>
                      <span className="font-medium text-gray-700">IP Address:</span>
                      <p className="mt-1">{selectedEntry.ip_address}</p>
                    </div>
                  )}
                  
                  {selectedEntry.user_agent && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">User Agent:</span>
                      <p className="mt-1 text-xs break-all">{selectedEntry.user_agent}</p>
                    </div>
                  )}
                </div>
                
                {selectedEntry.change_type !== 'created' && selectedEntry.old_value !== undefined && (
                  <div>
                    <span className="font-medium text-gray-700">Previous Value:</span>
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      {formatValue(selectedEntry.old_value)}
                    </div>
                  </div>
                )}
                
                {selectedEntry.change_type !== 'deleted' && selectedEntry.new_value !== undefined && (
                  <div>
                    <span className="font-medium text-gray-700">
                      {selectedEntry.change_type === 'created' ? 'Value:' : 'New Value:'}
                    </span>
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      {formatValue(selectedEntry.new_value)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">History Management:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>All configuration changes are automatically logged with timestamps and user information</li>
              <li>Use filters to find specific changes or review changes by category</li>
              <li>History entries are kept for audit and compliance purposes</li>
              <li>Click the eye icon to view detailed information about any change</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};