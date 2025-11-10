/**
 * MenuStatistics Component
 * Displays statistics for current menu items
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MenuStatisticsProps } from '../types';

export const MenuStatistics: React.FC<MenuStatisticsProps> = ({ items }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {items.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {items.filter(item => item.is_enabled).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Enabled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {items.filter(item => item.parent_id === null).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Top Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {items.filter(item => item.parent_id !== null).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Sub Items</div>
          </div>
        </div>

        {/* Visibility breakdown */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Visibility</h5>
          <div className="space-y-1">
            {['public', 'authenticated', 'admin', 'role_based'].map(visibility => {
              const count = items.filter(item => item.visibility === visibility).length;
              return (
                <div key={visibility} className="flex justify-between text-sm">
                  <span className="capitalize text-gray-600 dark:text-gray-400">
                    {visibility.replace('_', ' ')}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
