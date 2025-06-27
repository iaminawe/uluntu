# Font System Documentation

## Overview

The Nelson Tech platform includes a comprehensive font management system integrated with the theme system. This system provides dynamic font loading from Google Fonts, real-time preview capabilities, and robust fallback mechanisms to ensure optimal typography across all devices and network conditions.

## Key Features

- **Google Fonts Integration**: Access to 100+ popular web fonts
- **Dynamic Font Loading**: Fonts loaded on-demand to optimize performance
- **Real-time Preview**: See font changes instantly before applying
- **Font Categories**: Filter by Sans Serif, Serif, Display, Handwriting, and Monospace
- **Custom Fallback Chains**: Ensure text remains readable even if custom fonts fail to load
- **Separate Body & Heading Fonts**: Different fonts for content and titles
- **Font Weight Support**: 300 (Light) to 900 (Black) weights
- **Font Size Scale**: Configurable from xs to 4xl
- **Line Height Control**: Tight, Normal, and Relaxed options

## Architecture

### Component Structure

```
FontSelector Component
├── Font Search & Filter
├── Category Selection
├── Font Grid Display
├── Preview Text Input
├── Font Size Configuration
├── Font Weight Selection
└── Line Height Controls
```

### Data Flow

1. **Font Selection**
   - User browses/searches fonts in FontSelector
   - Font metadata loaded from Google Fonts API or fallback list
   - Preview updates with selected font

2. **Font Loading**
   - Google Fonts link dynamically created
   - Font files loaded asynchronously
   - Font Loading API ensures readiness

3. **Font Application**
   - CSS variables updated
   - Theme configuration saved to database
   - All users see updated fonts

## Implementation Details

### Font Loading Process

```typescript
// 1. Font Selection Handler
const handleFontChange = (fontFamily: string) => {
  loadGoogleFont(fontFamily);
  onChange({ 
    fontFamily,
    fontFallback: `${fontFamily}, system-ui, -apple-system, sans-serif`
  });
};

// 2. Dynamic Font Loading
const loadGoogleFont = (fontFamily: string) => {
  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-')}`;
  let fontLink = document.getElementById(fontId);
  
  if (!fontLink) {
    fontLink = document.createElement('link');
    fontLink.id = fontId;
    fontLink.rel = 'stylesheet';
    fontLink.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
    document.head.appendChild(fontLink);
  }
};

// 3. Font Application in Theme Provider
const applyFontToDOM = (typography: ThemeTypography) => {
  const root = document.documentElement;
  
  // Apply CSS variables
  root.style.setProperty('--theme-font-family', typography.font_family);
  root.style.setProperty('--theme-font-family-heading', typography.font_family_heading);
  
  // Apply to body element
  document.body.style.fontFamily = typography.font_family;
};
```

### CSS Variables

```css
:root {
  /* Font Families */
  --theme-font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --theme-font-family-heading: 'Inter', system-ui, -apple-system, sans-serif;
  
  /* Font Sizes */
  --theme-font-size-base: 16px;
  --theme-font-size-xs: 12px;
  --theme-font-size-sm: 14px;
  --theme-font-size-lg: 18px;
  --theme-font-size-xl: 20px;
  --theme-font-size-2xl: 24px;
  --theme-font-size-3xl: 30px;
  --theme-font-size-4xl: 36px;
  
  /* Line Heights */
  --theme-line-height-base: 1.5;
  --theme-line-height-tight: 1.25;
  --theme-line-height-loose: 1.75;
}
```

### Font Fallback System

```css
/* Standard fallback chain */
font-family: 'Custom Font', system-ui, -apple-system, BlinkMacSystemFont, 
             'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 
             'Helvetica Neue', sans-serif;

/* System font stack (no external loading) */
font-family: system-ui, -apple-system, BlinkMacSystemFont, 
             'Segoe UI', Roboto, sans-serif;
