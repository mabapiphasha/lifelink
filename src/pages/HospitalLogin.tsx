import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../config/api';
import { useHospitalAuth } from '../context/HospitalAuthContext';

export function HospitalLogin() {
  const navigate = useNavigate();
  const { login } = useHospitalAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(API.hospitalLogin, { email, password });

      if (response.data.success) {
        login(response.data.hospital);
        navigate('/hospital');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-red-800 text-white px-6 py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">LifeLink</Link>
          <span className="text-sm text-red-200">Hospital Portal</span>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Hospital Login</h2>
            <p className="text-gray-500 mt-2 text-sm">Sign in to manage blood requests and donor matching</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g. admin@grooteschuur.co.za"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded font-semibold text-base transition-colors ${
                loading
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center text-sm text-gray-500 pt-2">
              Not a hospital?{' '}
              <Link to="/verify-code" className="text-red-600 hover:underline font-medium">
                Register as Donor
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
