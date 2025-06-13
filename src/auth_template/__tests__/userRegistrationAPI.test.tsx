
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // Correct import
import SignUpPageWithAPI from '../pages/SignUpPageWithAPI';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
  },
}));

describe('User Registration API Integration', () => {
  it('should call Supabase signUp with correct data', async () => {
    // Mock Supabase signUp
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    render(<SignUpPageWithAPI />);

    // Fill in the form
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'Password123');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    await userEvent.click(submitButton);

    // Verify that the success message is displayed
    await waitFor(() => {
      expect(screen.getByText('Registration successful!')).toBeInTheDocument();
    });
  });
});