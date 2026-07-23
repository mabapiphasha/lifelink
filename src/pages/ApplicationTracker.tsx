
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface TimelineStep {
  step: string;
  date: string | null;
  status: string;
  note: string;
}

interface BaseApplication {
  id: string;
  type: 'blood' | 'organ';
  refNumber: string;
  hospital: string;
  city: string;
  bloodType: string;
  status: string;
  urgency: string;
  timeline: TimelineStep[];
  sortDate: string;
}

interface BloodApplication extends BaseApplication {
  type: 'blood';
  requestedDate: string;
}

interface OrganApplication extends BaseApplication {
  type: 'organ';
  organ: string;
  icon: string;
  patientAge: number;
  patientGender: string;
  submittedDate: string;
}

type Application = BloodApplication | OrganApplication;

const bloodDonationApplications: Omit<BloodApplication, 'sortDate'>[] = [
  {
    id: 'BD-001',
    type: 'blood',
    refNumber: 'LL-BLD-20260718-001',
    hospital: 'Groote Schuur Hospital',
    city: 'Cape Town',
    bloodType: 'O+',
    requestedDate: '2026-07-18',
    status: 'completed',
    urgency: 'critical',
    timeline: [
      { step: 'Request Received', date: '2026-07-18', status: 'completed', note: 'Hospital posted urgent O+ request' },
      { step: 'Donor Matched', date: '2026-07-18', status: 'completed', note: 'You were matched based on blood type and proximity (3.2 km)' },
      { step: 'Notification Sent', date: '2026-07-18', status: 'completed', note: 'SMS and email notification sent' },
      { step: 'Donor Confirmed', date: '2026-07-18', status: 'completed', note: 'You confirmed "I\'ll Donate"' },
      { step: 'Donation Complete', date: '2026-07-19', status: 'completed', note: 'Successfully donated 1 unit at Groote Schuur' },
    ],
  },
  {
    id: 'BD-002',
    type: 'blood',
    refNumber: 'LL-BLD-20260722-002',
    hospital: 'Tygerberg Hospital',
    city: 'Cape Town',
    bloodType: 'O+',
    requestedDate: '2026-07-22',
    status: 'in_progress',
    urgency: 'high',
    timeline: [
      { step: 'Request Received', date: '2026-07-22', status: 'completed', note: 'Hospital posted high-priority O+ request' },
      { step: 'Donor Matched', date: '2026-07-22', status: 'completed', note: 'You were matched (5.1 km away)' },
      { step: 'Notification Sent', date: '2026-07-22', status: 'completed', note: 'SMS notification sent' },
      { step: 'Awaiting Confirmation', date: '2026-07-23', status: 'current', note: 'Please confirm if you can donate' },
      { step: 'Donation', date: null, status: 'pending', note: 'Pending your confirmation' },
    ],
  },
];

const organDonationApplications: Omit<OrganApplication, 'sortDate'>[] = [
  {
    id: 'OD-001',
    type: 'organ',
    refNumber: 'LL-ORG-20260715-001',
    organ: 'Kidney',
    icon: '🫘',
    hospital: 'Groote Schuur Hospital',
    city: 'Cape Town',
    bloodType: 'O+',
    patientAge: 34,
    patientGender: 'Female',
    submittedDate: '2026-07-15',
    status: 'testing',
    urgency: 'critical',
    timeline: [
      { step: 'Application Submitted', date: '2026-07-15', status: 'completed', note: 'Your application was received by the transplant team' },
      { step: 'Initial Review', date: '2026-07-16', status: 'completed', note: 'Transplant coordinator reviewed your eligibility answers' },
      { step: 'Phone Screening', date: '2026-07-17', status: 'completed', note: 'Completed 20-minute phone interview with transplant nurse' },
      { step: 'Compatibility Testing', date: '2026-07-20', status: 'current', note: 'Blood work and cross-match testing in progress. Results expected in 3-5 days.' },
      { step: 'Imaging & Physical', date: null, status: 'pending', note: 'CT scan and full physical examination' },
      { step: 'Psychological Evaluation', date: null, status: 'pending', note: 'Meeting with transplant psychologist' },
      { step: 'Final Decision', date: null, status: 'pending', note: 'Transplant team makes final eligibility determination' },
    ],
  },
  {
    id: 'OD-002',
    type: 'organ',
    refNumber: 'LL-ORG-20260720-002',
    organ: 'Liver',
    icon: '🫁',
    hospital: 'Kenyatta National Hospital',
    city: 'Nairobi',
    bloodType: 'A+',
    patientAge: 45,
    patientGender: 'Male',
    submittedDate: '2026-07-20',
    status: 'review',
    urgency: 'high',
    timeline: [
      { step: 'Application Submitted', date: '2026-07-20', status: 'completed', note: 'Your application was received' },
      { step: 'Initial Review', date: '2026-07-22', status: 'current', note: 'Transplant team is reviewing your application. Expected response within 1-3 business days.' },
      { step: 'Phone Screening', date: null, status: 'pending', note: 'Brief phone interview with transplant coordinator' },
      { step: 'Compatibility Testing', date: null, status: 'pending', note: 'Blood work and tissue typing' },
      { step: 'Imaging & Physical', date: null, status: 'pending', note: 'Liver volumetry CT and physical exam' },
      { step: 'Psychological Evaluation', date: null, status: 'pending', note: 'Meeting with transplant psychologist' },
      { step: 'Final Decision', date: null, status: 'pending', note: 'Transplant team makes final determination' },
    ],
  },
  {
    id: 'OD-003',
    type: 'organ',
    refNumber: 'LL-ORG-20260710-003',
    organ: 'Kidney',
    icon: '🫘',
    hospital: 'Chris Hani Baragwanath',
    city: 'Johannesburg',
    bloodType: 'B-',
    patientAge: 28,
    patientGender: 'Male',
    submittedDate: '2026-07-10',
    status: 'declined',
    urgency: 'standard',
    timeline: [
      { step: 'Application Submitted', date: '2026-07-10', status: 'completed', note: 'Your application was received' },
      { step: 'Initial Review', date: '2026-07-11', status: 'completed', note: 'Application reviewed by transplant team' },
      { step: 'Phone Screening', date: '2026-07-12', status: 'completed', note: 'Phone interview completed' },
      { step: 'Compatibility Testing', date: '2026-07-14', status: 'completed', note: 'Blood work completed' },
      { step: 'Not Compatible', date: '2026-07-16', status: 'declined', note: 'Unfortunately, cross-match testing showed incompatibility. This is not uncommon. Thank you for your willingness to help.' },
    ],
  },
];

