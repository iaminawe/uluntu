import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Menu, X } from 'lucide-react';
import ConversationsList from '@/features/messaging/components/ConversationsList';
import RealtimeMessageThread from '@/features/messaging/components/MessageThread/RealtimeMessageThread';
import NewMessageModal from '@/features/messaging/components/NewMessageModal';
import { useMessagingHybrid } from '@/features/messaging/hooks/useMessagingHybrid';
import { ContentContainer, PageHeader } from '@/shared/components/ui/PageLayout';
import { ErrorDisplay } from '@/shared/components/ui/ErrorDisplay';
import { Button } from '@/shared/components/ui/Button';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';

const MessagesPage: React.FC = () => {
  const { user } = useSession();
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  
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

  const handleSelectConversation = (conversation: any) => {
    selectConversation(conversation.id);
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
      
      <div className="h-[calc(100vh-4rem)] flex bg-slate-50 dark:bg-slate-900">
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
          w-80 md:w-96 h-[calc(100vh-4rem)] md:h-full
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
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedConversation?.title || 'Conversation'}
                  </h2>
                </div>
              </div>
              
              {/* Message thread */}
              <RealtimeMessageThread
                conversationId={selectedConversationId}
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
      </div>
      
      {/* New message modal */}
      <NewMessageModal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        onCreateConversation={async (participantIds: string[], title?: string, initialMessage?: string) => {
          try {
            // Create conversation using the hybrid hook
            const conversation = await createConversation({
              type: 'direct',
              title,
              participant_ids: participantIds,
              initial_message: initialMessage
            });
            
            // Close modal and select the new conversation
            setShowNewMessageModal(false);
            selectConversation(conversation.id);
          } catch (error) {
            console.error('Failed to create conversation:', error);
            // TODO: Show error toast
          }
        }}
      />
    </>
  );
};

export default MessagesPage;