import { Link } from 'react-router-dom';

interface Application {
  id: string;
  organType: string;
  hospital: string;
  location: string;
  appliedDate: string;
  status: 'Applied' | 'Under Review' | 'Invited' | 'Approved' | 'Not Eligible';
}

const mockApplications: Application[] = [
  { id: '1', organType: 'Kidney', hospital: 'Groote Schuur Hospital', location: 'Cape Town', appliedDate: '2026-07-18', status: 'Invited' },
  { id: '2', organType: 'Liver', hospital: 'Kenyatta National Hospital', location: 'Nairobi', appliedDate: '2026-07-15', status: 'Under Review' },
  { id: '3', organType: 'Kidney', hospital: 'Chris Hani Baragwanath', location: 'Johannesburg', appliedDate: '2026-06-20', status: 'Not Eligible' },
];

const statusSteps = ['Applied', 'Under Review', 'Invited', 'Approved'];

export function ApplicationTracker() {
  const statusColor = (status: string) => {
    if (status === 'Approved') return 'bg-green-100 text-green-700';
    if (status === 'Invited') return 'bg-blue-100 text-blue-700';
    if (status === 'Under Review') return 'bg-yellow-100 text-yellow-700';
    if (status === 'Not Eligible') return 'bg-gray-100 text-gray-500';
    return 'bg-purple-100 text-purple-700';
  };

  const getStepIndex = (status: string) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? idx : -1;
  };
return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
          <span className="text-sm font-medium">My Applications</span>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Application Tracker</h2>
          <p className="text-gray-500 mt-1">Track the status of your organ donation applications</p>
        </div>

        <div className="space-y-6">
          {mockApplications.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{app.organType === 'Kidney' ? '🫘' : '🫁'}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{app.organType} Donation</h3>
                    <p className="text-gray-400 text-xs">{app.hospital} • {app.location}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(app.status)}`}>{app.status}</span>
              </div>

              {app.status !== 'Not Eligible' && (
                <div className="flex items-center gap-1 mt-4">
                  {statusSteps.map((step, i) => (
                    <div key={step} className="flex-1 flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= getStepIndex(app.status) ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{i + 1}</div>
                      {i < statusSteps.length - 1 && <div className={`flex-1 h-1 mx-1 rounded ${i < getStepIndex(app.status) ? 'bg-red-600' : 'bg-gray-200'}`} />}
                    </div>
                  ))}
                </div>
              )}

              {app.status !== 'Not Eligible' && (
                <div className="flex justify-between mt-2">
                  {statusSteps.map((step) => (
                    <span key={step} className="text-xs text-gray-400">{step}</span>
                  ))}
                </div>
              )}

              {app.status === 'Not Eligible' && (
                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <p className="text-gray-500 text-xs">This application was reviewed and you were not selected. This does not affect future applications.</p>
                                  </div>
              )}

              <p className="text-gray-400 text-xs mt-3">Applied: {app.appliedDate}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
