
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '../config/api';

interface MatchedDonor {
  donorId: string;
  name: string;
  bloodType: string;
  location: string;
  distance?: string;
  status: string;
}

export function MatchingResults() {
  const [bloodType, setBloodType] = useState('');
  const [units, setUnits] = useState(3);
  const [matches, setMatches] = useState<MatchedDonor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [requestInfo, setRequestInfo] = useState<any>(null);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleMatch = async () => {
    if (!bloodType) {
      setError('Please select a blood type');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(API.matchDonors, {
        bloodType,
        units,
        hospital: 'Groote Schuur Hospital',
      });

      setMatches(response.data.matchedDonors || []);
      setRequestInfo({
        bloodType,
        units,
        donorsInvited: response.data.donorsInvited || 0,
        message: response.data.message || '',
      });
      setSearched(true);
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.error || 'Matching failed');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'confirmed') return 'bg-green-100 text-green-700';
    if (s === 'pending' || s === 'invited') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-500';
  };

  const statusIcon = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'confirmed') return '✓';
    if (s === 'pending' || s === 'invited') return '⏳';
    return '✗';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
          <Link to="/hospital" className="text-sm font-medium hover:text-red-200">← Back to Dashboard</Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-8 py-12">

        {/* Search Form */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Find Matching Donors</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type Needed</label>
              <select value={bloodType} onChange={(e) => setBloodType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select</option>
                {bloodTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Units Needed</label>
              <input type="number" min="1" max="10" value={units} onChange={(e) => setUnits(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="flex items-end">
              <button onClick={handleMatch} disabled={loading} className={`w-full py-2 rounded-lg font-medium transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'}`}>
                {loading ? '⏳ Matching...' : '🔍 Find Donors'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-medium">❌ {error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {searched && (
          <>
            {requestInfo && (
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-700 text-xl">{requestInfo.bloodType}</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Match Results</h3>
                    <p className="text-gray-500 text-sm">Groote Schuur Hospital • {requestInfo.units} units needed</p>
                    <p className="text-gray-400 text-xs mt-1">{requestInfo.donorsInvited} donors invited (double invitation rule)</p>
                  </div>
                </div>
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-900 mb-4">Matched Donors ({matches.length})</h3>

            {matches.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <p className="text-gray-400 text-lg">No eligible donors found for {bloodType}.</p>
                <p className="text-gray-400 text-sm mt-2">All donors may be in their 56-day cooldown period, or no donors with this blood type are registered yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((donor, index) => (
                  <div key={donor.donorId || index} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">🧑</div>
                      <div>
                        <p className="font-medium text-gray-900">{donor.name || 'Anonymous Donor'}</p>
                        <p className="text-gray-400 text-xs">{donor.location || 'Location not shared'} {donor.distance ? `• ${donor.distance} away` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">{donor.bloodType}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(donor.status)}`}>{statusIcon(donor.status)} {donor.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {matches.length > 0 && (
              <div className="mt-8 bg-green-50 rounded-xl p-4 border border-green-200 text-center">
                <p className="text-green-700 font-medium">
                  {matches.filter(d => d.status?.toLowerCase() === 'confirmed').length} of {requestInfo?.units} donors confirmed • SMS notifications sent to pending donors
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

