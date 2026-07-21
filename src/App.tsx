import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { DonorRegister } from './pages/DonorRegister';
import { HospitalDashboard } from './pages/HospitalDashboard';
import { MatchingResults } from './pages/MatchingResults';
import { DonorNotification } from './pages/DonorNotification';
import { OrganBulletin } from './pages/OrganBulletin';
import { Leaderboard } from './pages/Leaderboard';
import { PreScreening } from './pages/PreScreening';
import { ApplicationTracker } from './pages/ApplicationTracker';







function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">🩸 LifeLink</h1>
          <div className="flex gap-6 text-sm font-medium">
            <Link to="/donor" className="hover:text-red-200 transition-colors">Donor Portal</Link>
            <Link to="/hospital" className="hover:text-red-200 transition-colors">Hospital Dashboard</Link>
            <Link to="/organ" className="hover:text-red-200 transition-colors">Organ Donation</Link>
            <Link to="/leaderboard" className="hover:text-red-200 transition-colors">Leaderboard</Link>

          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🩸</div>
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Connecting Donors.<br/>Saving Lives.</h2>
          <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">Real-time blood donation matching across Africa. Every drop counts.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/donor" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-red-200 transition-all hover:scale-105 active:scale-95">Register as Donor</Link>
            <Link to="/hospital" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-green-200 transition-all hover:scale-105 active:scale-95">Hospital Login</Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 pb-20">
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Real-Time Matching</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Instantly connects compatible donors with urgent requests based on blood type and location</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Urgency Tiers</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Critical, High, and Standard tiers ensure the most urgent cases get priority attention</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Gamification</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Leaderboards and badges reward and motivate regular donors</p>
          </div>
        </div>
                <div className="bg-red-800 rounded-2xl p-12 text-center text-white mb-20">
          <h3 className="text-3xl font-bold mb-3">Every 2 seconds, someone needs blood.</h3>
          <p className="text-red-200 text-lg max-w-lg mx-auto">In Africa, the gap between supply and demand is deadly and preventable. LifeLink removes the friction.</p>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        <p>LifeLink 2026 — Built with AWS Serverless Architecture</p>
      </footer>
    </div>
  );
}

function App() {
  return (
        <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donor" element={<DonorRegister />} />
        <Route path="/hospital" element={<HospitalDashboard />} />
        <Route path="/matching" element={<MatchingResults />} />
        <Route path="/notification" element={<DonorNotification />} />
        <Route path="/organ" element={<OrganBulletin />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/prescreening" element={<PreScreening />} />
        <Route path="/tracker" element={<ApplicationTracker />} />





      </Routes>
    </BrowserRouter>


  );
}

export default App;
