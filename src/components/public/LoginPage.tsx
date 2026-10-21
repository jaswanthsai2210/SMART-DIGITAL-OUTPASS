import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  HeartHandshake, 
  Building, 
  ScanLine, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  RotateCcw, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Phone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface RoleOption {
  role: UserRole;
  name: string;
  description: string;
  icon: React.ElementType;
}

const ROLES: RoleOption[] = [
  {
    role: 'admin',
    name: 'Admin',
    description: 'System settings & user access',
    icon: ShieldCheck
  },
  {
    role: 'student',
    name: 'Student',
    description: 'Apply for and view passes',
    icon: GraduationCap
  },
  {
    role: 'parent',
    name: 'Parent',
    description: 'Review and approve requests',
    icon: HeartHandshake
  },
  {
    role: 'warden',
    name: 'Warden',
    description: 'Manage hostel leaves',
    icon: Building
  },
  {
    role: 'security',
    name: 'Security Staff',
    description: 'Scan and verify gate passes',
    icon: ScanLine
  }
];

export const LoginPage: React.FC = () => {
  const { loginWithCredentials, requestLoginOtp, verifyLoginOtp } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');

  // Password Login Fields (No hardcoded sample data)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // OTP Login Fields
  const [otpContact, setOtpContact] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpInfoMessage, setOtpInfoMessage] = useState<string | null>(null);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  // 6 separate input refs for OTP digits
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown effect for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Password submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your email, student ID, or username.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    const result = await loginWithCredentials(selectedRole, identifier.trim(), password.trim());
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Your email or password is incorrect.');
    } else {
      setSuccessMessage('Signing in...');
    }
  };

  // Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setOtpInfoMessage(null);

    if (!otpContact.trim()) {
      setErrorMessage('Please enter your registered email address or phone number.');
      return;
    }

    setLoading(true);
    const result = await requestLoginOtp(otpContact.trim(), selectedRole);
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to send verification code. Please try again.');
    } else {
      setOtpSent(true);
      setResendTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
      if (result.message) {
        setOtpInfoMessage(result.message);
      }
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 100);
    }
  };

  // Handle individual OTP digit typing with auto-advance and backspace
  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        digitInputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const focusIndex = Math.min(pasted.length, 5);
      digitInputRefs.current[focusIndex]?.focus();
    }
  };

  // Submit OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const code = otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    const result = await verifyLoginOtp(otpContact.trim(), code, selectedRole);
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Incorrect verification code. Please try again.');
    } else {
      setSuccessMessage('Verification successful. Redirecting to your dashboard...');
    }
  };

  const roleNameMap: Record<UserRole, string> = {
    admin: 'Admin Login',
    student: 'Student Login',
    parent: 'Parent Login',
    warden: 'Warden Login',
    security: 'Security Staff Login'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-teal-500 selection:text-white">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
        
        {/* Dark Navy Header (matching Third Reference Screenshot) */}
        <div className="bg-[#0f172a] text-white p-6 sm:p-8 text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 mb-3 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
            Smart Digital Outpass
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Sign in to continue.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* 5 Selectable Role Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {ROLES.map((r) => {
                const IconComp = r.icon;
                const isSelected = selectedRole === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleRoleSelect(r.role)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-md ring-2 ring-teal-500/30'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-teal-500 text-[#0f172a]' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-bold leading-snug ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {r.name}
                      </div>
                      <div className={`text-[10px] mt-0.5 leading-tight line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {r.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Header with Role & Auth Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {roleNameMap[selectedRole]}
              </h2>
              <p className="text-xs text-slate-500">
                {authMode === 'password' ? 'Enter your credentials to sign in.' : 'Verify your account using a one-time code.'}
              </p>
            </div>

            {/* Auth Mode Tabs (Password vs OTP) */}
            <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  authMode === 'password'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp');
                  setErrorMessage('');
                  setSuccessMessage('');
                  setOtpSent(false);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  authMode === 'otp'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                One-Time Code (OTP)
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* MODE A: PASSWORD LOGIN FORM */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {selectedRole === 'student' && 'Student ID or Email Address'}
                  {selectedRole === 'parent' && 'Phone Number or Email Address'}
                  {selectedRole === 'admin' && 'Email Address or Admin ID'}
                  {selectedRole === 'warden' && 'Email Address or Warden ID'}
                  {selectedRole === 'security' && 'Security Staff ID or Email'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      selectedRole === 'student' ? 'student@campus.edu or STU2026' :
                      selectedRole === 'parent' ? 'parent@campus.edu or phone' :
                      selectedRole === 'admin' ? 'admin@campus.edu' :
                      selectedRole === 'warden' ? 'warden@campus.edu' :
                      'security@campus.edu'
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelpGuide(!showHelpGuide)}
                    className="text-xs text-teal-700 hover:text-teal-900 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2.5 pr-10 bg-slate-50 text-slate-900 text-sm rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-[#0f172a] hover:bg-slate-800 active:scale-[0.99] rounded-xl shadow-md transition-all disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 text-teal-400" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE B: OTP AUTHENTICATION FLOW */}
          {authMode === 'otp' && (
            <div className="space-y-5">
              {!otpSent ? (
                /* STEP 1: Enter email or phone and request OTP */
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Registered Email Address or Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={otpContact}
                      onChange={(e) => setOtpContact(e.target.value)}
                      placeholder="e.g., student@campus.edu or 9876543210"
                      className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      A 6-digit one-time code will be generated and verified securely.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-[#0f172a] hover:bg-slate-800 active:scale-[0.99] rounded-xl shadow-md transition-all disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 text-teal-400" />
                        <span>Send Verification Code</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* STEP 2: Enter 6-digit OTP in separated input boxes */
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <div>
                      <span>Code sent to: </span>
                      <strong className="text-slate-900">{otpContact}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-teal-700 hover:text-teal-900 font-semibold"
                    >
                      Change
                    </button>
                  </div>

                  {otpInfoMessage && (
                    <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs">
                      {otpInfoMessage}
                    </div>
                  )}

                  {/* 6 Separated OTP Digit Boxes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
                      Enter 6-Digit Code
                    </label>
                    <div 
                      className="flex items-center justify-center gap-2 sm:gap-3"
                      onPaste={handleDigitPaste}
                    >
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => { digitInputRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                          className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono font-bold text-xl sm:text-2xl text-slate-900 bg-slate-50 rounded-xl border-2 border-slate-300 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend Option with Countdown Timer */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Didn't receive the code?</span>
                    {resendTimer > 0 ? (
                      <span className="font-mono text-slate-600">
                        Resend code in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRequestOtp()}
                        className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resend Code</span>
                      </button>
                    )}
                  </div>

                  {/* Verify OTP Button */}
                  <button
                    type="submit"
                    disabled={loading || otpDigits.join('').length !== 6}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-[#0f172a] hover:bg-slate-800 active:scale-[0.99] rounded-xl shadow-md transition-all disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-teal-400" />
                        <span>Verify &amp; Sign In</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Account Guidance Disclosure */}
          <div className="pt-3 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={() => setShowHelpGuide(!showHelpGuide)}
              className="w-full flex items-center justify-between text-slate-500 hover:text-slate-800 py-1 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                <span>Default credentials for evaluation</span>
              </span>
              <span className="font-mono text-[11px] text-teal-700">
                {showHelpGuide ? 'Hide' : 'View'}
              </span>
            </button>

            {showHelpGuide && (
              <div className="mt-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-slate-700 space-y-1.5 text-[11px]">
                <p className="font-semibold text-slate-900 mb-1">Configured Evaluation Accounts:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[10px]">
                  <div>• Admin: <span className="font-bold">admin@campus.edu</span> / <span className="text-slate-600">Admin@123</span></div>
                  <div>• Student: <span className="font-bold">student@campus.edu</span> / <span className="text-slate-600">Student@123</span></div>
                  <div>• Parent: <span className="font-bold">parent@campus.edu</span> / <span className="text-slate-600">Parent@123</span></div>
                  <div>• Warden: <span className="font-bold">warden@campus.edu</span> / <span className="text-slate-600">Warden@123</span></div>
                  <div className="sm:col-span-2">• Security: <span className="font-bold">security@campus.edu</span> / <span className="text-slate-600">Security@123</span></div>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  You can also switch to OTP mode anytime to authenticate with a 6-digit one-time code.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
