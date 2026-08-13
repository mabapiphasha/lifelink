
import { useState } from 'react';
import { Link } from 'react-router-dom';

const donorData = [
  { id: 1, name: 'Thandiwe Mokoena', bloodType: 'O+', lastDonation: '2026-07-20', totalDonations: 8, city: 'Cape Town' },
  { id: 2, name: 'Sipho Ndlovu', bloodType: 'A+', lastDonation: '2026-06-15', totalDonations: 12, city: 'Johannesburg' },
  { id: 3, name: 'Naledi Dlamini', bloodType: 'B+', lastDonation: '2026-05-28', totalDonations: 5, city: 'Durban' },
  { id: 4, name: 'Thabo Molefe', bloodType: 'O-', lastDonation: '2026-07-01', totalDonations: 15, city: 'Pretoria' },
  { id: 5, name: 'Lerato Khumalo', bloodType: 'AB+', lastDonation: '2026-04-10', totalDonations: 3, city: 'Bloemfontein' },
  { id: 6, name: 'Mandla Zulu', bloodType: 'A-', lastDonation: '2026-07-18', totalDonations: 6, city: 'Port Elizabeth' },
  { id: 7, name: 'Zanele Mthembu', bloodType: 'B-', lastDonation: '2026-06-01', totalDonations: 9, city: 'Polokwane' },
  { id: 8, name: 'Bongani Nkosi', bloodType: 'O+', lastDonation: '2026-05-10', totalDonations: 20, city: 'Nelspruit' },
  { id: 9, name: 'Ayanda Sithole', bloodType: 'AB-', lastDonation: '2026-07-22', totalDonations: 2, city: 'Kimberley' },
  { id: 10, name: 'Nomvula Cele', bloodType: 'A+', lastDonation: '2026-06-25', totalDonations: 7, city: 'East London' },
  { id: 11, name: 'Kagiso Moagi', bloodType: 'O-', lastDonation: '2026-05-01', totalDonations: 11, city: 'Rustenburg' },
  { id: 12, name: 'Palesa Tau', bloodType: 'B+', lastDonation: '2026-07-10', totalDonations: 4, city: 'Mahikeng' },
];

const COOLDOWN_DAYS = 56;

