# Theme System Architecture Analysis and Design

## 1. CODEBASE ANALYSIS

### Database Pattern Analysis
- **Pattern**: PostgreSQL with Supabase, using row-level security (RLS)
- **Schema Structure**: 
  - UUID primary keys with gen_random_uuid()
  - Timestamps: created_at, updated_at
  - JSON/JSONB for flexible data storage
  - Foreign key relationships with proper constraints
  - Audit logging pattern with admin_audit_log
  - Settings pattern with application_settings table
  - Feature toggles pattern with feature_toggles table

### Current Styling Approach
- **CSS Framework**: Tailwind CSS with custom configuration
- **Dark Mode**: Already supported via class-based dark mode
- **CSS Variables**: 
  - Using CSS custom properties for dynamic colors
  - RGB-based color values for opacity support
  - Separate variable sets for light/dark themes
- **Component Library**: shadcn/ui integration with HSL color values
- **Existing Theme Variables**:
  ```css
  --color-primary: 251, 115, 22; /* orange-500 */
  --color-secondary: 239, 68, 68; /* red-500 */
  --color-accent: 59, 130, 246; /* blue-500 */
  ```

### File Upload Infrastructure
- **Storage Service**: Comprehensive StorageService class exists
- **Buckets**: 
  - gallery-photos (main storage)
  - gallery-thumbnails (resized versions)
- **Features**:
  - File validation (size, type)
  - Automatic thumbnail generation
  - Path generation with user/gallery structure
  - Public URL generation
  - Storage usage tracking capabilities

