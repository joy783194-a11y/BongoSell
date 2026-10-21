import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { checkPasswordStrength } from '../../lib/auth-helpers';

export const ResetPasswordPage: React.FC = () => {
  const { updatePassword } = useAuth();
  const { isBangla } = useLanguage();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    const passCheck = checkPasswordStrength(password);
    if (!passCheck.isValid) {
      newErrors.password = isBangla ? passCheck.errorsBn[0] : passCheck.errorsEn[0];
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = isBangla ? 'পাসওয়ার্ড দুটি মেলেনি' : 'Passwords do not match';
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
    const { error } = await updatePassword(password);
    setIsSubmitting(false);

    if (error) {
      setGeneralError(error);
      return;
    }

    setIsSuccess(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-[#131B26] p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isBangla ? 'নতুন পাসওয়ার্ড সেট করুন' : 'Set New Password'}
          </h1>
          <p className="text-xs text-slate-400">
            {isBangla
              ? 'আপনার অ্যাকাউন্টের জন্য একটি শক্তিশালী নতুন পাসওয়ার্ড লিখুন'
              : 'Enter a strong, secure password for your BongoSell AI account'}
          </p>
        </div>

        {generalError && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{generalError}</p>
          </div>
        )}

        {isSuccess ? (
          <div className="p-6 rounded-xl bg-emerald-950/30 border border-emerald-800/80 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">
              {isBangla ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' : 'Password Updated Successfully!'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isBangla
                ? 'আপনার নতুন পাসওয়ার্ড সক্রিয় হয়েছে। এখন আপনি ড্যাশবোর্ডে প্রবেশ করতে পারেন।'
                : 'Your password has been changed. You can now access your merchant dashboard.'}
            </p>
            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg"
              >
                <span>{isBangla ? 'ড্যাশবোর্ডে যান' : 'Go to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {isBangla ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)' : 'New Password (min 8 characters)'} *
              </label>
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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {isBangla ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 shadow-lg shadow-indigo-600/20"
            >
              {isSubmitting ? (
                <span>{isBangla ? 'সংরক্ষণ করা হচ্ছে...' : 'Updating...'}</span>
              ) : (
                <>
                  <span>{isBangla ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Save New Password'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
