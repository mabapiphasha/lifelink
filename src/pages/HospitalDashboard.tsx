import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BloodType, UrgencyTier, BloodRequest, OrganRequest, OrganApplication, OrganType, OrganApplicationStatus } from '../types';
import axios from 'axios';
import { API } from '../config/api';
import { useHospitalAuth } from '../context/HospitalAuthContext';
import { CooldownTrackerContent } from './CooldownTracker';

const ORGAN_TYPES: OrganType[] = [
  'Kidney', 'Cornea', 'Skin', 'Bone Marrow', 'Intestine', 'Heart Valve',
];

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const organIcon = (organ: string) => {
  const icons: Record<string, string> = {
    Kidney: '🫘', Cornea: '👁️',
    Skin: '🧴', 'Bone Marrow': '🦴', Intestine: '🧬', 'Heart Valve': '🫀',
  };
  return icons[organ] || '🏥';
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
  if (s === 'closed') return 'bg-gray-100 text-gray-600';
  return 'bg-green-100 text-green-700';
};

const appStatusColor = (status: OrganApplicationStatus) => {
  switch (status) {
    case 'Applied': return 'bg-blue-100 text-blue-700';
    case 'Under Review': return 'bg-yellow-100 text-yellow-700';
    case 'Invited': return 'bg-purple-100 text-purple-700';
    case 'Approved': return 'bg-green-100 text-green-700';
    case 'Not Eligible': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};


export function HospitalDashboard() {
  const navigate = useNavigate();
  const { hospital, logout, isLoggedIn } = useHospitalAuth();

  // Active tab: 'blood' | 'organ-requests' | 'organ-applications' | 'cooldown'
  const [activeTab, setActiveTab] = useState<'blood' | 'organ-requests' | 'organ-applications' | 'cooldown'>('blood');

  // --- Blood state ---
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [showBloodForm, setShowBloodForm] = useState(false);
  const [newBlood, setNewBlood] = useState({ bloodType: '' as BloodType, urgency: 'High' as UrgencyTier, unitsNeeded: 1 });
  const [bloodLoading, setBloodLoading] = useState(true);
  const [bloodSubmitting, setBloodSubmitting] = useState(false);
  const [bloodError, setBloodError] = useState('');

  // --- Organ Request state ---
  const [organRequests, setOrganRequests] = useState<OrganRequest[]>([]);
  const [showOrganForm, setShowOrganForm] = useState(false);
  const [newOrgan, setNewOrgan] = useState({
    organType: '' as OrganType,
    bloodTypeCompatibility: [] as BloodType[],
    urgency: 'High' as UrgencyTier,
    patientAge: '',
    patientGender: '',
    notes: '',
  });
  const [organLoading, setOrganLoading] = useState(false);
  const [organSubmitting, setOrganSubmitting] = useState(false);
  const [organError, setOrganError] = useState('');

  // --- Organ Applications state ---
  const [organApplications, setOrganApplications] = useState<OrganApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState('');
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) navigate('/hospital-login');
  }, [isLoggedIn, navigate]);

  // Fetch blood requests on mount
  useEffect(() => { fetchBloodRequests(); }, []);

  // Fetch organ data when tab switches
  useEffect(() => {
    if (activeTab === 'organ-requests') fetchOrganRequests();
    if (activeTab === 'organ-applications') fetchOrganApplications();
  }, [activeTab]);

  const fetchBloodRequests = async () => {
    setBloodLoading(true);
    try {
      const res = await axios.get(API.getBloodRequests);
      setBloodRequests(res.data.requests || []);
    } catch { setBloodRequests([]); }
    finally { setBloodLoading(false); }
  };

  const fetchOrganRequests = async () => {
    setOrganLoading(true);
    setOrganError('');
    try {
      const res = await axios.get(API.getOrganRequests, { params: { hospitalId: hospital?.hospitalId } });
      setOrganRequests(res.data.requests || []);
    } catch { setOrganError('Failed to load organ requests.'); }
    finally { setOrganLoading(false); }
  };

  const fetchOrganApplications = async () => {
    setAppsLoading(true);
    setAppsError('');
    try {
      const res = await axios.get(API.getOrganApplicationsByHospital, { params: { hospitalId: hospital?.hospitalId } });
      const apps = (res.data.applications || []).map((a: any) => ({
        ...a,
        id: a.id ?? a.applicationId,
      }));
      setOrganApplications(apps);
    } catch { setAppsError('Failed to load donor applications.'); }
    finally { setAppsLoading(false); }
  };



  const handleBloodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBloodSubmitting(true);
    setBloodError('');
    try {
      const res = await axios.post(API.createBloodRequest, {
        hospitalId: hospital?.hospitalId,
        hospitalName: hospital?.hospitalName,
        bloodType: newBlood.bloodType,
        urgency: newBlood.urgency,
        unitsNeeded: newBlood.unitsNeeded,
      });
      if (res.data.success) {
        setShowBloodForm(false);
        setNewBlood({ bloodType: '' as BloodType, urgency: 'High', unitsNeeded: 1 });
        fetchBloodRequests();
      }
    } catch (err: any) {
      setBloodError(err.response?.data?.error || 'Failed to create request');
    } finally { setBloodSubmitting(false); }
  };

  const handleOrganSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgan.organType) { setOrganError('Please select an organ type.'); return; }
    if (newOrgan.bloodTypeCompatibility.length === 0) { setOrganError('Select at least one compatible blood type.'); return; }
    setOrganSubmitting(true);
    setOrganError('');
    try {
      const res = await axios.post(API.createOrganRequest, {
        hospitalId: hospital?.hospitalId,
        hospitalName: hospital?.hospitalName,
        location: hospital?.location,
        organType: newOrgan.organType,
        bloodTypeCompatibility: newOrgan.bloodTypeCompatibility,
        urgency: newOrgan.urgency,
        patientAge: newOrgan.patientAge ? Number(newOrgan.patientAge) : undefined,
        patientGender: newOrgan.patientGender || undefined,
        notes: newOrgan.notes || undefined,
      });
      if (res.data.success) {
        setShowOrganForm(false);
        setNewOrgan({ organType: '' as OrganType, bloodTypeCompatibility: [], urgency: 'High', patientAge: '', patientGender: '', notes: '' });
        fetchOrganRequests();
      }
    } catch (err: any) {
      setOrganError(err.response?.data?.error || 'Failed to create organ request');
    } finally { setOrganSubmitting(false); }
  };

  const toggleBloodType = (bt: BloodType) => {
    setNewOrgan(prev => ({
      ...prev,
      bloodTypeCompatibility: prev.bloodTypeCompatibility.includes(bt)
        ? prev.bloodTypeCompatibility.filter(b => b !== bt)
        : [...prev.bloodTypeCompatibility, bt],
    }));
  };

  const handleUpdateAppStatus = async (appId: string, newStatus: OrganApplicationStatus) => {
    setUpdatingAppId(appId);
    try {
      await axios.post(API.updateOrganApplicationStatus, {
        applicationId: appId,
        status: newStatus,
        hospitalId: hospital?.hospitalId,
      });
      setOrganApplications(prev =>
        prev.map(a => a.id === appId ? { ...a, status: newStatus, updatedAt: new Date().toISOString() } : a)
      );
    } catch {
      alert('Failed to update status. Please try again.');
    } finally { setUpdatingAppId(null); }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🩸</span>
          <span className="font-bold text-lg">LifeLink</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-90">🏥 {hospital?.hospitalName}</span>
          <button
            onClick={() => { logout(); navigate('/hospital-login'); }}
            className="bg-red-800 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Hospital Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">{hospital?.hospitalName} &bull; {hospital?.location}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'blood', label: '🩸 Blood Requests' },
            { key: 'organ-requests', label: '🫀 Organ Requests' },
            { key: 'organ-applications', label: '📋 Donor Applications' },
            { key: 'cooldown', label: '⏳ Cooldown Tracker' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>



        {/* ── BLOOD REQUESTS TAB ── */}
        {activeTab === 'blood' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Blood Requests</h2>
              <button
                onClick={() => setShowBloodForm(!showBloodForm)}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all hover:scale-105 active:scale-95"
              >
                + New Request
              </button>
            </div>

            {showBloodForm && (
              <form onSubmit={handleBloodSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-800">Create Urgent Blood Request</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Blood Type</label>
                    <select required value={newBlood.bloodType} onChange={e => setNewBlood({ ...newBlood, bloodType: e.target.value as BloodType })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option value="">Select</option>
                      {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Urgency</label>
                    <select value={newBlood.urgency} onChange={e => setNewBlood({ ...newBlood, urgency: e.target.value as UrgencyTier })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option>Critical</option>
                      <option>High</option>
                      <option>Standard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Units Needed</label>
                    <input type="number" min={1} max={20} value={newBlood.unitsNeeded}
                      onChange={e => setNewBlood({ ...newBlood, unitsNeeded: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                </div>
                {bloodError && <p className="text-red-600 text-sm">❌ {bloodError}</p>}
                <div className="flex gap-3">
                  <button type="submit" disabled={bloodSubmitting}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
                    {bloodSubmitting ? '⏳ Submitting...' : 'Submit Request'}
                  </button>
                  <button type="button" onClick={() => setShowBloodForm(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {bloodLoading ? (
              <p className="text-gray-400 text-center py-10">⏳ Loading requests...</p>
            ) : bloodRequests.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">🩸</p>
                <p className="font-medium">No blood requests yet.</p>
                <p className="text-sm">Click "+ New Request" to post your first urgent request.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bloodRequests.map((req: any) => (
                  <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-red-600 w-12 text-center">{req.bloodType}</span>
                      <div>
                        <div className="flex gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${urgencyColor(req.urgency)}`}>{req.urgency}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(req.status)}`}>{req.status}</span>
                        </div>
                        <p className="text-sm text-gray-600">{req.units || req.unitsNeeded} units needed &bull; {req.donorsConfirmed || 0} donors confirmed</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



        {/* ── ORGAN REQUESTS TAB ── */}
        {activeTab === 'organ-requests' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Organ Requests</h2>
              <button
                onClick={() => setShowOrganForm(!showOrganForm)}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all hover:scale-105 active:scale-95"
              >
                + New Organ Request
              </button>
            </div>

            {showOrganForm && (
              <form onSubmit={handleOrganSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-800">Post Organ Donor Request</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Organ Type *</label>
                    <select required value={newOrgan.organType}
                      onChange={e => setNewOrgan({ ...newOrgan, organType: e.target.value as OrganType })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option value="">Select organ</option>
                      {ORGAN_TYPES.map(o => <option key={o} value={o}>{organIcon(o)} {o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Urgency *</label>
                    <select value={newOrgan.urgency}
                      onChange={e => setNewOrgan({ ...newOrgan, urgency: e.target.value as UrgencyTier })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option>Critical</option>
                      <option>High</option>
                      <option>Standard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Patient Age</label>
                    <input type="number" min={1} max={120} placeholder="e.g. 34"
                      value={newOrgan.patientAge}
                      onChange={e => setNewOrgan({ ...newOrgan, patientAge: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Patient Gender</label>
                    <select value={newOrgan.patientGender}
                      onChange={e => setNewOrgan({ ...newOrgan, patientGender: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option value="">Prefer not to say</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Compatible Blood Types *</label>
                  <div className="flex flex-wrap gap-2">
                    {BLOOD_TYPES.map(bt => (
                      <button key={bt} type="button" onClick={() => toggleBloodType(bt)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          newOrgan.bloodTypeCompatibility.includes(bt)
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
                        }`}>
                        {bt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Additional Notes</label>
                  <textarea rows={2} placeholder="Any additional clinical details..."
                    value={newOrgan.notes}
                    onChange={e => setNewOrgan({ ...newOrgan, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                </div>

                {organError && <p className="text-red-600 text-sm">❌ {organError}</p>}
                <div className="flex gap-3">
                  <button type="submit" disabled={organSubmitting}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
                    {organSubmitting ? '⏳ Submitting...' : 'Post Request'}
                  </button>
                  <button type="button" onClick={() => setShowOrganForm(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {organLoading ? (
              <p className="text-gray-400 text-center py-10">⏳ Loading organ requests...</p>
            ) : organError && organRequests.length === 0 ? (
              <p className="text-red-500 text-center py-10">{organError}</p>
            ) : organRequests.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">🫀</p>
                <p className="font-medium">No organ requests yet.</p>
                <p className="text-sm">Click "+ New Organ Request" to post one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {organRequests.map((req: OrganRequest) => (
                  <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{organIcon(req.organType)}</span>
                        <div>
                          <p className="font-semibold text-gray-800">{req.organType} Donor Needed</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${urgencyColor(req.urgency)}`}>{req.urgency}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(req.status)}`}>{req.status}</span>
                            {req.patientAge && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Patient: {req.patientAge}y {req.patientGender}</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Compatible: {Array.isArray(req.bloodTypeCompatibility) ? req.bloodTypeCompatibility.join(', ') : (req.bloodTypeCompatibility as any)?.values?.join(', ') || '—'} &bull; {req.applicantCount || 0} applicants
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                    {req.notes && <p className="text-xs text-gray-500 mt-2 pl-12 italic">📝 {req.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



        {/* ── DONOR APPLICATIONS TAB ── */}
        {activeTab === 'organ-applications' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Organ Donor Applications</h2>
              <button onClick={fetchOrganApplications}
                className="text-sm text-red-600 hover:underline">
                🔄 Refresh
              </button>
            </div>

            {appsLoading ? (
              <p className="text-gray-400 text-center py-10">⏳ Loading applications...</p>
            ) : appsError ? (
              <p className="text-red-500 text-center py-10">{appsError}</p>
            ) : organApplications.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">📋</p>
                <p className="font-medium">No donor applications yet.</p>
                <p className="text-sm">Applications from donors will appear here once submitted.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {organApplications.map((app: OrganApplication) => {
                  const isExpanded = expandedApp === app.id;
                  const nextStatuses: OrganApplicationStatus[] = (() => {
                    switch (app.status) {
                      case 'Applied': return ['Under Review', 'Not Eligible'];
                      case 'Under Review': return ['Invited', 'Not Eligible'];
                      case 'Invited': return ['Approved', 'Not Eligible'];
                      default: return [];
                    }
                  })();

                  return (
                    <div key={app.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Card header */}
                      <div className="p-4 flex items-start justify-between cursor-pointer"
                        onClick={() => setExpandedApp(isExpanded ? null : app.id)}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{organIcon(app.organType)}</span>
                          <div>
                            <p className="font-semibold text-gray-800">{app.donorName || 'Anonymous Donor'}</p>
                            <p className="text-xs text-gray-500">
                              {app.organType} &bull; Blood type: {app.bloodType} &bull; Age: {app.age}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Applied: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—'}
                              {app.updatedAt && ` &bull; Updated: ${new Date(app.updatedAt).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${appStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                          <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-xs text-gray-500">BMI</p>
                              <p className="font-medium">{app.bmi ?? '—'}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-xs text-gray-500">Smoking</p>
                              <p className="font-medium capitalize">{app.smokingStatus}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-xs text-gray-500">Alcohol</p>
                              <p className="font-medium capitalize">{app.alcoholUse}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-xs text-gray-500">Contact</p>
                              <p className="font-medium text-xs">{app.donorPhone || app.donorEmail || '—'}</p>
                            </div>
                          </div>

                          {app.existingConditions?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">Existing Conditions</p>
                              <div className="flex flex-wrap gap-1">
                                {app.existingConditions.map((c, i) => (
                                  <span key={i} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{c}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {app.medications?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">Medications</p>
                              <div className="flex flex-wrap gap-1">
                                {app.medications.map((m, i) => (
                                  <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{m}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Status actions */}
                          {nextStatuses.length > 0 && (
                            <div className="flex gap-2 flex-wrap pt-2">
                              <p className="text-xs font-medium text-gray-600 w-full">Update Status:</p>
                              {nextStatuses.map(s => (
                                <button key={s}
                                  disabled={updatingAppId === app.id}
                                  onClick={() => handleUpdateAppStatus(app.id, s)}
                                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                                    s === 'Not Eligible'
                                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                      : 'bg-red-600 hover:bg-red-700 text-white'
                                  }`}>
                                  {updatingAppId === app.id ? '⏳ Saving...' : `→ ${s}`}
                                </button>
                              ))}
                            </div>
                          )}

                          {(app.status === 'Approved' || app.status === 'Not Eligible') && (
                            <p className="text-xs text-gray-400 italic">
                              {app.status === 'Approved' ? '✅ This application has been approved.' : '❌ This application is closed.'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── COOLDOWN TRACKER TAB ── */}
        {activeTab === 'cooldown' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">56-Day Cooldown Tracker</h2>
            </div>
            <CooldownTrackerContent />
          </div>
        )}

      </div>
    </div>
  );
}
