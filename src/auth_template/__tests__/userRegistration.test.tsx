import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpPage from '../pages/SignUpPage';
import React from 'react';

// Mock window.alert to verify form submission
const mockAlert = jest.fn();
window.alert = mockAlert;

describe('User Registration Form Input Validation', () => {
  beforeEach(() => {
    mockAlert.mockClear();
  });

  it('should validate email format', async () => {
    // Mock the validation function
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<SignUpPage />);
    const emailInput = screen.getByLabelText(/Email/i);
    await userEvent.type(emailInput, 'invalid-email');
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    await userEvent.click(submitButton);
    
    // Verify form was not submitted (alert not called)
    expect(mockAlert).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('should validate password strength', async () => {
    render(<SignUpPage />);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    
    // Enter valid email but weak password
    await userEvent.type(emailInput, 'valid@example.com');
    await userEvent.type(passwordInput, 'weak');
    
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    await userEvent.click(submitButton);
    
    // Verify error message is displayed
    const errorMessage = screen.getByText((content) => content.includes('Password must be at least 8 characters long'));
    expect(errorMessage).toBeInTheDocument();
    
    // Verify form was not submitted (alert not called)
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('should validate required fields', async () => {
    render(<SignUpPage />);
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    await userEvent.click(submitButton);
    
    // Verify error messages are displayed
    const emailErrorMessage = screen.getByText((content) => content.includes('Email is required'));
    const passwordErrorMessage = screen.getByText((content) => content.includes('Password is required'));
    
    expect(emailErrorMessage).toBeInTheDocument();
    expect(passwordErrorMessage).toBeInTheDocument();
    
    // Verify form was not submitted (alert not called)
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('should submit form with valid inputs', async () => {
    render(<SignUpPage />);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    
    // Enter valid email and password
    await userEvent.type(emailInput, 'valid@example.com');
    await userEvent.type(passwordInput, 'StrongPassword123');
    
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    await userEvent.click(submitButton);
    
    // Verify no error messages are displayed
    expect(screen.queryByText((content) => content.includes('Invalid email format'))).not.toBeInTheDocument();
    expect(screen.queryByText((content) => content.includes('Password must be at least 8 characters long'))).not.toBeInTheDocument();
    
    // Verify form was submitted (alert called)
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Form is valid');
    });
  });
});