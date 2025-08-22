import React, { useState, useEffect } from 'react';
import { X, Search, User } from 'lucide-react';
import { useMembersWithFilters } from '@/hooks/useMemberQueries';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';

interface EnhancedNewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (participantIds: string[], title?: string, initialMessage?: string) => void;
  onSelectExistingConversation: (conversationId: string) => void;
  className?: string;
}

/**
 * New message modal that always creates new conversations
 */
export default function EnhancedNewMessageModal({
  isOpen,
  onClose,
  onCreateConversation,
  onSelectExistingConversation,
  className = ''
}: EnhancedNewMessageModalProps) {
  const { user } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  
  // Fetch members for selection
  const { data: members = [], isLoading: loadingMembers } = useMembersWithFilters({
    search: searchTerm,
    limit: 10 // Limit for performance
  });
  
  
  // Filter out current user
  const availableMembers = members.filter((member: any) => 
    member.id !== user?.id
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedParticipantId(null);
      setMessage('');
      setTitle('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectParticipant = (memberId: string) => {
    setSelectedParticipantId(memberId);
    setSearchTerm(''); // Clear search after selection
  };

  const handleCreateNew = () => {
    if (!selectedParticipantId || !message.trim()) return;

    // Always create new conversation
    onCreateConversation(
      [selectedParticipantId],
      title.trim() || undefined,
      message.trim()
    );
    
    // Reset form
    setTitle('');
    setMessage('');
    setSelectedParticipantId(null);
    setSearchTerm('');
    onClose();
  };

  const selectedMember = selectedParticipantId 
    ? members.find((m: any) => m.id === selectedParticipantId)
    : null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 ${className}`} onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-600">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            New Conversation
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex flex-col max-h-[calc(90vh-80px)]">
          <form onSubmit={(e) => { e.preventDefault(); handleCreateNew(); }} className="flex flex-col">
              {/* Participant Selection */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    To:
                  </label>
                  
                  {/* Selected Participant */}
                  {selectedParticipantId && selectedMember ? (
                    <div className="mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-400">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {selectedMember.image ? (
                            <img
                              src={selectedMember.image}
                              alt={selectedMember.name}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                              <User className="h-4 w-4 text-slate-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {selectedMember.name}
                          </div>
                          {selectedMember.title && (
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              {selectedMember.title}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedParticipantId(null)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Member Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search for members..."
                          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      {/* Member Results */}
                      {searchTerm.length > 0 && (
                        <div className="mt-2 max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-lg">
                          {loadingMembers ? (
                            <div className="p-3 text-center text-slate-500 dark:text-slate-400">
                              Searching...
                            </div>
                          ) : availableMembers.length === 0 ? (
                            <div className="p-3 text-center text-slate-500 dark:text-slate-400">
                              No members found
                            </div>
                          ) : (
                            availableMembers.map((member: any) => (
                              <button
                                key={member.id}
                                type="button"
                                onClick={() => handleSelectParticipant(member.id)}
                                className="w-full p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-3 transition-colors"
                              >
                                <div className="flex-shrink-0">
                                  {member.image ? (
                                    <img
                                      src={member.image}
                                      alt={member.name}
                                      className="h-8 w-8 rounded-full"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                                      <User className="h-4 w-4 text-slate-500" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    {member.name}
                                  </div>
                                  {member.title && (
                                    <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                      {member.title}
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Title (Optional) */}
                {selectedParticipantId && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Title (Optional):
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Conversation title..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Message */}
                {selectedParticipantId && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Message:
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
              
              {/* Footer */}
              {selectedParticipantId && (
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-white dark:hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Start New Conversation
                    </button>
                  </div>
                </div>
              )}
            </form>
        </div>
      </div>
    </div>
  );
}