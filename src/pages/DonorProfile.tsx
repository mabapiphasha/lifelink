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
  { value: 'illness', label: 'Illness / Feeling unwell' },
  { value: 'medication', label: 'On medication' },
  { value: 'surgery', label: 'Recent surgery / procedure' },
  { value: 'pregnancy', label: 'Pregnant / breastfeeding' },
  { value: 'travel', label: 'Travelling' },
  { value: 'other', label: 'Other reason' },
];

export function DonorProfile() {
  const navigate = useNavigate();
  const [donor, setDonor] = useState<DonorData | null>(null);
  const [donationHistory, setDonationHistory] = useState<DonationRecord[]>([]);
  const [cooldownDays, setCooldownDays] = useState(0);
  const [canDonate, setCanDonate] = useState(true);

  const [donationStatus, setDonationStatus] = useState<'available' | 'unavailable'>('available');
  const [unavailableReason, setUnavailableReason] = useState('');
  const [unavailableUntil, setUnavailableUntil] = useState('');
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [statusSaved, setStatusSaved] = useState(false);

  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editLocation, setEditLocation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editName, setEditName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  const LOCATIONS = [
    'Cape Town', 'Johannesburg', 'Nairobi', 'Dublin', 'Lagos',
    'Pretoria', 'Durban', 'Port Elizabeth', 'Bloemfontein',
    'Mombasa', 'Kisumu', 'Cork',
  ];

  useEffect(() => {
    const stored = localStorage.getItem('currentDonor');
    if (!stored) {
      navigate('/login');
      return;
    }
    const donorData = JSON.parse(stored);
    setDonor(donorData);
    setDonationStatus(donorData.donationStatus || 'available');
    setUnavailableReason(donorData.unavailableReason || '');
    setUnavailableUntil(donorData.unavailableUntil || '');
    fetchPendingRequestCount(donorData);
    setDonationHistory([
      { id: 'D-001', date: '2026-06-01', hospital: 'Groote Schuur Hospital', type: 'Whole Blood', units: 1 },
    ]);
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

  const fetchPendingRequestCount = async (donorData: any) => {
    try {
      const response = await axios.get(API.getDonorBloodRequests, {
        params: { donorId: donorData.donorId, bloodType: donorData.bloodType, location: donorData.location },
      });
      if (response.data?.success) {
        const requests = response.data.requests || [];
        const pending = requests.filter((r: any) => !r.donorResponse || r.donorResponse === 'pending');
        setPendingRequestCount(pending.length);
      }
    } catch {
      // non-critical
    }
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
    localStorage.setItem('currentDonor', JSON.stringify(updated));
    const allDonors = JSON.parse(localStorage.getItem('registeredDonors') || '[]');
    const idx = allDonors.findIndex((d: any) => d.email === donorData.email);
    if (idx !== -1) { allDonors[idx] = updated; localStorage.setItem('registeredDonors', JSON.stringify(allDonors)); }
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
    if (!donor) { setProfileError('Donor information not found'); return; }
    setProfileSaving(true);
    setProfileError('');
    try {
      let donorIdToUse = donor.donorId;
      if (!donorIdToUse) {
        try {
          const lookupResponse = await axios.post(API.getDonorByEmail, { email: donor.email });
          if (lookupResponse.data?.donor) {
            donorIdToUse = lookupResponse.data.donor.donorId;
            const updatedDonor = { ...donor, donorId: donorIdToUse };
            setDonor(updatedDonor);
            localStorage.setItem('currentDonor', JSON.stringify(updatedDonor));
          }
        } catch {
          setProfileError('Could not find your donor profile. Please re-register.');
          setProfileSaving(false);
          return;
        }
      }
      if (!donorIdToUse) {
        setProfileError('Unable to identify your donor profile. Please contact support.');
        setProfileSaving(false);
        return;
      }
      const response = await axios.post(API.updateDonorProfile, {
        donorId: donorIdToUse, location: editLocation, phone: editPhone, fullName: editName,
      });
      if (response.data?.donor) {
        const updatedDonor = {
          ...donor,
          location: response.data.donor.location,
          phone: response.data.donor.phone,
          name: response.data.donor.fullName,
          donorId: response.data.donor.donorId || donorIdToUse,
        };
        setDonor(updatedDonor);
        localStorage.setItem('currentDonor', JSON.stringify(updatedDonor));
        setShowEditProfile(false);
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      }
    } catch (error: any) {
      setProfileError(error.response?.data?.message || error.message || 'Failed to update profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  if (!donor) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-red-800 text-white px-6 py-4 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">LifeLink</Link>
          <div className="flex items-center gap-6">
            <span className="text-sm text-red-200">{donor.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm border border-red-600 px-4 py-1.5 rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Urgent Request Banner */}
        {pendingRequestCount > 0 && (
          <Link
            to="/blood-requests"
            className="flex items-center justify-between bg-red-700 hover:bg-red-800 text-white px-6 py-4 rounded-lg shadow transition-colors"
          >
            <div>
              <p className="font-semibold text-base">
                {pendingRequestCount === 1
                  ? '1 urgent donation request requires your response'
                  : `${pendingRequestCount} urgent donation requests require your response`}
              </p>
              <p className="text-red-200 text-sm mt-0.5">Please review and respond as soon as possible</p>
            </div>
            <span className="ml-4 bg-white text-red-700 text-sm font-bold px-3 py-1 rounded">
              {pendingRequestCount}
            </span>
          </Link>
        )}

        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-red-700">{donor.bloodType}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{donor.name}</h1>
              <p className="text-gray-500 text-sm mt-0.5">{donor.email} &bull; {donor.phone}</p>
              <p className="text-gray-400 text-xs mt-1">{donor.location} &bull; Registered {donor.registeredAt}</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {donationStatus === 'unavailable' ? (
                <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded text-xs font-medium">Unavailable to Donate</span>
              ) : canDonate ? (
                <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded text-xs font-medium">Eligible to Donate</span>
              ) : (
                <span className="bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded text-xs font-medium">Cooldown: {cooldownDays} days remaining</span>
              )}
              <button
                onClick={handleEditProfile}
                className="text-xs text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Edit Profile Panel */}
        {showEditProfile && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Edit Profile</h2>
                <p className="text-xs text-gray-400 mt-0.5">Update your contact information and location</p>
              </div>
              <button onClick={() => setShowEditProfile(false)} className="text-sm text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select your location</option>
                  {LOCATIONS.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}
                </select>
                <p className="text-xs text-gray-400 mt-1">You will only be matched with hospitals in your location.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="+27 123 456 7890"
                />
              </div>
              {profileError && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-700 text-sm">{profileError}</p>
                </div>
              )}
              <button
                onClick={handleSaveProfile}
                disabled={profileSaving || !editLocation || !editPhone || !editName}
                className={`w-full py-2.5 rounded text-sm font-semibold transition-colors ${
                  profileSaving || !editLocation || !editPhone || !editName
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {profileSaved && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-green-700 text-sm">Profile updated successfully.</p>
          </div>
        )}

        {/* Donation Availability */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Donation Availability</h2>
              <p className="text-xs text-gray-400 mt-0.5">Let hospitals know whether you are available to donate</p>
            </div>
            <button
              onClick={() => { setShowStatusPanel(!showStatusPanel); setStatusSaved(false); }}
              className="text-sm text-red-600 hover:text-red-800 border border-red-200 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
            >
              {showStatusPanel ? 'Cancel' : 'Update Status'}
            </button>
          </div>

          {!showStatusPanel && (
            <div className={`flex items-center gap-3 p-4 rounded border ${donationStatus === 'available' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${donationStatus === 'available' ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className={`text-sm font-medium ${donationStatus === 'available' ? 'text-green-700' : 'text-red-700'}`}>
                  {donationStatus === 'available' ? 'Available to Donate' : 'Currently Unavailable'}
                </p>
                {donationStatus === 'unavailable' && donor?.unavailableReason && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Reason: {UNAVAILABLE_REASONS.find(r => r.value === donor.unavailableReason)?.label || donor.unavailableReason}
                    {donor.unavailableUntil && ` — until ${donor.unavailableUntil}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {showStatusPanel && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setDonationStatus('available')}
                  className={`flex-1 py-2.5 rounded text-sm font-semibold border-2 transition-colors ${donationStatus === 'available' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}
                >
                  Available
                </button>
                <button
                  onClick={() => setDonationStatus('unavailable')}
                  className={`flex-1 py-2.5 rounded text-sm font-semibold border-2 transition-colors ${donationStatus === 'unavailable' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:border-red-400'}`}
                >
                  Unavailable
                </button>
              </div>
              {donationStatus === 'unavailable' && (
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <select
                      value={unavailableReason}
                      onChange={(e) => setUnavailableReason(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select a reason</option>
                      {UNAVAILABLE_REASONS.map(r => (<option key={r.value} value={r.value}>{r.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected return date <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="date"
                      value={unavailableUntil}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setUnavailableUntil(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}
              <button
                onClick={handleSaveStatus}
                disabled={donationStatus === 'unavailable' && !unavailableReason}
                className={`w-full py-2.5 rounded text-sm font-semibold transition-colors ${
                  donationStatus === 'unavailable' && !unavailableReason
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                Save Status
              </button>
            </div>
          )}

          {statusSaved && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
              <p className="text-green-700 text-sm">Availability status updated.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4">
          <Link to="/blood-requests" className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow text-center relative">
            {pendingRequestCount > 0 && (
              <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {pendingRequestCount}
              </span>
            )}
            <p className="text-sm font-semibold text-gray-800">Blood Requests</p>
            <p className="text-xs text-gray-400 mt-1">Review and respond to hospital requests</p>
          </Link>
        </div>

        {/* Donation History */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Donation History</h2>
          {donationHistory.length === 0 ? (
            <p className="text-gray-400 text-sm">No donations recorded yet. Your history will appear here after your first donation.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {donationHistory.map((record) => (
                <div key={record.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{record.type} — {record.units} unit(s)</p>
                    <p className="text-xs text-gray-400 mt-0.5">{record.hospital} &bull; {record.date}</p>
                  </div>
                  <span className="text-green-600 text-xs font-semibold uppercase tracking-wide">Completed</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