const getCooldownInfo = (lastDonationDate) => {
  const today = new Date();
  const lastDonation = new Date(lastDonationDate);
  const daysSince = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(COOLDOWN_DAYS - daysSince, 0);
  const percentage = Math.min((daysSince / COOLDOWN_DAYS) * 100, 100);
  const eligibleDate = new Date(lastDonation.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  const isEligible = daysRemaining === 0;

  return { daysSince, daysRemaining, percentage, eligibleDate, isEligible };
};

const getStatusStyle = (daysRemaining) => {
  if (daysRemaining === 0) return { label: 'Eligible', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
  if (daysRemaining <= 7) return { label: 'Almost Ready', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' };
  if (daysRemaining <= 28) return { label: 'Recovering', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' };
  return { label: 'Cooldown', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
};

export function CooldownTracker() {
  const [filter, setFilter] = useState('all'); // all, eligible, cooldown
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('daysRemaining'); // daysRemaining, name, bloodType, totalDonations

  const processedDonors = donorData.map(donor => ({
    ...donor,
    cooldown: getCooldownInfo(donor.lastDonation),
  }));

  const filteredDonors = processedDonors
    .filter(donor => {
      if (filter === 'eligible') return donor.cooldown.isEligible;
      if (filter === 'cooldown') return !donor.cooldown.isEligible;
      return true;
    })
    .filter(donor =>
      donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.city.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'daysRemaining') return a.cooldown.daysRemaining - b.cooldown.daysRemaining;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'bloodType') return a.bloodType.localeCompare(b.bloodType);
      if (sortBy === 'totalDonations') return b.totalDonations - a.totalDonations;
      return 0;
    });

  const eligibleCount = processedDonors.filter(d => d.cooldown.isEligible).length;
  const cooldownCount = processedDonors.filter(d => !d.cooldown.isEligible).length;
  const almostReadyCount = processedDonors.filter(d => d.cooldown.daysRemaining > 0 && d.cooldown.daysRemaining <= 7).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-red-800 text-white px-6 py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">LifeLink</Link>
          <span className="text-red-200 text-sm font-medium">56-Day Cooldown Tracker</span>
          <Link to="/hospital" className="text-sm text-red-200 hover:text-white transition-colors">
            Back to Hospital Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded p-5 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-1">Donor Health Protection</h3>
            <p className="text-blue-700 text-sm">
              The 56-day (8-week) cooldown ensures donors fully recover between donations. LifeLink automatically excludes donors in cooldown from matching notifications.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Donors</p>
            <p className="text-3xl font-bold text-gray-900">{processedDonors.length}</p>
            <p className="text-gray-400 text-sm">registered</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-green-200 text-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{eligibleCount}</p>
            <p className="text-gray-500 text-sm">Eligible Now</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-yellow-200 text-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-600">{almostReadyCount}</p>
            <p className="text-gray-500 text-sm">Ready Within 7 Days</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-red-200 text-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{cooldownCount}</p>
            <p className="text-gray-500 text-sm">In Cooldown</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { value: 'all', label: 'All Donors' },
                { value: 'eligible', label: 'Eligible' },
                { value: 'cooldown', label: 'In Cooldown' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === value ? 'bg-white shadow-sm text-purple-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search by name, blood type, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="daysRemaining">Sort: Soonest Eligible</option>
              <option value="name">Sort: Name A-Z</option>
              <option value="bloodType">Sort: Blood Type</option>
              <option value="totalDonations">Sort: Most Donations</option>
            </select>
          </div>
        </div>

        {/* Donor List */}
        <div className="space-y-3">
          {filteredDonors.map((donor) => {
            const status = getStatusStyle(donor.cooldown.daysRemaining);

            return (
              <div key={donor.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-5">
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-4 w-56 flex-shrink-0">
                    <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm">
                      {donor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{donor.name}</p>
                      <p className="text-xs text-gray-500">{donor.city}</p>
                    </div>
                  </div>

                  {/* Blood Type */}
                  <span className="bg-red-50 text-red-700 px-3 py-1 rounded-lg font-bold text-sm flex-shrink-0">
                    {donor.bloodType}
                  </span>

                  {/* Progress Bar */}
                  <div className="flex-1 mx-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Day {donor.cooldown.daysSince} of 56</span>
                      <span>
                        {donor.cooldown.isEligible
                          ? 'Ready to donate!'
                          : `${donor.cooldown.daysRemaining} days remaining`
                        }
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${donor.cooldown.isEligible ? 'bg-green-500' : donor.cooldown.percentage > 75 ? 'bg-yellow-500' : 'bg-purple-500'}`}
                        style={{ width: `${donor.cooldown.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg} flex-shrink-0`}>
                    <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                    <span className={`text-xs font-semibold ${status.text}`}>{status.label}</span>
                  </div>

                  {/* Stats */}
                  <div className="text-center flex-shrink-0 w-20">
                    <p className="text-lg font-bold text-gray-900">{donor.totalDonations}</p>
                    <p className="text-xs text-gray-500">donations</p>
                  </div>

                  {/* Eligible Date */}
                  <div className="text-right flex-shrink-0 w-28">
                    <p className="text-xs text-gray-500">
                      {donor.cooldown.isEligible ? 'Eligible since' : 'Eligible on'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {donor.cooldown.eligibleDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDonors.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-200 rounded">
            <p className="text-gray-500 text-lg font-medium mb-2">No donors found</p>
            <p className="text-gray-400 text-sm">No donors match your search or filter criteria.</p>
          </div>
        )}

        {/* Timeline Visual */}
        <div className="mt-10 bg-white rounded border border-gray-200 p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">56-Day Cooldown Timeline</h3>
          <div className="relative">
            <div className="flex justify-between items-center">
              {[
                { day: 0, label: 'Donation Day', desc: 'Blood donated' },
                { day: 14, label: 'Week 2', desc: 'Red cells recovering' },
                { day: 28, label: 'Week 4', desc: 'Halfway point' },
                { day: 42, label: 'Week 6', desc: 'Almost there' },
                { day: 56, label: 'Day 56', desc: 'Eligible again' },
              ].map(({ day, label, desc }) => (
                <div key={day} className="text-center flex-1">
                  <div className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">
                    {day}
                  </div>
                  <p className="text-sm font-bold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
            <div className="absolute top-4 left-[10%] right-[10%] h-1 bg-gradient-to-r from-red-400 via-orange-400 via-yellow-400 to-green-400 rounded-full -z-10" />
          </div>
        </div>
      </main>
    </div>
  );
}

