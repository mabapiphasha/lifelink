
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BloodType, UrgencyTier, BloodRequest } from '../types';
import axios from 'axios';
import { API } from '../config/api';
import { useHospitalAuth } from '../context/HospitalAuthContext';

export function HospitalDashboard() {
  const navigate = useNavigate();
  const { hospital, logout, isLoggedIn } = useHospitalAuth();

  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newRequest, setNewRequest] = useState({ bloodType: '' as BloodType, urgency: 'High' as UrgencyTier, unitsNeeded: 1 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/hospital-login');
    }
  }, [isLoggedIn, navigate]);

  // Fetch existing requests on page load
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(API.getBloodRequests);
      setRequests(response.data.requests || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await axios.post(API.createBloodRequest, {
        hospitalId: hospital?.hospitalId,
        hospitalName: hospital?.hospitalName || 'Groote Schuur Hospital',
        bloodType: newRequest.bloodType,
        urgency: newRequest.urgency,
        unitsNeeded: newRequest.unitsNeeded,
      });

      if (response.data.success) {
        setShowForm(false);
        setNewRequest({ bloodType: '' as BloodType, urgency: 'High' as UrgencyTier, unitsNeeded: 1 });
        // Refresh the list
        fetchRequests();
      }
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.error || 'Failed to create request');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const urgencyColor = (urgency: string) => {
    const u = urgency?.toLowerCase();
    if (u === 'critical') return 'bg-red-100 text-red-700 border-red-200';
    if (u === 'high') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const statusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'open') return 'bg-blue-100 text-blue-700';
    if (s === 'matched') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium opacity-90">🏥 {hospital?.hospitalName}</span>
            <button
              onClick={() => { logout(); navigate('/hospital-login'); }}
              className="bg-red-700 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Blood Requests</h2>
            <p className="text-gray-500">{hospital?.hospitalName}, {hospital?.location}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 active:scale-95">+ New Request</button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-8 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Create Urgent Blood Request</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type Needed</label>
                <select required value={newRequest.bloodType} onChange={(e) => setNewRequest({...newRequest, bloodType: e.target.value as BloodType})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">Select</option>
                  {bloodTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                <select value={newRequest.urgency} onChange={(e) => setNewRequest({...newRequest, urgency: e.target.value as UrgencyTier})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Units Needed</label>
                <input type="number" min="1" max="10" value={newRequest.unitsNeeded} onChange={(e) => setNewRequest({...newRequest, unitsNeeded: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">❌ {error}</p>
              </div>
            )}

            <button type="submit" disabled={submitting} className={`px-6 py-2 rounded-lg font-medium transition-all ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'}`}>
              {submitting ? '⏳ Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">⏳ Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-lg">No blood requests yet.</p>
            <p className="text-gray-400 text-sm mt-2">Click "+ New Request" to post your first urgent request.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req: any) => (
              <div key={req.requestId || req.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-700">{req.bloodType}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${urgencyColor(req.urgency)}`}>{req.urgency}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(req.status)}`}>{req.status}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{req.units || req.unitsNeeded} units needed</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-400">
                  <p>{req.donorsConfirmed || 0} donors confirmed</p>
                  <p className="text-xs">{req.donorsToInvite ? `${req.donorsToInvite} invited` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

