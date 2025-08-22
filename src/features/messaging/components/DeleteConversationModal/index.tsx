import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  conversationCount: number;
  isLoading?: boolean;
  conversationNames?: string[];
}

export const DeleteConversationModal: React.FC<DeleteConversationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  conversationCount,
  isLoading = false,
  conversationNames = []
}) => {
  if (!isOpen) return null;

  const isBulkDelete = conversationCount > 1;
  const displayNames = conversationNames.slice(0, 3);
  const hasMoreNames = conversationNames.length > 3;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-600">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Delete {isBulkDelete ? 'Conversations' : 'Conversation'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              {isBulkDelete 
                ? `Are you sure you want to delete ${conversationCount} conversations?`
                : 'Are you sure you want to delete this conversation?'
              }
            </p>

            {displayNames.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  {displayNames.map((name, index) => (
                    <div key={index} className="truncate">
                      • {name}
                    </div>
                  ))}
                  {hasMoreNames && (
                    <div className="text-slate-500 dark:text-slate-500">
                      • ... and {conversationNames.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-400 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> This will remove the conversation{isBulkDelete ? 's' : ''} from your view only. 
                Other participants will still have access to the conversation{isBulkDelete ? 's' : ''}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-600">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete {isBulkDelete ? `${conversationCount} Conversations` : 'Conversation'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};