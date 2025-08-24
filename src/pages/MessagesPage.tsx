import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Menu, X, Edit3, Check, X as XIcon, AlertCircle } from 'lucide-react';
import ConversationsList from '@/features/messaging/components/ConversationsList';
import RealtimeMessageThread from '@/features/messaging/components/MessageThread/RealtimeMessageThread';
import EnhancedNewMessageModal from '@/features/messaging/components/NewMessageModal/EnhancedNewMessageModal';
import { useMessagingHybrid } from '@/features/messaging/hooks/useMessagingHybrid';
import { useDeleteConversation, useDeleteConversations } from '@/hooks/useMessagingQueries';
import { messagingApi } from '@/features/messaging/api/messagingApi.real';
import { ContentContainer, PageHeader } from '@/shared/components/ui/PageLayout';
import { ErrorDisplay } from '@/shared/components/ui/ErrorDisplay';
import { Button } from '@/shared/components/ui/Button';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { 
  ConversationSwitchContext, 
  ConversationIsolationError, 
  isConversationIsolationError 
} from '@/features/messaging/types';

const MessagesPage: React.FC = () => {
  const { user } = useSession();
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [editingConversationTitle, setEditingConversationTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isolationErrors, setIsolationErrors] = useState<ConversationIsolationError[]>([]);
  
  const {
    conversations,
    isLoadingConversations,
    conversationsError,
    selectedConversationId,
    selectedConversation,
    isLoadingSelectedConversation,
    sidebarOpen,
    setSidebarOpen,
    selectConversation,
    createConversation,
    updateConversation,
    composerState,
    messages,
    isLoading,
    isSendingMessage,
    sendMessage
  } = useMessagingHybrid();

  // Handle composer state
  React.useEffect(() => {
    if (composerState.open && composerState.recipientId) {
      setShowNewMessageModal(true);
    }
  }, [composerState]);

  const handleSelectConversation = (conversationIdOrObject: any) => {
    // Handle both ID string and conversation object
    const conversationId = typeof conversationIdOrObject === 'string' 
      ? conversationIdOrObject 
      : conversationIdOrObject.id;
    
    selectConversation(conversationId);
    // On mobile, hide sidebar when selecting conversation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleBack = () => {
    selectConversation('');
    setSidebarOpen(true);
  };

  const handleNewMessage = () => {
    setShowNewMessageModal(true);
  };

  const showNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle conversation isolation errors
  const handleConversationSwitch = (context: ConversationSwitchContext) => {
    console.log('Conversation switch:', context);
    // Clear any previous isolation errors when switching conversations
    setIsolationErrors([]);
  };

  const handleIsolationError = (error: ConversationIsolationError) => {
    console.error('Conversation isolation error:', error);
    setIsolationErrors(prev => [...prev, error]);
    showNotification('warning', 
      `Conversation isolation issue: ${error.message}. Please refresh if messages appear mixed.`
    );
  };

  // Deletion hooks and mutations
  const deleteConversationMutation = useDeleteConversation();
  const deleteConversationsMutation = useDeleteConversations();

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      setIsDeleting(true);
      await deleteConversationMutation.mutateAsync(conversationId);
      
      // If we deleted the currently selected conversation, clear selection
      if (selectedConversationId === conversationId) {
        selectConversation('');
        setSidebarOpen(true);
      }
      
      showNotification('success', 'Conversation deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete conversation:', error);
      showNotification('error', error.message || 'Failed to delete conversation');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteConversations = async (conversationIds: string[]) => {
    try {
      setIsDeleting(true);
      await deleteConversationsMutation.mutateAsync(conversationIds);
      
      // If we deleted the currently selected conversation, clear selection
      if (conversationIds.includes(selectedConversationId || '')) {
        selectConversation('');
        setSidebarOpen(true);
      }
      
      const count = conversationIds.length;
      showNotification('success', `${count} conversation${count > 1 ? 's' : ''} deleted successfully`);
    } catch (error: any) {
      console.error('Failed to delete conversations:', error);
      showNotification('error', error.message || 'Failed to delete conversations');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      await messagingApi.archiveConversation(conversationId);
      
      // If we archived the currently selected conversation, clear selection
      if (selectedConversationId === conversationId) {
        selectConversation('');
        setSidebarOpen(true);
      }
      
      showNotification('success', 'Conversation archived successfully');
      
      // Refresh conversations list
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to archive conversation:', error);
      showNotification('error', error.message || 'Failed to archive conversation');
    }
  };

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!user) {
    return (
      <ContentContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Sign in to access messages
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You need to be signed in to view and send messages.
            </p>
            <Button>
              <a href="/signin">Sign In</a>
            </Button>
          </div>
        </div>
      </ContentContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>Messages - Nelson Tech Community</title>
        <meta name="description" content="Communicate with other community members" />
      </Helmet>
      
      <div className="h-[calc(100vh-8rem)] max-w-7xl mx-auto flex bg-slate-50 dark:bg-slate-900 relative">
        {/* Mobile header */}
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-600 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              {selectedConversationId ? 'Messages' : 'Conversations'}
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Conversations sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 transition-transform duration-300 ease-in-out
          fixed md:relative top-16 md:top-0 left-0 z-30
          w-80 md:w-96 h-[calc(100vh-8rem)] md:h-full
          border-r border-slate-200 dark:border-slate-600
          bg-white dark:bg-slate-800
        `}>
          {conversationsError ? (
            <div className="p-4">
              <ErrorDisplay 
                title="Error loading conversations"
                message={conversationsError?.message || "Failed to load conversations. Please try again."}
                primaryAction={{
                  onClick: () => window.location.reload(),
                  text: "Retry"
                }}
              />
            </div>
          ) : (
            <ConversationsList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              onRenameConversation={async (id: string, title: string) => {
                try {
                  await updateConversation(id, { title });
                  showNotification('success', 'Conversation renamed successfully');
                } catch (error) {
                  console.error('Failed to rename conversation:', error);
                  showNotification('error', 'Failed to rename conversation');
                  throw error;
                }
              }}
              onDeleteConversation={handleDeleteConversation}
              onDeleteConversations={handleDeleteConversations}
              onArchiveConversation={handleArchiveConversation}
              onNewMessage={handleNewMessage}
              isDeleting={isDeleting || deleteConversationMutation.isPending || deleteConversationsMutation.isPending}
              enableBulkActions={true}
              loading={isLoadingConversations}
              error={conversationsError}
            />
          )}
        </div>
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 top-16 bg-black/50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Message thread */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedConversationId && selectedConversation ? (
            <div className="flex flex-col h-full">
              {/* Thread header */}
              <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-600 p-4">
                <div className="flex items-center">
                  <button
                    onClick={handleBack}
                    className="md:hidden mr-3 p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    ←
                  </button>
                  <div className="flex items-center flex-1 group">
                    {editingConversationTitle ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={tempTitle}
                          onChange={(e) => setTempTitle(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter' && tempTitle.trim()) {
                              try {
                                await updateConversation(selectedConversationId!, { title: tempTitle.trim() });
                                setEditingConversationTitle(false);
                                setTempTitle('');
                                showNotification('success', 'Conversation renamed successfully');
                              } catch (error) {
                                console.error('Failed to update conversation title:', error);
                                showNotification('error', 'Failed to rename conversation');
                              }
                            } else if (e.key === 'Escape') {
                              setEditingConversationTitle(false);
                              setTempTitle('');
                            }
                          }}
                          className="flex-1 px-2 py-1 text-lg font-semibold border border-blue-500 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter conversation name..."
                          autoFocus
                        />
                        <button
                          onClick={async () => {
                            if (tempTitle.trim()) {
                              try {
                                await updateConversation(selectedConversationId!, { title: tempTitle.trim() });
                                setEditingConversationTitle(false);
                                setTempTitle('');
                                showNotification('success', 'Conversation renamed successfully');
                              } catch (error) {
                                console.error('Failed to update conversation title:', error);
                                showNotification('error', 'Failed to rename conversation');
                              }
                            }
                          }}
                          disabled={!tempTitle.trim()}
                          className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50 transition-colors"
                          title="Save"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingConversationTitle(false);
                            setTempTitle('');
                          }}
                          className="p-1 text-red-600 hover:text-red-700 transition-colors"
                          title="Cancel"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex-1">
                          {selectedConversation?.title || 'Conversation'}
                        </h2>
                        <button
                          onClick={() => {
                            setEditingConversationTitle(true);
                            setTempTitle(selectedConversation?.title || '');
                          }}
                          className="ml-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          title="Rename conversation"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Message thread with isolation error handling */}
              <RealtimeMessageThread
                conversationId={selectedConversationId}
                onConversationSwitch={handleConversationSwitch}
                onIsolationError={handleIsolationError}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-800">
              <div className="text-center text-slate-500 dark:text-slate-400">
                <div className="mb-4">
                  <svg className="mx-auto h-16 w-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="mb-4">Choose from your existing conversations or start a new one</p>
                <Button onClick={handleNewMessage}>
                  Start New Conversation
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Notification */}
        {notification && (
          <div className={`
            fixed top-20 right-4 z-50 max-w-sm px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform
            ${notification.type === 'success' 
              ? 'bg-green-100 border border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-400 dark:text-green-200' 
              : notification.type === 'warning'
              ? 'bg-yellow-100 border border-yellow-500 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-400 dark:text-yellow-200'
              : 'bg-red-100 border border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-400 dark:text-red-200'
            }
          `}>
            <div className="flex items-center">
              {(notification.type === 'error' || notification.type === 'warning') && <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />}
              <span className="text-sm font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-2 text-current hover:opacity-70 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* New message modal */}
      <EnhancedNewMessageModal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        onCreateConversation={async (participantIds: string[], title?: string, initialMessage?: string) => {
          try {
            // Always create a new conversation (force_new: true)
            const conversation = await createConversation({
              type: 'direct',
              title,
              participant_ids: participantIds,
              initial_message: initialMessage,
              force_new: true // Always create new conversation
            });
            
            // CRITICAL: Clear message cache for the new conversation to prevent showing old messages
            console.log('Created new conversation:', conversation.id);
            
            // Close modal and select the new conversation
            setShowNewMessageModal(false);
            selectConversation(conversation.id);
            showNotification('success', 'New conversation created successfully');
          } catch (error) {
            console.error('Failed to create conversation:', error);
            showNotification('error', 'Failed to create conversation');
          }
        }}
        onSelectExistingConversation={(conversationId: string) => {
          setShowNewMessageModal(false);
          selectConversation(conversationId);
          showNotification('success', 'Switched to existing conversation');
        }}
      />
    </>
  );
};

export default MessagesPage;