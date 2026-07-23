
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const existingRequests = [
  {
    id: 1,
    bloodType: 'O-',
    unitsNeeded: 3,
    urgency: 'critical',
    hospital: 'Groote Schuur Hospital',
    postedAt: '2026-07-23T07:30',
    donorsInvited: 6,
    donorsConfirmed: 2,
    donorsArrived: 1,
    status: 'active',
    notes: 'Trauma patient - motorcycle accident',
  },
  {
    id: 2,
    bloodType: 'A+',
    unitsNeeded: 2,
    urgency: 'high',
    hospital: 'Groote Schuur Hospital',
    postedAt: '2026-07-23T08:15',
    donorsInvited: 4,
    donorsConfirmed: 3,
    donorsArrived: 2,
    status: 'active',
    notes: 'Scheduled surgery - hip replacement',
  },
  {
    id: 3,
    bloodType: 'B+',
    unitsNeeded: 5,
    urgency: 'standard',
    hospital: 'Groote Schuur Hospital',
    postedAt: '2026-07-22T14:00',
    donorsInvited: 10,
    donorsConfirmed: 7,
    donorsArrived: 5,
    status: 'fulfilled',
    notes: 'Blood bank replenishment',
  },
  {
    id: 4,
    bloodType: 'AB-',
    unitsNeeded: 1,
    urgency: 'critical',
    hospital: 'Groote Schuur Hospital',
    postedAt: '2026-07-23T09:45',
    donorsInvited: 2,
    donorsConfirmed: 0,
    donorsArrived: 0,
    status: 'active',
    notes: 'Neonatal unit - premature infant',
  },
];

const urgencyConfig = {
  critical: {
    label: 'Critical',
    icon: '🚨',
    color: 'red',
    bg: 'bg-red-50',
    border: 'border-red-300',
    badge: 'bg-red-100 text-red-700',
    button: 'bg-red-600 hover:bg-red-700',
    description: 'Life-threatening. Immediate response needed.',
    notifyMethod: 'SMS + Email + Push (simultaneous)',
    responseWindow: '< 1 hour',
    multiplier: 2.5,
  },
  high: {
    label: 'High',
    icon: '⚠️',
    color: 'orange',
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    badge: 'bg-orange-100 text-orange-700',
    button: 'bg-orange-600 hover:bg-orange-700',
    description: 'Urgent. Needed within hours for scheduled procedure.',
    notifyMethod: 'SMS + Email',
    responseWindow: '< 4 hours',
    multiplier: 2.0,
  },
  standard: {
    label: 'Standard',
    icon: '📋',
    color: 'blue',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    badge: 'bg-blue-100 text-blue-700',
    button: 'bg-blue-600 hover:bg-blue-700',
    description: 'Routine. Blood bank replenishment or planned need.',
    notifyMethod: 'Email only',
    responseWindow: '< 24 hours',
    multiplier: 2.0,
  },
};

export function UrgencyRequestManager() {
  const [requests, setRequests] = useState(existingRequests);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // active, fulfilled, all
  const [newRequest, setNewRequest] = useState({
    bloodType: '',
    unitsNeeded: '',
    urgency: '',
    notes: '',
    maxDistance: 15,
  });

  // Simulate real-time donor confirmations
  useEffect(() => {
    const interval = setInterval(() => {
      setRequests(prev => prev.map(req => {
        if (req.status === 'active' && req.donorsConfirmed < req.donorsInvited && Math.random() > 0.7) {
          const updated = { ...req, donorsConfirmed: req.donorsConfirmed + 1 };
          if (updated.donorsArrived < updated.donorsConfirmed && Math.random() > 0.5) {
            updated.donorsArrived += 1;
          }
          if (updated.donorsArrived >= updated.unitsNeeded) {
            updated.status = 'fulfilled';
          }
          return updated;
        }
        return req;
      }));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handlePostRequest = (e) => {
    e.preventDefault();
    const config = urgencyConfig[newRequest.urgency];
    const donorsToInvite = Math.ceil(parseInt(newRequest.unitsNeeded) * config.multiplier);

    const request = {
      id: Date.now(),
      bloodType: newRequest.bloodType,
      unitsNeeded: parseInt(newRequest.unitsNeeded),
      urgency: newRequest.urgency,
      hospital: 'Groote Schuur Hospital',
      postedAt: new Date().toISOString().slice(0, 16),
      donorsInvited: donorsToInvite,
      donorsConfirmed: 0,
      donorsArrived: 0,
      status: 'active',
      notes: newRequest.notes,
    };

    setRequests(prev => [request, ...prev]);
    setNewRequest({ bloodType: '', unitsNeeded: '', urgency: '', notes: '', maxDistance: 15 });
    setShowNewRequest(false);
  };

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'active') return req.status === 'active';
    if (activeTab === 'fulfilled') return req.status === 'fulfilled';
    return true;
  });

  const activeCount = requests.filter(r => r.status === 'active').length;
  const criticalCount = requests.filter(r => r.status === 'active' && r.urgency === 'critical').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="bg-gray-900 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight">🩸 LifeLink</Link>
          <span className="text-gray-300 text-sm font-medium">Urgency Request Manager</span>
          <Link to="/hospital" className="text-sm hover:text-gray-300 transition-colors">← Hospital Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Urgency Tier Explanation */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Object.entries(urgencyConfig).map(([key, config]) => (
            <div key={key} className={`rounded-xl p-5 border-2 ${config.border} ${config.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{config.icon}</span>
                <h3 className="font-bold text-gray-900">{config.label}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{config.description}</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p><span className="font-medium">Notify via:</span> {config.notifyMethod}</p>
                <p><span className="font-medium">Response window:</span> {config.responseWindow}</p>
                <p><span className="font-medium">Invite multiplier:</span> {config.multiplier}x units needed</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { value: 'active', label: `Active (${activeCount})` },
                { value: 'fulfilled', label: 'Fulfilled' },
                { value: 'all', label: 'All' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setActiveTab(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {criticalCount > 0 && (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                🚨 {criticalCount} Critical Active
              </span>
            )}
          </div>

          <button
            onClick={() => setShowNewRequest(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-red-200 transition-all hover:scale-105 active:scale-95"
          >
            + Post New Request
          </button>
        </div>

        {/* Request Cards */}
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const config = urgencyConfig[request.urgency];
            const progress = (request.donorsArrived / request.unitsNeeded) * 100;
            const timeSincePosted = Math.round((new Date() - new Date(request.postedAt)) / (1000 * 60));

            return (
              <div key={request.id} className={`bg-white rounded-xl p-6 shadow-sm border-2 ${request.status === 'fulfilled' ? 'border-green-200 opacity-75' : config.border} transition-all hover:shadow-md`}>
                <div className="flex items-start gap-6">
                  {/* Left: Blood Type & Urgency */}
                  <div className="text-center flex-shrink-0">
                    <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-red-600">{request.bloodType}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${config.badge}`}>
                      {config.icon} {config.label}
                    </span>
                  </div>

                  {/* Middle: Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">
                        {request.unitsNeeded} unit{request.unitsNeeded > 1 ? 's' : ''} of {request.bloodType} needed
                      </h3>
                      {request.status === 'fulfilled' && (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">✓ Fulfilled</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{request.notes}</p>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{request.donorsArrived} of {request.unitsNeeded} units collected</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${request.status === 'fulfilled' ? 'bg-green-500' : config.button.includes('red') ? 'bg-red-500' : config.button.includes('orange') ? 'bg-orange-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Donor Pipeline */}
                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">📨</div>
                        <span className="text-gray-600"><span className="font-bold text-gray-900">{request.donorsInvited}</span> invited</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs">✋</div>
                        <span className="text-gray-600"><span className="font-bold text-gray-900">{request.donorsConfirmed}</span> confirmed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs">🏥</div>
                        <span className="text-gray-600"><span className="font-bold text-gray-900">{request.donorsArrived}</span> arrived</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Meta */}
                  <div className="text-right flex-shrink-0 space-y-2">
                    <p className="text-xs text-gray-400">
                      {timeSincePosted < 60 ? `${timeSincePosted}m ago` : `${Math.round(timeSincePosted / 60)}h ago`}
                    </p>
                    <div className="bg-gray-50 rounded-lg p-2 text-xs">
                      <p className="text-gray-500">Double Invite Rule</p>
                      <p className="font-bold text-gray-900">{request.unitsNeeded} needed → {request.donorsInvited} invited</p>
                      <p className="text-gray-400">({urgencyConfig[request.urgency].multiplier}x multiplier)</p>
                    </div>
                    {request.status === 'active' && (
                      <button className="text-xs text-red-600 hover:text-red-700 font-medium">
                        Cancel Request
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
            <span className="text-4xl mb-4 block">📭</span>
            <p className="text-gray-500">No {activeTab === 'all' ? '' : activeTab} requests found.</p>
          </div>
        )}

        {/* Double Invitation Explanation */}
        <div className="mt-10 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📐 Double Invitation Logic</h3>
          <p className="text-gray-600 text-sm mb-6">
            To account for no-shows, LifeLink invites more donors than units needed. The multiplier varies by urgency. Surplus donors who arrive still donate — their units go to the hospital's blood bank reserves.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(urgencyConfig).map(([key, config]) => (
              <div key={key} className={`rounded-xl p-4 ${config.bg} border ${config.border}`}>
                <p className="font-bold text-gray-900 mb-1">{config.icon} {config.label}</p>
                <p className="text-sm text-gray-700">
                  Multiplier: <span className="font-bold">{config.multiplier}x</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  e.g. 3 units needed → {Math.ceil(3 * config.multiplier)} donors invited
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-800">
              <span className="font-bold">💡 Surplus Benefit:</span> Extra donors who arrive still donate. Their units go directly to the hospital's blood bank reserves, building emergency stock for future needs.
            </p>
          </div>
        </div>

        {/* New Request Modal */}
        {showNewRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Post Blood Request</h3>
              <p className="text-gray-500 text-sm mb-6">LifeLink will match and notify compatible donors automatically.</p>

              <form onSubmit={handlePostRequest} className="space-y-5">
                {/* Urgency Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(urgencyConfig).map(([key, config]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewRequest(prev => ({ ...prev, urgency: key }))}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${newRequest.urgency === key ? `${config.border} ${config.bg}` : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <span className="text-2xl block mb-1">{config.icon}</span>
                        <span className="text-sm font-bold text-gray-900">{config.label}</span>
                        <p className="text-xs text-gray-500 mt-1">{config.responseWindow}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blood Type & Units */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type Needed</label>
                    <select
                      required
                      value={newRequest.bloodType}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, bloodType: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select type</option>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Units Needed</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      required
                      value={newRequest.unitsNeeded}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, unitsNeeded: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="e.g. 3"
                    />
                  </div>
                </div>

                {/* Double Invite Preview */}
                {newRequest.urgency && newRequest.unitsNeeded && (
                  <div className={`rounded-xl p-4 ${urgencyConfig[newRequest.urgency].bg} border ${urgencyConfig[newRequest.urgency].border}`}>
                    <p className="text-sm font-medium text-gray-900">
                      📨 LifeLink will invite <span className="font-bold">{Math.ceil(parseInt(newRequest.unitsNeeded) * urgencyConfig[newRequest.urgency].multiplier)} donors</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      ({newRequest.unitsNeeded} units × {urgencyConfig[newRequest.urgency].multiplier}x {urgencyConfig[newRequest.urgency].label.toLowerCase()} multiplier)
                    </p>
                  </div>
                )}

                {/* Search Radius */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={newRequest.maxDistance}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, maxDistance: e.target.value }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <span className="text-lg font-bold text-red-600 min-w-[60px]">{newRequest.maxDistance} km</span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes (optional)</label>
                  <textarea
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="2"
                    placeholder="e.g. Trauma patient, scheduled surgery, blood bank replenishment..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewRequest(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newRequest.bloodType || !newRequest.unitsNeeded || !newRequest.urgency}
                    className={`flex-1 text-white py-3 rounded-xl font-semibold transition-all ${newRequest.urgency ? urgencyConfig[newRequest.urgency].button : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    {newRequest.urgency === 'critical' ? '🚨 Post Critical Request' : newRequest.urgency === 'high' ? '⚠️ Post High Request' : '📋 Post Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

