import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../config/api';

interface OrganRequest {
  id: string;
  organType: string;
  bloodTypeCompatibility: string[];
  hospital: string;
  location: string;
  urgency: 'Critical' | 'High' | 'Standard';
  createdAt: string;
  applicantCount: number;
  status: string;
}

export function OrganBulletin() {
  const navigate = useNavigate();

  // Requests state
  const [requests, setRequests] = useState<OrganRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Application state
  const [applied, setApplied] = useState<string[]>([]);
  const [showForm, setShowForm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ refNumber: string; organ: string } | null>(null);

  const [formData, setFormData] = useState({
    age: '',
    bmi: '',
    smokingStatus: 'non-smoker',
    alcoholUse: 'none',
    existingConditions: '',
    medications: '',
    contactPhone: '',
    contactEmail: '',
    consentGiven: false,
  });

  // Fetch live organ requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await axios.get(API.getOrganRequests);
      const raw = res.data.requests || [];

      // Normalise DynamoDB field names to frontend shape
      const normalised: OrganRequest[] = raw
        .filter((r: any) => r.status === 'Open' || !r.status)
        .map((r: any) => ({
          id: r.requestId || r.id,
          organType: r.organType,
          bloodTypeCompatibility: Array.isArray(r.bloodTypeCompatibility)
            ? r.bloodTypeCompatibility
            : r.bloodTypeCompatibility?.values || [],
          hospital: r.hospitalName || r.hospital || '',
          location: r.location || '',
          urgency: r.urgency as 'Critical' | 'High' | 'Standard',
          createdAt: r.createdAt || '',
          applicantCount: Number(r.applicantCount) || 0,
          status: r.status || 'Open',
        }));

      setRequests(normalised);
    } catch {
      setLoadError('Failed to load organ requests. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const urgencyColor = (urgency: string) => {
    if (urgency === 'Critical') return 'bg-red-100 text-red-700 border-red-200';
    if (urgency === 'High') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const organIcon = (organ: string) => {
    const icons: Record<string, string> = {
      Kidney: '🫘', Liver: '🫁', Heart: '🫀', Lung: '🫁',
      Pancreas: '🧬', Intestine: '🧬', Cornea: '👁️',
      Skin: '🧴', 'Bone Marrow': '🦴', 'Heart Valve': '🫀',
    };
    return icons[organ] || '🏥';
  };

  const formatDate = (iso: string) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
  };

  const handleApply = (reqId: string) => {
    setShowForm(reqId);
    setError('');
  };

  const resetForm = () => {
    setFormData({
      age: '', bmi: '', smokingStatus: 'non-smoker', alcoholUse: 'none',
      existingConditions: '', medications: '', contactPhone: '', contactEmail: '',
      consentGiven: false,
    });
  };

  const handleSubmitApplication = async (req: OrganRequest) => {
    if (!formData.consentGiven) { setError('You must provide consent to proceed.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const response = await axios.post(API.submitOrganApplication, {
        requestId: req.id,
        organ: req.organType,
        hospital: req.hospital,
        bloodType: req.bloodTypeCompatibility[0] || '',
        age: Number(formData.age),
        bmi: formData.bmi ? Number(formData.bmi) : null,
        smokingStatus: formData.smokingStatus,
        alcoholUse: formData.alcoholUse,
        existingConditions: formData.existingConditions ? formData.existingConditions.split(',').map(s => s.trim()) : [],
        medications: formData.medications ? formData.medications.split(',').map(s => s.trim()) : [],
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        consentGiven: true,
      });
      if (response.data.success) {
        setApplied([...applied, req.id]);
        setShowForm(null);
        setSuccess({ refNumber: response.data.refNumber, organ: req.organType });
        resetForm();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Application failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-2">Your {success.organ} donation application has been received.</p>
          <p className="text-sm text-gray-400 mb-4">Reference: <span className="font-mono font-bold text-gray-700">{success.refNumber}</span></p>
          <p className="text-sm text-gray-500 mb-6">The transplant team will review your application within 1-3 business days.</p>
          <div className="space-y-3">
            <button onClick={() => navigate('/donor-application')} className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium">Track Application →</button>
            <button onClick={() => setSuccess(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium">Browse More Requests</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Organ Donation</span>
            <button onClick={fetchRequests} className="text-xs bg-red-700 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-all">🔄 Refresh</button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Organ Donation Bulletin</h2>
          <p className="text-gray-500 mt-1">Browse open requests and apply to save a life. All medical testing happens in person at the hospital.</p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3 animate-pulse">🫀</p>
            <p className="font-medium">Loading organ requests...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && loadError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">{loadError}</p>
            <button onClick={fetchRequests} className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Try Again</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !loadError && requests.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🫀</p>
            <p className="font-medium text-lg">No open organ requests at the moment.</p>
            <p className="text-sm mt-1">Check back soon — hospitals post new requests regularly.</p>
          </div>
        )}

        {/* Requests list */}
        {!loading && requests.length > 0 && (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-2xl">
                      {organIcon(req.organType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-gray-900">{req.organType} Donor Needed</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${urgencyColor(req.urgency)}`}>{req.urgency}</span>
                      </div>
                      <p className="text-gray-500 text-sm">{req.hospital}{req.location ? ` • ${req.location}` : ''}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Compatible blood types: {req.bloodTypeCompatibility.join(', ') || '—'} &bull; Posted: {formatDate(req.createdAt)} &bull; {req.applicantCount} applicant{req.applicantCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {applied.includes(req.id) ? (
                      <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">Applied ✓</span>
                    ) : (
                      <button onClick={() => handleApply(req.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95">
                        Apply to Donate
                      </button>
                    )}
                  </div>
                </div>

                {/* Application Form */}
                {showForm === req.id && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4">Health Pre-Screening Questionnaire</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                        <input type="number" required min="18" max="65" value={formData.age}
                          onChange={e => setFormData({...formData, age: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="18-65" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
                        <input type="number" step="0.1" value={formData.bmi}
                          onChange={e => setFormData({...formData, bmi: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="18.5 - 35" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Smoking Status</label>
                        <select value={formData.smokingStatus} onChange={e => setFormData({...formData, smokingStatus: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                          <option value="non-smoker">Non-smoker</option>
                          <option value="former-smoker">Former smoker</option>
                          <option value="current-smoker">Current smoker</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol Use</label>
                        <select value={formData.alcoholUse} onChange={e => setFormData({...formData, alcoholUse: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                          <option value="none">None</option>
                          <option value="occasional">Occasional</option>
                          <option value="moderate">Moderate</option>
                          <option value="heavy">Heavy</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Existing Conditions</label>
                        <input type="text" value={formData.existingConditions}
                          onChange={e => setFormData({...formData, existingConditions: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="e.g. diabetes, hypertension (comma separated)" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medications</label>
                        <input type="text" value={formData.medications}
                          onChange={e => setFormData({...formData, medications: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="e.g. metformin, aspirin (comma separated)" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <input type="tel" required value={formData.contactPhone}
                          onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="+27 XX XXX XXXX" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input type="email" required value={formData.contactEmail}
                          onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="you@example.com" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.consentGiven}
                          onChange={e => setFormData({...formData, consentGiven: e.target.checked})}
                          className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                        <span className="text-sm text-gray-700">I consent to share my health information with the transplant team for evaluation purposes. *</span>
                      </label>
                    </div>
                    {error && (
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-sm font-medium">❌ {error}</p>
                      </div>
                    )}
                    <div className="mt-4 flex gap-3">
                      <button onClick={() => handleSubmitApplication(req)} disabled={submitting}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${submitting ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'}`}>
                        {submitting ? '⏳ Submitting...' : 'Submit Application'}
                      </button>
                      <button onClick={() => setShowForm(null)} className="px-6 py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 text-gray-700">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-blue-700 text-sm"><strong>How it works:</strong> Apply → Complete pre-screening → Hospital reviews → Invited for testing → All medical decisions happen at the hospital.</p>
        </div>
      </main>
    </div>
  );
}
