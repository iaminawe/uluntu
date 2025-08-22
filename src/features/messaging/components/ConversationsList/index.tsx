import React, { useState, useEffect, useCallback } from 'react';
import { Edit3, Check, X, Search, Plus, Trash2, Archive, CheckSquare, Square } from 'lucide-react';
import { ConversationListProps } from '../../types';
import { DeleteConversationModal } from '../DeleteConversationModal';

interface ExtendedConversationListProps extends ConversationListProps {
  onRenameConversation?: (conversationId: string, newTitle: string) => Promise<void>;
  onNewMessage?: () => void;
  onStartNewConversation?: (participantId: string) => void;
  onDeleteConversation?: (conversationId: string) => Promise<void>;
  onDeleteConversations?: (conversationIds: string[]) => Promise<void>;
  onArchiveConversation?: (conversationId: string) => Promise<void>;
  isDeleting?: boolean;
  enableBulkActions?: boolean;
}

/**
 * Enhanced conversations list component with search, rename functionality, and new conversation button
 */
export default function ConversationsList({
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  onArchiveConversation,
  onRenameConversation,
  onNewMessage,
  onDeleteConversation,
  onDeleteConversations,
  isDeleting = false,
  enableBulkActions = true,
  loading = false,
  error = null,
  className = ''
}: ExtendedConversationListProps) {
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationsToDelete, setConversationsToDelete] = useState<any[]>([]);
  const [deleteMode, setDeleteMode] = useState<'single' | 'bulk'>('single');
  const [isBulkSelectionMode, setIsBulkSelectionMode] = useState(false);

  const handleStartEdit = (conversation: any) => {
    setEditingConversationId(conversation.id);
    setEditingTitle(conversation.title || '');
  };

  const handleSaveEdit = async (conversationId: string) => {
    if (!editingTitle.trim() || !onRenameConversation) return;
    
    setIsRenaming(true);
    try {
      await onRenameConversation(conversationId, editingTitle.trim());
      setEditingConversationId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingConversationId(null);
    setEditingTitle('');
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (conversation.title && conversation.title.toLowerCase().includes(searchLower)) ||
      (conversation.last_message?.content && conversation.last_message.content.toLowerCase().includes(searchLower))
    );
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete key functionality
      if (event.key === 'Delete' && !editingConversationId && !showDeleteModal) {
        event.preventDefault();
        if (selectedConversations.size > 0) {
          handleBulkDelete();
        } else if (selectedConversationId) {
          handleSingleDelete(selectedConversationId);
        }
      }
      
      // Escape key to cancel bulk selection
      if (event.key === 'Escape' && isBulkSelectionMode) {
        event.preventDefault();
        cancelBulkSelection();
      }

      // Ctrl/Cmd + A to select all visible conversations
      if ((event.ctrlKey || event.metaKey) && event.key === 'a' && isBulkSelectionMode) {
        event.preventDefault();
        selectAllVisibleConversations();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedConversations, selectedConversationId, editingConversationId, showDeleteModal, isBulkSelectionMode, filteredConversations]);

  // Bulk selection handlers
  const toggleConversationSelection = useCallback((conversationId: string) => {
    setSelectedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  }, []);

  const selectAllVisibleConversations = useCallback(() => {
    setSelectedConversations(new Set(filteredConversations.map(c => c.id)));
  }, [filteredConversations]);

  const clearSelection = useCallback(() => {
    setSelectedConversations(new Set());
  }, []);

  const cancelBulkSelection = useCallback(() => {
    setIsBulkSelectionMode(false);
    clearSelection();
  }, [clearSelection]);

  const enterBulkSelectionMode = useCallback(() => {
    setIsBulkSelectionMode(true);
  }, []);

  // Delete handlers
  const handleSingleDelete = useCallback((conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setConversationsToDelete([conversation]);
      setDeleteMode('single');
      setShowDeleteModal(true);
    }
  }, [conversations]);

  const handleBulkDelete = useCallback(() => {
    const conversationsToDeleteList = conversations.filter(c => selectedConversations.has(c.id));
    if (conversationsToDeleteList.length > 0) {
      setConversationsToDelete(conversationsToDeleteList);
      setDeleteMode('bulk');
      setShowDeleteModal(true);
    }
  }, [conversations, selectedConversations]);

  const confirmDelete = useCallback(async (conversationIds: string[]) => {
    try {
      if (deleteMode === 'single' && conversationIds.length === 1) {
        await onDeleteConversation?.(conversationIds[0]);
      } else if (deleteMode === 'bulk' && conversationIds.length > 0) {
        await onDeleteConversations?.(conversationIds);
      }
      
      // Clear selection and exit bulk mode if necessary
      if (isBulkSelectionMode) {
        clearSelection();
        setIsBulkSelectionMode(false);
      }
    } catch (error) {
      console.error('Error deleting conversations:', error);
      throw error; // Re-throw to let modal handle error state
    }
  }, [deleteMode, onDeleteConversation, onDeleteConversations, isBulkSelectionMode, clearSelection]);

  const hasSelectedConversations = selectedConversations.size > 0;
  const isAllVisibleSelected = filteredConversations.length > 0 && filteredConversations.every(c => selectedConversations.has(c.id));

  if (loading) {
    return (
      <div className={`flex flex-col h-full bg-white dark:bg-slate-800 ${className}`}>
        <div className="p-4 text-center text-slate-500 dark:text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col h-full bg-white dark:bg-slate-800 ${className}`}>
        <div className="p-4 text-center text-red-500">
          <p>Error loading conversations: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-800 ${className}`}>
      {/* Header with search and action buttons */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {isBulkSelectionMode ? `${selectedConversations.size} selected` : 'Messages'}
          </h2>
          <div className="flex items-center space-x-2">
            {isBulkSelectionMode ? (
              <>
                <button
                  onClick={selectAllVisibleConversations}
                  disabled={isAllVisibleSelected}
                  className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded transition-colors disabled:opacity-50"
                  title="Select all visible"
                >
                  All
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={!hasSelectedConversations || isDeleting}
                  className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 rounded transition-colors disabled:opacity-50 flex items-center space-x-1"
                  title="Delete selected"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={cancelBulkSelection}
                  className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded transition-colors"
                  title="Cancel selection"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <>
                {enableBulkActions && filteredConversations.length > 0 && (
                  <button
                    onClick={enterBulkSelectionMode}
                    className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded transition-colors"
                    title="Select conversations"
                  >
                    Select
                  </button>
                )}
                <button
                  onClick={onNewMessage}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  New
                </button>
              </>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            {searchTerm ? (
              <>
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-sm mb-4">No conversations match "{searchTerm}"</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                <p className="text-sm mb-4">Start a new conversation to get started</p>
              </>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const isSelected = selectedConversations.has(conversation.id);
            const isCurrentlySelected = selectedConversationId === conversation.id;
            
            return (
            <div
              key={conversation.id}
              className={`
                group p-4 border-b border-slate-200 dark:border-slate-600 transition-colors
                ${isBulkSelectionMode ? 'cursor-default' : 'cursor-pointer'}
                ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}
                ${isCurrentlySelected && !isBulkSelectionMode
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-r-blue-500' 
                  : ''
                }
              `}
              onClick={() => {
                if (editingConversationId !== conversation.id) {
                  if (isBulkSelectionMode) {
                    toggleConversationSelection(conversation.id);
                  } else {
                    onSelectConversation?.(conversation.id);
                  }
                }
              }}
            >
              <div className="flex items-start justify-between">
                {/* Bulk selection checkbox */}
                {isBulkSelectionMode && (
                  <div className="mr-3 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleConversationSelection(conversation.id);
                      }}
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    {editingConversationId === conversation.id ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter' && editingTitle.trim()) {
                              await handleSaveEdit(conversation.id);
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter conversation name..."
                          autoFocus
                          disabled={isRenaming}
                        />
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleSaveEdit(conversation.id);
                          }}
                          disabled={!editingTitle.trim() || isRenaming}
                          className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50 transition-colors"
                          title="Save"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                          disabled={isRenaming}
                          className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate flex-1">
                          {conversation.title || 'Untitled Conversation'}
                        </h3>
                        {conversation.unread_count && conversation.unread_count > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                            {conversation.unread_count}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {editingConversationId !== conversation.id && (
                    <>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {conversation.last_message?.content || 'No messages yet'}
                      </p>
                      {conversation.last_message?.created_at && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          {new Date(conversation.last_message.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </>
                  )}
                </div>
                {editingConversationId !== conversation.id && !isBulkSelectionMode && (
                  <div className="ml-2 flex items-center space-x-1">
                    {onRenameConversation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(conversation);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Rename conversation"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}
                    {onArchiveConversation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveConversation(conversation.id);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Archive conversation"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    )}
                    {onDeleteConversation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSingleDelete(conversation.id);
                        }}
                        disabled={isDeleting}
                        className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-25"
                        title="Delete conversation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          )
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteConversationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        conversations={conversationsToDelete}
        mode={deleteMode}
        isDeleting={isDeleting}
      />
    </div>
  );
}