import React, { useEffect, useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Message } from '../../types';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useNavigate } from 'react-router-dom';

interface MessageNotificationProps {
  message: Message;
  onDismiss: () => void;
  autoHideDuration?: number;
}

const MessageNotification: React.FC<MessageNotificationProps> = ({
  message,
  onDismiss,
  autoHideDuration = 5000
}) => {
  const { user } = useSession();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for fade out animation
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
    // Return undefined for the else case
    return undefined;
  }, [autoHideDuration, onDismiss]);

  // Don't show notifications for own messages
  if (message.sender_id === user?.id) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const handleClick = () => {
    navigate(`/messages?conversation=${message.conversation_id}`);
    onDismiss();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const renderMessagePreview = () => {
    switch (message.message_type) {
      case 'image':
        return `📷 ${message.content || 'Sent an image'}`;
      case 'file':
        return `📎 ${message.content || 'Sent a file'}`;
      default:
        const content = message.content || '';
        return content.length > 60 
          ? `${content.substring(0, 60)}...` 
          : content;
    }
  };

  return (
    <div className={`
      fixed top-20 right-4 z-50 transition-all duration-300 transform
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div
        onClick={handleClick}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg p-4 max-w-sm cursor-pointer hover:shadow-xl transition-shadow"
      >
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {(message.sender?.avatar || message.sender?.avatar_url) ? (
              <img
                src={message.sender.avatar || message.sender.avatar_url}
                alt={message.sender.name || 'User'}
                className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-600"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {message.sender?.name || message.sender?.email || 'Unknown User'}
              </p>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {renderMessagePreview()}
            </p>
            
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              New message • Click to view
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageNotification;