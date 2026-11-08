# Standard Form Components Integration Guide

This guide explains how to integrate the standardized form components into entity forms across the application for consistent UI/UX.

## Core Design Principles

1. **80% Width Container**: All forms use `w-4/5 mx-auto` for consistent width
2. **Slug Auto-generation**: Automatic slug generation from title/name with manual override
3. **Standard Button Layout**: Save, Publish/Unpublish, Delete in consistent positions
4. **SEO-First**: Built-in meta title/description fields for all content
5. **Consistent Spacing**: Unified padding, margins, and section dividers

## Component Overview

### 1. FormContainer
Basic wrapper providing 80% width constraint:
```tsx
<FormContainer>
  {/* Your form content */}
</FormContainer>
```

### 2. FormPageWrapper
Complete page structure with header and loading states:
```tsx
<FormPageWrapper
  title="Edit Company"
  backUrl="/companies"
  isLoading={isLoading}
>
  {/* Form content */}
</FormPageWrapper>
```

### 3. SlugField
Auto-generating slug field with validation and preview:
```tsx
<SlugField
  value={formData.slug}
  onChange={(slug) => setFormData({ ...formData, slug })}
  sourceValue={formData.title} // Auto-generates from this
  baseUrl="/companies/"
  error={errors.slug}
/>
```

### 4. SeoFields
Meta title and description with character counters:
```tsx
<SeoFields
  metaTitle={formData.metaTitle}
  metaDescription={formData.metaDescription}
  onMetaTitleChange={(value) => setFormData({ ...formData, metaTitle: value })}
  onMetaDescriptionChange={(value) => setFormData({ ...formData, metaDescription: value })}
/>
```

### 5. StandardFormActions
Unified action buttons with publish toggle:
```tsx
<StandardFormActions
  onSubmit={handleSubmit}
  onCancel={() => navigate('/companies')}
  onDelete={handleDelete}
  onPublishToggle={handlePublishToggle}
  isNew={!id}
  isPublished={formData.status === 'published'}
  showPublishToggle={true}
  isSubmitting={isSubmitting}
/>
```

## Integration Examples by Entity Type

### Companies Form
```tsx
import { 
  FormPageWrapper, 
  SlugField, 
  SeoFields, 
  StandardFormActions,
  FormSectionDivider 
} from '@/shared/components/ui/Form/StandardFormComponents';

export default function CompanyEditPage() {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    metaTitle: '',
    metaDescription: '',
    status: 'draft',
    // ... other fields
  });

  return (
    <FormPageWrapper
      title={isEditMode ? 'Edit Company' : 'Add Company'}
      backUrl="/companies"
      isLoading={companyLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          
          <FormInput
            label="Company Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            error={errors.name}
          />
          
          <SlugField
            value={formData.slug}
            onChange={(slug) => setFormData({ ...formData, slug })}
            sourceValue={formData.name}
            baseUrl="/companies/"
            error={errors.slug}
          />
        </div>

        <FormSectionDivider />

        {/* SEO Section */}
        <SeoFields
          metaTitle={formData.metaTitle}
          metaDescription={formData.metaDescription}
          onMetaTitleChange={(value) => setFormData({ ...formData, metaTitle: value })}
          onMetaDescriptionChange={(value) => setFormData({ ...formData, metaDescription: value })}
          titlePlaceholder={`SEO title (defaults to "${formData.name}")`}
        />

        <StandardFormActions
          onSubmit={handleSubmit}
          onCancel={() => navigate('/companies')}
          onDelete={isEditMode ? handleDelete : undefined}
          onPublishToggle={handlePublishToggle}
          isNew={!slug}
          isPublished={formData.status === 'published'}
          showPublishToggle={true}
          isSubmitting={isSubmitting}
        />
      </form>
    </FormPageWrapper>
  );
}
```

### News/Articles Form
```tsx
export default function NewsEditPage() {
  return (
    <FormPageWrapper
      title={isEditMode ? 'Edit Article' : 'Create Article'}
      backUrl="/news"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <SlugField
          value={formData.slug}
          onChange={(slug) => setFormData({ ...formData, slug })}
          sourceValue={formData.title}
          baseUrl="/news/"
          helpText="URL for your article"
        />
        
        {/* Rich text editor, tags, etc. */}
        
        <SeoFields
          metaTitle={formData.metaTitle}
          metaDescription={formData.metaDescription}
          onMetaTitleChange={...}
          onMetaDescriptionChange={...}
        />
        
        <StandardFormActions
          submitText={isEditMode ? 'Update Article' : 'Create Article'}
          showPublishToggle={true}
          isPublished={formData.status === 'published'}
          // ...
        />
      </form>
    </FormPageWrapper>
  );
}
```

