import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';
import { newsletterSubscriptionApi } from '@/features/newsletter/api/subscriptions';

const NewsletterConfirmPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_confirmed'>('loading');
  const [message, setMessage] = useState('');
  
  const token = searchParams.get('token');
  const action = searchParams.get('action'); // 'confirm' or 'unsubscribe'

  useEffect(() => {
    const handleConfirmation = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid confirmation link.');
        return;
      }

      try {
        if (action === 'unsubscribe') {
          const success = await newsletterSubscriptionApi.unsubscribe(token);
          if (success) {
            setStatus('success');
            setMessage('You have been successfully unsubscribed from our newsletter.');
          } else {
            setStatus('error');
            setMessage('Failed to unsubscribe. The link may be invalid or expired.');
          }
        } else {
          // Default to confirm
          const success = await newsletterSubscriptionApi.confirmSubscription(token);
          if (success) {
            setStatus('success');
            setMessage('Your newsletter subscription has been confirmed! You will start receiving updates soon.');
          } else {
            // Check if already confirmed
            const subscription = await newsletterSubscriptionApi.getSubscriptionByToken(token);
            if (subscription && subscription.status === 'active') {
              setStatus('already_confirmed');
              setMessage('Your subscription was already confirmed.');
            } else {
              setStatus('error');
              setMessage('Failed to confirm subscription. The link may be invalid or expired.');
            }
          }
        }
      } catch (error) {
        console.error('Error processing newsletter action:', error);
        setStatus('error');
        setMessage('An error occurred. Please try again later.');
      }
    };

    handleConfirmation();
  }, [token, action]);

  const getIcon = () => {
    switch (status) {
      case 'success':
      case 'already_confirmed':
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500 mx-auto" />;
      default:
        return (
          <div className="w-16 h-16 mx-auto">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return action === 'unsubscribe' ? 'Unsubscribing...' : 'Confirming Subscription...';
      case 'success':
        return action === 'unsubscribe' ? 'Unsubscribed Successfully' : 'Subscription Confirmed!';
      case 'already_confirmed':
        return 'Already Confirmed';
      case 'error':
        return 'Action Failed';
      default:
        return 'Processing...';
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'success':
      case 'already_confirmed':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className={`${getBackgroundColor()} rounded-lg p-8 text-center shadow-lg border border-slate-200 dark:border-slate-700`}>
          {/* Icon */}
          <div className="mb-6">
            {getIcon()}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {getTitle()}
          </h1>

          {/* Message */}
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {message}
          </p>

          {/* Additional Info for Success */}
          {(status === 'success' && action !== 'unsubscribe') && (
            <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
              <Mail className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You'll receive our newsletter updates based on your preferences. 
                You can update your preferences or unsubscribe at any time from your account settings.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white 
                       rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>

            {status === 'success' && action !== 'unsubscribe' && (
              <button
                onClick={() => navigate('/signup')}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white 
                         rounded-lg transition-colors"
              >
                Join Our Community
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Uluntu Newsletter
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterConfirmPage;