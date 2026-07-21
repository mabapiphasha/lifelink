import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BloodType, UrgencyTier, BloodRequest } from '../types';

const mockRequests: BloodRequest[] = [
  { id: '1', hospitalName: 'Groote Schuur Hospital', bloodType: 'O-', urgency: 'Critical', unitsNeeded: 3, status: 'Open', createdAt: '2026-07-20T08:00:00', matchedDonors: [] },
  { id: '2', hospitalName: 'Groote Schuur Hospital', bloodType: 'A+', urgency: 'High', unitsNeeded: 2, status: 'Matched', createdAt: '2026-07-19T14:30:00', matchedDonors: ['donor1', 'donor2'] },
  { id: '3', hospitalName: 'Groote Schuur Hospital', bloodType: 'B+', urgency: 'Standard', unitsNeeded: 1, status: 'Fulfilled', createdAt: '2026-07-18T09:15:00', matchedDonors: ['donor3'] },
];

export function HospitalDashboard() {
  const [requests, setRequests] = useState<BloodRequest[]>(mockRequests);
  const [showForm, setShowForm] = useState(false);
  const [newRequest, setNewRequest] = useState({ bloodType: '' as BloodType, urgency: 'High' as UrgencyTier, unitsNeeded: 1 });

  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const request: BloodRequest = {
      id: String(requests.length + 1),
      hospitalName: 'Groote Schuur Hospital',
      bloodType: newRequest.bloodType,
      urgency: newRequest.urgency,
      unitsNeeded: newRequest.unitsNeeded,
      status: 'Open',
      createdAt: new Date().toISOString(),
      matchedDonors: [],
    };
    setRequests([request, ...requests]);
    setShowForm(false);
  };

  const urgencyColor = (urgency: UrgencyTier) => {
    if (urgency === 'Critical') return 'bg-red-100 text-red-700 border-red-200';
    if (urgency === 'High') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const statusColor = (status: string) => {
    if (status === 'Open') return 'bg-blue-100 text-blue-700';
    if (status === 'Matched') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };
return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
          <span className="text-sm font-medium">Hospital Dashboard</span>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Blood Requests</h2>
            <p className="text-gray-500">Groote Schuur Hospital, Cape Town</p>
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
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all hover:scale-105">Submit Request</button>
          </form>
        )}

        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-700">{req.bloodType}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${urgencyColor(req.urgency)}`}>{req.urgency}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(req.status)}`}>{req.status}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{req.unitsNeeded} units needed</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-400">
                <p>{req.matchedDonors.length} donors matched</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
