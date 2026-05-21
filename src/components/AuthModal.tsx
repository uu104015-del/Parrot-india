import React, { useState } from 'react';
import { X, Mail, Lock, User, Smartphone, Chrome, MessageSquare, ShieldCheck, Key } from 'lucide-react';
import { auth, isRealFirebase } from '../lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut
} from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { name: string; email: string; phone?: string; photoURL?: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'phone'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [simulatedRecaptchaVerifier, setSimulatedRecaptchaVerifier] = useState<any>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  if (!isOpen) return null;

  // Clear messages
  const handleModeChange = (newMode: 'login' | 'register' | 'phone') => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
    setPhone('');
    setOtp('');
    setShowOtpField(false);
  };

  // 1. Email Sign-In
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter email and password.');
      setLoading(false);
      return;
    }

    if (isRealFirebase && auth) {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const displayName = result.user.displayName || result.user.email?.split('@')[0] || 'Member';
        setSuccessMsg('Logged in successfully!');
        onAuthSuccess({
          name: displayName,
          email: result.user.email || email,
          phone: result.user.phoneNumber || undefined,
          photoURL: result.user.photoURL || undefined
        });
        setTimeout(() => onClose(), 1200);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || 'Email authentication failed.');
      } finally {
        setLoading(false);
      }
    } else {
      // Offline / Local Simulation Mode
      setTimeout(() => {
        setSuccessMsg('Successfully signed in (Simulation Module)!');
        onAuthSuccess({
          name: email.split('@')[0] || 'Parrot Lover',
          email: email,
        });
        setTimeout(() => onClose(), 1200);
        setLoading(false);
      }, 1000);
    }
  };

  // 2. Email Sign-Up / Register
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('All fields are requested.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (isRealFirebase && auth) {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: fullName });
        setSuccessMsg('Account registered successfully!');
        onAuthSuccess({
          name: fullName,
          email: result.user.email || email,
        });
        setTimeout(() => onClose(), 1200);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
    } else {
      // Offline / Local Simulation Mode
      setTimeout(() => {
        setSuccessMsg('Registration complete (Simulation Module)!');
        onAuthSuccess({
          name: fullName,
          email: email,
        });
        setTimeout(() => onClose(), 1200);
        setLoading(false);
      }, 1000);
    }
  };

  // 3. Gmail login
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (isRealFirebase && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        setSuccessMsg(`Welcome ${user.displayName || 'Companion Friend'}!`);
        onAuthSuccess({
          name: user.displayName || 'Verified Friend',
          email: user.email || '',
          phone: user.phoneNumber || undefined,
          photoURL: user.photoURL || undefined
        });
        setTimeout(() => onClose(), 1200);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || 'Google Auth Popup closed or blocked.');
      } finally {
        setLoading(false);
      }
    } else {
      // Simulated Google Auth
      setTimeout(() => {
        const dummyGoogleEmail = `user.google.${Math.floor(100 + Math.random() * 900)}@gmail.com`;
        setSuccessMsg('Successfully authenticated with Google Account (Simulated)!');
        onAuthSuccess({
          name: 'Verified Aviary Friend',
          email: dummyGoogleEmail,
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
        });
        setTimeout(() => onClose(), 1200);
        setLoading(false);
      }, 900);
    }
  };

  // 4. Phone login (OTP setup)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!phone.trim()) {
      setErrorMsg('Please enter your mobile phone number.');
      setLoading(false);
      return;
    }

    if (isRealFirebase && auth) {
      try {
        // Clear recaptcha container if it exists
        const recaptchaDom = document.getElementById('recaptcha-container');
        if (!recaptchaDom) {
          setErrorMsg('ReCaptcha target element not found in DOM.');
          setLoading(false);
          return;
        }

        const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        });

        const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
        setConfirmationResult(confirmation);
        setShowOtpField(true);
        setSuccessMsg('OTP code sent successfully to your mobile!');
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || 'Failed to trigger verification code.');
      } finally {
        setLoading(false);
      }
    } else {
      // Offline Phone OTP simulation
      setTimeout(() => {
        setShowOtpField(true);
        setSuccessMsg('Simulated OTP code: 123456 has been dispatched to WhatsApp/SMS!');
        setLoading(false);
      }, 1000);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit confirmation OTP code.');
      setLoading(false);
      return;
    }

    if (isRealFirebase && confirmationResult) {
      try {
        const result = await confirmationResult.confirm(otp);
        setErrorMsg('');
        setSuccessMsg('Phone authenticated successfully!');
        onAuthSuccess({
          name: `User ${phone.slice(-4)}`,
          email: `${phone}@parrotindia.com`,
          phone: phone
        });
        setTimeout(() => onClose(), 1200);
      } catch (err: any) {
        console.error(err);
        setErrorMsg('Invalid or expired OTP code. Pin validation breach.');
      } finally {
        setLoading(false);
      }
    } else {
      // Simulated OTP confirmation
      if (otp === '123456') {
        setTimeout(() => {
          setSuccessMsg('Phone validated successfully! (Simulation verified)');
          onAuthSuccess({
            name: `Companion Holder ${phone.slice(-4)}`,
            email: `${phone}@parrotindia.com`,
            phone: phone
          });
          setTimeout(() => onClose(), 1200);
          setLoading(false);
        }, 1000);
      } else {
        setErrorMsg('Invalid verification token. Code must be 123456.');
        setLoading(false);
      }
    }
  };

  return (
    <div id="authentication-overlay-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col relative animate-scale-in">
        
        {/* Header decoration */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="space-y-1.5">
            <div className="text-2xl">🦜</div>
            <h3 className="font-display font-extrabold text-xl tracking-tight leading-none text-lime-400">
              {mode === 'login' ? 'Welcome Back!' : mode === 'register' ? 'Join Parrot India' : 'Mobile Access Gateway'}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono tracking-wide uppercase font-semibold">
              Official Certified Companion Portal
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100/50 rounded-xl text-rose-700 text-xs font-semibold leading-normal text-left">
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-100/50 rounded-xl text-emerald-950 text-xs font-medium leading-normal text-left">
              ✓ {successMsg}
            </div>
          )}

          {/* Social Sign-In (Gmail Fast Connect) */}
          {mode !== 'phone' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 focus:ring-2 focus:ring-emerald-500 rounded-xl text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Chrome className="w-4 h-4 text-rose-500" />
                Sign in with Gmail (Google Account)
              </button>

              <div className="flex items-center my-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="px-3 text-[10px] uppercase font-mono tracking-widest text-slate-300 font-bold">OR</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
            </div>
          )}

          {/* Core mode triggers */}
          {mode === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  registered email path *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border focus:border-emerald-500 border-slate-200 rounded-xl text-xs outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  account password *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border focus:border-emerald-500 border-slate-200 rounded-xl text-xs outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl hover:shadow-md cursor-pointer transition-all flex items-center justify-center gap-1"
              >
                {loading ? 'Processing security...' : 'Validate & Log In'}
                <ShieldCheck className="w-4 h-4" />
              </button>

              <div className="pt-2 flex justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => handleModeChange('phone')}
                  className="hover:text-emerald-700 outline-none font-bold"
                >
                  📲 Use Phone/Mobile
                </button>
                <span className="text-slate-350">|</span>
                <button
                  type="button"
                  onClick={() => handleModeChange('register')}
                  className="hover:text-emerald-700 outline-none font-bold text-emerald-600"
                >
                  Create An Account
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleEmailRegister} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  full name *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Sahil Khan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border focus:border-emerald-500 border-slate-200 rounded-xl text-xs outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  secure email path *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="sahil@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border focus:border-emerald-500 border-slate-200 rounded-xl text-xs outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  choose master password * (min 6 characters)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border focus:border-emerald-500 border-slate-200 rounded-xl text-xs outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl hover:shadow-md cursor-pointer transition-all flex items-center justify-center gap-1 animate-pulse animate-duration-1500"
              >
                {loading ? 'Creating aviary profile...' : 'Register as Aviary Member'}
                <ShieldCheck className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="hover:text-emerald-700 font-bold text-emerald-600 outline-none"
                >
                  Log In instead
                </button>
              </div>
            </form>
          )}

          {mode === 'phone' && (
            <div className="space-y-4 text-left">
              <div id="recaptcha-container" className="my-1"></div>

              {!showOtpField ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      phone number * (with Country prefix, e.g. +91)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                        <Smartphone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="+91 99887 76655"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 focus:bg-white border focus:border-emerald-500 border-slate-200 rounded-xl text-xs outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl hover:shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Routing OTP check...' : 'Send Secure OTP Pin'}
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      enter 6-digit confirmation pin *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                        <Key className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="Enter OTP (use 123456 as default)"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 focus:bg-white border focus:border-emerald-500 border-slate-200 rounded-xl text-xs font-mono tracking-widest text-center text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl hover:shadow-md cursor-pointer transition-all flex items-center justify-center gap-1"
                  >
                    {loading ? 'Confirming code...' : 'Confirm Pin & Place Login'}
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                </form>
              )}

              <div className="pt-2 flex justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="hover:text-emerald-700 font-bold text-emerald-600 outline-none"
                >
                  ← Back to Email Sign-In
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 border-t border-slate-100 p-4 text-center text-[10px] text-slate-400 leading-normal font-sans">
          Your credentials are fully secure. Connection matches live security standards.
        </div>
      </div>
    </div>
  );
}
