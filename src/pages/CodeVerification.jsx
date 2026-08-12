
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../config/api';

export function CodeVerification() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(null);
  const navigate = useNavigate();

  // Attempt limiting
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION = 60;

  // OTP step
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Lock countdown
  useEffect(() => {
    if (locked && lockTimer > 0) {
      const timer = setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) { setLocked(false); setAttempts(0); clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [locked, lockTimer]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // STEP 1: Verify the hospital registration code
  const handleVerify = async () => {
    if (!code.trim()) { setError('Please enter your registration code'); return; }
    if (locked) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(API.verifyCode, { code: code.trim() });

      if (response.data.valid) {
        // DO NOT set verified here — let triggerSendOtp handle it after OTP step is set
        await triggerSendOtp(code.trim(), response.data);
        setAttempts(0);
      }
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true);
        setLockTimer(LOCK_DURATION);
        setError(`Too many failed attempts. Locked for ${LOCK_DURATION} seconds.`);
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts;
        setError(`${err.response?.data?.error || 'Invalid code'}. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Send OTP via SES
  const triggerSendOtp = async (registrationCode, verifiedData) => {
    try {
      const res = await axios.post(API.sendOtp, { code: registrationCode });
      if (res.data.success) {
        setMaskedEmail(res.data.maskedEmail);
        setOtpStep(true);              // Set OTP step FIRST
        setVerified(verifiedData);     // Then set verified data
        setResendCooldown(60);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    }
  };

  // STEP 2: Verify OTP
  const handleOtpVerify = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setOtpError('Please enter the 6-digit code sent to your email');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await axios.post(API.verifyOtp, { code: code.trim(), otp: otp.trim() });
      if (response.data.success) {
        setOtpStep(false); // Move to success screen
      }
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpError('');
    try {
      const res = await axios.post(API.sendOtp, { code: code.trim() });
      if (res.data.success) {
        setMaskedEmail(res.data.maskedEmail);
        setResendCooldown(60);
        setOtp('');
        setOtpError('');
      }
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Failed to resend OTP. Please try again.');
    }
  };

  const handleProceedToRegister = () => {
    navigate('/donor', {
      state: {
        donorName: verified.donorName,
        bloodType: verified.bloodType,
        hospital: verified.hospital,
        screeningDate: verified.screeningDate,
        code: code.trim(),
      },
    });
  };

  // ── STEP 2: OTP Screen (checked FIRST — no donor details shown) ─────────────
  if (otpStep && verified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        <nav className="bg-red-800 text-white p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold tracking-tight">🩸 LifeLink</Link>
            <span className="text-red-200 text-sm font-medium">Identity Verification</span>
            <Link to="/" className="text-sm hover:text-red-200 transition-colors">← Home</Link>
          </div>
        </nav>

        <main className="max-w-md mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verify Your Identity</h2>
              <p className="text-gray-500 text-sm mt-2">
                We've sent a 6-digit verification code to your registered email.
              </p>
              <p className="text-red-600 font-semibold text-sm mt-1">{maskedEmail}</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 text-center">
              <p className="text-green-700 text-sm">✅ Hospital code verified — please confirm your identity</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter 6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                  placeholder="• • • • • •"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-center text-2xl font-mono tracking-widest focus:border-red-500 focus:outline-none transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleOtpVerify()}
                  autoFocus
                />
              </div>

              {otpError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <p className="text-red-600 text-sm font-medium">❌ {otpError}</p>
                </div>
              )}

              <button
                onClick={handleOtpVerify}
                disabled={otpLoading || otp.length !== 6}
                className={`w-full py-3 rounded-xl font-semibold text-lg transition-all ${
                  otpLoading || otp.length !== 6
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {otpLoading ? '⏳ Verifying...' : '✓ Verify OTP'}
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                className={`text-sm ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:underline'}`}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
              <button
                onClick={() => { setOtpStep(false); setVerified(null); setOtp(''); setOtpError(''); }}
                className="text-gray-400 text-sm hover:underline"
              >
                ← Back
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              Didn't receive it? Check your spam folder or click Resend.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ── STEP 3: Success (ONLY shows after OTP is verified — no flash) ───────────
  if (verified && !otpStep) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        <nav className="bg-red-800 text-white p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold tracking-tight">🩸 LifeLink</Link>
            <span className="text-red-200 text-sm font-medium">Registration Complete</span>
            <Link to="/" className="text-sm hover:text-red-200 transition-colors">← Home</Link>
          </div>
        </nav>

        <main className="max-w-md mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Identity Verified!</h2>
              <p className="text-gray-500 text-sm mt-2">Your hospital code and email OTP have been confirmed.</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Name</span>
                <span className="font-semibold text-gray-900">{verified.donorName}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Blood Type</span>
                <span className="font-bold text-red-600 text-lg">{verified.bloodType}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Hospital</span>
                <span className="font-semibold text-gray-900">{verified.hospital}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Screening Date</span>
                <span className="font-semibold text-gray-900">{verified.screeningDate}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToRegister}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-lg shadow-lg shadow-green-200 transition-all hover:scale-[1.02] active:scale-95"
            >
              Complete Registration →
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              You'll set up your contact preferences and location to receive donation notifications.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ── STEP 1: Enter Hospital Code ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="bg-red-800 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight">🩸 LifeLink</Link>
          <span className="text-red-200 text-sm font-medium">Donor Code Verification</span>
          <Link to="/" className="text-sm hover:text-red-200 transition-colors">← Home</Link>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔑</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Enter Your Code</h2>
            <p className="text-gray-500 text-sm mt-2">
              Enter the registration code you received after your medical screening at the hospital.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="e.g. LL-GS-2026-A1B2"
                disabled={locked}
                className={`w-full px-4 py-3 border-2 rounded-xl text-center text-lg font-mono tracking-wider focus:border-red-500 focus:outline-none transition-colors ${
                  locked ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'border-gray-200'
                }`}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
            </div>

            {attempts > 0 && !locked && (
              <div className="flex items-center justify-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < attempts ? 'bg-red-500' : 'bg-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-400">{MAX_ATTEMPTS - attempts} attempts left</span>
              </div>
            )}

            {locked && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                <p className="text-orange-700 text-sm font-medium">🔒 Locked for {lockTimer} seconds</p>
                <p className="text-orange-500 text-xs mt-1">Too many failed attempts. Please wait.</p>
              </div>
            )}

            {error && !locked && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                <p className="text-red-600 text-sm font-medium">❌ {error}</p>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || !code.trim() || locked}
              className={`w-full py-3 rounded-xl font-semibold text-lg transition-all ${
                loading || !code.trim() || locked
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {loading ? '⏳ Verifying...' : locked ? `🔒 Locked (${lockTimer}s)` : '✓ Verify Code'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 text-center">
              <strong>Don't have a code?</strong> Visit a participating hospital for a free medical screening. After passing, you'll receive a unique registration code.
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-red-600 text-sm hover:underline">
              Already registered? Login here →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

