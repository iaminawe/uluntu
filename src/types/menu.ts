// Menu management types for comprehensive menu system

import { BaseEntity, ContentStatus } from './common';
import { z } from 'zod';
import { FeatureKey } from './settings';

export { FeatureKey } from './settings';

// Menu types
export type MenuType = 'main' | 'footer' | 'mobile' | 'admin';

// Menu item target types
export type MenuTarget = '_self' | '_blank' | '_parent' | '_top';

// Menu visibility types
export type MenuVisibility = 'public' | 'authenticated' | 'admin' | 'role_based';

// Base menu item interface
export interface MenuItem extends BaseEntity {
  title: string;
  url: string;
  description?: string;
  menu_type: MenuType;
  parent_id?: string | null;
  sort_order: number;
  is_enabled: boolean;
  target: MenuTarget;
  icon?: string | null;
  css_classes?: string | null;
  visibility: MenuVisibility;
  required_roles?: string[] | null;
  is_external: boolean;
  feature_flag?: string | null;
  children?: MenuItem[];
}

// Input types for API operations
export interface MenuItemInput {
  title: string;
  url: string;
  description?: string;
  menu_type: MenuType;
  parent_id?: string | null;
  sort_order?: number;
  is_enabled?: boolean;
  target?: MenuTarget;
  icon?: string | null;
  css_classes?: string | null;
  visibility?: MenuVisibility;
  required_roles?: string[] | null;
  is_external?: boolean;
}

export interface MenuItemUpdate extends Partial<MenuItemInput> {
  id: string;
}

// Bulk operations
export interface MenuBulkReorderItem {
  id: string;
  sort_order: number;
  parent_id?: string | null;
}

export interface MenuBulkToggleItem {
  id: string;
  is_enabled: boolean;
}

// Filter and query types
export interface MenuFilterParams {
  menu_type?: MenuType | MenuType[];
  is_enabled?: boolean;
  visibility?: MenuVisibility | MenuVisibility[];
  parent_id?: string | null;
  search?: string;
  include_children?: boolean;
}

// API response types
export interface MenuHierarchy {
  menu_type: MenuType;
  items: MenuItem[];
}

export interface MenuStats {
  total_items: number;
  enabled_items: number;
  by_type: Record<MenuType, number>;
  by_visibility: Record<MenuVisibility, number>;
}

// Database adapter types
export interface MenuItemDatabaseRow {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  menu_type: string;
  parent_id?: string | null;
  sort_order: number;
  is_enabled: boolean;
  target: string;
  icon?: string | null;
  css_classes?: string | null;
  visibility: string;
  required_roles?: string[] | null;
  is_external: boolean;
  status?: string;
  featured?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Validation schemas using Zod
export const MenuItemInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  url: z.string().min(1, 'URL is required').max(2048, 'URL too long'),
  description: z.string().max(500, 'Description too long').optional(),
  menu_type: z.enum(['main', 'footer', 'mobile', 'admin']),
  parent_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().min(0).max(9999).optional().default(0),
  is_enabled: z.boolean().optional().default(true),
  target: z.enum(['_self', '_blank', '_parent', '_top']).optional().default('_self'),
  icon: z.string().max(100, 'Icon name too long').nullable().optional(),
  css_classes: z.string().max(500, 'CSS classes too long').nullable().optional(),
  visibility: z.enum(['public', 'authenticated', 'admin', 'role_based']).optional().default('public'),
  required_roles: z.array(z.string()).nullable().optional(),
  is_external: z.boolean().optional().default(false),
});

export const MenuItemUpdateSchema = MenuItemInputSchema.partial().extend({
  id: z.string().uuid(),
});

export const MenuBulkReorderSchema = z.array(z.object({
  id: z.string().uuid(),
  sort_order: z.number().int().min(0).max(9999),
  parent_id: z.string().uuid().nullable().optional(),
}));

export const MenuBulkToggleSchema = z.array(z.object({
  id: z.string().uuid(),
  is_enabled: z.boolean(),
}));

export const MenuFilterSchema = z.object({
  menu_type: z.union([
    z.enum(['main', 'footer', 'mobile', 'admin']),
    z.array(z.enum(['main', 'footer', 'mobile', 'admin']))
  ]).optional(),
  is_enabled: z.boolean().optional(),
  visibility: z.union([
    z.enum(['public', 'authenticated', 'admin', 'role_based']),
    z.array(z.enum(['public', 'authenticated', 'admin', 'role_based']))
  ]).optional(),
  parent_id: z.string().uuid().nullable().optional(),
  search: z.string().max(255).optional(),
  include_children: z.boolean().optional().default(false),
});

// Type guards
export function isMenuItem(obj: any): obj is MenuItem {
  return obj && typeof obj === 'object' && 'id' in obj && 'title' in obj && 'url' in obj && 'menu_type' in obj;
}

export function isMenuItemArray(obj: any): obj is MenuItem[] {
  return Array.isArray(obj) && obj.every(isMenuItem);
}

// Constants
export const MENU_TYPES: MenuType[] = ['main', 'footer', 'mobile', 'admin'];
export const MENU_TARGETS: MenuTarget[] = ['_self', '_blank', '_parent', '_top'];
export const MENU_VISIBILITY_OPTIONS: MenuVisibility[] = ['public', 'authenticated', 'admin', 'role_based'];

export const DEFAULT_MENU_ITEM: Partial<MenuItem> = {
  sort_order: 0,
  is_enabled: true,
  target: '_self',
  visibility: 'public',
  is_external: false,
  status: 'published',
  featured: false,
};