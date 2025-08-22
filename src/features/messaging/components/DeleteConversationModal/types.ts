export interface DeleteConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (conversationIds: string[], deleteForAll?: boolean) => Promise<void>;
  conversations: any[];
  mode: 'single' | 'bulk';
  isDeleting?: boolean;
}

export interface DeleteConversationOptions {
  deleteForAll: boolean;
  confirmText: string;
}