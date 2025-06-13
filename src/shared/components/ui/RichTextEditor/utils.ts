// Utility functions for RichTextEditor component

/**
 * Adds global styles for CKEditor to ensure it fills available space and has proper dark mode support
 * Only adds styles once to avoid duplicates
 */
export const addCKEditorStyles = (): void => {
  // Check if the style element already exists to avoid duplicates
  if (!document.getElementById('ckeditor-custom-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'ckeditor-custom-styles';
    styleElement.innerHTML = `
      /* Make the editor UI take the full height of its container */
      .ck-editor__main {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      
      /* Make the editable area take the full height of the editor UI */
      .ck-editor__main .ck-editor__editable {
        flex: 1;
        min-height: 100% !important;
        height: 100% !important;
      }
      
      /* Ensure the editor container takes full height of its parent */
      .ck.ck-editor {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      
      /* Ensure dark mode compatibility */
      .dark .ck.ck-editor__editable {
        background-color: #1e293b !important;
        color: #f8fafc !important;
      }
      
      /* Improve styling for dark mode toolbar */
      .dark .ck.ck-toolbar {
        background-color: #334155 !important;
        border-color: #475569 !important;
      }
      
      .dark .ck.ck-button:not(.ck-disabled):hover, 
      .dark .ck.ck-button.ck-on {
        background-color: #475569 !important;
      }
    `;
    document.head.appendChild(styleElement);
  }
};
