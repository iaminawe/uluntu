import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpPageWithAPI from '../pages/SignUpPageWithAPI';
import React from 'react';
import { supabase } from '../../lib/supabase';

// Mock the Supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
  },
}));

describe('User Registration Success UI Feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state during submission', async () => {
    // Mock a delayed response
    (supabase.auth.signUp as jest.Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: { user: { id: 'test-user-id' } },
            error: null,
          });
        }, 100);
      });
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

    // Verify loading state is shown
    expect(screen.getByRole('button', { name: /Signing Up/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();

    // Wait for the operation to complete
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Signing Up/i })).not.toBeInTheDocument();
    });
  });

  it('should show success message after successful registration', async () => {
    // Mock successful signup
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

    // Verify success message is shown
    await waitFor(() => {
      expect(screen.getByText('Registration successful!')).toBeInTheDocument();
    });
  });

  it('should show error message after failed registration', async () => {
    // Mock failed signup
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Email already registered' },
    });

    render(<SignUpPageWithAPI />);

    // Fill in the form
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    await userEvent.type(emailInput, 'existing@example.com');
    await userEvent.type(passwordInput, 'Password123');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    await userEvent.click(submitButton);

    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });

  it('should disable form inputs during submission', async () => {
    // Mock a delayed response
    (supabase.auth.signUp as jest.Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: { user: { id: 'test-user-id' } },
            error: null,
          });
        }, 100);
      });
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

    // Verify inputs are disabled during loading
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();

    // Wait for the operation to complete
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Signing Up/i })).not.toBeInTheDocument();
    });
  });
});