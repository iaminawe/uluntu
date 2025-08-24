export type ContentType = 
  | 'news' 
  | 'events' 
  | 'resources' 
  | 'groups' 
  | 'gallery' 
  | 'marketplace' 
  | 'opportunities'
  | 'blog'
  | 'general';

export type EditorMode = 'visual' | 'markdown' | 'html';

export interface AIPrompt {
  id: string;
  label: string;
  prompt: string;
  icon?: string;
}

export interface ContentAIEditorProps {
  /** Current content value */
  value: string;
  /** Callback when content changes */
  onChange: (content: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Content type for customized AI prompts */
  contentType?: ContentType;
  /** Whether to include image insertion functionality */
  includeImages?: boolean;
  /** Editor mode */
  mode?: EditorMode;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Editor height */
  height?: string;
  /** Custom AI prompts for specific use cases */
  customPrompts?: AIPrompt[];
}

export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
  };
  width: number;
  height: number;
}

export interface AIConfiguration {
  isConfigured: boolean;
  provider: string | null;
}