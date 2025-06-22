export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt?: string | null;
  hero_image?: string | null;
  author_id: string;
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  status: 'draft' | 'published' | 'archived';
  meta_title?: string | null;
  meta_description?: string | null;
  is_featured: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePageData {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  hero_image?: string;
  status?: 'draft' | 'published';
  meta_title?: string;
  meta_description?: string;
  is_featured?: boolean;
  published_at?: string;
}

export interface UpdatePageData extends Partial<CreatePageData> {
  id: string;
}

export interface PageFilters {
  status?: 'draft' | 'published' | 'archived' | 'all';
  search?: string;
  author_id?: string;
  is_featured?: boolean;
  sort_by?: 'created_at' | 'updated_at' | 'title' | 'published_at';
  sort_order?: 'asc' | 'desc';
}

export interface PagesState {
  pages: Page[];
  currentPage: Page | null;
  loading: boolean;
  error: string | null;
  filters: PageFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Editor-specific types
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

export interface PageEditorProps {
  content?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export interface ImageUploadResponse {
  url: string;
  name: string;
  size: number;
}