import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Store,
  Phone,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { SITE_CONFIG } from '../config/site';
import { useLanguage } from '../context/LanguageContext';
import { BrandLogo } from '../components/common/BrandLogo';

export const SignupPage: React.FC = () => {
  const { isBangla } = useLanguage();
  const [searchParams] = useSearchParams();
  const selectedPlanId = searchParams.get('plan') || 'growth';

  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [category, setCategory] = useState('clothing');
  const [password, setPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegisteredSuccess, setIsRegisteredSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!shopName.trim()) {
      newErrors.shopName = isBangla ? 'আপনার পেইজ বা শপের নাম লিখুন' : 'Shop name is required';
    }

    if (!email.trim()) {
      newErrors.email = isBangla ? 'ইমেইল অ্যাড্রেস লিখুন' : 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = isBangla ? 'সঠিক ইমেইল ফরম্যাট দিন' : 'Enter a valid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = isBangla ? 'মোবাইল নম্বর লিখুন' : 'Phone number is required';
    } else if (!/^(?:\+8801|01)[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = isBangla
        ? '১১ ডিজিটের সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)'
        : 'Enter a valid 11-digit Bangladeshi mobile number';
    }

    if (!password) {
      newErrors.password = isBangla ? 'পাসওয়ার্ড লিখুন' : 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = isBangla
        ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'
        : 'Password must be at least 6 characters';
    }

    if (!agreedTerms) {
      newErrors.agreedTerms = isBangla
        ? 'শর্তাবলী মেনে টিক চিহ্ন দিন'
        : 'You must agree to the terms to proceed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsRegisteredSuccess(true);
    }, 900);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-[#131B26] p-6 sm:p-10 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {isBangla ? '১৪ দিনের ফ্রি ট্রায়াল শুরু করুন' : 'Start Your 14-Day Free Trial'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {isBangla
              ? 'আপনার ফেসবুক পেইজে স্বয়ংক্রিয় বাংলা এআই সেলস অ্যাসিস্ট্যান্ট সেটআপ করুন'
              : 'Empower your Facebook shop with instant Bangla conversational AI'}
          </p>
        </div>

        {/* Phase 1 Prototype Notice Box */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold">
            <Shield className="w-4 h-4 shrink-0" />
            <span>{isBangla ? 'ফেজ ১ আর্কিটেকচার প্রিভিউ' : 'Phase 1 Architecture Preview'}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {isBangla
              ? 'এটি একটি কার্যকরী ফ্রন্টএন্ড প্রিভিউ। ফেজ ১ এ কোনো পেমেন্ট গেটওয়ে বা লাইভ ফেসবুক মেটা এপিআই সংযুক্ত নেই। আপনার নিবন্ধিত তথ্য ডাটাবেস ছাড়া সংরক্ষিত হবে না।'
              : 'This is a functional frontend design preview. Real Facebook Graph tokens, cloud database authorization, and payment processing are deferred to Phase 2.'}
          </p>
        </div>

        {isRegisteredSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold">
              {isBangla ? 'রেজিস্ট্রেশন সিমুলেশন সম্পন্ন!' : 'Registration Simulation Complete!'}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-300/80 leading-relaxed max-w-md mx-auto">
              {isBangla
                ? `অভিনন্দন! আপনার শপ "${shopName}" এর জন্য ফেজ ১ অনবোর্ডিং প্রোফাইল তৈরি হয়েছে। নিচের বাটনে ক্লিক করে মেসেঞ্জার ডেমো ও রুল ইঞ্জিন এক্সপ্লোর করুন।`
                : `Success! Onboarding profile initialized for "${shopName}". Test the real-time conversation and pricing rules in the simulation.`}
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                to="/#demo"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
              >
                {isBangla ? 'লাইভ ডেমো টেস্ট করুন' : 'Test Live Demo'}
              </Link>
              <Link
                to="/features"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700"
              >
                {isBangla ? 'প্রাইস গার্ডরেল সিমুলেটর' : 'Price Guardrail Simulator'}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
            {/* Shop Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {isBangla ? 'ফেসবুক পেইজ বা শপের নাম' : 'Facebook Page / Shop Name'} *
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => {
                    setShopName(e.target.value);
                    if (errors.shopName) setErrors((prev) => ({ ...prev, shopName: '' }));
                  }}
                  placeholder={isBangla ? 'যেমন: আভিজাত্য বুটিক বা গ্যাজেট হাব' : 'e.g. Aura Boutique BD'}
                  className={`w-full bg-[#0E131B] border rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none ${
                    errors.shopName ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.shopName && <p className="text-[11px] text-red-400">{errors.shopName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {isBangla ? 'ইমেইল অ্যাড্রেস' : 'Business Email'} *
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
                    placeholder="shop@domain.com"
                    className={`w-full bg-[#0E131B] border rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none ${
                      errors.email ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-400">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {isBangla ? 'মোবাইল নম্বর (বাংলাদেশ)' : 'Mobile Number (BD)'} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    placeholder="017XXXXXXXX"
                    className={`w-full bg-[#0E131B] border rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none ${
                      errors.phone ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-red-400">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {isBangla ? 'শপ ক্যাটাগরি' : 'Store Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="clothing">
                    {isBangla ? 'পোশাক ও বুটিক (Clothing)' : 'Clothing & Boutique'}
                  </option>
                  <option value="gadgets">
                    {isBangla ? 'গ্যাজেট ও ইলেকট্রনিক্স (Gadgets)' : 'Gadgets & Electronics'}
                  </option>
                  <option value="cosmetics">
                    {isBangla ? 'কসমেটিক্স ও স্কিনকেয়ার (Beauty)' : 'Cosmetics & Skincare'}
                  </option>
                  <option value="jewelry">
                    {isBangla ? 'জুয়েলারি ও এক্সেসরিজ (Jewelry)' : 'Jewelry & Accessories'}
                  </option>
                  <option value="food">
                    {isBangla ? 'খাবার ও অর্গানিক গ্রোসারি (Food)' : 'Food & Organic Grocery'}
                  </option>
                  <option value="general">
                    {isBangla ? 'জেনারেল অনলাইন রিটেল' : 'General Retail'}
                  </option>
                </select>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {isBangla ? 'পাসওয়ার্ড' : 'Password'} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="••••••••"
                    className={`w-full bg-[#0E131B] border rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none ${
                      errors.password ? 'border-red-500' : 'border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.password && <p className="text-[11px] text-red-400">{errors.password}</p>}
              </div>
            </div>

            {/* Optional Facebook Page Link */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>{isBangla ? 'ফেসবুক পেইজ লিংক (ঐচ্ছিক)' : 'Facebook Page URL (Optional)'}</span>
                <span className="text-[10px] text-slate-400">
                  {isBangla ? 'ফেজ ২ তে অটো-কানেক্ট হবে' : 'Auto-links in Phase 2'}
                </span>
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={pageUrl}
                  onChange={(e) => setPageUrl(e.target.value)}
                  placeholder="https://facebook.com/yourshop"
                  className="w-full bg-[#0E131B] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
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
                      I agree to the{' '}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 shadow-lg"
            >
              {isSubmitting ? (
                <span>{isBangla ? 'অনবোর্ডিং তৈরি হচ্ছে...' : 'Creating Shop Profile...'}</span>
              ) : (
                <>
                  <span>
                    {isBangla
                      ? `১৪ দিনের ট্রায়াল শুরু করুন (${
                          selectedPlanId === 'starter'
                            ? 'স্টার্টার'
                            : selectedPlanId === 'business'
                            ? 'বিজনেস প্রো'
                            : 'গ্রোথ'
                        } প্ল্যান)`
                      : `Start 14-Day Free Trial (${selectedPlanId.toUpperCase()})`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
          <span>{isBangla ? 'ইতিমধ্যে অ্যাকাউন্ট রয়েছে?' : 'Already have an account?'}</span>{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300">
            {isBangla ? 'এখানে লগইন করুন' : 'Log in here'}
          </Link>
        </div>
      </div>
    </div>
  );
};
