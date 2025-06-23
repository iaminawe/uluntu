/**
 * Responsive improvements for settings components
 * These are wrapper components that enhance mobile responsiveness
 */

import React from 'react';
import { cn, responsiveForm, responsiveSpacing, touchFriendly, mobileFirst } from '@/utils/responsivePatterns';

// Responsive form field wrapper
export const ResponsiveFormField: React.FC<{
  label: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, required, description, children, className }) => {
  return (
    <div className={cn(responsiveForm.formGroup, className)}>
      <label className={responsiveForm.label}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {description && (
        <p className={responsiveForm.helpText}>{description}</p>
      )}
    </div>
  );
};

// Responsive toggle switch
export const ResponsiveToggle: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
  className?: string;
}> = ({ enabled, onChange, label, description, className }) => {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex-1 min-w-0">
        <label className="font-medium text-gray-900">{label}</label>
        {description && (
          <p className={cn(responsiveForm.helpText, "mt-1")}>{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          touchFriendly.toggleSwitch,
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        )}
      >
        <span
          className={cn(
            touchFriendly.toggleKnob,
            enabled ? 'translate-x-8 sm:translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
};

// Responsive button group
export const ResponsiveButtonGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}> = ({ children, className, align = 'right' }) => {
  const alignmentClass = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center'
  }[align];

  return (
    <div className={cn(
      responsiveForm.buttonGroup,
      alignmentClass,
      className
    )}>
      {children}
    </div>
  );
};

// Responsive settings panel
export const ResponsiveSettingsPanel: React.FC<{
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon: Icon, iconColor = 'text-blue-600', children, className }) => {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200", className)}>
      <div className={cn(
        responsiveSpacing.cardPadding,
        "border-b border-gray-200"
      )}>
        <div className="flex items-center">
          {Icon && <Icon className={cn("h-5 w-5 mr-2", iconColor)} />}
          <h4 className="font-medium text-gray-900">{title}</h4>
        </div>
      </div>
      <div className={responsiveSpacing.cardPadding}>
        {children}
      </div>
    </div>
  );
};

// Responsive grid container
export const ResponsiveGrid: React.FC<{
  cols?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}> = ({ cols = 2, children, className }) => {
  const gridClass = {
    1: 'grid grid-cols-1 gap-4 sm:gap-6',
    2: 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6',
    3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
  }[cols];

  return (
    <div className={cn(gridClass, className)}>
      {children}
    </div>
  );
};

// Responsive tabs
export const ResponsiveTabs: React.FC<{
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn("border-b border-gray-200", className)}>
      <nav className="-mb-px flex gap-2 sm:gap-4 md:gap-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "py-2 px-1 sm:px-2 border-b-2 font-medium text-sm whitespace-nowrap flex items-center",
                touchFriendly.touchTarget,
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {Icon && <Icon className="h-4 w-4 mr-1.5 sm:mr-2" />}
              <span className={cn(mobileFirst.hideOnMobile, "sm:inline")}>{tab.label}</span>
              <span className={cn(mobileFirst.showOnMobile, "sm:hidden")}>
                {tab.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// Responsive action bar
export const ResponsiveActionBar: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}> = ({ title, description, actions, className }) => {
  return (
    <div className={cn(
      mobileFirst.stackOnMobile,
      "justify-between",
      className
    )}>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className={cn(responsiveForm.helpText, "mt-1")}>{description}</p>
        )}
      </div>
      {actions && (
        <div className={cn(responsiveForm.buttonGroup, "sm:ml-4")}>
          {actions}
        </div>
      )}
    </div>
  );
};

// Responsive color picker
export const ResponsiveColorPicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}> = ({ value, onChange, label, className }) => {
  return (
    <ResponsiveFormField label={label} className={className}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-10 w-16 sm:w-20 border border-gray-300 rounded cursor-pointer",
            touchFriendly.touchTarget
          )}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className={responsiveForm.input}
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
    </ResponsiveFormField>
  );
};

// Responsive stat card
export const ResponsiveStatCard: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}> = ({ label, value, icon: Icon, trend, className }) => {
  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200",
      responsiveSpacing.cardPadding,
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm mt-2",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="h-5 w-5 text-gray-600" />
          </div>
        )}
      </div>
    </div>
  );
};

// Export all components
export default {
  ResponsiveFormField,
  ResponsiveToggle,
  ResponsiveButtonGroup,
  ResponsiveSettingsPanel,
  ResponsiveGrid,
  ResponsiveTabs,
  ResponsiveActionBar,
  ResponsiveColorPicker,
  ResponsiveStatCard
};