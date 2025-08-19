import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthorLink, AuthorAvatar, AuthorName, AuthorCard } from './index';

// Create a mock query client for Storybook
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

// Wrapper component for stories
const StoryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <div className="p-4">
        {children}
      </div>
    </BrowserRouter>
  </QueryClientProvider>
);

const meta: Meta<typeof AuthorLink> = {
  title: 'Shared/UI/AuthorLink',
  component: AuthorLink,
  decorators: [
    (Story) => (
      <StoryWrapper>
        <Story />
      </StoryWrapper>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible component for displaying author information with various display options and loading states.',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['sm', 'md', 'lg'],
    },
    showAvatar: {
      control: { type: 'boolean' },
    },
    showTitle: {
      control: { type: 'boolean' },
    },
    noLink: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock content with author information
const mockContent = {
  id: '1',
  title: 'Sample Content',
  authorId: '123',
  author_id: '123',
  created_by: '123'
};

// Basic stories
export const Default: Story = {
  args: {
    authorId: '1',
    showAvatar: true,
    showTitle: true,
  },
};

export const WithContent: Story = {
  args: {
    content: mockContent,
    showAvatar: true,
    showTitle: true,
  },
};

export const AvatarOnly: Story = {
  args: {
    authorId: '1',
    showAvatar: true,
    showTitle: false,
  },
};

export const NameOnly: Story = {
  args: {
    authorId: '1',
    showAvatar: false,
    showTitle: false,
  },
};

export const WithTitle: Story = {
  args: {
    authorId: '1',
    showAvatar: false,
    showTitle: true,
  },
};

export const SmallSize: Story = {
  args: {
    authorId: '1',
    showAvatar: true,
    showTitle: true,
    size: 'sm',
  },
};

export const LargeSize: Story = {
  args: {
    authorId: '1',
    showAvatar: true,
    showTitle: true,
    size: 'lg',
  },
};

export const NoLink: Story = {
  args: {
    authorId: '1',
    showAvatar: true,
    showTitle: true,
    noLink: true,
  },
};

export const Loading: Story = {
  args: {
    authorId: 'loading-id',
    showAvatar: true,
    showTitle: true,
  },
};

export const Error: Story = {
  args: {
    authorId: 'error-id',
    showAvatar: true,
    showTitle: true,
  },
};

export const CustomFallback: Story = {
  args: {
    authorId: 'nonexistent',
    showAvatar: true,
    showTitle: true,
    unknownAuthorText: 'Author Unavailable',
  },
};

// Component variants
export const AvatarComponent: Story = {
  render: () => <AuthorAvatar authorId="1" size="md" />,
};

export const NameComponent: Story = {
  render: () => <AuthorName authorId="1" size="md" />,
};

export const CardComponent: Story = {
  render: () => <AuthorCard authorId="1" size="lg" />,
};

// Use case examples
export const BlogPostAuthor: Story = {
  render: () => (
    <div className="border rounded-lg p-4 max-w-md">
      <h3 className="text-lg font-bold mb-2">How to Build Better UIs</h3>
      <p className="text-gray-600 mb-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
      </p>
      <div className="flex items-center justify-between">
        <AuthorLink authorId="1" showAvatar showTitle size="sm" />
        <span className="text-sm text-gray-500">2 days ago</span>
      </div>
    </div>
  ),
};

export const CommentAuthor: Story = {
  render: () => (
    <div className="border-l-2 border-gray-200 pl-4 py-2">
      <div className="flex items-start gap-3">
        <AuthorAvatar authorId="1" size="sm" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AuthorName authorId="1" size="sm" className="font-medium" />
            <span className="text-xs text-gray-500">5 minutes ago</span>
          </div>
          <p className="text-sm text-gray-700">
            This is a great point! I've been thinking about this too.
          </p>
        </div>
      </div>
    </div>
  ),
};

export const TeamMemberCard: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AuthorCard authorId="1" className="bg-white" />
      <AuthorCard authorId="2" className="bg-white" />
    </div>
  ),
};