
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export function ConfirmDonation() {
  const { requestId } = useParams();
  const [confirmed, setConfirmed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const handleConfirm = async () => {
    setLoading(true);

    try {
      // TODO: Replace with API call when Phasha builds confirmDonation Lambda
      // await axios.post(API.confirmDonation, { requestId, status: 'confirmed' });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConfirmed(true);
    } catch (err) {
      alert('Failed to confirm. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);

    try {
      // TODO: Replace with API call
      // await axios.post(API.confirmDonation, { requestId, status: 'declined', reason: declineReason });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConfirmed(false);
    } catch (err) {
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Already responded
  if (confirmed === true) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-500 mb-4">
            You've confirmed your donation. The hospital has been notified and is expecting you.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700 text-sm font-medium">📍 Please arrive within 2 hours of confirmation</p>
            <p className="text-green-600 text-xs mt-1">Bring your ID and donor card</p>
          </div>
          <Link to="/profile" className="text-red-600 hover:underline text-sm font-medium">
            ← Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  if (confirmed === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 max-w-md text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👋</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Problem</h1>
          <p className="text-gray-500 mb-4">
            We understand. The hospital will reach out to the next available donor. Thank you for being part of LifeLink.
          </p>
          <Link to="/profile" className="text-red-600 hover:underline text-sm font-medium">
            ← Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  // Main confirmation screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-8 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚨</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Urgent Blood Request</h1>
            <p className="text-gray-500 text-sm mt-2">A hospital near you needs your help</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center font-bold text-red-700">O+</div>
              <div>
                <p className="font-medium text-gray-900">Groote Schuur Hospital</p>
                <p className="text-gray-500 text-xs">3.2 km away • Critical urgency</p>
              </div>
            </div>
            <p className="text-red-700 text-sm font-medium mt-2">3 units of O+ blood needed urgently</p>
          </div>

          <p className="text-gray-600 text-sm text-center mb-6">
            Can you come to the hospital to donate within the next <strong>2 hours</strong>?
          </p>

          <div className="space-y-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
              }`}
            >
              {loading ? '⏳ Confirming...' : "✅ Yes, I'm Coming"}
            </button>

            <div className="border-t border-gray-100 pt-3">
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Reason for declining (optional)</option>
                <option value="too_far">Too far from hospital</option>
                <option value="unavailable">Not available right now</option>
                <option value="feeling_unwell">Not feeling well</option>
                <option value="other">Other reason</option>
              </select>

              <button
                onClick={handleDecline}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {loading ? '⏳ Submitting...' : "❌ Can't Make It"}
              </button>
            </div>
          </div>

          <p className="text-gray-400 text-xs text-center mt-4">
            Request ID: {requestId || 'REQ-2026-001'}
          </p>
        </div>
      </main>
    </div>
  );
}

