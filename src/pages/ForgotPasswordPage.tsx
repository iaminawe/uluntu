import { Helmet } from 'react-helmet-async';
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title>Forgot Password - Uluntu</title>
        <meta name="description" content="Reset your Uluntu account password" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Uluntu</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Reset your password</p>
          </div>
          
          <ForgotPasswordForm />
        </div>
      </div>
    </>
  );
}
