
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../config/api';

export function CodeVerification() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(null);
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Please enter your registration code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(API.verifyCode, { code: code.trim() });

      if (response.data.valid) {
        setVerified(response.data);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Verification failed');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToRegister = () => {
    // Pass verified data to registration page
    navigate('/donor', {
      state: {
        donorName: verified.donorName,
        bloodType: verified.bloodType,
        hospital: verified.hospital,
        screeningDate: verified.screeningDate,
        code: code.trim(),
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight">🩸 LifeLink</Link>
          <span className="text-red-200 text-sm font-medium">Donor Code Verification</span>
          <Link to="/" className="text-sm hover:text-red-200 transition-colors">← Home</Link>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-6 py-16">
        {!verified ? (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔑</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Enter Your Code</h2>
              <p className="text-gray-500 text-sm mt-2">
                Enter the registration code you received after your medical screening at the hospital.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="e.g.[MAC_ADDRESS]B2"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-lg font-mono tracking-wider focus:border-red-500 focus:outline-none transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <p className="text-red-600 text-sm font-medium">❌ {error}</p>
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={loading || !code.trim()}
                className={`w-full py-3 rounded-xl font-semibold text-lg transition-all ${
                  loading || !code.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {loading ? '⏳ Verifying...' : '✓ Verify Code'}
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 text-center">
                <strong>Don't have a code?</strong> Visit a participating hospital for a free medical screening. After passing, you'll receive a unique registration code.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Code Verified!</h2>
              <p className="text-gray-500 text-sm mt-2">Your medical screening has been confirmed.</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Name</span>
                <span className="font-semibold text-gray-900">{verified.donorName}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Blood Type</span>
                <span className="font-bold text-red-600 text-lg">{verified.bloodType}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Hospital</span>
                <span className="font-semibold text-gray-900">{verified.hospital}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Screening Date</span>
                <span className="font-semibold text-gray-900">{verified.screeningDate}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToRegister}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-lg shadow-lg shadow-green-200 transition-all hover:scale-[1.02] active:scale-95"
            >
              Complete Registration →
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              You'll set up your contact preferences and location to receive donation notifications.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

