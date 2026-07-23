
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function CodeVerification() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter Code, 2: Complete Profile, 3: Success
  const [code, setCode] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [verifiedData, setVerifiedData] = useState(null);

  const [profileData, setProfileData] = useState({
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    notificationPreference: 'both',
    maxDistance: '10',
    emergencyContact: '',
    emergencyPhone: '',
  });

  // Simulated code verification (in production, this calls your API/DynamoDB)
  const verifyCode = () => {
    setCodeError('');

    // Validate format: LL-XXX-YYYYMMDD-XXXXXX
    const codePattern = /^LL-[A-Z]{3}-\d{8}-[A-Z0-9]{6}$/;
    if (!codePattern.test(code.trim().toUpperCase())) {
      setCodeError('Invalid code format. Please check the code from your hospital slip.');
      return;
    }

    // Simulate API lookup — in production this checks DynamoDB
    // For demo, any correctly formatted code "works"
    setCodeVerified(true);
    setVerifiedData({
      donorName: 'Thandiwe Mokoena',
      bloodType: 'O+',
      hospital: 'Groote Schuur Hospital',
      screeningDate: '2026-07-23',
      expiresAt: '2026-08-22',
    });
    setStep(2);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight">🩸 LifeLink</Link>
          <span className="text-red-200 text-sm font-medium">Donor Registration</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-10">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          {['Enter Code', 'Complete Profile', 'Activated'].map((label, i) => (
            <div key={label} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${step === i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
              {i < 2 && <div className={`w-12 h-0.5 mx-3 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Enter Code */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔑</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Your Registration Code</h2>
              <p className="text-gray-500 text-sm">You received this code from the hospital after your medical screening.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registration Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="LL-GRO-20260723-A1B2C3"
                  className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 text-center text-xl font-mono tracking-wider focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {codeError && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {codeError}
                  </p>
                )}
              </div>

              <button
                onClick={verifyCode}
                disabled={!code.trim()}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${code.trim() ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 hover:scale-[1.02] active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                Verify Code
              </button>
            </div>

            <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-amber-800 text-sm font-medium">💡 Don't have a code?</p>
              <p className="text-amber-700 text-xs mt-1">Visit your nearest participating hospital for a free blood donation screening. Once cleared, you'll receive a registration code.</p>
            </div>
          </div>
        )}

        {/* Step 2: Complete Profile */}
        {step === 2 && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Verified Info Banner */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">✅</span>
                <h3 className="font-bold text-green-900">Code Verified Successfully</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                <p><span className="font-medium">Name:</span> {verifiedData.donorName}</p>
                <p><span className="font-medium">Blood Type:</span> <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{verifiedData.bloodType}</span></p>
                <p><span className="font-medium">Hospital:</span> {verifiedData.hospital}</p>
                <p><span className="font-medium">Screened:</span> {verifiedData.screeningDate}</p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="+27 82 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="thandiwe@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    required
                    value={profileData.address}
                    onChange={(e) => handleProfileChange('address', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="123 Main Road"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={profileData.city}
                      onChange={(e) => handleProfileChange('city', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Cape Town"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <select
                      required
                      value={profileData.province}
                      onChange={(e) => handleProfileChange('province', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select province</option>
                      <option value="EC">Eastern Cape</option>
                      <option value="FS">Free State</option>
                      <option value="GP">Gauteng</option>
                      <option value="KZN">KwaZulu-Natal</option>
                      <option value="LP">Limpopo</option>
                      <option value="MP">Mpumalanga</option>
                      <option value="NC">Northern Cape</option>
                      <option value="NW">North West</option>
                      <option value="WC">Western Cape</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How should we notify you?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'sms', label: '📱 SMS Only' },
                      { value: 'email', label: '📧 Email Only' },
                      { value: 'both', label: '📱📧 Both' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleProfileChange('notificationPreference', value)}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${profileData.notificationPreference === value ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Distance Willing to Travel</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={profileData.maxDistance}
                      onChange={(e) => handleProfileChange('maxDistance', e.target.value)}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <span className="text-lg font-bold text-red-600 min-w-[60px]">{profileData.maxDistance} km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={profileData.emergencyContact}
                    onChange={(e) => handleProfileChange('emergencyContact', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Sipho Mokoena"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={profileData.emergencyPhone}
                    onChange={(e) => handleProfileChange('emergencyPhone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="+27 83 456 7890"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-200 transition-all hover:scale-[1.02] active:scale-95"
            >
              Complete Registration →
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-10 shadow-xl border border-green-200 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🎉</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to LifeLink!</h2>
            <p className="text-gray-500 mb-8">Your account is now active. You'll be notified when a compatible patient needs you nearby.</p>

            <div className="bg-gray-50 rounded-xl p-6 text-left mb-8">
              <h4 className="font-bold text-gray-900 mb-3">Your Donor Profile</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p><span className="text-gray-500">Name:</span> <span className="font-medium">{verifiedData.donorName}</span></p>
                <p><span className="text-gray-500">Blood Type:</span> <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{verifiedData.bloodType}</span></p>
                <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{profileData.phone}</span></p>
                <p><span className="text-gray-500">Notifications:</span> <span className="font-medium capitalize">{profileData.notificationPreference}</span></p>
                <p><span className="text-gray-500">Max Distance:</span> <span className="font-medium">{profileData.maxDistance} km</span></p>
                <p><span className="text-gray-500">Status:</span> <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Active ✓</span></p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-left text-sm text-blue-800 mb-8">
              <p className="font-semibold mb-1">📋 What happens next?</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Go about your day as normal</li>
                <li>• When a compatible patient needs blood near you, you'll get a notification</li>
                <li>• Tap "I'll donate" to confirm, then head to the hospital</li>
                <li>• Your next eligible donation date will be tracked automatically (56-day cooldown)</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Link to="/" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition-colors text-center">
                Go Home
              </Link>
              <Link to="/notification" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-colors text-center">
                View Demo Notification
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

