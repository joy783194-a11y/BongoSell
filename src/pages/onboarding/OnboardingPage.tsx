import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Store,
  Globe,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Check,
} from 'lucide-react';
import { useAuth, OnboardingData } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo } from '../../components/common/BrandLogo';

export const OnboardingPage: React.FC = () => {
  const { user, profile, completeOnboarding } = useAuth();
  const { isBangla, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<OnboardingData>({
    businessName: profile?.business_name || '',
    category: 'clothing',
    preferredLanguage: (profile?.preferred_language as any) || 'bn',
    monthlyMessageVolume: '1k_to_5k',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const totalSteps = 6;

  const categories = [
    { id: 'clothing', nameBn: 'পোশাক ও বুটিক (Fashion & Boutique)', nameEn: 'Clothing & Boutique' },
    { id: 'gadgets', nameBn: 'গ্যাজেট ও ইলেকট্রনিক্স (Tech & Gadgets)', nameEn: 'Gadgets & Electronics' },
    { id: 'cosmetics', nameBn: 'কসমেটিক্স ও স্কিনকেয়ার (Beauty & Skincare)', nameEn: 'Cosmetics & Skincare' },
    { id: 'jewelry', nameBn: 'জুয়েলারি ও এক্সেসরিজ (Jewelry)', nameEn: 'Jewelry & Accessories' },
    { id: 'food', nameBn: 'খাবার ও হোম ডেলিভারি (Food & Bakery)', nameEn: 'Food & Home Bakery' },
    { id: 'general', nameBn: 'জেনারেল রিটেল শপ (General Retail)', nameEn: 'General Retail' },
  ];

  const languages = [
    {
      id: 'bn',
      nameBn: 'বাংলা (প্রমিত ও কথ্য বাংলা লিপি)',
      nameEn: 'Bangla (Bengali Script)',
      sample: 'যেমন: "আমাদের এই শাড়ির দাম ৩,২০০ টাকা, ডেলিভারি ফ্রি।"',
    },
    {
      id: 'banglish',
      nameBn: 'বাংলিশ (ইংরেজি অক্ষরে বাংলা কথা)',
      nameEn: 'Banglish (Romanized Bangla)',
      sample: 'যেমন: "Aei saree tar price 3200 tk, delivery dhakar moddhe free."',
    },
    {
      id: 'en',
      nameBn: 'ইংলিশ (ইংরেজি ভাষা)',
      nameEn: 'English',
      sample: 'e.g., "The price is 3,200 BDT with free home delivery in Dhaka."',
    },
  ];

  const volumes = [
    { id: 'under_1k', labelBn: '১,০০০ এর কম মেসেজ / মাস', labelEn: 'Under 1,000 messages / month', descBn: 'নতুন বা হোম-বেসড শপ', descEn: 'New or home boutique' },
    { id: '1k_to_5k', labelBn: '১,০০০ – ৫,০০০ মেসেজ / মাস', labelEn: '1,000 – 5,000 messages / month', descBn: 'গ্রোইং এফ-কমার্স শপ (জনপ্রিয়)', descEn: 'Growing shop (Recommended)' },
    { id: '5k_to_15k', labelBn: '৫,০০০ – ১৫,০০০ মেসেজ / মাস', labelEn: '5,000 – 15,000 messages / month', descBn: 'নিয়মিত লাইভ সেলস ও অ্যাডস', descEn: 'Regular live sales & ads' },
    { id: 'over_15k', labelBn: '১৫,০০০+ হাই-ভলিউম মেসেজ', labelEn: '15,000+ high volume / month', descBn: 'শীর্ষস্থানীয় অনলাইন ব্র্যান্ড', descEn: 'Enterprise brand' },
  ];

  const handleNext = () => {
    setErrors({});
    setGeneralError(null);

    // Validation for Step 2
    if (currentStep === 2) {
      if (!formData.businessName.trim()) {
        setErrors({ businessName: isBangla ? 'আপনার শপ বা পেজের নাম লিখুন' : 'Business name is required' });
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    setGeneralError(null);

    const { error } = await completeOnboarding(formData);
    setIsSubmitting(false);

    if (error) {
      setGeneralError(error);
      return;
    }

    // Sync site language with preferred language choice
    if (formData.preferredLanguage === 'en') {
      setLanguage('en');
    } else {
      setLanguage('bn');
    }

    navigate('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-[#131B26] border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 text-left">
        {/* Header & Step Tracker */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <BrandLogo />
            <div className="text-xs font-mono text-indigo-400 font-semibold">
              STEP {currentStep} OF {totalSteps}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {generalError && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{generalError}</p>
          </div>
        )}

        {/* STEP 1: Welcome */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {isBangla ? 'স্বাগতম BongoSell AI-তে!' : 'Welcome to BongoSell AI!'}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {isBangla
                  ? 'আপনার ফেসবুক পেইজের মেসেঞ্জার ইনবক্সকে একটি ২৪/৭ স্বয়ংক্রিয় বিক্রয় ইঞ্জিনে রূপান্তর করতে কয়েক মিনিটের মধ্যে শপ প্রোফাইলটি সম্পূর্ণ করুন।'
                  : 'Let’s configure your merchant profile in a few quick steps to personalize your AI sales assistant for your shop.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isBangla ? 'সহজ ৩ মিনিটের সেটআপ' : 'Quick 3-Minute Guided Setup'}</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {isBangla
                  ? 'কোনো ফেসবুক পাসওয়ার্ড বা জটিল এপিআই টোকেনের প্রয়োজন নেই। আপনি যেকোনো সময় এই সেটিংস পরিবর্তন করতে পারবেন।'
                  : 'No passwords or technical tokens required. All settings can be adjusted anytime from your dashboard.'}
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Business Name & Category */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Store className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isBangla ? 'আপনার ব্যবসা ও শপ পরিচিতি' : 'Business Name & Industry'}
              </h2>
              <p className="text-xs text-slate-400">
                {isBangla
                  ? 'আপনার ফেসবুক পেজ বা ব্র্যান্ডের নাম এবং প্রধান পণ্যের ক্যাটাগরি নির্ধারণ করুন'
                  : 'Tell us your Facebook page or shop name and primary product category'}
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">
                  {isBangla ? 'শপ বা ব্র্যান্ডের নাম' : 'Shop / Business Name'} *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => {
                    setFormData({ ...formData, businessName: e.target.value });
                    if (errors.businessName) setErrors({});
                  }}
                  placeholder={isBangla ? 'যেমন: আভা বুটিক বিডি' : 'e.g. Aura Boutique BD'}
                  className={`w-full bg-[#0E131B] border rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none ${
                    errors.businessName ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'
                  }`}
                  autoFocus
                />
                {errors.businessName && (
                  <p className="text-[11px] text-red-400">{errors.businessName}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">
                  {isBangla ? 'প্রধান পণ্য ক্যাটাগরি' : 'Primary Product Category'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {categories.map((cat) => {
                    const isSelected = formData.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.id as any })}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 text-white font-medium shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{isBangla ? cat.nameBn : cat.nameEn}</span>
                          {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Language Preference */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Globe className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isBangla ? 'মেসেঞ্জারে এআই এর প্রধান ভাষা' : 'Preferred Conversation Language'}
              </h2>
              <p className="text-xs text-slate-400">
                {isBangla
                  ? 'আপনার কাস্টমাররা সাধারণত কোন ভাষায় চ্যাট করতে বেশি স্বাচ্ছন্দ্যবোধ করেন?'
                  : 'How do your customers usually communicate on your Facebook page?'}
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {languages.map((lang) => {
                const isSelected = formData.preferredLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredLanguage: lang.id as any })}
                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white text-sm">
                        {isBangla ? lang.nameBn : lang.nameEn}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{lang.sample}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Estimated Monthly Message Volume */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isBangla ? 'মাসিক ইনবক্স মেসেজ ভলিউম' : 'Estimated Monthly Inbox Volume'}
              </h2>
              <p className="text-xs text-slate-400">
                {isBangla
                  ? 'প্রতি মাসে আপনার ফেসবুক পেজের ইনবক্সে আনুমানিক কত মেসেজ আসে?'
                  : 'This helps us tune concurrency capacity for your shop'}
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {volumes.map((vol) => {
                const isSelected = formData.monthlyMessageVolume === vol.id;
                return (
                  <button
                    key={vol.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, monthlyMessageVolume: vol.id as any })}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-white text-xs sm:text-sm block">
                        {isBangla ? vol.labelBn : vol.labelEn}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {isBangla ? vol.descBn : vol.descEn}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Facebook Meta Graph API Explanation */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isBangla ? 'ফেসবুক পেইজ কানেকশন পদ্ধতি' : 'Facebook Page Connection Workflow'}
              </h2>
              <p className="text-xs text-slate-400">
                {isBangla
                  ? 'কীভাবে মেটা অফিসিয়াল সিকিউরিটির মাধ্যমে পেইজ কানেক্ট হবে'
                  : 'Understanding secure official Meta Graph API integration'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>{isBangla ? 'সুরক্ষা প্রতিশ্রুতি (Zero-Password Policy)' : 'Zero-Password Security Policy'}</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                {isBangla
                  ? 'বংগোসেল এআই কখনো আপনার ফেসবুক অ্যাকাউন্টের পাসওয়ার্ড চাইবে না। পরবর্তী ধাপে মেটার অফিসিয়াল লগইন ডায়ালগের মাধ্যমে এনক্রিপ্ট করা টোকেন দিয়ে নিরাপদ সংযোগ স্থাপিত হবে।'
                  : 'BongoSell AI will never request your Facebook password or require pasting sensitive tokens. In Phase 4, official Meta OAuth dialogs securely grant Messenger webhook permissions.'}
              </p>

              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{isBangla ? 'যেকোনো সময় এক ক্লিকে পেইজ ডিসকানেক্ট করার ক্ষমতা' : 'Single-click disconnect and access revocation'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{isBangla ? 'কাস্টমার ডেটা এনক্রিপ্ট করা অবস্থায় সংরক্ষিত' : 'End-to-end encrypted tenant order isolation'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Launch */}
        {currentStep === 6 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isBangla ? 'তথ্য যাচাই ও সমাপ্তি' : 'Review Details & Launch Dashboard'}
              </h2>
              <p className="text-xs text-slate-400">
                {isBangla
                  ? 'আপনার শপের সকল তথ্য সঠিক রয়েছে কিনা দেখে নিয়ে অনবোর্ডিং সম্পন্ন করুন'
                  : 'Confirm your profile details to activate your merchant workspace'}
              </p>
            </div>

            {/* Summary Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">{isBangla ? 'শপের নাম:' : 'Shop Name:'}</span>
                <span className="font-semibold text-white">{formData.businessName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">{isBangla ? 'ক্যাটাগরি:' : 'Category:'}</span>
                <span className="font-semibold text-white capitalize">{formData.category}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">{isBangla ? 'প্রধান ভাষা:' : 'Primary Language:'}</span>
                <span className="font-semibold text-white uppercase">{formData.preferredLanguage}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">{isBangla ? 'মেসেজ ভলিউম:' : 'Message Volume:'}</span>
                <span className="font-semibold text-white">{formData.monthlyMessageVolume}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons (Back & Next/Finish) */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBangla ? 'পূর্ববর্তী' : 'Back'}</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <span>{isBangla ? 'পরবর্তী ধাপ' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{isBangla ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
              ) : (
                <>
                  <span>{isBangla ? 'অনবোর্ডিং সম্পন্ন করুন' : 'Finish & Go to Dashboard'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
