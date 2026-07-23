
import { useState } from 'react';
import { Link } from 'react-router-dom';

const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const historicalData = {
  'O+': { avgDaily: 8, trend: 'increasing', weeklyHistory: [52, 55, 58, 54, 60, 62, 65], peakDay: 'Monday', seasonalFactor: 1.2 },
  'O-': { avgDaily: 5, trend: 'increasing', weeklyHistory: [30, 33, 35, 38, 36, 40, 42], peakDay: 'Monday', seasonalFactor: 1.3 },
  'A+': { avgDaily: 6, trend: 'stable', weeklyHistory: [40, 42, 41, 43, 42, 44, 43], peakDay: 'Wednesday', seasonalFactor: 1.0 },
  'A-': { avgDaily: 3, trend: 'stable', weeklyHistory: [20, 21, 19, 22, 20, 21, 20], peakDay: 'Friday', seasonalFactor: 1.0 },
  'B+': { avgDaily: 4, trend: 'decreasing', weeklyHistory: [30, 28, 29, 27, 26, 25, 24], peakDay: 'Tuesday', seasonalFactor: 0.9 },
  'B-': { avgDaily: 2, trend: 'increasing', weeklyHistory: [12, 13, 14, 13, 15, 16, 17], peakDay: 'Thursday', seasonalFactor: 1.1 },
  'AB+': { avgDaily: 2, trend: 'stable', weeklyHistory: [14, 15, 14, 13, 14, 15, 14], peakDay: 'Wednesday', seasonalFactor: 1.0 },
  'AB-': { avgDaily: 1, trend: 'increasing', weeklyHistory: [6, 7, 7, 8, 8, 9, 9], peakDay: 'Monday', seasonalFactor: 1.2 },
};

const currentStock = {
  'O+': 45, 'O-': 8, 'A+': 62, 'A-': 15, 'B+': 38, 'B-': 5, 'AB+': 28, 'AB-': 3,
};

const upcomingEvents = [
  { id: 1, event: 'Marathon Cape Town', date: '2026-07-27', impact: 'high', affectedTypes: ['O+', 'O-', 'A+'], note: 'Mass event — increased trauma risk' },
  { id: 2, event: 'School Holiday Period', date: '2026-07-28', impact: 'medium', affectedTypes: ['O+', 'B+', 'A+'], note: 'Higher road accidents during holidays' },
  { id: 3, event: 'Scheduled Surgeries (Groote Schuur)', date: '2026-07-25', impact: 'high', affectedTypes: ['A+', 'O-', 'B+'], note: '12 elective surgeries scheduled' },
  { id: 4, event: 'Blood Drive — UCT Campus', date: '2026-07-29', impact: 'positive', affectedTypes: ['O+', 'A+', 'B+', 'AB+'], note: 'Expected 40+ donors' },
];

const generateForecast = (type, days) => {
  const data = historicalData[type];
  const forecast = [];
  const today = new Date();

  for (let i = 1; i <= days; i++) {
    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayFactor = dayOfWeek === data.peakDay ? 1.3 : dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday' ? 0.6 : 1.0;
    const trendFactor = data.trend === 'increasing' ? 1 + (i * 0.02) : data.trend === 'decreasing' ? 1 - (i * 0.01) : 1;
    const randomVariance = 0.85 + Math.random() * 0.3;
    const predicted = Math.round(data.avgDaily * dayFactor * trendFactor * data.seasonalFactor * randomVariance);

    forecast.push({
      date: date.toISOString().slice(0, 10),
      dayOfWeek,
      predicted,
      confidence: Math.max(60, 95 - (i * 3)),
    });
  }
  return forecast;
};

const getRiskLevel = (type, forecastDays) => {
  const data = historicalData[type];
  const stock = currentStock[type];
  const predictedDemand = forecastDays.reduce((sum, d) => sum + d.predicted, 0);
  const daysOfStock = stock / data.avgDaily;

  if (daysOfStock <= 2) return { level: 'critical', label: 'Critical Risk', color: 'red', icon: '🚨' };
  if (daysOfStock <= 5) return { level: 'high', label: 'High Risk', color: 'orange', icon: '⚠️' };
  if (daysOfStock <= 10) return { level: 'moderate', label: 'Moderate', color: 'yellow', icon: '📊' };
  return { level: 'low', label: 'Low Risk', color: 'green', icon: '✅' };
};

