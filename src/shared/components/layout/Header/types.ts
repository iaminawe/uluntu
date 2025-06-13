// Types for Header component

export interface NavLinkItem {
  text: string;
  href: string;
}

export interface HeaderProps {
  logo?: string;
  navLinks?: NavLinkItem[];
}
