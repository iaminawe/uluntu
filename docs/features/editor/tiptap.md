# Rich Text Editor Implementation Guide

## Overview

The Uluntu uses a custom rich text editor built on top of Tiptap v2, providing a modern, extensible editing experience with drag-and-drop functionality, slash commands, and image support.

## Features

### 1. **Global Drag Handles**
- Hover over any block element to reveal a drag handle on the left
- Click and drag to reorder paragraphs, headings, lists, and other blocks
- Powered by `tiptap-extension-global-drag-handle`

### 2. **Slash Commands**
- Type `/` anywhere in the editor to open the command menu
- Quick access to:
  - Headings (H1, H2, H3)
  - Lists (bullet and numbered)
  - Block quotes
  - Images

### 3. **Bubble Menu**
- Select any text to reveal formatting options
- Available formats:
  - **Bold** (Ctrl/Cmd + B)
  - *Italic* (Ctrl/Cmd + I)
  - ~~Strikethrough~~
  - Headings
  - Lists
  - Quotes

### 4. **Image Support**
- Add images via:
  - Slash command (`/image`)
  - Bubble menu image button
- Currently supports URL-based images
- Images are responsive and styled with rounded corners

## Technical Implementation

### Component Structure

```
src/shared/components/ui/RichTextEditor/
├── index.tsx                 # Main export
├── MinimalTiptap.tsx        # Primary editor implementation
├── NovelEditor.tsx          # Alternative Novel-based implementation (unused)
├── extensions.ts            # Tiptap extensions configuration
├── types.ts                 # TypeScript interfaces
└── DragHandle.tsx          # Custom drag handle component (unused)
```

### Key Dependencies

```json
{
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-placeholder": "^2.x",
  "@tiptap/extension-image": "^2.x",
  "tiptap-extension-global-drag-handle": "^0.x"
}
```

### Usage Example

```tsx
import RichTextEditor from '@/shared/components/ui/RichTextEditor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start writing..."
      height="400px"
      label="Article Content"
      required
    />
  );
}
```

### Props Interface

```typescript
interface RichTextEditorProps {
  value: string;                    // HTML content
  onChange: (value: string) => void; // Change handler
  placeholder?: string;             // Placeholder text
  height?: string;                  // Editor height (default: '200px')
  disabled?: boolean;               // Disable editing
  label?: string;                   // Field label
  required?: boolean;               // Required field indicator
  id?: string;                     // HTML id attribute
  className?: string;              // Additional CSS classes
}
```

## Styling

The editor uses custom CSS for the drag handle functionality:

```css
/* Global drag handle styles */
.drag-handle {
  position: fixed;
  opacity: 1;
  transition: opacity ease-in 0.2s;
  border-radius: 0.25rem;
  background-image: url("data:image/svg+xml,...");
  background-size: calc(0.5em + 0.375rem);
  width: 1.2rem;
  height: 1.5rem;
  z-index: 50;
  cursor: grab;
}

.drag-handle:hover {
  background-color: #f9fafb;
}

.drag-handle.hide {
  opacity: 0;
  pointer-events: none;
}
```

## Current Limitations

1. **Image Upload**: Currently uses data URLs for demo purposes. Production implementation should integrate with Supabase storage.
2. **Collaborative Editing**: Not currently implemented but can be added with Tiptap's collaboration extension.
3. **Mobile Optimization**: Drag handles are hidden on mobile devices (< 600px width).

## Future Enhancements

1. **Supabase Image Upload Integration**
   ```typescript
   const uploadFn = async (file: File) => {
     const { data, error } = await supabase.storage
       .from('images')
       .upload(`${Date.now()}-${file.name}`, file);
     
     if (error) throw error;
     return supabase.storage.from('images').getPublicUrl(data.path).data.publicUrl;
   };
   ```

2. **Additional Extensions**
   - Tables
   - Code syntax highlighting
   - Embeds (YouTube, Twitter, etc.)
   - Mentions (@user)
   - Task lists

3. **Markdown Support**
   - Import/export markdown
   - Markdown shortcuts

## Integration Points

The rich text editor is currently integrated in:
- `/news/create` - News article creation
- `/news/:id/edit` - News article editing
- Can be easily added to other content creation forms

## Troubleshooting

### Drag handles not appearing
1. Ensure CSS is properly loaded in `src/index.css`
2. Check that `tiptap-extension-global-drag-handle` is installed
3. Verify no CSS conflicts with `.drag-handle` class

### Slash commands not working
1. Check for console errors
2. Ensure StarterKit extension is loaded
3. Verify no keyboard event conflicts

### Images not displaying
1. Check image URL validity
2. Ensure Image extension is configured
3. Verify CORS settings for external images

## References

- [Tiptap Documentation](https://tiptap.dev/)
- [Global Drag Handle Extension](https://github.com/ueberdosis/tiptap/tree/main/packages/extension-global-drag-handle)
- [Novel Editor](https://novel.sh/) (alternative implementation reference)