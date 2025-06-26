import React, { useState } from 'react';
import { MessageComposerProps } from '../../types';

/**
 * Basic message composer component - placeholder implementation
 */
export default function MessageComposer({
  conversationId,
  replyingToMessage,
  editingMessage,
  onSendMessage,
  onUpdateMessage,
  onCancelReply,
  onCancelEdit,
  disabled = false,
  className = ''
}: MessageComposerProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    if (editingMessage && onUpdateMessage) {
      onUpdateMessage(editingMessage.id, message);
    } else if (onSendMessage) {
      onSendMessage(message);
    }

    setMessage('');
  };

  return (
    <div className={`message-composer ${className}`}>
      {replyingToMessage && (
        <div className="replying-to">
          Replying to: {replyingToMessage.content}
          <button onClick={onCancelReply}>Cancel</button>
        </div>
      )}
      
      {editingMessage && (
        <div className="editing">
          Editing message
          <button onClick={onCancelEdit}>Cancel</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="composer-form">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={disabled}
          className="message-input"
        />
        <button 
          type="submit" 
          disabled={disabled || !message.trim()}
          className="send-button"
        >
          {editingMessage ? 'Update' : 'Send'}
        </button>
      </form>
    </div>
  );
}