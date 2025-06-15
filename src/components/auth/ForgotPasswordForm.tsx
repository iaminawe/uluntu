import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/shared/contexts/AuthContextWithRedux';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { success, error: resetError } = await forgotPassword(email);
      
      if (resetError) {
        // Handle specific errors with user-friendly messages
        if (resetError.message.includes('User not found')) {
          throw new Error('No account found with this email address.');
        } else if (resetError.message.includes('rate limit')) {
          throw new Error('Too many password reset attempts. Please try again later.');
        } else {
          // For generic errors, just pass through the original message
          throw new Error(resetError.message);
        }
      }
      
      if (success) {
        setIsSuccess(true);
        // Clear the email field on success
        setEmail('');
      }
    } catch (err) {
      console.error('Error requesting password reset:', err);
      setError(err instanceof Error ? err.message : 'Failed to request password reset');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
        Forgot Password
      </h2>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {isSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-400">
                Password reset instructions have been sent to your email address. Please check your inbox.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!isSuccess ? (
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
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6">
          <button
            onClick={() => setIsSuccess(false)}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Send Another Reset Link
          </button>
        </div>
      )}
      
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Remember your password?{' '}
          <Link to="/signin" className="font-medium text-orange-500 hover:text-orange-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
