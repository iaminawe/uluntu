import { Helmet } from 'react-helmet-async';
import SignUpForm from '../components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <>
      <Helmet>
        <title>Sign Up - Kootenay Tech Community</title>
        <meta name="description" content="Create a new account on Kootenay Tech Community" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Kootenay Tech Community</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Create a new account</p>
          </div>
          
          <SignUpForm />
        </div>
      </div>
    </>
  );
}