/**
 * Component Tests for DragDropMenuTree
 * 
 * Tests drag and drop functionality, reordering,
 * hierarchical changes, and accessibility.
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

import DragDropMenuTree from '../DragDropMenuTree';
import { MenuItem } from '@/types/menu';
import { createMockMenuItem } from '../../../../tests/fixtures/menuTestData';

// Mock react-beautiful-dnd
vi.mock('react-beautiful-dnd', async () => {
  const actual = await vi.importActual('react-beautiful-dnd');
  return {
    ...actual,
    DragDropContext: ({ children, onDragEnd }: any) => {
      // Store onDragEnd for testing
      (global as any).mockOnDragEnd = onDragEnd;
      return <div data-testid="drag-drop-context">{children}</div>;
    },
    Droppable: ({ children, droppableId }: any) => 
      <div data-testid={`droppable-${droppableId}`}>
        {children({ innerRef: vi.fn(), droppableProps: {}, placeholder: null })}
      </div>,
    Draggable: ({ children, draggableId, index }: any) => 
      <div data-testid={`draggable-${draggableId}`} data-index={index}>
        {children({ 
          innerRef: vi.fn(), 
          draggableProps: { 'data-rbd-draggable-id': draggableId }, 
          dragHandleProps: { 'data-testid': `drag-handle-${draggableId}` },
          isDragging: false 
        }, {})}
      </div>,
  };
});

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  GripVertical: ({ className }: any) => <div className={className} data-testid="grip-icon" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Home: () => <div data-testid="home-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Building2: () => <div data-testid="building-icon" />,
}));

describe('DragDropMenuTree Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  const mockMenuItems: MenuItem[] = [
    createMockMenuItem({
      id: '1',
      title: 'Home',
      url: '/',
      icon: 'Home',
      sort_order: 0,
      parent_id: null,
      is_enabled: true,
    }),
    createMockMenuItem({
      id: '2',
      title: 'Community',
      url: '/community',
      icon: 'Users',
      sort_order: 1,
      parent_id: null,
      is_enabled: true,
    }),
    createMockMenuItem({
      id: '3',
      title: 'Events',
      url: '/events',
      sort_order: 0,
      parent_id: '2',
      is_enabled: true,
    }),
    createMockMenuItem({
      id: '4',
      title: 'Directory',
      url: '/directory',
      sort_order: 1,
      parent_id: '2',
      is_enabled: false,
    }),
  ];

  const defaultProps = {
    items: mockMenuItems,
    onReorder: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggleEnabled: vi.fn(),
    onAdd: vi.fn(),
  };

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render all menu items', () => {
      render(<DragDropMenuTree {...defaultProps} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Community')).toBeInTheDocument();
      expect(screen.getByText('Events')).toBeInTheDocument();
      expect(screen.getByText('Directory')).toBeInTheDocument();
    });

    it('should render drag handles for all items', () => {
      render(<DragDropMenuTree {...defaultProps} />);

      const dragHandles = screen.getAllByTestId('grip-icon');
      expect(dragHandles).toHaveLength(4);
    });

    it('should render item icons when provided', () => {
      render(<DragDropMenuTree {...defaultProps} />);

      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });

    it('should show enabled/disabled state correctly', () => {
      render(<DragDropMenuTree {...defaultProps} />);

      const enabledItems = screen.getByText('Home').closest('[data-enabled="true"]');
      const disabledItems = screen.getByText('Directory').closest('[data-enabled="false"]');

      expect(enabledItems).toBeInTheDocument();
      expect(disabledItems).toBeInTheDocument();
    });
  });

  describe('Hierarchical Structure', () => {
    it('should render nested items with proper indentation', () => {
      render(<DragDropMenuTree {...defaultProps} />);

      const eventsItem = screen.getByText('Events').closest('[data-level]');
      const directoryItem = screen.getByText('Directory').closest('[data-level]');

      expect(eventsItem).toHaveAttribute('data-level', '1');
      expect(directoryItem).toHaveAttribute('data-level', '1');
    });

    it('should show expand/collapse buttons for parent items', () => {
      render(<DragDropMenuTree {...defaultProps} />);

      const communityItem = screen.getByText('Community');
      const expandButton = communityItem.parentElement?.querySelector('[data-testid="chevron-right"]');
      
      expect(expandButton).toBeInTheDocument();
    });

    it('should handle expand/collapse functionality', async () => {
      render(<DragDropMenuTree {...defaultProps} />);

      // Initially collapsed
      expect(screen.queryByText('Events')).not.toBeInTheDocument();

      // Find and click expand button
      const expandButton = screen.getByTestId('chevron-right');
      await user.click(expandButton);

      // Should expand and show children
      expect(screen.getByText('Events')).toBeInTheDocument();
      expect(screen.getByText('Directory')).toBeInTheDocument();
    });

    it('should maintain expanded state correctly', async () => {
      render(<DragDropMenuTree {...defaultProps} />);

      // Expand
      const expandButton = screen.getByTestId('chevron-right');
      await user.click(expandButton);

      // Should show collapse icon
      expect(screen.getByTestId('chevron-down')).toBeInTheDocument();

      // Collapse again
      await user.click(screen.getByTestId('chevron-down'));

      // Should hide children
      expect(screen.queryByText('Events')).not.toBeInTheDocument();
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('should handle basic reordering', async () => {
      render(<DragDropMenuTree {...defaultProps} />);

      const onDragEnd = (global as any).mockOnDragEnd;
      const mockDropResult: DropResult = {
        draggableId: '1',
        type: 'DEFAULT',
        source: { droppableId: 'menu-tree', index: 0 },
        destination: { droppableId: 'menu-tree', index: 1 },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      await act(async () => {
        onDragEnd(mockDropResult);
      });

      expect(defaultProps.onReorder).toHaveBeenCalledWith([
        { id: '2', sort_order: 0, parent_id: null },
        { id: '1', sort_order: 1, parent_id: null },
      ]);
    });

    it('should handle moving items between different parents', async () => {
      render(<DragDropMenuTree {...defaultProps} />);

      const onDragEnd = (global as any).mockOnDragEnd;
      const mockDropResult: DropResult = {
        draggableId: '1',
        type: 'DEFAULT',
        source: { droppableId: 'menu-tree', index: 0 },
        destination: { droppableId: 'parent-2', index: 0 },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      await act(async () => {
        onDragEnd(mockDropResult);
      });

      expect(defaultProps.onReorder).toHaveBeenCalledWith([
        { id: '1', sort_order: 0, parent_id: '2' },
        { id: '3', sort_order: 1, parent_id: '2' },
        { id: '4', sort_order: 2, parent_id: '2' },
      ]);
    });

    it('should prevent invalid drops (circular references)', async () => {
      render(<DragDropMenuTree {...defaultProps} />);

      const onDragEnd = (global as any).mockOnDragEnd;
      const mockDropResult: DropResult = {
        draggableId: '2', // Parent
        type: 'DEFAULT',
        source: { droppableId: 'menu-tree', index: 1 },
        destination: { droppableId: 'parent-2', index: 0 }, // Trying to move into its own child
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      await act(async () => {
        onDragEnd(mockDropResult);
      });

      // Should not call onReorder for invalid move
      expect(defaultProps.onReorder).not.toHaveBeenCalled();
    });

    it('should handle drop outside of valid targets', async () => {
      render(<DragDropMenuTree {...defaultProps} />);

      const onDragEnd = (global as any).mockOnDragEnd;
      const mockDropResult: DropResult = {
        draggableId: '1',
        type: 'DEFAULT',
        source: { droppableId: 'menu-tree', index: 0 },
        destination: null,
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      await act(async () => {
        onDragEnd(mockDropResult);
      });

      // Should not call onReorder when dropped outside
      expect(defaultProps.onReorder).not.toHaveBeenCalled();
    });

    it('should show visual feedback during drag', () => {
      render(<DragDropMenuTree {...defaultProps} />);

      // Simulate drag start
      const dragHandle = screen.getAllByTestId(/drag-handle-/)[0];
      fireEvent.mouseDown(dragHandle);

      // Should apply dragging styles
      const item = screen.getByText('Home').closest('[data-dragging]');
      expect(item).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render action buttons for each item', () => {
      render(<DragDropMenuTree {...defaultProps} />);

      expect(screen.getAllByTestId('edit-icon')).toHaveLength(4);
      expect(screen.getAllByTestId('trash-icon')).toHaveLength(4);
      expect(screen.getAllByTestId('eye-icon')).toHaveLength(3); // 3 enabled items
      expect(screen.getAllByTestId('eye-off-icon')).toHaveLength(1); // 1 disabled item
    });

    it('should handle edit button clicks', async () => {
      render(<DragDropMenuTree {...defaultProps} />);

      const editButtons = screen.getAllByTestId('edit-icon');
      await user.click(editButtons[0]);

      expect(defaultProps.onEdit).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1', title: 'Home' })
      );
    });

    it('should handle delete button clicks', async () => {
      render(<DragDropMenuTree {...defaultProps} />);

      const deleteButtons = screen.getAllByTestId('trash-icon');
      await user.click(deleteButtons[0]);

      expect(defaultProps.onDelete).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1', title: 'Home' })
      );
    });

    it('should handle toggle enabled button clicks', async () => {
      render(<DragDropMenuTree {...defaultProps} />);

      // Click on enabled item (should disable)
      const eyeButton = screen.getAllByTestId('eye-icon')[0];
      await user.click(eyeButton);

      expect(defaultProps.onToggleEnabled).toHaveBeenCalledWith('1', false);

      // Click on disabled item (should enable)
      const eyeOffButton = screen.getByTestId('eye-off-icon');
      await user.click(eyeOffButton);

      expect(defaultProps.onToggleEnabled).toHaveBeenCalledWith('4', true);
    });

    it('should handle add child button clicks', async () => {
      render(<DragDropMenuTree {...defaultProps} />);

      const addButtons = screen.getAllByTestId('plus-icon');
      await user.click(addButtons[0]);

      expect(defaultProps.onAdd).toHaveBeenCalledWith('1'); // Parent ID
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<DragDropMenuTree {...defaultProps} />);

      const tree = screen.getByRole('tree');
      expect(tree).toHaveAttribute('aria-label', 'Menu tree');

      const treeItems = screen.getAllByRole('treeitem');
      expect(treeItems).toHaveLength(4);

      treeItems.forEach(item => {
        expect(item).toHaveAttribute('aria-level');
        expect(item).toHaveAttribute('aria-selected');
      });
    });

    it('should support keyboard navigation', async () => {
      render(<DragDropMenuTree {...defaultProps} />);

      const firstItem = screen.getAllByRole('treeitem')[0];
      firstItem.focus();

      // Arrow down should move to next item
      await user.keyboard('{ArrowDown}');
      expect(screen.getAllByRole('treeitem')[1]).toHaveFocus();

      // Arrow up should move to previous item
      await user.keyboard('{ArrowUp}');
      expect(screen.getAllByRole('treeitem')[0]).toHaveFocus();
    });

    it('should handle expand/collapse with keyboard', async () => {
      render(<DragDropMenuTree {...defaultProps} />);

      const communityItem = screen.getByText('Community').closest('[role="treeitem"]');
      communityItem?.focus();

      // Right arrow should expand
      await user.keyboard('{ArrowRight}');
      expect(screen.getByText('Events')).toBeInTheDocument();

      // Left arrow should collapse
      await user.keyboard('{ArrowLeft}');
      expect(screen.queryByText('Events')).not.toBeInTheDocument();
    });

    it('should announce drag and drop actions to screen readers', async () => {
      render(<DragDropMenuTree {...defaultProps} />);

      const dragHandle = screen.getAllByTestId(/drag-handle-/)[0];
      expect(dragHandle).toHaveAttribute('aria-describedby');
      
      const description = document.getElementById(dragHandle.getAttribute('aria-describedby')!);
      expect(description).toHaveTextContent(/use space or enter to start dragging/i);
    });
  });

  describe('Performance Optimizations', () => {
    it('should handle large trees efficiently', () => {
      const largeTree = Array.from({ length: 100 }, (_, i) => 
        createMockMenuItem({
          id: `item-${i}`,
          title: `Item ${i}`,
          url: `/item-${i}`,
          sort_order: i,
          parent_id: i > 0 && i % 10 === 0 ? `item-${i - 1}` : null,
        })
      );

      const startTime = performance.now();
      
      render(
        <DragDropMenuTree 
          {...defaultProps} 
          items={largeTree}
        />
      );

      const endTime = performance.now();
      
      // Should render within reasonable time
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should virtualize large lists when enabled', () => {
      const largeTree = Array.from({ length: 1000 }, (_, i) => 
        createMockMenuItem({
          id: `item-${i}`,
          title: `Item ${i}`,
          url: `/item-${i}`,
          sort_order: i,
        })
      );

      render(
        <DragDropMenuTree 
          {...defaultProps} 
          items={largeTree}
          virtualized={true}
          maxVisibleItems={20}
        />
      );

      // Should only render visible items
      const renderedItems = screen.getAllByRole('treeitem');
      expect(renderedItems).toHaveLength(20);
    });

    it('should memoize drag handlers to prevent unnecessary re-renders', () => {
      const { rerender } = render(<DragDropMenuTree {...defaultProps} />);

      const initialHandlers = screen.getAllByTestId(/drag-handle-/).map(
        handle => handle.getAttribute('data-handler-id')
      );

      // Re-render with same props
      rerender(<DragDropMenuTree {...defaultProps} />);

      const rerenderedHandlers = screen.getAllByTestId(/drag-handle-/).map(
        handle => handle.getAttribute('data-handler-id')
      );

      // Handlers should be memoized (same references)
      expect(rerenderedHandlers).toEqual(initialHandlers);
    });
  });

  describe('Custom Styling and Theming', () => {
    it('should apply custom CSS classes', () => {
      render(
        <DragDropMenuTree 
          {...defaultProps} 
          className="custom-tree"
          itemClassName="custom-item"
        />
      );

      const tree = screen.getByRole('tree');
      expect(tree).toHaveClass('custom-tree');

      const items = screen.getAllByRole('treeitem');
      items.forEach(item => {
        expect(item).toHaveClass('custom-item');
      });
    });

    it('should support dark theme', () => {
      render(
        <DragDropMenuTree 
          {...defaultProps} 
          theme="dark"
        />
      );

      const tree = screen.getByRole('tree');
      expect(tree).toHaveClass('theme-dark');
    });

    it('should render custom item templates', () => {
      const customRender = (item: MenuItem) => (
        <div data-testid={`custom-${item.id}`}>
          Custom: {item.title.toUpperCase()}
        </div>
      );

      render(
        <DragDropMenuTree 
          {...defaultProps}
          renderItem={customRender}
        />
      );

      expect(screen.getByTestId('custom-1')).toHaveTextContent('Custom: HOME');
      expect(screen.getByTestId('custom-2')).toHaveTextContent('Custom: COMMUNITY');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid drag operations gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<DragDropMenuTree {...defaultProps} />);

      const onDragEnd = (global as any).mockOnDragEnd;
      const invalidDropResult = {
        draggableId: 'invalid-id',
        source: { index: -1 },
        destination: { index: 999 },
      };

      await act(async () => {
        expect(() => onDragEnd(invalidDropResult)).not.toThrow();
      });

      consoleError.mockRestore();
    });

    it('should handle missing items gracefully', () => {
      expect(() => {
        render(<DragDropMenuTree {...defaultProps} items={[]} />);
      }).not.toThrow();

      expect(screen.getByText('No menu items to display')).toBeInTheDocument();
    });

    it('should handle corrupted menu data', () => {
      const corruptedItems = [
        { id: '1' } as MenuItem, // Missing required fields
        null as any,
        undefined as any,
      ].filter(Boolean);

      expect(() => {
        render(<DragDropMenuTree {...defaultProps} items={corruptedItems} />);
      }).not.toThrow();
    });
  });
});