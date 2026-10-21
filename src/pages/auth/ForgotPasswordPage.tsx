import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { ConfigWarningBanner } from '../../components/auth/ConfigWarningBanner';
import { isValidEmail } from '../../lib/auth-helpers';

export const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset } = useAuth();
  const { isBangla } = useLanguage();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError(
        isBangla
          ? 'অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন'
          : 'Please enter a valid email address'
      );
      return;
    }

    setIsSubmitting(true);
    const { error: resetErr } = await sendPasswordReset(email);
    setIsSubmitting(false);

    if (resetErr) {
      setError(resetErr);
      return;
    }

    setSubmittedSuccess(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-[#131B26] p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isBangla ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Reset Your Password'}
          </h1>
          <p className="text-xs text-slate-400">
            {isBangla
              ? 'আপনার অ্যাকাউন্টের ইমেইল ঠিকানা দিন, আমরা একটি নিরাপদ রিসেট লিংক পাঠাব'
              : 'Enter your account email and we will send you a secure password reset link'}
          </p>
        </div>

        <ConfigWarningBanner />

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {submittedSuccess ? (
          <div className="p-6 rounded-xl bg-emerald-950/30 border border-emerald-800/80 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">
              {isBangla ? 'রিসেট লিংক পাঠানো হয়েছে!' : 'Reset Link Sent!'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isBangla ? (
                <>
                  আমরা <strong className="text-white">{email}</strong> ঠিকানায় একটি পাসওয়ার্ড রিসেট লিংক পাঠিয়েছি।
                  লিংকটি সীমিত সময়ের জন্য কার্যকর থাকবে। অনুগ্রহ করে ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।
                </>
              ) : (
                <>
                  We have sent an expiring single-use password reset link to{' '}
                  <strong className="text-white">{email}</strong>. Please check your inbox or spam folder.
                </>
              )}
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isBangla ? 'লগইন পেইজে ফিরে যান' : 'Back to login'}</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {isBangla ? 'আপনার নিবন্ধিত ইমেইল' : 'Registered Business Email'} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="seller@yourshop.com"
                  className="w-full bg-[#0E131B] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 shadow-lg shadow-indigo-600/20"
            >
              {isSubmitting ? (
                <span>{isBangla ? 'লিংক পাঠানো হচ্ছে...' : 'Sending Link...'}</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isBangla ? 'রিসেট লিংক পাঠান' : 'Send Reset Link'}</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isBangla ? 'লগইনে ফিরে যান' : 'Back to Login'}</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
