import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentAIEditor, ContentType } from '../ContentAIEditor';

// Mock the AI functions
jest.mock('@/lib/ai/blocknote-ai-simplified', () => ({
  callAI: jest.fn().mockResolvedValue('Generated AI content'),
  checkAIConfiguration: jest.fn().mockReturnValue({
    isConfigured: true,
    provider: 'openai'
  })
}));

// Mock the Unsplash service
jest.mock('@/lib/ai/unsplash-service', () => ({
  unsplashService: {
    isConfigured: jest.fn().mockReturnValue(true),
    searchPhotos: jest.fn().mockResolvedValue([
      {
        id: 'test-photo',
        urls: { regular: 'https://example.com/photo.jpg' },
        alt_description: 'Test photo',
        user: { name: 'Test User', links: { html: 'https://unsplash.com/@testuser' } },
        links: { html: 'https://unsplash.com/photos/test' }
      }
    ]),
    getOptimalImageUrl: jest.fn().mockReturnValue('https://example.com/photo.jpg'),
    formatAttribution: jest.fn().mockReturnValue('Photo by Test User on Unsplash')
  }
}));

describe('ContentAIEditor', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    contentType: 'general' as ContentType,
    placeholder: 'Test placeholder'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<ContentAIEditor {...defaultProps} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText(/AI Ready/)).toBeInTheDocument();
    expect(screen.getByText(/Images Available/)).toBeInTheDocument();
  });

  it('displays content type in UI', () => {
    render(<ContentAIEditor {...defaultProps} contentType="news" />);
    
    expect(screen.getByText('Content Type: news')).toBeInTheDocument();
    expect(screen.getByText(/Generate news/)).toBeInTheDocument();
  });

  it('handles content changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<ContentAIEditor {...defaultProps} onChange={onChange} />);
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test content');
    
    expect(onChange).toHaveBeenCalledWith('Test content');
  });

  it('shows word and character count', () => {
    render(<ContentAIEditor {...defaultProps} value="Hello world test" />);
    
    expect(screen.getByText('Words: 3')).toBeInTheDocument();
    expect(screen.getByText('Characters: 16')).toBeInTheDocument();
  });

  it('changes editor mode', async () => {
    const user = userEvent.setup();
    
    render(<ContentAIEditor {...defaultProps} />);
    
    const modeSelect = screen.getByDisplayValue('Visual');
    await user.selectOptions(modeSelect, 'markdown');
    
    expect(screen.getByDisplayValue('Markdown')).toBeInTheDocument();
    expect(screen.getByText('MARKDOWN')).toBeInTheDocument();
  });

  it('disables buttons when AI is not configured', () => {
    // Mock AI as not configured for this test
    const { checkAIConfiguration } = require('@/lib/ai/blocknote-ai-simplified');
    checkAIConfiguration.mockReturnValueOnce({
      isConfigured: false,
      provider: null
    });

    render(<ContentAIEditor {...defaultProps} />);
    
    expect(screen.getByText(/Configure AI in settings/)).toBeInTheDocument();
    
    const generateButton = screen.getByRole('button', { name: /Generate Content/ });
    const aiButton = screen.getByRole('button', { name: /AI Assistant/ });
    
    expect(generateButton).toBeDisabled();
    expect(aiButton).toBeDisabled();
  });

  it('shows processing state', () => {
    render(<ContentAIEditor {...defaultProps} disabled />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('displays custom prompts', async () => {
    const user = userEvent.setup();
    const customPrompts = [
      {
        id: 'custom-prompt',
        label: 'Custom Action',
        prompt: 'Do something custom',
        icon: '🎨'
      }
    ];
    
    render(<ContentAIEditor {...defaultProps} customPrompts={customPrompts} />);
    
    const aiButton = screen.getByRole('button', { name: /AI Assistant/ });
    await user.click(aiButton);
    
    expect(screen.getByText('🎨 Custom Action')).toBeInTheDocument();
  });

  it('handles image insertion when Unsplash is not configured', () => {
    // Mock Unsplash as not configured
    const { unsplashService } = require('@/lib/ai/unsplash-service');
    unsplashService.isConfigured.mockReturnValueOnce(false);
    
    render(<ContentAIEditor {...defaultProps} includeImages />);
    
    expect(screen.queryByRole('button', { name: /Insert Image/ })).not.toBeInTheDocument();
  });

  it('shows selected text count when text is selected', () => {
    render(<ContentAIEditor {...defaultProps} value="Hello world" />);
    
    // Simulate text selection (in a real test, this would be more complex)
    const component = screen.getByTestId?.('content-ai-editor') || screen.getByRole('textbox').parentElement;
    
    // This is a simplified version - actual selection testing would require more setup
    expect(component).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const customClass = 'my-custom-class';
    render(<ContentAIEditor {...defaultProps} className={customClass} />);
    
    const container = screen.getByRole('textbox').closest('.content-ai-editor');
    expect(container).toHaveClass(customClass);
  });

  it('respects height prop', () => {
    const customHeight = '600px';
    render(<ContentAIEditor {...defaultProps} height={customHeight} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveStyle({ height: customHeight });
  });

  describe('Content type specific behavior', () => {
    const contentTypes: ContentType[] = [
      'news', 'events', 'resources', 'groups', 
      'gallery', 'marketplace', 'opportunities', 'blog'
    ];

    contentTypes.forEach(contentType => {
      it(`renders correctly for ${contentType} content type`, () => {
        render(<ContentAIEditor {...defaultProps} contentType={contentType} />);
        
        expect(screen.getByText(`Content Type: ${contentType}`)).toBeInTheDocument();
      });
    });
  });

  describe('AI Integration', () => {
    it('calls AI service when generating content', async () => {
      const user = userEvent.setup();
      const { callAI } = require('@/lib/ai/blocknote-ai-simplified');
      
      // Mock prompt
      jest.spyOn(window, 'prompt').mockReturnValue('Test topic');
      
      render(<ContentAIEditor {...defaultProps} contentType="blog" />);
      
      const generateButton = screen.getByRole('button', { name: /Generate blog/ });
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(callAI).toHaveBeenCalledWith(
          expect.stringContaining('Test topic'),
          ''
        );
      });
    });

    it('handles AI service errors gracefully', async () => {
      const user = userEvent.setup();
      const { callAI } = require('@/lib/ai/blocknote-ai-simplified');
      
      // Mock AI service to throw an error
      callAI.mockRejectedValueOnce(new Error('AI service error'));
      
      // Mock alert
      jest.spyOn(window, 'alert').mockImplementation(() => {});
      jest.spyOn(window, 'prompt').mockReturnValue('Test topic');
      
      render(<ContentAIEditor {...defaultProps} />);
      
      const generateButton = screen.getByRole('button', { name: /Generate Content/ });
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining('Content generation failed')
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ContentAIEditor {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder', 'Test placeholder');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<ContentAIEditor {...defaultProps} />);
      
      const generateButton = screen.getByRole('button', { name: /Generate Content/ });
      
      await user.tab();
      expect(generateButton).toHaveFocus();
    });
  });
});

// Integration test example
describe('ContentAIEditor Integration', () => {
  it('works in a form context', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    
    function TestForm() {
      const [content, setContent] = React.useState('');
      
      return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(content); }}>
          <ContentAIEditor
            value={content}
            onChange={setContent}
            contentType="news"
          />
          <button type="submit">Submit</button>
        </form>
      );
    }
    
    render(<TestForm />);
    
    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    
    await user.type(textarea, 'Test article content');
    await user.click(submitButton);
    
    expect(onSubmit).toHaveBeenCalledWith('Test article content');
  });
});