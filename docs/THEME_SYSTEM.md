# Theme System Documentation

## Overview

The Nelson Tech platform includes a comprehensive theming system that allows administrators to customize the visual appearance of the entire application. The system supports multiple themes, live preview, and complete customization of colors, typography, spacing, and more.

## Features

- **Multiple Themes**: Create and manage multiple themes
- **Live Preview**: See changes in real-time before applying
- **Preset Themes**: 5 built-in themes to choose from
- **Complete Customization**: Colors, typography, spacing, borders, shadows
- **Asset Management**: Upload logos, favicons, and background images
- **Google Fonts Integration**: Access to hundreds of web fonts
- **Accessibility Checks**: WCAG compliance validation
- **Import/Export**: Share themes between instances
- **Database Persistence**: All themes stored in database

## Database Schema

### Tables

1. **themes**
   - Core theme information
   - Tracks active/default status
   - Supports preset themes

2. **theme_configurations**
   - Stores theme settings by type (colors, typography, etc.)
   - JSONB data for flexibility

3. **theme_assets**
   - Manages uploaded images and logos
   - Integrated with Supabase Storage

4. **theme_metadata**
   - Additional site information
   - Custom CSS support

## Preset Themes

The system includes 5 preset themes:

1. **Default Orange** - Vibrant orange accents with modern design
2. **Professional Blue** - Clean, corporate appearance
3. **Modern Purple** - Contemporary with purple gradients
4. **Minimalist Green** - Eco-friendly and clean
5. **Dark Mode** - Dark theme for reduced eye strain

## Admin Interface

Access the theme system at `/admin/theme`

### Main Features

1. **Theme Selector**
   - Visual gallery of all themes
   - One-click theme switching
   - Preview before applying

2. **Theme Editor**
   - Tabbed interface for different settings
   - Real-time preview
   - Color picker with palettes
   - Font selector with Google Fonts
   - Spacing and layout controls

3. **Asset Manager**
   - Upload logos and images
   - Support for light/dark variants
   - Automatic optimization

4. **Theme Management**
   - Create new themes
   - Duplicate existing themes
   - Import/export functionality
   - Delete custom themes

## Configuration Options

### Colors
- Primary, secondary, accent colors
- Background and surface colors
- Text colors (normal and muted)
- Border colors
- Status colors (error, warning, success, info)

### Typography
- Font families (body and headings)
- Font sizes (7 levels)
- Line heights
- Google Fonts integration

### Spacing
- Spacing scale (xs to 3xl)
- Container settings
- Padding values

### Borders & Shadows
- Border radius options
- Border widths
- Shadow depths
- Custom values

### Assets
- Logo (light and dark modes)
- Favicon
- Background images
- OG image for social sharing

## API Integration

### React Hook
```typescript
import { useTheme } from '@/providers/EnhancedThemeProvider';

const {
  currentTheme,    // Active theme
  themes,          // All available themes
  setTheme,        // Change active theme
  createTheme,     // Create new theme
  updateTheme,     // Update existing theme
  previewTheme,    // Preview without saving
  // ... more methods
} = useTheme();
```

### Theme Structure
```typescript
interface Theme {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  is_default: boolean;
  is_preset: boolean;
  colors: ColorConfig;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  borders: BorderConfig;
  shadows: ShadowConfig;
  assets?: ThemeAsset[];
  metadata?: ThemeMetadata;
}
```

## Security

- Row Level Security (RLS) policies
- Admin-only write access
- Public read for active themes
- Secure asset uploads

## Performance

- Efficient caching system
- CSS variables for instant updates
- Lazy loading of theme assets
- Optimized database queries

## Migration Guide

### Setting Up

1. Run database migrations:
   ```sql
   -- Create theme system tables
   20250626000002_create_theme_system.sql
   
   -- Seed preset themes
   20250626000003_seed_preset_themes.sql
   ```

2. Generate TypeScript types:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/shared/types/supabase.ts
   ```

3. Access theme editor at `/admin/theme`

### Troubleshooting

**Theme not loading?**
- Check if migrations were run
- Verify database connection
- Check browser console for errors

**Can't save themes?**
- Verify admin permissions
- Check RLS policies
- Ensure storage bucket exists

**Preview not working?**
- Clear browser cache
- Check for CSS conflicts
- Verify theme structure

## Best Practices

1. **Test themes thoroughly** before activating
2. **Use the preview feature** to check all pages
3. **Maintain color contrast** for accessibility
4. **Keep custom CSS minimal** for maintainability
5. **Export themes** before major changes
6. **Document theme changes** for team members

## Future Enhancements

- Theme marketplace
- A/B testing support
- Scheduled theme changes
- Per-user theme preferences
- Advanced animation controls
- Component-level theming

## Support

For issues or questions:
- Check error messages in the UI
- Review browser console logs
- Verify database migrations
- Contact system administrator