### Events Form
```tsx
export default function EventEditPage() {
  return (
    <FormPageWrapper
      title={isEditMode ? 'Edit Event' : 'Create Event'}
      backUrl="/events"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Event specific fields */}
        
        <SlugField
          value={formData.slug}
          onChange={(slug) => setFormData({ ...formData, slug })}
          sourceValue={formData.title}
          baseUrl="/events/"
        />
        
        <StandardFormActions
          submitText="Save Event"
          showPublishToggle={false} // Events might not need publish toggle
          // ...
        />
      </form>
    </FormPageWrapper>
  );
}
```

### Opportunities Form
```tsx
export default function OpportunityEditPage() {
  return (
    <FormPageWrapper
      title={isEditMode ? 'Edit Opportunity' : 'Post Opportunity'}
      backUrl="/opportunities"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <SlugField
          value={formData.slug}
          onChange={(slug) => setFormData({ ...formData, slug })}
          sourceValue={formData.title}
          baseUrl="/opportunities/"
          helpText="Unique URL for this opportunity"
        />
        
        {/* Requirements, responsibilities, benefits lists */}
        
        <StandardFormActions
          submitText={isEditMode ? 'Update Opportunity' : 'Post Opportunity'}
          publishText="Make Live"
          unpublishText="Archive"
          showPublishToggle={true}
          isPublished={formData.status === 'published'}
          // ...
        />
      </form>
    </FormPageWrapper>
  );
}
```

## Migration Checklist

When migrating existing forms:

1. **Replace form wrapper**:
   - Old: `<div className="max-w-3xl mx-auto">`
   - New: `<FormPageWrapper>` or `<FormContainer>`

2. **Add slug field** (if entity needs slugs):
   - Import `SlugField` component
   - Add `slug` to form state
   - Connect to title/name field for auto-generation

3. **Add SEO fields** (for content entities):
   - Import `SeoFields` component
   - Add `metaTitle` and `metaDescription` to form state

4. **Replace action buttons**:
   - Old: Custom button layout
   - New: `<StandardFormActions>` with appropriate props

5. **Use section dividers**:
   - Replace `<hr>` with `<FormSectionDivider />`

6. **Update success/error messages**:
   - Use `<SuccessMessage>` and `<ErrorMessage>` components

## Database Schema Requirements

For slug support, ensure your database tables have:
```sql
slug VARCHAR(255) UNIQUE,
meta_title VARCHAR(60),
meta_description VARCHAR(160)
```

## Best Practices

1. **Always validate slugs** on the backend for uniqueness
2. **Generate slugs** from title/name but allow manual editing
3. **Show URL preview** so users understand where content will live
4. **Limit meta fields** to recommended character counts (60/160)
5. **Consistent button order**: Delete (left), Cancel/Publish/Save (right)
6. **Loading states**: Use FormPageWrapper's built-in loading
7. **Success feedback**: Navigate after 1.5-2 seconds with success message

## Form State Pattern

Recommended form state structure:
```typescript
interface FormData {
  // Core fields
  title: string;
  slug: string;
  description: string;
  
  // SEO fields
  metaTitle: string;
  metaDescription: string;
  
  // Publishing
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  
  // Entity-specific fields
  // ...
}

const initialFormData: FormData = {
  title: '',
  slug: '',
  description: '',
  metaTitle: '',
  metaDescription: '',
  status: 'draft',
  featured: false,
  // ...
};
```

## Accessibility

All components include:
- Proper ARIA labels
- Focus management
- Keyboard navigation
- Screen reader support
- Error announcements

## Responsive Design

Components are mobile-first with breakpoints:
- Mobile: Full width with padding
- Tablet+: 80% width centered
- Form sections stack vertically on mobile
- Buttons wrap appropriately

## Testing

When testing forms with these components:
1. Test slug auto-generation and manual editing
2. Verify character counters for SEO fields
3. Test all button states (disabled, loading, etc.)
4. Verify responsive layout at different sizes
5. Test keyboard navigation through all fields