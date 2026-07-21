import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BloodType } from '../types';

export function DonorRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodType: '' as BloodType,
    location: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
          <p className="text-gray-500 mb-6">Thank you, {formData.name}. You are now a registered LifeLink donor.</p>
          <Link to="/" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">🩸 LifeLink</Link>
          <span className="text-sm font-medium">Donor Registration</span>
        </div>
      </nav>
      <main className="max-w-lg mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Become a Donor</h2>
        <p className="text-gray-500 mb-8">Join thousands of life-savers across Africa.</p>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 space-y-5">
<div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. Khethukuthula Sabela" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="+27 XX XXX XXXX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
            <div className="grid grid-cols-4 gap-2">
              {bloodTypes.map((type) => (
                <button key={type} type="button" onClick={() => setFormData({...formData, bloodType: type})} className={`py-2 rounded-lg text-sm font-medium border transition-all ${formData.bloodType === type ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'}`}>{type}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">Select your city</option>
              <option value="Cape Town">Cape Town</option>
              <option value="Johannesburg">Johannesburg</option>
              <option value="Durban">Durban</option>
              <option value="Nairobi">Nairobi</option>
              <option value="Lagos">Lagos</option>
              <option value="Dublin">Dublin</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold text-lg shadow-lg shadow-red-200 transition-all hover:scale-105 active:scale-95 mt-4">Register as Donor 🩸</button>
        </form>
      </main>
    </div>
  );
}
