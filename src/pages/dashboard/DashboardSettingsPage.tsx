import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Store,
  Globe,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  LogOut,
  Trash2,
  Save,
  Shield,
  RefreshCw,
  Building2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { checkPasswordStrength, isValidFullName } from '../../lib/auth-helpers';

export const DashboardSettingsPage: React.FC = () => {
  const {
    user,
    profile,
    currentWorkspace,
    currentRole,
    updateProfile,
    updatePassword,
    resendVerificationEmail,
    requestAccountDeletion,
    signOut,
  } = useAuth();
  const { isBangla, setLanguage } = useLanguage();
  const navigate = useNavigate();

  // Profile Form State
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [prefLang, setPrefLang] = useState<'bn' | 'banglish' | 'en'>(
    (profile?.preferred_language as any) || 'bn'
  );
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Email verification resend
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Deletion Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deletionStatusMessage, setDeletionStatusMessage] = useState<string | null>(null);
  const [isSubmittingDeletion, setIsSubmittingDeletion] = useState(false);

  const isEmailVerified = Boolean(user?.email_confirmed_at);

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    if (!isValidFullName(fullName)) {
      setProfileError(isBangla ? 'পূর্ণ নাম লিখুন (কমপক্ষে ২ অক্ষর)' : 'Full name is required');
      return;
    }

    setIsSavingProfile(true);
    const { error } = await updateProfile({
      full_name: fullName.trim(),
      business_name: businessName.trim() || null,
      preferred_language: prefLang,
    });
    setIsSavingProfile(false);

    if (error) {
      setProfileError(error);
    } else {
      setProfileSuccess(true);
      if (prefLang === 'en') setLanguage('en');
      else setLanguage('bn');
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    const passCheck = checkPasswordStrength(newPassword);
    if (!passCheck.isValid) {
      setPasswordError(isBangla ? passCheck.errorsBn[0] : passCheck.errorsEn[0]);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(isBangla ? 'পাসওয়ার্ড দুটি মেলেনি' : 'Passwords do not match');
      return;
    }

    setIsSavingPassword(true);
    const { error } = await updatePassword(newPassword);
    setIsSavingPassword(false);

    if (error) {
      setPasswordError(error);
    } else {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  // Handle Resend Verification Email
  const handleResendVerification = async () => {
    if (!user?.email || resendCooldown > 0) return;
    const { error } = await resendVerificationEmail(user.email);
    if (error) {
      setResendMessage(error);
    } else {
      setResendMessage(
        isBangla
          ? 'ভেরিফিকেশন লিংক পুনরায় আপনার ইমেইলে পাঠানো হয়েছে।'
          : 'Verification link resent to your inbox.'
      );
      setResendCooldown(60);
      setTimeout(() => setResendMessage(null), 4000);
    }
  };

  // Handle Account Deletion Request
  const handleDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationText !== 'DELETE') return;

    setIsSubmittingDeletion(true);
    const { error, message } = await requestAccountDeletion(deleteReason);
    setIsSubmittingDeletion(false);

    if (error) {
      alert(error);
    } else {
      setDeletionStatusMessage(message);
      setShowDeleteModal(false);
      setDeleteConfirmationText('');
      setDeleteReason('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="space-y-8 text-left max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {isBangla ? 'অ্যাকাউন্ট ও শপ সেটিংস' : 'Account & Shop Settings'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {isBangla
            ? 'আপনার প্রোফাইল, নিরাপত্তা, যোগাযোগের ভাষা ও মেম্বারশিপ সংক্রান্ত নিয়ন্ত্রণ'
            : 'Manage your merchant profile, language preference, security, and workspace'}
        </p>
      </div>

      {deletionStatusMessage && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{deletionStatusMessage}</p>
        </div>
      )}

      {/* Section 1: Profile & Business Details */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              {isBangla ? 'প্রোফাইল ও শপ তথ্য' : 'Profile & Shop Details'}
            </h2>
          </div>

          {profileSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isBangla ? 'সংরক্ষিত হয়েছে' : 'Saved'}
            </span>
          )}
        </div>

        {profileError && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                {isBangla ? 'পূর্ণ নাম' : 'Full Name'} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0E131B] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                {isBangla ? 'শপ বা পেজের নাম' : 'Business / Shop Name'}
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="যেমন: আভা বুটিক"
                  className="w-full bg-[#0E131B] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">
              {isBangla ? 'যোগাযোগের প্রধান ভাষা' : 'Preferred Language'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[
                { id: 'bn', labelBn: 'বাংলা (Bengali)', labelEn: 'Bangla' },
                { id: 'banglish', labelBn: 'বাংলিশ (Banglish)', labelEn: 'Banglish' },
                { id: 'en', labelBn: 'ইংলিশ (English)', labelEn: 'English' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setPrefLang(lang.id as any)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    prefLang === lang.id
                      ? 'bg-indigo-950/40 border-indigo-500 text-white font-medium shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs">{isBangla ? lang.labelBn : lang.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingProfile ? (isBangla ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBangla ? 'প্রোফাইল আপডেট করুন' : 'Save Profile')}</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Section 2: Account Security, Email Verification & Password */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              {isBangla ? 'নিরাপত্তা ও ইমেইল ভেরিফিকেশন' : 'Security & Email Verification'}
            </h2>
          </div>
        </div>

        {/* Email Verification Status */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 font-semibold">{user?.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                  isEmailVerified
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80'
                    : 'bg-amber-950/60 text-amber-300 border border-amber-800/80'
                }`}
              >
                {isEmailVerified ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{isBangla ? 'ভেরিফাইড' : 'Email Verified'}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    <span>{isBangla ? 'ভেরিফিকেশন অপেক্ষমাণ' : 'Pending Verification'}</span>
                  </>
                )}
              </span>

              {!isEmailVerified && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 disabled:opacity-50 cursor-pointer"
                >
                  {resendCooldown > 0 ? `(${resendCooldown}s)` : isBangla ? 'লিংক পাঠান' : 'Resend Link'}
                </button>
              )}
            </div>
          </div>

          {resendMessage && (
            <p className="text-xs text-indigo-300 leading-relaxed">{resendMessage}</p>
          )}
        </div>

        {/* Change Password Form */}
        <div className="pt-2 space-y-4">
          <h3 className="font-semibold text-white text-xs sm:text-sm">
            {isBangla ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}
          </h3>

          {passwordSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isBangla ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' : 'Password successfully updated!'}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  {isBangla ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)' : 'New Password (min 8 chars)'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0E131B] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  {isBangla ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0E131B] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingPassword || !newPassword}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSavingPassword ? (isBangla ? 'আপডেট হচ্ছে...' : 'Updating...') : (isBangla ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password')}
              </button>
            </div>
          </form>
        </div>
      </Card>

      {/* Section 3: Workspace Role & Multi-Tenant Info */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            {isBangla ? 'ওয়ার্কস্পেস ও মেম্বারশিপ' : 'Workspace & Tenant Role'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-xs block">{isBangla ? 'সক্রিয় ওয়ার্কস্পেস:' : 'Active Workspace:'}</span>
            <span className="font-bold text-white text-sm mt-0.5 block">{currentWorkspace?.name || 'My Shop'}</span>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">ID: {currentWorkspace?.id}</span>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-xs block">{isBangla ? 'আপনার রোল:' : 'Your Membership Role:'}</span>
            <span className="font-bold text-emerald-400 text-sm mt-0.5 block capitalize">
              {currentRole || 'Owner'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {isBangla ? 'পূর্ণাঙ্গ অ্যাডমিন ও সেলার কন্ট্রোল পারমিশন' : 'Full merchant administration rights'}
            </span>
          </div>
        </div>
      </Card>

      {/* Section 4: Session & Danger Zone */}
      <Card className="p-6 sm:p-8 border-red-950/50 bg-[#141620] space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              {isBangla ? 'লগআউট ও অ্যাকাউন্ট পরিচালনা' : 'Session & Account Lifecycle'}
            </h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div>
            <h4 className="font-semibold text-white text-xs sm:text-sm">
              {isBangla ? 'বর্তমান সেশন থেকে লগআউট' : 'Sign Out of BongoSell AI'}
            </h4>
            <p className="text-xs text-slate-400">
              {isBangla ? 'সকল সংরক্ষিত ডাটা সুরক্ষিত থাকবে।' : 'Securely close your active session.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>{isBangla ? 'লগআউট করুন' : 'Sign Out'}</span>
          </button>
        </div>

        {/* Account Deletion Request Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-950/20 border border-red-900/50">
          <div>
            <h4 className="font-semibold text-red-300 text-xs sm:text-sm">
              {isBangla ? 'অ্যাকাউন্ট মুছে ফেলার আবেদন' : 'Request Account Deletion'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              {isBangla
                ? 'আইনি ও কুরিয়ার ট্র্যাকিং তথ্যের সুরক্ষার জন্য অ্যাকাউন্ট স্থায়ীভাবে মুছতে অ্যাডমিনের নিকট আবেদন পেশ করতে হয়।'
                : 'Account deletion triggers an audited purge of merchant data, completed within 24-48 hours.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isBangla ? 'ডিলিট রিকোয়েস্ট' : 'Request Deletion'}</span>
          </button>
        </div>
      </Card>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-[#131B26] border border-red-800/80 max-w-md w-full rounded-2xl p-6 sm:p-8 space-y-5 text-left relative my-8 shadow-2xl text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 text-red-400 flex items-center justify-center border border-red-800/80">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {isBangla ? 'অ্যাকাউন্ট মুছে ফেলার চূড়ান্ত আবেদন' : 'Confirm Account Deletion Request'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isBangla
                  ? 'এই পদক্ষেপটি অপরিবর্তনীয়। আপনার ক্যাটালগ রুলস, সংগৃহীত অর্ডারের তথ্য এবং ইনবক্স হিস্ট্রি মুছে ফেলার জন্য শিডিউল করা হবে।'
                  : 'This action is irreversible. All catalog configurations, past orders, and inbox history will be scheduled for permanent deletion.'}
              </p>
            </div>

            <form onSubmit={handleDeleteRequest} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">
                  {isBangla ? 'মুছে ফেলার কারণ (ঐচ্ছিক)' : 'Reason for leaving (Optional)'}
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder={isBangla ? 'আপনার মূল্যবান মতামত লিখুন...' : 'Help us improve with your feedback...'}
                  rows={2}
                  className="w-full bg-[#0E131B] border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">
                  {isBangla ? 'নিশ্চিত করতে "DELETE" টাইপ করুন:' : 'Type "DELETE" to confirm:'}
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-[#0E131B] border border-red-900 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmationText !== 'DELETE' || isSubmittingDeletion}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isSubmittingDeletion
                    ? isBangla
                      ? 'প্রসেস হচ্ছে...'
                      : 'Processing...'
                    : isBangla
                    ? 'আবেদন নিশ্চিত করুন'
                    : 'Confirm Deletion Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
