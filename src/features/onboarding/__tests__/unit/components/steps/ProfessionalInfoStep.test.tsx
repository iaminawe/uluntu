import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ProfessionalInfoStep } from '../../../../components/steps/ProfessionalInfoStep';

describe('ProfessionalInfoStep', () => {
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
    return render(<ProfessionalInfoStep {...defaultProps} {...props} />);
  };

  describe('Bio Editor', () => {
    it('should allow entering and formatting bio text', async () => {
      renderComponent();

      const bioEditor = screen.getByLabelText('Bio');
      await userEvent.type(bioEditor, 'I am an experienced developer with expertise in React and Node.js.');

      expect(bioEditor).toHaveValue('I am an experienced developer with expertise in React and Node.js.');
    });

    it('should sanitize HTML input', async () => {
      renderComponent();

      // When: User enters HTML with script tag
      const bioEditor = screen.getByLabelText('Bio');
      fireEvent.change(bioEditor, {
        target: { value: 'Hello <script>alert("xss")</script> World' }
      });

      // Fill other required fields
      await userEvent.selectOptions(screen.getByLabelText('Employment Status'), 'employed');
      
      fireEvent.click(screen.getByTestId('next-button'));

      // Then: Should sanitize the input
      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalledWith(
          expect.objectContaining({
            bio: 'Hello  World' // Script tag removed
          })
        );
      });
    });

    it('should enforce maximum bio length', async () => {
      renderComponent();

      const longBio = 'A'.repeat(1001);
      const bioEditor = screen.getByLabelText('Bio');
      await userEvent.type(bioEditor, longBio);

      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(screen.getByTestId('bio-error')).toHaveTextContent(
          'Bio must be less than 1000 characters'
        );
      });
    });

    it('should show character count', async () => {
      renderComponent();

      const bioEditor = screen.getByLabelText('Bio');
      await userEvent.type(bioEditor, 'Test bio content');

      expect(screen.getByTestId('bio-char-count')).toHaveTextContent('16 / 1000');
    });
  });

  describe('Skills Selection', () => {
    it('should allow adding multiple skills', async () => {
      renderComponent();

      const skillsInput = screen.getByLabelText('Skills');
      
      // Add first skill
      await userEvent.type(skillsInput, 'React');
      fireEvent.click(screen.getByTestId('add-skill-button'));

      // Add second skill
      await userEvent.clear(skillsInput);
      await userEvent.type(skillsInput, 'TypeScript');
      fireEvent.click(screen.getByTestId('add-skill-button'));

      // Then: Should display selected skills
      const skillTags = screen.getAllByTestId('skill-tag');
      expect(skillTags).toHaveLength(2);
      expect(skillTags[0]).toHaveTextContent('React');
      expect(skillTags[1]).toHaveTextContent('TypeScript');
    });

    it('should limit skills to 20', async () => {
      // Given: User has added 20 skills
      const existingSkills = Array.from({ length: 20 }, (_, i) => ({
        name: `Skill ${i}`,
        level: 'intermediate'
      }));
      
      renderComponent({
        userData: { skills: existingSkills }
      });

      // When: User tries to add 21st skill
      const skillsInput = screen.getByLabelText('Skills');
      await userEvent.type(skillsInput, 'Extra Skill');
      fireEvent.click(screen.getByTestId('add-skill-button'));

      // Then: Should show error
      await waitFor(() => {
        expect(screen.getByTestId('skills-error')).toHaveTextContent(
          'Maximum 20 skills allowed'
        );
      });
    });

    it('should allow removing skills', async () => {
      renderComponent({
        userData: {
          skills: [
            { name: 'React', level: 'expert' },
            { name: 'Node.js', level: 'intermediate' }
          ]
        }
      });

      // Remove first skill
      const firstSkillTag = screen.getByTestId('skill-tag-React');
      const removeButton = within(firstSkillTag).getByTestId('remove-skill-button');
      fireEvent.click(removeButton);

      // Should only have one skill left
      expect(screen.getAllByTestId(/^skill-tag-/)).toHaveLength(1);
      expect(screen.getByTestId('skill-tag-Node.js')).toBeInTheDocument();
    });

    it('should prevent duplicate skills', async () => {
      renderComponent({
        userData: {
          skills: [{ name: 'React', level: 'expert' }]
        }
      });

      // Try to add duplicate skill
      const skillsInput = screen.getByLabelText('Skills');
      await userEvent.type(skillsInput, 'React');
      fireEvent.click(screen.getByTestId('add-skill-button'));

      await waitFor(() => {
        expect(screen.getByTestId('skills-error')).toHaveTextContent(
          'This skill has already been added'
        );
      });
    });

    it('should allow setting skill levels', async () => {
      renderComponent();

      // Add skill
      const skillsInput = screen.getByLabelText('Skills');
      await userEvent.type(skillsInput, 'JavaScript');
      fireEvent.click(screen.getByTestId('add-skill-button'));

      // Set skill level
      const skillTag = screen.getByTestId('skill-tag-JavaScript');
      const levelSelect = within(skillTag).getByLabelText('Skill level');
      await userEvent.selectOptions(levelSelect, 'expert');

      // Submit form
      await userEvent.selectOptions(screen.getByLabelText('Employment Status'), 'employed');
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalledWith(
          expect.objectContaining({
            skills: [{ name: 'JavaScript', level: 'expert' }]
          })
        );
      });
    });
  });

  describe('Employment Status', () => {
    it('should require employment status selection', async () => {
      renderComponent();

      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(screen.getByTestId('employment-status-error')).toHaveTextContent(
          'Please select your employment status'
        );
      });
    });

    it('should show relevant fields based on employment status', async () => {
      renderComponent();

      // Select "seeking"
      await userEvent.selectOptions(screen.getByLabelText('Employment Status'), 'seeking');

      // Should show job preferences
      expect(screen.getByLabelText('Preferred Job Types')).toBeInTheDocument();
      expect(screen.getByLabelText('Available to Start')).toBeInTheDocument();

      // Select "employed"
      await userEvent.selectOptions(screen.getByLabelText('Employment Status'), 'employed');

      // Should show current company field
      expect(screen.getByLabelText('Current Company (optional)')).toBeInTheDocument();
      expect(screen.queryByLabelText('Preferred Job Types')).not.toBeInTheDocument();
    });
  });

  describe('Years of Experience', () => {
    it('should allow selecting experience range', async () => {
      renderComponent();

      const experienceSlider = screen.getByLabelText('Years of Experience');
      fireEvent.change(experienceSlider, { target: { value: '5' } });

      expect(screen.getByTestId('experience-display')).toHaveTextContent('5 years');
    });

    it('should handle 20+ years experience', async () => {
      renderComponent();

      const experienceSlider = screen.getByLabelText('Years of Experience');
      fireEvent.change(experienceSlider, { target: { value: '20' } });

      expect(screen.getByTestId('experience-display')).toHaveTextContent('20+ years');
    });
  });

  describe('Areas of Expertise', () => {
    it('should allow selecting multiple areas', async () => {
      renderComponent();

      // Select areas
      fireEvent.click(screen.getByLabelText('Frontend Development'));
      fireEvent.click(screen.getByLabelText('Backend Development'));
      fireEvent.click(screen.getByLabelText('DevOps'));

      // Submit
      await userEvent.selectOptions(screen.getByLabelText('Employment Status'), 'employed');
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalledWith(
          expect.objectContaining({
            areasOfExpertise: ['frontend', 'backend', 'devops']
          })
        );
      });
    });

    it('should limit areas of expertise to 5', async () => {
      renderComponent();

      // Try to select more than 5
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.slice(0, 6).forEach(checkbox => {
        fireEvent.click(checkbox);
      });

      await waitFor(() => {
        expect(screen.getByTestId('expertise-error')).toHaveTextContent(
          'Please select up to 5 areas of expertise'
        );
      });
    });
  });

  describe('Volunteering Preferences', () => {
    it('should toggle volunteering availability', async () => {
      renderComponent();

      const volunteeringCheckbox = screen.getByLabelText('Open to Volunteering');
      fireEvent.click(volunteeringCheckbox);

      expect(volunteeringCheckbox).toBeChecked();

      // Should show volunteering interests
      expect(screen.getByLabelText('Volunteering Interests')).toBeInTheDocument();
    });

    it('should save volunteering interests when checked', async () => {
      renderComponent();

      // Enable volunteering
      fireEvent.click(screen.getByLabelText('Open to Volunteering'));
      
      // Add interests
      const interestsField = screen.getByLabelText('Volunteering Interests');
      await userEvent.type(interestsField, 'Mentoring, Event organizing, Community outreach');

      // Complete form
      await userEvent.selectOptions(screen.getByLabelText('Employment Status'), 'employed');
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalledWith(
          expect.objectContaining({
            openToVolunteering: true,
            volunteeringInterests: 'Mentoring, Event organizing, Community outreach'
          })
        );
      });
    });
  });

  describe('Skip Functionality', () => {
    it('should allow skipping the step', () => {
      renderComponent();

      fireEvent.click(screen.getByTestId('skip-button'));

      expect(mockOnSkip).toHaveBeenCalled();
    });

    it('should show skip confirmation if data was entered', async () => {
      renderComponent();

      // Enter some data
      await userEvent.type(screen.getByLabelText('Bio'), 'Some bio text');

      // Try to skip
      fireEvent.click(screen.getByTestId('skip-button'));

      // Should show confirmation
      expect(screen.getByTestId('skip-confirmation')).toHaveTextContent(
        'You have unsaved changes. Are you sure you want to skip this step?'
      );

      // Confirm skip
      fireEvent.click(screen.getByTestId('confirm-skip-button'));
      expect(mockOnSkip).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should validate all fields before submission', async () => {
      renderComponent();

      // Submit without filling required fields
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(screen.getByTestId('employment-status-error')).toBeInTheDocument();
      });
    });

    it('should clear errors when fields are corrected', async () => {
      renderComponent();

      // Trigger error
      fireEvent.click(screen.getByTestId('next-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('employment-status-error')).toBeInTheDocument();
      });

      // Fix error
      await userEvent.selectOptions(screen.getByLabelText('Employment Status'), 'employed');

      // Error should clear
      expect(screen.queryByTestId('employment-status-error')).not.toBeInTheDocument();
    });
  });

  describe('Pre-filled Data', () => {
    it('should populate form with existing user data', () => {
      const existingData = {
        bio: 'Experienced developer',
        skills: [
          { name: 'React', level: 'expert' },
          { name: 'Node.js', level: 'intermediate' }
        ],
        employmentStatus: 'employed',
        yearsExperience: 5,
        openToVolunteering: true,
        volunteeringInterests: 'Mentoring',
        areasOfExpertise: ['frontend', 'backend']
      };

      renderComponent({ userData: existingData });

      // Check form is populated
      expect(screen.getByLabelText('Bio')).toHaveValue('Experienced developer');
      expect(screen.getAllByTestId(/^skill-tag-/)).toHaveLength(2);
      expect(screen.getByLabelText('Employment Status')).toHaveValue('employed');
      expect(screen.getByLabelText('Years of Experience')).toHaveValue('5');
      expect(screen.getByLabelText('Open to Volunteering')).toBeChecked();
      expect(screen.getByLabelText('Frontend Development')).toBeChecked();
      expect(screen.getByLabelText('Backend Development')).toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderComponent();

      expect(screen.getByLabelText('Bio')).toHaveAttribute('aria-describedby', 'bio-description');
      expect(screen.getByLabelText('Employment Status')).toHaveAttribute('aria-required', 'true');
    });

    it('should be keyboard navigable', async () => {
      renderComponent();

      await userEvent.tab();
      expect(screen.getByLabelText('Bio')).toHaveFocus();

      await userEvent.tab();
      expect(screen.getByLabelText('Skills')).toHaveFocus();

      await userEvent.tab();
      expect(screen.getByTestId('add-skill-button')).toHaveFocus();
    });
  });
});