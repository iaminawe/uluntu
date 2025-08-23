import React, { useState } from 'react';
import { UserPlus, Mail } from 'lucide-react';
import InviteMembersModal from './InviteMembersModal';
import InvitationsSection from './InvitationsSection';
import { useGroupInvitations } from '../../hooks/useGroupQueries';

interface InviteMembersSectionProps {
  groupId: string;
  groupName: string;
}

const InviteMembersSection: React.FC<InviteMembersSectionProps> = ({
  groupId,
  groupName
}) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const {
    data: invitations = [],
    isLoading,
    refetch
  } = useGroupInvitations(groupId);

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const completedInvitations = invitations.filter(inv => inv.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header with Invite Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Member Invitations
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Invite new members and manage pending invitations
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Members
        </button>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-orange-500" />
            Pending Invitations ({pendingInvitations.length})
          </h4>
          <InvitationsSection
            invitations={pendingInvitations}
            isLoading={isLoading}
            onRefresh={refetch}
          />
        </div>
      )}

      {/* Invitation History */}
      {completedInvitations.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-4">
            Invitation History ({completedInvitations.length})
          </h4>
          <InvitationsSection
            invitations={completedInvitations}
            isLoading={isLoading}
            onRefresh={refetch}
          />
        </div>
      )}

      {/* Empty State */}
      {invitations.length === 0 && !isLoading && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
          <div className="text-center">
            <UserPlus className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No invitations yet
            </h4>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Start building your community by inviting new members to join this group.
            </p>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mx-auto"
            >
              <UserPlus className="w-4 h-4" />
              Send Your First Invitation
            </button>
          </div>
        </div>
      )}

      {/* Invite Members Modal */}
      <InviteMembersModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        groupId={groupId}
        groupName={groupName}
      />
    </div>
  );
};

export default InviteMembersSection;