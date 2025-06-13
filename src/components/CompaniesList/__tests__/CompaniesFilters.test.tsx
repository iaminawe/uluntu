// No need to import React with modern JSX transform
import { render, screen, fireEvent } from '@testing-library/react';
import CompaniesFilters from '@/features/companies/components/CompaniesList/CompaniesFilters';
import { FilterOptions } from '@/features/companies/components/CompaniesList/types';

describe('CompaniesFilters Component', () => {
  // Mock filter options and setter function
  const mockFilters: FilterOptions = {
    search: '',
    industries: []
  };
  const mockSetFilters = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render industry filter options correctly', () => {
    render(<CompaniesFilters filters={mockFilters} setFilters={mockSetFilters} />);
    
    // Check if the filter title is displayed
    expect(screen.getByText(/Filter by industry:/i)).toBeInTheDocument();
    
    // Check if industry options are rendered
    expect(screen.getByText('Software Development')).toBeInTheDocument();
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Data Science')).toBeInTheDocument();
  });

  it('should not show clear filters button when no filters are selected', () => {
    render(<CompaniesFilters filters={mockFilters} setFilters={mockSetFilters} />);
    
    // Clear Filters button should not be visible
    expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
  });

  it('should show clear filters button when filters are selected', () => {
    const filtersWithSelection: FilterOptions = {
      search: '',
      industries: ['Software Development', 'Web Development']
    };
    
    render(<CompaniesFilters filters={filtersWithSelection} setFilters={mockSetFilters} />);
    
    // Clear Filters button should be visible
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('should toggle industry selection when clicked', () => {
    render(<CompaniesFilters filters={mockFilters} setFilters={mockSetFilters} />);
    
    // Click on the Software Development filter
    fireEvent.click(screen.getByText('Software Development'));
    
    // Check if setFilters was called with the correct arguments
    expect(mockSetFilters).toHaveBeenCalledTimes(1);
    // Verify the callback function behavior by executing it
    const callback = mockSetFilters.mock.calls[0][0];
    const result = callback(mockFilters);
    expect(result).toEqual({
      search: '',
      industries: ['Software Development']
    });
  });

  it('should remove industry when clicked if already selected', () => {
    const filtersWithSelection: FilterOptions = {
      search: '',
      industries: ['Software Development', 'Web Development']
    };
    
    render(<CompaniesFilters filters={filtersWithSelection} setFilters={mockSetFilters} />);
    
    // Click on the already selected Software Development filter
    fireEvent.click(screen.getByText('Software Development'));
    
    // Check if setFilters was called with the correct arguments
    expect(mockSetFilters).toHaveBeenCalledTimes(1);
    // Verify the callback function behavior by executing it
    const callback = mockSetFilters.mock.calls[0][0];
    const result = callback(filtersWithSelection);
    expect(result).toEqual({
      search: '',
      industries: ['Web Development']
    });
  });

  it('should clear all filters when clear filters button is clicked', () => {
    const filtersWithSelection: FilterOptions = {
      search: '',
      industries: ['Software Development', 'Web Development']
    };
    
    render(<CompaniesFilters filters={filtersWithSelection} setFilters={mockSetFilters} />);
    
    // Click on the Clear Filters button
    fireEvent.click(screen.getByText('Clear Filters'));
    
    // Check if setFilters was called with the correct arguments
    expect(mockSetFilters).toHaveBeenCalledTimes(1);
    // Verify the callback function behavior by executing it
    const callback = mockSetFilters.mock.calls[0][0];
    const result = callback(filtersWithSelection);
    expect(result).toEqual({
      search: '',
      industries: []
    });
  });

  it('should apply correct styling to selected industry filters', () => {
    const filtersWithSelection: FilterOptions = {
      search: '',
      industries: ['Software Development']
    };
    
    render(<CompaniesFilters filters={filtersWithSelection} setFilters={mockSetFilters} />);
    
    // Get all industry filter buttons
    const softwareDevButton = screen.getByText('Software Development');
    const webDevButton = screen.getByText('Web Development');
    
    // Check if the selected filter has the correct styling class
    expect(softwareDevButton.className).toContain('bg-orange-500');
    expect(softwareDevButton.className).toContain('text-white');
    
    // Check if the unselected filter has the default styling class
    expect(webDevButton.className).toContain('bg-slate-100');
    expect(webDevButton.className).not.toContain('bg-orange-500');
  });
});
