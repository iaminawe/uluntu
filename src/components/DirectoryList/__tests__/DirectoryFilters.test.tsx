// Testing imports
import { render, screen, fireEvent, act } from '@testing-library/react';
import DirectoryFilters from '@/features/directory/components/DirectoryList/DirectoryFilters';
import { FilterOptions } from '@/features/directory/components/DirectoryList/types';

// Mock the utils module
jest.mock('@/features/directory/components/DirectoryList/utils', () => ({
  getSkillColor: jest.fn(() => 'bg-blue-100 text-blue-800')
}));

describe('DirectoryFilters Component', () => {
  const mockSetFilters = jest.fn();
  const availableSkills = ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Python'];
  
  const defaultFilters: FilterOptions = {
    search: '',
    skills: []
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('DF-001: renders search input and skill filters', () => {
    render(
      <DirectoryFilters 
        filters={defaultFilters} 
        setFilters={mockSetFilters} 
        availableSkills={availableSkills}
      />
    );
    
    // Check if search input is rendered
    const searchInput = screen.getByPlaceholderText('Search by name, title, company, or location...');
    expect(searchInput).toBeInTheDocument();
    
    // Check if skill filters are rendered
    availableSkills.forEach(skill => {
      expect(screen.getByText(skill)).toBeInTheDocument();
    });
    
    // Reset filters button should not be visible initially
    expect(screen.queryByText('Reset Filters')).not.toBeInTheDocument();
  });
  
  test('DF-002: updates search filter with debounce when typing in search input', () => {
    render(
      <DirectoryFilters 
        filters={defaultFilters} 
        setFilters={mockSetFilters} 
        availableSkills={availableSkills}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search by name, title, company, or location...');
    fireEvent.change(searchInput, { target: { value: 'developer' } });
    
    // Before debounce timeout, setFilters should not be called
    expect(mockSetFilters).not.toHaveBeenCalled();
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // After debounce timeout, setFilters should be called
    expect(mockSetFilters).toHaveBeenCalled();
  });
  
  test('DF-003: shows clear button when search has value and clears search when clicked', () => {
    render(
      <DirectoryFilters 
        filters={{ ...defaultFilters, search: 'developer' }} 
        setFilters={mockSetFilters} 
        availableSkills={availableSkills}
      />
    );
    
    // Clear button should be visible
    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();
    
    // Click clear button
    fireEvent.click(clearButton);
    
    // Input should be cleared
    const searchInput = screen.getByPlaceholderText('Search by name, title, company, or location...');
    expect(searchInput).toHaveValue('');
    
    // setFilters should be called
    expect(mockSetFilters).toHaveBeenCalled();
  });
  
  test('DF-004: calls setFilters when clicking on a skill button', () => {
    render(
      <DirectoryFilters 
        filters={defaultFilters} 
        setFilters={mockSetFilters} 
        availableSkills={availableSkills}
      />
    );
    
    // Click on a skill button
    const skillButton = screen.getByText('React');
    fireEvent.click(skillButton);
    
    // Verify setFilters was called
    expect(mockSetFilters).toHaveBeenCalled();
  });
  
  test('DF-005: shows reset filters button when filters are applied and resets all filters when clicked', () => {
    const filtersWithValues = {
      search: 'developer',
      skills: ['React', 'JavaScript']
    };
    
    render(
      <DirectoryFilters 
        filters={filtersWithValues} 
        setFilters={mockSetFilters} 
        availableSkills={availableSkills}
      />
    );
    
    // Reset filters button should be visible
    const resetButton = screen.getByText('Reset Filters');
    expect(resetButton).toBeInTheDocument();
    
    // Click reset button
    fireEvent.click(resetButton);
    
    // setFilters should be called with empty filters
    expect(mockSetFilters).toHaveBeenCalledWith({ search: '', skills: [] });
  });
  
  test('DF-006: applies correct styling to selected skill filters', () => {
    const filtersWithSkills = {
      search: '',
      skills: ['React']
    };
    
    render(
      <DirectoryFilters 
        filters={filtersWithSkills} 
        setFilters={mockSetFilters} 
        availableSkills={availableSkills}
      />
    );
    
    // The React button should have the selected class (bg-orange-500)
    const reactButton = screen.getByText('React');
    expect(reactButton.className).toContain('bg-orange-500');
    
    // Other buttons should not have the selected class
    const jsButton = screen.getByText('JavaScript');
    expect(jsButton.className).not.toContain('bg-orange-500');
    expect(jsButton.className).toContain('bg-blue-100'); // From our mocked getSkillColor
  });
  
  test('DF-007: does not display skills section when no skills are available', () => {
    render(
      <DirectoryFilters 
        filters={defaultFilters} 
        setFilters={mockSetFilters} 
        availableSkills={[]}
      />
    );
    
    // Search input should be rendered
    expect(screen.getByPlaceholderText('Search by name, title, company, or location...')).toBeInTheDocument();
    
    // Skills section should not be rendered
    expect(screen.queryByText('Filter by Skills')).not.toBeInTheDocument();
  });
});
