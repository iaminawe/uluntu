import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const SignUpPageWithAPI = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;

    // Reset errors
    setEmailError('');
    setPasswordError('');
    setSuccess(false);

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email format');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      isValid = false;
    }

    if (isValid) {
      setLoading(true);
      try {
        // Call Supabase API
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          // Handle API error
          setEmailError(error.message);
        } else if (data.user) {
          // Success
          setSuccess(true);
        }
      } catch (error) {
        // Handle unexpected errors
        console.error('Registration error:', error);
        setEmailError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      {success && <div className="success-message">Registration successful!</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          {emailError && <p className="error">{emailError}</p>}
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          {passwordError && <p className="error">{passwordError}</p>}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignUpPageWithAPI;