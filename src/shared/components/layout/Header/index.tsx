import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { HeaderProps, NavLinkItem } from "./types";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import { useEnabledFeatures, useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/providers/EnhancedThemeProvider";

const Header: React.FC<HeaderProps> = ({
  logo,
  navLinks = [
    { 
      text: "Community", 
      href: "/community",
      children: [
        { text: "Events", href: "/events", description: "Workshops, meetups, and tech talks", feature: "events_system" },
        { text: "Directory", href: "/directory", description: "Connect with tech professionals", feature: "members_directory" },
        { text: "Groups", href: "/groups", description: "Join communities of interest", feature: "groups_communities" },
        { text: "News", href: "/news", description: "Latest tech news and articles", feature: "news_blog" },
        { text: "Galleries", href: "/galleries", description: "Browse community photo galleries", feature: "photo_galleries" }
      ]
    },
    { 
      text: "Business", 
      href: "/business",
      children: [
        { text: "Companies", href: "/companies", description: "Explore local tech companies", feature: "companies_listing" },
        { text: "Opportunities", href: "/opportunities", description: "Find jobs and volunteer roles", feature: "opportunities_board" },
        { text: "Marketplace", href: "/marketplace", description: "Buy and sell tech items", feature: "marketplace" }
      ]
    },
    { 
      text: "Resources", 
      href: "/resources", 
      description: "Educational content and guides",
      feature: "resources_library"
    },
    { 
      text: "About", 
      href: "/about",
      children: [
        { text: "About Us", href: "/about", description: "Learn about our mission" },
        { text: "Partners", href: "/partners", description: "Our community partners and sponsors" },
        { text: "Contact", href: "/contact", description: "Get in touch with us" },
        { text: "Privacy", href: "/privacy", description: "Privacy policy and data protection" },
        { text: "Terms", href: "/terms", description: "Terms of service and guidelines" }
      ]
    }
  ]
}) => {
  const { features, isFeatureEnabled } = useEnabledFeatures();
  const { settings } = useSettings();
  const { currentTheme, primaryColor, secondaryColor, theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isDark = theme === 'dark';
  
  // Get site settings with fallbacks
  const siteName = settings?.site?.site_name?.value || "Nelson Tech";
  const siteLogo = settings?.site?.site_logo?.value;
  const displayLogo = logo || siteLogo || siteName;

  // Filter navigation links based on feature toggles
  const filteredNavLinks = useMemo(() => {
    // If features are still loading, show all nav links to prevent blank header
    if (!features || Object.keys(features).length === 0) {
      return navLinks;
    }

    return navLinks.map(link => {
      // If the main link has a feature requirement, check it
      if (link.feature && !isFeatureEnabled(link.feature as any)) {
        return null;
      }

      // Filter children based on their feature requirements
      if (link.children) {
        const filteredChildren = link.children.filter(child => {
          return !child.feature || isFeatureEnabled(child.feature as any);
        });

        // If no children remain after filtering, hide the parent
        if (filteredChildren.length === 0) {
          return null;
        }

        return {
          ...link,
          children: filteredChildren
        };
      }

      return link;
    }).filter(Boolean); // Remove null entries
  }, [navLinks, isFeatureEnabled, features]);

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
            navLinks={filteredNavLinks.filter(Boolean) as NavLinkItem[]} 
            isDark={isDark} 
            toggleDarkMode={toggleDarkMode} 
          />

          {/* Mobile Menu Controls */}
          <div className="md:hidden flex items-center">
            <ThemeToggle isDark={isDark} toggleDarkMode={toggleDarkMode} />
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
          navLinks={filteredNavLinks.filter(Boolean) as NavLinkItem[]} 
          onLinkClick={closeMobileMenu} 
        />
      </div>
    </header>
  );
};

export default Header;