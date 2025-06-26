import React from 'react';
import { MessageCircle, Mail } from 'lucide-react';
import { useFeatureToggle } from '@/utils/featureToggle';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useCreateConversation } from '@/hooks/useMessagingQueries';
import { useNavigate } from 'react-router-dom';

interface DirectMessageButtonProps {
  recipientId: string;
  recipientName: string;
  onEmailFallback: () => void; // Fallback to email contact form
  className?: string;
}

/**
 * Button that shows "Send Message" for logged-in users when messaging is enabled,
 * or falls back to email contact for non-authenticated users or when messaging is disabled
 */
export function DirectMessageButton({
  recipientId,
  recipientName,
  onEmailFallback,
  className = ''
}: DirectMessageButtonProps) {
  const { user } = useSession();
  const navigate = useNavigate();
  const { enabled: isMessagingEnabled, loading } = useFeatureToggle('user_messaging');
  const createConversation = useCreateConversation();

  // Don't allow messaging yourself
  if (user?.id === recipientId) {
    return null;
  }

  // If user is not logged in, show email contact button
  if (!user) {
    return (
      <button
        onClick={onEmailFallback}
        className={`px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors flex items-center ${className}`}
      >
        <Mail className="h-4 w-4 mr-2" />
        Contact
      </button>
    );
  }

  // If messaging is disabled or still loading, show email contact button
  if (loading || !isMessagingEnabled) {
    return (
      <button
        onClick={onEmailFallback}
        className={`px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors flex items-center ${className}`}
      >
        <Mail className="h-4 w-4 mr-2" />
        Contact
      </button>
    );
  }

  // User is logged in and messaging is enabled - show direct message button
  const handleDirectMessage = async () => {
    try {
      const conversation = await createConversation.mutateAsync({
        type: 'direct',
        participant_ids: [recipientId],
        initial_message: `Hi ${recipientName}! I'd like to connect with you.`
      });
      
      // Navigate to messages page with the new conversation selected
      navigate(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // Fall back to email contact on error
      onEmailFallback();
    }
  };

  return (
    <button
      onClick={handleDirectMessage}
      disabled={createConversation.isPending}
      className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center ${className}`}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {createConversation.isPending ? 'Creating...' : 'Send Message'}
    </button>
  );
}

export default DirectMessageButton;