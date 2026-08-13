
import { useState } from 'react';

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

// ── Embeddable content component (used inside HospitalDashboard tab) ──
export function CooldownTrackerContent() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('daysRemaining');

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
    <div>
      {/* Info Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🛡️</span>
        </div>
        <div>
          <h3 className="font-bold text-purple-900">Donor Health Protection</h3>
          <p className="text-purple-700 text-sm">
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
              { value: 'eligible', label: '✓ Eligible' },
              { value: 'cooldown', label: '⏳ In Cooldown' },
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
        <div className="text-center py-16">
          <span className="text-4xl mb-4 block">🔍</span>
          <p className="text-gray-500">No donors match your search or filter.</p>
        </div>
      )}

      {/* Timeline Visual */}
      <div className="mt-10 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">56-Day Cooldown Timeline</h3>
        <div className="relative">
          <div className="flex justify-between items-center">
            {[
              { day: 0, label: 'Donation Day', icon: '💉', desc: 'Blood donated' },
              { day: 14, label: 'Week 2', icon: '🔴', desc: 'Red cells recovering' },
              { day: 28, label: 'Week 4', icon: '🟠', desc: 'Halfway point' },
              { day: 42, label: 'Week 6', icon: '🟡', desc: 'Almost there' },
              { day: 56, label: 'Day 56', icon: '✅', desc: 'Eligible again!' },
            ].map(({ day, label, icon, desc }) => (
              <div key={day} className="text-center flex-1">
                <div className="text-2xl mb-2">{icon}</div>
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
          <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-gradient-to-r from-red-400 via-orange-400 via-yellow-400 to-green-400 rounded-full -z-10" />
        </div>
      </div>
    </div>
  );
}

// ── Named export kept for App.tsx route (now redirects to hospital) ──
export function CooldownTracker() {
  return <CooldownTrackerContent />;
}
