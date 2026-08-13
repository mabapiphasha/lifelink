import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BloodType } from '../types';
import axios from 'axios';
import { API } from '../config/api';

export function DonorRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const verifiedData = location.state || {};

  const [formData, setFormData] = useState({
    fullName: verifiedData.donorName || '',
    email: '',
    countryCode: '+27',
    phone: '',
    password: '',
    confirmPassword: '',
    bloodType: (verifiedData.bloodType || '') as BloodType,
    location: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits (excluding country code)');
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        fullName: formData.fullName,
        email: formData.email,
        phone: `${formData.countryCode}${formData.phone}`,
        bloodType: formData.bloodType,
        location: formData.location,
      };
      if (verifiedData.code) {
        payload.code = verifiedData.code;
      }
      const response = await axios.post(API.registerDonor, payload);

      if (response.data.success) {
        const donorProfile = {
          name: formData.fullName,
          email: formData.email,
          phone: `${formData.countryCode}${formData.phone}`,
          bloodType: formData.bloodType,
          location: formData.location,
          registeredAt: new Date().toISOString().split('T')[0],
          donorId: response.data.donorId || `D-${Date.now()}`,
        };

        const existing = JSON.parse(localStorage.getItem('registeredDonors') || '[]');
        existing.push(donorProfile);
        localStorage.setItem('registeredDonors', JSON.stringify(existing));
        localStorage.setItem('currentDonor', JSON.stringify(donorProfile));

        setSubmitted(true);
      }
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.error || 'Registration failed');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete</h2>
          <p className="text-gray-500 mb-6">Welcome to LifeLink, {formData.fullName}. Your donor account is ready.</p>
          <p className="text-gray-400 text-sm mb-6">You can now log in anytime to view your profile, track donations, and receive notifications.</p>
          <div className="space-y-3">
            <button onClick={() => navigate('/profile')} className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-medium transition-colors">
              Go to My Profile
            </button>
            <Link to="/" className="block text-gray-400 text-sm hover:underline">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-red-800 text-white px-6 py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">LifeLink</Link>
          <Link to="/login" className="text-sm text-red-200 hover:text-white transition-colors">
            Already registered? Login
          </Link>
        </div>
      </nav>
      <main className="max-w-lg mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Become a Donor</h2>
        <p className="text-gray-500 mb-8">Join thousands of life-savers across Africa.</p>

        {verifiedData.donorName && (
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-6">
            <p className="text-green-700 text-sm">Verified: {verifiedData.donorName} &bull; {verifiedData.bloodType} &bull; {verifiedData.hospital}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. Khethukuthula Sabela" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="flex gap-2">
              <select
                value={formData.countryCode}
                onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                className="border border-gray-300 rounded px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="+27">ZA +27</option>
                <option value="+254">KE +254</option>
                <option value="+234">NG +234</option>
                <option value="+263">ZW +263</option>
                <option value="+255">TZ +255</option>
              </select>
              <input
                type="tel"
                required
                maxLength={10}
                pattern="\d{10}"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                className="flex-1 border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="10-digit number"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Enter exactly 10 digits after the country code</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
            <div className="grid grid-cols-4 gap-2">
              {bloodTypes.map((type) => (
                <button key={type} type="button" onClick={() => setFormData({...formData, bloodType: type})} className={`py-2 rounded text-sm font-medium border transition-colors ${formData.bloodType === type ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'}`}>{type}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">Select your city</option>
              <option value="Cape Town">Cape Town</option>
              <option value="Johannesburg">Johannesburg</option>
              <option value="Durban">Durban</option>
              <option value="Pretoria">Pretoria</option>
              <option value="Nairobi">Nairobi</option>
              <option value="Lagos">Lagos</option>
              <option value="Dublin">Dublin</option>
            </select>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-medium text-gray-900 mb-3">Create Your Login Password</p>
            <p className="text-xs text-gray-400 mb-3">You'll use this to log in next time without needing a hospital code.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Minimum 6 characters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Re-enter password" />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className={`w-full py-3 rounded font-semibold text-base shadow transition-colors mt-4 ${loading ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
            {loading ? 'Creating Account...' : 'Create Account & Register'}
          </button>
        </form>
      </main>
    </div>
  );
}
