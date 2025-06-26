import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useFeatureToggle } from '@/utils/featureToggle';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useCreateMarketplaceThread } from '@/hooks/useMessagingQueries';
import { useNavigate } from 'react-router-dom';

interface MessageSellerButtonProps {
  sellerId: string;
  sellerName: string;
  itemId: string;
  itemTitle: string;
  itemType: 'marketplace' | 'opportunity';
  fullWidth?: boolean;
  className?: string;
}

/**
 * Button to initiate messaging with marketplace sellers or opportunity posters
 */
export function MessageSellerButton({
  sellerId,
  sellerName,
  itemId,
  itemTitle,
  itemType = 'marketplace',
  fullWidth = false,
  className = ''
}: MessageSellerButtonProps) {
  const { user } = useSession();
  const navigate = useNavigate();
  const { enabled: isMessagingEnabled, loading } = useFeatureToggle('user_messaging');
  const createMarketplaceThread = useCreateMarketplaceThread();

  // Don't render if messaging is disabled or still loading
  if (loading || !isMessagingEnabled) {
    return null;
  }

  // Don't allow messaging yourself
  if (user?.id === sellerId) {
    return null;
  }

  // Require authentication
  if (!user) {
    return null;
  }

  const handleMessageSeller = async () => {
    try {
      const thread = await createMarketplaceThread.mutateAsync({
        sellerId,
        buyerId: 'current-user-id', // Should be from user session
        itemId,
        itemTitle,
        initialMessage: `Hi! I'm interested in ${itemTitle}`
      });
      
      // Navigate to messages page with the new thread selected
      navigate(`/messages?thread=${thread.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  return (
    <button
      onClick={handleMessageSeller}
      disabled={createMarketplaceThread.isPending}
      className={`
        ${fullWidth ? 'w-full' : ''}
        px-4 py-2 bg-blue-500 text-white rounded-lg 
        hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors flex items-center justify-center
        ${className}
      `}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {createMarketplaceThread.isPending ? 'Creating...' : `Message ${sellerName}`}
    </button>
  );
}

export default MessageSellerButton;