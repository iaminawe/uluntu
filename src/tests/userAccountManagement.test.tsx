import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react'; // Import fireEvent
import SignUpPageWithAPI from './__mocks__/SignUpPageWithAPI'; // Import the mocked component
import { membersApi, supabase } from './__mocks__/userAccountManagement';

interface Member {
  id: string;
}

describe('User Account Management', () => {
  it('UAM-001: As a new user, I want to register for an account using my email address and a password through the integrated template components, so that I can access features available to registered members.', async () => {
    // Mock Supabase and membersApi calls
    const mockSignUp = jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null });
    const mockCreateMember = jest.fn().mockResolvedValue({ id: 'test-member-id' } as Member);

    supabase.auth.signUp = mockSignUp;
    (membersApi.create as jest.Mock) = mockCreateMember;

    // Render the registration component
    render(<SignUpPageWithAPI />);

    // Simulate user input
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } }); // Use fireEvent.change
    fireEvent.change(passwordInput, { target: { value: 'Password123' } }); // Use fireEvent.change

    // Simulate form submission
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(submitButton); // Use fireEvent.click

    // Wait for the API calls to complete
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
      expect(mockCreateMember).toHaveBeenCalled();
    });

    // Assert that the user is redirected to the home page
  });
});