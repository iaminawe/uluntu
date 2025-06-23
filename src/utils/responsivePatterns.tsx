/**
 * Reusable responsive patterns for admin panels
 * These patterns ensure consistent mobile-first design across all admin interfaces
 */

// Responsive grid patterns
export const responsiveGridPatterns = {
  // Form grid that stacks on mobile
  formGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",
  
  // Two column layout that stacks on mobile
  twoColumn: "grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6",
  
  // Settings panel grid
  settingsGrid: "grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6",
  
  // Card grid for dashboard
  cardGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
};

// Responsive spacing patterns
export const responsiveSpacing = {
  // Page padding
  pagePadding: "px-4 sm:px-6 lg:px-8",
  
  // Section padding
  sectionPadding: "p-4 sm:p-6",
  
  // Card padding
  cardPadding: "p-3 sm:p-4 md:p-6",
  
  // Button padding
  buttonPadding: "px-3 py-2 sm:px-4 sm:py-2",
};

// Responsive text patterns
export const responsiveText = {
  // Page title
  pageTitle: "text-2xl sm:text-3xl font-bold",
  
  // Section title
  sectionTitle: "text-lg sm:text-xl font-semibold",
  
  // Subtitle
  subtitle: "text-sm sm:text-base text-gray-600",
  
  // Body text
  body: "text-sm sm:text-base",
  
  // Small text
  small: "text-xs sm:text-sm",
};

// Responsive navigation patterns
export const responsiveNav = {
  // Tab navigation
  tabs: "flex flex-wrap gap-2 sm:gap-4 overflow-x-auto scrollbar-hide",
  
  // Tab item
  tabItem: "whitespace-nowrap px-3 py-2 text-sm sm:text-base",
  
  // Sidebar
  sidebar: "fixed inset-y-0 left-0 z-40 w-64 sm:w-72 lg:w-80 transform transition-transform duration-200 ease-in-out",
  
  // Mobile menu button
  mobileMenuButton: "lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg",
};

// Responsive form patterns
export const responsiveForm = {
  // Form group
  formGroup: "space-y-1.5 sm:space-y-2",
  
  // Input field
  input: "w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
  
  // Label
  label: "block text-sm font-medium text-gray-700",
  
  // Help text
  helpText: "text-xs sm:text-sm text-gray-500 mt-1",
  
  // Button group
  buttonGroup: "flex flex-col sm:flex-row gap-2 sm:gap-3",
};

// Touch-friendly patterns
export const touchFriendly = {
  // Minimum touch target size (44x44px)
  touchTarget: "min-h-[44px] min-w-[44px] flex items-center justify-center",
  
  // Toggle switch
  toggleSwitch: "relative inline-flex h-8 w-14 sm:h-6 sm:w-11 items-center rounded-full transition-colors cursor-pointer",
  
  // Toggle switch knob
  toggleKnob: "inline-block h-6 w-6 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform",
  
  // Action button
  actionButton: "p-2.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors",
};

// Responsive table patterns
export const responsiveTable = {
  // Table wrapper
  wrapper: "w-full overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6",
  
  // Table
  table: "min-w-full divide-y divide-gray-200",
  
  // Table cell
  cell: "px-3 py-3 sm:px-6 sm:py-4 text-sm",
};

// Mobile-first utility classes
export const mobileFirst = {
  // Hide on mobile, show on desktop
  hideOnMobile: "hidden sm:block",
  
  // Show on mobile, hide on desktop
  showOnMobile: "block sm:hidden",
  
  // Stack on mobile, inline on desktop
  stackOnMobile: "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4",
  
  // Full width on mobile
  fullWidthMobile: "w-full sm:w-auto",
};

// Responsive modal/dialog patterns
export const responsiveModal = {
  // Modal overlay
  overlay: "fixed inset-0 bg-black bg-opacity-50 z-50",
  
  // Modal content
  content: "fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full bg-white rounded-lg shadow-xl overflow-hidden",
  
  // Modal body
  body: "max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-12rem)] overflow-y-auto",
};

// Breakpoint-specific patterns
export const breakpoints = {
  // Mobile only
  mobile: "@media (max-width: 639px)",
  
  // Tablet and up
  tablet: "@media (min-width: 640px)",
  
  // Desktop and up
  desktop: "@media (min-width: 1024px)",
  
  // Large desktop and up
  largeDesktop: "@media (min-width: 1280px)",
};

// Helper function to combine classes
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};