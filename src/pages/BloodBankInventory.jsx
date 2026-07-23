
import { useState } from 'react';
import { Link } from 'react-router-dom';

const initialInventory = [
  { type: 'O+', units: 45, capacity: 100, lastUpdated: '2026-07-23T08:30', dailyUsage: 8, incoming: 3 },
  { type: 'O-', units: 8, capacity: 50, lastUpdated: '2026-07-23T09:15', dailyUsage: 5, incoming: 1 },
  { type: 'A+', units: 62, capacity: 100, lastUpdated: '2026-07-23T07:45', dailyUsage: 6, incoming: 4 },
  { type: 'A-', units: 15, capacity: 50, lastUpdated: '2026-07-23T08:00', dailyUsage: 3, incoming: 2 },
  { type: 'B+', units: 38, capacity: 80, lastUpdated: '2026-07-23T09:00', dailyUsage: 4, incoming: 2 },
  { type: 'B-', units: 5, capacity: 40, lastUpdated: '2026-07-23T08:45', dailyUsage: 2, incoming: 0 },
  { type: 'AB+', units: 28, capacity: 60, lastUpdated: '2026-07-23T07:30', dailyUsage: 2, incoming: 1 },
  { type: 'AB-', units: 3, capacity: 30, lastUpdated: '2026-07-23T09:30', dailyUsage: 1, incoming: 0 },
];

const getStatus = (units, capacity) => {
  const percentage = (units / capacity) * 100;
  if (percentage <= 10) return { label: 'Critical', color: 'red', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', bar: 'bg-red-500' };
  if (percentage <= 25) return { label: 'Low', color: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', bar: 'bg-orange-500' };
  if (percentage <= 60) return { label: 'Adequate', color: 'yellow', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300', bar: 'bg-yellow-500' };
  return { label: 'Full', color: 'green', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', bar: 'bg-green-500' };
};

const getDaysRemaining = (units, dailyUsage, incoming) => {
  const netUsage = dailyUsage - incoming;
  if (netUsage <= 0) return '∞';
  return Math.floor(units / netUsage);
};

export function BloodBankInventory() {
  const [inventory, setInventory] = useState(initialInventory);
  const [selectedType, setSelectedType] = useState(null);
  const [showAddStock, setShowAddStock] = useState(false);
  const [addStockData, setAddStockData] = useState({ type: '', units: '' });
  const [alertThreshold, setAlertThreshold] = useState(20); // percentage
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: 'Received', type: 'O+', units: 3, source: 'LifeLink Donor Match', time: '09:15' },
    { id: 2, action: 'Dispatched', type: 'A+', units: 2, source: 'Surgery Ward - Bed 14', time: '08:50' },
    { id: 3, action: 'Received', type: 'B+', units: 1, source: 'Walk-in Donor', time: '08:30' },
    { id: 4, action: 'Dispatched', type: 'O-', units: 4, source: 'Emergency - Trauma Unit', time: '08:15' },
    { id: 5, action: 'Expired', type: 'AB-', units: 2, source: 'Batch #LL-2026-0614', time: '07:00' },
    { id: 6, action: 'Received', type: 'O+', units: 5, source: 'SANBS Transfer', time: '06:45' },
  ]);

  const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0);
  const totalCapacity = inventory.reduce((sum, item) => sum + item.capacity, 0);
  const criticalTypes = inventory.filter(item => getStatus(item.units, item.capacity).label === 'Critical');
  const lowTypes = inventory.filter(item => getStatus(item.units, item.capacity).label === 'Low');

  const handleAddStock = (e) => {
    e.preventDefault();
    setInventory(prev => prev.map(item =>
      item.type === addStockData.type
        ? { ...item, units: Math.min(item.units + parseInt(addStockData.units), item.capacity), lastUpdated: new Date().toISOString().slice(0, 16) }
        : item
    ));
    setRecentActivity(prev => [
      { id: Date.now(), action: 'Received', type: addStockData.type, units: parseInt(addStockData.units), source: 'Manual Entry', time: new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) },
      ...prev,
    ]);
    setAddStockData({ type: '', units: '' });
    setShowAddStock(false);
  };

  const handleDispatch = (type, units) => {
    setInventory(prev => prev.map(item =>
      item.type === type
        ? { ...item, units: Math.max(item.units - units, 0), lastUpdated: new Date().toISOString().slice(0, 16) }
        : item
    ));
    setRecentActivity(prev => [
      { id: Date.now(), action: 'Dispatched', type, units, source: 'Hospital Request', time: new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) },
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-blue-900 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight">🩸 LifeLink</Link>
          <span className="text-blue-200 text-sm font-medium">Blood Bank Inventory Management</span>
          <div className="flex gap-4 text-sm">
            <Link to="/hospital" className="hover:text-blue-200 transition-colors">← Hospital Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Alert Banner */}
        {criticalTypes.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🚨</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-900">Critical Blood Shortage Alert</h3>
              <p className="text-red-700 text-sm">
                {criticalTypes.map(t => t.type).join(', ')} {criticalTypes.length === 1 ? 'is' : 'are'} at critical levels.
                LifeLink auto-notifications have been triggered to nearby compatible donors.
              </p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Post Urgent Request
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Stock</p>
            <p className="text-3xl font-bold text-gray-900">{totalUnits}</p>
            <p className="text-gray-400 text-sm">of {totalCapacity} capacity</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Utilization</p>
            <p className="text-3xl font-bold text-blue-600">{Math.round((totalUnits / totalCapacity) * 100)}%</p>
            <p className="text-gray-400 text-sm">overall capacity used</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-red-200">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Critical / Low</p>
            <p className="text-3xl font-bold text-red-600">{criticalTypes.length + lowTypes.length}</p>
            <p className="text-gray-400 text-sm">blood types need attention</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Incoming Today</p>
            <p className="text-3xl font-bold text-green-600">{inventory.reduce((sum, i) => sum + i.incoming, 0)}</p>
            <p className="text-gray-400 text-sm">units expected from donors</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Inventory Grid */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">Stock Levels by Blood Type</h2>
              <button
                onClick={() => setShowAddStock(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                + Add Stock
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {inventory.map((item) => {
                const status = getStatus(item.units, item.capacity);
                const percentage = Math.round((item.units / item.capacity) * 100);
                const daysLeft = getDaysRemaining(item.units, item.dailyUsage, item.incoming);

                return (
                  <div
                    key={item.type}
                    onClick={() => setSelectedType(selectedType === item.type ? null : item.type)}
                    className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${selectedType === item.type ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg">{item.type}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{item.units}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all ${status.bar}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{percentage}% of {item.capacity} capacity</span>
                      <span>{daysLeft === '∞' ? 'Stable' : `~${daysLeft} days left`}</span>
                    </div>

                    {/* Expanded Details */}
                    {selectedType === item.type && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-xs text-gray-500">Daily Usage</p>
                            <p className="font-bold text-gray-900">{item.dailyUsage} units</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-xs text-gray-500">Incoming</p>
                            <p className="font-bold text-green-600">+{item.incoming} units</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-xs text-gray-500">Net Burn</p>
                            <p className="font-bold text-orange-600">{item.dailyUsage - item.incoming}/day</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDispatch(item.type, 1); }}
                            className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 py-2 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Dispatch 1 Unit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setAddStockData({ type: item.type, units: '' }); setShowAddStock(true); }}
                            className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Add Stock
                          </button>
                          <Link
                            to="/matching"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg text-xs font-semibold transition-colors text-center"
                          >
                            Find Donors
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                      activity.action === 'Received' ? 'bg-green-100 text-green-600' :
                      activity.action === 'Dispatched' ? 'bg-orange-100 text-orange-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {activity.action === 'Received' ? '↓' : activity.action === 'Dispatched' ? '↑' : '✕'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {activity.action} <span className="font-bold text-red-600">{activity.units} {activity.type}</span>
                      </p>
                      <p className="text-xs text-gray-500 truncate">{activity.source}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert Settings */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Auto-Alert Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Trigger LifeLink donor alerts when stock falls below:
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(e.target.value)}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="text-lg font-bold text-blue-600 min-w-[45px]">{alertThreshold}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                    Auto-post Critical requests to LifeLink
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                    SMS alerts to hospital admin
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    Notify SANBS for emergency transfer
                  </label>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Units Received</span>
                  <span className="font-bold text-green-600">+47</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Units Dispatched</span>
                  <span className="font-bold text-orange-600">-52</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Units Expired</span>
                  <span className="font-bold text-red-600">-4</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Net Change</span>
                  <span className="font-bold text-red-600">-9</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">LifeLink Donors Matched</span>
                  <span className="font-bold text-blue-600">23</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Stock Modal */}
        {showAddStock && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Add Blood Stock</h3>
              <form onSubmit={handleAddStock} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                  <select
                    required
                    value={addStockData.type}
                    onChange={(e) => setAddStockData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select blood type</option>
                    {inventory.map(item => (
                      <option key={item.type} value={item.type}>{item.type} (Current: {item.units} units)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units to Add</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={addStockData.units}
                    onChange={(e) => setAddStockData(prev => ({ ...prev, units: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Number of units"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddStock(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors"
                  >
                    Add Stock
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

