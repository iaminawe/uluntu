# Dynamic Footer System Documentation

## Overview

The dynamic footer system provides a comprehensive, feature-rich footer navigation component that integrates with the dynamic menu system. It supports multi-column layouts, feature flags, permission-based visibility, responsive design, and SEO optimization.

## Key Features

- 🔄 **Dynamic Menu Integration**: Fetches menu items from the database
- 🏗️ **Multi-Column Layout**: Flexible column grouping strategies
- 🚩 **Feature Flag Support**: Toggle footer features dynamically
- 🔐 **Permission-Based Filtering**: Role-based menu item visibility
- 📱 **Responsive Design**: Mobile-first responsive layouts
- ⚡ **Loading States**: Skeleton loaders and fallback content
- 🎨 **Customizable Styling**: Tailwind CSS classes and themes
- 🔍 **SEO Friendly**: Proper semantic HTML structure

## Components

### Main Components

1. **Footer** - Main footer component with dynamic/static switching
2. **DynamicFooterMenu** - Dynamic menu rendering with grouping strategies
3. **FooterColumn** - Individual column component with links
4. **SocialLinks** - Social media links with icons

### Support Components

5. **FooterMenuProvider** - Context provider for footer menu state
6. **FooterPermissionGate** - Permission-based visibility control
7. **FooterFeatureGate** - Feature flag-based visibility control

## Usage Examples

### Basic Footer with Dynamic Menus

```tsx
import Footer from '@/shared/components/layout/Footer';

function App() {
  return (
    <div>
      {/* Your app content */}
      <Footer
        enableDynamicMenu={true}
        maxColumns={4}
        showSocialLinks={true}
        showCopyright={true}
      />
    </div>
  );
}
```

### Custom Footer with Fallback Columns

```tsx
import Footer from '@/shared/components/layout/Footer';

const customFallbackColumns = [
  {
    id: 'products',
    title: 'Products',
    links: [
      { text: 'Web App', href: '/products/web' },
      { text: 'Mobile App', href: '/products/mobile' },
      { text: 'API', href: '/products/api' }
    ]
  },
  {
    id: 'support',
    title: 'Support',
    links: [
      { text: 'Help Center', href: '/help' },
      { text: 'Contact', href: '/contact' },
      { text: 'Status', href: 'https://status.example.com', isExternal: true }
    ]
  }
];

function App() {
  return (
    <Footer
      enableDynamicMenu={true}
      fallbackColumns={customFallbackColumns}
      maxColumns={3}
      copyrightText="© 2024 Your Company. All rights reserved."
    />
  );
}
```

### Advanced Usage with Menu Provider

```tsx
import { FooterMenuProvider } from '@/shared/components/layout/Footer/FooterMenuProvider';
import { DynamicFooterMenu } from '@/shared/components/layout/Footer/DynamicFooterMenu';

function CustomFooter() {
  return (
    <FooterMenuProvider userRoles={['admin', 'user']}>
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <DynamicFooterMenu
            enableDynamicMenu={true}
            featureFlagKey="dynamic_footer_menus"
            columnLayout="equal"
            maxColumns={4}
            config={{
              groupingStrategy: 'by-category',
              maxItemsPerColumn: 8,
              showIcons: true,
              preserveHierarchy: true
            }}
          />
        </div>
      </footer>
    </FooterMenuProvider>
  );
}
```

### Permission-Gated Footer Items

```tsx
import { FooterPermissionGate } from '@/shared/components/layout/Footer/FooterPermissionGate';

function AdminFooterSection() {
  return (
    <FooterPermissionGate
      requiredRoles={['admin']}
      fallback={<div>Public footer content</div>}
    >
      <div className="admin-footer-section">
        <h3>Admin Tools</h3>
        <ul>
          <li><a href="/admin">Dashboard</a></li>
          <li><a href="/admin/users">User Management</a></li>
        </ul>
      </div>
    </FooterPermissionGate>
  );
}
```

### Feature-Gated Footer Components

```tsx
import { FooterFeatureGate } from '@/shared/components/layout/Footer/FooterFeatureGate';

function NewsletterSignup() {
  return (
    <FooterFeatureGate 
      featureKey="newsletter_signup"
      fallback={<div>Newsletter signup disabled</div>}
    >
      <div className="newsletter-signup">
        <h3>Stay Updated</h3>
        <form>
          <input type="email" placeholder="Enter your email" />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </FooterFeatureGate>
  );
}
```

## Configuration

### Footer Props

```tsx
interface FooterProps {
  columns?: FooterColumn[];           // Static columns (overrides dynamic)
  socialLinks?: SocialLink[];         // Social media links
  copyrightText?: string;            // Copyright text
  enableDynamicMenu?: boolean;       // Enable dynamic menu fetching
  fallbackColumns?: FooterColumn[];  // Fallback if dynamic fails
  maxColumns?: number;               // Maximum columns to display
  showSocialLinks?: boolean;         // Show social media section
  showCopyright?: boolean;          // Show copyright section
}
```

### Menu Configuration

