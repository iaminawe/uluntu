/**
 * Integration Test for ContentAIEditor in ResourceEditPage
 * Tests the integration of AI editor with resource editing functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ResourceDetails from '../src/pages/ResourceEditPage/ResourceDetails';
import { FormData } from '../src/pages/ResourceEditPage/types';

// Mock the ContentAIEditor component
jest.mock('../src/components/content/ContentAIEditor', () => {
  return {
    ContentAIEditor: ({ value, onChange, contentType, includeImages, placeholder }: any) => (
      <div data-testid="content-ai-editor">
        <div data-testid="editor-content-type">{contentType}</div>
        <div data-testid="editor-include-images">{includeImages.toString()}</div>
        <textarea
          data-testid="ai-editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    )
  };
});

// Mock other dependencies
jest.mock('../src/shared/components/ui/Form', () => ({
  FormInput: ({ value, onChange, placeholder, label, required, id }: any) => (
    <div>
      <label htmlFor={id || 'form-input'}>{label}{required && ' *'}</label>
      <input
        id={id || 'form-input'}
        data-testid="form-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  )
}));

jest.mock('../src/shared/components/ui/Form/StandardFormComponents', () => ({
  SlugField: ({ value, onChange, sourceValue, baseUrl }: any) => (
    <div>
      <label htmlFor="slug-field">URL Slug *</label>
      <input
        id="slug-field"
        data-testid="slug-field"
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        placeholder="url-friendly-slug"
      />
      <div data-testid="slug-preview">{baseUrl}{value}</div>
    </div>
  )
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ResourceDetails with ContentAIEditor Integration', () => {
  const mockFormData: FormData = {
    title: 'Test Resource',
    slug: 'test-resource',
    description: 'Initial description',
    type: 'document',
    url: 'https://example.com',
    tags: ['test', 'resource'],
    groupId: '',
    newTag: '',
    status: 'draft',
    featured: false
  };

  const mockHandleChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with ContentAIEditor for resources', () => {
    render(
      <ResourceDetails formData={mockFormData} handleChange={mockHandleChange} />,
      { wrapper: createWrapper() }
    );

    // Check if AI editor is rendered
    expect(screen.getByTestId('content-ai-editor')).toBeInTheDocument();
    
    // Verify content type is set to 'resources'
    expect(screen.getByTestId('editor-content-type')).toHaveTextContent('resources');
    
    // Check if description content is passed correctly
    expect(screen.getByTestId('ai-editor-textarea')).toHaveValue('Initial description');
  });

  it('should have image insertion toggle enabled by default', () => {
    render(
      <ResourceDetails formData={mockFormData} handleChange={mockHandleChange} />,
      { wrapper: createWrapper() }
    );

    // Check if image insertion is enabled by default
    expect(screen.getByTestId('editor-include-images')).toHaveTextContent('true');
    
    // Check if toggle checkbox is checked
    const imageToggle = screen.getByLabelText('Enable image insertion');
    expect(imageToggle).toBeChecked();
  });

  it('should toggle image insertion setting', async () => {
    render(
      <ResourceDetails formData={mockFormData} handleChange={mockHandleChange} />,
      { wrapper: createWrapper() }
    );

    const imageToggle = screen.getByLabelText('Enable image insertion');
    
    // Initially enabled
    expect(screen.getByTestId('editor-include-images')).toHaveTextContent('true');
    
    // Toggle off
    fireEvent.click(imageToggle);
    
    await waitFor(() => {
      expect(screen.getByTestId('editor-include-images')).toHaveTextContent('false');
    });
    
    // Toggle back on
    fireEvent.click(imageToggle);
    
    await waitFor(() => {
      expect(screen.getByTestId('editor-include-images')).toHaveTextContent('true');
    });
  });

  it('should handle content changes correctly', async () => {
    render(
      <ResourceDetails formData={mockFormData} handleChange={mockHandleChange} />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByTestId('ai-editor-textarea');
    const newContent = 'Updated resource description with AI assistance';

    fireEvent.change(textarea, { target: { value: newContent } });

    await waitFor(() => {
      expect(mockHandleChange).toHaveBeenCalledWith({
        target: { name: 'description', value: newContent }
      });
    });
  });

  it('should display appropriate placeholder text', () => {
    render(
      <ResourceDetails formData={mockFormData} handleChange={mockHandleChange} />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByTestId('ai-editor-textarea');
    expect(textarea).toHaveAttribute(
      'placeholder', 
      'Describe this resource. Use AI assistance to create comprehensive, engaging content...'
    );
  });

  it('should maintain form structure with title and slug fields', () => {
    render(
      <ResourceDetails formData={mockFormData} handleChange={mockHandleChange} />,
      { wrapper: createWrapper() }
    );

    // Check title field
    expect(screen.getByLabelText('Resource Title *')).toBeInTheDocument();
    expect(screen.getByTestId('form-input')).toHaveValue('Test Resource');

    // Check slug field
    expect(screen.getByLabelText('URL Slug *')).toBeInTheDocument();
    expect(screen.getByTestId('slug-field')).toHaveValue('test-resource');
    expect(screen.getByTestId('slug-preview')).toHaveTextContent('/resources/test-resource');
  });

  it('should display helpful guidance text', () => {
    render(
      <ResourceDetails formData={mockFormData} handleChange={mockHandleChange} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Use the AI assistant to generate comprehensive resource descriptions/)).toBeInTheDocument();
    expect(screen.getByText(/Select text to get contextual AI suggestions/)).toBeInTheDocument();
  });

  it('should properly structure the description section with label and toggle', () => {
    render(
      <ResourceDetails formData={mockFormData} handleChange={mockHandleChange} />,
      { wrapper: createWrapper() }
    );

    // Check description label
    expect(screen.getByText('Description *')).toBeInTheDocument();
    
    // Check image toggle section
    expect(screen.getByText('Enable image insertion')).toBeInTheDocument();
    
    // Verify the layout structure exists
    const descriptionSection = screen.getByText('Description *').closest('div');
    expect(descriptionSection?.querySelector('input[type="checkbox"]')).toBeInTheDocument();
  });
});

describe('ResourceDetails Integration Edge Cases', () => {
  const mockHandleChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle empty description gracefully', () => {
    const emptyFormData: FormData = {
      title: '',
      slug: '',
      description: '',
      type: 'document',
      url: '',
      tags: [],
      groupId: '',
      newTag: '',
      status: 'draft',
      featured: false
    };

    render(
      <ResourceDetails formData={emptyFormData} handleChange={mockHandleChange} />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByTestId('ai-editor-textarea');
    expect(textarea).toHaveValue('');
  });

  it('should maintain consistency when form data changes', async () => {
    const { rerender } = render(
      <ResourceDetails 
        formData={{
          title: 'Old Title',
          slug: 'old-slug',
          description: 'Old description',
          type: 'document',
          url: '',
          tags: [],
          groupId: '',
          newTag: '',
          status: 'draft',
          featured: false
        }} 
        handleChange={mockHandleChange} 
      />,
      { wrapper: createWrapper() }
    );

    // Update with new form data
    rerender(
      <ResourceDetails 
        formData={{
          title: 'New Title',
          slug: 'new-slug',
          description: 'New description',
          type: 'document',
          url: '',
          tags: [],
          groupId: '',
          newTag: '',
          status: 'draft',
          featured: false
        }} 
        handleChange={mockHandleChange} 
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('form-input')).toHaveValue('New Title');
      expect(screen.getByTestId('slug-field')).toHaveValue('new-slug');
      expect(screen.getByTestId('ai-editor-textarea')).toHaveValue('New description');
    });
  });
});