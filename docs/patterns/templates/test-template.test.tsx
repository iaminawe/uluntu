import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import [Component] from '../[Component]';
import [feature]Reducer from '../../store/[feature]Slice';
import { [Feature]Item } from '../../types';

/**
 * Test utilities
 */
const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: { 
        [feature]: [feature]Reducer,
        // Add other required reducers
      },
      preloadedState
    }),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
  
  return { 
    store, 
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }) 
  };
};

/**
 * Mock data factories
 */
const create[Feature]Item = (overrides?: Partial<[Feature]Item>): [Feature]Item => ({
  id: '1',
  title: 'Test [Feature] Item',
  description: 'Test description for [feature] item',
  status: 'published',
  createdAt: '2025-05-25T14:30:00.000Z',
  updatedAt: '2025-05-25T14:30:00.000Z',
  // Add other required fields
  ...overrides
});

const createMultiple[Feature]Items = (count: number): [Feature]Item[] => {
  return Array.from({ length: count }, (_, i) => 
    create[Feature]Item({
      id: String(i + 1),
      title: `[Feature] Item ${i + 1}`,
      description: `Description for item ${i + 1}`
    })
  );
};

/**
 * Test suite
 */
describe('[Component]', () => {
  // Mock props
  const defaultProps = {
    item: create[Feature]Item(),
    onAction: vi.fn(),
    variant: 'default' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('[TEST-001] should render component with all required elements', () => {
      renderWithProviders(<[Component] {...defaultProps} />);
      
      // Check title
      expect(screen.getByText('Test [Feature] Item')).toBeInTheDocument();
      
      // Check description
      expect(screen.getByText('Test description for [feature] item')).toBeInTheDocument();
      
      // Check status badge
      expect(screen.getByText('published')).toBeInTheDocument();
      
      // Check data-testid
      expect(screen.getByTestId('[component]-card')).toBeInTheDocument();
    });

    it('[TEST-002] should render with custom className', () => {
      renderWithProviders(
        <[Component] {...defaultProps} className="custom-class" />
      );
      
      const component = screen.getByTestId('[component]-card');
      expect(component).toHaveClass('custom-class');
    });

    it('[TEST-003] should render different variants correctly', () => {
      const { rerender } = renderWithProviders(
        <[Component] {...defaultProps} variant="default" />
      );
      
      let component = screen.getByTestId('[component]-card');
      expect(component).toHaveClass('[component]-card--default');
      
      // Test compact variant
      rerender(
        <Provider store={configureStore({ reducer: { [feature]: [feature]Reducer } })}>
          <BrowserRouter>
            <[Component] {...defaultProps} variant="compact" />
          </BrowserRouter>
        </Provider>
      );
      
      component = screen.getByTestId('[component]-card');
      expect(component).toHaveClass('[component]-card--compact');
    });

    it('[TEST-004] should handle missing data gracefully', () => {
      renderWithProviders(
        <[Component] {...defaultProps} item={null} />
      );
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('[TEST-005] should render image with fallback', () => {
      const itemWithImage = create[Feature]Item({
        image: 'https://example.com/image.jpg'
      });
      
      renderWithProviders(
        <[Component] {...defaultProps} item={itemWithImage} />
      );
      
      const image = screen.getByRole('img', { name: /Test \[Feature\] Item/i });
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });
  });

  describe('Loading & Error States', () => {
    it('[TEST-006] should display loading state', () => {
      renderWithProviders(
        <[Component] {...defaultProps} isLoading={true} />
      );
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByText('Test [Feature] Item')).not.toBeInTheDocument();
    });

    it('[TEST-007] should display error state', () => {
      const errorMessage = 'Failed to load [feature] item';
      renderWithProviders(
        <[Component] {...defaultProps} error={errorMessage} />
      );
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.queryByText('Test [Feature] Item')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('[TEST-008] should call onAction when action button is clicked', async () => {
      const mockOnAction = vi.fn();
      const { user } = renderWithProviders(
        <[Component] {...defaultProps} onAction={mockOnAction} />
      );
      
      const actionButton = screen.getByRole('button', { name: /View Details/i });
      await user.click(actionButton);
      
      expect(mockOnAction).toHaveBeenCalledWith(defaultProps.item);
      expect(mockOnAction).toHaveBeenCalledTimes(1);
    });

    it('[TEST-009] should navigate to detail page when clicked', () => {
      renderWithProviders(<[Component] {...defaultProps} />);
      
      const link = screen.getByRole('link', { name: /View details for Test \[Feature\] Item/i });
      expect(link).toHaveAttribute('href', '/[feature]/1');
    });

    it('[TEST-010] should prevent event propagation on button click', async () => {
      const mockOnAction = vi.fn();
      const mockParentClick = vi.fn();
      const { user } = renderWithProviders(
        <div onClick={mockParentClick}>
          <[Component] {...defaultProps} onAction={mockOnAction} />
        </div>
      );
      
      const actionButton = screen.getByRole('button', { name: /View Details/i });
      await user.click(actionButton);
      
      expect(mockOnAction).toHaveBeenCalled();
      // Check if propagation is stopped (implementation dependent)
    });

    it('[TEST-011] should handle keyboard navigation', async () => {
      const { user } = renderWithProviders(<[Component] {...defaultProps} />);
      
      // Tab to link
      await user.tab();
      const link = screen.getByRole('link');
      expect(document.activeElement).toBe(link);
      
      // Tab to button (if present)
      if (defaultProps.onAction) {
        await user.tab();
        const button = screen.getByRole('button');
        expect(document.activeElement).toBe(button);
      }
    });
  });

  describe('Data Formatting', () => {
    it('[TEST-012] should format dates correctly', () => {
      const itemWithDate = create[Feature]Item({
        createdAt: '2025-05-25T14:30:00.000Z'
      });
      
      renderWithProviders(
        <[Component] {...defaultProps} item={itemWithDate} />
      );
      
      // Adjust expected format based on your formatDate implementation
      expect(screen.getByText(/May 25, 2025/)).toBeInTheDocument();
    });

    it('[TEST-013] should truncate long titles', () => {
      const itemWithLongTitle = create[Feature]Item({
        title: 'This is an extremely long title that should be truncated to prevent layout issues in the UI component when displayed'
      });
      
      renderWithProviders(
        <[Component] {...defaultProps} item={itemWithLongTitle} />
      );
      
      const titleElement = screen.getByText(/This is an extremely long title/);
      expect(titleElement).toHaveClass('line-clamp-2');
    });

    it('[TEST-014] should truncate long descriptions', () => {
      const itemWithLongDesc = create[Feature]Item({
        description: 'A'.repeat(300) // 300 character description
      });
      
      renderWithProviders(
        <[Component] {...defaultProps} item={itemWithLongDesc} variant="default" />
      );
      
      const descElement = screen.getByText(new RegExp('A'.repeat(50)));
      expect(descElement).toHaveClass('line-clamp-3');
    });
  });

  describe('Edge Cases', () => {
    it('[TEST-015] should handle items with minimal data', () => {
      const minimalItem = {
        id: '1',
        title: 'Minimal Item'
      } as [Feature]Item;
      
      renderWithProviders(
        <[Component] {...defaultProps} item={minimalItem} />
      );
      
      expect(screen.getByText('Minimal Item')).toBeInTheDocument();
      expect(screen.getByText('Unknown date')).toBeInTheDocument();
    });

    it('[TEST-016] should handle special characters in content', () => {
      const itemWithSpecialChars = create[Feature]Item({
        title: 'Title with <script>alert("XSS")</script>',
        description: 'Description with & special © characters™'
      });
      
      renderWithProviders(
        <[Component] {...defaultProps} item={itemWithSpecialChars} />
      );
      
      // React should escape these automatically
      expect(screen.getByText(/Title with/)).toBeInTheDocument();
      expect(screen.getByText(/Description with & special © characters™/)).toBeInTheDocument();
    });

    it('[TEST-017] should handle very large datasets efficiently', () => {
      const largeItem = create[Feature]Item({
        tags: Array(100).fill('tag'),
        images: Array(50).fill('image.jpg')
      });
      
      const { container } = renderWithProviders(
        <[Component] {...defaultProps} item={largeItem} />
      );
      
      // Component should render without performance issues
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('[TEST-018] should have proper ARIA labels', () => {
      renderWithProviders(<[Component] {...defaultProps} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label', 'View details for Test [Feature] Item');
      
      if (defaultProps.onAction) {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Perform action on Test [Feature] Item');
      }
    });

    it('[TEST-019] should be keyboard accessible', async () => {
      const mockOnAction = vi.fn();
      const { user } = renderWithProviders(
        <[Component] {...defaultProps} onAction={mockOnAction} />
      );
      
      // Navigate to button and press Enter
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(mockOnAction).toHaveBeenCalled();
    });

    it('[TEST-020] should have proper image alt text', () => {
      renderWithProviders(<[Component] {...defaultProps} />);
      
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    it('[TEST-021] should maintain focus management', async () => {
      const { user } = renderWithProviders(<[Component] {...defaultProps} />);
      
      // Test focus trap or focus management if implemented
      await user.tab();
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('[TEST-022] should adapt layout for mobile viewport', () => {
      // Mock viewport size if needed
      global.innerWidth = 375;
      global.innerHeight = 667;
      
      renderWithProviders(<[Component] {...defaultProps} />);
      
      const component = screen.getByTestId('[component]-card');
      // Test responsive classes or behavior
      expect(component).toBeInTheDocument();
    });
  });

  describe('Integration with Redux', () => {
    it('[TEST-023] should work with preloaded state', () => {
      const preloadedState = {
        [feature]: {
          items: createMultiple[Feature]Items(3),
          currentItem: null,
          status: 'succeeded' as const,
          error: null
        }
      };
      
      renderWithProviders(
        <[Component] {...defaultProps} />,
        { preloadedState }
      );
      
      expect(screen.getByText('Test [Feature] Item')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('[TEST-024] should memoize expensive computations', () => {
      const { rerender } = renderWithProviders(
        <[Component] {...defaultProps} />
      );
      
      // Force re-render with same props
      rerender(
        <Provider store={configureStore({ reducer: { [feature]: [feature]Reducer } })}>
          <BrowserRouter>
            <[Component] {...defaultProps} />
          </BrowserRouter>
        </Provider>
      );
      
      // Component should not re-compute expensive operations
      expect(screen.getByText('Test [Feature] Item')).toBeInTheDocument();
    });
  });
});