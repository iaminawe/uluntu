import React from 'react';
import MessageComposer from '../MessageComposer';
import { MessageListProps } from '../../types';
import MessageBubble from '../MessageBubble';

/**
 * Message thread component with composer
 */
export default function MessageThread({
  messages = [],
  conversationId,
  onReplyToMessage,
  onEditMessage,
  onDeleteMessage,
  onReactToMessage,
  loading = false,
  error = null,
  className = ''
}: MessageListProps) {
  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  if (error) {
    return <div className="error">Error loading messages: {error.message}</div>;
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Loading messages...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8 text-red-500">
            Error loading messages: {(error as Error)?.message || 'Unknown error'}
          </div>
        )}
        
        {!loading && !error && messages.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No messages yet</h3>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        )}
        
        {!loading && !error && messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onReply={onReplyToMessage}
            onEdit={onEditMessage}
            onDelete={onDeleteMessage}
            onReact={onReactToMessage}
          />
        ))}
      </div>
      
      {/* Message composer */}
      {conversationId && (
        <div className="border-t border-slate-200 dark:border-slate-600 p-4">
          <MessageComposer
            conversationId={conversationId}
            onSendMessage={(content: string) => {
              // TODO: Implement send message
              console.log('Send message:', content);
            }}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}