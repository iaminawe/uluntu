import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';

// Create a basic set of extensions for Novel
export const defaultExtensions = [
  StarterKit,
  Placeholder.configure({
    placeholder: 'Type \'/\' for commands or start writing...',
    emptyEditorClass: 'is-editor-empty',
  }),
];