import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div
    className={cn(
      'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, ...props }) => (
  <div
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<CardTitleProps> = ({ children, className, ...props }) => (
  <h3
    className={cn('text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100', className)}
    {...props}
  >
    {children}
  </h3>
);

export const CardContent: React.FC<CardContentProps> = ({ children, className, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props}>
    {children}
  </div>
);
