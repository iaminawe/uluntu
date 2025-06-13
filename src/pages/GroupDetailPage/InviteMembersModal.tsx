import React, { useState } from 'react';
import { X, Send, Mail, Copy, Check } from 'lucide-react';
import { useCreateInvitation } from '../../hooks/useGroupQueries';
import { useCurrentMember } from '../../hooks/useCurrentMember';

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

const InviteMembersModal: React.FC<InviteMembersModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName
}) => {
  const { data: currentMember } = useCurrentMember();
  const createInvitation = useCreateInvitation();
  
  const [emails, setEmails] = useState<string[]>(['']);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successfulInvites, setSuccessfulInvites] = useState<string[]>([]);
  const [inviteLinks, setInviteLinks] = useState<{ email: string; link: string }[]>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleRemoveEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMember) {
      setError('You must be logged in to send invitations');
      return;
    }

    const validEmails = emails.filter(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    });

    if (validEmails.length === 0) {
      setError('Please enter at least one valid email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessfulInvites([]);
    setInviteLinks([]);

    const results = await Promise.allSettled(
      validEmails.map(email =>
        createInvitation.mutateAsync({
          groupId,
          data: {
            email,
            invited_by: currentMember.id,
            message: message.trim() || undefined
          }
        })
      )
    );

    const successful: string[] = [];
    const links: { email: string; link: string }[] = [];
    let hasErrors = false;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        successful.push(validEmails[index]);
        // Generate invite link
        const inviteLink = `${window.location.origin}/invite/${result.value.token}`;
        links.push({ email: validEmails[index], link: inviteLink });
      } else {
        hasErrors = true;
      }
    });

    setSuccessfulInvites(successful);
    setInviteLinks(links);
    setIsSubmitting(false);

    if (successful.length > 0) {
      if (hasErrors) {
        setError(`Sent ${successful.length} invitation(s) successfully. Some invitations failed.`);
      } else {
        setError(null);
      }
      // Reset form after successful sends
      setEmails(['']);
      setMessage('');
    } else {
      setError('Failed to send invitations. Users may already be members or have pending invitations.');
    }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleClose = () => {
    onClose();
    // Reset state after a delay to avoid flicker
    setTimeout(() => {
      setEmails(['']);
      setMessage('');
      setError(null);
      setSuccessfulInvites([]);
      setInviteLinks([]);
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Invite Members to {groupName}
            </h2>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {inviteLinks.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 font-medium mb-3">
                  Invitations sent successfully!
                </p>
                <div className="space-y-2">
                  {inviteLinks.map(({ email, link }) => (
                    <div key={email} className="bg-white dark:bg-slate-700 p-3 rounded border border-green-200 dark:border-green-700">
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{email}</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={link}
                          readOnly
                          className="flex-1 px-2 py-1 text-xs bg-gray-50 dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded"
                        />
                        <button
                          onClick={() => copyLink(link)}
                          className="p-1 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          {copiedLink === link ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Addresses
                </label>
                <div className="space-y-2">
                  {emails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1 relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => handleEmailChange(index, e.target.value)}
                          placeholder="email@example.com"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                      {emails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(index)}
                          className="px-3 py-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add another email
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal note to your invitation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                />
              </div>

              {error && (
                <div className={`p-3 rounded-md text-sm ${
                  successfulInvites.length > 0 
                    ? 'bg-yellow-100 border border-yellow-200 text-yellow-800'
                    : 'bg-red-100 border border-red-200 text-red-700'
                }`}>
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Sending...' : 'Send Invitations'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteMembersModal;