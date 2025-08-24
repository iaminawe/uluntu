import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import GalleryManagementPanel from '@/components/admin/media/GalleryManagementPanel';
import EntityGalleryManager from '@/components/admin/media/EntityGalleryManager';
import { galleryApi } from '@/features/gallery/api/galleryApi';
import { supabase } from '@/lib/supabase';

// Mock the APIs
vi.mock('@/features/gallery/api/galleryApi');
vi.mock('@/lib/supabase');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Gallery CRUD Operations', () => {
  const mockGalleries = [
    {
      id: '1',
      title: 'Test Gallery 1',
      description: 'Test description 1',
      privacy_level: 'public',
      visibility: 'visible',
      owner_type: 'user',
      owner_id: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      photo_count: 5,
      cover_photo: { url: 'https://example.com/photo1.jpg' },
    },
    {
      id: '2',
      title: 'Test Gallery 2',
      description: 'Test description 2',
      privacy_level: 'private',
      visibility: 'visible',
      owner_type: 'group',
      owner_id: 'group-1',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      photo_count: 10,
      cover_photo: { url: 'https://example.com/photo2.jpg' },
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (galleryApi.getAllGalleries as any).mockResolvedValue({
      galleries: mockGalleries,
      totalCount: 2,
      totalPages: 1,
      currentPage: 1,
      hasMore: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Gallery', () => {
    it('should create a new gallery successfully', async () => {
      const newGallery = {
        id: '3',
        title: 'New Gallery',
        description: 'New gallery description',
        privacy_level: 'public',
        visibility: 'visible',
        owner_type: 'user',
        owner_id: 'user-1',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
        photo_count: 0,
      };

      (galleryApi.createGallery as any).mockResolvedValue(newGallery);

      const { getByText, getByLabelText } = render(
        <GalleryManagementPanel />,
        { wrapper: createWrapper() }
      );

      // Click create button
      fireEvent.click(getByText('Create Gallery'));

      // Fill in form
      const titleInput = getByLabelText('Title');
      const descriptionInput = getByLabelText('Description');
      
      await userEvent.type(titleInput, 'New Gallery');
      await userEvent.type(descriptionInput, 'New gallery description');

      // Submit form
      fireEvent.click(getByText('Create'));

      await waitFor(() => {
        expect(galleryApi.createGallery).toHaveBeenCalledWith({
          title: 'New Gallery',
          description: 'New gallery description',
          privacy_level: 'public',
          visibility: 'visible',
        });
      });
    });

    it('should handle validation errors', async () => {
      const { getByText, getByLabelText } = render(
        <GalleryManagementPanel />,
        { wrapper: createWrapper() }
      );

      fireEvent.click(getByText('Create Gallery'));

      // Try to submit without title
      fireEvent.click(getByText('Create'));

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
    });
  });

  describe('Read Galleries', () => {
    it('should display galleries list', async () => {
      render(<GalleryManagementPanel />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Test Gallery 1')).toBeInTheDocument();
        expect(screen.getByText('Test Gallery 2')).toBeInTheDocument();
      });
    });

    it('should filter galleries by search', async () => {
      render(<GalleryManagementPanel />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('Search galleries...');
      await userEvent.type(searchInput, 'Gallery 1');

      await waitFor(() => {
        expect(galleryApi.getAllGalleries).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'Gallery 1',
          })
        );
      });
    });

    it('should filter by privacy level', async () => {
      render(<GalleryManagementPanel />, { wrapper: createWrapper() });

      const privacySelect = screen.getByLabelText('Privacy Level');
      fireEvent.change(privacySelect, { target: { value: 'private' } });

      await waitFor(() => {
        expect(galleryApi.getAllGalleries).toHaveBeenCalledWith(
          expect.objectContaining({
            privacy: 'private',
          })
        );
      });
    });
  });

  describe('Update Gallery', () => {
    it('should update gallery successfully', async () => {
      const updatedGallery = {
        ...mockGalleries[0],
        title: 'Updated Title',
        description: 'Updated description',
      };

      (galleryApi.updateGallery as any).mockResolvedValue(updatedGallery);

      render(<GalleryManagementPanel />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Test Gallery 1')).toBeInTheDocument();
      });

      // Click edit button
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      // Update fields
      const titleInput = screen.getByDisplayValue('Test Gallery 1');
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Updated Title');

      // Save changes
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(galleryApi.updateGallery).toHaveBeenCalledWith('1', {
          title: 'Updated Title',
        });
      });
    });

    it('should update privacy settings', async () => {
      (galleryApi.updateGallery as any).mockResolvedValue({
        ...mockGalleries[0],
        privacy_level: 'members_only',
      });

      render(<GalleryManagementPanel />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Test Gallery 1')).toBeInTheDocument();
      });

      const privacyButtons = screen.getAllByText('Privacy');
      fireEvent.click(privacyButtons[0]);

      fireEvent.click(screen.getByText('Members Only'));

      await waitFor(() => {
        expect(galleryApi.updateGallery).toHaveBeenCalledWith('1', {
          privacy_level: 'members_only',
        });
      });
    });
  });

  describe('Delete Gallery', () => {
    it('should delete gallery with confirmation', async () => {
      (galleryApi.deleteGallery as any).mockResolvedValue({
        success: true,
        deletedPhotoCount: 5,
        storageCleanup: true,
      });

      render(<GalleryManagementPanel />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Test Gallery 1')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      // Confirm deletion
      fireEvent.click(screen.getByText('Confirm Delete'));

      await waitFor(() => {
        expect(galleryApi.deleteGallery).toHaveBeenCalledWith('1');
      });
    });

    it('should handle bulk delete', async () => {
      (galleryApi.batchDeleteGalleries as any).mockResolvedValue({
        success: true,
        deletedCount: 2,
      });

      render(<GalleryManagementPanel />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Test Gallery 1')).toBeInTheDocument();
      });

      // Select galleries
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // First gallery
      fireEvent.click(checkboxes[2]); // Second gallery

      // Click bulk delete
      fireEvent.click(screen.getByText('Delete Selected'));

      // Confirm
      fireEvent.click(screen.getByText('Confirm Delete'));

      await waitFor(() => {
        expect(galleryApi.batchDeleteGalleries).toHaveBeenCalledWith(['1', '2']);
      });
    });
  });

  describe('Entity Gallery Attachments', () => {
    const mockEntities = {
      groups: [
        { id: 'group-1', name: 'Test Group', hero_image: 'image.jpg' },
      ],
      events: [
        { id: 'event-1', title: 'Test Event', image: 'event.jpg' },
      ],
      companies: [
        { id: 'company-1', name: 'Test Company', logo: 'logo.jpg' },
      ],
    };

    beforeEach(() => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockEntities.groups, error: null }),
      });
    });

    it('should attach gallery to entity', async () => {
      render(<EntityGalleryManager />, { wrapper: createWrapper() });

      // Select entity type
      const entityTypeSelect = screen.getByLabelText('Entity Type');
      fireEvent.change(entityTypeSelect, { target: { value: 'group' } });

      await waitFor(() => {
        expect(screen.getByText('Test Group')).toBeInTheDocument();
      });

      // Click assign gallery
      fireEvent.click(screen.getByText('Assign Gallery'));

      // Select gallery
      fireEvent.click(screen.getByText('Test Gallery 1'));

      // Confirm assignment
      fireEvent.click(screen.getByText('Assign'));

      await waitFor(() => {
        expect(supabase.rpc).toHaveBeenCalledWith('attach_gallery_to_group', {
          p_group_id: 'group-1',
          p_gallery_id: '1',
        });
      });
    });

    it('should detach gallery from entity', async () => {
      render(<EntityGalleryManager />, { wrapper: createWrapper() });

      const entityTypeSelect = screen.getByLabelText('Entity Type');
      fireEvent.change(entityTypeSelect, { target: { value: 'event' } });

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      // Assume gallery is attached
      const detachButton = screen.getByText('Detach');
      fireEvent.click(detachButton);

      fireEvent.click(screen.getByText('Confirm'));

      await waitFor(() => {
        expect(supabase.rpc).toHaveBeenCalledWith('detach_gallery_from_event', {
          p_event_id: 'event-1',
          p_gallery_id: expect.any(String),
        });
      });
    });

    it('should set featured gallery', async () => {
      render(<EntityGalleryManager />, { wrapper: createWrapper() });

      const entityTypeSelect = screen.getByLabelText('Entity Type');
      fireEvent.change(entityTypeSelect, { target: { value: 'company' } });

      await waitFor(() => {
        expect(screen.getByText('Test Company')).toBeInTheDocument();
      });

      // Click star to set featured
      const starButtons = screen.getAllByRole('button', { name: /featured/i });
      fireEvent.click(starButtons[0]);

      await waitFor(() => {
        expect(supabase.rpc).toHaveBeenCalledWith('set_featured_gallery_for_entity', {
          p_entity_type: 'company',
          p_entity_id: 'company-1',
          p_gallery_id: expect.any(String),
        });
      });
    });
  });

  describe('Gallery Permissions', () => {
    it('should respect user permissions for CRUD operations', async () => {
      const limitedUser = {
        id: 'limited-user',
        role: 'member',
      };

      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: limitedUser },
      });

      render(<GalleryManagementPanel />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Should not show admin-only actions
        expect(screen.queryByText('Delete All')).not.toBeInTheDocument();
        expect(screen.queryByText('Bulk Operations')).not.toBeInTheDocument();
      });
    });

    it('should show all actions for admin users', async () => {
      const adminUser = {
        id: 'admin-user',
        role: 'admin',
      };

      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: adminUser },
      });

      render(<GalleryManagementPanel />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Bulk Operations')).toBeInTheDocument();
      });
    });
  });
});