```

## Configuration

### Environment Variables

```env
# Optional: Google Fonts API Key for extended font library
VITE_GOOGLE_FONTS_API_KEY=your-api-key-here
```

Without an API key, the system uses a curated list of popular fonts.

### Popular Fonts List

```typescript
const popularFonts = [
  { family: 'Inter', category: 'sans-serif' },
  { family: 'Roboto', category: 'sans-serif' },
  { family: 'Open Sans', category: 'sans-serif' },
  { family: 'Lato', category: 'sans-serif' },
  { family: 'Poppins', category: 'sans-serif' },
  { family: 'Montserrat', category: 'sans-serif' },
  { family: 'Playfair Display', category: 'serif' },
  { family: 'Merriweather', category: 'serif' },
  { family: 'Source Code Pro', category: 'monospace' },
  { family: 'Fira Code', category: 'monospace' }
];
```

## Performance Optimization

### Loading Strategies

1. **Lazy Loading**
   - Fonts loaded only when selected
   - Prevents unnecessary downloads

2. **Font Display Swap**
   - `display=swap` ensures text visible during load
   - Smooth transition when font arrives

3. **Weight Optimization**
   - Only requested weights loaded (300-700)
   - Reduces total download size

4. **Browser Caching**
   - Google Fonts leverages browser cache
   - Popular fonts often pre-cached

### Best Practices

1. **Limit Font Variations**
   - Use maximum 2-3 different fonts
   - Minimize weight variations

2. **Use Popular Fonts**
   - Better cache hit rate
   - Faster load times

3. **System Font Fallbacks**
   - Always include system fonts
   - Ensures readability on slow connections

## Security Considerations

### Input Validation

```typescript
// Sanitize font family names
const sanitizeFontFamily = (fontFamily: string): string => {
  // Remove potentially dangerous characters
  return fontFamily
    .replace(/[<>\"']/g, '')
    .trim();
};
```

### Content Security Policy

```
Content-Security-Policy: 
  font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
```

## Troubleshooting

### Common Issues

#### Font Not Loading

**Symptoms**: Custom font not displaying, fallback font shown

**Solutions**:
1. Check internet connection
2. Verify CSP allows fonts.googleapis.com
3. Check browser console for errors
4. Clear browser cache
5. Try different font

#### Font Flickering (FOUT)

**Symptoms**: Text briefly shows in fallback font before custom font

**Solutions**:
1. Ensure `display=swap` is used
2. Consider font preloading for critical fonts
3. Use font-display: optional for non-critical text

#### Font Rendering Differences

**Symptoms**: Font looks different across browsers/OS

**Solutions**:
1. Test on multiple platforms
2. Adjust font-weight if needed
3. Consider -webkit-font-smoothing
4. Use appropriate font formats

### Debug Commands

```javascript
// Check loaded fonts
document.fonts.ready.then(() => {
  document.fonts.forEach(font => {
    console.log(font.family, font.status);
  });
});

// Check CSS variables
const styles = getComputedStyle(document.documentElement);
console.log('Font family:', styles.getPropertyValue('--theme-font-family'));

// Force font reload
document.fonts.load('16px Inter').then(() => {
  console.log('Font loaded successfully');
});
```

## API Reference

### FontSelector Props

```typescript
interface FontSelectorProps {
  typography: Theme['typography'];
  onChange: (typography: Partial<Theme['typography']>) => void;
}
```

### Typography Configuration

```typescript
interface ThemeTypography {
  font_family: string;
  font_family_heading: string;
  font_size_base: string;
  font_size_sm: string;
  font_size_lg: string;
  font_size_xl: string;
  font_size_2xl: string;
  font_size_3xl: string;
  font_size_4xl: string;
  line_height_base: string;
  line_height_tight: string;
  line_height_loose: string;
}
```

## Migration Guide

### Updating from Previous Versions

1. **Database Migration**
   ```sql
   -- Add font configuration to theme tables
   ALTER TABLE theme_configurations 
   ADD COLUMN IF NOT EXISTS font_weights JSONB DEFAULT '{"300": true, "400": true, "500": true, "600": true, "700": true}';
   ```

2. **Update Theme Provider**
   - Ensure font loading logic is included
   - Update CSS variable names if needed

3. **Test Font Loading**
   - Verify fonts load correctly
   - Check fallback behavior
   - Test on slow connections

## Future Enhancements

- **Variable Fonts**: Support for variable font features
- **Local Fonts**: Upload and use custom font files
- **Font Pairing Suggestions**: AI-powered font combinations
- **Performance Metrics**: Font loading performance tracking
- **Offline Support**: Cache fonts for offline use
- **Font Subsetting**: Load only required characters

## Support

For font-related issues:
1. Check browser console for errors
2. Verify network requests to fonts.googleapis.com
3. Review CSP headers
4. Test with different fonts
5. Contact system administrator if issues persist