# ContentAIEditor Component

A reusable AI-powered content editor that can be integrated into all content edit pages (News, Events, Resources, Groups, Gallery, Marketplace, Opportunities).

## Features

- **AI-Powered Content Generation**: Generate content specific to different content types
- **Unsplash Image Integration**: Automatically insert relevant images
- **Multiple Editor Modes**: Visual, Markdown, and HTML editing
- **Content-Type Specific Prompts**: Customized AI prompts based on content type
- **Text Enhancement**: Improve, expand, shorten, and fix grammar
- **Flexible Integration**: Easy to integrate into existing forms and workflows

## Installation

The component is already available in the project at `/src/components/content/`.

## Basic Usage

```tsx
import React, { useState } from 'react';
import { ContentAIEditor } from '@/components/content';

function MyContentForm() {
  const [content, setContent] = useState('');

  return (
    <ContentAIEditor
      value={content}
      onChange={setContent}
      contentType="news"
      placeholder="Write your news article..."
      includeImages={true}
    />
  );
}
```

## Advanced Usage with Hook

```tsx
import React from 'react';
import { useContentAIEditor } from '@/components/content';

function AdvancedContentEditor() {
  const {
    content,
    setContent,
    isProcessing,
    generateContentWithImages,
    improveContent,
    aiConfig
  } = useContentAIEditor({
    contentType: 'events',
    includeImages: true,
    onContentChange: (content) => console.log('Content changed:', content),
    onSave: async (content) => {
      // Save to your backend
      await saveToBackend(content);
    }
  });

  return (
    <div>
      <button 
        onClick={() => generateContentWithImages('Tech Conference 2024')}
        disabled={isProcessing || !aiConfig.isConfigured}
      >
        Generate Event Content
      </button>
      
      <ContentAIEditor
        value={content}
        onChange={setContent}
        contentType="events"
        disabled={isProcessing}
      />
    </div>
  );
}
```

## Props

### ContentAIEditor

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Current content value |
| `onChange` | `(content: string) => void` | - | Callback when content changes |
| `placeholder` | `string` | `"Enter your content here..."` | Placeholder text |
| `contentType` | `ContentType` | `"general"` | Content type for customized prompts |
| `includeImages` | `boolean` | `true` | Enable Unsplash image integration |
| `mode` | `EditorMode` | `"visual"` | Editor mode (visual/markdown/html) |
| `disabled` | `boolean` | `false` | Disable the editor |
| `className` | `string` | `""` | Custom CSS classes |
| `height` | `string` | `"400px"` | Editor height |
| `customPrompts` | `AIPrompt[]` | `[]` | Custom AI prompts |

### ContentType Options

- `"news"` - News articles, press releases
- `"events"` - Event descriptions, announcements
- `"resources"` - Guides, tutorials, documentation
- `"groups"` - Group descriptions, guidelines
- `"gallery"` - Photo captions, gallery descriptions
- `"marketplace"` - Product/service descriptions
- `"opportunities"` - Job postings, volunteer opportunities
- `"blog"` - Blog posts, articles
- `"general"` - Any other content type

## Content-Type Specific Features

Each content type comes with specialized AI prompts and generation features:

### News
- Generate full news articles with headlines
- Create news summaries
- Generate multiple headline options

### Events
- Create engaging event descriptions
- Generate detailed event agendas
- Write event announcements

### Resources
- Create comprehensive guides
- Write step-by-step tutorials
- Generate FAQ sections

### Marketplace
- Write compelling product descriptions
- Create service listings
- Generate sales pitches

### Opportunities
- Create detailed job descriptions
- Write volunteer opportunity descriptions
- Generate internship postings

### Groups
- Write engaging group descriptions
- Create member guidelines

### Gallery
- Generate photo captions
- Write gallery descriptions

### Blog
- Generate full blog posts (1000-1500 words)
- Create engaging introductions
- Write compelling conclusions

## Integration Examples

### News Article Form

```tsx
function NewsArticleForm() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });

  return (
    <form>
      <input
        type="text"
        placeholder="Article Title"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
      />
      
      <ContentAIEditor
        value={formData.content}
        onChange={(content) => setFormData(prev => ({ ...prev, content }))}
        contentType="news"
        placeholder="Write your news article..."
      />
      
      <button type="submit">Publish Article</button>
    </form>
  );
}
```

### Event Description Editor

```tsx
function EventForm() {
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    date: '',
    location: ''
  });

  const customPrompts = [
    {
      id: 'event-safety',
      label: '🛡️ Safety Guidelines',
      prompt: 'Generate safety guidelines and protocols for this event.',
      icon: '🛡️'
    }
  ];

  return (
    <div>
      {/* Other form fields */}
      
      <ContentAIEditor
        value={eventData.description}
        onChange={(content) => setEventData(prev => ({ ...prev, description: content }))}
        contentType="events"
        customPrompts={customPrompts}
        height="500px"
      />
    </div>
  );
}
```

### Marketplace Listing

```tsx
function ProductListingForm() {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: 0,
    images: []
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Product Name"
        value={product.name}
        onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
      />
      
      <ContentAIEditor
        value={product.description}
        onChange={(description) => setProduct(prev => ({ ...prev, description }))}
        contentType="marketplace"
        placeholder="Describe your product or service..."
        includeImages={true}
      />
      
      <input
        type="number"
        placeholder="Price"
        value={product.price}
        onChange={(e) => setProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
      />
    </div>
  );
}
```

## Setup Requirements

### AI Configuration

Set up your AI provider in your environment variables:

```env
# OpenAI (default)
VITE_AI_PROVIDER=openai
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_OPENAI_MODEL=gpt-4o-mini

# Or Anthropic
VITE_AI_PROVIDER=anthropic
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
VITE_ANTHROPIC_MODEL=claude-haiku-5-5

# AI Settings
VITE_AI_MAX_TOKENS=4000
VITE_AI_TEMPERATURE=0.7
ENABLE_AI_EDITOR=true
```

### Unsplash Integration (Optional)

For image insertion functionality:

```env
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

## Styling

The component uses Tailwind CSS classes and respects your app's dark mode settings. You can customize the appearance by:

1. Adding custom CSS classes via the `className` prop
2. Overriding the default Tailwind classes
3. Using CSS custom properties for colors and spacing

## Accessibility

The component includes:

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast support in dark mode
- Focus management for interactive elements

## Performance

The component is optimized for performance with:

- Debounced AI operations
- Lazy loading of heavy dependencies
- Memoized prompt calculations
- Efficient re-rendering patterns

## Testing

Example test setup:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContentAIEditor } from '@/components/content';

test('renders content editor with AI features', async () => {
  const handleChange = jest.fn();
  
  render(
    <ContentAIEditor
      value=""
      onChange={handleChange}
      contentType="news"
    />
  );
  
  expect(screen.getByRole('textbox')).toBeInTheDocument();
  expect(screen.getByText(/Generate news/i)).toBeInTheDocument();
});
```

## Contributing

When adding new content types or features:

1. Update the `ContentType` union type in `types.ts`
2. Add content-specific prompts in the `CONTENT_TYPE_PROMPTS` object
3. Update the generation logic in `generateContentWithImages`
4. Add tests for new functionality
5. Update this README with examples

## License

This component is part of the Nelson Tech project and follows the project's licensing terms.