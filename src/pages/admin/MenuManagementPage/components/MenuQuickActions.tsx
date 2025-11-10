/**
 * MenuQuickActions Component
 * Quick action buttons for menu management
 */

import React from 'react';
import { Download, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MenuQuickActionsProps } from '../types';

export const MenuQuickActions: React.FC<MenuQuickActionsProps> = ({
  activeTab,
  items,
  onRefresh,
  isLoading
}) => {
  const handleExport = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab}-menu-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export {activeTab} Menu
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
