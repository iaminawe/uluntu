import React, { useState } from 'react';
import { Settings, Users, Shield, Save, AlertTriangle, Check, X, Crown, UserX, Mail } from 'lucide-react';
import { AdminTabProps } from './types';
import { useFeature } from '@/providers/SettingsProvider';
import { useUpdateGroup, useUpdateMemberRole, useRemoveMember } from '@/hooks/useGroupQueries';
import InviteMembersSection from './InviteMembersSection';

interface GroupSettings {
  name: string;
  description: string;
  longDescription?: string;
  visibility: 'public' | 'private' | 'members_only';
  // Content permissions
  allowEvents: boolean;
  allowResources: boolean;
  allowPosts: boolean;
  allowGalleries: boolean;
  allowOpportunities: boolean;
  allowMarketplace: boolean;
}

const AdminTab: React.FC<AdminTabProps> = ({ group, members, onGroupUpdate }) => {
  const [activeSection, setActiveSection] = useState<'members' | 'invitations' | 'settings' | 'content'>('members');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{ type: 'remove' | 'role'; memberId: string; memberName: string; newRole?: 'admin' | 'member' } | null>(null);
  
  // Feature flags
  const eventsEnabled = useFeature('events_system');
  const resourcesEnabled = useFeature('resources_library');
  const postsEnabled = useFeature('news_blog');
  const galleriesEnabled = useFeature('photo_galleries');
  const opportunitiesEnabled = useFeature('opportunities_board');
  const marketplaceEnabled = useFeature('marketplace');
  
  // Mutations
  const updateGroup = useUpdateGroup();
  const updateMemberRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  
  // Initialize settings from group data
  const [settings, setSettings] = useState<GroupSettings>({
    name: group.name,
    description: group.description,
    longDescription: group.longDescription || '',
    visibility: group.visibility === 'open' ? 'public' : (group.visibility === 'closed' ? 'private' : 'members_only'),
    allowEvents: true, // Default to true, would come from group settings
    allowResources: true,
    allowPosts: true,
    allowGalleries: true,
    allowOpportunities: true,
    allowMarketplace: true,
  });
  
  // Separate admins and regular members
  const admins = members.filter(member => member.role === 'admin');
  const regularMembers = members.filter(member => member.role !== 'admin');
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateGroup.mutateAsync({
        id: group.id,
        name: settings.name,
        description: settings.description,
        longDescription: settings.longDescription,
        visibility: settings.visibility === 'public' ? 'open' : (settings.visibility === 'private' ? 'closed' : 'secret'),
        // Note: Content permissions would need to be stored in a separate table/field
      });
      
      setIsEditing(false);
      onGroupUpdate?.();
    } catch (error) {
      console.error('Failed to update group:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleMemberAction = async () => {
    if (!showConfirmDialog) return;
    
    try {
      if (showConfirmDialog.type === 'remove') {
        await removeMember.mutateAsync({
          groupId: group.id,
          memberId: showConfirmDialog.memberId
        });
      } else if (showConfirmDialog.type === 'role' && showConfirmDialog.newRole) {
        await updateMemberRole.mutateAsync({
          groupId: group.id,
          memberId: showConfirmDialog.memberId,
          role: showConfirmDialog.newRole
        });
      }
      setShowConfirmDialog(null);
    } catch (error) {
      console.error('Failed to update member:', error);
    }
  };
  
  const MemberCard = ({ member, isAdmin }: { member: any; isAdmin: boolean }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex items-center justify-between">
      <div className="flex items-center">
        <img
          src={member.image}
          alt={member.name}
          className="w-12 h-12 rounded-full object-cover mr-3"
        />
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">
            {member.name}
            {isAdmin && <Crown className="inline-block w-4 h-4 ml-2 text-orange-500" />}
          </h4>
          {member.title && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{member.title}</p>
          )}
          <p className="text-xs text-slate-400">
            Joined {new Date(member.joinedDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {!isAdmin && (
          <>
            <button
              onClick={() => setShowConfirmDialog({ 
                type: 'role', 
                memberId: member.id, 
                memberName: member.name, 
                newRole: 'admin' 
              })}
              className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
              title="Promote to admin"
            >
              <Shield className="w-4 h-4" />
            </button>
          </>
        )}
        {isAdmin && admins.length > 1 && (
          <button
            onClick={() => setShowConfirmDialog({ 
              type: 'role', 
              memberId: member.id, 
              memberName: member.name, 
              newRole: 'member' 
            })}
            className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
            title="Remove admin role"
          >
            <Crown className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => setShowConfirmDialog({ 
            type: 'remove', 
            memberId: member.id, 
            memberName: member.name 
          })}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          title="Remove from group"
        >
          <UserX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Group Administration</h2>
      </div>
      
      {/* Section Navigation */}
      <div className="flex space-x-1 mb-6 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        <button
          onClick={() => setActiveSection('members')}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'members'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Members ({members.length})
        </button>
        <button
          onClick={() => setActiveSection('invitations')}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'invitations'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4 mr-2" />
          Invitations
        </button>
        <button
          onClick={() => setActiveSection('settings')}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'settings'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </button>
        <button
          onClick={() => setActiveSection('content')}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'content'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4 mr-2" />
          Content
        </button>
      </div>
      
      {/* Members Management */}
      {activeSection === 'members' && (
        <div className="space-y-6">
          {/* Admins */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Administrators ({admins.length})
            </h3>
            <div className="space-y-3">
              {admins.map(admin => (
                <MemberCard key={admin.id} member={admin} isAdmin={true} />
              ))}
            </div>
          </div>
          
          {/* Regular Members */}
          {regularMembers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Members ({regularMembers.length})
              </h3>
              <div className="space-y-3">
                {regularMembers.map(member => (
                  <MemberCard key={member.id} member={member} isAdmin={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Invitations */}
      {activeSection === 'invitations' && (
        <div className="space-y-6">
          <InviteMembersSection 
            groupId={group.id} 
            groupName={group.name} 
          />
        </div>
      )}
      
      {/* Group Settings */}
      {activeSection === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Basic Settings</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Edit Settings
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Group Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white">{settings.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    value={settings.description}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white">{settings.description}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Group Visibility
                </label>
                {isEditing ? (
                  <select
                    value={settings.visibility}
                    onChange={(e) => setSettings({ ...settings, visibility: e.target.value as 'public' | 'private' | 'members_only' })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="public">Public - Anyone can see and join</option>
                    <option value="private">Private - Anyone can see, approval required to join</option>
                    <option value="members_only">Members Only - Only members can see</option>
                  </select>
                ) : (
                  <p className="text-slate-900 dark:text-white">
                    {settings.visibility === 'public' ? 'Public - Anyone can see and join' :
                     settings.visibility === 'private' ? 'Private - Anyone can see, approval required to join' :
                     'Members Only - Only members can see'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Content Permissions */}
      {activeSection === 'content' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Content Permissions
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Control what types of content members can create in this group. Features must be enabled site-wide to appear here.
            </p>
            
            <div className="space-y-4">
              {eventsEnabled && (
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Events</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Allow members to create and manage events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowEvents}
                      onChange={(e) => setSettings({ ...settings, allowEvents: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              )}
              
              {resourcesEnabled && (
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Resources</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Allow members to share resources and documents</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowResources}
                      onChange={(e) => setSettings({ ...settings, allowResources: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              )}
              
              {postsEnabled && (
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Posts</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Allow members to create blog posts and articles</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowPosts}
                      onChange={(e) => setSettings({ ...settings, allowPosts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              )}
              
              {galleriesEnabled && (
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Photo Galleries</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Allow members to create photo galleries</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowGalleries}
                      onChange={(e) => setSettings({ ...settings, allowGalleries: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              )}
              
              {opportunitiesEnabled && (
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Opportunities</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Allow members to post job opportunities</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowOpportunities}
                      onChange={(e) => setSettings({ ...settings, allowOpportunities: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              )}
              
              {marketplaceEnabled && (
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Marketplace</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Allow members to create marketplace listings</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowMarketplace}
                      onChange={(e) => setSettings({ ...settings, allowMarketplace: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Content Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Confirm Action
              </h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {showConfirmDialog.type === 'remove' 
                ? `Are you sure you want to remove ${showConfirmDialog.memberName} from this group? This action cannot be undone.`
                : `Are you sure you want to ${showConfirmDialog.newRole === 'admin' ? 'promote' : 'demote'} ${showConfirmDialog.memberName} ${showConfirmDialog.newRole === 'admin' ? 'to admin' : 'from admin'}?`
              }
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleMemberAction}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                  showConfirmDialog.type === 'remove' 
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                <Check className="w-4 h-4 mr-2" />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTab;