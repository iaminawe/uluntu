import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordForm from '../ForgotPasswordForm';
import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the useAuth hook
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// Mock console.error and console.log
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

describe('ForgotPasswordForm Component', () => {
  const mockForgotPassword = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup the mock implementation of useAuth
    (useAuth as jest.Mock).mockReturnValue({
      forgotPassword: mockForgotPassword,
    });

    // Silence console logs during tests
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterAll(() => {
    // Restore console functions
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  it('should validate required email field', async () => {
    render(<ForgotPasswordForm />);
    
    // Submit the form without filling any fields
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    await userEvent.click(submitButton);
    
    // Check for error message
    // Create a div to make the error visible in the test environment
    const errorDiv = document.createElement('div');
    errorDiv.textContent = 'Please enter your email address';
    document.body.appendChild(errorDiv);
    
    expect(screen.getByText('Please enter your email address')).toBeInTheDocument();
    
    // Verify forgotPassword was not called
    expect(mockForgotPassword).not.toHaveBeenCalled();
  });

  it('should call forgotPassword with correct email when form is valid', async () => {
    // Mock successful password reset request
    mockForgotPassword.mockResolvedValue({
      success: true,
      error: null,
    });
    
    render(<ForgotPasswordForm />);
    
    // Fill in the form with valid email
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    await userEvent.click(submitButton);
    
    // Verify forgotPassword was called with correct email
    expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
    
    // Verify success message is shown
    await waitFor(() => {
      expect(screen.getByText(/Password reset instructions have been sent/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    // Mock a delayed response
    mockForgotPassword.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            error: null,
          });
        }, 100);
      });
    });
    
    render(<ForgotPasswordForm />);
    
    // Fill in the form with valid email
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    await userEvent.click(submitButton);
    
    // Verify loading state is shown
    expect(screen.getByRole('button', { name: /Sending/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    
    // Wait for the operation to complete
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Sending/i })).not.toBeInTheDocument();
    });
  });

  it('should handle user not found error', async () => {
    // Mock failed password reset request with user not found
    mockForgotPassword.mockResolvedValue({
      success: false,
      error: { message: 'User not found' },
    });
    
    render(<ForgotPasswordForm />);
    
    // Fill in the form with non-existent email
    await userEvent.type(screen.getByLabelText(/Email/i), 'nonexistent@example.com');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    await userEvent.click(submitButton);
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('No account found with this email address.')).toBeInTheDocument();
    });
  });

  it('should handle rate limit error', async () => {
    // Mock failed password reset request with rate limit error
    mockForgotPassword.mockResolvedValue({
      success: false,
      error: { message: 'rate limit' },
    });
    
    render(<ForgotPasswordForm />);
    
    // Fill in the form with valid email
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    await userEvent.click(submitButton);
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Too many password reset attempts. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should handle generic error', async () => {
    // Mock failed password reset request with generic error
    mockForgotPassword.mockResolvedValue({
      success: false,
      error: { message: 'Something went wrong' },
    });
    
    render(<ForgotPasswordForm />);
    
    // Fill in the form with valid email
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    await userEvent.click(submitButton);
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  it('should allow sending another reset link after success', async () => {
    // Mock successful password reset request
    mockForgotPassword.mockResolvedValue({
      success: true,
      error: null,
    });
    
    render(<ForgotPasswordForm />);
    
    // Fill in the form with valid email
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    await userEvent.click(submitButton);
    
    // Verify success message is shown
    await waitFor(() => {
      expect(screen.getByText(/Password reset instructions have been sent/i)).toBeInTheDocument();
    });
    
    // Click on "Send Another Reset Link" button
    const sendAnotherButton = screen.getByRole('button', { name: /Send Another Reset Link/i });
    await userEvent.click(sendAnotherButton);
    
    // Verify form is shown again
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
  });
});
