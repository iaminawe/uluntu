// Types for Header component

export interface NavLinkItem {
  text: string;
  href: string;
  children?: NavLinkItem[];
  description?: string;
}

export interface HeaderProps {
  logo?: string;
  navLinks?: NavLinkItem[];
}
