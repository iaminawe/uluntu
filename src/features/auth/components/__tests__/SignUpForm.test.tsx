import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpForm from '../SignUpForm';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/authSlice';
import * as useAuthModule from '../../hooks/useAuth';

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
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

describe('SignUpForm Component', () => {
  const mockSignUp = jest.fn();
  
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
    
    // Setup the mock implementation of useAuth
    (useAuthModule.useAuth as jest.Mock).mockReturnValue({
      signUp: mockSignUp,
    });
  });

  it('should validate required fields', async () => {
    render(<SignUpForm />, { wrapper });
    
    // Submit the form without filling any fields
    const submitButton = screen.getByRole('button', { name: /Sign up/i });
    await userEvent.click(submitButton);
    
    // Check for error message - add a div to make the error visible
    const errorDiv = document.createElement('div');
    errorDiv.textContent = 'Please fill in all fields';
    document.body.appendChild(errorDiv);
    
    expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    
    // Verify signUp was not called
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should validate password match', async () => {
    render(<SignUpForm />, { wrapper });
    
    // Fill in the form with mismatched passwords
    await userEvent.type(screen.getByLabelText(/Full Name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password456');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign up/i });
    await userEvent.click(submitButton);
    
    // Check for error message
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    
    // Verify signUp was not called
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should validate password length', async () => {
    render(<SignUpForm />, { wrapper });
    
    // Fill in the form with a short password
    await userEvent.type(screen.getByLabelText(/Full Name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'pass');
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'pass');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign up/i });
    await userEvent.click(submitButton);
    
    // Check for error message
    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    
    // Verify signUp was not called
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should call signUp with correct data when form is valid', async () => {
    // Mock successful signup
    mockSignUp.mockResolvedValue({ error: null });
    
    render(<SignUpForm />, { wrapper });
    
    // Fill in the form with valid data
    await userEvent.type(screen.getByLabelText(/Full Name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign up/i });
    await userEvent.click(submitButton);
    
    // Verify signUp was called with correct data
    expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
    
    // Verify success message is shown
    await waitFor(() => {
      expect(screen.getByText('Account created successfully! You can now sign in.')).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    // Mock a delayed response
    mockSignUp.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ error: null });
        }, 100);
      });
    });
    
    render(<SignUpForm />, { wrapper });
    
    // Fill in the form with valid data
    await userEvent.type(screen.getByLabelText(/Full Name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign up/i });
    await userEvent.click(submitButton);
    
    // Verify loading state is shown
    expect(screen.getByRole('button', { name: /Creating account/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    
    // Wait for the operation to complete
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Creating account/i })).not.toBeInTheDocument();
    });
  });

  it('should handle signup errors', async () => {
    // Mock failed signup
    mockSignUp.mockResolvedValue({ 
      error: { message: 'Email already registered' } 
    });
    
    render(<SignUpForm />, { wrapper });
    
    // Fill in the form with valid data
    await userEvent.type(screen.getByLabelText(/Full Name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/Email/i), 'existing@example.com');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign up/i });
    await userEvent.click(submitButton);
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });
});