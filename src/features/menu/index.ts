// Dynamic menu system exports

// API
export * from './api/menuApi';

// Components
export { DynamicMenu, MenuLoadingSkeleton, MenuErrorDisplay } from './components/DynamicMenu';
export { MenuAdminPanel } from './components/MenuAdminPanel';

// Context and hooks
export { MenuProvider, useMenu, useMenuItems } from './contexts/MenuContext';
export { useMenuCache } from './hooks/useMenuCache';

// Utils and adapters
export * from './utils/menuAdapters';

// Types (re-exported for convenience)
export type { 
  MenuItem, 
  MenuPosition, 
  DynamicMenuProps, 
  MenuContextType,
  NavLinkItem,
  FooterColumn,
  FooterLink
} from '@/types/menu';