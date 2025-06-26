import React from 'react';
import { ConversationListProps } from '../../types';

/**
 * Conversations list component with search and new conversation button
 */
export default function ConversationsList({
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  onArchiveConversation,
  loading = false,
  error = null,
  className = ''
}: ConversationListProps) {
  if (loading) {
    return <div className="loading">Loading conversations...</div>;
  }

  if (error) {
    return <div className="error">Error loading conversations: {error.message}</div>;
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-800 ${className}`}>
      {/* Header with new conversation button */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Messages
          </h2>
          <button
            onClick={() => {/* TODO: Open new message modal */}}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            New
          </button>
        </div>
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
        />
      </div>
      
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center text-slate-500 dark:text-slate-400">
            Loading conversations...
          </div>
        )}
        
        {error && (
          <div className="p-4 text-center text-red-500">
            Error: {(error as Error)?.message || 'Unknown error'}
          </div>
        )}
        
        {!loading && !error && conversations.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
            <p className="text-sm mb-4">Start a new conversation to get started</p>
          </div>
        )}
        
        {!loading && !error && conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`
              p-4 border-b border-slate-200 dark:border-slate-600 cursor-pointer
              hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors
              ${selectedConversationId === conversation.id 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-r-blue-500' 
                : ''
              }
            `}
            onClick={() => onSelectConversation?.(conversation.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-1">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {conversation.title || 'Untitled Conversation'}
                  </h3>
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {conversation.last_message?.content || 'No messages yet'}
                </p>
                {conversation.last_message?.created_at && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {new Date(conversation.last_message.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}