import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { ConfigWarningBanner } from '../../components/auth/ConfigWarningBanner';
import { isValidEmail, sanitizeRedirectPath } from '../../lib/auth-helpers';

export const LoginPage: React.FC = () => {
  const { signIn, isConfigured } = useAuth();
  const { isBangla } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectDestination = sanitizeRedirectPath(searchParams.get('redirect'), '/dashboard');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!isValidEmail(email)) {
      newErrors.email = isBangla
        ? 'সঠিক ইমেইল ফরম্যাট দিন (যেমন: seller@shop.com)'
        : 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = isBangla ? 'পাসওয়ার্ড লিখুন' : 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);

    if (error) {
      setGeneralError(error);
      return;
    }

    // Success -> Navigate to safe destination
    navigate(redirectDestination);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-[#131B26] p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isBangla ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'Log In to BongoSell AI'}
          </h1>
          <p className="text-xs text-slate-400">
            {isBangla
              ? 'ফেসবুক পেইজ সেলস ড্যাশবোর্ড ও ইনবক্স রুল কন্ট্রোল'
              : 'Manage your automated Facebook Messenger sales and orders'}
          </p>
        </div>

        <ConfigWarningBanner />

        {generalError && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{generalError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              {isBangla ? 'ইমেইল অ্যাড্রেস' : 'Email Address'} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="seller@yourshop.com"
                className={`w-full bg-[#0E131B] border rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none ${
                  errors.email ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'
                }`}
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="text-[11px] text-red-400">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                {isBangla ? 'পাসওয়ার্ড' : 'Password'} *
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                {isBangla ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
              </Link>
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                className={`w-full bg-[#0E131B] border rounded-lg pl-9 pr-10 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none ${
                  errors.password ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'
                }`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-red-400">{errors.password}</p>}
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-indigo-600 rounded"
              />
              <span>{isBangla ? 'মনে রাখুন' : 'Remember this device'}</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 shadow-lg shadow-indigo-600/20"
          >
            {isSubmitting ? (
              <span>{isBangla ? 'লগইন হচ্ছে...' : 'Signing In...'}</span>
            ) : (
              <>
                <span>{isBangla ? 'লগইন করুন' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
          <span>{isBangla ? 'নতুন শপ ওনার?' : "Don't have an account yet?"}</span>{' '}
          <Link
            to={`/signup?redirect=${encodeURIComponent(redirectDestination)}`}
            className="text-indigo-400 font-semibold hover:text-indigo-300"
          >
            {isBangla ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create an account'}
          </Link>
        </div>
      </div>
    </div>
  );
};
