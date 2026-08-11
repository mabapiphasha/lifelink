
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../config/api';

interface DonorData {
  donorId: string;
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  location: string;
  registeredAt: string;
  lastDonation?: string;
  donationStatus?: 'available' | 'unavailable';
  unavailableReason?: string;
  unavailableUntil?: string;
}

interface DonationRecord {
  id: string;
  date: string;
  hospital: string;
  type: string;
  units: number;
}

const UNAVAILABLE_REASONS = [
  { value: 'illness', label: '🤒 Illness / Feeling unwell' },
  { value: 'medication', label: '💊 On medication' },
  { value: 'surgery', label: '🏥 Recent surgery / procedure' },
  { value: 'pregnancy', label: '🤰 Pregnant / breastfeeding' },
  { value: 'travel', label: '✈️ Travelling' },
  { value: 'other', label: '📝 Other reason' },
];

export function DonorProfile() {
  const navigate = useNavigate();
  const [donor, setDonor] = useState<DonorData | null>(null);
  const [donationHistory, setDonationHistory] = useState<DonationRecord[]>([]);
  const [cooldownDays, setCooldownDays] = useState(0);
  const [canDonate, setCanDonate] = useState(true);

  // Donation status state
  const [donationStatus, setDonationStatus] = useState<'available' | 'unavailable'>('available');
  const [unavailableReason, setUnavailableReason] = useState('');
  const [unavailableUntil, setUnavailableUntil] = useState('');
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [statusSaved, setStatusSaved] = useState(false);

  // Edit profile state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editLocation, setEditLocation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editName, setEditName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  const LOCATIONS = [
    'Cape Town',
    'Johannesburg',
    'Nairobi',
    'Dublin',
    'Lagos',
    'Pretoria',
    'Durban',
    'Port Elizabeth',
    'Bloemfontein',
    'Mombasa',
    'Kisumu',
    'Cork'
  ];

  useEffect(() => {
    // Load donor from localStorage (will be Cognito session later)
    const stored = localStorage.getItem('currentDonor');
    if (!stored) {
      navigate('/login');
      return;
    }

    const donorData = JSON.parse(stored);
    setDonor(donorData);

    // Load saved donation status
    setDonationStatus(donorData.donationStatus || 'available');
    setUnavailableReason(donorData.unavailableReason || '');
    setUnavailableUntil(donorData.unavailableUntil || '');

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

  const handleSaveStatus = () => {
    const stored = localStorage.getItem('currentDonor');
    if (!stored) return;
    const donorData = JSON.parse(stored);

    const updated = {
      ...donorData,
      donationStatus,
      unavailableReason: donationStatus === 'unavailable' ? unavailableReason : '',
      unavailableUntil: donationStatus === 'unavailable' ? unavailableUntil : '',
    };

    // Update currentDonor
    localStorage.setItem('currentDonor', JSON.stringify(updated));

    // Also update in the registeredDonors list
    const allDonors = JSON.parse(localStorage.getItem('registeredDonors') || '[]');
    const idx = allDonors.findIndex((d: any) => d.email === donorData.email);
    if (idx !== -1) {
      allDonors[idx] = updated;
      localStorage.setItem('registeredDonors', JSON.stringify(allDonors));
    }

    setDonor(updated);
    setShowStatusPanel(false);
    setStatusSaved(true);
    setTimeout(() => setStatusSaved(false), 3000);
  };

  const handleEditProfile = () => {
    if (!donor) return;
    setEditLocation(donor.location);
    setEditPhone(donor.phone);
    setEditName(donor.name);
    setShowEditProfile(true);
    setProfileError('');
    setProfileSaved(false);
  };

  const handleSaveProfile = async () => {
    if (!donor || !donor.donorId) {
      setProfileError('Donor ID not found');
      return;
    }

    setProfileSaving(true);
    setProfileError('');

    try {
      const response = await axios.post(API.updateDonorProfile, {
        donorId: donor.donorId,
        location: editLocation,
        phone: editPhone,
        fullName: editName
      });

      if (response.data && response.data.donor) {
        const updatedDonor = {
          ...donor,
          location: response.data.donor.location,
          phone: response.data.donor.phone,
          name: response.data.donor.fullName
        };

        setDonor(updatedDonor);
        localStorage.setItem('currentDonor', JSON.stringify(updatedDonor));
        
        setShowEditProfile(false);
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setProfileError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setProfileSaving(false);
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
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{donor.name}</h1>
              <p className="text-gray-500 text-sm">{donor.email} • {donor.phone}</p>
              <p className="text-gray-400 text-xs mt-1">📍 {donor.location} • Registered {donor.registeredAt}</p>
            </div>
            <div className="flex flex-col gap-2">
              {donationStatus === 'unavailable' ? (
                <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium">🔴 Unavailable to Donate</span>
              ) : canDonate ? (
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">✅ Eligible to Donate</span>
              ) : (
                <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">⏳ Cooldown: {cooldownDays} days left</span>
              )}
              <button
                onClick={handleEditProfile}
                className="text-sm text-red-600 hover:text-red-800 font-medium border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Edit Profile Panel */}
        {showEditProfile && (
          <div className="bg-white rounded-2xl p-6 shadow-md border border-red-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">✏️ Edit Profile</h2>
                <p className="text-xs text-gray-400 mt-0.5">Update your contact information and location</p>
              </div>
              <button
                onClick={() => setShowEditProfile(false)}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📍 Location</label>
                <select
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select your location</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  💡 You'll only be matched with hospitals in your location
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📱 Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="+27 123 456 7890"
                />
              </div>

              {profileError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <p className="text-red-700 text-sm font-medium">❌ {profileError}</p>
                </div>
              )}

              <button
                onClick={handleSaveProfile}
                disabled={profileSaving || !editLocation || !editPhone || !editName}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  profileSaving || !editLocation || !editPhone || !editName
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'
                }`}
              >
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Success toast for profile update */}
        {profileSaved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center mb-6">
            <p className="text-green-700 text-sm font-medium">✅ Profile updated successfully!</p>
          </div>
        )}

        {/* Donation Status */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">💉 Donation Availability</h2>
              <p className="text-xs text-gray-400 mt-0.5">Let hospitals know if you're available to donate</p>
            </div>
            <button
              onClick={() => { setShowStatusPanel(!showStatusPanel); setStatusSaved(false); }}
              className="text-sm text-red-600 hover:text-red-800 font-medium border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
            >
              {showStatusPanel ? 'Cancel' : 'Update Status'}
            </button>
          </div>

          {/* Current status display */}
          {!showStatusPanel && (
            <div className={`flex items-center gap-3 p-4 rounded-xl ${donationStatus === 'available' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
              <div className={`w-3 h-3 rounded-full ${donationStatus === 'available' ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className={`text-sm font-semibold ${donationStatus === 'available' ? 'text-green-700' : 'text-red-700'}`}>
                  {donationStatus === 'available' ? 'Available to Donate' : 'Currently Unavailable'}
                </p>
                {donationStatus === 'unavailable' && donor?.unavailableReason && (
                  <p className="text-xs text-red-500 mt-0.5">
                    Reason: {UNAVAILABLE_REASONS.find(r => r.value === donor.unavailableReason)?.label || donor.unavailableReason}
                    {donor.unavailableUntil && ` · Until ${donor.unavailableUntil}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Status update panel */}
          {showStatusPanel && (
            <div className="space-y-4">
              {/* Toggle */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDonationStatus('available')}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${donationStatus === 'available' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}
                >
                  ✅ Available
                </button>
                <button
                  onClick={() => setDonationStatus('unavailable')}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${donationStatus === 'unavailable' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:border-red-400'}`}
                >
                  🔴 Unavailable
                </button>
              </div>

              {/* Reason & date — only shown when unavailable */}
              {donationStatus === 'unavailable' && (
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <select
                      value={unavailableReason}
                      onChange={(e) => setUnavailableReason(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select a reason</option>
                      {UNAVAILABLE_REASONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected return date <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="date"
                      value={unavailableUntil}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setUnavailableUntil(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSaveStatus}
                disabled={donationStatus === 'unavailable' && !unavailableReason}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${donationStatus === 'unavailable' && !unavailableReason ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'}`}
              >
                Save Status
              </button>
            </div>
          )}

          {/* Success toast */}
          {statusSaved && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-green-700 text-sm font-medium">✅ Status updated successfully</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <Link to="/cooldown" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <span className="text-2xl">📅</span>
            <p className="text-sm font-medium text-gray-700 mt-2">Cooldown Tracker</p>
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


      </main>
    </div>
  );
}

