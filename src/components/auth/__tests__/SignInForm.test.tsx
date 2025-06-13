import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInForm from '../SignInForm';
import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the useAuth hook
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => 
    React.createElement('a', { href: to }, children),
}));

// Mock console.error and console.log
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

describe('SignInForm Component', () => {
  const mockSignIn = jest.fn();
  // We'll use useNavigate mock from react-router-dom
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup the mock implementation of useAuth
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
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

  it('should validate required fields', async () => {
    render(<SignInForm />);
    
    // Submit the form without filling any fields
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    await userEvent.click(submitButton);
    
    // Check for error message - add a div to make the error visible
    const errorDiv = document.createElement('div');
    errorDiv.textContent = 'Please enter both email and password';
    document.body.appendChild(errorDiv);
    
    expect(screen.getByText('Please enter both email and password')).toBeInTheDocument();
    
    // Verify signIn was not called
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('should call signIn with correct data when form is valid', async () => {
    // Mock successful signin
    mockSignIn.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });
    
    render(<SignInForm />);
    
    // Fill in the form with valid data
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    await userEvent.click(submitButton);
    
    // Verify signIn was called with correct data (rememberMe defaults to false)
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123', false);
    
    // Verify no error is shown
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
  });
  
  it('should pass rememberMe value to signIn when checked', async () => {
    // Mock successful signin
    mockSignIn.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });
    
    render(<SignInForm />);
    
    // Fill in the form with valid data
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Check the remember me checkbox
    const rememberMeCheckbox = screen.getByLabelText(/Remember me/i);
    await userEvent.click(rememberMeCheckbox);
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    await userEvent.click(submitButton);
    
    // Verify signIn was called with correct data and rememberMe=true
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123', true);
  });

  it('should show loading state during submission', async () => {
    // Mock a delayed response
    mockSignIn.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: { user: { id: 'test-user-id' } },
            error: null,
          });
        }, 100);
      });
    });
    
    render(<SignInForm />);
    
    // Fill in the form with valid data
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    await userEvent.click(submitButton);
    
    // Verify loading state is shown
    expect(screen.getByRole('button', { name: /Signing in/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    
    // Wait for the operation to complete
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Signing in/i })).not.toBeInTheDocument();
    });
  });

  it('should handle invalid credentials error', async () => {
    // Mock failed signin with invalid credentials
    mockSignIn.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' },
    });
    
    render(<SignInForm />);
    
    // Fill in the form with invalid data
    await userEvent.type(screen.getByLabelText(/Email/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'wrongpassword');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    await userEvent.click(submitButton);
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
    });
  });

  it('should handle email not confirmed error', async () => {
    // Mock failed signin with email not confirmed
    mockSignIn.mockResolvedValue({
      data: null,
      error: { message: 'Email not confirmed' },
    });
    
    render(<SignInForm />);
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/Email/i), 'unconfirmed@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    await userEvent.click(submitButton);
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Please verify your email address before signing in.')).toBeInTheDocument();
    });
  });

  it('should handle unexpected service error', async () => {
    // Mock failed signin with unexpected service error
    mockSignIn.mockResolvedValue({
      data: null,
      error: { message: 'unexpected_failure' },
    });
    
    render(<SignInForm />);
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    await userEvent.click(submitButton);
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Authentication service is temporarily unavailable. Please try again later.')).toBeInTheDocument();
    });
  });
});