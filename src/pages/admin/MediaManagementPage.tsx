import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Image, BarChart3, Settings, Users, Shield } from 'lucide-react';
import GalleryManagementPanel from '@/components/admin/media/GalleryManagementPanel';
import PhotoModerationQueue from '@/components/admin/media/PhotoModerationQueue';
import PhotoModerationInterface from '@/components/admin/media/PhotoModerationInterface';
import StorageAnalytics from '@/components/admin/media/StorageAnalytics';
import EntityGalleryManager from '@/components/admin/media/EntityGalleryManager';

const MediaManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('galleries');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Media Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage galleries, photos, and media assignments across the platform
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="galleries" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Galleries
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Moderation
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Queue
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="galleries" className="space-y-6">
          <GalleryManagementPanel />
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <PhotoModerationInterface />
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          <PhotoModerationQueue />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <StorageAnalytics />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <EntityGalleryManager />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Media Settings
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Upload Size (MB)
                  </label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Allowed File Types
                  </label>
                  <input
                    type="text"
                    defaultValue="jpg,jpeg,png,gif,webp"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enable automatic image optimization
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Generate thumbnails automatically
                  </span>
                </label>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaManagementPage;