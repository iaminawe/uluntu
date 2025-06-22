# Navigation & Pages System Documentation

## Overview

This document provides comprehensive documentation for the navigation refactor and pages system implementation completed on 2025-06-22. These features significantly improve user experience and provide powerful content management capabilities.

## Navigation System Refactor

### Before & After

**Before:**
- 8 flat top-level navigation items
- Poor mobile experience with long scrolling lists
- No logical grouping or hierarchy
- Difficult to scale with new features

**After:**
- 4 organized dropdown groups with logical categorization
- Mobile-optimized touch-friendly dropdowns
- Improved accessibility and keyboard navigation
- Scalable structure for future growth

### Navigation Structure

```typescript
interface NavLinkItem {
  text: string;
  href: string;
  children?: NavLinkItem[];
  description?: string;
}
```

#### Dropdown Groups

1. **Community** 🤝
   - Events → `/events`
   - Directory → `/directory` 
   - Groups → `/groups`
   - News → `/news`

2. **Business** 💼
   - Companies → `/companies`
   - Opportunities → `/opportunities`
   - Marketplace → `/marketplace`

3. **Resources** 📚
   - Direct link to `/resources`

4. **About** ℹ️
   - About Us → `/about`
   - Partners → `/partners`
   - Contact → `/contact`
   - Privacy → `/privacy`
   - Terms → `/terms`

### Technical Implementation

#### Component Architecture

```
src/shared/components/layout/Header/
├── index.tsx          # Main header component
├── Dropdown.tsx       # Core dropdown functionality
├── DesktopNav.tsx     # Desktop navigation rendering
├── MobileNav.tsx      # Mobile navigation rendering
├── ThemeToggle.tsx    # Dark mode toggle
├── UserMenu.tsx       # User authentication menu
└── types.ts           # TypeScript type definitions
```

#### Key Features

**Desktop Experience:**
- Hover-to-open dropdowns with 200ms delay
- Click fallback for touch devices
- Smooth transitions and animations
- Click-outside-to-close behavior

**Mobile Experience:**
- Touch-optimized accordion dropdowns
- Larger touch targets for better UX
- Collapsible menu structure
- Touch-friendly transitions

**Accessibility:**
- Full ARIA attribute support (`aria-expanded`, `aria-haspopup`, `role`)
- Keyboard navigation (Tab, Enter, Space, Escape)
- Screen reader compatible markup
- Focus management and visual indicators

**Performance:**
- Optimized event handling with proper cleanup
- Memory-safe timeout management
- Efficient re-rendering with React hooks

## Pages System

### Overview

The Pages system provides complete content management capabilities with rich text editing, SEO optimization, and full CRUD operations.

### Database Schema

```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  hero_image TEXT,
  author_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'published', 'archived')),
  meta_title VARCHAR(255),
  meta_description TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance indexes
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_author ON pages(author_id);
CREATE INDEX idx_pages_published ON pages(published_at);
CREATE INDEX idx_pages_featured ON pages(is_featured);

-- Row Level Security policies
CREATE POLICY pages_public_read ON pages 
  FOR SELECT USING (status = 'published');

CREATE POLICY pages_author_all ON pages 
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY pages_admin_all ON pages 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'superadmin')
    )
  );
```

### Feature Structure

```
src/features/pages/
├── api/
│   └── pagesApi.ts           # Supabase API operations
├── components/
│   ├── PageEditor/
│   │   └── index.tsx         # Novel editor wrapper
│   ├── PageForm/
│   │   └── index.tsx         # CRUD form component
│   ├── PagesList/
│   │   └── index.tsx         # Pages listing component
│   └── PageDetail.tsx        # Page display component
├── hooks/
│   ├── usePages.ts          # React hook for pages
│   └── usePagesRedux.ts     # Redux integration hook
├── store/
│   └── pagesSlice.ts        # Redux slice with async thunks
├── types/
│   └── index.ts             # TypeScript definitions
├── utils/
│   ├── editorUtils.ts       # Content serialization
│   └── pageUtils.ts         # Helper functions
├── __tests__/               # Test files
└── index.ts                 # Feature exports
```

### Novel Editor Integration

#### Features
- Rich text editing with slash commands
- Image upload to Supabase Storage
- JSON content storage with HTML display
- Custom styling with dark mode support
- Placeholder text and editable states

#### Configuration

```typescript
import { EditorRoot, EditorContent } from 'novel';

export const PageEditor: React.FC<PageEditorProps> = ({
  content = '',
  onChange,
  placeholder = 'Start writing your page content...',
  editable = true,
  className = '',
}) => {
  // JSON ↔ HTML serialization
  // Image upload handling
  // Custom styling and themes
  // Performance optimizations
};
```

### Redux Integration

#### State Structure

```typescript
interface PagesState {
  pages: Page[];
  currentPage: Page | null;
  loading: boolean;
  error: string | null;
  filters: PageFilters;
  pagination: PaginationState;
}
```

#### Async Thunks

- `fetchPages` - Get paginated pages with filters
- `fetchPageById` - Get single page by ID
- `fetchPageBySlug` - Get single page by slug
- `createPage` - Create new page
- `updatePage` - Update existing page
- `deletePage` - Delete page
- `publishPage` - Publish draft page
- `unpublishPage` - Unpublish page
- `fetchHomePage` - Get homepage
- `fetchFilteredPages` - Get filtered pages
- `fetchChildPages` - Get child pages

#### Selectors

- `selectAllPages` - All pages in state
- `selectCurrentPage` - Currently selected page
- `selectFilteredPages` - Pages matching current filters
- `selectHomePage` - Homepage (slug='home' or is_homepage=true)
- `selectChildPages` - Pages with parent_id

### API Operations

#### CRUD Operations

```typescript
class PagesAPI {
  async getPages(options?: GetPagesOptions): Promise<Page[]>
  async getPageById(id: string): Promise<Page>
  async getPageBySlug(slug: string): Promise<Page>
  async createPage(data: CreatePageData): Promise<Page>
  async updatePage(data: UpdatePageData): Promise<Page>
  async deletePage(id: string): Promise<void>
  async publishPage(id: string): Promise<Page>
  async unpublishPage(id: string): Promise<Page>
  async getHomePage(): Promise<Page | null>
  async getChildPages(parentId: string): Promise<Page[]>
  async generateSlug(title: string): Promise<string>
}
```

#### Features
- Automatic slug generation with conflict resolution
- Rich content serialization (JSON ↔ HTML)
- Author information joining
- Status-based filtering
- Search functionality
- Pagination support

### Static Pages Implementation

#### About Page (`/about`)
- Mission statement and community overview
- Feature highlights and benefits
- Professional design with hero section
- Statistics and impact metrics

#### Partners Page (`/partners`)
- Community partners and sponsors showcase
- Partnership levels and benefits
- Partnership types and opportunities
- Call-to-action for new partnerships

#### Contact Page (`/contact`)
- Contact form with validation
- Company information and location
- Multiple contact methods
- Professional business information

#### Privacy Policy (`/privacy`)
- Comprehensive data protection details
- GDPR compliance information
- Cookie policy and usage
- User rights and data handling

#### Terms of Service (`/terms`)
- Complete legal terms and conditions
- User obligations and platform rules
- Liability and disclaimer information
- Service availability and modifications

### Admin Interface

#### Pages Management (`/admin/entities/pages`)
- Complete CRUD interface
- Rich text editing with Novel editor
- Status management (draft/published/archived)
- SEO metadata editing
- Image upload and management
- Bulk operations support

#### Features
- Real-time preview
- Auto-save functionality
- Version history (future)
- Publishing workflow
- SEO optimization tools

## Usage Examples

### Creating a New Page

```typescript
import { usePagesRedux } from '@/features/pages/hooks/usePagesRedux';

const CreatePageExample = () => {
  const { createPage, loading } = usePagesRedux();
  
  const handleSubmit = async (formData: CreatePageData) => {
    try {
      await createPage({
        title: formData.title,
        content: formData.content,
        status: 'draft',
        meta_description: formData.metaDescription,
      });
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };
};
```

### Using the Novel Editor

```typescript
import { PageEditor } from '@/features/pages/components/PageEditor';

const EditorExample = () => {
  const [content, setContent] = useState('');
  
  return (
    <PageEditor
      content={content}
      onChange={setContent}
      placeholder="Start writing..."
      editable={true}
    />
  );
};
```

### Navigation Dropdown Usage

```typescript
import Header from '@/shared/components/layout/Header';

const AppLayout = () => {
  return (
    <div>
      <Header
        logo="Your Logo"
        navLinks={[
          {
            text: "Community",
            href: "/community",
            children: [
              { text: "Events", href: "/events", description: "Event description" },
              { text: "Groups", href: "/groups", description: "Groups description" }
            ]
          }
        ]}
      />
    </div>
  );
};
```

## Testing

### Navigation Tests
- Dropdown functionality (open/close)
- Keyboard navigation
- Mobile responsiveness
- Accessibility compliance

### Pages Tests
- CRUD operations
- Novel editor integration
- Redux state management
- API integration
- Content serialization

## Performance Considerations

### Navigation
- Optimized event listeners with cleanup
- Efficient re-rendering with React hooks
- Minimal DOM manipulations
- Lazy loading of dropdown content

### Pages System
- Efficient content serialization
- Optimistic updates in Redux
- Image optimization for uploads
- Pagination for large datasets

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Keyboard navigation support
- Screen reader compatibility

## Future Enhancements

### Navigation
- Mega menu support for larger dropdown content
- Search integration in navigation
- Breadcrumb navigation
- User-customizable navigation

### Pages System
- Version history and revisions
- Collaborative editing
- Advanced SEO tools
- Template system expansion
- Multi-language support

## Migration Notes

If migrating from the old navigation:
1. Update any hardcoded navigation references
2. Test mobile navigation thoroughly
3. Verify accessibility compliance
4. Update any custom navigation styling

For the Pages system:
1. Apply database migration: `20250622000001_create_pages_table.sql`
2. Install Novel editor dependencies
3. Configure Supabase Storage for image uploads
4. Set up admin permissions for page management

## Troubleshooting

### Navigation Issues
- **Dropdowns not opening**: Check hover event handlers and timeouts
- **Mobile navigation issues**: Verify touch event handling
- **Accessibility problems**: Check ARIA attributes and keyboard handlers

### Pages System Issues
- **Editor not loading**: Verify Novel dependencies installation
- **Image uploads failing**: Check Supabase Storage configuration
- **Content not saving**: Verify API permissions and RLS policies

## Conclusion

The navigation refactor and pages system provide a solid foundation for improved user experience and content management. The implementation follows modern web standards, accessibility guidelines, and performance best practices.

For additional support or questions, refer to the main project documentation or create an issue in the repository.