### Admin Panel Structure
- **Layout**: Sidebar navigation with nested sections
- **Routes**: /admin/* with entity management, settings, etc.
- **Authentication**: Role-based (superadmin, admin)
- **UI Components**: Responsive, mobile-friendly design
- **Settings Architecture**: Already has comprehensive settings system

## 2. DATABASE SCHEMA DESIGN

### themes table
```sql
CREATE TABLE public.themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    colors JSONB NOT NULL DEFAULT '{}',
    typography JSONB DEFAULT '{}',
    spacing JSONB DEFAULT '{}',
    borders JSONB DEFAULT '{}',
    shadows JSONB DEFAULT '{}',
    components JSONB DEFAULT '{}',
    custom_css TEXT,
    preview_image TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT only_one_active CHECK (
        NOT (is_active = true AND EXISTS (
            SELECT 1 FROM themes t2 
            WHERE t2.id != themes.id AND t2.is_active = true
        ))
    )
);

-- Indexes
CREATE INDEX idx_themes_active ON public.themes(is_active);
CREATE INDEX idx_themes_slug ON public.themes(slug);
```

### theme_configurations table
```sql
CREATE TABLE public.theme_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID REFERENCES public.themes(id) ON DELETE CASCADE,
    config_key TEXT NOT NULL,
    config_value JSONB NOT NULL,
    config_type TEXT CHECK (config_type IN ('color', 'typography', 'spacing', 'component', 'custom')),
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    validation_rules JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(theme_id, config_key)
);

-- Index
CREATE INDEX idx_theme_configs_theme ON public.theme_configurations(theme_id);
```

### theme_assets table
```sql
CREATE TABLE public.theme_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID REFERENCES public.themes(id) ON DELETE CASCADE,
    asset_type TEXT CHECK (asset_type IN ('logo', 'favicon', 'banner', 'background', 'custom')),
    asset_key TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    dimensions JSONB,
    alt_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(theme_id, asset_key)
);

-- Index
CREATE INDEX idx_theme_assets_theme ON public.theme_assets(theme_id);
```

### theme_history table (for version control)
```sql
CREATE TABLE public.theme_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID REFERENCES public.themes(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    changes JSONB NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    change_type TEXT CHECK (change_type IN ('created', 'updated', 'activated', 'deactivated')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_theme_history_theme ON public.theme_history(theme_id);
CREATE INDEX idx_theme_history_date ON public.theme_history(created_at);
```

## 3. API STRUCTURE DESIGN

### Theme API Endpoints

#### GET /api/themes
- List all themes (admin only)
- Query params: active, system, search

#### GET /api/themes/active
- Get currently active theme (public)
- Returns compiled CSS variables

#### GET /api/themes/:id
- Get specific theme details (admin only)

#### POST /api/themes
- Create new theme (admin only)
- Body: theme data with configurations

#### PUT /api/themes/:id
- Update theme (admin only)
- Partial updates supported

#### POST /api/themes/:id/activate
- Activate a theme (admin only)
- Deactivates current active theme

#### DELETE /api/themes/:id
- Delete theme (admin only)
- Cannot delete active or system themes

#### POST /api/themes/:id/duplicate
- Duplicate a theme (admin only)
- Creates new theme with copy of settings

#### POST /api/themes/:id/assets
- Upload theme asset (admin only)
- Multipart form data

#### DELETE /api/themes/:id/assets/:assetId
- Delete theme asset (admin only)

#### GET /api/themes/:id/preview
- Get theme preview data (admin only)
- Returns CSS for preview iframe

#### GET /api/themes/:id/export
- Export theme as JSON (admin only)

#### POST /api/themes/import
- Import theme from JSON (admin only)

## 4. COMPONENT ARCHITECTURE

### Admin Theme Management UI Structure

```
/admin/themes
├── ThemesPage (main container)
├── components/
│   ├── ThemeList/
│   │   ├── ThemeCard.tsx
│   │   ├── ThemeListHeader.tsx
│   │   └── ThemeFilters.tsx
│   ├── ThemeEditor/
│   │   ├── ThemeEditorLayout.tsx
│   │   ├── ColorPicker/
│   │   │   ├── ColorSection.tsx
│   │   │   ├── ColorInput.tsx
│   │   │   └── ColorPresets.tsx
│   │   ├── Typography/
│   │   │   ├── FontSelector.tsx
│   │   │   ├── FontSizeControls.tsx
│   │   │   └── FontWeightControls.tsx
│   │   ├── AssetUploader/
│   │   │   ├── AssetUploadZone.tsx
│   │   │   ├── AssetPreview.tsx
│   │   │   └── AssetManager.tsx
│   │   ├── CustomCSS/
│   │   │   ├── CSSEditor.tsx
│   │   │   └── CSSValidator.tsx
│   │   └── Preview/
│   │       ├── ThemePreview.tsx
│   │       ├── PreviewFrame.tsx
│   │       └── DeviceSelector.tsx
│   ├── ThemeImportExport/
│   │   ├── ImportDialog.tsx
│   │   └── ExportDialog.tsx
│   └── ThemeHistory/
│       ├── HistoryList.tsx
│       └── VersionCompare.tsx
```

### Key Components Design

#### ThemeEditorLayout
- Split view: editor on left, live preview on right
- Tabbed sections: Colors, Typography, Assets, Custom CSS
- Save/Cancel/Preview buttons
- Version history access

#### ColorSection
- Primary, Secondary, Accent color pickers
- Background/Foreground colors
- Support for RGB/HSL/HEX input
- Color contrast checker
- Preset color palettes

#### AssetUploader
- Drag-and-drop interface
- Image preview with dimensions
- Automatic optimization
- Support for logo, favicon, backgrounds

#### ThemePreview
- Iframe with isolated styles
- Device frame options (desktop/tablet/mobile)
- Real-time updates as settings change
- Sample components showcase

## 5. THEME APPLICATION STRATEGY

### CSS Variable Generation
```typescript
interface ThemeColors {
  primary: { r: number; g: number; b: number };
  secondary: { r: number; g: number; b: number };
  accent: { r: number; g: number; b: number };
  // ... more colors
}

function generateCSSVariables(theme: Theme): string {
  const vars = [];
  
  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    vars.push(`--color-${key}: ${value.r}, ${value.g}, ${value.b};`);
  });
  
  // Typography
  if (theme.typography.fontFamily) {
    vars.push(`--font-family: ${theme.typography.fontFamily};`);
  }
  
  // Spacing, borders, etc.
  // ...
  
  return `:root {\n${vars.join('\n')}\n}`;
}
```

### Theme Loading Strategy
1. **Server-side**: Inject active theme CSS variables into HTML head
2. **Client-side**: ThemeProvider loads and applies theme
3. **Caching**: Store compiled CSS in localStorage
4. **Hot reload**: WebSocket for live preview updates

### Integration with Existing System
- Extend current ThemeProvider
- Maintain backward compatibility
- Use existing CSS variable pattern
- Integrate with dark mode toggle

## 6. MIGRATION STRATEGY

### Migration SQL
```sql
-- Create theme tables
-- (schemas from above)

-- Insert default theme from current settings
INSERT INTO themes (name, slug, description, is_active, is_default, is_system, colors)
VALUES (
    'Default Theme',
    'default',
    'System default theme',
    true,
    true,
    true,
    jsonb_build_object(
        'primary', jsonb_build_object('r', 251, 'g', 115, 'b', 22),
        'secondary', jsonb_build_object('r', 239, 'g', 68, 'b', 68),
        'accent', jsonb_build_object('r', 59, 'g', 130, 'b', 246)
    )
);

-- Add theme storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('theme-assets', 'theme-assets', true);

-- RLS policies
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_history ENABLE ROW LEVEL SECURITY;

-- Public read for active theme
CREATE POLICY "Public can read active theme" ON public.themes
    FOR SELECT
    USING (is_active = true);

-- Admin policies
CREATE POLICY "Admins can manage themes" ON public.themes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
        )
    );
```

## 7. IMPLEMENTATION ROADMAP

### Phase 1: Database & API (Week 1)
- Create migration files
- Implement theme tables
- Build core API endpoints
- Add theme service layer

### Phase 2: Admin UI Foundation (Week 2)
- Theme list page
- Basic theme editor
- Color picker integration
- Asset upload functionality

### Phase 3: Advanced Features (Week 3)
- Live preview system
- Import/export functionality
- Version history
- Custom CSS editor

### Phase 4: Integration & Testing (Week 4)
- Integrate with existing ThemeProvider
- Performance optimization
- Cross-browser testing
- Documentation

## 8. TECHNICAL CONSIDERATIONS

### Performance
- Compile themes to static CSS
- Cache active theme aggressively
- Lazy load theme editor components
- Optimize asset delivery via CDN

### Security
- Sanitize custom CSS input
- Validate color values
- Restrict file upload types/sizes
- CSRF protection for theme activation

### Scalability
- Theme compilation queue for complex themes
- Asset storage optimization
- Database indexing strategy
- API rate limiting

### Accessibility
- Color contrast validation
- WCAG compliance checker
- Accessible color picker
- Keyboard navigation support