
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { HospitalAuthProvider } from './context/HospitalAuthContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { DonorRegister } from './pages/DonorRegister';
import { HospitalDashboard } from './pages/HospitalDashboard';
import { HospitalLogin } from './pages/HospitalLogin';
import { MatchingResults } from './pages/MatchingResults';
import { DonorNotification } from './pages/DonorNotification';
import { OrganBulletin } from './pages/OrganBulletin';
import { Leaderboard } from './pages/Leaderboard';
import { PreScreening } from './pages/PreScreening';
import { DonorApplication } from './pages/DonorApplication';
import { CodeVerification } from './pages/CodeVerification';
import { HospitalCodeIssuance } from './pages/HospitalCodeIssuance';
import { BloodBankInventory } from './pages/BloodBankInventory';
import { CooldownTracker } from './pages/CooldownTracker';
import { UrgencyRequestManager } from './pages/UrgencyRequestManager';
import { PredictiveDemand } from './pages/PredictiveDemand';
import { Login } from './pages/DonorLogin';
import { DonorProfile } from './pages/DonorProfile';
import { ConfirmDonation } from './pages/ConfirmDonation';


function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">🩸 LifeLink</h1>
          
            <div className="flex gap-6 text-sm font-medium">
            <Link to="/verify-code" className="hover:text-red-200 transition-colors">{t('nav.registerWithCode')}</Link>
            <Link to="/login" className="hover:text-red-200 transition-colors">Donor Login</Link>
            {/* <Link to="/hospital" className="hover:text-red-200 transition-colors">{t('nav.hospitalDashboard')}</Link> */}
            <Link to="/organ" className="hover:text-red-200 transition-colors">{t('nav.organDonation')}</Link>
            {/* <Link to="/leaderboard" className="hover:text-red-200 transition-colors">{t('nav.leaderboard')}</Link> */}
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🩸</div>
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">{t('home.heroTitle')}<br/>{t('home.heroTitle2')}</h2>
          <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">{t('home.heroSubtitle')}</p>
          <div className="flex gap-4 justify-center">
            <Link to="/verify-code" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-red-200 transition-all hover:scale-105 active:scale-95">{t('home.registerBtn')}</Link>
            <Link to="/hospital-login" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-green-200 transition-all hover:scale-105 active:scale-95">{t('home.hospitalBtn')}</Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 pb-20">
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">{t('home.realTimeMatching')}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{t('home.realTimeDesc')}</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">{t('home.urgencyTiers')}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{t('home.urgencyDesc')}</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">{t('home.verifiedDonors')}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{t('home.verifiedDesc')}</p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="pb-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">{t('home.howItWorks')}</h3>
          <div className="grid grid-cols-4 gap-6">
            {[
              { step: '1', icon: '🏥', title: t('home.step1Title'), desc: t('home.step1Desc') },
              { step: '2', icon: '🔬', title: t('home.step2Title'), desc: t('home.step2Desc') },
              { step: '3', icon: '🔑', title: t('home.step3Title'), desc: t('home.step3Desc') },
              { step: '4', icon: '📱', title: t('home.step4Title'), desc: t('home.step4Desc') },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">{icon}</div>
                <div className="bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">{step}</div>
                <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-red-800 rounded-2xl p-12 text-center text-white mb-20">
          <h3 className="text-3xl font-bold mb-3">{t('home.statHeadline')}</h3>
          <p className="text-red-200 text-lg max-w-lg mx-auto">{t('home.statSubtext')}</p>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        <p>{t('home.footer')}</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <HospitalAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/donor" element={<DonorRegister />} />
            <Route path="/verify-code" element={<CodeVerification />} />
            <Route path="/issue-code" element={<HospitalCodeIssuance />} />
            <Route path="/hospital-login" element={<HospitalLogin />} />
            <Route path="/hospital" element={<HospitalDashboard />} />
            <Route path="/matching" element={<MatchingResults />} />
            <Route path="/notification" element={<DonorNotification />} />
            <Route path="/organ" element={<OrganBulletin />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/prescreening" element={<PreScreening />} />
          <Route path="/donor-application" element={<DonorApplication />} />
            <Route path="/inventory" element={<BloodBankInventory />} />
            <Route path="/cooldown" element={<CooldownTracker />} />
            <Route path="/urgency" element={<UrgencyRequestManager />} />
            <Route path="/predictions" element={<PredictiveDemand />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<DonorProfile />} />
            <Route path="/confirm/:requestId" element={<ConfirmDonation />} />  
          </Routes>
        </BrowserRouter>
      </HospitalAuthProvider>
    </LanguageProvider>
  );
}

export default App;

