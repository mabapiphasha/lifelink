
import { useState } from 'react';
import { Link } from 'react-router-dom';

const organRequests = [
  {
    id: 1,
    organ: 'Kidney',
    icon: '🫘',
    urgency: 'critical',
    hospital: 'Groote Schuur Hospital',
    city: 'Cape Town',
    country: 'South Africa',
    bloodType: 'O+',
    postedDate: '2026-07-18',
    applicants: 3,
    patientAge: 34,
    patientGender: 'Female',
    waitingDays: 142,
    description: 'Young mother of two with end-stage renal disease. Both kidneys have failed. Currently on dialysis 3x per week. Compatible living donor urgently needed.',
    requirements: ['Age 18-60', 'BMI under 35', 'No diabetes', 'No kidney disease', 'Non-smoker or quit 6+ months ago', 'Blood type O+ or O-'],
    recoveryTime: '4-6 weeks',
    hospitalStay: '3-5 days',
  },
  {
    id: 2,
    organ: 'Liver',
    icon: '🫁',
    urgency: 'high',
    hospital: 'Kenyatta National Hospital',
    city: 'Nairobi',
    country: 'Kenya',
    bloodType: 'A+',
    postedDate: '2026-07-15',
    applicants: 1,
    patientAge: 45,
    patientGender: 'Male',
    waitingDays: 89,
    description: 'Father of three with liver cirrhosis. Partial liver donation needed — the liver regenerates to full size in both donor and recipient within 8 weeks.',
    requirements: ['Age 18-55', 'BMI under 30', 'No liver disease', 'No heavy alcohol use', 'No hepatitis B/C', 'Blood type A+, A-, O+, or O-'],
    recoveryTime: '6-8 weeks',
    hospitalStay: '5-7 days',
  },
  {
    id: 3,
    organ: 'Kidney',
    icon: '🫘',
    urgency: 'standard',
    hospital: 'Chris Hani Baragwanath',
    city: 'Johannesburg',
    country: 'South Africa',
    bloodType: 'B-',
    postedDate: '2026-07-12',
    applicants: 5,
    patientAge: 28,
    patientGender: 'Male',
    waitingDays: 203,
    description: 'Young engineer with polycystic kidney disease. On transplant waiting list for over 6 months. Living donor would significantly improve outcome vs deceased donor.',
    requirements: ['Age 18-60', 'BMI under 35', 'No diabetes', 'No kidney disease', 'Non-smoker or quit 6+ months ago', 'Blood type B-, B+, O-, or O+'],
    recoveryTime: '4-6 weeks',
    hospitalStay: '3-5 days',
  },
  {
    id: 4,
    organ: 'Bone Marrow',
    icon: '🦴',
    urgency: 'critical',
    hospital: 'Tygerberg Hospital',
    city: 'Cape Town',
    country: 'South Africa',
    bloodType: 'AB+',
    postedDate: '2026-07-20',
    applicants: 0,
    patientAge: 12,
    patientGender: 'Female',
    waitingDays: 45,
    description: '12-year-old girl with acute lymphoblastic leukemia. Needs HLA-matched bone marrow donor. No family match found. Procedure is minimally invasive for donor.',
    requirements: ['Age 18-44', 'BMI under 40', 'Generally healthy', 'No autoimmune diseases', 'No blood cancers', 'HLA typing match required'],
    recoveryTime: '1-2 weeks',
    hospitalStay: '1 day (outpatient)',
  },
];