export function PredictiveDemand() {
  const [selectedType, setSelectedType] = useState('O-');
  const [forecastRange, setForecastRange] = useState(7); // days
  const [showRecommendations, setShowRecommendations] = useState(true);

  const forecast = generateForecast(selectedType, forecastRange);
  const totalPredicted = forecast.reduce((sum, d) => sum + d.predicted, 0);
  const risk = getRiskLevel(selectedType, forecast);
  const stockDaysLeft = Math.round(currentStock[selectedType] / historicalData[selectedType].avgDaily);
  const shortfall = Math.max(0, totalPredicted - currentStock[selectedType]);

  // Generate recommendations
  const recommendations = bloodTypes
    .map(type => {
      const r = getRiskLevel(type, generateForecast(type, 7));
      return { type, ...r, stock: currentStock[type], avgDaily: historicalData[type].avgDaily };
    })
    .sort((a, b) => {
      const order = { critical: 0, high: 1, moderate: 2, low: 3 };
      return order[a.level] - order[b.level];
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <nav className="bg-indigo-900 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight">🩸 LifeLink</Link>
          <span className="text-indigo-200 text-sm font-medium">Predictive Demand Modelling</span>
          <Link to="/hospital" className="text-sm hover:text-indigo-200 transition-colors">← Hospital Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blood Demand Forecast</h1>
            <p className="text-gray-500 text-sm">AI-powered predictions based on historical patterns, seasonal trends, and upcoming events</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={forecastRange}
              onChange={(e) => setForecastRange(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={7}>Next 7 Days</option>
              <option value={14}>Next 14 Days</option>
              <option value={30}>Next 30 Days</option>
            </select>
          </div>
        </div>

        {/* Risk Overview */}
        <div className="grid grid-cols-8 gap-3 mb-8">
          {bloodTypes.map(type => {
            const r = getRiskLevel(type, generateForecast(type, forecastRange));
            const isSelected = type === selectedType;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-xl p-4 text-center transition-all border-2 ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-md' : 'border-gray-100 hover:border-gray-300'} bg-white`}
              >
                <span className="text-lg font-bold text-red-600 block">{type}</span>
                <span className="text-xs block mt-1">{r.icon}</span>
                <span className={`text-xs font-medium block mt-1 ${r.color === 'red' ? 'text-red-600' : r.color === 'orange' ? 'text-orange-600' : r.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'}`}>
                  {r.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Forecast Panel */}
          <div className="col-span-2 space-y-6">
            {/* Selected Type Summary */}
            <div className={`rounded-2xl p-6 border-2 ${risk.color === 'red' ? 'bg-red-50 border-red-300' : risk.color === 'orange' ? 'bg-orange-50 border-orange-300' : risk.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-2xl font-bold text-red-600">{selectedType}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedType} Forecast — Next {forecastRange} Days</h2>
                    <p className="text-sm text-gray-600">
                      Trend: <span className="font-medium capitalize">{historicalData[selectedType].trend}</span> •
                      Peak day: <span className="font-medium">{historicalData[selectedType].peakDay}</span> •
                      Seasonal factor: <span className="font-medium">{historicalData[selectedType].seasonalFactor}x</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl">{risk.icon}</span>
                  <p className={`text-sm font-bold ${risk.color === 'red' ? 'text-red-700' : risk.color === 'orange' ? 'text-orange-700' : risk.color === 'yellow' ? 'text-yellow-700' : 'text-green-700'}`}>
                    {risk.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Stock</p>
                <p className="text-2xl font-bold text-gray-900">{currentStock[selectedType]}</p>
                <p className="text-xs text-gray-400">units</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Predicted Demand</p>
                <p className="text-2xl font-bold text-indigo-600">{totalPredicted}</p>
                <p className="text-xs text-gray-400">units ({forecastRange} days)</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Days of Stock Left</p>
                <p className={`text-2xl font-bold ${stockDaysLeft <= 3 ? 'text-red-600' : stockDaysLeft <= 7 ? 'text-orange-600' : 'text-green-600'}`}>{stockDaysLeft}</p>
                <p className="text-xs text-gray-400">at current rate</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Projected Shortfall</p>
                <p className={`text-2xl font-bold ${shortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {shortfall > 0 ? `-${shortfall}` : '✓ OK'}
                </p>
                <p className="text-xs text-gray-400">{shortfall > 0 ? 'units deficit' : 'sufficient'}</p>
              </div>
            </div>

            {/* Daily Forecast Table */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Daily Demand Forecast</h3>
              <div className="space-y-2">
                {forecast.map((day, i) => {
                  const maxPredicted = Math.max(...forecast.map(d => d.predicted));
                  const barWidth = (day.predicted / maxPredicted) * 100;
                  const isWeekend = day.dayOfWeek === 'Saturday' || day.dayOfWeek === 'Sunday';
                  const isPeak = day.dayOfWeek === historicalData[selectedType].peakDay;

                  return (
                    <div key={day.date} className={`flex items-center gap-4 p-3 rounded-lg ${isPeak ? 'bg-indigo-50' : isWeekend ? 'bg-gray-50' : ''}`}>
                      <div className="w-24 flex-shrink-0">
                        <p className="text-sm font-medium text-gray-900">{day.dayOfWeek.slice(0, 3)}</p>
                        <p className="text-xs text-gray-500">{new Date(day.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</p>
                      </div>
                      <div className="flex-1">
                        <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isPeak ? 'bg-indigo-500' : 'bg-indigo-300'}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-20 text-right flex-shrink-0">
                        <span className="text-sm font-bold text-gray-900">{day.predicted} units</span>
                      </div>
                      <div className="w-16 text-right flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${day.confidence >= 80 ? 'bg-green-100 text-green-700' : day.confidence >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {day.confidence}%
                        </span>
                      </div>
                      {isPeak && <span className="text-xs text-indigo-600 font-medium flex-shrink-0">📈 Peak</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly History */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Weekly Usage History (Last 7 Weeks)</h3>
              <div className="flex items-end gap-3 h-40">
                {historicalData[selectedType].weeklyHistory.map((value, i) => {
                  const max = Math.max(...historicalData[selectedType].weeklyHistory);
                  const height = (value / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-gray-700">{value}</span>
                      <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '120px' }}>
                        <div
                          className={`absolute bottom-0 w-full rounded-t-lg transition-all ${i === 6 ? 'bg-indigo-500' : 'bg-indigo-200'}`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">W{i + 1}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>7 weeks ago</span>
                <span>This week</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">📅 Upcoming Events Impacting Demand</h3>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className={`p-3 rounded-lg border ${event.impact === 'high' ? 'border-red-200 bg-red-50' : event.impact === 'positive' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">{event.event}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${event.impact === 'high' ? 'bg-red-100 text-red-700' : event.impact === 'positive' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {event.impact === 'positive' ? '↑ Supply' : `↑ Demand`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{new Date(event.date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    <p className="text-xs text-gray-600">{event.note}</p>
                    <div className="flex gap-1 mt-2">
                      {event.affectedTypes.map(t => (
                        <span key={t} className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200 font-medium">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Actions */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">🎯 Recommended Actions</h3>
              <div className="space-y-3">
                {recommendations.filter(r => r.level === 'critical' || r.level === 'high').map(rec => (
                  <div key={rec.type} className={`p-3 rounded-lg border ${rec.level === 'critical' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900">{rec.icon} {rec.type}</span>
                      <span className="text-xs text-gray-500">{rec.stock} units left</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {rec.level === 'critical'
                        ? `Only ~${Math.round(rec.stock / rec.avgDaily)} days of stock. Post urgent LifeLink request immediately.`
                        : `~${Math.round(rec.stock / rec.avgDaily)} days of stock. Schedule proactive donor outreach.`
                      }
                    </p>
                    <Link
                      to="/urgency"
                      className={`block text-center mt-2 text-xs font-semibold py-1.5 rounded-lg text-white ${rec.level === 'critical' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                    >
                      {rec.level === 'critical' ? '🚨 Post Critical Request' : '⚠️ Post High Request'}
                    </Link>
                  </div>
                ))}
                {recommendations.filter(r => r.level === 'critical' || r.level === 'high').length === 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                    <span className="text-2xl block mb-2">✅</span>
                    <p className="text-sm text-green-800 font-medium">All blood types at safe levels</p>
                  </div>
                )}
              </div>
            </div>

            {/* Model Info */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">🤖 Prediction Model</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Algorithm</span>
                  <span className="font-medium text-gray-900">Time Series + Events</span>
                </div>
                <div className="flex justify-between">
                  <span>Training Data</span>
                  <span className="font-medium text-gray-900">24 months</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy (7-day)</span>
                  <span className="font-medium text-green-600">87%</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy (30-day)</span>
                  <span className="font-medium text-yellow-600">72%</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Retrained</span>
                  <span className="font-medium text-gray-900">2026-07-21</span>
                </div>
                <div className="flex justify-between">
                  <span>Factors Used</span>
                  <span className="font-medium text-gray-900">6</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                <p className="text-xs text-indigo-700">
                  <span className="font-medium">Factors:</span> Historical usage, day-of-week patterns, seasonal trends, scheduled surgeries, local events, weather data
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

