import { useState } from 'react';
import { Link } from 'react-router-dom';

export function PreScreening() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    bmi: '',
    smokingStatus: '',
    alcoholUse: '',
    existingConditions: '',
    medicationHistory: '',
    consentGiven: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-6">Your pre-screening has been sent to the hospital for review. You will be notified of the outcome.</p>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
            <p className="text-blue-700 text-sm font-medium">Status: Applied</p>
            <p className="text-blue-600 text-xs mt-1">Next step: Hospital reviews your application</p>
          </div>
          <Link to="/organ" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium">Back to Bulletin</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
          <span className="text-sm font-medium">Pre-Screening • Step {step} of 3</span>
        </div>
      </nav>
      <main className="max-w-lg mx-auto px-8 py-12">
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-red-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-900">Basic Health Info</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. 28" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
                <input type="number" step="0.1" value={formData.bmi} onChange={(e) => setFormData({...formData, bmi: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. 22.5" />
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95">Next →</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-900">Lifestyle</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Smoking Status</label>
                <select value={formData.smokingStatus} onChange={(e) => setFormData({...formData, smokingStatus: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">Select</option>
                  <option value="never">Never smoked</option>
                  <option value="former">Former smoker</option>
                  <option value="current">Current smoker</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol Use</label>
                <select value={formData.alcoholUse} onChange={(e) => setFormData({...formData, alcoholUse: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">Select</option>
                  <option value="none">None</option>
                  <option value="occasional">Occasional</option>
                  <option value="regular">Regular</option>
                  </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Existing Medical Conditions</label>
                <textarea value={formData.existingConditions} onChange={(e) => setFormData({...formData, existingConditions: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" rows={3} placeholder="List any conditions or type None" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-all">← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95">Next →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-900">Consent</h3>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-yellow-800 text-sm">By submitting this form, you consent to sharing your pre-screening information with the requesting hospital. All further medical testing will happen in person.</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.consentGiven} onChange={(e) => setFormData({...formData, consentGiven: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm text-gray-700">I give my consent to share this information</span>
              </label>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-all">← Back</button>
                <button onClick={handleSubmit} disabled={!formData.consentGiven} className={`flex-1 py-3 rounded-lg font-semibold transition-all ${formData.consentGiven ? 'bg-red-600 hover:bg-red-700 text-white hover:scale-105 active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Submit Application</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

