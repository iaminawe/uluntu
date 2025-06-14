import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInForm from '../SignInForm';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../../store/authSlice';
import * as useAuthModule from '../../../hooks/useAuth';

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock the react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// Mock console.error and console.log
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

describe('SignInForm Component', () => {
  const mockSignIn = jest.fn();
  const mockNavigate = jest.fn();
  
  // Create a Redux store for testing
  const store = configureStore({
    reducer: { auth: authReducer }
  });
  
  // Create a wrapper with the Redux provider
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      {children}
    </Provider>
  );
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup the mock implementation of useAuth with default values
    (useAuthModule.useAuth as jest.Mock).mockImplementation(() => ({
      signIn: mockSignIn,
      status: 'unauthenticated',
      error: null,
    }));

    // Setup navigation mock
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    // Silence console logs during tests
    console.error = jest.fn();
    console.log = jest.fn();
  });
  
  afterEach(() => {
    // Restore console functions
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });
  
  it('should render the sign in form correctly', () => {
    render(<SignInForm />, { wrapper });
    
    // Check for form elements
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Remember me/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/Forgot your password\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
    
    // Verify signIn hasn't been called yet
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('should call signIn with correct credentials', async () => {
    render(<SignInForm />, { wrapper });
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    await userEvent.click(submitButton);
    
    // Verify signIn was called with correct parameters
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should navigate to dashboard on successful authentication', async () => {
    // Render with unauthenticated status
    render(<SignInForm />, { wrapper });
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Update mock to authenticated status before form submission completes
    (useAuthModule.useAuth as jest.Mock).mockImplementation(() => ({
      signIn: mockSignIn,
      status: 'authenticated',
      error: null,
    }));
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    await userEvent.click(submitButton);
    
    // Verify navigation occurred
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display error for invalid credentials', async () => {
    // Render with unauthenticated status
    render(<SignInForm />, { wrapper });
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Update mock to include error
    (useAuthModule.useAuth as jest.Mock).mockImplementation(() => ({
      signIn: mockSignIn,
      status: 'unauthenticated',
      error: 'Invalid login credentials',
    }));
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    await userEvent.click(submitButton);
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
    });
  });

  it('should display error for unverified email', async () => {
    // Render with unauthenticated status
    render(<SignInForm />, { wrapper });
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Update mock to include error
    (useAuthModule.useAuth as jest.Mock).mockImplementation(() => ({
      signIn: mockSignIn,
      status: 'unauthenticated',
      error: 'Email not confirmed',
    }));
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    await userEvent.click(submitButton);
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Please verify your email address before signing in.')).toBeInTheDocument();
    });
  });

  it('should display error for unexpected service failure', async () => {
    // Render with unauthenticated status
    render(<SignInForm />, { wrapper });
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Update mock to include error
    (useAuthModule.useAuth as jest.Mock).mockImplementation(() => ({
      signIn: mockSignIn,
      status: 'unauthenticated',
      error: 'unexpected_failure',
    }));
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    await userEvent.click(submitButton);
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Authentication service is temporarily unavailable. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    // Mock a delayed response to show loading state
    mockSignIn.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => {
        resolve(undefined);
      }, 100);
    }));
    
    render(<SignInForm />, { wrapper });
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    await userEvent.click(submitButton);
    
    // Verify loading state is shown
    expect(screen.getByRole('button', { name: /Signing in/i })).toBeInTheDocument();
    
    // Wait for the loading state to be removed
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Signing in/i })).not.toBeInTheDocument();
    });
  });
});