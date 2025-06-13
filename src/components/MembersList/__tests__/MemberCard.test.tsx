import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MemberCard from '@/features/directory/components/MembersList/MemberCard';
import { Member } from '@/features/directory/components/MembersList/types';

// Mock member data
const mockMember: Member = {
  id: '1',
  name: 'Jane Doe',
  title: 'Senior Software Engineer',
  image: 'https://example.com/jane.jpg',
  intro: 'Passionate about creating elegant solutions to complex problems',
  company: 'Tech Innovations Inc.',
  location: 'Kelowna, BC',
  skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'GraphQL'],
  email: 'jane.doe@example.com'
};

describe('MemberCard Component', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, { wrapper: BrowserRouter });
  };

  it('MC-001: should render member information correctly', () => {
    renderWithRouter(<MemberCard member={mockMember} />);
    
    // Check if member name is displayed
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    
    // Check if member title is displayed
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    
    // Check if member intro is displayed
    expect(screen.getByText(/"Passionate about creating elegant solutions to complex problems"/)).toBeInTheDocument();
    
    // Check if company is displayed
    expect(screen.getByText('Tech Innovations Inc.')).toBeInTheDocument();
    
    // Check if location is displayed
    expect(screen.getByText('Kelowna, BC')).toBeInTheDocument();
  });

  it('MC-002: should render member profile image', () => {
    renderWithRouter(<MemberCard member={mockMember} />);
    
    // Check if profile image is rendered
    const profileImage = screen.getByAltText('Jane Doe');
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute('src', 'https://example.com/jane.jpg');
  });

  it('MC-003: should link to the member detail page', () => {
    renderWithRouter(<MemberCard member={mockMember} />);
    
    // Check if the card links to the correct member detail page
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/directory/1');
  });

  it('MC-004: should display skills with proper formatting', () => {
    renderWithRouter(<MemberCard member={mockMember} />);
    
    // Check if the first 3 skills are displayed
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    
    // Check if the "+2 more" tag is displayed for additional skills
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('MC-005: should handle members with fewer than 3 skills', () => {
    const memberWithFewerSkills = {
      ...mockMember,
      skills: ['JavaScript', 'React']
    };
    
    renderWithRouter(<MemberCard member={memberWithFewerSkills} />);
    
    // Check if both skills are displayed
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    
    // Check that the "+X more" tag is not displayed
    expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
  });

  it('MC-006: should handle members without optional fields', () => {
    const memberWithoutOptionalFields = {
      id: '2',
      name: 'John Smith',
      title: 'UX Designer',
      image: 'https://example.com/john.jpg',
      email: 'john.smith@example.com',
      skills: []
    };
    
    renderWithRouter(<MemberCard member={memberWithoutOptionalFields} />);
    
    // Check if required fields are displayed
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('UX Designer')).toBeInTheDocument();
    
    // Check that optional fields are not displayed
    expect(screen.queryByText(/Tech Innovations Inc./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Kelowna, BC/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Passionate about/)).not.toBeInTheDocument();
  });
});
