import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { groupMemberManagementApi } from '@/lib/api/groups/memberManagement';

interface GroupMemberInviteProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
  onInviteSent: () => void;
}

const GroupMemberInvite: React.FC<GroupMemberInviteProps> = ({
  groupId,
  groupName,
  onClose,
  onInviteSent
}) => {
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'member' as 'admin' | 'moderator' | 'member',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await groupMemberManagementApi.createInvitation({
        group_id: groupId,
        invited_email: inviteData.email,
        role: inviteData.role,
        message: inviteData.message
      });

      if (token) {
        // Generate invite link
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/groups/invite/${token}`;
        setInviteLink(link);
        
        // Optional: Send email notification
        // This would typically be handled by your backend
        console.log('Invitation created with token:', token);
        
        // Show success message
        setTimeout(() => {
          onInviteSent();
        }, 2000);
      } else {
        setError('Failed to create invitation');
      }
    } catch (err) {
      setError('An error occurred while creating the invitation');
      console.error('Error creating invitation:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert('Invitation link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Invite Members to {groupName}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {!inviteLink ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="member@example.com"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Personal Message (Optional)
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={inviteData.message}
                  onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add a personal message to your invitation..."
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-800">
                  Invitation created successfully! Share the link below with the invitee:
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-600 mb-2">Invitation Link:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 text-sm p-2 bg-white border border-gray-300 rounded"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>This invitation will expire in 7 days.</p>
                <p>The invitee will be added as a <strong>{inviteData.role}</strong> when they accept.</p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupMemberInvite;