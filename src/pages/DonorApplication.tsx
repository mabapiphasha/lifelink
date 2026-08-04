
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '../config/api';
import { OrganApplication, OrganApplicationStatus } from '../types';

const organIcon = (organ: string) => {
  const icons: Record<string, string> = {
    Kidney: '🫘', Liver: '🫁', Heart: '🫀', Lung: '🫁',
    Pancreas: '🧬', Intestine: '🧬', Cornea: '👁️',
    Skin: '🧴', 'Bone Marrow': '🦴', 'Heart Valve': '🫀',
  };
  return icons[organ] || '🏥';
};

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: string; description: string }> = {
  'Applied': { label: 'Applied', bg: 'bg-blue-100', text: 'text-blue-700', icon: '📨', description: 'Your application has been submitted' },
  'Under Review': { label: 'Under Review', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '📋', description: 'The hospital is reviewing your application' },
  'Invited': { label: 'Invited for Testing', bg: 'bg-purple-100', text: 'text-purple-700', icon: '🔬', description: "You've been invited for compatibility testing" },
  'Approved': { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700', icon: '✅', description: "Congratulations! You've been approved as a donor" },
  'Not Eligible': { label: 'Not Eligible', bg: 'bg-gray-100', text: 'text-gray-600', icon: '❌', description: 'Unfortunately, you were not eligible for this donation' },
};

const urgencyConfig: Record<string, { label: string; bg: string; text: string }> = {
  Critical: { label: 'Critical', bg: 'bg-red-100', text: 'text-red-700' },
  High: { label: 'High', bg: 'bg-orange-100', text: 'text-orange-700' },
  Standard: { label: 'Standard', bg: 'bg-blue-100', text: 'text-blue-700' },
};

const getTimelineSteps = (status: OrganApplicationStatus) => {
  const steps = [
    { step: 'Application Submitted', status: 'completed' as const },
    { step: 'Under Review', status: 'pending' as const },
    { step: 'Invited for Testing', status: 'pending' as const },
    { step: 'Final Decision', status: 'pending' as const },
  ];

  const statusOrder: OrganApplicationStatus[] = ['Applied', 'Under Review', 'Invited', 'Approved'];
  const currentIndex = statusOrder.indexOf(status);

  if (status === 'Not Eligible') {
    return steps.map((s, i) => ({
      ...s,
      status: i === 0 ? 'completed' as const : i === steps.length - 1 ? 'declined' as const : 'completed' as const,
    }));
  }

  return steps.map((s, i) => ({
    ...s,
    status: i < currentIndex ? 'completed' as const :
            i === currentIndex ? 'current' as const : 'pending' as const,
  }));
};

export function DonorApplication() {
  const [applications, setApplications] = useState<OrganApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  const donorId = localStorage.getItem('donorId') || '';

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API.getOrganApplicationsByDonor, {
        params: { donorId },
      });
      setApplications(res.data.applications || []);
    } catch (err) {
      setError('Failed to load your applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await axios.post(API.updateOrganApplicationStatus, {
        applicationId,
        status: 'Withdrawn',
        donorId,
      });
      setApplications(prev => prev.filter(a => a.id !== applicationId));
    } catch {
      alert('Failed to withdraw application. Please try again.');
    }
  };

  const stats = {
    total: applications.length,
    active: applications.filter(a => ['Applied', 'Under Review', 'Invited'].includes(a.status)).length,
    approved: applications.filter(a => a.status === 'Approved').length,
    closed: applications.filter(a => a.status === 'Not Eligible').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <nav className="bg-indigo-900 text-white p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold tracking-tight">🩸 LifeLink</Link>
            <span className="text-indigo-200 text-sm font-medium">My Applications</span>
            <Link to="/" className="text-sm hover:text-indigo-200 transition-colors">← Home</Link>
          </div>
        </nav>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Loading your applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <nav className="bg-indigo-900 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight">🩸 LifeLink</Link>
          <span className="text-indigo-200 text-sm font-medium">My Applications</span>
          <Link to="/" className="text-sm hover:text-indigo-200 transition-colors">← Home</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Donor Applications</h1>
          <p className="text-gray-500 text-sm">Track the status of your organ donation applications.</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-gray-500">Approved</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-gray-500">{stats.closed}</p>
            <p className="text-xs text-gray-500">Closed</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-700 text-sm">{error}</p>
            <button onClick={fetchMyApplications} className="text-red-600 text-sm font-medium hover:underline mt-2">
              Try Again
            </button>
          </div>
        )}

        {applications.length === 0 && !error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <span className="text-4xl block mb-4">📋</span>
            <p className="text-gray-700 font-medium mb-2">No applications yet</p>
            <p className="text-gray-500 text-sm mb-6">When you apply to donate an organ, your applications will appear here.</p>
            <Link to="/organ" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Browse Organ Requests
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => {
              const status = statusConfig[app.status] || statusConfig['Applied'];
              const urgency = urgencyConfig[app.urgency || 'Standard'] || urgencyConfig['Standard'];
              const isExpanded = expandedApp === app.id;
              const timeline = getTimelineSteps(app.status);

              return (
                <div key={app.id} className={`bg-white rounded-2xl shadow-sm border-2 transition-all ${isExpanded ? 'border-indigo-300 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="p-5 cursor-pointer" onClick={() => setExpandedApp(isExpanded ? null : app.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                          <span className="text-2xl">{organIcon(app.organType)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">{app.organType} Donation</h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${urgency.bg} ${urgency.text}`}>
                              {urgency.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {app.hospitalName || 'Hospital'} • Blood type: {app.bloodType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${status.bg} ${status.text}`}>
                          {status.icon} {status.label}
                        </span>
                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex gap-1">
                        {timeline.map((step, i) => (
                          <div key={i} className={`flex-1 h-2 rounded-full ${
                            step.status === 'completed' ? 'bg-green-400' :
                            step.status === 'current' ? 'bg-indigo-400 animate-pulse' :
                            step.status === 'declined' ? 'bg-red-400' : 'bg-gray-200'
                          }`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                      <div className={`p-3 rounded-xl mb-4 ${status.bg}`}>
                        <p className={`text-sm font-medium ${status.text}`}>{status.icon} {status.description}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Organ</p>
                          <p className="font-bold text-gray-900">{app.organType}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Blood Type</p>
                          <p className="font-bold text-red-600">{app.bloodType}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Applied</p>
                          <p className="font-bold text-gray-900">
                            {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—'}
                          </p>
                        </div>
                      </div>

                      <h4 className="font-bold text-gray-900 mb-3 text-sm">Progress</h4>
                      <div className="space-y-1">
                        {timeline.map((step, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                step.status === 'completed' ? 'bg-green-500' :
                                step.status === 'current' ? 'bg-indigo-500 ring-4 ring-indigo-100' :
                                step.status === 'declined' ? 'bg-red-500' : 'bg-gray-300'
                              }`} />
                              {i < timeline.length - 1 && (
                                <div className={`w-0.5 flex-1 min-h-[30px] ${step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'}`} />
                              )}
                            </div>
                            <div className={`pb-4 ${step.status === 'pending' ? 'opacity-50' : ''}`}>
                              <p className={`font-medium text-sm ${
                                step.status === 'current' ? 'text-indigo-700' :
                                step.status === 'declined' ? 'text-red-700' : 'text-gray-900'
                              }`}>{step.step}</p>
                              {step.status === 'current' && (
                                <span className="inline-block mt-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
                                  ● Current Step
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {['Applied', 'Under Review'].includes(app.status) && (
                          <button onClick={() => handleWithdraw(app.id)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                            Withdraw Application
                          </button>
                        )}
                        {app.status === 'Invited' && (
                          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                            <p className="text-sm text-purple-800 font-medium">🔬 You have been invited for testing!</p>
                            <p className="text-xs text-purple-600 mt-1">The hospital will contact you to schedule your appointment.</p>
                          </div>
                        )}
                        {app.status === 'Approved' && (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                            <p className="text-sm text-green-800 font-medium">🎉 You have been approved as a donor!</p>
                            <p className="text-xs text-green-600 mt-1">The transplant team will reach out with next steps.</p>
                          </div>
                        )}
                        {app.status === 'Not Eligible' && (
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                            <p className="text-sm text-gray-600">This application is closed. Thank you for your willingness to help.</p>
                            <Link to="/organ" className="text-purple-600 hover:text-purple-700 text-sm font-medium">Browse other requests →</Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
