import React from 'react';
import { SettingsHistory } from '@/types/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuditSectionProps {
  history: SettingsHistory[];
  isLoading: boolean;
}

const AuditSection: React.FC<AuditSectionProps> = ({ history, isLoading: _isLoading }) => {
  const recentChanges = history.slice(0, 20); // Show last 20 changes

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'created': return 'success';
      case 'updated': return 'warning';
      case 'deleted': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Recent Settings Changes</span>
            <Badge variant="secondary">{history.length} total changes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentChanges.length > 0 ? (
            <div className="space-y-4">
              {recentChanges.map((change) => (
                <div key={change.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={getChangeTypeColor(change.change_type) as any}>
                          {change.change_type}
                        </Badge>
                        <span className="font-medium text-gray-900">
                          {change.category}.{change.setting_key}
                        </span>
                      </div>
                      
                      {change.change_type === 'updated' && (
                        <div className="text-sm text-gray-600 space-y-1">
                          {change.old_value && (
                            <div>
                              <span className="font-medium">Old:</span> {String(change.old_value)}
                            </div>
                          )}
                          {change.new_value && (
                            <div>
                              <span className="font-medium">New:</span> {String(change.new_value)}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {change.change_type === 'created' && change.new_value && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Value:</span> {String(change.new_value)}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(change.changed_at), { addSuffix: true })}
                        </span>
                      </div>
                      {change.changed_by && (
                        <div className="mt-1">
                          by {change.changed_by}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No settings changes recorded yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Change Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {history.filter(h => h.change_type === 'created').length}
              </div>
              <div className="text-sm text-gray-600">Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {history.filter(h => h.change_type === 'updated').length}
              </div>
              <div className="text-sm text-gray-600">Updated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {history.filter(h => h.change_type === 'deleted').length}
              </div>
              <div className="text-sm text-gray-600">Deleted</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditSection;