const urgencyConfig = {
  critical: { label: 'Critical', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' },
  high: { label: 'High', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
  standard: { label: 'Standard', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' },
};

const eligibilityQuestions = [
  { id: 'age', question: 'Are you between 18 and 60 years old?', required: true },
  { id: 'bmi', question: 'Is your BMI under 35?', required: true },
  { id: 'chronic', question: 'Are you free from chronic diseases (diabetes, heart disease, kidney disease)?', required: true },
  { id: 'smoking', question: 'Are you a non-smoker (or quit 6+ months ago)?', required: true },
  { id: 'medications', question: 'Are you free from long-term medications?', required: false },
  { id: 'surgery', question: 'Have you NOT had major abdominal surgery in the past year?', required: true },
];

export function OrganBulletin() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [applicationStep, setApplicationStep] = useState(0); // 0: closed, 1: eligibility, 2: form, 3: consent, 4: submitted
  const [eligibilityAnswers, setEligibilityAnswers] = useState({});
  const [applicationData, setApplicationData] = useState({
    fullName: '',
    phone: '',
    email: '',
    bloodType: '',
    relationship: '',
    motivation: '',
    availability: '',
    previousDonor: 'no',
  });
  const [submittedApplications, setSubmittedApplications] = useState([]);
  const [consentChecks, setConsentChecks] = useState({ voluntary: false, risks: false, testing: false, privacy: false });
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [showEducation, setShowEducation] = useState(false);

  const filteredRequests = organRequests.filter(req => {
    if (filterUrgency === 'all') return true;
    return req.urgency === filterUrgency;
  });

  const startApplication = (request) => {
    setSelectedRequest(request);
    setApplicationStep(1);
    setEligibilityAnswers({});
    setApplicationData({ fullName: '', phone: '', email: '', bloodType: '', relationship: '', motivation: '', availability: '', previousDonor: 'no' });
    setConsentChecks({ voluntary: false, risks: false, testing: false, privacy: false });
  };

  const checkEligibility = () => {
    const requiredQuestions = eligibilityQuestions.filter(q => q.required);
    const allRequiredYes = requiredQuestions.every(q => eligibilityAnswers[q.id] === 'yes');
    return allRequiredYes;
  };

  const handleSubmitApplication = () => {
    const refNumber = `LL-ORG-${Date.now().toString().slice(-8)}`;
    setSubmittedApplications(prev => [...prev, {
      refNumber,
      requestId: selectedRequest.id,
      organ: selectedRequest.organ,
      hospital: selectedRequest.hospital,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    }]);
    setApplicationStep(4);
  };

  const allConsentsChecked = Object.values(consentChecks).every(v => v);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <nav className="bg-purple-900 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight">🩸 LifeLink</Link>
          <span className="text-purple-200 text-sm font-medium">Organ Donation Bulletin</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowEducation(!showEducation)}
              className="text-sm bg-purple-700 hover:bg-purple-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              ℹ️ Learn About Donation
            </button>
            <Link to="/" className="text-sm hover:text-purple-200 transition-colors">← Home</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Education Panel */}
        {showEducation && (
          <div className="bg-white rounded-2xl p-8 shadow-md border border-purple-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Understanding Organ Donation</h3>
              <button onClick={() => setShowEducation(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                <h4 className="font-bold text-green-900 mb-2">🌱 Living Donation</h4>
                <p className="text-sm text-green-800">You can donate a kidney or part of your liver while alive. The liver regenerates to full size in 8 weeks. One kidney is sufficient for a healthy life.</p>
              </div>
              <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">🏥 The Process</h4>
                <p className="text-sm text-blue-800">After applying, you'll undergo compatibility testing (blood work, imaging, psychological evaluation). The hospital covers all medical costs for the donor.</p>
              </div>
              <div className="p-5 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-2">⚠️ Important Facts</h4>
                <p className="text-sm text-amber-800">Donation is 100% voluntary. You can withdraw at any time before surgery. There are risks with any surgery. Full informed consent is required.</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">98%</p>
                <p className="text-xs text-gray-500">Kidney donor survival rate</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">4-6 wks</p>
                <p className="text-xs text-gray-500">Average recovery time</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">R0</p>
                <p className="text-xs text-gray-500">Cost to donor</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">25 yrs</p>
                <p className="text-xs text-gray-500">Avg transplant lifespan</p>
              </div>
            </div>
          </div>
        )}

        {/* Header & Filters */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Open Organ Requests</h2>
            <p className="text-gray-500 text-sm">Browse requests and apply to save a life. All testing happens in person at the hospital.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { value: 'all', label: 'All' },
                { value: 'critical', label: '🚨 Critical' },
                { value: 'high', label: '⚠️ High' },
                { value: 'standard', label: '📋 Standard' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilterUrgency(value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterUrgency === value ? 'bg-white shadow-sm text-purple-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* My Applications Banner */}
        {submittedApplications.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <div>
                <p className="font-semibold text-green-900">You have {submittedApplications.length} active application{submittedApplications.length > 1 ? 's' : ''}</p>
                <p className="text-sm text-green-700">Reference: {submittedApplications[submittedApplications.length - 1].refNumber}</p>
              </div>
            </div>
            <Link to="/tracker" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              View Application Tracker →
            </Link>
          </div>
        )}

        {/* Request Cards */}
        <div className="space-y-4">
          {filteredRequests.map(request => {
            const config = urgencyConfig[request.urgency];
            const hasApplied = submittedApplications.some(a => a.requestId === request.id);

            return (
              <div key={request.id} className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${config.border} hover:shadow-md transition-all`}>
                <div className="flex gap-6">
                  {/* Left: Icon & Urgency */}
                  <div className="text-center flex-shrink-0">
                    <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center mb-2">
                      <span className="text-3xl">{request.icon}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${config.bg} ${config.text}`}>
                      {config.label}
                    </span>
                  </div>

                  {/* Middle: Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{request.organ} Donor Needed</h3>
                      <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold">
                        {request.bloodType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {request.hospital} • {request.city}, {request.country}
                    </p>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{request.description}</p>

                    <div className="flex gap-6 text-xs text-gray-500">
                      <span>👤 Patient: {request.patientAge}y {request.patientGender}</span>
                      <span>⏳ Waiting: {request.waitingDays} days</span>
                      <span>🏥 Stay: {request.hospitalStay}</span>
                      <span>💚 Recovery: {request.recoveryTime}</span>
                      <span>📝 {request.applicants} applicant{request.applicants !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Right: Action */}
                  <div className="flex-shrink-0 flex flex-col items-end justify-between">
                    <p className="text-xs text-gray-400">Posted {request.postedDate}</p>
                    {hasApplied ? (
                      <div className="text-center">
                        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-bold block">✓ Applied</span>
                        <Link to="/tracker" className="text-xs text-purple-600 hover:text-purple-700 mt-2 block">View status →</Link>
                      </div>
                    ) : (
                      <button
                        onClick={() => startApplication(request)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95"
                      >
                        Apply to Donate →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <span className="text-4xl block mb-4">🕊️</span>
            <p className="text-gray-500">No requests match your filter.</p>
          </div>
        )}
      </main>

      {/* Application Modal */}
      {applicationStep > 0 && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {applicationStep === 1 && 'Eligibility Pre-Check'}
                    {applicationStep === 2 && 'Application Form'}
                    {applicationStep === 3 && 'Consent & Disclaimer'}
                    {applicationStep === 4 && 'Application Submitted'}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedRequest.organ} Donation — {selectedRequest.hospital}</p>
                </div>
                {applicationStep < 4 && (
                  <button onClick={() => setApplicationStep(0)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
                )}
              </div>
              {/* Progress Bar */}
              {applicationStep < 4 && (
                <div className="flex gap-2 mt-4">
                  {[1, 2, 3].map(s => (
                    <div key={s} className={`flex-1 h-2 rounded-full ${applicationStep >= s ? 'bg-purple-500' : 'bg-gray-200'}`} />
                  ))}
                </div>
              )}
            </div>

            <div className="p-6">
              {/* Step 1: Eligibility Pre-Check */}
              {applicationStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <span className="font-bold">⚠️ Important:</span> These questions help determine if you may be eligible. Final eligibility is determined by medical professionals at the hospital.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {eligibilityQuestions.map(q => (
                      <div key={q.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{q.question}</p>
                          {q.required && <span className="text-xs text-red-500">Required</span>}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => setEligibilityAnswers(prev => ({ ...prev, [q.id]: 'yes' }))}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${eligibilityAnswers[q.id] === 'yes' ? 'bg-green-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-green-400'}`}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setEligibilityAnswers(prev => ({ ...prev, [q.id]: 'no' }))}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${eligibilityAnswers[q.id] === 'no' ? 'bg-red-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-red-400'}`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Eligibility Result */}
                  {Object.keys(eligibilityAnswers).length === eligibilityQuestions.length && (
                    <div className={`p-4 rounded-xl border-2 ${checkEligibility() ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                      {checkEligibility() ? (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">✅</span>
                          <div>
                            <p className="font-bold text-green-900">You appear to be eligible!</p>
                            <p className="text-sm text-green-700">Based on your answers, you may qualify. Final determination is made by the medical team.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">❌</span>
                          <div>
                            <p className="font-bold text-red-900">You may not be eligible at this time</p>
                            <p className="text-sm text-red-700">Based on your answers, you may not meet the requirements. Please consult with a doctor if you'd like to discuss further.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setApplicationStep(0)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setApplicationStep(2)}
                      disabled={!checkEligibility()}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${checkEligibility() ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      Continue to Application →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Application Form */}
              {applicationStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={applicationData.fullName}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Thandiwe Mokoena"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                      <select
                        required
                        value={applicationData.bloodType}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, bloodType: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={applicationData.phone}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="+27 82 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={applicationData.email}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="thandiwe@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship to Patient</label>
                    <select
                      required
                      value={applicationData.relationship}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, relationship: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select relationship</option>
                      <option value="family">Family Member</option>
                      <option value="friend">Friend</option>
                      <option value="altruistic">Altruistic (No Relationship)</option>
                      <option value="community">Community Member</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to donate? (Optional)</label>
                    <textarea
                      value={applicationData.motivation}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, motivation: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="3"
                      placeholder="Share your motivation for wanting to help..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability for Testing</label>
                    <select
                      required
                      value={applicationData.availability}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, availability: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">When can you come in for testing?</option>
                      <option value="asap">As soon as possible (within 48 hours)</option>
                      <option value="week">Within this week</option>
                      <option value="two_weeks">Within two weeks</option>
                      <option value="month">Within a month</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Have you donated an organ before?</label>
                    <div className="flex gap-3">
                      {['no', 'yes'].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setApplicationData(prev => ({ ...prev, previousDonor: val }))}
                          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${applicationData.previousDonor === val ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {val === 'yes' ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setApplicationStep(1)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setApplicationStep(3)}
                      disabled={!applicationData.fullName || !applicationData.phone || !applicationData.email || !applicationData.bloodType || !applicationData.relationship || !applicationData.availability}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${applicationData.fullName && applicationData.phone && applicationData.email && applicationData.bloodType && applicationData.relationship && applicationData.availability ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      Continue to Consent →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Consent & Disclaimer */}
              {applicationStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                    <h4 className="font-bold text-red-900 mb-2">⚠️ Important Medical Disclaimer</h4>
                    <p className="text-sm text-red-800 leading-relaxed">
                      Organ donation is a major medical decision. This application does NOT commit you to donating. 
                      You will undergo extensive medical testing and psychological evaluation. You may withdraw at any 
                      point before the surgery. The hospital's transplant team will make the final determination of eligibility.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'voluntary', label: 'I understand that organ donation is completely voluntary and I can withdraw at any time before surgery.' },
                      { key: 'risks', label: 'I understand that organ donation surgery carries risks including infection, bleeding, pain, and in rare cases, death. I will receive full risk counseling from the medical team.' },
                      { key: 'testing', label: 'I agree to undergo compatibility testing (blood work, imaging, psychological evaluation) at the hospital. I understand this does not guarantee I will be selected.' },
                      { key: 'privacy', label: 'I consent to my information being shared with the hospital\'s transplant team for the purpose of evaluating my eligibility. My data will be handled per POPIA/GDPR regulations.' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={consentChecks[key]}
                          onChange={(e) => setConsentChecks(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500 flex-shrink-0"
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">{label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setApplicationStep(2)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSubmitApplication}
                      disabled={!allConsentsChecked}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${allConsentsChecked ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      Submit Application
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Submitted */}
              {applicationStep === 4 && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-4xl">🎉</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                    <p className="text-gray-500">Thank you for your willingness to save a life.</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 text-left">
                    <h4 className="font-bold text-gray-900 mb-3">Application Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <p><span className="text-gray-500">Reference:</span> <span className="font-mono font-bold text-purple-600">{submittedApplications[submittedApplications.length - 1]?.refNumber}</span></p>
                      <p><span className="text-gray-500">Organ:</span> <span className="font-medium">{selectedRequest.organ}</span></p>
                      <p><span className="text-gray-500">Hospital:</span> <span className="font-medium">{selectedRequest.hospital}</span></p>
                      <p><span className="text-gray-500">Status:</span> <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold text-xs">Pending Review</span></p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-5 text-left">
                    <h4 className="font-bold text-blue-900 mb-2">📋 What happens next?</h4>
                    <ol className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2"><span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span> Hospital transplant team reviews your application (1-3 business days)</li>
                      <li className="flex items-start gap-2"><span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span> You'll be contacted to schedule compatibility testing</li>
                      <li className="flex items-start gap-2"><span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span> Blood work, imaging, and psychological evaluation at the hospital</li>
                      <li className="flex items-start gap-2"><span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span> Final decision by the transplant team (you can still withdraw)</li>
                      <li className="flex items-start gap-2"><span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">5</span> If approved, surgery scheduling and pre-op preparation</li>
                    </ol>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setApplicationStep(0)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
                    >
                      Back to Bulletin
                    </button>
                    <Link
                      to="/tracker"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-colors text-center"
                    >
                      Track Application →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

