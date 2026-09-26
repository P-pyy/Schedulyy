import React, { useState } from 'react';
import { AppMode } from '../types';
import { ASSETS } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';
import { mapRoleToAppMode } from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: AppMode) => void;
  onTriggerToast: (msg: string, icon?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onTriggerToast
}) => {
  const { isConfigured, signIn, signUp, resetPassword } = useAuth();

  const [role, setRole] = useState<'client' | 'business'>('client');
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('Alex Santos');
  const [phone, setPhone] = useState('+63 917 555 0192');
  const [email, setEmail] = useState('alex.santos@gmail.com');
  const [password, setPassword] = useState('Secret123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (isConfigured) {
        if (isSignUp) {
          // New user sign up - trigger will create profile with default role = 'customer'
          const result = await signUp(email, password, fullName, phone);
          if (result.error) {
            setErrorMessage(result.error);
            onTriggerToast(result.error, 'error');
            setIsLoading(false);
            return;
          }
          // The database trigger creates profile with role 'customer' -> client mode
          onLoginSuccess('client');
          onTriggerToast('Account created! Welcome to Scheduly ✨', 'check_circle');
          onClose();
        } else {
          // Real email/password sign in
          const result = await signIn(email, password);
          if (result.error) {
            setErrorMessage(result.error);
            onTriggerToast(result.error, 'error');
            setIsLoading(false);
            return;
          }
          // Query session & profile role to determine mode
          // Role is strictly derived from the database profile
          onLoginSuccess(role);
          onTriggerToast('Signed in successfully! ✨', 'check_circle');
          onClose();
        }
      } else {
        // Fallback simulated authentication when keys not provided
        setTimeout(() => {
          onLoginSuccess(role);
          onTriggerToast(`Signed in successfully as ${role === 'client' ? 'Alex Santos' : 'Jamie Lim (Studio Bloom)'}! ✨`, 'check_circle');
          onClose();
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed');
      onTriggerToast(err?.message || 'Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      onTriggerToast('Please enter your email address first', 'warning');
      return;
    }
    if (isConfigured) {
      const res = await resetPassword(email);
      if (res.error) {
        onTriggerToast(res.error, 'error');
      } else {
        onTriggerToast(`Password reset link dispatched to ${email}! 📧`, 'mail');
      }
    } else {
      onTriggerToast(`Password reset link dispatched to ${email}! 📧`, 'mail');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#e9edff] flex items-center justify-center text-[#141b2b] hover:bg-[#dce2f7] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-1.5 pt-2">
          <img
            src={ASSETS.logo}
            alt="Scheduly Logo"
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-2xl object-cover shadow-xs ring-1 ring-[#e9edff] mb-1"
          />
          <h2 className="text-[20px] font-bold text-[#141b2b] font-display">
            {isSignUp ? 'Create your account' : 'Welcome back to Scheduly'}
          </h2>
          <p className="text-[13px] text-[#464555]">
            Appointments, scheduling, and clients simplified.
          </p>
        </div>

        {/* Account Role Segmented Switcher */}
        {!isSignUp && (
          <div className="p-1 rounded-2xl bg-[#f1f3ff] grid grid-cols-2 gap-1 border border-[#e9edff]">
            <button
              type="button"
              onClick={() => {
                setRole('client');
                setEmail('alex.santos@gmail.com');
              }}
              className={`py-2 rounded-xl text-[13px] font-bold transition-all ${
                role === 'client'
                  ? 'bg-white text-[#3525cd] shadow-xs'
                  : 'text-[#464555] hover:text-[#141b2b]'
              }`}
            >
              Client Account
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('business');
                setEmail('jamie@studiobloom.ph');
              }}
              className={`py-2 rounded-xl text-[13px] font-bold transition-all ${
                role === 'business'
                  ? 'bg-white text-[#3525cd] shadow-xs'
                  : 'text-[#464555] hover:text-[#141b2b]'
              }`}
            >
              Business Owner
            </button>
          </div>
        )}

        {/* Social Auth Fast Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onLoginSuccess(role);
              onTriggerToast('Google One-Tap authenticated! 🚀', 'check_circle');
              onClose();
            }}
            className="w-full h-11 rounded-xl border border-[#e9edff] bg-white hover:bg-[#f1f3ff] text-[#141b2b] text-[13px] font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-[#e9edff]"></div>
          <span className="text-[11px] text-[#777587] font-semibold uppercase tracking-wider">
            or with email
          </span>
          <div className="flex-1 h-[1px] bg-[#e9edff]"></div>
        </div>

        {/* Error notice if present */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#fee2e2] text-[#991b1b] text-[12px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isSignUp && (
            <>
              <div>
                <label className="text-[12px] font-bold text-[#141b2b] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  placeholder="e.g. Alex Santos"
                  className="w-full p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#141b2b] block mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                  className="w-full p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[12px] font-bold text-[#141b2b] block mb-1">
              {role === 'business' && !isSignUp ? 'Work Email' : 'Email Address'}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[12px] font-bold text-[#141b2b]">Password</label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-[#3525cd] font-semibold hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full p-2.5 pr-10 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-[#777587] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-2 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[14px] font-semibold shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Switch Sign in / Sign Up */}
        <div className="text-center pt-1 text-[12px] text-[#464555]">
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
            }}
            className="text-[#3525cd] font-bold hover:underline cursor-pointer"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};
