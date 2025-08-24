/// <reference types="jest" />
/// <reference types="@jest/globals" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveFocus(): R;
      toHaveValue(value: string | number): R;
      toHaveDisplayValue(value: string | RegExp): R;
      toBeChecked(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeInvalid(): R;
      toHaveStyle(style: Record<string, any> | string): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(htmlText: string): R;
    }
  }
}

// Mock for react-hot-toast
declare module 'react-hot-toast' {
  interface MockToast {
    success: jest.MockedFunction<(message: string, options?: any) => string>;
    error: jest.MockedFunction<(message: string, options?: any) => string>;
    warning: jest.MockedFunction<(message: string, options?: any) => string>;
    loading: jest.MockedFunction<(message: string, options?: any) => string>;
    promise: jest.MockedFunction<any>;
    custom: jest.MockedFunction<any>;
    dismiss: jest.MockedFunction<any>;
    remove: jest.MockedFunction<any>;
  }
  
  export const toast: MockToast;
}

// Company adapter interface for tests
export interface TestCompany {
  id: string;
  name: string;
  description: string;
  logo: string | null;
  cover_image: string | null;
  cover_image_url: string | null;
  industry: string[];
  size: string;
  founded: string;
  location: string;
  website: string | null;
  status: string;
  featured: boolean;
  created_at: string;
  comment_count: number | null;
  like_count: number | null;
}

// Menu item interface for tests
export interface TestMenuItem {
  id: string;
  label: string;
  url: string;
  parent_id: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Settings interface for tests - legacy format
export interface LegacySettingFormat {
  key: string;
  value: string;
  category: string;
  data_type: string;
}

export {};