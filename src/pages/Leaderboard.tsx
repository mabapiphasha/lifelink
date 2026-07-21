import { Link } from 'react-router-dom';

interface TopDonor {
  rank: number;
  name: string;
  location: string;
  donations: number;
  badges: string[];
  lastDonation: string;
}

const topDonors: TopDonor[] = [
  { rank: 1, name: 'Sipho Dlamini', location: 'Johannesburg', donations: 24, badges: ['🥇', '💎', '🔥'], lastDonation: '2026-07-10' },
  { rank: 2, name: 'Amina Osei', location: 'Nairobi', donations: 18, badges: ['🥈', '💎'], lastDonation: '2026-07-05' },
  { rank: 3, name: 'Thabo Molefe', location: 'Cape Town', donations: 15, badges: ['🥉', '🔥'], lastDonation: '2026-06-28' },
  { rank: 4, name: 'Fatima Hassan', location: 'Lagos', donations: 12, badges: ['⭐'], lastDonation: '2026-07-01' },
  { rank: 5, name: 'David Nkosi', location: 'Durban', donations: 10, badges: ['⭐'], lastDonation: '2026-06-15' },
  { rank: 6, name: 'Grace Wanjiku', location: 'Nairobi', donations: 8, badges: [], lastDonation: '2026-07-12' },
  { rank: 7, name: 'Khethukuthula Sabela', location: 'Cape Town', donations: 6, badges: ['🌟'], lastDonation: '2026-07-18' },
];

const allBadges = [
  { icon: '🥇', name: 'Gold Donor', desc: '20+ donations' },
  { icon: '🥈', name: 'Silver Donor', desc: '15+ donations' },
  { icon: '🥉', name: 'Bronze Donor', desc: '10+ donations' },
  { icon: '💎', name: 'Diamond', desc: 'Donated all blood types' },
  { icon: '🔥', name: 'Streak', desc: '6 months consecutive' },
  { icon: '⭐', name: 'Rising Star', desc: '5+ donations' },
  { icon: '🌟', name: 'Newcomer', desc: 'First donation' },
];

export function Leaderboard() {
return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
          <span className="text-sm font-medium">Leaderboard</span>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Donor Leaderboard</h2>
          <p className="text-gray-500 mt-1">Celebrating our top life-savers across Africa</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {topDonors.slice(0, 3).map((donor) => (
            <div key={donor.rank} className={`bg-white rounded-2xl p-6 shadow-md border text-center ${donor.rank === 1 ? 'border-yellow-300 ring-2 ring-yellow-200' : 'border-gray-100'}`}>
              <div className="text-4xl mb-2">{donor.rank === 1 ? '🥇' : donor.rank === 2 ? '🥈' : '🥉'}</div>
              <h3 className="font-bold text-gray-900">{donor.name}</h3>
              <p className="text-gray-400 text-xs">{donor.location}</p>
              <p className="text-red-600 font-bold text-2xl mt-2">{donor.donations}</p>
              <p className="text-gray-500 text-xs">donations</p>
              <div className="mt-2">{donor.badges.join(' ')}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-10">
          {topDonors.map((donor) => (
            <div key={donor.rank} className="flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <span className="w-8 text-center font-bold text-gray-400">#{donor.rank}</span>
                <div>
                  <p className="font-medium text-gray-900">{donor.name}</p>
                  <p className="text-gray-400 text-xs">{donor.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm">{donor.badges.join(' ')}</span>
                <span className="font-bold text-red-600">{donor.donations} donations</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Achievement Badges</h3>
                    <div className="grid grid-cols-4 gap-3">
            {allBadges.map((badge) => (
                            <div key={badge.name} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="font-medium text-gray-900 text-sm">{badge.name}</p>
                <p className="text-gray-400 text-xs">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
