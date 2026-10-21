import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { ConfigWarningBanner } from '../../components/auth/ConfigWarningBanner';
import {
  isValidEmail,
  isValidFullName,
  checkPasswordStrength,
  sanitizeRedirectPath,
} from '../../lib/auth-helpers';

export const SignupPage: React.FC = () => {
  const { signUp, isConfigured } = useAuth();
  const { isBangla } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectDestination = sanitizeRedirectPath(searchParams.get('redirect'), '/onboarding');

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!isValidFullName(fullName)) {
      newErrors.fullName = isBangla
        ? 'আপনার পূর্ণ নাম লিখুন (কমপক্ষে ২ অক্ষর)'
        : 'Please enter your full name (at least 2 characters)';
    }

    if (!isValidEmail(email)) {
      newErrors.email = isBangla
        ? 'একটি সঠিক ইমেইল ঠিকানা দিন (যেমন: seller@shop.com)'
        : 'Please enter a valid email address';
    }

    const passCheck = checkPasswordStrength(password);
    if (!passCheck.isValid) {
      newErrors.password = isBangla ? passCheck.errorsBn[0] : passCheck.errorsEn[0];
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = isBangla
        ? 'পাসওয়ার্ড দুটি মেলেনি'
        : 'Passwords do not match';
    }

    if (!agreedTerms) {
      newErrors.agreedTerms = isBangla
        ? 'শর্তাবলী মেনে টিক চিহ্ন দিন'
        : 'You must accept the Terms and Privacy Policy';
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

    const { error, needsEmailVerification } = await signUp({
      email,
      password,
      fullName,
      businessName: businessName.trim() || undefined,
      preferredLanguage: isBangla ? 'bn' : 'en',
    });

    setIsSubmitting(false);

    if (error) {
      setGeneralError(error);
      return;
    }

    if (needsEmailVerification) {
      setNeedsVerification(true);
    } else {
      navigate(redirectDestination);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-[#131B26] p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isBangla ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create Your Merchant Account'}
          </h1>
          <p className="text-xs text-slate-400">
            {isBangla
              ? 'আপনার ফেসবুক পেইজে স্বয়ংক্রিয় এআই সেলস অ্যাসিস্ট্যান্ট সেটআপ করুন'
              : 'Join BongoSell AI to automate your Facebook Messenger sales'}
          </p>
        </div>

        <ConfigWarningBanner />

        {generalError && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{generalError}</p>
          </div>
        )}

        {needsVerification ? (
          <div className="p-6 rounded-xl bg-emerald-950/30 border border-emerald-800/80 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">
              {isBangla ? 'ভেরিফিকেশন ইমেইল পাঠানো হয়েছে!' : 'Verification Email Sent!'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isBangla ? (
                <>
                  আমরা <strong className="text-white">{email}</strong> ঠিকানায় একটি যাচাইকরণ লিংক পাঠিয়েছি।
                  অনুগ্রহ করে আপনার ইনবক্স চেক করে একাউন্ট সক্রিয় করুন।
                </>
              ) : (
                <>
                  We sent a confirmation link to <strong className="text-white">{email}</strong>.
                  Please click the link in your inbox to activate your account.
                </>
              )}
            </p>
            <div className="pt-2">
              <Link
                to={`/verify-email?email=${encodeURIComponent(email)}`}
                className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                {isBangla ? 'ভেরিফিকেশন স্ট্যাটাস পেইজ' : 'Verification Status Page'}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {isBangla ? 'পূর্ণ নাম' : 'Full Name'} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                  placeholder={isBangla ? 'যেমন: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                  className={`w-full bg-[#0E131B] border rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none ${
                    errors.fullName ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'
                  }`}
                  autoComplete="name"
                />
              </div>
              {errors.fullName && <p className="text-[11px] text-red-400">{errors.fullName}</p>}
            </div>

            {/* Business / Shop Name (Optional at registration) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>{isBangla ? 'শপ বা পেজের নাম (ঐচ্ছিক)' : 'Business / Shop Name (Optional)'}</span>
                <span className="text-[10px] text-slate-500">
                  {isBangla ? 'অনবোর্ডিংয়ে পরিবর্তনযোগ্য' : 'Editable later'}
                </span>
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={isBangla ? 'যেমন: আভা ফ্যাশন বিডি' : 'e.g. Aura Fashion BD'}
                  className="w-full bg-[#0E131B] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  autoComplete="organization"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {isBangla ? 'ব্যবসায়িক ইমেইল' : 'Business Email'} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
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

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {isBangla ? 'পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)' : 'Password (min. 8 characters)'} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="••••••••"
                  className={`w-full bg-[#0E131B] border rounded-lg pl-9 pr-10 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none ${
                    errors.password ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'
                  }`}
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {isBangla ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="••••••••"
                  className={`w-full bg-[#0E131B] border rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none ${
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'
                  }`}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Consent Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => {
                    setAgreedTerms(e.target.checked);
                    if (errors.agreedTerms) setErrors((prev) => ({ ...prev, agreedTerms: '' }));
                  }}
                  className="mt-0.5 accent-indigo-600 rounded"
                />
                <span className="leading-relaxed">
                  {isBangla ? (
                    <>
                      আমি বংগোসেল এআই এর{' '}
                      <Link to="/terms" className="text-indigo-400 underline">
                        ব্যবহারের শর্তাবলী
                      </Link>{' '}
                      এবং{' '}
                      <Link to="/privacy" className="text-indigo-400 underline">
                        প্রাইভেসি পলিসি
                      </Link>{' '}
                      মেনে নিচ্ছি।
                    </>
                  ) : (
                    <>
                      I accept the{' '}
                      <Link to="/terms" className="text-indigo-400 underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-indigo-400 underline">
                        Privacy Policy
                      </Link>
                      .
                    </>
                  )}
                </span>
              </label>
              {errors.agreedTerms && (
                <p className="text-[11px] text-red-400 mt-1">{errors.agreedTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 shadow-lg shadow-indigo-600/20"
            >
              {isSubmitting ? (
                <span>{isBangla ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating Account...'}</span>
              ) : (
                <>
                  <span>{isBangla ? 'সাইন আপ করুন' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
          <span>{isBangla ? 'ইতিমধ্যে অ্যাকাউন্ট রয়েছে?' : 'Already have an account?'}</span>{' '}
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectDestination)}`}
            className="text-indigo-400 font-semibold hover:text-indigo-300"
          >
            {isBangla ? 'এখানে লগইন করুন' : 'Log in here'}
          </Link>
        </div>
      </div>
    </div>
  );
};
