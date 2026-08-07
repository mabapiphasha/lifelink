
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with Cognito auth when Phasha sets it up
      // For now, simulate login with localStorage
      const donors = JSON.parse(localStorage.getItem('registeredDonors') || '[]');
      const donor = donors.find((d: any) => d.email === email);

      if (donor && password.length >= 6) {
        localStorage.setItem('currentDonor', JSON.stringify(donor));
        navigate('/profile');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
          <Link to="/verify-code" className="text-sm font-medium hover:text-red-200">New Donor? Register →</Link>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-8 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Donor Login</h1>
            <p className="text-gray-500 text-sm mt-2">Access your donor profile and donation history</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">❌ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'
              }`}
            >
              {loading ? '⏳ Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-400 text-xs">
              Don't have an account?{' '}
              <Link to="/verify-code" className="text-red-600 hover:underline font-medium">
                Register with your hospital code
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

