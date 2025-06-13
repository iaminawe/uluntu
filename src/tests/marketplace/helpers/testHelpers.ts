import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import React, { ReactElement } from 'react';
import marketplaceReducer from '../../../redux/slices/marketplaceSlice';
import authReducer from '../../../redux/slices/authSlice';
import type { RootState } from '../../../redux/store';

// Mock implementations
export const createMockSupabaseClient = () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  auth: {
    getUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn()
  },
  storage: {
    from: jest.fn().mockReturnThis(),
    upload: jest.fn(),
    getPublicUrl: jest.fn()
  }
});

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: any;
}

export const renderWithProviders = (
  ui: ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        marketplace: marketplaceReducer,
        auth: authReducer
      },
      preloadedState
    }),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Wait helpers
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 100));

// Mock data generators
export const generateMockListing = (id: string) => ({
  id,
  title: `Test Listing ${id}`,
  description: `Description for test listing ${id}`,
  price: Math.floor(Math.random() * 200) + 10,
  type: Math.random() > 0.5 ? 'product' : 'service',
  condition: 'new',
  images: [`https://example.com/image${id}.jpg`],
  seller_id: `seller-${id}`,
  location: `Location ${id}`,
  tags: [`tag${id}`],
  status: 'active',
  featured: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

export const generateMockListings = (count: number) => 
  Array.from({ length: count }, (_, i) => generateMockListing(String(i + 1)));

// API mock helpers
export const mockSuccessfulApiCall = (data: any) => ({
  data,
  error: null
});

export const mockFailedApiCall = (error: string) => ({
  data: null,
  error: new Error(error)
});

// Form helpers
export const fillListingForm = async (
  getByLabelText: Function,
  data: {
    title?: string;
    description?: string;
    price?: string;
    type?: string;
    condition?: string;
    location?: string;
  }
) => {
  const { fireEvent } = await import('@testing-library/react');
  
  if (data.title) {
    fireEvent.change(getByLabelText(/title/i), { target: { value: data.title } });
  }
  if (data.description) {
    fireEvent.change(getByLabelText(/description/i), { target: { value: data.description } });
  }
  if (data.price) {
    fireEvent.change(getByLabelText(/price/i), { target: { value: data.price } });
  }
  if (data.type) {
    fireEvent.change(getByLabelText(/type/i), { target: { value: data.type } });
  }
  if (data.condition) {
    fireEvent.change(getByLabelText(/condition/i), { target: { value: data.condition } });
  }
  if (data.location) {
    fireEvent.change(getByLabelText(/location/i), { target: { value: data.location } });
  }
};

// Assertion helpers
export const expectListingToBeDisplayed = (
  getByText: Function,
  listing: {
    title: string;
    description: string;
    price: number;
    location: string;
  }
) => {
  expect(getByText(listing.title)).toBeInTheDocument();
  expect(getByText(listing.description)).toBeInTheDocument();
  expect(getByText(`$${listing.price}`)).toBeInTheDocument();
  expect(getByText(listing.location)).toBeInTheDocument();
};

// Mock context providers
export const MockAuthProvider = ({ children, user = null }: { children: React.ReactNode; user?: any }) => {
  const mockAuthContext = {
    user,
    status: user ? 'authenticated' : 'unauthenticated',
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn()
  };

  return (
    <div data-testid="mock-auth-provider">
      {children}
    </div>
  );
};

// Performance testing helpers
export const measureRenderTime = async (component: ReactElement) => {
  const start = performance.now();
  const { container } = render(component);
  const end = performance.now();
  
  return {
    renderTime: end - start,
    container
  };
};

// Accessibility testing helpers
export const checkA11y = async (container: HTMLElement) => {
  // This would integrate with jest-axe in a real implementation
  // For now, we'll do basic checks
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    expect(img).toHaveAttribute('alt');
  });

  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    expect(button).toHaveAccessibleName();
  });

  const forms = container.querySelectorAll('form');
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      if (id) {
        expect(form.querySelector(`label[for="${id}"]`)).toBeInTheDocument();
      }
    });
  });
};

// Snapshot testing helpers
export const createSnapshotTest = (componentName: string, component: ReactElement) => {
  it(`${componentName} matches snapshot`, () => {
    const { container } = render(component);
    expect(container).toMatchSnapshot();
  });
};

// Error boundary for testing
export class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-testid="error-boundary">
          <h1>Test Error Boundary</h1>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}