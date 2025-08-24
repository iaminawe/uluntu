import React, { useState, useMemo } from 'react';
import { Message } from '../../types';
import { MoreVertical, Reply, Edit2, Trash2, Check, X } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn?: boolean;
  showSenderName?: boolean; // Show sender name in group chats
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, reaction: string) => void;
  className?: string;
}

// Generate a consistent color for each user based on their ID
const getUserColor = (userId: string): string => {
  const colors = [
    'bg-purple-500',
    'bg-green-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500',
    'bg-orange-500',
  ];
  
  // Simple hash function to get consistent color per user
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash;
  }
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Enhanced message bubble component with proper chat UI styling
 * Supports both direct messages and multi-user conversations
 */
export default function MessageBubble({
  message,
  isOwn = false,
  showSenderName = false,
  onReply,
  onEdit,
  onDelete,
  onReact,
  className = ''
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  
  // Handle case where sender might be undefined (e.g., optimistic updates)
  const senderName = message.sender?.name || 'Unknown';
  const senderAvatar = message.sender?.avatar_url || message.sender?.avatar || message.sender?.image;
  const senderInitials = senderName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  // Get consistent color for non-own messages
  const bubbleColor = useMemo(() => {
    if (isOwn) return 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white';
    return `${getUserColor(message.sender_id)} text-white`;
  }, [isOwn, message.sender_id]);
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <div 
      className={`
        flex items-end gap-2 mb-4
        ${isOwn ? 'justify-start' : 'justify-end'}
        ${className}
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar for current user (left side) */}
      {isOwn && (
        <div className="flex-shrink-0 mb-1">
          {senderAvatar ? (
            <img
              src={senderAvatar}
              alt={senderName}
              className="w-8 h-8 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-slate-200 dark:border-slate-700 bg-slate-500 dark:bg-slate-600">
              {senderInitials}
            </div>
          )}
        </div>
      )}
      
      {/* Message content and actions */}
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-start' : 'items-end'}`}>
        {/* Sender name - shown in group chats for other users */}
        {showSenderName && !isOwn && (
          <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 mr-3">
            {senderName}
          </span>
        )}
        
        <div className={`flex items-center gap-2 ${isOwn ? 'flex-row' : 'flex-row-reverse'}`}>
          {/* Message bubble */}
          <div
            className={`
              relative px-4 py-2 rounded-2xl shadow-sm
              ${isOwn 
                ? 'rounded-bl-sm border border-slate-200 dark:border-slate-600' 
                : 'rounded-br-sm'
              } ${bubbleColor}
            `}
          >
            {/* Reply indicator */}
            {message.parent_message_id && (
              <div className={`
                text-xs mb-1 pb-1 border-b
                ${isOwn 
                  ? 'border-slate-400/50 text-slate-600 dark:text-slate-300' 
                  : 'border-white/30 text-white/80'
                }
              `}>
                <Reply className="inline h-3 w-3 mr-1" />
                Replying to message
              </div>
            )}
            
            {/* Message content */}
            <div className="break-words whitespace-pre-wrap">
              {message.content}
            </div>
            
            {/* Edited indicator */}
            {message.edited_at && (
              <span className={`
                text-xs italic
                ${isOwn ? 'text-slate-500 dark:text-slate-400' : 'text-white/70'}
              `}>
                {' '}(edited)
              </span>
            )}
            
            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 -mb-1">
                {message.reactions.map((reaction, index) => (
                  <span
                    key={index}
                    className={`
                      inline-flex items-center px-2 py-0.5 rounded-full text-xs
                      ${isOwn 
                        ? 'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300' 
                        : 'bg-white/20 text-white'
                      }
                    `}
                  >
                    {reaction.emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Action buttons - shown on hover */}
          {showActions && (
            <div className={`
              flex items-center gap-1
              ${!isOwn ? 'order-first' : ''}
            `}>
              {onReply && (
                <button
                  onClick={() => onReply(message)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                  title="Reply"
                >
                  <Reply className="h-4 w-4" />
                </button>
              )}
              
              {isOwn && onEdit && (
                <button
                  onClick={() => onEdit(message)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
              
              {isOwn && onDelete && (
                <button
                  onClick={() => onDelete(message.id)}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              
              {/* Emoji reactions button */}
              {onReact && (
                <div className="relative group">
                  <button
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                    title="React"
                  >
                    <span className="text-sm">😊</span>
                  </button>
                  
                  {/* Quick emoji picker on hover */}
                  <div className="absolute bottom-full mb-1 hidden group-hover:flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600">
                    {['👍', '❤️', '😂', '😮', '😢', '🎉'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => onReact(message.id, emoji)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <span className={`
          text-xs mt-1
          ${isOwn 
            ? 'text-slate-400 dark:text-slate-500 ml-3' 
            : 'text-slate-500 dark:text-slate-400 mr-3'
          }
        `}>
          {formatTime(message.created_at)}
        </span>
      </div>
      
      {/* Avatar for other users (right side) */}
      {!isOwn && (
        <div className="flex-shrink-0 mb-1">
          {senderAvatar ? (
            <img
              src={senderAvatar}
              alt={senderName}
              className="w-8 h-8 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-slate-200 dark:border-slate-700 ${getUserColor(message.sender_id)}`}>
              {senderInitials}
            </div>
          )}
        </div>
      )}
    </div>
  );
}