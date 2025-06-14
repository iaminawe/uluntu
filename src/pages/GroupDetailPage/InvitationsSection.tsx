import React from 'react';
import { Mail, Clock, X, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useCancelInvitation } from '../../hooks/useGroupQueries';

interface Invitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
  accepted_at?: string;
  inviter: {
    name: string;
    image: string;
  };
}

interface InvitationsSectionProps {
  invitations: Invitation[];
  isLoading: boolean;
  onRefresh: () => void;
}

const InvitationsSection: React.FC<InvitationsSectionProps> = ({ 
  invitations, 
  isLoading,
  onRefresh 
}) => {
  const cancelInvitation = useCancelInvitation();

  const handleCancel = async (invitationId: string) => {
    if (window.confirm('Cancel this invitation?')) {
      await cancelInvitation.mutateAsync(invitationId);
      onRefresh();
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-200 dark:bg-slate-700 h-20 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No invitations sent yet</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'declined':
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'declined':
      case 'expired':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    }
  };

  return (
    <div className="space-y-3">
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img
                  src={invitation.inviter.image}
                  alt={invitation.inviter.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {invitation.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Invited by {invitation.inviter.name} • {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(invitation.status)}`}>
                {getStatusIcon(invitation.status)}
                <span className="capitalize">{invitation.status}</span>
              </div>
              
              {invitation.status === 'pending' && new Date(invitation.expires_at) > new Date() && (
                <button
                  onClick={() => handleCancel(invitation.id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  title="Cancel invitation"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {invitation.status === 'pending' && (
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
            </div>
          )}

          {invitation.accepted_at && (
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Joined {formatDistanceToNow(new Date(invitation.accepted_at), { addSuffix: true })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InvitationsSection;