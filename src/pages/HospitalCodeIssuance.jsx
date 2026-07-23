
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function HospitalCodeIssuance() {
  const [formData, setFormData] = useState({
    donorName: '',
    idNumber: '',
    bloodType: '',
    bmi: '',
    healthStatus: 'eligible',
    hospitalName: '',
    screeningDoctor: '',
  });

  const [generatedCode, setGeneratedCode] = useState(null);
  const [screeningChecks, setScreeningChecks] = useState({
    bloodTypeTest: false,
    bmiCheck: false,
    healthEligibility: false,
    noRecentDonation: false,
  });

  const allChecksPassed = Object.values(screeningChecks).every(Boolean);

  const generateCode = () => {
    // Format: LL-HOSPITAL-YYYYMMDD-RANDOM
    const hospitalPrefix = formData.hospitalName.substring(0, 3).toUpperCase();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `LL-${hospitalPrefix}-${date}-${random}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allChecksPassed) return;
    const code = generateCode();
    setGeneratedCode(code);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckChange = (field) => {
    setScreeningChecks(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <nav className="bg-green-800 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight">🩸 LifeLink</Link>
          <span className="text-green-200 text-sm font-medium">Hospital Staff Portal — Code Issuance</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {!generatedCode ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Donor Information */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Donor Medical Screening</h2>
              <p className="text-gray-500 text-sm mb-6">Complete the screening and generate a registration code for the donor.</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Donor Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.donorName}
                    onChange={(e) => handleInputChange('donorName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g. Thandiwe Mokoena"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID / Passport Number</label>
                  <input
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g. 9801015800083"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                  <select
                    required
                    value={formData.bloodType}
                    onChange={(e) => handleInputChange('bloodType', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select blood type</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.bmi}
                    onChange={(e) => handleInputChange('bmi', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g. 22.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                  <input
                    type="text"
                    required
                    value={formData.hospitalName}
                    onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g. Groote Schuur Hospital"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Screening Doctor</label>
                  <input
                    type="text"
                    required
                    value={formData.screeningDoctor}
                    onChange={(e) => handleInputChange('screeningDoctor', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g. Dr. Nkosi"
                  />
                </div>
              </div>
            </div>

            {/* Screening Checklist */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Medical Screening Checklist</h3>
              <p className="text-gray-500 text-sm mb-6">All checks must pass before a code can be generated.</p>

              <div className="space-y-4">
                {[
                  { key: 'bloodTypeTest', label: 'Blood Type Test Completed', desc: 'Blood type confirmed via lab test' },
                  { key: 'bmiCheck', label: 'BMI Within Acceptable Range', desc: 'BMI between 18.5 and 35' },
                  { key: 'healthEligibility', label: 'Health Eligibility Cleared', desc: 'No disqualifying conditions (HIV, Hepatitis, etc.)' },
                  { key: 'noRecentDonation', label: 'No Donation in Past 56 Days', desc: 'Confirmed donor has not donated in the last 8 weeks' },
                ].map(({ key, label, desc }) => (
                  <label key={key} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${screeningChecks[key] ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="checkbox"
                      checked={screeningChecks[key]}
                      onChange={() => handleCheckChange(key)}
                      className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <div>
                      <span className="font-semibold text-gray-900">{label}</span>
                      <p className="text-gray-500 text-sm">{desc}</p>
                    </div>
                    {screeningChecks[key] && <span className="ml-auto text-green-600 text-xl">✓</span>}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!allChecksPassed}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${allChecksPassed ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 hover:scale-[1.02] active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              {allChecksPassed ? '✓ Generate Registration Code' : 'Complete All Screening Checks First'}
            </button>
          </form>
        ) : (
          /* Code Generated Success */
          <div className="bg-white rounded-2xl p-10 shadow-xl border border-green-200 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Screening Passed!</h2>
            <p className="text-gray-500 mb-8">Provide this code to the donor to complete their LifeLink registration.</p>

            <div className="bg-gray-900 rounded-xl p-6 mb-6">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Registration Code</p>
              <p className="text-3xl font-mono font-bold text-green-400 tracking-widest">{generatedCode}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-left text-sm text-gray-600 mb-8">
              <p className="font-semibold text-gray-800 mb-2">Code Details:</p>
              <ul className="space-y-1">
                <li><span className="font-medium">Donor:</span> {formData.donorName}</li>
                <li><span className="font-medium">Blood Type:</span> {formData.bloodType}</li>
                <li><span className="font-medium">Hospital:</span> {formData.hospitalName}</li>
                <li><span className="font-medium">Screened by:</span> {formData.screeningDoctor}</li>
                <li><span className="font-medium">Issued:</span> {new Date().toLocaleDateString('en-ZA')}</li>
                <li><span className="font-medium">Expires:</span> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA')} (30 days)</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigator.clipboard.writeText(generatedCode)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition-colors"
              >
                📋 Copy Code
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition-colors"
              >
                🖨️ Print Slip
              </button>
              <button
                onClick={() => { setGeneratedCode(null); setFormData({ donorName: '', idNumber: '', bloodType: '', bmi: '', healthStatus: 'eligible', hospitalName: '', screeningDoctor: '' }); setScreeningChecks({ bloodTypeTest: false, bmiCheck: false, healthEligibility: false, noRecentDonation: false }); }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                + Next Donor
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

