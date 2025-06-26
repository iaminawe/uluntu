import React from 'react';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isOwn?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, reaction: string) => void;
  className?: string;
}

/**
 * Basic message bubble component - placeholder implementation
 */
export default function MessageBubble({
  message,
  isOwn = false,
  onReply,
  onEdit,
  onDelete,
  onReact,
  className = ''
}: MessageBubbleProps) {
  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'} ${className}`}>
      <div className="message-content">
        <div className="sender-name">{message.sender.name}</div>
        <div className="message-text">{message.content}</div>
        <div className="message-time">
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}