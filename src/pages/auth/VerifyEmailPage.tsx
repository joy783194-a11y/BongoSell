import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo } from '../../components/common/BrandLogo';

export const VerifyEmailPage: React.FC = () => {
  const { resendVerificationEmail, user } = useAuth();
  const { isBangla } = useLanguage();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || user?.email || '';

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!emailParam || resendCooldown > 0 || isSending) return;

    setIsSending(true);
    setResendError(null);
    setResendSuccess(false);

    const { error } = await resendVerificationEmail(emailParam);
    setIsSending(false);

    if (error) {
      setResendError(error);
    } else {
      setResendSuccess(true);
      setResendCooldown(60);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-[#131B26] p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl text-center">
        <div className="flex justify-center">
          <BrandLogo />
        </div>

        <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
          <Mail className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isBangla ? 'আপনার ইমেইল ভেরিফাই করুন' : 'Verify Your Email Address'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isBangla ? (
              <>
                আমরা <strong className="text-white">{emailParam || 'আপনার ইমেইল'}</strong> ঠিকানায় একটি অ্যাক্টিভেশন লিংক পাঠিয়েছি। আপনার অ্যাকাউন্টের সম্পূর্ণ সুরক্ষা নিশ্চিত করতে অনুগ্রহ করে লিংকে ক্লিক করুন।
              </>
            ) : (
              <>
                We have sent an activation link to{' '}
                <strong className="text-white">{emailParam || 'your email'}</strong>. Please click the link to confirm your account.
              </>
            )}
          </p>
        </div>

        {resendSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-200 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isBangla ? 'নতুন ভেরিফিকেশন লিংক পাঠানো হয়েছে!' : 'New confirmation link sent!'}
            </span>
          </div>
        )}

        {resendError && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-200 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{resendError}</span>
          </div>
        )}

        <div className="pt-2 flex flex-col items-center space-y-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isSending || !emailParam}
            className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
            <span>
              {resendCooldown > 0
                ? isBangla
                  ? `আবার পাঠানো যাবে (${resendCooldown}s)`
                  : `Resend in ${resendCooldown}s`
                : isBangla
                ? 'ভেরিফিকেশন ইমেইল পুনরায় পাঠান'
                : 'Resend Verification Email'}
            </span>
          </button>

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isBangla ? 'লগইন পেইজে ফিরে যান' : 'Return to Login'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
