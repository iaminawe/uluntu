import React, { useState } from 'react';
import { X, Search, User } from 'lucide-react';
import { useMembersWithFilters } from '@/hooks/useMemberQueries';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (participantIds: string[], title?: string, initialMessage?: string) => void;
  className?: string;
}

/**
 * New message modal with member search and conversation creation
 */
export default function NewMessageModal({
  isOpen,
  onClose,
  onCreateConversation,
  className = ''
}: NewMessageModalProps) {
  const { user } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  
  // Fetch members for selection
  const { data: members = [], isLoading: loadingMembers } = useMembersWithFilters({
    search: searchTerm
  });
  
  // Filter out current user and already selected participants
  const availableMembers = members.filter((member: any) => 
    member.id !== user?.id && !selectedParticipants.includes(member.id)
  );

  if (!isOpen) return null;

  const handleAddParticipant = (memberId: string) => {
    setSelectedParticipants(prev => [...prev, memberId]);
    setSearchTerm(''); // Clear search after selection
  };

  const handleRemoveParticipant = (memberId: string) => {
    setSelectedParticipants(prev => prev.filter(id => id !== memberId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedParticipants.length === 0 || !message.trim()) return;

    onCreateConversation(
      selectedParticipants,
      title.trim() || undefined,
      message.trim()
    );
    
    // Reset form
    setTitle('');
    setMessage('');
    setSelectedParticipants([]);
    setSearchTerm('');
    onClose();
  };

  const selectedMemberNames = selectedParticipants
    .map(id => members.find((m: any) => m.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 ${className}`} onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-600">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            New Message
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-80px)]">
          {/* Participant Selection */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                To:
              </label>
              
              {/* Selected Participants */}
              {selectedParticipants.length > 0 && (
                <div className="mb-2 p-2 bg-slate-50 dark:bg-slate-700 rounded border">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedMemberNames}
                  </div>
                </div>
              )}
              
              {/* Member Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for members..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
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
                        onClick={() => handleAddParticipant(member.id)}
                        className="w-full p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-3"
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
                              <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {member.name}
                          </div>
                          {member.title && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {member.title}
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            
            {/* Optional Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Subject (Optional):
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Conversation subject"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>
          </div>
          
          {/* Message */}
          <div className="flex-1 p-6 pt-0">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Message:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              required
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none"
            />
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-3 p-6 pt-0 border-t border-slate-200 dark:border-slate-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedParticipants.length === 0 || !message.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}