// Types for Header component

export interface NavLinkItem {
  text: string;
  href: string;
  children?: NavLinkItem[];
  description?: string;
  feature?: string; // Feature toggle key for conditional rendering
}

export interface HeaderProps {
  logo?: string;
  navLinks?: NavLinkItem[];
}
