import React, { useCallback, useEffect, useState } from 'react';
import { EditorRoot, EditorContent } from 'novel';
import { type JSONContent } from 'novel';
import { PageEditorProps } from '../../types';

export const PageEditor: React.FC<PageEditorProps> = ({
  content = '',
  onChange,
  placeholder = 'Start writing your page content...',
  editable = true,
  className = '',
}) => {
  const [editorContent, setEditorContent] = useState<JSONContent | undefined>();

  // Initialize editor content from string
  useEffect(() => {
    if (content) {
      try {
        const parsedContent = JSON.parse(content);
        setEditorContent(parsedContent);
      } catch (error) {
        // If content is not valid JSON, create a simple text document
        setEditorContent({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: content,
                },
              ],
            },
          ],
        });
      }
    }
  }, [content]);

  const handleUpdate = useCallback(
    (editor: any) => {
      const json = editor.getJSON();
      const htmlContent = editor.getHTML();
      
      // Store as JSON string for database
      const jsonString = JSON.stringify(json);
      onChange(jsonString);
    },
    [onChange]
  );

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    // TODO: Implement actual image upload to your storage service
    // For now, we'll create a placeholder URL
    // In a real implementation, you would upload to Supabase Storage or similar
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Example implementation - replace with your actual upload service
      // const response = await fetch('/api/upload-image', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();
      // return data.url;
      
      // Placeholder implementation using URL.createObjectURL
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload image');
    }
  }, []);

  return (
    <div className={`novel-editor-wrapper ${className}`}>
      <EditorRoot>
        <EditorContent
          initialValue={editorContent}
          onUpdate={handleUpdate}
          className="min-h-96 w-full"
          editorProps={{
            attributes: {
              class: 'prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full',
            },
          }}
          storageKey="page-editor"
          disableLocalStorage={false}
          onImageUpload={handleImageUpload}
          editable={editable}
        />
      </EditorRoot>
      
      <style jsx global>{`
        .novel-editor-wrapper .ProseMirror {
          outline: none;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          min-height: 24rem;
          background: white;
        }
        
        .novel-editor-wrapper .ProseMirror:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .dark .novel-editor-wrapper .ProseMirror {
          background: #1f2937;
          border-color: #374151;
          color: white;
        }
        
        .dark .novel-editor-wrapper .ProseMirror:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
        }
        
        /* Placeholder styling */
        .novel-editor-wrapper .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        /* Novel editor specific styles */
        .novel-editor-wrapper .novel-slash-command {
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          background: white;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .dark .novel-editor-wrapper .novel-slash-command {
          background: #1f2937;
          border-color: #374151;
        }
        
        /* Image styles */
        .novel-editor-wrapper .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
        
        /* Code block styles */
        .novel-editor-wrapper .ProseMirror pre {
          background: #f3f4f6;
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
        }
        
        .dark .novel-editor-wrapper .ProseMirror pre {
          background: #374151;
        }
        
        /* Table styles */
        .novel-editor-wrapper .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        
        .novel-editor-wrapper .ProseMirror table td,
        .novel-editor-wrapper .ProseMirror table th {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
        }
        
        .dark .novel-editor-wrapper .ProseMirror table td,
        .dark .novel-editor-wrapper .ProseMirror table th {
          border-color: #374151;
        }
      `}</style>
    </div>
  );
};

export default PageEditor;