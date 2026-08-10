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
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col">
      {/* Nav */}
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
          <span className="text-sm font-medium opacity-80">Hospital Portal</span>
        </div>
      </nav>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏥</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Hospital Login</h2>
            <p className="text-gray-500 mt-2 text-sm">Sign in to manage blood requests and donor matching</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 space-y-5">
            {/* Email */}
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

            {/* Password */}
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

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-red-600 text-sm font-medium">❌ {error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-lg transition-all mt-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 hover:scale-105 active:scale-95'
              }`}
            >
              {loading ? '⏳ Signing in...' : '🏥 Sign In'}
            </button>

            {/* Back link */}
            <p className="text-center text-sm text-gray-500 pt-2">
              Not a hospital?{' '}
              <Link to="/verify-code" className="text-red-600 hover:underline font-medium">
                Register as Donor
              </Link>
            </p>
          </form>

          {/* Demo credentials hint */}
          {/* <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-700 text-xs font-semibold mb-2">🔑 Available Hospital Accounts:</p>
            <div className="space-y-1 text-xs text-blue-600">
              <div className="flex justify-between items-center gap-2">
                <span className="font-medium">Groote Schuur Hospital</span>
                <span className="text-blue-500 font-mono text-[10px]">admin@grooteschuur.co.za</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="font-medium">Kenyatta National Hospital</span>
                <span className="text-blue-500 font-mono text-[10px]">admin@kenyatta.co.ke</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="font-medium">Chris Hani Baragwanath</span>
                <span className="text-blue-500 font-mono text-[10px]">admin@chrishani.co.za</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="font-medium">Lagos General Hospital</span>
                <span className="text-blue-500 font-mono text-[10px]">admin@lagosgeneral.ng</span>
              </div>
            </div>
          </div> */}
        </div>
      </main>
    </div>
  );
}
