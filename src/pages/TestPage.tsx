import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-green-600">✅ App is Working!</h1>
      <p className="mt-4">If you can see this, the React app is loading correctly.</p>
      <div className="mt-4 p-4 bg-blue-100 rounded">
        <p><strong>Environment Check:</strong></p>
        <p>Node ENV: {import.meta.env.MODE}</p>
        <p>Supabase URL configured: {import.meta.env.VITE_SUPABASE_URL ? '✅ Yes' : '❌ No'}</p>
        <p>Use Supabase: {import.meta.env.VITE_USE_SUPABASE}</p>
      </div>
    </div>
  );
};

export default TestPage;