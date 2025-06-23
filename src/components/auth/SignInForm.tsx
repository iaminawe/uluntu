import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSimpleError } from '@/hooks/useErrorHandling';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { sanitizeError } from '@/utils/errorSanitization';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, status, error: authError } = useAuth();
  const { error, handleError, clearError } = useSimpleError('Sign In Form');

  // Set local error state based on authError from Redux when it changes
  React.useEffect(() => {
    if (authError) {
      const sanitized = sanitizeError(authError);
      handleError(authError);
    } else {
      clearError();
    }
  }, [authError, handleError, clearError]);

  // Redirect to intended page or dashboard when authenticated
  React.useEffect(() => {
    if (status === 'authenticated') {
      // Get the intended redirect location from state, or default to homepage
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [status, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      handleError('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      clearError();
      
      // Call signIn without destructuring the return value
      // The signIn function dispatches actions to Redux and doesn't return anything
      await signIn(email, password);
      
      // The auth state (status and error) will be updated by Redux
      // and handled by the useEffect hooks above
      console.log('Sign-in request completed');
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
        Sign In
      </h2>
      
      {error && (
        <ErrorAlert
          error={error}
          onDismiss={clearError}
          className="mb-6"
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md  bg-white dark:bg-slate-700 text-slate-900 dark:text-white  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md  bg-white dark:bg-slate-700 text-slate-900 dark:text-white  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-300 rounded"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-orange-500 hover:text-orange-600">
              Forgot your password?
            </Link>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium  text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2  focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}