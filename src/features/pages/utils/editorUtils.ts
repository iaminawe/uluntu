import { type JSONContent } from 'novel';

export interface EditorContent {
  type: string;
  content?: EditorContent[];
  text?: string;
  attrs?: Record<string, any>;
  marks?: Array<{
    type: string;
    attrs?: Record<string, any>;
  }>;
}

/**
 * Convert JSON content to HTML string for display
 */
export function jsonToHtml(jsonContent: string | JSONContent): string {
  try {
    const content = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
    return convertNodeToHtml(content);
  } catch (error) {
    console.error('Error converting JSON to HTML:', error);
    return typeof jsonContent === 'string' ? jsonContent : '';
  }
}

/**
 * Convert HTML string to JSON content for the editor
 */
export function htmlToJson(html: string): JSONContent {
  // This is a simplified conversion - in a real implementation,
  // you might want to use a proper HTML to ProseMirror converter
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: html.replace(/<[^>]*>/g, ''), // Strip HTML tags for now
          },
        ],
      },
    ],
  };
}

/**
 * Extract plain text from JSON content
 */
export function extractTextFromJson(jsonContent: string | JSONContent): string {
  try {
    const content = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
    return extractTextFromNode(content);
  } catch (error) {
    console.error('Error extracting text from JSON:', error);
    return typeof jsonContent === 'string' ? jsonContent : '';
  }
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string | JSONContent, maxLength: number = 160): string {
  const text = extractTextFromJson(content);
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Validate if content is valid JSON
 */
export function isValidJsonContent(content: string): boolean {
  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === 'object' && parsed.type;
  } catch {
    return false;
  }
}

/**
 * Create empty editor content
 */
export function createEmptyContent(): JSONContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [],
      },
    ],
  };
}

/**
 * Check if content is empty
 */
export function isContentEmpty(content: string | JSONContent): boolean {
  const text = extractTextFromJson(content).trim();
  return text.length === 0;
}

// Helper functions
function convertNodeToHtml(node: EditorContent): string {
  if (!node) return '';

  switch (node.type) {
    case 'doc':
      return node.content ? node.content.map(convertNodeToHtml).join('') : '';
    
    case 'paragraph':
      const pContent = node.content ? node.content.map(convertNodeToHtml).join('') : '';
      return `<p>${pContent}</p>`;
    
    case 'heading':
      const level = node.attrs?.level || 1;
      const hContent = node.content ? node.content.map(convertNodeToHtml).join('') : '';
      return `<h${level}>${hContent}</h${level}>`;
    
    case 'text':
      let text = node.text || '';
      if (node.marks) {
        for (const mark of node.marks) {
          switch (mark.type) {
            case 'bold':
              text = `<strong>${text}</strong>`;
              break;
            case 'italic':
              text = `<em>${text}</em>`;
              break;
            case 'code':
              text = `<code>${text}</code>`;
              break;
            case 'link':
              const href = mark.attrs?.href || '#';
              text = `<a href="${href}">${text}</a>`;
              break;
          }
        }
      }
      return text;
    
    case 'bulletList':
      const ulContent = node.content ? node.content.map(convertNodeToHtml).join('') : '';
      return `<ul>${ulContent}</ul>`;
    
    case 'orderedList':
      const olContent = node.content ? node.content.map(convertNodeToHtml).join('') : '';
      return `<ol>${olContent}</ol>`;
    
    case 'listItem':
      const liContent = node.content ? node.content.map(convertNodeToHtml).join('') : '';
      return `<li>${liContent}</li>`;
    
    case 'blockquote':
      const blockquoteContent = node.content ? node.content.map(convertNodeToHtml).join('') : '';
      return `<blockquote>${blockquoteContent}</blockquote>`;
    
    case 'codeBlock':
      const codeContent = node.content ? node.content.map(convertNodeToHtml).join('') : '';
      const language = node.attrs?.language || '';
      return `<pre><code class="language-${language}">${codeContent}</code></pre>`;
    
    case 'image':
      const src = node.attrs?.src || '';
      const alt = node.attrs?.alt || '';
      const title = node.attrs?.title || '';
      return `<img src="${src}" alt="${alt}" title="${title}" />`;
    
    case 'hardBreak':
      return '<br>';
    
    case 'horizontalRule':
      return '<hr>';
    
    default:
      return node.content ? node.content.map(convertNodeToHtml).join('') : '';
  }
}

function extractTextFromNode(node: EditorContent): string {
  if (!node) return '';

  if (node.type === 'text') {
    return node.text || '';
  }

  if (node.content) {
    return node.content.map(extractTextFromNode).join(' ');
  }

  return '';
}