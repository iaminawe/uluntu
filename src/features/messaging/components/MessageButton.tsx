import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useCreateMarketplaceThread, useCreateOpportunityThread } from '@/hooks/useMessagingQueries';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { logger } from '@/utils/logger';

interface BaseMessageButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children?: React.ReactNode;
}

interface MarketplaceMessageButtonProps extends BaseMessageButtonProps {
  type: 'marketplace';
  itemId: string;
  itemTitle: string;
  sellerId: string;
  itemPrice?: number;
  onThreadCreated?: (threadId: string) => void;
}

interface OpportunityMessageButtonProps extends BaseMessageButtonProps {
  type: 'opportunity';
  opportunityId: string;
  opportunityTitle: string;
  recruiterId: string;
  companyId?: string;
  onThreadCreated?: (threadId: string) => void;
}

interface DirectMessageButtonProps extends BaseMessageButtonProps {
  type: 'direct';
  recipientId: string;
  recipientName: string;
  onThreadCreated?: (threadId: string) => void;
}

type MessageButtonProps = 
  | MarketplaceMessageButtonProps 
  | OpportunityMessageButtonProps 
  | DirectMessageButtonProps;

/**
 * Smart message button that creates appropriate message threads based on context
 */
export function MessageButton(props: MessageButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const createMarketplaceThread = useCreateMarketplaceThread();
  const createOpportunityThread = useCreateOpportunityThread();

  const handleMarketplaceMessage = async () => {
    if (props.type !== 'marketplace') return;
    
    if (!user) {
      toast.error('Please sign in to send messages');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      const thread = await createMarketplaceThread.mutateAsync({
        itemId: props.itemId,
        itemTitle: props.itemTitle,
        sellerId: props.sellerId,
        buyerId: user.id,
        initialMessage: message,
        itemPrice: props.itemPrice
      });

      if (thread) {
        setMessage('');
        setIsOpen(false);
        props.onThreadCreated?.(thread.id);
        toast.success('Message sent successfully!');
      }
    } catch (error) {
      logger.error('Error sending marketplace message', 'MESSAGE_BUTTON', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleOpportunityMessage = async () => {
    if (props.type !== 'opportunity') return;
    
    if (!user) {
      toast.error('Please sign in to send messages');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      const thread = await createOpportunityThread.mutateAsync({
        opportunityId: props.opportunityId,
        opportunityTitle: props.opportunityTitle,
        recruiterId: props.recruiterId,
        applicantId: user.id,
        initialMessage: message,
        companyId: props.companyId
      });

      if (thread) {
        setMessage('');
        setIsOpen(false);
        props.onThreadCreated?.(thread.id);
        toast.success('Application message sent successfully!');
      }
    } catch (error) {
      logger.error('Error sending opportunity message', 'MESSAGE_BUTTON', error);
      toast.error('Failed to send application message. Please try again.');
    }
  };

  const handleDirectMessage = async () => {
    if (props.type !== 'direct') return;
    
    // For direct messages, we'd need a different mutation
    // This is a placeholder for now
    toast('Direct messaging coming soon!');
  };

  const handleSubmit = () => {
    switch (props.type) {
      case 'marketplace':
        return handleMarketplaceMessage();
      case 'opportunity':
        return handleOpportunityMessage();
      case 'direct':
        return handleDirectMessage();
    }
  };

  const getButtonText = () => {
    switch (props.type) {
      case 'marketplace':
        return 'Message Seller';
      case 'opportunity':
        return 'Contact Recruiter';
      case 'direct':
        return 'Send Message';
    }
  };

  const getPlaceholderText = () => {
    switch (props.type) {
      case 'marketplace':
        return `Hi! I'm interested in "${props.itemTitle}". Could you provide more details?`;
      case 'opportunity':
        return `Hi! I'm interested in the "${props.opportunityTitle}" position. I'd love to learn more about this opportunity.`;
      case 'direct':
        return 'Type your message here...';
    }
  };

  const isLoading = createMarketplaceThread.isPending || createOpportunityThread.isPending;

  if (!user) {
    return (
      <Button
        variant={props.variant || 'default'}
        size={props.size || 'md'}
        disabled={true}
        className={props.className}
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Sign in to Message
      </Button>
    );
  }

  // Don't show message button to message yourself
  if (props.type === 'marketplace' && user.id === props.sellerId) {
    return null;
  }

  if (props.type === 'opportunity' && user.id === props.recruiterId) {
    return null;
  }

  if (props.type === 'direct' && user.id === props.recipientId) {
    return null;
  }

  return (
    <div className="relative">
      {!isOpen ? (
        <Button
          variant={props.variant || 'default'}
          size={props.size || 'md'}
          disabled={props.disabled || isLoading}
          className={props.className}
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {props.children || getButtonText()}
        </Button>
      ) : (
        <div className="absolute z-50 w-80 p-4 bg-white rounded-lg shadow-lg border border-gray-200 right-0 top-0">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">
                {getButtonText()}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={getPlaceholderText()}
              className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              disabled={isLoading}
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmit}
                disabled={isLoading || !message.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Convenience components for specific contexts
export function MarketplaceMessageButton(props: Omit<MarketplaceMessageButtonProps, 'type'>) {
  return <MessageButton {...props} type="marketplace" />;
}

export function OpportunityMessageButton(props: Omit<OpportunityMessageButtonProps, 'type'>) {
  return <MessageButton {...props} type="opportunity" />;
}

export function DirectMessageButton(props: Omit<DirectMessageButtonProps, 'type'>) {
  return <MessageButton {...props} type="direct" />;
}