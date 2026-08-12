import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../config/api';

interface BloodRequest {
  requestId: string;
  hospitalId: string;
  hospitalName: string;
  location: string;
  bloodType: string;
  urgency: string;
  unitsNeeded: number;
  status: string;
  createdAt: string;
  donorResponse?: 'pending' | 'confirmed' | 'declined';
}

export function DonorBloodRequests() {
  const navigate = useNavigate();
  const [donor, setDonor] = useState<any>(null);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    // Load donor from localStorage
    const stored = localStorage.getItem('currentDonor');
    if (!stored) {
      navigate('/donor-login');
      return;
    }

    const donorData = JSON.parse(stored);
    setDonor(donorData);
    fetchBloodRequests(donorData);
  }, [navigate]);

  const fetchBloodRequests = async (donorData: any) => {
    setLoading(true);
    try {
      const response = await axios.get(API.getDonorBloodRequests, {
        params: {
          donorId: donorData.donorId,
          bloodType: donorData.bloodType,
          location: donorData.location
        }
      });

      if (response.data && response.data.success) {
        setRequests(response.data.requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch blood requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (request: BloodRequest, response: 'confirmed' | 'declined') => {
    setResponding(request.requestId);
    try {
      const result = await axios.post(API.respondToBloodRequest, {
        requestId: request.requestId,
        donorId: donor.donorId,
        donorEmail: donor.email,
        response
      });

      if (result.data && result.data.success) {
        // Update local state
        setRequests(prev => prev.map(req =>
          req.requestId === request.requestId
            ? { ...req, donorResponse: response }
            : req
        ));
      }
    } catch (error) {
      console.error('Failed to respond:', error);
      alert('Failed to record your response. Please try again.');
    } finally {
      setResponding(null);
    }
  };

  const urgencyColor = (urgency: string) => {
    if (urgency === 'Critical') return 'bg-red-100 text-red-700 border-red-300';
    if (urgency === 'High') return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  };

  const handleLogout = () => {
    localStorage.removeItem('currentDonor');
    navigate('/donor-login');
  };

  if (!donor) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
          <div className="flex items-center gap-4">
            <Link to="/donor-profile" className="text-sm hover:underline">Profile</Link>
            <span className="text-sm">👋 {donor.name || donor.fullName}</span>
            <button onClick={handleLogout} className="text-sm bg-red-900 px-3 py-1 rounded-lg hover:bg-red-950">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🩸 Blood Requests</h1>
          <p className="text-gray-500">Hospitals nearby need your help. Review and respond to urgent requests.</p>
        </div>

        {/* Donor Info Badge */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-red-700">{donor.bloodType}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">{donor.name || donor.fullName}</p>
              <p className="text-xs text-gray-500">📍 {donor.location}</p>
            </div>
          </div>
          <button
            onClick={() => fetchBloodRequests(donor)}
            disabled={loading}
            className="text-sm text-red-600 hover:underline disabled:opacity-50"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="text-gray-500 mt-4">Loading blood requests...</p>
          </div>
        )}

        {/* No Requests */}
        {!loading && requests.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <span className="text-6xl mb-4 block">🩸</span>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No active requests</h3>
            <p className="text-gray-500 text-sm">You're all caught up! We'll notify you when hospitals need your blood type.</p>
          </div>
        )}

        {/* Requests List */}
        {!loading && requests.length > 0 && (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.requestId}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${
                  request.donorResponse === 'confirmed'
                    ? 'border-green-300 bg-green-50'
                    : request.donorResponse === 'declined'
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-red-200 hover:border-red-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold border ${urgencyColor(request.urgency)}`}>
                      {request.urgency.toUpperCase()}
                    </span>
                    {request.donorResponse === 'confirmed' && (
                      <span className="text-xs px-3 py-1 rounded-full font-bold bg-green-100 text-green-700 border border-green-300">
                        ✅ CONFIRMED
                      </span>
                    )}
                    {request.donorResponse === 'declined' && (
                      <span className="text-xs px-3 py-1 rounded-full font-bold bg-gray-100 text-gray-600 border border-gray-300">
                        ❌ DECLINED
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(request.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Details */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{request.hospitalName}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Blood Type</p>
                    <p className="font-bold text-red-700">{request.bloodType}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Units Needed</p>
                    <p className="font-semibold text-gray-800">{request.unitsNeeded}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="font-semibold text-gray-800">{request.location}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p className="font-semibold text-gray-800 capitalize">{request.status}</p>
                  </div>
                </div>

                {/* Actions */}
                {request.donorResponse === 'pending' && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleResponse(request, 'confirmed')}
                      disabled={responding === request.requestId}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {responding === request.requestId ? '⏳ Confirming...' : '✅ Yes, I Can Donate'}
                    </button>
                    <button
                      onClick={() => handleResponse(request, 'declined')}
                      disabled={responding === request.requestId}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {responding === request.requestId ? '⏳ Declining...' : '❌ Not Today'}
                    </button>
                  </div>
                )}

                {/* Confirmation Message */}
                {request.donorResponse === 'confirmed' && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium mb-2">🎉 Thank you for confirming!</p>
                    <p className="text-green-700 text-sm">
                      Please visit <strong>{request.hospitalName}</strong> in <strong>{request.location}</strong> as soon as possible.
                      Bring a valid ID and ensure you're well-rested and have eaten.
                    </p>
                  </div>
                )}

                {request.donorResponse === 'declined' && (
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700 text-sm">
                      You declined this request. We understand – thank you for being part of LifeLink!
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
