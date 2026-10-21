import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';
import { useLanguage } from '../context/LanguageContext';
import { BrandLogo } from '../components/common/BrandLogo';

export const LoginPage: React.FC = () => {
  const { isBangla } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = isBangla ? 'ইমেইল অ্যাড্রেস লিখুন' : 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = isBangla ? 'সঠিক ইমেইল ফরম্যাট দিন' : 'Enter a valid email address';
    }

    if (!password) {
      newErrors.password = isBangla ? 'পাসওয়ার্ড লিখুন' : 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = isBangla
        ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'
        : 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate frontend validation response
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }, 800);
  };

  const fillDemoCredentials = () => {
    setEmail('seller@fcommerce-bd.com');
    setPassword('DemoShopPass2026!');
    setErrors({});
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#131B26] p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isBangla ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'Log in to your account'}
          </h2>
          <p className="text-xs text-slate-400">
            {isBangla
              ? 'ফেসবুক পেইজ সেলস ড্যাশবোর্ড ও ইনবক্স রুল কন্ট্রোল'
              : 'Access your Facebook sales dashboard and rule engine'}
          </p>
        </div>

        {/* Phase 1 Prototype Notice Box */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold">
            <Shield className="w-4 h-4 shrink-0" />
            <span>{isBangla ? 'ফেজ ১ আর্কিটেকচার নোটিশ' : 'Phase 1 Frontend Architecture'}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {isBangla
              ? 'লাইভ ব্যাকএন্ড ডাটাবেস ও অথেন্টিকেশন সার্ভিস ফেজ ২ এর জন্য পরিকল্পিত। এই ফর্মটি ফ্রন্টএন্ড ভ্যালিডেশন এবং ইউআই প্রিভিউ প্রদর্শন করছে।'
              : 'Live backend database authorization is scheduled for Phase 2. This form demonstrates complete client-side validation and state handling.'}
          </p>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
          >
            {isBangla ? 'ডেমো অ্যাকাউন্ট তথ্য বসান' : 'Fill demo merchant credentials'}
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-semibold text-sm">
              {isBangla ? 'ভ্যালিডেশন সফল!' : 'Credentials Validated!'}
            </h4>
            <p className="text-xs text-emerald-300/80 leading-relaxed">
              {isBangla
                ? 'ফেজ ১ এ ব্যাকএন্ড সেশন তৈরি করা হচ্ছে না। আপনি ড্যাশবোর্ড ও ডেমো ফিচারসমূহ হোমপেজ ও ফিচারস পেইজে টেস্ট করতে পারেন।'
                : 'Session simulation ready. You can test live interaction in the Messenger Demo & Feature simulators.'}
            </p>
            <Link
              to="/#demo"
              className="inline-block mt-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
            >
              {isBangla ? 'মেসেঞ্জার ডেমোতে ফিরে যান' : 'Go to Messenger Demo'}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-300">
                {isBangla ? 'ইমেইল অ্যাড্রেস' : 'Business Email'}
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
                    errors.email
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-slate-700 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  {isBangla ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      isBangla
                        ? 'পাসওয়ার্ড রিসেট ইমেইল সার্ভিস ফেজ ২ তে লাইভ হবে।'
                        : 'Password recovery delivery via email will be available in Phase 2.'
                    )
                  }
                  className="text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  {isBangla ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                </button>
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
                    errors.password
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-slate-700 focus:border-indigo-500'
                  }`}
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
              {errors.password && (
                <p className="text-[11px] text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{isBangla ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}</span>
              ) : (
                <>
                  <span>{isBangla ? 'লগইন করুন' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
          <span>{isBangla ? 'নতুন শপ ওনার?' : "Don't have an account yet?"}</span>{' '}
          <Link to="/signup" className="text-indigo-400 font-semibold hover:text-indigo-300">
            {isBangla ? '১৪ দিনের ফ্রি ট্রায়ালে রেজিস্ট্রেশন করুন' : 'Sign up for free'}
          </Link>
        </div>
      </div>
    </div>
  );
};
