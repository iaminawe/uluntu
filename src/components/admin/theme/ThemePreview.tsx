import React from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone,
  Menu,
  Search,
  Bell,
  User,
  Calendar,
  Users,
  Briefcase,
  FileText,
  ShoppingBag,
  MessageSquare
} from 'lucide-react';
import { Theme } from './types';

interface ThemePreviewProps {
  theme: Theme;
  isDarkMode: boolean;
  device: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

export default function ThemePreview({ theme, isDarkMode, device, onDeviceChange }: ThemePreviewProps) {
  const colors = isDarkMode ? generateDarkModeColors(theme.colors) : theme.colors;
  
  function generateDarkModeColors(lightColors: Theme['colors']): Theme['colors'] {
    return {
      ...lightColors,
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
      border: '#334155'
    };
  }

  const deviceSizes = {
    desktop: 'max-w-6xl',
    tablet: 'max-w-2xl',
    mobile: 'max-w-sm'
  };

  const navItems = [
    { icon: Calendar, label: 'Events' },
    { icon: Users, label: 'Directory' },
    { icon: Briefcase, label: 'Companies' },
    { icon: FileText, label: 'News' },
    { icon: ShoppingBag, label: 'Marketplace' }
  ];

  const sampleCards = [
    {
      title: 'Upcoming Event',
      subtitle: 'Tech Conference 2024',
      description: 'Join us for the annual technology conference featuring industry leaders.',
      date: 'March 15, 2024'
    },
    {
      title: 'Featured Member',
      subtitle: 'Jane Smith',
      description: 'Senior Developer with 10+ years of experience in web technologies.',
      date: 'Member since 2020'
    },
    {
      title: 'Latest News',
      subtitle: 'Platform Update',
      description: 'New features and improvements have been added to enhance your experience.',
      date: '2 hours ago'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Device Selector */}
      <div className="flex justify-center space-x-4">
        {[
          { id: 'desktop', icon: Monitor, label: 'Desktop' },
          { id: 'tablet', icon: Tablet, label: 'Tablet' },
          { id: 'mobile', icon: Smartphone, label: 'Mobile' }
        ].map((deviceOption) => {
          const Icon = deviceOption.icon;
          return (
            <button
              key={deviceOption.id}
              onClick={() => onDeviceChange(deviceOption.id as any)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                device === deviceOption.id
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              <span>{deviceOption.label}</span>
            </button>
          );
        })}
      </div>

      {/* Preview Container */}
      <div className="flex justify-center">
        <div 
          className={`${deviceSizes[device]} w-full border-2 border-gray-300 rounded-lg overflow-hidden shadow-2xl`}
          style={{ 
            backgroundColor: colors.background,
            fontFamily: `${theme.typography.fontFamily}, ${theme.typography.fontFallback}`
          }}
        >
          {/* Header */}
          <header 
            className="border-b"
            style={{ 
              backgroundColor: colors.surface,
              borderColor: colors.border
            }}
          >
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                  {device === 'mobile' && (
                    <Menu className="h-6 w-6" style={{ color: colors.text }} />
                  )}
                  <div 
                    className="text-xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    {theme.images.logo ? (
                      <img src={theme.images.logo} alt="Logo" className="h-8" />
                    ) : (
                      'YourLogo'
                    )}
                  </div>
                </div>

                {/* Navigation - Desktop/Tablet */}
                {device !== 'mobile' && (
                  <nav className="flex items-center space-x-6">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          className="flex items-center space-x-1 hover:opacity-80 transition-opacity"
                          style={{ color: colors.text }}
                        >
                          <Icon className="h-4 w-4" />
                          {device === 'desktop' && (
                            <span style={{ fontSize: theme.typography.fontSize.sm }}>
                              {item.label}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  {device === 'desktop' && (
                    <>
                      <button className="p-2 rounded-lg hover:opacity-80 transition-opacity">
                        <Search className="h-5 w-5" style={{ color: colors.text }} />
                      </button>
                      <button className="p-2 rounded-lg hover:opacity-80 transition-opacity relative">
                        <Bell className="h-5 w-5" style={{ color: colors.text }} />
                        <span 
                          className="absolute top-1 right-1 h-2 w-2 rounded-full"
                          style={{ backgroundColor: colors.accent }}
                        />
                      </button>
                    </>
                  )}
                  <button 
                    className="px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-80"
                    style={{ 
                      backgroundColor: colors.primary,
                      color: '#FFFFFF',
                      borderRadius: theme.layout.borderRadius.md,
                      fontSize: theme.typography.fontSize.sm
                    }}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section 
            className="px-4 py-12"
            style={{ 
              backgroundImage: theme.images.backgroundImage ? `url(${theme.images.backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="text-center">
              <h1 
                className="font-bold mb-4"
                style={{ 
                  color: colors.text,
                  fontSize: device === 'mobile' ? theme.typography.fontSize['2xl'] : theme.typography.fontSize['4xl'],
                  fontWeight: theme.typography.fontWeight.bold
                }}
              >
                Welcome to Our Community
              </h1>
              <p 
                className="mb-8 max-w-2xl mx-auto"
                style={{ 
                  color: colors.text,
                  opacity: 0.8,
                  fontSize: device === 'mobile' ? theme.typography.fontSize.base : theme.typography.fontSize.lg,
                  lineHeight: theme.typography.lineHeight.relaxed
                }}
              >
                Connect, collaborate, and grow with professionals in your field. Join our vibrant community today.
              </p>
              <div className="flex justify-center space-x-4">
                <button 
                  className="px-6 py-3 font-medium transition-opacity hover:opacity-80"
                  style={{ 
                    backgroundColor: colors.primary,
                    color: '#FFFFFF',
                    borderRadius: theme.layout.borderRadius.md,
                    fontSize: theme.typography.fontSize.base,
                    boxShadow: theme.layout.shadow.md
                  }}
                >
                  Get Started
                </button>
                <button 
                  className="px-6 py-3 font-medium transition-opacity hover:opacity-80"
                  style={{ 
                    backgroundColor: colors.surface,
                    color: colors.primary,
                    borderRadius: theme.layout.borderRadius.md,
                    fontSize: theme.typography.fontSize.base,
                    border: `2px solid ${colors.primary}`
                  }}
                >
                  Learn More
                </button>
              </div>
            </div>
          </section>

          {/* Content Section */}
          <section className="px-4 py-8">
            <div className={`grid gap-6 ${
              device === 'mobile' ? 'grid-cols-1' : 
              device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'
            }`}>
              {sampleCards.map((card, index) => (
                <div
                  key={index}
                  className="p-6 transition-transform hover:scale-105"
                  style={{ 
                    backgroundColor: colors.surface,
                    borderRadius: theme.layout.borderRadius.md,
                    boxShadow: theme.layout.shadow.md,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <h3 
                    className="font-semibold mb-1"
                    style={{ 
                      color: colors.primary,
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium
                    }}
                  >
                    {card.title}
                  </h3>
                  <h4 
                    className="font-medium mb-3"
                    style={{ 
                      color: colors.text,
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold
                    }}
                  >
                    {card.subtitle}
                  </h4>
                  <p 
                    className="mb-4"
                    style={{ 
                      color: colors.text,
                      opacity: 0.7,
                      fontSize: theme.typography.fontSize.sm,
                      lineHeight: theme.typography.lineHeight.normal
                    }}
                  >
                    {card.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span 
                      style={{ 
                        color: colors.secondary,
                        fontSize: theme.typography.fontSize.xs
                      }}
                    >
                      {card.date}
                    </span>
                    <button 
                      className="font-medium transition-opacity hover:opacity-80"
                      style={{ 
                        color: colors.accent,
                        fontSize: theme.typography.fontSize.sm
                      }}
                    >
                      Read More →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Feature Strip */}
          <section 
            className="px-4 py-6 border-t border-b"
            style={{ 
              backgroundColor: colors.surface,
              borderColor: colors.border
            }}
          >
            <div className={`flex ${device === 'mobile' ? 'flex-col space-y-4' : 'justify-around'} items-center`}>
              {[
                { label: '5,000+', sublabel: 'Members' },
                { label: '250+', sublabel: 'Companies' },
                { label: '100+', sublabel: 'Events' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="font-bold"
                    style={{ 
                      color: colors.primary,
                      fontSize: theme.typography.fontSize['2xl']
                    }}
                  >
                    {stat.label}
                  </div>
                  <div 
                    style={{ 
                      color: colors.text,
                      opacity: 0.6,
                      fontSize: theme.typography.fontSize.sm
                    }}
                  >
                    {stat.sublabel}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer 
            className="px-4 py-6"
            style={{ 
              backgroundColor: colors.surface,
              borderTop: `1px solid ${colors.border}`
            }}
          >
            <div className="text-center">
              <p 
                style={{ 
                  color: colors.text,
                  opacity: 0.6,
                  fontSize: theme.typography.fontSize.sm
                }}
              >
                © 2024 Your Community Platform. All rights reserved.
              </p>
            </div>
          </footer>

          {/* Status Colors Demo */}
          <div className="fixed bottom-4 right-4 space-y-2">
            <div 
              className="px-3 py-1 rounded text-white text-xs"
              style={{ backgroundColor: colors.success }}
            >
              Success
            </div>
            <div 
              className="px-3 py-1 rounded text-white text-xs"
              style={{ backgroundColor: colors.error }}
            >
              Error
            </div>
            <div 
              className="px-3 py-1 rounded text-white text-xs"
              style={{ backgroundColor: colors.warning }}
            >
              Warning
            </div>
            <div 
              className="px-3 py-1 rounded text-white text-xs"
              style={{ backgroundColor: colors.info }}
            >
              Info
            </div>
          </div>
        </div>
      </div>

      {/* CSS Variables Output */}
      <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs overflow-x-auto">
        <pre>{generateCSSVariables(theme, isDarkMode)}</pre>
      </div>
    </div>
  );

  function generateCSSVariables(theme: Theme, darkMode: boolean) {
    const colors = darkMode ? generateDarkModeColors(theme.colors) : theme.colors;
    
    return `/* CSS Variables for ${theme.name} */
:root {
  /* Colors */
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-surface: ${colors.surface};
  --color-text: ${colors.text};
  --color-border: ${colors.border};
  
  /* Typography */
  --font-family: ${theme.typography.fontFamily}, ${theme.typography.fontFallback};
  --font-size-base: ${theme.typography.fontSize.base};
  
  /* Layout */
  --border-radius: ${theme.layout.borderRadius.md};
  --shadow: ${theme.layout.shadow.md};
}`;
  }
}