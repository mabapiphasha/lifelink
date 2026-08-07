
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface DonorData {
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  location: string;
  registeredAt: string;
  lastDonation?: string;
}

interface OrganApplication {
  id: string;
  organ: string;
  hospital: string;
  appliedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Shortlisted';
  rejectionReason?: string;
}

interface DonationRecord {
  id: string;
  date: string;
  hospital: string;
  type: string;
  units: number;
}

export function DonorProfile() {
  const navigate = useNavigate();
  const [donor, setDonor] = useState<DonorData | null>(null);
  const [organApplications, setOrganApplications] = useState<OrganApplication[]>([]);
  const [donationHistory, setDonationHistory] = useState<DonationRecord[]>([]);
  const [cooldownDays, setCooldownDays] = useState(0);
  const [canDonate, setCanDonate] = useState(true);

  useEffect(() => {
    // Load donor from localStorage (will be Cognito session later)
    const stored = localStorage.getItem('currentDonor');
    if (!stored) {
      navigate('/login');
      return;
    }

    const donorData = JSON.parse(stored);
    setDonor(donorData);

    // TODO: Replace with API calls when Phasha connects backend
    // Simulated organ applications
    setOrganApplications([
      {
        id: 'OA-001',
        organ: 'Kidney',
        hospital: 'Groote Schuur Hospital',
        appliedAt: '2026-07-15',
        status: 'Pending',
      },
      {
        id: 'OA-002',
        organ: 'Liver',
        hospital: 'Tygerberg Hospital',
        appliedAt: '2026-06-20',
        status: 'Rejected',
        rejectionReason: 'BMI above threshold (32). Recommended to reapply after reaching BMI < 30.',
      },
    ]);

    // Simulated donation history
    setDonationHistory([
      {
        id: 'D-001',
        date: '2026-06-01',
        hospital: 'Groote Schuur Hospital',
        type: 'Whole Blood',
        units: 1,
      },
    ]);

    // Calculate cooldown
    if (donorData.lastDonation) {
      const lastDate = new Date(donorData.lastDonation);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      const remaining = 56 - diffDays;
      if (remaining > 0) {
        setCooldownDays(remaining);
        setCanDonate(false);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentDonor');
    navigate('/');
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Shortlisted':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  if (!donor) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm">👋 {donor.name}</span>
            <button onClick={handleLogout} className="text-sm bg-red-900 px-3 py-1 rounded-lg hover:bg-red-950">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-red-700">{donor.bloodType}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{donor.name}</h1>
              <p className="text-gray-500 text-sm">{donor.email} • {donor.phone}</p>
              <p className="text-gray-400 text-xs mt-1">📍 {donor.location} • Registered {donor.registeredAt}</p>
            </div>
            <div className="ml-auto">
              {canDonate ? (
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">✅ Eligible to Donate</span>
              ) : (
                <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">⏳ Cooldown: {cooldownDays} days left</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Link to="/organ-bulletin" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <span className="text-2xl">🫁</span>
            <p className="text-sm font-medium text-gray-700 mt-2">Browse Organ Requests</p>
          </Link>
          <Link to="/cooldown" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <span className="text-2xl">📅</span>
            <p className="text-sm font-medium text-gray-700 mt-2">Cooldown Tracker</p>
          </Link>
          <Link to="/leaderboard" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <span className="text-2xl">🏆</span>
            <p className="text-sm font-medium text-gray-700 mt-2">Leaderboard</p>
          </Link>
        </div>

        {/* Donation History */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🩸 Donation History</h2>
          {donationHistory.length === 0 ? (
            <p className="text-gray-400 text-sm">No donations yet. You'll see your history here after your first donation.</p>
          ) : (
            <div className="space-y-3">
              {donationHistory.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{record.type} — {record.units} unit(s)</p>
                    <p className="text-gray-400 text-xs">{record.hospital} • {record.date}</p>
                  </div>
                  <span className="text-green-600 text-sm font-medium">✓ Completed</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Organ Applications */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🫁 Organ Donation Applications</h2>
          {organApplications.length === 0 ? (
            <p className="text-gray-400 text-sm">No organ donation applications yet.</p>
          ) : (
            <div className="space-y-3">
              {organApplications.map((app) => (
                <div key={app.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{app.organ} Donation</p>
                      <p className="text-gray-400 text-xs">{app.hospital} • Applied {app.appliedAt}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  {app.status === 'Rejected' && app.rejectionReason && (
                    <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3">
                      <p className="text-red-600 text-xs"><strong>Reason:</strong> {app.rejectionReason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