```tsx
interface FooterMenuConfig {
  groupingStrategy: FooterGroupingStrategy; // 'by-category' | 'by-section' | 'flat' | 'hierarchical'
  maxItemsPerColumn: number;                // Max items per column
  showIcons: boolean;                       // Show menu item icons
  showDescriptions: boolean;                // Show item descriptions
  preserveHierarchy: boolean;              // Keep parent-child relationships
}
```

### Grouping Strategies

1. **by-category** - Group items by inferred categories (Community, Business, etc.)
2. **by-section** - Group by parent-child relationships
3. **hierarchical** - Preserve menu hierarchy structure
4. **flat** - Distribute items evenly across columns

## Feature Flags

The footer system supports the following feature flags:

- `dynamic_footer_menus` - Enable dynamic menu loading
- `footer_social_links` - Show social media links
- `footer_newsletter_signup` - Show newsletter signup
- `footer_legal_links` - Show legal/policy links
- `footer_branding` - Show company branding
- `footer_search` - Show footer search functionality

## Database Integration

### Menu Items Table Structure

The footer integrates with the `menu_items` table:

```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  url VARCHAR(2048),
  description TEXT,
  menu_type VARCHAR(50) DEFAULT 'footer', -- 'main', 'footer', 'mobile', 'admin'
  parent_id UUID REFERENCES menu_items(id),
  sort_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  target VARCHAR(10) DEFAULT '_self',
  icon VARCHAR(100),
  css_classes VARCHAR(500),
  visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'authenticated', 'admin', 'role_based'
  required_roles TEXT[],
  is_external BOOLEAN DEFAULT false,
  feature_flag VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

The footer uses these API methods:

- `fetchFooterMenuItems()` - Get footer-specific menu items
- `fetchMenuHierarchy('footer_links')` - Get hierarchical footer menu
- `menuApi.fetchMenuItems({ menu_type: 'footer' })` - Get filtered menu items

## Styling and Theming

### CSS Classes

The footer uses Tailwind CSS with these key classes:

- `bg-white dark:bg-slate-800` - Background colors with dark mode
- `text-slate-600 dark:text-slate-400` - Text colors
- `hover:text-indigo-600` - Hover states
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4` - Responsive grid
- `border-t border-slate-200 dark:border-slate-700` - Borders

### Customization

You can customize the footer styling by:

1. **CSS Classes** - Pass custom `className` props
2. **Tailwind Variants** - Use Tailwind's variant system
3. **CSS-in-JS** - Override styles with styled components
4. **Theme Provider** - Use context for consistent theming

## Performance Optimization

### Caching

- Menu items are cached for 5 minutes by default
- Uses React Query for intelligent caching and refetching
- Stale-while-revalidate strategy for better UX

### Loading States

- Skeleton loaders during initial load
- Progressive enhancement with fallback content
- Error boundaries for graceful degradation

### Bundle Size

- Tree-shakable exports for unused components
- Lazy loading for heavy components
- Optimized icon usage with dynamic imports

## Accessibility

### ARIA Support

- Proper ARIA labels for social links
- Semantic HTML structure with nav elements
- Screen reader friendly link descriptions

### Keyboard Navigation

- Tab navigation support
- Focus management for interactive elements
- Skip links for screen readers

### Color Contrast

- WCAG AA compliant color combinations
- Dark mode support with proper contrast ratios
- High contrast mode detection

## SEO Optimization

### Structured Data

- Uses semantic HTML5 footer element
- Proper heading hierarchy (h1-h6)
- Microdata for organization information

### Link Structure

- Internal links use React Router Link component
- External links have proper rel attributes
- Canonical URL handling for menu items

### Performance

- Critical CSS inlined for above-the-fold content
- Lazy loading for non-critical components
- Optimized image loading for icons

## Troubleshooting

### Common Issues

1. **Menu Items Not Loading**
   - Check database connection
   - Verify menu_items table exists
   - Check feature flags are enabled

2. **Permission Issues**
   - Verify user roles in database
   - Check required_roles array in menu items
   - Confirm visibility settings

3. **Styling Problems**
   - Check Tailwind CSS classes are available
   - Verify dark mode configuration
   - Check CSS specificity conflicts

### Debug Mode

Enable debug mode in development:

```tsx
import { FooterFeatureDebug } from '@/shared/components/layout/Footer/FooterFeatureGate';

function Footer() {
  return (
    <footer>
      {/* Footer content */}
      <FooterFeatureDebug 
        features={['dynamic_footer_menus', 'footer_social_links']}
        className="mt-4 p-2 bg-gray-100"
      />
    </footer>
  );
}
```

## Migration Guide

### From Static to Dynamic

1. **Update Footer Usage**:
   ```tsx
   // Before
   <Footer columns={staticColumns} />
   
   // After
   <Footer enableDynamicMenu={true} fallbackColumns={staticColumns} />
   ```

2. **Database Setup**:
   - Run menu system migrations
   - Populate menu_items table
   - Configure feature flags

3. **Testing**:
   - Test with and without feature flags
   - Verify fallback behavior
   - Check permissions for different user types

This dynamic footer system provides a robust, scalable solution for website navigation that adapts to your application's needs while maintaining excellent performance and user experience.