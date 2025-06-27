import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { HeaderProps } from '@/shared/components/layout/Header/types';
import DesktopNav from '@/shared/components/layout/Header/DesktopNav';
import MobileNav from '@/shared/components/layout/Header/MobileNav';
import ThemeToggle from '@/shared/components/layout/Header/ThemeToggle';
import UserMenu from '@/shared/components/layout/Header/UserMenu';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/providers/EnhancedThemeProvider';

const Header: React.FC<HeaderProps> = ({
  logo,
  navLinks = [
    { text: "Events", href: "/events" },
    { text: "Directory", href: "/directory" },
    { text: "Companies", href: "/companies" },
    { text: "Opportunities", href: "/opportunities" },
    { text: "Marketplace", href: "/marketplace" },
    { text: "Resources", href: "/resources" },
    { text: "Groups", href: "/groups" },
    { text: "News", href: "/news" },
    { text: "Topics", href: "/topics" }
  ]
}) => {
  const { settings } = useSettings();
  const { primaryColor, secondaryColor, theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isDark = theme === 'dark';
  
  // Get site settings with fallbacks
  const siteName = settings?.site?.site_name?.value || "Nelson Tech";
  const siteLogo = settings?.site?.site_logo?.value;
  const displayLogo = logo || siteLogo || siteName;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDarkMode = toggleTheme;

  const closeMobileMenu = () => setIsOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300`}
      style={{
        background: isScrolled
          ? `linear-gradient(to right, ${primaryColor}e6, ${secondaryColor}e6)`
          : `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
        backdropFilter: isScrolled ? 'blur(4px)' : 'none',
        boxShadow: isScrolled ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
      }}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-white font-bold text-xl flex items-center"
          >
            {typeof displayLogo === 'string' && displayLogo.includes('http') ? (
              <img 
                src={displayLogo} 
                alt={siteName} 
                className="h-8 w-auto"
              />
            ) : (
              displayLogo
            )}
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav 
            navLinks={navLinks} 
            isDark={isDark} 
            toggleDarkMode={toggleDarkMode} 
          />

          {/* Mobile Menu Controls */}
          <div className="md:hidden flex items-center">
            <ThemeToggle isDark={isDark} toggleDarkMode={toggleDarkMode} />
            <UserMenu />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2 ml-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center">
            <UserMenu />
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNav 
          isOpen={isOpen} 
          navLinks={navLinks} 
          onLinkClick={closeMobileMenu} 
        />
      </div>
    </header>
  );
};

export default Header;