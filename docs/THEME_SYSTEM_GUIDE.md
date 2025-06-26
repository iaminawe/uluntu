# Theme System User Guide

## Overview

The Nelson Tech Community Platform features a comprehensive theming system that allows administrators to customize the visual appearance of the entire platform. This guide covers all aspects of the theme system, from basic usage to advanced customization.

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
   - **Font Family**: Choose from available fonts
   - **Base Font Size**: 14-20px recommended
   - **Font Weights**: Normal, medium, and bold variations

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
  --color-primary: #3B82F6;
  --color-secondary: #64748B;
  --color-accent: #0EA5E9;
  --color-background: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-text: #1E293B;
  --font-family: Inter;
  --font-size-base: 16px;
  --border-radius: 8px;
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

## Support

For additional help:
- Check the [FAQ section](#common-issues)
- Contact your system administrator
- Submit a support ticket
- Review browser console for detailed errors

---

*Last updated: December 2024*
*Version: 1.0.0*