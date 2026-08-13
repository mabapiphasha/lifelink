import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { API } from '../config/api';

export function ConfirmDonation() {
  const { requestId } = useParams<{ requestId: string }>();
  const [confirmed, setConfirmed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [error, setError] = useState('');
  const [donor, setDonor] = useState<{ donorId: string; email: string; name: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('currentDonor');
    if (stored) {
      const d = JSON.parse(stored);
      setDonor({ donorId: d.donorId, email: d.email, name: d.name || d.fullName });
    }
  }, []);

  const submitResponse = async (response: 'confirmed' | 'declined') => {
    setLoading(true);
    setError('');
    try {
      const result = await axios.post(API.respondToBloodRequest, {
        requestId,
        donorId: donor?.donorId || 'anonymous',
        donorEmail: donor?.email || '',
        response,
        ...(response === 'declined' && declineReason ? { declineReason } : {}),
      });
      if (result.data && result.data.success !== false) {
        setConfirmed(response === 'confirmed');
      } else {
        setError(result.data?.message || 'Something went wrong. Please try again.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to submit your response. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Confirmed
  if (confirmed === true) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Confirmation Received</h1>
          <p className="text-gray-500 text-sm mb-5">
            Thank you. The hospital has been notified and is expecting you.
          </p>
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-6 text-left space-y-1">
            <p className="text-green-800 text-sm font-medium">Please note:</p>
            <p className="text-green-700 text-sm">Arrive within 2 hours of this confirmation.</p>
            <p className="text-green-700 text-sm">Bring a valid government-issued ID.</p>
            <p className="text-green-700 text-sm">Arrive well-rested and having eaten a meal.</p>
            <p className="text-green-700 text-sm">The donation process takes approximately 30–45 minutes.</p>
          </div>
          <Link to="/profile" className="text-red-600 hover:underline text-sm font-medium">
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  // Declined
  if (confirmed === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Response Recorded</h1>
          <p className="text-gray-500 text-sm mb-6">
            We understand. The hospital has been informed and will contact the next available donor.
            Thank you for being part of LifeLink.
          </p>
          <Link to="/profile" className="text-red-600 hover:underline text-sm font-medium">
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  // Main screen
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-red-800 text-white px-6 py-4 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">LifeLink</Link>
          {donor && <span className="text-sm text-red-200">{donor.name}</span>}
        </div>
      </nav>

      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">

          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Urgent Blood Donation Request</h1>
            <p className="text-gray-500 text-sm mt-1">A hospital in your area requires your blood type</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <p className="text-red-800 text-sm font-medium">Your response is required urgently</p>
            <p className="text-red-600 text-xs mt-1">Please confirm or decline within 2 hours.</p>
          </div>

          <p className="text-gray-600 text-sm text-center mb-6">
            Are you able to visit the hospital to donate today?
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {!donor && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
              <p className="text-amber-700 text-sm">
                You are not currently logged in. Your response will still be recorded.{' '}
                <Link to="/donor-login" className="underline font-medium">Sign in</Link> for a personalised experience.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => submitResponse('confirmed')}
              disabled={loading}
              className={`w-full py-3 rounded font-semibold text-sm transition-colors ${
                loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {loading ? 'Submitting...' : 'Yes, I Will Attend'}
            </button>

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Reason for declining <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                disabled={loading}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                <option value="">Select a reason</option>
                <option value="too_far">Too far from hospital</option>
                <option value="unavailable">Not available right now</option>
                <option value="feeling_unwell">Not feeling well</option>
                <option value="cooldown">Still in cooldown period</option>
                <option value="other">Other reason</option>
              </select>
              <button
                onClick={() => submitResponse('declined')}
                disabled={loading}
                className={`w-full py-3 rounded font-semibold text-sm transition-colors ${
                  loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {loading ? 'Submitting...' : 'Unable to Attend'}
              </button>
            </div>
          </div>

          <p className="text-gray-400 text-xs text-center mt-5">Request ID: {requestId}</p>
        </div>
      </main>
    </div>
  );
}
