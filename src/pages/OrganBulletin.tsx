import { useState } from 'react';
import { Link } from 'react-router-dom';

interface OrganRequest {
  id: string;
  organType: string;
  bloodTypeNeeded: string;
  hospital: string;
  location: string;
  urgency: 'Critical' | 'High' | 'Standard';
  postedDate: string;
  applicants: number;
}

const mockOrganRequests: OrganRequest[] = [
  { id: '1', organType: 'Kidney', bloodTypeNeeded: 'O+', hospital: 'Groote Schuur Hospital', location: 'Cape Town', urgency: 'Critical', postedDate: '2026-07-18', applicants: 3 },
  { id: '2', organType: 'Liver', bloodTypeNeeded: 'A+', hospital: 'Kenyatta National Hospital', location: 'Nairobi', urgency: 'High', postedDate: '2026-07-15', applicants: 1 },
  { id: '3', organType: 'Kidney', bloodTypeNeeded: 'B-', hospital: 'Chris Hani Baragwanath', location: 'Johannesburg', urgency: 'Standard', postedDate: '2026-07-12', applicants: 5 },
];

export function OrganBulletin() {
  const [applied, setApplied] = useState<string[]>([]);

  const urgencyColor = (urgency: string) => {
    if (urgency === 'Critical') return 'bg-red-100 text-red-700 border-red-200';
    if (urgency === 'High') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const organIcon = (organ: string) => {
    if (organ === 'Kidney') return '🫘';
    if (organ === 'Liver') return '🫁';
    return '🫀';
  };
return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
          <span className="text-sm font-medium">Organ Donation</span>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Organ Donation Bulletin</h2>
          <p className="text-gray-500 mt-1">Browse open requests and apply to save a life. All medical testing happens in person at the hospital.</p>
        </div>

        <div className="space-y-4">
          {mockOrganRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-2xl">{organIcon(req.organType)}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{req.organType} Donor Needed</h3>
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${urgencyColor(req.urgency)}`}>{req.urgency}</span>
                    </div>
                    <p className="text-gray-500 text-sm">{req.hospital} • {req.location}</p>
                    <p className="text-gray-400 text-xs mt-1">Blood type: {req.bloodTypeNeeded} • Posted: {req.postedDate} • {req.applicants} applicants</p>
                  </div>
                </div>
                <div>
                  {applied.includes(req.id) ? (
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">Applied ✓</span>
                  ) : (
                    <button onClick={() => setApplied([...applied, req.id])} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95">Apply to Donate</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-blue-700 text-sm"><strong>How it works:</strong> Apply → Complete pre-screening → Hospital reviews → Invited for testing → All medical decisions happen at the hospital.</p>
        </div>
      </main>
    </div>
  );
}