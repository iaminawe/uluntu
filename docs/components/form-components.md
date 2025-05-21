# Form Components

The Kootenay Tech Community application provides a set of reusable form components to create consistent, accessible, and user-friendly forms throughout the platform. All form components are designed to work together and follow the same design patterns for validation, error handling, and accessibility.

## FormSection

`FormSection` is used to create logical groups of form fields with an optional title and description.

```tsx
import { FormSection } from '../../components/ui/Form';

function MyForm() {
  return (
    <form>
      <FormSection 
        title="Personal Information" 
        description="Enter your basic personal information"
      >
        {/* Form fields go here */}
      </FormSection>
    </form>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | undefined | Section title |
| `description` | string | undefined | Optional description text |
| `children` | ReactNode | required | Form fields to include in the section |
| `className` | string | '' | Additional CSS classes to apply |

## FormHeader

`FormHeader` provides a consistent header for forms, especially on edit/create pages.

```tsx
import { FormHeader } from '../../components/ui/Form';

function ResourceEditPage() {
  const isEditing = !!id;
  
  return (
    <div>
      <FormHeader 
        title={isEditing ? 'Edit Resource' : 'Create New Resource'} 
        description="Complete the form below to submit your resource"
      />
      {/* Form content */}
    </div>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | required | Form title |
| `description` | string | undefined | Optional description text |
| `backUrl` | string | undefined | URL to navigate back to |
| `backText` | string | 'Back' | Text for the back button |
| `className` | string | '' | Additional CSS classes to apply |

## FormActions

`FormActions` provides a consistent container for form submission and cancel buttons.

```tsx
import { FormActions } from '../../components/ui/Form';

function MyForm() {
  return (
    <form>
      {/* Form fields */}
      <FormActions 
        submitText="Save Changes"
        cancelText="Cancel"
        isSubmitting={isSubmitting}
        onCancel={() => navigate(-1)}
      />
    </form>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `submitText` | string | 'Submit' | Text for the submit button |
| `cancelText` | string | 'Cancel' | Text for the cancel button |
| `isSubmitting` | boolean | false | Whether the form is currently being submitted |
| `onCancel` | function | undefined | Function to call when cancel is clicked |
| `isDisabled` | boolean | false | Whether to disable the submit button |
| `className` | string | '' | Additional CSS classes to apply |
| `showDelete` | boolean | false | Whether to show a delete button (for editing forms) |
| `onDelete` | function | undefined | Function to call when delete is clicked |
| `deleteText` | string | 'Delete' | Text for the delete button |

## FormField

`FormField` provides a consistent wrapper for form inputs with label and error messages.

```tsx
import { FormField } from '../../components/ui/Form';

function MyForm() {
  return (
    <form>
      <FormField
        label="Name"
        htmlFor="name"
        error={errors.name}
        required
      >
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`form-input ${errors.name ? 'border-red-500' : ''}`}
        />
      </FormField>
    </form>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | required | Label text for the field |
| `htmlFor` | string | required | ID of the input element |
| `error` | string | undefined | Error message to display |
| `required` | boolean | false | Whether the field is required |
| `children` | ReactNode | required | The input element |
| `className` | string | '' | Additional CSS classes to apply |
| `helpText` | string | undefined | Optional help text below the field |

## Standardized Form Input Components

### FormInput

`FormInput` provides a standardized text input field with built-in label, error handling, and consistent styling.

```tsx
import { FormInput } from '../../components/ui/Form';

function MyForm() {
  return (
    <FormInput
      id="name"
      name="name"
      label="Name"
      value={formData.name}
      onChange={handleChange}
      error={errors.name}
      required
      placeholder="Enter your full name"
      helperText="Please provide your legal name"
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | required | Unique identifier for the input |
| `name` | string | required | Name attribute for the input |
| `label` | string | undefined | Label text for the field |
| `value` | string | required | Current value of the input |
| `onChange` | function | required | Handler for value changes |
| `error` | string | undefined | Error message to display |
| `required` | boolean | false | Whether the field is required |
| `placeholder` | string | undefined | Placeholder text |
| `helperText` | string | undefined | Helper text displayed below the input |
| `type` | string | 'text' | HTML input type ('text', 'email', 'password', etc.) |
| `disabled` | boolean | false | Whether the input is disabled |
| `className` | string | '' | Additional CSS classes for the input |
| `containerClassName` | string | '' | Additional CSS classes for the container |

### FormTextarea

`FormTextarea` provides a standardized textarea field with built-in label, error handling, and consistent styling.

```tsx
import { FormTextarea } from '../../components/ui/Form';

function MyForm() {
  return (
    <FormTextarea
      id="description"
      name="description"
      label="Description"
      value={formData.description}
      onChange={handleChange}
      error={errors.description}
      rows={4}
      placeholder="Enter a detailed description"
      helperText="Provide a comprehensive description to help users understand your resource"
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | required | Unique identifier for the textarea |
| `name` | string | required | Name attribute for the textarea |
| `label` | string | undefined | Label text for the field |
| `value` | string | required | Current value of the textarea |
| `onChange` | function | required | Handler for value changes |
| `error` | string | undefined | Error message to display |
| `required` | boolean | false | Whether the field is required |
| `placeholder` | string | undefined | Placeholder text |
| `helperText` | string | undefined | Helper text displayed below the textarea |
| `rows` | number | 4 | Number of rows to display |
| `disabled` | boolean | false | Whether the textarea is disabled |
| `className` | string | '' | Additional CSS classes for the textarea |
| `containerClassName` | string | '' | Additional CSS classes for the container |

### FormSelect

`FormSelect` provides a standardized dropdown select field using the CustomSelect component for enhanced styling and functionality.

```tsx
import { FormSelect } from '../../components/ui/Form';

function MyForm() {
  return (
    <FormSelect
      id="category"
      name="category"
      label="Category"
      value={formData.category}
      onChange={handleChange}
      error={errors.category}
      required
      options={[
        { value: 'technology', label: 'Technology' },
        { value: 'design', label: 'Design' },
        { value: 'business', label: 'Business' }
      ]}
      placeholder="Select a category"
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | required | Unique identifier for the select |
| `name` | string | required | Name attribute for the select |
| `label` | string | undefined | Label text for the field |
| `value` | string | required | Current selected value |
| `onChange` | function | required | Handler for selection changes |
| `options` | array | required | Array of option objects with value and label properties |
| `error` | string | undefined | Error message to display |
| `required` | boolean | false | Whether the field is required |
| `placeholder` | string | 'Select an option' | Placeholder text when no option is selected |
| `disabled` | boolean | false | Whether the select is disabled |
| `className` | string | '' | Additional CSS classes for the select |
| `containerClassName` | string | '' | Additional CSS classes for the container |

### FormCheckbox

`FormCheckbox` provides a standardized checkbox input with label and error handling.

```tsx
import { FormCheckbox } from '../../components/ui/Form';

function MyForm() {
  return (
    <FormCheckbox
      id="terms"
      name="terms"
      label="I agree to the terms and conditions"
      checked={formData.terms}
      onChange={handleChange}
      error={errors.terms}
      required
      helperText="You must agree to the terms to continue"
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | required | Unique identifier for the checkbox |
| `name` | string | required | Name attribute for the checkbox |
| `label` | string | required | Label text for the checkbox |
| `checked` | boolean | required | Whether the checkbox is checked |
| `onChange` | function | required | Handler for checkbox state changes |
| `error` | string | undefined | Error message to display |
| `required` | boolean | false | Whether the field is required |
| `helperText` | string | undefined | Helper text displayed below the checkbox |
| `disabled` | boolean | false | Whether the checkbox is disabled |
| `className` | string | '' | Additional CSS classes for the checkbox |
| `containerClassName` | string | '' | Additional CSS classes for the container |
| `icon` | ReactNode | undefined | Optional icon to display next to the label |

### FormRadioCardGroup

`FormRadioCardGroup` provides a visually appealing group of radio buttons as cards with icons and descriptions.

```tsx
import { FormRadioCardGroup } from '../../components/ui/Form';
import { Document, Video, Image, Link } from 'lucide-react';

function MyForm() {
  return (
    <FormRadioCardGroup
      id="resourceType"
      name="resourceType"
      label="Resource Type"
      value={formData.resourceType}
      onChange={handleChange}
      error={errors.resourceType}
      required
      options={[
        { 
          value: 'document', 
          label: 'Document', 
          icon: <Document className="h-6 w-6" />,
          iconColor: 'text-blue-500'
        },
        { 
          value: 'video', 
          label: 'Video', 
          icon: <Video className="h-6 w-6" />,
          iconColor: 'text-red-500'
        },
        { 
          value: 'image', 
          label: 'Image', 
          icon: <Image className="h-6 w-6" />,
          iconColor: 'text-green-500'
        },
        { 
          value: 'link', 
          label: 'Link', 
          icon: <Link className="h-6 w-6" />,
          description: 'External website or resource',
          iconColor: 'text-purple-500'
        }
      ]}
      columns={{ sm: 2, md: 4 }}
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | required | Unique identifier for the radio group |
| `name` | string | required | Name attribute for the radio group |
| `label` | string | undefined | Label text for the field |
| `value` | string | required | Current selected value |
| `onChange` | function | required | Handler for selection changes |
| `options` | array | required | Array of option objects with value, label, icon (optional), description (optional), and iconColor (optional) |
| `error` | string | undefined | Error message to display |
| `required` | boolean | false | Whether the field is required |
| `helperText` | string | undefined | Helper text displayed below the radio group |
| `columns` | object | { sm: 1, md: 2, lg: 3 } | Responsive column configuration |
| `containerClassName` | string | '' | Additional CSS classes for the container |
| `compact` | boolean | false | Whether to use a more compact card design |

### FormDatePicker

`FormDatePicker` provides a standardized date input field with options for date, time, or datetime input.

```tsx
import { FormDatePicker } from '../../components/ui/Form';

function MyForm() {
  return (
    <FormDatePicker
      id="eventDate"
      name="eventDate"
      label="Event Date & Time"
      value={formData.eventDate}
      onChange={handleChange}
      error={errors.eventDate}
      required
      dateType="datetime-local"
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | required | Unique identifier for the date input |
| `name` | string | required | Name attribute for the date input |
| `label` | string | undefined | Label text for the field |
| `value` | string | required | Current value (formatted according to dateType) |
| `onChange` | function | required | Handler for value changes |
| `error` | string | undefined | Error message to display |
| `required` | boolean | false | Whether the field is required |
| `helperText` | string | undefined | Helper text displayed below the input |
| `dateType` | string | 'datetime-local' | Type of date input: 'date', 'datetime-local', or 'time' |
| `disabled` | boolean | false | Whether the input is disabled |
| `className` | string | '' | Additional CSS classes for the input |
| `containerClassName` | string | '' | Additional CSS classes for the container |

### FormImageUpload

`FormImageUpload` provides a standardized image upload component with preview, drag-and-drop functionality, and validation.

```tsx
import { FormImageUpload } from '../../components/ui/Form';

function MyForm() {
  const handleImageChange = (file) => {
    // Handle file upload logic
    // Update formData with image URL/file
  };

  return (
    <FormImageUpload
      id="image"
      name="image"
      label="Featured Image"
      currentImage={formData.image}
      onChange={handleImageChange}
      error={errors.image}
      required
      helperText="Recommended size: 1200 x 600px"
      maxSize={2 * 1024 * 1024} // 2MB
      acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | required | Unique identifier for the upload component |
| `name` | string | required | Name attribute for the upload component |
| `label` | string | undefined | Label text for the field |
| `currentImage` | string | undefined | URL of currently uploaded image |
| `onChange` | function | required | Handler for image file changes |
| `error` | string | undefined | Error message to display |
| `required` | boolean | false | Whether the field is required |
| `helperText` | string | undefined | Helper text displayed below the component |
| `placeholder` | string | 'Drag and drop...' | Placeholder text when no image is selected |
| `maxSize` | number | 5MB | Maximum file size in bytes |
| `acceptedTypes` | array | ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] | Array of allowed MIME types |
| `disabled` | boolean | false | Whether the component is disabled |
| `className` | string | '' | Additional CSS classes for the component |

## Loading States

### FormSkeleton

`FormSkeleton` provides a loading state placeholder for forms while data is being fetched.

```tsx
import { FormSkeleton } from '../../components/ui/Skeleton';

function ResourceEditPage() {
  const { isLoading } = useResource(id);
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <FormSkeleton 
          fields={4}
          hasHeader={true}
          hasSubmitButton={true}
          hasCancelButton={true}
        />
      </div>
    );
  }
  
  return (
    <form>{
      /* Form content */
    }</form>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fields` | number | 3 | Number of form fields to display |
| `hasHeader` | boolean | true | Whether to include a form header skeleton |
| `hasSubmitButton` | boolean | true | Whether to include a submit button skeleton |
| `hasCancelButton` | boolean | true | Whether to include a cancel button skeleton |
| `className` | string | '' | Additional CSS classes to apply |

## Dialogs

### ConfirmDialog

`ConfirmDialog` provides a standardized confirmation dialog for potentially destructive actions like deletion.

```tsx
import { ConfirmDialog } from '../../components/ui/Dialog';

function ResourceEditPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteResource(id);
      navigate('/resources');
    } catch (error) {
      console.error('Error deleting resource:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <>
      <form>
        {/* Form content */}
        <button onClick={() => setShowDeleteConfirm(true)}>Delete</button>
      </form>
      
      <ConfirmDialog
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isOpen={showDeleteConfirm}
        isProcessing={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
      />
    </>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | 'Confirm' | Dialog title |
| `message` | string or ReactNode | required | Dialog message content |
| `confirmText` | string | 'Confirm' | Text for the confirm button |
| `cancelText` | string | 'Cancel' | Text for the cancel button |
| `isOpen` | boolean | required | Whether the dialog is visible |
| `isProcessing` | boolean | false | Whether an action is being processed |
| `onConfirm` | function | required | Handler for confirm button click |
| `onCancel` | function | required | Handler for cancel button click |
| `type` | 'primary' \| 'danger' \| 'warning' \| 'success' | 'danger' | Type of dialog that determines color scheme |

## Form Validation Pattern

```tsx
function MyForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // API call to submit form
      await submitForm(formData);
      
      // Show success message or redirect
    } catch (error) {
      // Handle submission error
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <FormSection title="Contact Form">
        <TextInput
          label="Name"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        
        <TextInput
          label="Email"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        
        <TextAreaInput
          label="Message"
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          error={errors.message}
          required
          rows={4}
        />
      </FormSection>
      
      <FormActions
        submitText="Send Message"
        isSubmitting={isSubmitting}
        onCancel={() => navigate(-1)}
      />
    </form>
  );
}
```
