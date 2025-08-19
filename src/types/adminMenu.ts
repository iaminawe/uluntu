// Simple types for the admin menu management component
// These bridge to the more complex menu system types

export interface SimpleMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  icon?: string;
  enabled: boolean;
  order: number;
  children?: SimpleMenuItem[];
  target?: '_blank' | '_self';
  description?: string;
}

export interface MenuConfiguration {
  mainMenu: SimpleMenuItem[];
  footerMenu: SimpleMenuItem[];
  lastModified: string;
}

export interface MenuState {
  configuration: MenuConfiguration;
  hasChanges: boolean;
  isLoading: boolean;
  error?: string;
}

export interface DragEndResult {
  destination?: {
    index: number;
    droppableId: string;
  };
  source: {
    index: number;
    droppableId: string;
  };
  draggableId: string;
}

export type SimpleMenuType = 'main' | 'footer';

export const ICON_OPTIONS = [
  { value: 'Home', label: 'Home' },
  { value: 'Users', label: 'Users' },
  { value: 'Building2', label: 'Building' },
  { value: 'Calendar', label: 'Calendar' },
  { value: 'Newspaper', label: 'News' },
  { value: 'BookOpen', label: 'Resources' },
  { value: 'ShoppingBag', label: 'Shopping' },
  { value: 'Briefcase', label: 'Briefcase' },
  { value: 'Tag', label: 'Tag' },
  { value: 'Mail', label: 'Mail' },
  { value: 'Phone', label: 'Phone' },
  { value: 'MapPin', label: 'Location' },
  { value: 'Globe', label: 'Globe' },
  { value: 'Info', label: 'Info' },
  { value: 'Settings', label: 'Settings' },
  { value: 'HelpCircle', label: 'Help' },
  { value: 'FileText', label: 'Document' },
  { value: 'Link', label: 'Link' },
  { value: 'ExternalLink', label: 'External Link' }
] as const;

export type IconType = typeof ICON_OPTIONS[number]['value'];