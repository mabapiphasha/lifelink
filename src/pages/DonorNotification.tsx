import { useState } from 'react';
import { Link } from 'react-router-dom';

export function DonorNotification() {
  const [response, setResponse] = useState<'none' | 'confirmed' | 'declined'>('none');

  if (response === 'confirmed') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-500 mb-4">You have confirmed your donation. Please arrive at Groote Schuur Hospital within 2 hours.</p>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-6">
            <p className="text-green-700 text-sm font-medium">Address: Main Road, Observatory, Cape Town</p>
            <p className="text-green-700 text-sm">Ask for: Blood Bank, Ward 3B</p>
          </div>
          <Link to="/" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (response === 'declined') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Problem</h2>
          <p className="text-gray-500 mb-6">We understand. We will notify the next available donor. Thank you for being registered!</p>
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
          <span className="text-sm font-medium">Donor Notification</span>
        </div>
      </nav>
      <main className="max-w-lg mx-auto px-8 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-md border border-red-200 border-l-4 border-l-red-600">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-bold animate-pulse">URGENT</span>
            <span className="text-gray-400 text-xs">Just now</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You Have Been Matched!</h2>
          <p className="text-gray-500 mb-6">A patient urgently needs your blood type. Can you donate today?</p>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Hospital</span>
              <span className="text-gray-900 text-sm font-medium">Groote Schuur Hospital</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Blood Type Needed</span>
              <span className="text-red-700 text-sm font-bold">O-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Urgency</span>
              <span className="text-red-700 text-sm font-medium">Critical</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Distance</span>
              <span className="text-gray-900 text-sm font-medium">2.3 km away</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Units Needed</span>
              <span className="text-gray-900 text-sm font-medium">3 units</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setResponse('confirmed')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95">Yes, I Can Donate</button>
            <button onClick={() => setResponse('declined')} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95">Not Today</button>
          </div>
        </div>
      </main>
    </div>
  );
}