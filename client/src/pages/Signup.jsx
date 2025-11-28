import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const signupMutation = useMutation({
    mutationFn: authAPI.signup,
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);
      navigate('/');
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Signup failed');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    signupMutation.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-primary-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">MusicStream</h1>
          <p className="text-dark-400">Create your account</p>
        </div>

        <div className="bg-dark-900 rounded-lg p-8 border border-dark-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium mb-2">
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="btn-primary w-full"
            >
              {signupMutation.isPending ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-400">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
