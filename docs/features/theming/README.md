# Theme System User Guide

## Overview

The Uluntu features a comprehensive theming system that allows administrators to customize the visual appearance of the entire platform. This guide covers all aspects of the theme system, from basic usage to advanced customization.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Theme Manager Interface](#theme-manager-interface)
3. [Preset Themes](#preset-themes)
4. [Custom Theme Creation](#custom-theme-creation)
5. [Accessibility Features](#accessibility-features)
6. [Performance Optimization](#performance-optimization)
7. [Import/Export Themes](#importexport-themes)
8. [Troubleshooting](#troubleshooting)
9. [Developer Documentation](#developer-documentation)

## Getting Started

### Accessing the Theme Manager

1. Navigate to **Admin Settings** → **Appearance**
2. Click on the **Theme Manager** tab
3. You'll see the theme management interface with preset themes and customization options

### Quick Start

1. **Select a Preset Theme**: Click on any of the professionally designed preset themes
2. **Preview Changes**: Use the live preview to see how the theme looks
3. **Save Theme**: Click "Save Theme" to apply changes platform-wide

## Theme Manager Interface

### Main Components

#### 1. **Theme Selector Panel** (Left Side)
- Displays all available preset themes
- Shows color swatches for quick visual reference
- Highlights the currently active theme
- Provides theme descriptions

#### 2. **Customization Panel** (Right Side)
- **Color Palette**: Edit individual colors
- **Typography**: Adjust fonts and text sizes
- **Layout**: Configure spacing and borders
- **Live Preview**: Real-time theme visualization

#### 3. **Action Toolbar**
- 👁️ **Preview Toggle**: Show/hide the live preview
- ⬆️ **Import**: Load a theme from a JSON file
- ⬇️ **Export**: Save current theme as JSON
- 📋 **Copy CSS**: Copy theme CSS variables
- 🔄 **Reset**: Revert to default theme

## Preset Themes

### Available Themes

#### 1. **Modern Blue** 🔵
- **Best for**: Corporate, professional environments
- **Characteristics**: Clean, calming blue tones with excellent readability
- **Accessibility**: WCAG AA compliant

#### 2. **Dark Professional** 🌙
- **Best for**: Reduced eye strain, night usage
- **Characteristics**: Sophisticated dark theme with high contrast
- **Accessibility**: Optimized for low-light environments

#### 3. **Light Minimal** ⚪
- **Best for**: Content-focused applications
- **Characteristics**: Maximum whitespace, subtle grays
- **Accessibility**: High readability with minimal distractions

#### 4. **Vibrant** 🎨
- **Best for**: Creative, energetic communities
- **Characteristics**: Bold orange and purple accents
- **Accessibility**: Carefully balanced for visual impact

#### 5. **Classic** 📚
- **Best for**: Traditional, professional contexts
- **Characteristics**: Timeless design with serif typography
- **Accessibility**: Excellent readability for long-form content

## Custom Theme Creation

### Step-by-Step Guide

1. **Start with a Preset**
   - Select a preset theme closest to your desired look
   - Click "Edit Colors" to enable customization

2. **Customize Colors**
   - **Primary Color**: Main brand color (buttons, links)
   - **Secondary Color**: Supporting color for less emphasis
   - **Accent Color**: Highlights and call-to-actions
   - **Background Color**: Main page background
   - **Surface Color**: Card and panel backgrounds
   - **Text Colors**: Primary and secondary text

3. **Adjust Typography**
   - **Font Family**: Choose from Google Fonts library
   - **Base Font Size**: 14-20px recommended
   - **Font Weights**: Light (300) to Black (900)
   - **Line Heights**: Adjustable for optimal readability
   
   #### Font Selection Process
   1. Click on the Font Family dropdown in Typography settings
   2. Search for fonts by name or browse by category:
      - Sans Serif (clean, modern)
      - Serif (traditional, elegant)
      - Display (decorative, impactful)
      - Handwriting (personal, casual)
      - Monospace (technical, code)
   3. Preview fonts with custom text before applying
   4. Font loads automatically when selected
   5. System applies fallback fonts for reliability

4. **Configure Layout**
   - **Border Radius**: 0-20px for rounded corners
   - **Shadow Style**: None, small, medium, or large
   - **Container Width**: Maximum content width

### Color Selection Tips

- **Contrast**: Ensure text is readable against backgrounds
- **Brand Alignment**: Use your organization's brand colors
- **Consistency**: Limit color palette to 3-5 main colors
- **Accessibility**: Check contrast warnings in real-time

## Accessibility Features

### Built-in Accessibility Checks

The theme system automatically validates:
- ✅ **Text Contrast**: Minimum 4.5:1 for normal text
- ✅ **Large Text Contrast**: Minimum 3:1 for headings
- ✅ **Button Contrast**: White text on colored backgrounds
- ✅ **Focus Indicators**: Visible keyboard navigation

### Accessibility Warnings

When a theme fails accessibility checks:
1. ⚠️ Yellow warning box appears
2. Specific issues are listed
3. Contrast ratios are displayed
4. Suggestions for improvement provided

### Keyboard Navigation

- **Tab**: Navigate through interface elements
- **Enter/Space**: Select themes or activate buttons
- **D**: Quick switch device preview
- **V**: Toggle preview visibility
- **Arrow Keys**: Navigate theme list

## Performance Optimization

### Automatic Optimizations

1. **Theme Caching**
   - Themes cached for 1 hour
   - Instant switching between previously used themes
   - LocalStorage persistence

2. **Lazy Loading**
   - Theme assets loaded on demand
   - Preview images optimized
   - Font preloading for smooth transitions

3. **Debounced Updates**
   - Color changes batched
   - 300ms delay prevents excessive updates
   - Smooth real-time preview

### Best Practices

- **Limit Custom Fonts**: Use system fonts when possible
- **Optimize Images**: Keep theme previews under 100KB
- **Test Performance**: Check theme switching speed
- **Monitor Cache**: Clear cache if themes seem outdated

## Import/Export Themes

### Exporting a Theme

1. Customize your theme
2. Click the **Export** button (⬇️)
3. Theme downloads as `theme-[id]-[timestamp].json`
4. Share file with other administrators

### Importing a Theme

1. Click the **Import** button (⬆️)
2. Select a `.json` theme file
3. Theme loads with "(Imported)" suffix
4. Review and save to apply

### Theme File Format

```json
{
  "id": "custom-theme",
  "name": "My Custom Theme",
  "description": "A beautiful custom theme",
  "isDark": false,
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#64748B",
    "accent": "#0EA5E9",
    "background": "#F8FAFC",
    "surface": "#FFFFFF",
    "text": "#1E293B"
  },
  "typography": {
    "fontFamily": "Inter",
    "fontSizeBase": 16
  },
  "layout": {
    "borderRadius": 8,
    "shadowStyle": "medium"
  }
}
```

## Troubleshooting

### Common Issues

#### Theme Not Applying
- **Solution**: Clear browser cache and reload
- Check browser console for errors
- Ensure you clicked "Save Theme"

#### Colors Look Different
- **Cause**: Monitor color profiles
- **Solution**: Test on multiple devices
- Use web-safe colors

#### Poor Performance
- **Solution**: Disable theme transitions temporarily
- Clear theme cache
- Reduce custom font usage

#### Import Fails
- **Cause**: Invalid JSON format
- **Solution**: Validate JSON structure
- Check file isn't corrupted

### Error Recovery

If the theme system encounters an error:
1. Error boundary displays helpful message
2. Click "Try Again" to retry
3. Use "Reset to Default" if issues persist
4. Contact support with error details

## Developer Documentation

### Architecture Overview

```
Theme System
├── Theme Presets (predefined configurations)
├── Theme Manager (UI component)
├── Theme Cache (performance layer)
├── Theme Provider (React context)
└── Accessibility Utils (validation)
```

### Key Components

#### ThemeManager
Main UI component for theme management
- Location: `/src/components/admin/settings/ThemeManager.tsx`
- Props: `currentTheme`, `onThemeChange`, `onSave`

#### ThemeProvider
React context providing theme to entire app
- Location: `/src/providers/ThemeProvider.tsx`
- Hooks: `useTheme()`

#### Theme Presets
Predefined theme configurations
- Location: `/src/lib/themes/presets.ts`
- Validation: WCAG compliance built-in

#### Theme Cache
Performance optimization layer
- Location: `/src/lib/services/themeCache.ts`
- Features: LRU eviction, localStorage persistence

### Integration Guide

```typescript
// Using theme in components
import { useTheme } from '@/providers/ThemeProvider';

function MyComponent() {
  const { theme, primaryColor } = useTheme();
  
  return (
    <div style={{ color: primaryColor }}>
      Current theme: {theme}
    </div>
  );
}
```

### CSS Variables

All theme values are available as CSS variables:

```css
:root {
  /* Colors */
  --theme-color-primary: #3B82F6;
  --theme-color-secondary: #64748B;
  --theme-color-accent: #0EA5E9;
  --theme-color-background: #F8FAFC;
  --theme-color-surface: #FFFFFF;
  --theme-color-text: #1E293B;
  
  /* Typography */
  --theme-font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --theme-font-family-heading: 'Inter', system-ui, -apple-system, sans-serif;
  --theme-font-size-base: 16px;
  --theme-font-size-sm: 14px;
  --theme-font-size-lg: 18px;
  --theme-font-size-xl: 20px;
  --theme-font-size-2xl: 24px;
  --theme-font-size-3xl: 30px;
  --theme-font-size-4xl: 36px;
  --theme-line-height-base: 1.5;
  --theme-line-height-tight: 1.25;
  --theme-line-height-loose: 1.75;
  
  /* Borders & Spacing */
  --theme-radius-sm: 4px;
  --theme-radius-md: 8px;
  --theme-radius-lg: 12px;
}
```

### Testing Themes

```typescript
// Test theme accessibility
import { validateThemeAccessibility } from '@/lib/themes/presets';

const validation = validateThemeAccessibility(myTheme);
if (!validation.valid) {
  console.error('Theme issues:', validation.issues);
}
```

## Font System Details

### How Fonts Are Loaded

1. **Font Selection**
   - User selects a font from the FontSelector component
   - Component displays popular fonts and allows searching
   - Preview text can be customized for testing

2. **Dynamic Loading**
   - When a font is selected, a Google Fonts link is created
   - Link includes weight variations (300-700)
   - Font is loaded asynchronously to prevent blocking
   - Font Loading API ensures font is ready before use

3. **Application**
   - Font is applied via CSS variables
   - Body font: `--theme-font-family`
   - Heading font: `--theme-font-family-heading`
   - Fallback chain ensures text remains readable

4. **Persistence**
   - Font choice is saved to database
   - Applied on page load for all users
   - Cached in browser for performance

### Font Fallback System

```css
/* Example fallback chain */
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 
             'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 
             'Helvetica Neue', sans-serif;
```

- **Primary**: Selected Google Font
- **System**: Native system fonts for performance
- **Generic**: Final fallback (sans-serif, serif, monospace)

### Performance Optimization

1. **Font Display Strategy**
   - Uses `display=swap` for better loading experience
   - Text remains visible with fallback during load
   - Smooth transition when custom font loads

2. **Caching**
   - Google Fonts are cached by browsers
   - Popular fonts often pre-cached
   - Reduces load time on repeat visits

3. **Weight Optimization**
   - Only requested weights are loaded (300-700)
   - Reduces download size
   - Synthetic bold/italic avoided

### Troubleshooting Font Issues

#### Font Not Loading
1. Check internet connection
2. Verify Content Security Policy allows fonts.googleapis.com
3. Check browser console for errors
4. Try a different font to isolate issue

#### Font Looks Different
1. Ensure correct weights are loaded
2. Check font rendering settings in OS
3. Verify font supports required characters
4. Test in different browsers

#### Performance Issues
1. Use popular fonts (better cached)
2. Limit number of font weights
3. Consider system fonts for critical text
4. Enable font-display: swap

## Support

For additional help:
- Check the [FAQ section](#common-issues)
- Contact your system administrator
- Submit a support ticket
- Review browser console for detailed errors

---

*Last updated: December 2024*
*Version: 1.0.0*