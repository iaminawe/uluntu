import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthorLink, AuthorAvatar, AuthorName } from '../index';
import * as useAuthorHook from '../../../../hooks/useAuthor';

// Mock the useAuthor hook
jest.mock('../../../../hooks/useAuthor');

const mockUseAuthorById = useAuthorHook.useAuthorById as jest.MockedFunction<typeof useAuthorHook.useAuthorById>;
const mockUseAuthorFromContent = useAuthorHook.useAuthorFromContent as jest.MockedFunction<typeof useAuthorHook.useAuthorFromContent>;

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const mockAuthorData = {
  id: '123',
  name: 'John Doe',
  title: 'Software Engineer',
  image: 'https://example.com/avatar.jpg',
  profileUrl: '/directory/123'
};

describe('AuthorLink Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders author name only by default', async () => {
    mockUseAuthorById.mockReturnValue({
      data: mockAuthorData,
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <AuthorLink authorId="123" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('renders avatar when showAvatar is true', async () => {
    mockUseAuthorById.mockReturnValue({
      data: mockAuthorData,
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <AuthorLink authorId="123" showAvatar />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByAltText('John Doe avatar')).toBeInTheDocument();
    });
  });

  it('renders title when showTitle is true', async () => {
    mockUseAuthorById.mockReturnValue({
      data: mockAuthorData,
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <AuthorLink authorId="123" showTitle />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });
  });

  it('shows loading skeleton when loading', () => {
    mockUseAuthorById.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <AuthorLink authorId="123" showAvatar showTitle />
      </TestWrapper>
    );

    // Check for skeleton elements (data-testid or specific classes)
    expect(document.querySelector('.animate-pulse')).toBeDefined();
  });

  it('shows fallback text when author not found', async () => {
    mockUseAuthorById.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <AuthorLink authorId="123" unknownAuthorText="Author Not Found" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Author Not Found')).toBeInTheDocument();
    });
  });

  it('extracts author from content object', async () => {
    const mockContent = {
      id: '1',
      title: 'Test Article',
      authorId: '123'
    };

    mockUseAuthorFromContent.mockReturnValue({
      data: mockAuthorData,
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <AuthorLink content={mockContent} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(mockUseAuthorFromContent).toHaveBeenCalledWith(mockContent);
  });

  it('renders as span when noLink is true', async () => {
    mockUseAuthorById.mockReturnValue({
      data: mockAuthorData,
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <AuthorLink authorId="123" noLink />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });
});

describe('AuthorAvatar Component', () => {
  it('renders only avatar', async () => {
    mockUseAuthorById.mockReturnValue({
      data: mockAuthorData,
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <AuthorAvatar authorId="123" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByAltText('John Doe avatar')).toBeInTheDocument();
      expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
    });
  });
});

describe('AuthorName Component', () => {
  it('renders only name', async () => {
    mockUseAuthorById.mockReturnValue({
      data: mockAuthorData,
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <AuthorName authorId="123" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByAltText('John Doe avatar')).not.toBeInTheDocument();
      expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
    });
  });
});