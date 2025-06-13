import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CommunityEngagementStep } from '../../../../components/steps/CommunityEngagementStep';
import { getSuggestedGroups, joinGroup } from '@/features/groups/api/groupsApi';

// Mock API
jest.mock('../../../../../../api/groupsApi');
const mockGetSuggestedGroups = getSuggestedGroups as jest.MockedFunction<typeof getSuggestedGroups>;
const mockJoinGroup = joinGroup as jest.MockedFunction<typeof joinGroup>;

describe('CommunityEngagementStep', () => {
  const mockOnNext = jest.fn();
  const mockOnSkip = jest.fn();
  
  const defaultProps = {
    userData: {},
    onNext: mockOnNext,
    onSkip: mockOnSkip,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(<CommunityEngagementStep {...defaultProps} {...props} />);
  };

  describe('Interest Selection', () => {
    it('should display interest categories', () => {
      renderComponent();

      expect(screen.getByText('Select Your Interests')).toBeInTheDocument();
      expect(screen.getByLabelText('React')).toBeInTheDocument();
      expect(screen.getByLabelText('Node.js')).toBeInTheDocument();
      expect(screen.getByLabelText('Python')).toBeInTheDocument();
      expect(screen.getByLabelText('Cloud Computing')).toBeInTheDocument();
      expect(screen.getByLabelText('Machine Learning')).toBeInTheDocument();
    });

    it('should allow selecting multiple interests', async () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('React'));
      fireEvent.click(screen.getByLabelText('Node.js'));
      fireEvent.click(screen.getByLabelText('Cloud Computing'));

      expect(screen.getByLabelText('React')).toBeChecked();
      expect(screen.getByLabelText('Node.js')).toBeChecked();
      expect(screen.getByLabelText('Cloud Computing')).toBeChecked();
    });

    it('should show interest level selector for each interest', async () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('React'));

      await waitFor(() => {
        const reactContainer = screen.getByTestId('interest-React');
        const levelSelect = within(reactContainer).getByLabelText('Interest level');
        expect(levelSelect).toBeInTheDocument();
        expect(levelSelect).toHaveValue('medium');
      });
    });

    it('should update interest levels', async () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('React'));

      const reactContainer = screen.getByTestId('interest-React');
      const levelSelect = within(reactContainer).getByLabelText('Interest level');
      
      await userEvent.selectOptions(levelSelect, 'high');
      expect(levelSelect).toHaveValue('high');
    });

    it('should require at least one interest', async () => {
      renderComponent();

      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(screen.getByTestId('interests-error')).toHaveTextContent(
          'Please select at least one interest'
        );
      });
    });

    it('should limit interests to 10', async () => {
      renderComponent();

      // Try to select more than 10 interests
      const interestCheckboxes = screen.getAllByRole('checkbox', { name: /^(?!.*Mentor).*$/ });
      interestCheckboxes.slice(0, 11).forEach(checkbox => {
        fireEvent.click(checkbox);
      });

      await waitFor(() => {
        expect(screen.getByTestId('interests-error')).toHaveTextContent(
          'Please select up to 10 interests'
        );
      });
    });
  });

  describe('Group Suggestions', () => {
    it('should load suggested groups based on interests', async () => {
      const mockGroups = [
        { 
          id: '1', 
          name: 'React Developers', 
          memberCount: 150,
          description: 'Community for React enthusiasts',
          tags: ['react', 'frontend']
        },
        { 
          id: '2', 
          name: 'Node.js Experts', 
          memberCount: 200,
          description: 'Backend development with Node.js',
          tags: ['nodejs', 'backend']
        },
      ];
      mockGetSuggestedGroups.mockResolvedValue(mockGroups);

      renderComponent();

      // Select interests
      fireEvent.click(screen.getByLabelText('React'));
      fireEvent.click(screen.getByLabelText('Node.js'));

      await waitFor(() => {
        expect(mockGetSuggestedGroups).toHaveBeenCalledWith(['React', 'Node.js']);
        expect(screen.getByText('Suggested Groups')).toBeInTheDocument();
        expect(screen.getByText('React Developers')).toBeInTheDocument();
        expect(screen.getByText('Node.js Experts')).toBeInTheDocument();
      });
    });

    it('should display group details', async () => {
      const mockGroup = {
        id: '1',
        name: 'React Developers',
        memberCount: 150,
        description: 'Community for React enthusiasts',
        tags: ['react', 'frontend'],
        isPublic: true,
      };
      mockGetSuggestedGroups.mockResolvedValue([mockGroup]);

      renderComponent();

      fireEvent.click(screen.getByLabelText('React'));

      await waitFor(() => {
        const groupCard = screen.getByTestId('group-card-1');
        expect(within(groupCard).getByText('React Developers')).toBeInTheDocument();
        expect(within(groupCard).getByText('150 members')).toBeInTheDocument();
        expect(within(groupCard).getByText('Community for React enthusiasts')).toBeInTheDocument();
        expect(within(groupCard).getByText('react')).toBeInTheDocument();
        expect(within(groupCard).getByText('frontend')).toBeInTheDocument();
      });
    });

    it('should allow joining multiple groups', async () => {
      const mockGroups = [
        { id: '1', name: 'React Developers', memberCount: 150 },
        { id: '2', name: 'Node.js Experts', memberCount: 200 },
      ];
      mockGetSuggestedGroups.mockResolvedValue(mockGroups);
      mockJoinGroup.mockResolvedValue({ success: true });

      renderComponent();

      fireEvent.click(screen.getByLabelText('React'));

      await waitFor(() => {
        expect(screen.getByText('React Developers')).toBeInTheDocument();
      });

      // Join first group
      fireEvent.click(screen.getByTestId('join-group-1'));

      await waitFor(() => {
        expect(mockJoinGroup).toHaveBeenCalledWith('1');
        expect(screen.getByTestId('group-1-joined')).toHaveTextContent('Joined');
      });

      // Join second group
      fireEvent.click(screen.getByTestId('join-group-2'));

      await waitFor(() => {
        expect(mockJoinGroup).toHaveBeenCalledWith('2');
        expect(screen.getByTestId('group-2-joined')).toHaveTextContent('Joined');
      });
    });

    it('should handle join errors gracefully', async () => {
      mockGetSuggestedGroups.mockResolvedValue([
        { id: '1', name: 'React Developers' }
      ]);
      mockJoinGroup.mockRejectedValue(new Error('Failed to join'));

      renderComponent();

      fireEvent.click(screen.getByLabelText('React'));

      await waitFor(() => screen.getByText('React Developers'));

      fireEvent.click(screen.getByTestId('join-group-1'));

      await waitFor(() => {
        expect(screen.getByTestId('group-1-error')).toHaveTextContent(
          'Failed to join group'
        );
      });
    });

    it('should show private group indicators', async () => {
      mockGetSuggestedGroups.mockResolvedValue([
        { id: '1', name: 'Private React Group', isPublic: false, requiresApproval: true }
      ]);

      renderComponent();

      fireEvent.click(screen.getByLabelText('React'));

      await waitFor(() => {
        const groupCard = screen.getByTestId('group-card-1');
        expect(within(groupCard).getByTestId('private-badge')).toHaveTextContent('Private');
        expect(within(groupCard).getByTestId('approval-notice')).toHaveTextContent(
          'Requires approval'
        );
      });
    });
  });

  describe('Mentorship Preferences', () => {
    it('should display mentorship options', () => {
      renderComponent();

      expect(screen.getByText('Mentorship')).toBeInTheDocument();
      expect(screen.getByLabelText('Available as Mentor')).toBeInTheDocument();
      expect(screen.getByLabelText('Looking for a Mentor')).toBeInTheDocument();
    });

    it('should allow selecting mentor role', async () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('Available as Mentor'));

      expect(screen.getByLabelText('Available as Mentor')).toBeChecked();
      expect(screen.getByLabelText('Mentoring Areas')).toBeInTheDocument();
      expect(screen.getByLabelText('Mentoring Availability')).toBeInTheDocument();
    });

    it('should allow selecting mentee role', async () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('Looking for a Mentor'));

      expect(screen.getByLabelText('Looking for a Mentor')).toBeChecked();
      expect(screen.getByLabelText('Areas for Mentorship')).toBeInTheDocument();
      expect(screen.getByLabelText('Mentorship Goals')).toBeInTheDocument();
    });

    it('should allow selecting both mentor and mentee', () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('Available as Mentor'));
      fireEvent.click(screen.getByLabelText('Looking for a Mentor'));

      expect(screen.getByLabelText('Available as Mentor')).toBeChecked();
      expect(screen.getByLabelText('Looking for a Mentor')).toBeChecked();
    });

    it('should validate mentoring areas when mentor is selected', async () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('Available as Mentor'));
      
      // Select an interest
      fireEvent.click(screen.getByLabelText('React'));
      
      // Try to submit without filling mentoring areas
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(screen.getByTestId('mentoring-areas-error')).toHaveTextContent(
          'Please specify your mentoring areas'
        );
      });
    });
  });

  describe('Networking Preferences', () => {
    it('should display networking options', () => {
      renderComponent();

      expect(screen.getByLabelText('Open to Networking')).toBeInTheDocument();
    });

    it('should show networking preferences when enabled', async () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('Open to Networking'));

      expect(screen.getByLabelText('Networking Interests')).toBeInTheDocument();
      expect(screen.getByLabelText('Preferred Meeting Types')).toBeInTheDocument();
      
      // Check meeting type options
      expect(screen.getByLabelText('Coffee Chats')).toBeInTheDocument();
      expect(screen.getByLabelText('Virtual Meetings')).toBeInTheDocument();
      expect(screen.getByLabelText('Group Events')).toBeInTheDocument();
    });

    it('should allow selecting multiple meeting types', () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('Open to Networking'));
      
      fireEvent.click(screen.getByLabelText('Coffee Chats'));
      fireEvent.click(screen.getByLabelText('Virtual Meetings'));

      expect(screen.getByLabelText('Coffee Chats')).toBeChecked();
      expect(screen.getByLabelText('Virtual Meetings')).toBeChecked();
    });
  });

  describe('Volunteering Preferences', () => {
    it('should display volunteering option', () => {
      renderComponent();

      expect(screen.getByLabelText('Interested in Volunteering')).toBeInTheDocument();
    });

    it('should show volunteering areas when enabled', async () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('Interested in Volunteering'));

      expect(screen.getByText('Volunteering Areas')).toBeInTheDocument();
      expect(screen.getByLabelText('Event Organization')).toBeInTheDocument();
      expect(screen.getByLabelText('Community Outreach')).toBeInTheDocument();
      expect(screen.getByLabelText('Technical Support')).toBeInTheDocument();
      expect(screen.getByLabelText('Content Creation')).toBeInTheDocument();
    });

    it('should show availability options', async () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('Interested in Volunteering'));

      expect(screen.getByLabelText('Volunteering Availability')).toBeInTheDocument();
      const availabilitySelect = screen.getByLabelText('Volunteering Availability');
      
      expect(within(availabilitySelect).getByText('Weekends only')).toBeInTheDocument();
      expect(within(availabilitySelect).getByText('Evenings')).toBeInTheDocument();
      expect(within(availabilitySelect).getByText('Flexible')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit all preferences', async () => {
      mockGetSuggestedGroups.mockResolvedValue([
        { id: '1', name: 'React Group' }
      ]);
      mockJoinGroup.mockResolvedValue({ success: true });

      renderComponent();

      // Select interests
      fireEvent.click(screen.getByLabelText('React'));
      fireEvent.click(screen.getByLabelText('Node.js'));

      // Set interest levels
      const reactContainer = screen.getByTestId('interest-React');
      await userEvent.selectOptions(
        within(reactContainer).getByLabelText('Interest level'), 
        'high'
      );

      // Join a group
      await waitFor(() => screen.getByText('React Group'));
      fireEvent.click(screen.getByTestId('join-group-1'));

      // Set mentorship
      fireEvent.click(screen.getByLabelText('Available as Mentor'));
      await userEvent.type(
        screen.getByLabelText('Mentoring Areas'), 
        'React, Frontend Development'
      );

      // Set networking
      fireEvent.click(screen.getByLabelText('Open to Networking'));
      fireEvent.click(screen.getByLabelText('Coffee Chats'));

      // Set volunteering
      fireEvent.click(screen.getByLabelText('Interested in Volunteering'));
      fireEvent.click(screen.getByLabelText('Event Organization'));

      // Submit
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalledWith({
          interests: [
            { name: 'React', level: 'high' },
            { name: 'Node.js', level: 'medium' }
          ],
          joinedGroups: ['1'],
          mentorshipAvailableAs: 'mentor',
          mentoringAreas: 'React, Frontend Development',
          networkingAvailable: true,
          networkingInterests: '',
          meetingTypes: ['coffee_chats'],
          volunteeringInterested: true,
          volunteeringAreas: ['event_organization'],
          volunteeringAvailability: '',
        });
      });
    });

    it('should show summary before submission', async () => {
      renderComponent();

      // Make selections
      fireEvent.click(screen.getByLabelText('React'));
      fireEvent.click(screen.getByLabelText('Available as Mentor'));
      fireEvent.click(screen.getByLabelText('Open to Networking'));

      // Should show summary
      expect(screen.getByTestId('engagement-summary')).toHaveTextContent('1 interest selected');
      expect(screen.getByTestId('engagement-summary')).toHaveTextContent('Available as mentor');
      expect(screen.getByTestId('engagement-summary')).toHaveTextContent('Open to networking');
    });
  });

  describe('Skip Functionality', () => {
    it('should allow skipping', () => {
      renderComponent();

      fireEvent.click(screen.getByTestId('skip-button'));

      expect(mockOnSkip).toHaveBeenCalled();
    });

    it('should show benefits of completing when hovering skip', async () => {
      renderComponent();

      await userEvent.hover(screen.getByTestId('skip-button'));

      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'Completing this step helps us suggest relevant groups and connections'
      );
    });
  });

  describe('Pre-filled Data', () => {
    it('should populate with existing preferences', () => {
      const existingData = {
        interests: [
          { name: 'React', level: 'high' },
          { name: 'Python', level: 'medium' }
        ],
        mentorshipAvailableAs: 'both',
        networkingAvailable: true,
        meetingTypes: ['coffee_chats', 'virtual'],
        volunteeringInterested: true,
        volunteeringAreas: ['event_organization'],
      };

      renderComponent({ userData: existingData });

      // Check interests
      expect(screen.getByLabelText('React')).toBeChecked();
      expect(screen.getByLabelText('Python')).toBeChecked();

      // Check mentorship
      expect(screen.getByLabelText('Available as Mentor')).toBeChecked();
      expect(screen.getByLabelText('Looking for a Mentor')).toBeChecked();

      // Check networking
      expect(screen.getByLabelText('Open to Networking')).toBeChecked();
      expect(screen.getByLabelText('Coffee Chats')).toBeChecked();
      expect(screen.getByLabelText('Virtual Meetings')).toBeChecked();

      // Check volunteering
      expect(screen.getByLabelText('Interested in Volunteering')).toBeChecked();
      expect(screen.getByLabelText('Event Organization')).toBeChecked();
    });
  });

  describe('Loading States', () => {
    it('should show loading while fetching groups', async () => {
      mockGetSuggestedGroups.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      renderComponent();

      fireEvent.click(screen.getByLabelText('React'));

      expect(screen.getByTestId('groups-loading')).toBeInTheDocument();
    });

    it('should show loading while joining group', async () => {
      mockGetSuggestedGroups.mockResolvedValue([
        { id: '1', name: 'React Group' }
      ]);
      mockJoinGroup.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      renderComponent();

      fireEvent.click(screen.getByLabelText('React'));
      
      await waitFor(() => screen.getByText('React Group'));

      fireEvent.click(screen.getByTestId('join-group-1'));

      expect(screen.getByTestId('join-loading-1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper sections with headings', () => {
      renderComponent();

      expect(screen.getByRole('heading', { name: 'Select Your Interests' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Mentorship' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Networking' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Volunteering' })).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      renderComponent();

      await userEvent.tab();
      expect(screen.getAllByRole('checkbox')[0]).toHaveFocus();
    });

    it('should announce group suggestions', async () => {
      mockGetSuggestedGroups.mockResolvedValue([
        { id: '1', name: 'Group 1' },
        { id: '2', name: 'Group 2' },
      ]);

      renderComponent();

      fireEvent.click(screen.getByLabelText('React'));

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(
          '2 groups suggested based on your interests'
        );
      });
    });
  });
});