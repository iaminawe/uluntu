import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { 
  UsersIcon, 
  CogIcon, 
  EnvelopeIcon, 
  ChartBarIcon,
  ClockIcon,
  PlusCircleIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { groupsApi } from '@/features/groups/api/groupsApi';
import { groupMemberManagementApi } from '@/lib/api/groups/memberManagement';
import { groupPostsApi } from '@/lib/api/groups/postsApi';
import GroupMemberInvite from './GroupMemberInvite';

interface GroupAdminPanelProps {
  groupId: string;
  groupName: string;
  currentUserId: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const GroupAdminPanel: React.FC<GroupAdminPanelProps> = ({ groupId, groupName, currentUserId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [groupSettings, setGroupSettings] = useState<any>({});
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalPosts: 0,
    weeklyActivity: 0
  });
  const [loading, setLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    setLoading(true);
    try {
      // Load members
      const { members: memberList } = await groupMemberManagementApi.getGroupMembers(groupId);
      setMembers(memberList);

      // Load invitations
      const invitationList = await groupMemberManagementApi.getGroupInvitations(groupId);
      setInvitations(invitationList);

      // Load activities
      const { activities: activityList } = await groupPostsApi.getGroupActivities(groupId);
      setActivities(activityList);

      // Load group details for settings
      const groupData = await groupsApi.getById(groupId);
      if (groupData) {
        setGroupSettings({
          name: groupData.name,
          description: groupData.description,
          visibility: groupData.visibility,
          maxMembers: (groupData as any).max_members || 100,
          settings: (groupData as any).settings || {}
        });
      }

      // Calculate stats
      setStats({
        totalMembers: memberList.length,
        activeMembers: memberList.filter((m: any) => m.status === 'active').length,
        totalPosts: 0, // Will be updated when posts are loaded
        weeklyActivity: activityList.filter((a: any) => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(a.created_at) > weekAgo;
        }).length
      });
    } catch (error) {
      console.error('Error loading group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      const success = await groupMemberManagementApi.removeMember(groupId, memberId);
      if (success) {
        loadGroupData();
      }
    }
  };

  const handleChangeRole = async (memberId: string, newRole: 'admin' | 'moderator' | 'member') => {
    const success = await groupMemberManagementApi.updateMemberRole({
      group_id: groupId,
      member_id: memberId,
      role: newRole
    });
    if (success) {
      loadGroupData();
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    const success = await groupMemberManagementApi.cancelInvitation(invitationId);
    if (success) {
      loadGroupData();
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await groupsApi.update(groupId, groupSettings);
    if (success) {
      alert('Settings updated successfully');
    }
  };

  const tabs = [
    { name: 'Members', icon: UsersIcon },
    { name: 'Settings', icon: CogIcon },
    { name: 'Invitations', icon: EnvelopeIcon },
    { name: 'Activity', icon: ClockIcon },
    { name: 'Statistics', icon: ChartBarIcon }
  ];

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-t-lg bg-gray-100 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-900'
                )
              }
            >
              <div className="flex items-center justify-center">
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </div>
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="p-6">
          {/* Members Tab */}
          <Tab.Panel>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Group Members ({members.length})</h3>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  Invite Members
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={member.image || '/default-avatar.png'}
                              alt={member.name}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.title || 'Member'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={member.role}
                            onChange={(e) => handleChangeRole(member.id, e.target.value as any)}
                            className="text-sm border-gray-300 rounded-md"
                            disabled={member.id === currentUserId}
                          >
                            <option value="member">Member</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            member.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(member.joined_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {member.id !== currentUserId && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab.Panel>

          {/* Settings Tab */}
          <Tab.Panel>
            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <h3 className="text-lg font-semibold">Group Settings</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Group Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={groupSettings.name || ''}
                  onChange={(e) => setGroupSettings({ ...groupSettings, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={groupSettings.description || ''}
                  onChange={(e) => setGroupSettings({ ...groupSettings, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                  Visibility
                </label>
                <select
                  id="visibility"
                  value={groupSettings.visibility || 'open'}
                  onChange={(e) => setGroupSettings({ ...groupSettings, visibility: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="open">Open - Anyone can join</option>
                  <option value="closed">Closed - Requires approval</option>
                  <option value="secret">Secret - Invite only</option>
                </select>
              </div>

              <div>
                <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700">
                  Maximum Members
                </label>
                <input
                  type="number"
                  id="maxMembers"
                  value={groupSettings.maxMembers || 100}
                  onChange={(e) => setGroupSettings({ ...groupSettings, maxMembers: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
            </form>
          </Tab.Panel>

          {/* Invitations Tab */}
          <Tab.Panel>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pending Invitations ({invitations.length})</h3>
              
              {invitations.length === 0 ? (
                <p className="text-gray-500">No pending invitations</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invited
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invited By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expires
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invitations.map((invitation) => (
                        <tr key={invitation.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {invitation.invited_email || invitation.invited_member?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {invitation.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {invitation.invited_by_member?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invitation.expires_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleCancelInvitation(invitation.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Tab.Panel>

          {/* Activity Tab */}
          <Tab.Panel>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              
              <div className="flow-root">
                <ul className="-mb-8">
                  {activities.slice(0, 20).map((activity, idx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {idx !== activities.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <ClockIcon className="h-5 w-5 text-white" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">
                                  {activity.actor?.name || 'System'}
                                </span>{' '}
                                {activity.action.replace(/_/g, ' ')}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              {new Date(activity.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Tab.Panel>

          {/* Statistics Tab */}
          <Tab.Panel>
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Group Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Total Members</div>
                  <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalMembers}</div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Active Members</div>
                  <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.activeMembers}</div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Total Posts</div>
                  <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalPosts}</div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Weekly Activity</div>
                  <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.weeklyActivity}</div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-md font-semibold mb-4">Activity Trend</h4>
                <div className="bg-gray-50 h-64 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Activity chart coming soon</p>
                </div>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Invite Modal */}
      {showInviteModal && (
        <GroupMemberInvite
          groupId={groupId}
          groupName={groupName}
          onClose={() => setShowInviteModal(false)}
          onInviteSent={() => {
            setShowInviteModal(false);
            loadGroupData();
          }}
        />
      )}
    </div>
  );
};

export default GroupAdminPanel;