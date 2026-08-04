
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHospitalAuth } from '../context/HospitalAuthContext';

export function HospitalLogin() {
  const navigate = useNavigate();
  const { login, completeNewPassword, isLoading, error, needsNewPassword } = useHospitalAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      if (!needsNewPassword) {
        navigate('/hospital');
      }
    } catch (err) {
      // Error is handled in context
    }
  };

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await completeNewPassword(newPassword);
      navigate('/hospital');
    } catch (err) {
      // Error is handled in context
    }
  };

  // Show "Set new password" form if first login
  if (needsNewPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col">
        <nav className="bg-red-800 text-white p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
            <span className="text-sm font-medium opacity-80">Hospital Portal</span>
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">Set New Password</h2>
              <p className="text-gray-500 mt-2 text-sm">For security, please set a new password for your account</p>
            </div>

            <form onSubmit={handleNewPassword} className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 space-y-5">
              <div className='relative'>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showNewPassword ? '🙈' : '👁️'}
                </button>
                <p className="text-xs text-gray-400 mt-1">Min 8 characters, uppercase, lowercase, and number required</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-semibold text-lg transition-all ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200'
                }`}
              >
                {isLoading ? 'Updating...' : 'Set Password & Continue'}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Normal login form
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
          <span className="text-sm font-medium opacity-80">Hospital Portal</span>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏥</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Hospital Login</h2>
            <p className="text-gray-500 mt-2 text-sm">Sign in to manage blood requests and donor matching</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold text-lg transition-all mt-2 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 hover:scale-105 active:scale-95'
              }`}
            >
              {isLoading ? '⏳ Signing in...' : '🏥 Sign In'}
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
