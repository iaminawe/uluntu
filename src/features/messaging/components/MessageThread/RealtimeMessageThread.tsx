import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Send, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useRealtimeChat } from '../../hooks/useRealtimeChat';
import { useMessages } from '@/hooks/useMessagingQueries';
import MessageBubble from '../MessageBubble';
import TypingIndicator from '../TypingIndicator';
import { Message } from '../../types';

interface RealtimeMessageThreadProps {
  conversationId: string;
  className?: string;
}

export default function RealtimeMessageThread({ 
  conversationId, 
  className = '' 
}: RealtimeMessageThreadProps) {
  const [message, setMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch messages with React Query
  const { data: messages = [], isLoading, error } = useMessages(conversationId);

  // Realtime functionality
  const {
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    sendTypingIndicator,
    requestNotificationPermission
  } = useRealtimeChat(conversationId);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    if (e.target.value.length > 0) {
      sendTypingIndicator(true);
      
      // Stop typing after 1.5 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false);
      }, 1500);
    } else {
      sendTypingIndicator(false);
    }
  };

  // Handle send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!message.trim()) return;

    try {
      if (editingMessage) {
        // Edit existing message
        await editMessage(editingMessage.id, message.trim());
        setEditingMessage(null);
      } else {
        // Send new message
        await sendMessage(message.trim(), replyingTo?.id);
        setReplyingTo(null);
      }
      
      setMessage('');
      sendTypingIndicator(false);
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    if (e.key === 'Escape') {
      setEditingMessage(null);
      setReplyingTo(null);
    }
  };

  // Handle edit message
  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    setMessage(message.content);
    textareaRef.current?.focus();
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };

  // Handle reply to message
  const handleReplyToMessage = (message: Message) => {
    setReplyingTo(message);
    textareaRef.current?.focus();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Error loading messages: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Connection status */}
      {!isConnected && (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-4 py-2 text-sm">
          Connecting to chat...
        </div>
      )}

      {/* Online users */}
      {onlineUsers.length > 0 && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Online:</span>
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 5).map((user) => (
                <div
                  key={user.user_id}
                  className="relative"
                  title={user.username}
                >
                  <img
                    src={user.avatar_url || '/default-avatar.png'}
                    alt={user.username || 'User'}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800"
                  />
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-slate-800"></div>
                </div>
              ))}
              {onlineUsers.length > 5 && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs">
                  +{onlineUsers.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onReply={() => handleReplyToMessage(msg)}
                onEdit={() => handleEditMessage(msg)}
                onDelete={() => handleDeleteMessage(msg.id)}
              />
            ))}
          </>
        )}
        
        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <TypingIndicator />
            <span>
              {typingUsers.map(u => u.username).join(', ')} 
              {typingUsers.length === 1 ? ' is' : ' are'} typing...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">Replying to:</span>
              <span className="text-sm truncate">{replyingTo.content}</span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Edit indicator */}
      {editingMessage && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Edit2 className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700 dark:text-blue-300">Editing message</span>
            </div>
            <button
              onClick={() => {
                setEditingMessage(null);
                setMessage('');
              }}
              className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Message composer */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex space-x-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              editingMessage 
                ? "Edit your message..." 
                : replyingTo 
                  ? "Type your reply..."
                  : "Type a message..."
            }
            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
    </div>
  );
}