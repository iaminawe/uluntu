import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/store';

// Import form components
import CompanyEditPage from '../CompanyEditPage';
import EventEditPage from '../EventEditPage';
import NewsEditPage from '../NewsEditPage';
import OpportunityEditPage from '../OpportunityEditPage';
import GroupEditPage from '../GroupEditPage';
import MarketplaceEditPage from '../MarketplaceEditPage';
import DirectoryEditPage from '../DirectoryEditPage';
import ResourceEditPage from '../ResourceEditPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  );
};

describe('Form Standardization Tests', () => {
  describe('Form Width Consistency', () => {
    it('CompanyEditPage should have 80% width container', () => {
      renderWithProviders(<CompanyEditPage />);
      const container = screen.getByRole('form').parentElement;
      expect(container).toHaveClass('w-4/5', 'max-w-[80%]');
    });

    it('EventEditPage should have 80% width container', () => {
      renderWithProviders(<EventEditPage />);
      const container = screen.getByRole('form').parentElement;
      expect(container).toHaveClass('w-4/5', 'max-w-[80%]');
    });

    it('NewsEditPage should have 80% width container', () => {
      renderWithProviders(<NewsEditPage />);
      const container = screen.getByRole('form').parentElement;
      expect(container).toHaveClass('w-4/5', 'max-w-[80%]');
    });

    it('OpportunityEditPage should have 80% width container', () => {
      renderWithProviders(<OpportunityEditPage />);
      const container = screen.getByRole('form').parentElement;
      expect(container).toHaveClass('w-4/5', 'max-w-[80%]');
    });

    it('GroupEditPage should have 80% width container', () => {
      renderWithProviders(<GroupEditPage />);
      const container = screen.getByRole('form').parentElement;
      expect(container).toHaveClass('w-4/5', 'max-w-[80%]');
    });

    it('MarketplaceEditPage should have 80% width container', () => {
      renderWithProviders(<MarketplaceEditPage />);
      const container = screen.getByRole('form').parentElement;
      expect(container).toHaveClass('w-4/5', 'max-w-[80%]');
    });

    it('DirectoryEditPage should have 80% width container', () => {
      renderWithProviders(<DirectoryEditPage />);
      const container = screen.getByRole('form').parentElement;
      expect(container).toHaveClass('w-4/5', 'max-w-[80%]');
    });

    it('ResourceEditPage should have 80% width container', () => {
      renderWithProviders(<ResourceEditPage />);
      const container = screen.getByRole('form').parentElement;
      expect(container).toHaveClass('w-4/5', 'max-w-[80%]');
    });
  });

  describe('Slug Field Presence', () => {
    it('All forms should have a slug field', () => {
      const formPages = [
        <CompanyEditPage />,
        <EventEditPage />,
        <NewsEditPage />,
        <OpportunityEditPage />,
        <GroupEditPage />,
        <MarketplaceEditPage />,
        <DirectoryEditPage />,
        <ResourceEditPage />
      ];

      formPages.forEach((page, index) => {
        const { container } = renderWithProviders(page);
        const slugInput = container.querySelector('input[name="slug"]');
        expect(slugInput).toBeInTheDocument();
      });
    });
  });

  describe('Button Consistency', () => {
    it('All forms should have Save button', () => {
      const formPages = [
        <CompanyEditPage />,
        <EventEditPage />,
        <NewsEditPage />,
        <OpportunityEditPage />,
        <GroupEditPage />,
        <MarketplaceEditPage />,
        <DirectoryEditPage />,
        <ResourceEditPage />
      ];

      formPages.forEach((page) => {
        renderWithProviders(page);
        const saveButton = screen.getByRole('button', { name: /save/i });
        expect(saveButton).toBeInTheDocument();
      });
    });

    it('All forms should have Cancel button', () => {
      const formPages = [
        <CompanyEditPage />,
        <EventEditPage />,
        <NewsEditPage />,
        <OpportunityEditPage />,
        <GroupEditPage />,
        <MarketplaceEditPage />,
        <DirectoryEditPage />,
        <ResourceEditPage />
      ];

      formPages.forEach((page) => {
        renderWithProviders(page);
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        expect(cancelButton).toBeInTheDocument();
      });
    });
  });
});