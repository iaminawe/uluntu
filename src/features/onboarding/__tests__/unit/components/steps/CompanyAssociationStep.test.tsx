import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CompanyAssociationStep } from '../../../../components/steps/CompanyAssociationStep';
import { searchCompanies, createCompany, joinCompany } from '@/features/companies/api/companiesApi';

// Mock API
jest.mock('../../../../../../api/companiesApi');
const mockSearchCompanies = searchCompanies as jest.MockedFunction<typeof searchCompanies>;
const mockCreateCompany = createCompany as jest.MockedFunction<typeof createCompany>;
const mockJoinCompany = joinCompany as jest.MockedFunction<typeof joinCompany>;

describe('CompanyAssociationStep', () => {
  const mockOnNext = jest.fn();
  const mockOnSkip = jest.fn();
  
  const defaultProps = {
    onNext: mockOnNext,
    onSkip: mockOnSkip,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(<CompanyAssociationStep {...defaultProps} {...props} />);
  };

  describe('Initial State', () => {
    it('should display action options', () => {
      renderComponent();

      expect(screen.getByTestId('join-existing-tab')).toBeInTheDocument();
      expect(screen.getByTestId('create-new-tab')).toBeInTheDocument();
      expect(screen.getByTestId('skip-button')).toBeInTheDocument();
    });

    it('should default to join existing company tab', () => {
      renderComponent();

      expect(screen.getByTestId('join-existing-tab')).toHaveClass('active');
      expect(screen.getByLabelText('Search Companies')).toBeInTheDocument();
    });
  });

  describe('Join Existing Company', () => {
    it('should search for companies', async () => {
      const mockCompanies = [
        { id: '1', name: 'Tech Corp Inc.', industry: 'Technology', size: '50-100' },
        { id: '2', name: 'Tech Solutions Ltd.', industry: 'Software', size: '10-50' },
      ];
      mockSearchCompanies.mockResolvedValue(mockCompanies);

      renderComponent();

      const searchInput = screen.getByLabelText('Search Companies');
      await userEvent.type(searchInput, 'Tech');

      await waitFor(() => {
        expect(mockSearchCompanies).toHaveBeenCalledWith('Tech');
        expect(screen.getByText('Tech Corp Inc.')).toBeInTheDocument();
        expect(screen.getByText('Tech Solutions Ltd.')).toBeInTheDocument();
      });
    });

    it('should show no results message', async () => {
      mockSearchCompanies.mockResolvedValue([]);

      renderComponent();

      const searchInput = screen.getByLabelText('Search Companies');
      await userEvent.type(searchInput, 'NonExistent');

      await waitFor(() => {
        expect(screen.getByText('No companies found')).toBeInTheDocument();
        expect(screen.getByText('Try a different search or create a new company')).toBeInTheDocument();
      });
    });

    it('should display company details in search results', async () => {
      const mockCompany = {
        id: '1',
        name: 'Tech Corp Inc.',
        industry: 'Technology',
        size: '50-100',
        location: 'Vancouver, BC',
        website: 'https://techcorp.com',
      };
      mockSearchCompanies.mockResolvedValue([mockCompany]);

      renderComponent();

      await userEvent.type(screen.getByLabelText('Search Companies'), 'Tech');

      await waitFor(() => {
        const companyCard = screen.getByTestId('company-card-1');
        expect(within(companyCard).getByText('Tech Corp Inc.')).toBeInTheDocument();
        expect(within(companyCard).getByText('Technology')).toBeInTheDocument();
        expect(within(companyCard).getByText('50-100 employees')).toBeInTheDocument();
        expect(within(companyCard).getByText('Vancouver, BC')).toBeInTheDocument();
      });
    });

    it('should select a company and show role form', async () => {
      const mockCompany = { id: '1', name: 'Tech Corp Inc.' };
      mockSearchCompanies.mockResolvedValue([mockCompany]);

      renderComponent();

      await userEvent.type(screen.getByLabelText('Search Companies'), 'Tech');
      
      await waitFor(() => {
        expect(screen.getByText('Tech Corp Inc.')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('select-company-1'));

      expect(screen.getByLabelText('Your Role')).toBeInTheDocument();
      expect(screen.getByLabelText('Department (optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Start Date (optional)')).toBeInTheDocument();
    });

    it('should validate role before joining', async () => {
      const mockCompany = { id: '1', name: 'Tech Corp Inc.' };
      mockSearchCompanies.mockResolvedValue([mockCompany]);

      renderComponent();

      await userEvent.type(screen.getByLabelText('Search Companies'), 'Tech');
      await waitFor(() => screen.getByText('Tech Corp Inc.'));
      
      fireEvent.click(screen.getByTestId('select-company-1'));
      
      // Try to join without filling role
      fireEvent.click(screen.getByTestId('join-company-button'));

      await waitFor(() => {
        expect(screen.getByTestId('role-error')).toHaveTextContent('Role is required');
      });
    });

    it('should join company with employee details', async () => {
      const mockCompany = { 
        id: '1', 
        name: 'Tech Corp Inc.',
        allow_direct_join: true 
      };
      mockSearchCompanies.mockResolvedValue([mockCompany]);
      mockJoinCompany.mockResolvedValue({ success: true, verified: true });

      renderComponent();

      // Search and select company
      await userEvent.type(screen.getByLabelText('Search Companies'), 'Tech');
      await waitFor(() => screen.getByText('Tech Corp Inc.'));
      fireEvent.click(screen.getByTestId('select-company-1'));

      // Fill employee details
      await userEvent.type(screen.getByLabelText('Your Role'), 'Software Engineer');
      await userEvent.type(screen.getByLabelText('Department (optional)'), 'Engineering');
      
      // Join company
      fireEvent.click(screen.getByTestId('join-company-button'));

      await waitFor(() => {
        expect(mockJoinCompany).toHaveBeenCalledWith('1', {
          role: 'Software Engineer',
          department: 'Engineering',
          startDate: undefined,
        });
        expect(mockOnNext).toHaveBeenCalledWith({
          action: 'joined',
          companyId: '1',
          companyName: 'Tech Corp Inc.',
          role: 'Software Engineer',
          department: 'Engineering',
        });
      });
    });

    it('should handle verification required companies', async () => {
      const mockCompany = { 
        id: '1', 
        name: 'Tech Corp Inc.',
        allow_direct_join: false,
        verification_required: true 
      };
      mockSearchCompanies.mockResolvedValue([mockCompany]);
      mockJoinCompany.mockResolvedValue({ 
        success: true, 
        verified: false,
        verificationPending: true 
      });

      renderComponent();

      // Search and select company
      await userEvent.type(screen.getByLabelText('Search Companies'), 'Tech');
      await waitFor(() => screen.getByText('Tech Corp Inc.'));
      fireEvent.click(screen.getByTestId('select-company-1'));

      // Should show verification notice
      expect(screen.getByTestId('verification-notice')).toHaveTextContent(
        'This company requires verification'
      );

      // Fill and submit
      await userEvent.type(screen.getByLabelText('Your Role'), 'Developer');
      fireEvent.click(screen.getByTestId('join-company-button'));

      await waitFor(() => {
        expect(screen.getByTestId('verification-message')).toHaveTextContent(
          'Verification request sent. You\'ll be notified once approved.'
        );
      });
    });
  });

  describe('Create New Company', () => {
    beforeEach(() => {
      renderComponent();
      fireEvent.click(screen.getByTestId('create-new-tab'));
    });

    it('should display company creation form', () => {
      expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Company Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Website (optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Industry')).toBeInTheDocument();
      expect(screen.getByLabelText('Company Size')).toBeInTheDocument();
      expect(screen.getByLabelText('Location')).toBeInTheDocument();
      expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      fireEvent.click(screen.getByTestId('create-company-button'));

      await waitFor(() => {
        expect(screen.getByTestId('company-name-error')).toHaveTextContent('Company name is required');
        expect(screen.getByTestId('company-email-error')).toHaveTextContent('Company email is required');
        expect(screen.getByTestId('industry-error')).toHaveTextContent('Industry is required');
        expect(screen.getByTestId('size-error')).toHaveTextContent('Company size is required');
        expect(screen.getByTestId('location-error')).toHaveTextContent('Location is required');
      });
    });

    it('should validate email format', async () => {
      await userEvent.type(screen.getByLabelText('Company Email'), 'invalid-email');
      fireEvent.click(screen.getByTestId('create-company-button'));

      await waitFor(() => {
        expect(screen.getByTestId('company-email-error')).toHaveTextContent(
          'Please enter a valid email address'
        );
      });
    });

    it('should validate website URL format', async () => {
      await userEvent.type(screen.getByLabelText('Website (optional)'), 'not-a-url');
      fireEvent.blur(screen.getByLabelText('Website (optional)'));

      await waitFor(() => {
        expect(screen.getByTestId('website-error')).toHaveTextContent(
          'Please enter a valid URL'
        );
      });
    });

    it('should check for duplicate companies', async () => {
      mockCreateCompany.mockRejectedValue({ 
        code: 'COMPANY_EXISTS',
        message: 'A company with this name or email already exists',
        existingId: 'existing-123'
      });

      // Fill form
      await userEvent.type(screen.getByLabelText('Company Name'), 'Existing Corp');
      await userEvent.type(screen.getByLabelText('Company Email'), 'info@existing.com');
      await userEvent.selectOptions(screen.getByLabelText('Industry'), 'technology');
      await userEvent.selectOptions(screen.getByLabelText('Company Size'), '10-50');
      await userEvent.type(screen.getByLabelText('Location'), 'Vancouver');

      fireEvent.click(screen.getByTestId('create-company-button'));

      await waitFor(() => {
        expect(screen.getByTestId('duplicate-error')).toHaveTextContent(
          'A company with this name or email already exists'
        );
        expect(screen.getByTestId('join-existing-button')).toBeInTheDocument();
      });
    });

    it('should upload company logo', async () => {
      const logoFile = new File(['logo'], 'logo.png', { type: 'image/png' });
      
      const fileInput = screen.getByLabelText('Company Logo (optional)');
      await userEvent.upload(fileInput, logoFile);

      await waitFor(() => {
        expect(screen.getByTestId('logo-preview')).toBeInTheDocument();
        expect(screen.getByAltText('Company logo preview')).toBeInTheDocument();
      });
    });

    it('should create company successfully', async () => {
      mockCreateCompany.mockResolvedValue({
        id: 'new-123',
        name: 'New Tech Corp',
        status: 'pending_verification',
      });

      // Fill all fields
      await userEvent.type(screen.getByLabelText('Company Name'), 'New Tech Corp');
      await userEvent.type(screen.getByLabelText('Company Email'), 'info@newtechcorp.com');
      await userEvent.type(screen.getByLabelText('Website (optional)'), 'https://newtechcorp.com');
      await userEvent.selectOptions(screen.getByLabelText('Industry'), 'technology');
      await userEvent.selectOptions(screen.getByLabelText('Company Size'), '1-10');
      await userEvent.type(screen.getByLabelText('Location'), 'Vancouver, BC');
      await userEvent.type(
        screen.getByLabelText('Description (optional)'), 
        'Innovative tech startup'
      );

      fireEvent.click(screen.getByTestId('create-company-button'));

      await waitFor(() => {
        expect(mockCreateCompany).toHaveBeenCalledWith({
          name: 'New Tech Corp',
          email: 'info@newtechcorp.com',
          website: 'https://newtechcorp.com',
          industry: 'technology',
          size: '1-10',
          location: 'Vancouver, BC',
          description: 'Innovative tech startup',
          logo: undefined,
        });
        
        expect(mockOnNext).toHaveBeenCalledWith({
          action: 'created',
          companyId: 'new-123',
          companyName: 'New Tech Corp',
          role: 'Founder',
          isAdmin: true,
        });
      });
    });

    it('should show verification notice after creation', async () => {
      mockCreateCompany.mockResolvedValue({
        id: 'new-123',
        name: 'New Tech Corp',
        status: 'pending_verification',
      });

      // Fill minimum required fields
      await userEvent.type(screen.getByLabelText('Company Name'), 'New Tech Corp');
      await userEvent.type(screen.getByLabelText('Company Email'), 'info@newtechcorp.com');
      await userEvent.selectOptions(screen.getByLabelText('Industry'), 'technology');
      await userEvent.selectOptions(screen.getByLabelText('Company Size'), '1-10');
      await userEvent.type(screen.getByLabelText('Location'), 'Vancouver');

      fireEvent.click(screen.getByTestId('create-company-button'));

      await waitFor(() => {
        expect(screen.getByTestId('creation-success')).toHaveTextContent(
          'Company created! Verification email has been sent.'
        );
      });
    });
  });

  describe('Skip Functionality', () => {
    it('should allow skipping without any data', () => {
      renderComponent();

      fireEvent.click(screen.getByTestId('skip-button'));

      expect(mockOnSkip).toHaveBeenCalled();
    });

    it('should confirm before skipping with entered data', async () => {
      renderComponent();

      // Enter some search
      await userEvent.type(screen.getByLabelText('Search Companies'), 'Tech');

      fireEvent.click(screen.getByTestId('skip-button'));

      expect(screen.getByTestId('skip-confirmation')).toHaveTextContent(
        'You can always add company information later from your profile'
      );

      fireEvent.click(screen.getByTestId('confirm-skip-button'));
      expect(mockOnSkip).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading during company search', async () => {
      mockSearchCompanies.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      renderComponent();

      await userEvent.type(screen.getByLabelText('Search Companies'), 'Tech');

      expect(screen.getByTestId('search-loading')).toBeInTheDocument();
    });

    it('should show loading during company creation', async () => {
      mockCreateCompany.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      renderComponent();
      fireEvent.click(screen.getByTestId('create-new-tab'));

      // Fill minimum fields
      await userEvent.type(screen.getByLabelText('Company Name'), 'Test');
      await userEvent.type(screen.getByLabelText('Company Email'), 'test@test.com');
      await userEvent.selectOptions(screen.getByLabelText('Industry'), 'technology');
      await userEvent.selectOptions(screen.getByLabelText('Company Size'), '1-10');
      await userEvent.type(screen.getByLabelText('Location'), 'Test');

      fireEvent.click(screen.getByTestId('create-company-button'));

      expect(screen.getByTestId('create-loading')).toBeInTheDocument();
      expect(screen.getByTestId('create-company-button')).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should handle search errors', async () => {
      mockSearchCompanies.mockRejectedValue(new Error('Network error'));

      renderComponent();

      await userEvent.type(screen.getByLabelText('Search Companies'), 'Tech');

      await waitFor(() => {
        expect(screen.getByTestId('search-error')).toHaveTextContent(
          'Failed to search companies. Please try again.'
        );
      });
    });

    it('should handle join errors', async () => {
      mockSearchCompanies.mockResolvedValue([
        { id: '1', name: 'Tech Corp' }
      ]);
      mockJoinCompany.mockRejectedValue(new Error('Failed to join'));

      renderComponent();

      // Search and select
      await userEvent.type(screen.getByLabelText('Search Companies'), 'Tech');
      await waitFor(() => screen.getByText('Tech Corp'));
      fireEvent.click(screen.getByTestId('select-company-1'));

      // Try to join
      await userEvent.type(screen.getByLabelText('Your Role'), 'Developer');
      fireEvent.click(screen.getByTestId('join-company-button'));

      await waitFor(() => {
        expect(screen.getByTestId('join-error')).toHaveTextContent(
          'Failed to join company. Please try again.'
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderComponent();

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Join Existing/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Create New/i })).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      renderComponent();

      // Tab to search
      await userEvent.tab();
      expect(screen.getByLabelText('Search Companies')).toHaveFocus();

      // Tab to tabs
      await userEvent.tab();
      expect(screen.getByTestId('create-new-tab')).toHaveFocus();
    });

    it('should announce search results', async () => {
      mockSearchCompanies.mockResolvedValue([
        { id: '1', name: 'Company 1' },
        { id: '2', name: 'Company 2' },
      ]);

      renderComponent();

      await userEvent.type(screen.getByLabelText('Search Companies'), 'test');

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('Found 2 companies');
      });
    });
  });
});