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
        params: { donorId: donorData.donorId, bloodType: donorData.bloodType, location: donorData.location },
      });
      if (response.data?.success) {
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
        response,
      });
      if (result.data?.success) {
        setRequests(prev =>
          prev.map(req => req.requestId === request.requestId ? { ...req, donorResponse: response } : req)
        );
      }
    } catch (error) {
      console.error('Failed to respond:', error);
      alert('Failed to record your response. Please try again.');
    } finally {
      setResponding(null);
    }
  };

  const urgencyBadge = (urgency: string) => {
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
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-red-800 text-white px-6 py-4 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">LifeLink</Link>
          <div className="flex items-center gap-6">
            <Link to="/profile" className="text-sm text-red-200 hover:text-white transition-colors">Profile</Link>
            <span className="text-sm text-red-200">{donor.name || donor.fullName}</span>
            <button onClick={handleLogout} className="text-sm border border-red-600 px-4 py-1.5 rounded hover:bg-red-700 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Blood Donation Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Review and respond to active requests from hospitals in your area.</p>
        </div>

        {/* Donor summary bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-red-700">{donor.bloodType}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{donor.name || donor.fullName}</p>
              <p className="text-xs text-gray-400">{donor.location}</p>
            </div>
          </div>
          <button
            onClick={() => fetchBloodRequests(donor)}
            disabled={loading}
            className="text-sm text-red-600 hover:text-red-800 border border-red-200 px-3 py-1.5 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-400 text-sm">Loading requests...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && requests.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
            <p className="text-lg font-semibold text-gray-700 mb-2">No active requests</p>
            <p className="text-gray-400 text-sm">You are up to date. You will be notified when a hospital requires your blood type.</p>
          </div>
        )}

        {/* Request list */}
        {!loading && requests.length > 0 && (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.requestId}
                className={`bg-white border-2 rounded-lg p-6 transition-colors ${
                  request.donorResponse === 'confirmed'
                    ? 'border-green-200'
                    : request.donorResponse === 'declined'
                    ? 'border-gray-200'
                    : 'border-red-200'
                }`}
              >
                {/* Request header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded border font-semibold uppercase tracking-wide ${urgencyBadge(request.urgency)}`}>
                      {request.urgency}
                    </span>
                    {request.donorResponse === 'confirmed' && (
                      <span className="text-xs px-2.5 py-1 rounded border font-semibold bg-green-100 text-green-700 border-green-300 uppercase tracking-wide">
                        Confirmed
                      </span>
                    )}
                    {request.donorResponse === 'declined' && (
                      <span className="text-xs px-2.5 py-1 rounded border font-semibold bg-gray-100 text-gray-600 border-gray-300 uppercase tracking-wide">
                        Declined
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">
                    {new Date(request.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Hospital name */}
                <h3 className="text-lg font-bold text-gray-900 mb-3">{request.hospitalName}</h3>

                {/* Detail grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Blood Type', value: request.bloodType },
                    { label: 'Units Needed', value: String(request.unitsNeeded) },
                    { label: 'Location', value: request.location },
                    { label: 'Status', value: request.status },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 border border-gray-100 rounded p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {request.donorResponse === 'pending' && (
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => handleResponse(request, 'confirmed')}
                      disabled={responding === request.requestId}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {responding === request.requestId ? 'Confirming...' : 'Confirm Attendance'}
                    </button>
                    <button
                      onClick={() => handleResponse(request, 'declined')}
                      disabled={responding === request.requestId}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {responding === request.requestId ? 'Declining...' : 'Unable to Attend'}
                    </button>
                  </div>
                )}

                {/* Post-response messages */}
                {request.donorResponse === 'confirmed' && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded p-4">
                    <p className="text-green-800 text-sm font-medium mb-1">Attendance confirmed</p>
                    <p className="text-green-700 text-sm">
                      Please visit <strong>{request.hospitalName}</strong> in <strong>{request.location}</strong> as soon as possible.
                      Bring a valid ID and ensure you are well-rested and have eaten beforehand.
                    </p>
                  </div>
                )}
                {request.donorResponse === 'declined' && (
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded p-4">
                    <p className="text-gray-600 text-sm">
                      You have declined this request. The hospital will be notified and will contact the next available donor.
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