const statusConfig = {
  completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700', icon: '✅' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-100', text: 'text-blue-700', icon: '🔄' },
  testing: { label: 'Testing Phase', bg: 'bg-purple-100', text: 'text-purple-700', icon: '🔬' },
  review: { label: 'Under Review', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '📋' },
  declined: { label: 'Not Compatible', bg: 'bg-gray-100', text: 'text-gray-700', icon: '❌' },
  approved: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700', icon: '🎉' },
};

const urgencyConfig = {
  critical: { label: 'Critical', bg: 'bg-red-100', text: 'text-red-700' },
  high: { label: 'High', bg: 'bg-orange-100', text: 'text-orange-700' },
  standard: { label: 'Standard', bg: 'bg-blue-100', text: 'text-blue-700' },
};

export function ApplicationTracker() {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  const allApplications: Application[] = [
    ...bloodDonationApplications.map(a => ({ ...a, sortDate: a.requestedDate })),
    ...organDonationApplications.map(a => ({ ...a, sortDate: a.submittedDate })),
  ].sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());

  const filteredApplications = allApplications.filter(app => {
    if (activeTab === 'all') return true;
    return app.type === activeTab;
  });

  const stats = {
    total: allApplications.length,
    active: allApplications.filter(a => ['in_progress', 'testing', 'review'].includes(a.status)).length,
    completed: allApplications.filter(a => a.status === 'completed').length,
    organ: organDonationApplications.length,
    blood: bloodDonationApplications.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <nav className="bg-indigo-900 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight">🩸 LifeLink</Link>
          <span className="text-indigo-200 text-sm font-medium">Application Tracker</span>
          <Link to="/" className="text-sm hover:text-indigo-200 transition-colors">← Home</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 text-sm">Track your blood and organ donation applications in one place.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Applications</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.blood}</p>
            <p className="text-xs text-gray-500">Blood Donations</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.organ}</p>
            <p className="text-xs text-gray-500">Organ Applications</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: '📋 All', count: allApplications.length },
            { value: 'blood', label: '🩸 Blood Donations', count: bloodDonationApplications.length },
            { value: 'organ', label: '🫘 Organ Donations', count: organDonationApplications.length },
          ].map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === value ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'}`}
            >
              {label} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${activeTab === value ? 'bg-indigo-500' : 'bg-gray-100'}`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Application Cards */}
        <div className="space-y-4">
          {filteredApplications.map(app => {
            const status = statusConfig[app.status as keyof typeof statusConfig];
            const urgency = urgencyConfig[app.urgency as keyof typeof urgencyConfig];
            const isExpanded = expandedApp === app.id;

            return (
              <div key={app.id} className={`bg-white rounded-2xl shadow-sm border-2 transition-all ${isExpanded ? 'border-indigo-300 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}>
                {/* Card Header */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${app.type === 'organ' ? 'bg-purple-50' : 'bg-red-50'}`}>
                        <span className="text-2xl">{app.type === 'organ' ? (app as OrganApplication).icon : '🩸'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">
                            {app.type === 'organ' ? `${(app as OrganApplication).organ} Donation Application` : 'Blood Donation'}
                          </h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${urgency.bg} ${urgency.text}`}>
                            {urgency.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {app.hospital} • {app.city} • <span className="font-mono text-xs">{app.refNumber}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${status.bg} ${status.text}`}>
                          {status.icon} {status.label}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {app.type === 'organ' ? `Submitted ${(app as OrganApplication).submittedDate}` : `Requested ${(app as BloodApplication).requestedDate}`}
                        </p>
                      </div>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex gap-1">
                      {app.timeline.map((step, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-2 rounded-full ${step.status === 'completed' ? 'bg-green-400' : step.status === 'current' ? 'bg-indigo-400 animate-pulse' : step.status === 'declined' ? 'bg-red-400' : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">{app.timeline[0].step}</span>
                      <span className="text-xs text-gray-400">{app.timeline[app.timeline.length - 1].step}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Timeline */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                    {/* Application Details */}
                    <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-xs text-gray-500">Blood Type</p>
                        <p className="font-bold text-red-600">{app.bloodType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="font-bold text-gray-900 capitalize">{app.type} Donation</p>
                      </div>
                      {app.type === 'organ' && (
                        <>
                          <div>
                            <p className="text-xs text-gray-500">Patient</p>
                            <p className="font-bold text-gray-900">{(app as OrganApplication).patientAge}y {(app as OrganApplication).patientGender}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Organ</p>
                            <p className="font-bold text-gray-900">{(app as OrganApplication).organ}</p>
                          </div>
                        </>
                      )}
                      {app.type === 'blood' && (
                        <>
                          <div>
                            <p className="text-xs text-gray-500">Hospital</p>
                            <p className="font-bold text-gray-900">{app.hospital}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Urgency</p>
                            <p className={`font-bold capitalize ${urgency.text}`}>{app.urgency}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Timeline */}
                    <h4 className="font-bold text-gray-900 mb-4">Timeline</h4>
                    <div className="space-y-1">
                      {app.timeline.map((step, i) => (
                        <div key={i} className="flex gap-4">
                          {/* Timeline Line */}
                          <div className="flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full flex-shrink-0 ${step.status === 'completed' ? 'bg-green-500' : step.status === 'current' ? 'bg-indigo-500 ring-4 ring-indigo-100' : step.status === 'declined' ? 'bg-red-500' : 'bg-gray-300'}`} />
                            {i < app.timeline.length - 1 && (
                              <div className={`w-0.5 flex-1 min-h-[40px] ${step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'}`} />
                            )}
                          </div>

                          {/* Step Content */}
                          <div className={`pb-6 flex-1 ${step.status === 'pending' ? 'opacity-50' : ''}`}>
                            <div className="flex items-center justify-between">
                              <p className={`font-semibold text-sm ${step.status === 'current' ? 'text-indigo-700' : step.status === 'declined' ? 'text-red-700' : 'text-gray-900'}`}>
                                {step.step}
                              </p>
                              {step.date && (
                                <span className="text-xs text-gray-400">{step.date}</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{step.note}</p>
                            {step.status === 'current' && (
                              <span className="inline-block mt-2 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
                                ● Current Step
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                      {app.status === 'in_progress' && app.type === 'blood' && (
                        <>
                          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                            ✓ I'll Donate
                          </button>
                          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                            Can't Make It
                          </button>
                        </>
                      )}
                      {app.type === 'organ' && ['testing', 'review'].includes(app.status) && (
                        <>
                          <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                            <p className="text-xs text-amber-800 font-medium">⏳ Awaiting hospital response</p>
                            <p className="text-xs text-amber-600 mt-0.5">You'll be contacted via phone or email</p>
                          </div>
                          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                            Withdraw Application
                          </button>
                        </>
                      )}
                      {app.status === 'declined' && (
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                          <p className="text-sm text-gray-600">This application is closed. <Link to="/organ" className="text-purple-600 hover:text-purple-700 font-medium">Browse other requests →</Link></p>
                        </div>
                      )}
                      {app.status === 'completed' && app.type === 'blood' && (
                        <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                          <p className="text-sm text-green-800 font-medium">🎉 Thank you for donating! You saved a life.</p>
                          <Link to="/cooldown" className="text-xs text-green-600 hover:text-green-700 font-medium">View cooldown tracker →</Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <span className="text-4xl block mb-4">📋</span>
            <p className="text-gray-500 mb-4">No applications found.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/verify-code" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                Register as Blood Donor
              </Link>
              <Link to="/organ" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                Browse Organ Requests
              </Link>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">❓ Frequently Asked Questions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium text-gray-900 text-sm mb-1">How long does organ application review take?</p>
              <p className="text-xs text-gray-500">Initial review takes 1-3 business days. The full process (testing, evaluation) can take 2-6 weeks depending on the organ and hospital.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium text-gray-900 text-sm mb-1">Can I withdraw my organ donation application?</p>
              <p className="text-xs text-gray-500">Yes, you can withdraw at any time before surgery. Organ donation is 100% voluntary. Click "Withdraw Application" on any active application.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium text-gray-900 text-sm mb-1">What does "Not Compatible" mean?</p>
              <p className="text-xs text-gray-500">It means the cross-match testing showed your tissue/blood isn't compatible with the recipient. This is common and not a reflection on your health.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium text-gray-900 text-sm mb-1">When can I donate blood again?</p>
              <p className="text-xs text-gray-500">After a blood donation, you must wait 56 days (8 weeks) before donating again. Check the <Link to="/cooldown" className="text-indigo-600 font-medium">Cooldown Tracker</Link> for your next eligible date.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

