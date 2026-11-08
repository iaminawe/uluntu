import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useInvitationByToken, useAcceptInvitation, useGroupMembership } from '../hooks/useGroupQueries';
import { useCurrentMember } from '../hooks/useCurrentMember';
import { ContentContainer } from '../components/ui/PageLayout';
import { Card } from '../components/ui/Card';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

export default function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { data: currentMember } = useCurrentMember();
  const { data: invitation, isLoading: invitationLoading } = useInvitationByToken(token);
  const acceptInvitation = useAcceptInvitation();
  const { data: isMember } = useGroupMembership(invitation?.group_id, currentMember?.id);
  
  const [status, setStatus] = useState<'loading' | 'valid' | 'expired' | 'invalid' | 'already_member' | 'accepted' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!invitationLoading && invitation) {
      if (invitation.status === 'accepted') {
        setStatus('accepted');
      } else if (invitation.status === 'expired' || new Date(invitation.expires_at) < new Date()) {
        setStatus('expired');
      } else if (isMember) {
        setStatus('already_member');
      } else {
        setStatus('valid');
      }
    } else if (!invitationLoading && !invitation) {
      setStatus('invalid');
    }
  }, [invitation, invitationLoading, isMember]);

  const handleAccept = async () => {
    if (!currentMember) {
      navigate('/signin?redirect=/invite/' + token);
      return;
    }

    try {
      const success = await acceptInvitation.mutateAsync({
        token: token!,
        memberId: currentMember.id
      });

      if (success) {
        setStatus('accepted');
        setTimeout(() => {
          navigate(`/groups/${invitation.group_id}`);
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage('Failed to accept invitation. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('An error occurred while accepting the invitation.');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary-500" />
            <p className="text-slate-600 dark:text-slate-300">Loading invitation...</p>
          </div>
        );

      case 'valid':
        return (
          <div className="text-center py-12">
            <div className="mb-8">
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-10 w-10 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                You're invited to join {invitation?.group?.name}!
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-2">
                {invitation?.inviter?.name} has invited you to join this group.
              </p>
              {invitation?.message && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                    "{invitation.message}"
                  </p>
                </div>
              )}
            </div>

            {!currentMember ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Please sign in to accept this invitation
                </p>
                <button
                  onClick={() => navigate('/signin?redirect=/invite/' + token)}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Sign In to Accept
                </button>
              </div>
            ) : (
              <button
                onClick={handleAccept}
                disabled={acceptInvitation.isPending}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {acceptInvitation.isPending ? 'Accepting...' : 'Accept Invitation'}
              </button>
            )}
          </div>
        );

      case 'expired':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Invitation Expired
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              This invitation has expired. Please request a new invitation from a group admin.
            </p>
            <button
              onClick={() => navigate('/groups')}
              className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Browse Groups
            </button>
          </div>
        );

      case 'invalid':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Invalid Invitation
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              This invitation link is invalid or has already been used.
            </p>
            <button
              onClick={() => navigate('/groups')}
              className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Browse Groups
            </button>
          </div>
        );

      case 'already_member':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Already a Member
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              You're already a member of {invitation?.group?.name}.
            </p>
            <button
              onClick={() => navigate(`/groups/${invitation?.group_id}`)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Go to Group
            </button>
          </div>
        );

      case 'accepted':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome to {invitation?.group?.name}!
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              You've successfully joined the group. Redirecting...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Accept Invitation - Uluntu</title>
        <meta name="description" content="Accept your invitation to join a group" />
      </Helmet>

      <ContentContainer maxWidth="md">
        <Card className="mt-8">
          {renderContent()}
        </Card>
      </ContentContainer>
    </>
  );
}