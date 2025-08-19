import { supabase } from '@/lib/supabase';
import { MenuItem, MenuItemInput, MenuItemUpdate, MenuType, MenuTarget, MenuVisibility } from '@/types/menu';
import { logger } from '@/utils/logger';

// Menu Management Adapter - Uses Supabase Database
export const menuManagementAdapter = {
  // Get all menu items
  async getAll(): Promise<MenuItem[]> {
    try {
      // First, get the container IDs
      const { data: containers, error: containerError } = await supabase
        .from('menu_containers')
        .select('id, name, type')
        .eq('is_active', true);

      if (containerError) {
        logger.error('Error fetching menu containers:', containerError);
        throw containerError;
      }

      // Then get menu items
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          menu_container_id,
          parent_id,
          title,
          subtitle,
          description,
          url,
          icon,
          image_url,
          item_type,
          target,
          is_enabled,
          is_visible,
          requires_auth,
          sort_order,
          depth_level,
          path,
          custom_properties,
          css_classes,
          data_attributes,
          created_at,
          updated_at
        `)
        .order('sort_order', { ascending: true });

      if (error) {
        logger.error('Error fetching menu items:', error);
        throw error;
      }

      // Map to MenuItem type with container info
      const containerMap = new Map(containers?.map(c => [c.id, c]) || []);
      
      return (data || []).map(item => {
        const container = containerMap.get(item.menu_container_id);
        return {
          id: item.id,
          title: item.title,
          url: item.url || '',
          description: item.description || item.subtitle || null,
          menu_type: (container?.type || 'main') as MenuType,
          parent_id: item.parent_id,
          sort_order: item.sort_order,
          is_enabled: item.is_enabled,
          target: (item.target || '_self') as MenuTarget,
          icon: item.icon || null,
          css_classes: item.css_classes || null,
          visibility: item.requires_auth ? 'authenticated' : 'public' as MenuVisibility,
          required_roles: item.custom_properties?.required_roles || null,
          is_external: item.url?.startsWith('http') || false,
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      });
    } catch (error) {
      logger.error('Error in getAll:', error);
      throw error;
    }
  },

  // Get menu items by type
  async getByType(type: MenuType): Promise<MenuItem[]> {
    try {
      // Get container for this type
      const { data: container, error: containerError } = await supabase
        .from('menu_containers')
        .select('id')
        .eq('type', type)
        .eq('is_active', true)
        .single();

      if (containerError) {
        logger.error('Error fetching container:', containerError);
        return [];
      }

      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('menu_container_id', container.id)
        .eq('is_enabled', true)
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (error) {
        logger.error('Error fetching menu items by type:', error);
        throw error;
      }

      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        url: item.url || '',
        description: item.description || item.subtitle || null,
        menu_type: type,
        parent_id: item.parent_id,
        sort_order: item.sort_order,
        is_enabled: item.is_enabled,
        target: (item.target || '_self') as MenuTarget,
        icon: item.icon || null,
        css_classes: item.css_classes || null,
        visibility: item.requires_auth ? 'authenticated' : 'public' as MenuVisibility,
        required_roles: item.custom_properties?.required_roles || null,
        is_external: item.url?.startsWith('http') || false,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      logger.error('Error in getByType:', error);
      throw error;
    }
  },

  // Get single menu item
  async getById(id: string): Promise<MenuItem | null> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          menu_containers!inner(type)
        `)
        .eq('id', id)
        .single();

      if (error) {
        logger.error('Error fetching menu item:', error);
        return null;
      }

      return {
        id: data.id,
        title: data.title,
        url: data.url || '',
        description: data.description || data.subtitle || null,
        menu_type: (data.menu_containers?.type || 'main') as MenuType,
        parent_id: data.parent_id,
        sort_order: data.sort_order,
        is_enabled: data.is_enabled,
        target: (data.target || '_self') as MenuTarget,
        icon: data.icon || null,
        css_classes: data.css_classes || null,
        visibility: data.requires_auth ? 'authenticated' : 'public' as MenuVisibility,
        required_roles: data.custom_properties?.required_roles || null,
        is_external: data.url?.startsWith('http') || false,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      logger.error('Error in getById:', error);
      return null;
    }
  },

  // Create new menu item
  async create(input: MenuItemInput): Promise<MenuItem> {
    try {
      // Get container for this menu type
      const { data: container, error: containerError } = await supabase
        .from('menu_containers')
        .select('id')
        .eq('type', input.menu_type)
        .eq('is_active', true)
        .single();

      if (containerError) {
        logger.error('Error fetching container:', containerError);
        throw new Error('Menu container not found');
      }

      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          menu_container_id: container.id,
          title: input.title,
          url: input.url || null,
          subtitle: input.description,
          description: input.description,
          parent_id: input.parent_id || null,
          sort_order: input.sort_order || 0,
          is_enabled: input.is_enabled ?? true,
          is_visible: true,
          requires_auth: input.visibility === 'authenticated',
          target: input.target || '_self',
          icon: input.icon || null,
          css_classes: input.css_classes || null,
          custom_properties: input.required_roles ? { required_roles: input.required_roles } : {},
          item_type: 'link'
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating menu item:', error);
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        url: data.url || '',
        description: data.description || data.subtitle || null,
        menu_type: input.menu_type,
        parent_id: data.parent_id,
        sort_order: data.sort_order,
        is_enabled: data.is_enabled,
        target: (data.target || '_self') as MenuTarget,
        icon: data.icon || null,
        css_classes: data.css_classes || null,
        visibility: data.requires_auth ? 'authenticated' : 'public' as MenuVisibility,
        required_roles: data.custom_properties?.required_roles || null,
        is_external: data.url?.startsWith('http') || false,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      logger.error('Error in create:', error);
      throw error;
    }
  },

  // Update menu item
  async update(id: string, update: MenuItemUpdate): Promise<MenuItem> {
    try {
      const updateData: any = {};
      
      if (update.title !== undefined) updateData.title = update.title;
      if (update.url !== undefined) updateData.url = update.url || null;
      if (update.description !== undefined) {
        updateData.subtitle = update.description;
        updateData.description = update.description;
      }
      if (update.parent_id !== undefined) updateData.parent_id = update.parent_id;
      if (update.sort_order !== undefined) updateData.sort_order = update.sort_order;
      if (update.is_enabled !== undefined) updateData.is_enabled = update.is_enabled;
      if (update.target !== undefined) updateData.target = update.target;
      if (update.icon !== undefined) updateData.icon = update.icon;
      if (update.css_classes !== undefined) updateData.css_classes = update.css_classes;
      if (update.visibility !== undefined) {
        updateData.requires_auth = update.visibility === 'authenticated';
      }
      if (update.required_roles !== undefined) {
        updateData.custom_properties = { required_roles: update.required_roles };
      }

      const { data, error } = await supabase
        .from('menu_items')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          menu_containers!inner(type)
        `)
        .single();

      if (error) {
        logger.error('Error updating menu item:', error);
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        url: data.url || '',
        description: data.description || data.subtitle || null,
        menu_type: (data.menu_containers?.type || 'main') as MenuType,
        parent_id: data.parent_id,
        sort_order: data.sort_order,
        is_enabled: data.is_enabled,
        target: (data.target || '_self') as MenuTarget,
        icon: data.icon || null,
        css_classes: data.css_classes || null,
        visibility: data.requires_auth ? 'authenticated' : 'public' as MenuVisibility,
        required_roles: data.custom_properties?.required_roles || null,
        is_external: data.url?.startsWith('http') || false,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      logger.error('Error in update:', error);
      throw error;
    }
  },

  // Delete menu item
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting menu item:', error);
        throw error;
      }

      return true;
    } catch (error) {
      logger.error('Error in delete:', error);
      throw error;
    }
  },

  // Bulk reorder menu items
  async bulkReorder(updates: Array<{ id: string; sort_order: number }>): Promise<boolean> {
    try {
      // Update each item's sort order
      const promises = updates.map(({ id, sort_order }) =>
        supabase
          .from('menu_items')
          .update({ sort_order })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      
      // Check if any updates failed
      const hasError = results.some(result => result.error);
      if (hasError) {
        logger.error('Error in bulk reorder:', results);
        throw new Error('Failed to reorder menu items');
      }

      return true;
    } catch (error) {
      logger.error('Error in bulkReorder:', error);
      throw error;
    }
  },

  // Bulk toggle enable/disable
  async bulkToggle(updates: Array<{ id: string; is_enabled: boolean }>): Promise<boolean> {
    try {
      const promises = updates.map(({ id, is_enabled }) =>
        supabase
          .from('menu_items')
          .update({ is_enabled })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      
      const hasError = results.some(result => result.error);
      if (hasError) {
        logger.error('Error in bulk toggle:', results);
        throw new Error('Failed to toggle menu items');
      }

      return true;
    } catch (error) {
      logger.error('Error in bulkToggle:', error);
      throw error;
    }
  }
};