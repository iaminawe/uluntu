import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CompanyCard from '@/features/companies/components/CompaniesList/CompanyCard';
import { Company } from '@/features/companies/components/CompaniesList/types';

// Mock company data
const mockCompany: Company = {
  id: '1',
  name: 'Acme Corporation',
  description: 'A global leader in technology solutions providing innovative products and services.',
  logo: 'https://example.com/logo.png',
  location: 'Vancouver, BC',
  industry: ['Technology', 'Software', 'Cloud Computing'],
  employees: ['emp1', 'emp2', 'emp3', 'emp4', 'emp5'],  // Array of employee IDs
  size: '100-500 employees',
  website: 'https://example.com',
  coverImage: 'https://example.com/cover.jpg',
  founded: '2010' // Adding the required founded property
};

describe('CompanyCard Component', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, { wrapper: BrowserRouter });
  };

  it('should render company information correctly', () => {
    renderWithRouter(<CompanyCard company={mockCompany} />);
    
    // Check if company name is displayed
    expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    
    // Check if company size is displayed
    expect(screen.getByText('100-500 employees')).toBeInTheDocument();
    
    // Check if company location is displayed
    expect(screen.getByText('Vancouver, BC')).toBeInTheDocument();
    
    // Check if company description is displayed (might be truncated)
    expect(screen.getByText(/A global leader in technology solutions/)).toBeInTheDocument();
    
    // Check if industry tags are displayed
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Software')).toBeInTheDocument();
    expect(screen.getByText('Cloud Computing')).toBeInTheDocument();
  });

  it('should render company logo and cover image', () => {
    renderWithRouter(<CompanyCard company={mockCompany} />);
    
    // Check if logo is rendered
    const logo = screen.getByAltText('Acme Corporation logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
    
    // Check if cover image is rendered
    const coverImage = screen.getByAltText('Acme Corporation cover');
    expect(coverImage).toBeInTheDocument();
    expect(coverImage).toHaveAttribute('src', 'https://example.com/cover.jpg');
  });

  it('should link to the company detail page', () => {
    renderWithRouter(<CompanyCard company={mockCompany} />);
    
    // Check if the card links to the correct company detail page
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/companies/1');
  });

  it('should handle missing cover image by using default image', () => {
    const companyWithoutCover = { ...mockCompany, coverImage: undefined };
    renderWithRouter(<CompanyCard company={companyWithoutCover} />);
    
    // Check if default cover image is used
    const coverImage = screen.getByAltText('Acme Corporation cover');
    expect(coverImage).toBeInTheDocument();
    expect(coverImage).not.toHaveAttribute('src', 'https://example.com/cover.jpg');
    // The default image URL should be present
    expect(coverImage.getAttribute('src')).toContain('pexels-photo');
  });

  it('should display employee count in formatted way', () => {
    renderWithRouter(<CompanyCard company={mockCompany} />);
    
    // Check if employee count is displayed properly
    const employeeCount = screen.getByText('5 team members');
    expect(employeeCount).toBeInTheDocument();
  });

  it('should handle companies with more than 3 industry tags', () => {
    const companyWithManyIndustries = {
      ...mockCompany,
      industry: ['Technology', 'Software', 'Cloud Computing', 'AI', 'IoT']
    };
    
    renderWithRouter(<CompanyCard company={companyWithManyIndustries} />);
    
    // Check if the first 3 industry tags are displayed
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Software')).toBeInTheDocument();
    expect(screen.getByText('Cloud Computing')).toBeInTheDocument();
    
    // Check if the "+2 more" tag is displayed
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });
});
