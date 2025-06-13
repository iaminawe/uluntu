// Testing imports
import { render, screen, fireEvent } from '@testing-library/react';
import MembersFilter from '../MembersFilter';
import { FilterOptions, SKILL_OPTIONS } from '../types';

describe('MembersFilter Component', () => {
  const mockSetFilters = jest.fn();
  const mockClearFilters = jest.fn();
  
  const defaultFilters: FilterOptions = {
    search: '',
    skills: []
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('MF-001: renders search input and skill filters', () => {
    render(
      <MembersFilter 
        filters={defaultFilters} 
        setFilters={mockSetFilters} 
        clearFilters={mockClearFilters} 
      />
    );
    
    // Check if search input is rendered
    const searchInput = screen.getByPlaceholderText('Search members by name, title, or company...');
    expect(searchInput).toBeInTheDocument();
    
    // Check if skill filters are rendered
    SKILL_OPTIONS.forEach(skill => {
      expect(screen.getByText(skill)).toBeInTheDocument();
    });
  });
  
  test('MF-002: calls setFilters when typing in search input', () => {
    render(
      <MembersFilter 
        filters={defaultFilters} 
        setFilters={mockSetFilters} 
        clearFilters={mockClearFilters} 
      />
    );
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText('Search members by name, title, or company...');
    
    // Simulate typing in the search input
    fireEvent.change(searchInput, { target: { value: 'developer' } });
    
    // Verify setFilters was called
    expect(mockSetFilters).toHaveBeenCalled();
  });
  
  test('MF-003: calls setFilters when clicking on a skill button', () => {
    render(
      <MembersFilter 
        filters={defaultFilters} 
        setFilters={mockSetFilters} 
        clearFilters={mockClearFilters} 
      />
    );
    
    // Click on a skill button
    const skillButton = screen.getByText('JavaScript');
    fireEvent.click(skillButton);
    
    // Verify setFilters was called
    expect(mockSetFilters).toHaveBeenCalled();
  });
  
  test('MF-004: shows and hides clear filters button appropriately', () => {
    // Render with empty filters first
    const { rerender } = render(
      <MembersFilter 
        filters={defaultFilters} 
        setFilters={mockSetFilters} 
        clearFilters={mockClearFilters} 
      />
    );
    
    // Clear button should not be visible
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    
    // Rerender with search filter
    rerender(
      <MembersFilter 
        filters={{ search: 'developer', skills: [] }} 
        setFilters={mockSetFilters} 
        clearFilters={mockClearFilters} 
      />
    );
    
    // Clear button should be visible
    expect(screen.getByText('Clear All')).toBeInTheDocument();
    
    // Click clear button
    fireEvent.click(screen.getByText('Clear All'));
    expect(mockClearFilters).toHaveBeenCalledTimes(1);
  });
  
  test('MF-005: applies correct styling to selected skill filters', () => {
    // Render with a selected skill
    render(
      <MembersFilter 
        filters={{ search: '', skills: ['JavaScript'] }} 
        setFilters={mockSetFilters} 
        clearFilters={mockClearFilters} 
      />
    );
    
    // The JavaScript button should have the selected class (bg-orange-500)
    const jsButton = screen.getByText('JavaScript');
    expect(jsButton.className).toContain('bg-orange-500');
    
    // Other buttons should not have the selected class
    const reactButton = screen.getByText('React');
    expect(reactButton.className).not.toContain('bg-orange-500');
    expect(reactButton.className).toContain('bg-slate-100');
  });
});
