import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  Bike,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Flame,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { ease } from '../lib/animations.js';

interface AuthScreenProps {
  onAuthSuccess?: (role: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const { login, verifyLoginOtp, resendOtp, register, verifyEmail } = useAuth();
  const shouldReduce = useReducedMotion();

  // Exactly TWO visible tabs: Customer Login (default) and Rider Login
  const [activeTab, setActiveTab] = useState<'customer' | 'rider'>('customer');

  // Customer sub-flows: 'login' | 'signup' | 'forgot' | 'verify'
  const [customerView, setCustomerView] = useState<'login' | 'signup' | 'forgot' | 'verify'>('login');

  // 2-Factor OTP Login State
  const [isOtpLoginStep, setIsOtpLoginStep] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhone('');
    setVerificationCode('');
    setLoginOtp('');
    setIsOtpLoginStep(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Step 1: Submit credentials & trigger email OTP
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await login(
        email,
        password,
        activeTab === 'rider' ? 'delivery' : undefined
      );

      if (res.requiresOtp) {
        setIsOtpLoginStep(true);
        setSuccessMessage('A 6-digit OTP code was sent to your email. Please enter it below to sign in.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify 6-digit login OTP
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginOtp.trim() || loginOtp.trim().length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code sent to your email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const user = await verifyLoginOtp(
        email,
        loginOtp.trim(),
        activeTab === 'rider' ? 'delivery' : undefined
      );

      setSuccessMessage('Code verified! Loading your dashboard...');
      if (onAuthSuccess) {
        onAuthSuccess(user.role);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired OTP code. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend login OTP
  const handleResendOtp = async () => {
    setIsResending(true);
    setErrorMessage(null);
    try {
      await resendOtp(email, 'login');
      setSuccessMessage('A fresh 6-digit OTP code was dispatched to your email.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  // Handle Customer Signup
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await register({ name, email, password, phone });
      setCustomerView('verify');
      setSuccessMessage('Account registered! A 6-digit confirmation code was dispatched to your email.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email Verification Code for Signup
  const handleVerifySignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await verifyEmail(email, verificationCode);
      setSuccessMessage('Email verified successfully! Opening artisan store...');
      if (onAuthSuccess) {
        onAuthSuccess('customer');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.forgotPassword(email);
      setSuccessMessage('If an account exists with this email address, a password reset code has been dispatched.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to process password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-stone-950 text-stone-100 p-4 sm:p-6 relative select-none overflow-hidden">
      {/* Ambient Warm Hearth Glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle 450px at 50% 30%, rgba(234, 88, 12, 0.18) 0%, transparent 70%),
            radial-gradient(circle 650px at 50% 60%, rgba(217, 119, 6, 0.10) 0%, transparent 60%),
            #0c0a09
          `,
        }}
      />

      {/* Decorative Grid Lines */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Brand Emblem */}
        <motion.div
          className="flex flex-col items-center text-center mb-6"
          initial={shouldReduce ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: ease.out }}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-950/60 mb-3 border border-amber-400/30">
            <Flame className="w-8 h-8 text-stone-950 fill-stone-950" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white uppercase">
            Pizza Artisan
          </h1>
          <p className="text-xs text-amber-300 font-light tracking-widest uppercase mt-0.5">
            Handcrafted Wood-Fired Mastery
          </p>
        </motion.div>

        {/* Central Authentication Card */}
        <motion.div
          className="bg-white text-stone-900 rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden relative"
          initial={shouldReduce ? false : { opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: ease.out }}
        >
          {/* Top Decorative Warm Hearth Border */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700" />

          <div className="p-6 sm:p-8">
            {/* Header Titles */}
            <div className="text-center mb-6">
              <span className="text-[11px] font-bold font-mono tracking-widest text-amber-800 uppercase block mb-1">
                Security Authentication Gateway
              </span>
              <h2 className="text-2xl font-bold font-display text-stone-900">
                {isOtpLoginStep
                  ? 'Verify 6-Digit OTP'
                  : activeTab === 'rider'
                  ? 'Delivery Courier Sign In'
                  : customerView === 'signup'
                  ? 'Create Your Account'
                  : customerView === 'forgot'
                  ? 'Reset Your Password'
                  : customerView === 'verify'
                  ? 'Verify Your Email'
                  : 'Welcome Back'}
              </h2>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {isOtpLoginStep
                  ? `Enter the 6-digit One-Time Password sent to ${email}`
                  : activeTab === 'rider'
                  ? 'Sign in to access assigned delivery orders and route dispatch.'
                  : customerView === 'signup'
                  ? 'Join Pizza Artisan to customize pizzas, view wood-fired recipes, and order.'
                  : 'Please sign in to access the pizza menu, custom builder, and order bag.'}
              </p>
            </div>

            {/* ── EXACTLY TWO TABS AT THE TOP: Customer Login & Rider Login ──── */}
            {!isOtpLoginStep && customerView === 'login' && (
              <div className="flex rounded-2xl bg-stone-100 p-1 mb-6 border border-stone-200">
                <button
                  type="button"
                  id="tab-customer-login"
                  onClick={() => {
                    setActiveTab('customer');
                    resetForm();
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'customer'
                      ? 'bg-white text-stone-950 shadow-sm ring-1 ring-stone-900/5'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-amber-700" />
                  <span>Customer Login</span>
                </button>

                <button
                  type="button"
                  id="tab-rider-login"
                  onClick={() => {
                    setActiveTab('rider');
                    resetForm();
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'rider'
                      ? 'bg-white text-stone-950 shadow-sm ring-1 ring-stone-900/5'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Bike className="w-4 h-4 text-indigo-600" />
                  <span>Rider Login</span>
                </button>
              </div>
            )}

            {/* Feedback Notifications */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{successMessage}</span>
              </motion.div>
            )}

            {/* ── FLOW A: 2-FACTOR OTP VERIFICATION FOR LOGIN ───────────── */}
            {isOtpLoginStep ? (
              <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-center">
                  <span className="text-[11px] font-semibold text-amber-900 block mb-0.5">
                    Security Verification Dispatched
                  </span>
                  <span className="text-xs text-stone-600">
                    A 6-digit OTP code was sent to <strong className="text-stone-900">{email}</strong>.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 text-center">
                    Enter 6-Digit One-Time Password
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    id="input-login-otp"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full py-3 px-4 text-center font-mono text-2xl font-black tracking-[0.4em] bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900 transition-colors"
                  />
                </div>

                <motion.button
                  type="submit"
                  id="btn-verify-login-otp"
                  disabled={isLoading || loginOtp.length !== 6}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all shadow-md disabled:opacity-50 cursor-pointer ${
                    activeTab === 'rider'
                      ? 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-900/20'
                      : 'bg-amber-800 hover:bg-amber-900 shadow-amber-900/20'
                  }`}
                  whileHover={shouldReduce ? {} : { scale: 1.02 }}
                  whileTap={shouldReduce ? {} : { scale: 0.98 }}
                >
                  {isLoading ? 'Verifying OTP...' : 'Verify OTP & Sign In'}
                </motion.button>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpLoginStep(false);
                      setLoginOtp('');
                      setErrorMessage(null);
                    }}
                    className="text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    ← Back to Login
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                    <span>{isResending ? 'Sending...' : 'Resend Code'}</span>
                  </button>
                </div>
              </form>
            ) : customerView === 'login' ? (
              /* ── FLOW 1: CUSTOMER LOGIN (DEFAULT) OR RIDER LOGIN ─────────── */
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {activeTab === 'rider' ? 'Rider Email Address' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      required
                      id="input-auth-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activeTab === 'rider' ? 'delivery1@pizzadelivery.com' : 'you@example.com'}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-700">Password</label>
                    {activeTab === 'customer' && (
                      <button
                        type="button"
                        id="btn-forgot-password"
                        onClick={() => {
                          setCustomerView('forgot');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      id="input-auth-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  id="btn-submit-login"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all shadow-md disabled:opacity-50 cursor-pointer ${
                    activeTab === 'rider'
                      ? 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-900/20'
                      : 'bg-amber-800 hover:bg-amber-900 shadow-amber-900/20'
                  }`}
                  whileHover={shouldReduce ? {} : { scale: 1.02 }}
                  whileTap={shouldReduce ? {} : { scale: 0.98 }}
                >
                  {isLoading
                    ? 'Sending Verification OTP...'
                    : activeTab === 'rider'
                    ? 'Verify & Sign In as Courier'
                    : 'Send Login OTP & Proceed'}
                </motion.button>

                {/* Bottom Toggle: Create New Account (Customer) or Return (Rider) */}
                <div className="pt-3 text-center border-t border-stone-100">
                  {activeTab === 'customer' ? (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-stone-600">
                      <span>Don&apos;t have an account?</span>
                      <button
                        type="button"
                        id="btn-switch-to-signup"
                        onClick={() => {
                          setCustomerView('signup');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="font-bold text-amber-800 hover:text-amber-900 hover:underline cursor-pointer"
                      >
                        Create New Account
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTab('customer')}
                      className="text-xs text-stone-600 hover:text-stone-900 hover:underline cursor-pointer"
                    >
                      ← Return to Customer Login
                    </button>
                  )}
                </div>
              </form>
            ) : null}

            {/* ── FLOW 2: CUSTOMER SIGNUP FORM ───────────────────────────── */}
            {!isOtpLoginStep && customerView === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sophia Reynolds"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sophia@example.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 012-3456"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-amber-800 hover:bg-amber-900 transition-all shadow-md shadow-amber-900/20 disabled:opacity-50 cursor-pointer mt-2"
                  whileHover={shouldReduce ? {} : { scale: 1.02 }}
                  whileTap={shouldReduce ? {} : { scale: 0.98 }}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account & Send OTP'}
                </motion.button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerView('login');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-stone-600 hover:text-stone-900 font-semibold cursor-pointer"
                  >
                    ← Already have an account? Sign In
                  </button>
                </div>
              </form>
            )}

            {/* ── FLOW 3: EMAIL VERIFICATION CODE (SIGNUP) ───────────────── */}
            {!isOtpLoginStep && customerView === 'verify' && (
              <form onSubmit={handleVerifySignup} className="space-y-4">
                <div className="text-center p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                  Please enter the 6-digit confirmation code dispatched to <strong>{email}</strong>.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 text-center">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full py-3 px-4 text-center font-mono text-2xl font-black tracking-[0.4em] bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-amber-800 hover:bg-amber-900 transition-all shadow-md shadow-amber-900/20 disabled:opacity-50 cursor-pointer"
                  whileHover={shouldReduce ? {} : { scale: 1.02 }}
                  whileTap={shouldReduce ? {} : { scale: 0.98 }}
                >
                  {isLoading ? 'Verifying...' : 'Verify Email & Proceed'}
                </motion.button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setCustomerView('login')}
                    className="text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    ← Return to Login
                  </button>
                </div>
              </form>
            )}

            {/* ── FLOW 4: FORGOT PASSWORD ─────────────────────────────────── */}
            {!isOtpLoginStep && customerView === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-amber-800 hover:bg-amber-900 transition-all shadow-md shadow-amber-900/20 disabled:opacity-50 cursor-pointer"
                  whileHover={shouldReduce ? {} : { scale: 1.02 }}
                  whileTap={shouldReduce ? {} : { scale: 0.98 }}
                >
                  {isLoading ? 'Sending Reset Instructions...' : 'Send Password Reset Link'}
                </motion.button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerView('login');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-stone-600 hover:text-stone-900 font-semibold cursor-pointer"
                  >
                    ← Return to Customer Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-stone-500 mt-4 flex items-center justify-center gap-1.5">
          <span>🔒 256-bit encrypted SSL session · Two-Factor OTP protected</span>
        </p>
      </div>
    </div>
  );
};
