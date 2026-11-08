import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from '../index';

// Mock the visual components to avoid rendering issues
jest.mock('@/shared/components/visual', () => ({
  DynamicHero: ({ title, subtitle, description }: any) => (
    <div data-testid="dynamic-hero">
      <h1>{title}</h1>
      <h2>{subtitle}</h2>
      <p>{description}</p>
    </div>
  ),
  FeatureCard: ({ title, description }: any) => (
    <div data-testid="feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
  ImageCard: ({ title, description }: any) => (
    <div data-testid="image-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
  GlassCard: ({ children }: any) => (
    <div data-testid="glass-card">{children}</div>
  ),
  ImageSection: ({ title, children }: any) => (
    <div data-testid="image-section">
      <h2>{title}</h2>
      {children}
    </div>
  ),
  ImageGallery: ({ items }: any) => (
    <div data-testid="image-gallery">
      {items?.map((item: any, index: number) => (
        <div key={index}>{item.title}</div>
      ))}
    </div>
  )
}));

// Create a mock store with the required structure
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      members: () => ({ 
        members: [], 
        status: 'idle',
        error: null 
      }),
      companies: () => ({ 
        companies: [], 
        status: 'idle',
        error: null 
      }),
      events: () => ({ 
        events: [], 
        status: 'idle',
        error: null 
      }),
      news: () => ({ 
        articles: [], 
        status: 'idle',
        error: null 
      }),
      groups: () => ({ 
        groups: [], 
        status: 'idle',
        error: null 
      })
    },
    preloadedState: initialState
  });
};

const renderWithProviders = (ui: React.ReactElement, { store = createMockStore() } = {}) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <HelmetProvider>
          {ui}
        </HelmetProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe('HomePage Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByTestId('dynamic-hero')).toBeInTheDocument();
  });

  it('should display the correct title and branding', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText('Uluntu Community')).toBeInTheDocument();
    expect(screen.getByText('Kootenay Innovation Hub')).toBeInTheDocument();
    expect(screen.getByText(/Connecting tech professionals/)).toBeInTheDocument();
  });

  it('should render feature cards section', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText('Everything You Need')).toBeInTheDocument();
    expect(screen.getByText('Your gateway to the Kootenay tech ecosystem')).toBeInTheDocument();
    
    // Check for feature cards
    const featureCards = screen.getAllByTestId('feature-card');
    expect(featureCards).toHaveLength(4);
  });

  it('should render with loading state', () => {
    const store = createMockStore({
      members: { members: [], status: 'loading', error: null },
      companies: { companies: [], status: 'loading', error: null },
      events: { events: [], status: 'loading', error: null },
      news: { articles: [], status: 'loading', error: null },
      groups: { groups: [], status: 'loading', error: null }
    });

    renderWithProviders(<HomePage />, { store });
    
    // Should still render hero while loading
    expect(screen.getByTestId('dynamic-hero')).toBeInTheDocument();
    expect(screen.getByText('Uluntu Community')).toBeInTheDocument();
  });

  it('should render with error state', () => {
    const store = createMockStore({
      members: { members: [], status: 'failed', error: 'Failed to load' },
      companies: { companies: [], status: 'idle', error: null },
      events: { events: [], status: 'idle', error: null },
      news: { articles: [], status: 'idle', error: null },
      groups: { groups: [], status: 'idle', error: null }
    });

    renderWithProviders(<HomePage />, { store });
    
    // Should still render hero with error state
    expect(screen.getByTestId('dynamic-hero')).toBeInTheDocument();
    expect(screen.getByText('Uluntu Community')).toBeInTheDocument();
  });

  it('should render with populated data', () => {
    const mockMembers = [
      { id: '1', name: 'John Doe', title: 'Developer', featured: true, joinDate: '2023-01-01', skills: [], image: '', social: {} }
    ];
    
    const mockCompanies = [
      { id: '1', name: 'Tech Corp', description: 'Great company', logo: '', industry: ['Tech'], size: '10-50', founded: '2020', location: 'Nelson', featured: true, employees: [] }
    ];

    const store = createMockStore({
      members: { members: mockMembers, status: 'succeeded', error: null },
      companies: { companies: mockCompanies, status: 'succeeded', error: null },
      events: { events: [], status: 'succeeded', error: null },
      news: { articles: [], status: 'succeeded', error: null },
      groups: { groups: [], status: 'succeeded', error: null }
    });

    renderWithProviders(<HomePage />, { store });
    
    // Should render hero and features
    expect(screen.getByTestId('dynamic-hero')).toBeInTheDocument();
    
    // Should show dynamic counts in feature descriptions
    expect(screen.getByText(/Connect with 1\+ tech professionals/)).toBeInTheDocument();
    expect(screen.getByText(/Explore 1\+ innovative tech companies/)).toBeInTheDocument();
  });

  it('should have proper SEO meta tags', () => {
    renderWithProviders(<HomePage />);
    
    // Check that Helmet component was rendered (title would be set)
    expect(document.title).toContain('Uluntu Community');
  });
});