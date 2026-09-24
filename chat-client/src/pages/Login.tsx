import { useState } from 'react';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';

export default function Login({
  onLogin,
}: LoginProps) {

  const [isRegister, setIsRegister] =
    useState(false);

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {

    e.preventDefault();

    setError('');
    setLoading(true);

    try {

      const endpoint = isRegister
        ? '/auth/register'
        : '/auth/login';

      const response =
        await fetch(
          `${API_URL}${endpoint}`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              isRegister
                ? {
                    name,
                    email,
                    password,
                  }
                : {
                    email,
                    password,
                  },
            ),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Authentication failed',
        );
      }

      localStorage.setItem(
        'accessToken',
        data.accessToken,
      );

      localStorage.setItem(
        'user',
        JSON.stringify(data.user),
      );

      onLogin(
        data.accessToken,
        data.user,
      );

    } catch (error: any) {

      setError(
        error.message ||
        'Something went wrong',
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>
          {isRegister
            ? 'Create Account'
            : 'Chat Login'}
        </h1>

        <p className="subtitle">
          {isRegister
            ? 'Create your account'
            : 'Sign in to continue'}
        </p>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
        >

          {isRegister && (
            <div className="form-group">

              <label>Name</label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Your name"
                required
              />

            </div>
          )}

          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              required
            />

          </div>

          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Password"
              required
            />

          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isRegister
                ? 'Register'
                : 'Login'}
          </button>

        </form>

        <button
          className="link-button"
          onClick={() => {
            setIsRegister(
              !isRegister,
            );
            setError('');
          }}
        >
          {isRegister
            ? 'Already have an account? Login'
            : "Don't have an account? Register"}
        </button>

      </div>

    </div>
  );
}