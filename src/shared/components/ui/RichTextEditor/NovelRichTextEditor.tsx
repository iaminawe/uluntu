import React, { useCallback, useEffect, useState } from 'react';
import { EditorRoot, EditorContent, EditorCommand, EditorCommandItem, EditorCommandEmpty } from 'novel';
import { type JSONContent } from 'novel';
import { RichTextEditorProps } from './types';

const NovelRichTextEditor = ({
  value,
  onChange,
  placeholder = 'Enter content here...',
  height = '200px',
  disabled = false,
  label,
  required = false,
  id,
  className = ''
}: RichTextEditorProps) => {
  const [editorContent, setEditorContent] = useState<JSONContent | undefined>();

  // Convert HTML string to JSON content for Novel
  useEffect(() => {
    if (value) {
      try {
        // If value is already JSON, parse it
        const parsedContent = JSON.parse(value);
        setEditorContent(parsedContent);
      } catch {
        // If value is HTML or plain text, convert to basic JSON structure
        // For CKEditor compatibility, we need to handle HTML content
        const content: JSONContent = {
          type: 'doc',
          content: []
        };

        if (value.includes('<')) {
          // Basic HTML parsing - in production, use a proper HTML to ProseMirror parser
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = value;
          
          // Convert basic HTML elements to ProseMirror nodes
          Array.from(tempDiv.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              content.content?.push({
                type: 'paragraph',
                content: [{
                  type: 'text',
                  text: node.textContent || ''
                }]
              });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              const tagName = element.tagName.toLowerCase();
              
              switch (tagName) {
                case 'p':
                  content.content?.push({
                    type: 'paragraph',
                    content: [{
                      type: 'text',
                      text: element.textContent || ''
                    }]
                  });
                  break;
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                  content.content?.push({
                    type: 'heading',
                    attrs: { level: parseInt(tagName[1]) },
                    content: [{
                      type: 'text',
                      text: element.textContent || ''
                    }]
                  });
                  break;
                case 'ul':
                case 'ol':
                  const listType = tagName === 'ul' ? 'bulletList' : 'orderedList';
                  const listItems = Array.from(element.querySelectorAll('li')).map(li => ({
                    type: 'listItem' as const,
                    content: [{
                      type: 'paragraph' as const,
                      content: [{
                        type: 'text' as const,
                        text: li.textContent || ''
                      }]
                    }]
                  }));
                  content.content?.push({
                    type: listType,
                    content: listItems
                  });
                  break;
                default:
                  // Fallback for other elements
                  if (element.textContent) {
                    content.content?.push({
                      type: 'paragraph',
                      content: [{
                        type: 'text',
                        text: element.textContent
                      }]
                    });
                  }
              }
            }
          });
        } else {
          // Plain text
          content.content = [{
            type: 'paragraph',
            content: [{
              type: 'text',
              text: value
            }]
          }];
        }

        setEditorContent(content);
      }
    } else {
      // Empty content
      setEditorContent({
        type: 'doc',
        content: [{
          type: 'paragraph',
          content: []
        }]
      });
    }
  }, [value]);

  const handleUpdate = useCallback(
    (editor: any) => {
      // Get HTML output for CKEditor compatibility
      const htmlContent = editor.getHTML();
      onChange(htmlContent);
    },
    [onChange]
  );

  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div 
        className={`novel-rich-text-editor border border-slate-300 dark:border-slate-600 rounded-md 
                 bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        style={{ minHeight: height }}
      >
        <EditorRoot>
          <EditorContent
            id={id}
            initialValue={editorContent}
            onUpdate={handleUpdate}
            className="min-h-full"
            editorProps={{
              attributes: {
                class: 'prose prose-sm dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full p-4',
                'data-placeholder': placeholder,
              },
            }}
            editable={!disabled}
            immediatelyRender={false}
          />
          {!disabled && (
            <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
              <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
              <EditorCommandItem
                value="heading2"
                onCommand={(val) => console.log(val)}
                className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted">
                  H2
                </div>
                <div>
                  <p className="font-medium">Heading 2</p>
                  <p className="text-xs text-muted-foreground">Medium section heading</p>
                </div>
              </EditorCommandItem>
              <EditorCommandItem
                value="heading3"
                onCommand={(val) => console.log(val)}
                className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted">
                  H3
                </div>
                <div>
                  <p className="font-medium">Heading 3</p>
                  <p className="text-xs text-muted-foreground">Small section heading</p>
                </div>
              </EditorCommandItem>
            </EditorCommand>
          )}
        </EditorRoot>
      </div>
      
      <style jsx global>{`
        .novel-rich-text-editor .ProseMirror {
          outline: none;
          min-height: ${height};
        }
        
        .novel-rich-text-editor .ProseMirror:focus {
          outline: none;
        }
        
        .novel-rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        .novel-rich-text-editor .ProseMirror-focused {
          outline: 2px solid #f97316;
          outline-offset: -2px;
          border-radius: 0.375rem;
        }
        
        /* Ensure proper styling for lists */
        .novel-rich-text-editor .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        
        .novel-rich-text-editor .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
        
        /* Table styles */
        .novel-rich-text-editor .ProseMirror table {
          border-collapse: collapse;
          margin: 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
        }
        
        .novel-rich-text-editor .ProseMirror table td,
        .novel-rich-text-editor .ProseMirror table th {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          vertical-align: top;
        }
        
        .dark .novel-rich-text-editor .ProseMirror table td,
        .dark .novel-rich-text-editor .ProseMirror table th {
          border-color: #374151;
        }
      `}</style>
    </div>
  );
};

export default NovelRichTextEditor;