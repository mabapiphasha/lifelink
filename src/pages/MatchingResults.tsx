import { Link } from 'react-router-dom';

interface MatchedDonor {
  id: string;
  name: string;
  bloodType: string;
  location: string;
  distance: string;
  status: 'Pending' | 'Confirmed' | 'Declined';
}

const mockMatches: MatchedDonor[] = [
  { id: '1', name: 'Thabo Molefe', bloodType: 'O-', location: 'Cape Town', distance: '2.3 km', status: 'Confirmed' },
  { id: '2', name: 'Amina Osei', bloodType: 'O-', location: 'Cape Town', distance: '4.1 km', status: 'Pending' },
  { id: '3', name: 'David Nkosi', bloodType: 'O-', location: 'Cape Town', distance: '5.8 km', status: 'Pending' },
  { id: '4', name: 'Fatima Hassan', bloodType: 'O-', location: 'Cape Town', distance: '7.2 km', status: 'Declined' },
];

export function MatchingResults() {
  const statusColor = (status: string) => {
    if (status === 'Confirmed') return 'bg-green-100 text-green-700';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-500';
  };

  const statusIcon = (status: string) => {
    if (status === 'Confirmed') return '✓';
    if (status === 'Pending') return '⏳';
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
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-700 text-xl">O-</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Blood Request #1</h2>
                <p className="text-gray-500 text-sm">Groote Schuur Hospital • 3 units needed • Critical</p>
              </div>
            </div>
            <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium border border-red-200">Critical</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-4">Matched Donors ({mockMatches.length})</h3>
        <div className="space-y-3">
          {mockMatches.map((donor) => (
            <div key={donor.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">🧑</div>
                <div>
                  <p className="font-medium text-gray-900">{donor.name}</p>
                  <p className="text-gray-400 text-xs">{donor.location} • {donor.distance} away</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">{donor.bloodType}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(donor.status)}`}>{statusIcon(donor.status)} {donor.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-green-50 rounded-xl p-4 border border-green-200 text-center">
          <p className="text-green-700 font-medium">1 of 3 donors confirmed • SMS notifications sent to pending donors</p>
        </div>
      </main>
    </div>
  );
}