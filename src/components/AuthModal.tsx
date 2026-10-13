import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, Lock, Mail, User as UserIcon, Phone, Eye, EyeOff, Bike, UserCheck, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { backdrop, modalScale, ease } from '../lib/animations.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (role: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const { login, register, verifyEmail } = useAuth();
  const shouldReduce = useReducedMotion();

  // Top Tabs: exactly TWO tabs
  const [activeTab, setActiveTab] = useState<'customer' | 'rider'>('customer');

  // Sub-views within Customer flow: 'login' | 'signup' | 'forgot' | 'verify'
  const [customerView, setCustomerView] = useState<'login' | 'signup' | 'forgot' | 'verify'>('login');

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

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhone('');
    setVerificationCode('');
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Handle Customer or Rider Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const loginRes = await login(
        email,
        password,
        activeTab === 'rider' ? 'delivery' : undefined
      );

      if (loginRes.requiresOtp) {
        setSuccessMessage('A 6-digit OTP was sent to your email. Please use the main login screen to verify.');
      } else {
        setSuccessMessage('Signed in successfully!');
        setTimeout(() => {
          onClose();
          if (onAuthSuccess) {
            onAuthSuccess((loginRes as any).role || 'customer');
          }
        }, 400);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
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
      setSuccessMessage('Account registered! A 6-digit verification code was sent to your email.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email Verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await verifyEmail(email, verificationCode);
      setSuccessMessage('Email verified successfully! You are signed in.');
      setTimeout(() => {
        onClose();
        if (onAuthSuccess) onAuthSuccess('customer');
      }, 700);
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
      setSuccessMessage('If an account exists with this email, a password reset link has been dispatched.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-10"
          variants={modalScale}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.25, ease: ease.out }}
        >
          {/* Top Decorative Amber Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-7">
            {/* Header Titles */}
            <div className="text-center mb-6">
              <span className="text-[11px] font-bold font-mono tracking-widest text-amber-800 uppercase block mb-1">
                Pizza Artisan Portal
              </span>
              <h2 className="text-2xl font-bold font-display text-stone-900">
                {activeTab === 'rider'
                  ? 'Delivery Courier Sign In'
                  : customerView === 'signup'
                  ? 'Create Your Account'
                  : customerView === 'forgot'
                  ? 'Reset Your Password'
                  : customerView === 'verify'
                  ? 'Verify Your Email'
                  : 'Welcome Back'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {activeTab === 'rider'
                  ? 'Sign in to access assigned delivery orders and route dispatch.'
                  : customerView === 'signup'
                  ? 'Join Pizza Artisan for handcrafted orders, live oven feed, and tracking.'
                  : 'Sign in to configure custom pizzas, track deliveries, and manage orders.'}
              </p>
            </div>

            {/* ── EXACTLY TWO TABS AT THE TOP: Customer Login & Rider Login ──── */}
            {customerView === 'login' && (
              <div className="flex rounded-xl bg-stone-100 p-1 mb-6 border border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('customer');
                    resetForm();
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'customer'
                      ? 'bg-white text-stone-950 shadow-xs ring-1 ring-stone-900/5'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Customer Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('rider');
                    resetForm();
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'rider'
                      ? 'bg-white text-stone-950 shadow-xs ring-1 ring-stone-900/5'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
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

            {/* ── FLOW 1: CUSTOMER LOGIN (DEFAULT) OR RIDER LOGIN ─────────── */}
            {customerView === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {activeTab === 'rider' ? 'Rider Email Address' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activeTab === 'rider' ? 'delivery1@pizzadelivery.com' : 'you@example.com'}
                      className="w-full pl-9 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-700">Password</label>
                    {activeTab === 'customer' && (
                      <button
                        type="button"
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
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-amber-800 hover:bg-amber-900 transition-all shadow-md shadow-amber-900/20 disabled:opacity-50 cursor-pointer"
                  whileHover={shouldReduce ? {} : { scale: 1.02 }}
                  whileTap={shouldReduce ? {} : { scale: 0.98 }}
                >
                  {isLoading
                    ? 'Authenticating...'
                    : activeTab === 'rider'
                    ? 'Sign In as Delivery Rider'
                    : 'Sign In to Your Account'}
                </motion.button>

                {/* Bottom Toggle: Create New Account (Customer) or Return (Rider) */}
                <div className="pt-2 text-center border-t border-stone-100">
                  {activeTab === 'customer' ? (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-stone-600">
                      <span>Don&apos;t have an account?</span>
                      <button
                        type="button"
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
            )}

            {/* ── FLOW 2: CUSTOMER SIGNUP FORM ───────────────────────────── */}
            {customerView === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sophia Reynolds"
                      className="w-full pl-9 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sophia@example.com"
                      className="w-full pl-9 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 012-3456"
                      className="w-full pl-9 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
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
                  {isLoading ? 'Creating Account...' : 'Create Account'}
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

            {/* ── FLOW 3: EMAIL VERIFICATION CODE ────────────────────────── */}
            {customerView === 'verify' && (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="text-center p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                  Please enter the 6-digit confirmation code dispatched to <strong>{email}</strong>.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">6-Digit Verification Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    className="w-full py-2.5 px-4 text-center font-mono text-lg font-bold tracking-widest bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900"
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
            {customerView === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-stone-900"
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
      </div>
    </div>
  );
};
