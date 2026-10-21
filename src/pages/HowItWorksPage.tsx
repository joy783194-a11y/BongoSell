import React, { useState } from 'react';
import {
  UserPlus,
  Share2,
  Database,
  Rocket,
  CheckCircle2,
  Lock,
  ArrowRight,
  Shield,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../config/site';
import { useLanguage } from '../../src/context/LanguageContext';
import { Card } from '../components/common/Card';

export const HowItWorksPage: React.FC = () => {
  const { isBangla } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);

  const stepsDetail = [
    {
      step: 1,
      titleBn: 'অ্যাকাউন্ট তৈরি ও শপ প্রোফাইল',
      titleEn: 'Create Account & Profile',
      icon: UserPlus,
      status: 'available_now',
      badgeBn: 'ফেজ ১ এ প্রস্তুত',
      badgeEn: 'Available Now',
      descBn: 'মাত্র ১ মিনিটে শপের ক্যাটাগরি, অফিসিয়াল ইমেইল এবং কাস্টমার কেয়ার নম্বর দিয়ে অ্যাকাউন্ট সেটআপ করুন।',
      descEn: 'Set up your store category, primary business email, and shop support contact in under a minute.',
      pointsBn: [
        'শপ ক্যাটাগরি নির্ধারণ (পোশাক, জুয়েলারি, গ্যাজেট, কসমেটিক্স)',
        'কাস্টমারদের সাথে যোগাযোগের প্রধান ভাষা নির্বাচন (বাংলা / বাংলিশ)',
        'মাল্টিপল অ্যাডমিন রোল কনফিগারেশন',
      ],
      pointsEn: [
        'Select store category (Fashion, Jewelry, Gadgets, Cosmetics)',
        'Set primary conversation language preference (Bangla/Banglish)',
        'Configure multi-admin access roles',
      ],
    },
    {
      step: 2,
      titleBn: 'ফেসবুক পেইজ কানেক্ট করুন',
      titleEn: 'Connect Facebook Page',
      icon: Share2,
      status: 'meta_integration_phase2',
      badgeBn: 'মেটা এপিআই (ফেজ ২ এ আসছে)',
      badgeEn: 'Meta API (Phase 2)',
      descBn: 'মেটার অফিশিয়াল সিকিউর ডায়ালগ ব্যবহার করে আপনার ফেসবুক বিজনেস পেইজ অনুমোদন করুন।',
      descEn: 'Securely link your Facebook Business Page using official Meta OAuth login dialog.',
      pointsBn: [
        'অফিশিয়াল মেটা গ্রাফ এপিআই ওয়েববুক ইন্টিগ্রেশন',
        'কোনো পাসওয়ার্ড শেয়ার করার প্রয়োজন নেই (টোকেন ভিত্তিক সিকিউরিটি)',
        'এক ক্লিকে যেকোনো সময় পেইজ কানেকশন ডিসকানেক্ট করার সুবিধা',
      ],
      pointsEn: [
        'Official Meta Graph API webhook architecture',
        'No password sharing required (Encrypted Token Based)',
        'One-click disconnect and revocation at any time',
      ],
    },
    {
      step: 3,
      titleBn: 'প্রোডাক্ট ও ডেলিভারি পলিসি সেট করুন',
      titleEn: 'Configure Catalog & Policies',
      icon: Database,
      status: 'available_now',
      badgeBn: 'কনফিগ ইঞ্জিন প্রস্তুত',
      badgeEn: 'Ready in Phase 1',
      descBn: 'আপনার পণ্যের নাম, দাম, ডিসকাউন্ট সীমা এবং ঢাকার ভেতরে ও বাইরের ডেলিভারি চার্জ ইনপুট দিন।',
      descEn: 'Input product names, prices, discount floor rules, and regional courier rates.',
      pointsBn: [
        'ঢাকার ভেতরে ডেলিভারি চার্জ (যেমন: ৳৭০) ও বাইরের চার্জ (৳১৩০)',
        'সাইজ চার্ট, কালার ভ্যারিয়েন্ট ও স্টক কোয়ান্টিটি ইনপুট',
        'সেলার মিনিমাম প্রাইস গার্ডরেল সেটিংস',
      ],
      pointsEn: [
        'Inside Dhaka delivery rate (e.g. ৳70) & Outside Dhaka rate (৳130)',
        'Size chart, color variations, and stock availability',
        'Seller minimum floor price and bargain limits',
      ],
    },
    {
      step: 4,
      titleBn: 'স্যান্ডবক্সে টেস্ট ও ২৪/৭ লাইভ লঞ্চ',
      titleEn: 'Sandbox Test & Go Live',
      icon: Rocket,
      status: 'available_now',
      badgeBn: 'সিমুলেশন প্রস্তুত',
      badgeEn: 'Sandbox Ready',
      descBn: 'ইনবক্সে টেস্ট মেসেজ পাঠিয়ে এআই এর রেসপন্স সন্তোষজনক মনে হলে লাইভ অটোমেশন অন করুন।',
      descEn: 'Simulate customer questions in the sandbox and turn on automation with peace of mind.',
      pointsBn: [
        'বাংলা ও বাংলিশের বিভিন্ন আঞ্চলিক বানানে টেস্ট করার স্যান্ডবক্স',
        'অর্ডার সামারি কার্ড প্রিভিউ ও নোটিফিকেশন অ্যালার্ট টেস্ট',
        'লাইভ চলাকালীন যেকোনো সময় ইনস্ট্যান্ট হিউম্যান টেকওভার সুইচ',
      ],
      pointsEn: [
        'Sandbox testing for colloquial Bangla phrasing',
        'Order confirmation card formatting check',
        'Instant live toggle and human intervention switch',
      ],
    },
  ];

  return (
    <div className="py-12 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          {isBangla ? 'অনবোর্ডিং গাইড' : 'Onboarding Guide'}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight [text-wrap:balance]">
          {isBangla
            ? 'কীভাবে কাজ করে বংগোসেল এআই?'
            : 'How BongoSell AI Works From Setup to Sales'}
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed [text-wrap:balance]">
          {isBangla
            ? 'ফেসবুক উদ্যোক্তাদের দৈনন্দিন ব্যস্ততার কথা মাথায় রেখে ডিজাইন করা ৪টি সহজ ধাপ।'
            : 'A transparent walkthrough designed for busy Bangladeshi online sellers.'}
        </p>
      </div>

      {/* Step Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stepsDetail.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeTab === idx;

          return (
            <button
              key={step.step}
              onClick={() => setActiveTab(idx)}
              className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#182333] border-indigo-500 shadow-lg'
                  : 'bg-[#131B26] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-indigo-400">0{step.step}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    step.status === 'meta_integration_phase2'
                      ? 'bg-amber-950/60 text-amber-300'
                      : 'bg-emerald-950/60 text-emerald-300'
                  }`}
                >
                  {isBangla ? step.badgeBn : step.badgeEn}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white">
                {isBangla ? step.titleBn : step.titleEn}
              </h4>
            </button>
          );
        })}
      </div>

      {/* Active Step Detailed View */}
      {(() => {
        const current = stepsDetail[activeTab];
        const Icon = current.icon;
        const isPhase2 = current.status === 'meta_integration_phase2';

        return (
          <div className="bg-[#131B26] border border-slate-800 rounded-2xl p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-indigo-400 font-mono font-bold">
                      STEP 0{current.step}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {isBangla ? current.titleBn : current.titleEn}
                    </h3>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {isBangla ? current.descBn : current.descEn}
                </p>

                <div className="pt-2 space-y-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">
                    {isBangla ? 'গুরুত্বপূর্ণ বিষয়সমূহ:' : 'Key Highlights:'}
                  </span>
                  {(isBangla ? current.pointsBn : current.pointsEn).map((pt, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                {isPhase2 && (
                  <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200 mt-4">
                    <strong>{isBangla ? 'ফেজ ২ মেটা এপিআই নোট:' : 'Phase 2 Integration Note:'}</strong>{' '}
                    {isBangla
                      ? 'অফিশিয়াল মেটা ফেসবুক মেসেঞ্জার ওয়েববুক কানেকশন ফেজ ২ তে সক্রিয় করা হবে। ফেজ ১ এ আপনি পুরো অনবোর্ডিং ওয়ার্কফ্লো এবং এআই ডেমো পরখ করতে পারছেন।'
                      : 'Live Meta Messenger webhooks will be connected in Phase 2. Phase 1 provides the interactive workflow preview and sandbox.'}
                  </div>
                )}
              </div>

              {/* Graphic visual illustration container */}
              <div className="lg:col-span-5 bg-[#0A0E15] p-6 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-indigo-400" />
                    {isBangla ? 'সেটআপ চেকলিস্ট' : 'Setup Checklist'}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium">Ready</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span>{isBangla ? 'শপ ইনফো কনফিগারেশন' : 'Shop Info Config'}</span>
                    <span className="text-emerald-400 font-mono text-[11px]">Completed</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span>{isBangla ? 'ডেলিভারি চার্জ রুল' : 'Delivery Charges'}</span>
                    <span className="text-emerald-400 font-mono text-[11px]">৳70 / ৳130</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span>{isBangla ? 'ডিসকাউন্ট ফ্লোর পলিসি' : 'Discount Floor'}</span>
                    <span className="text-emerald-400 font-mono text-[11px]">Enforced</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span>{isBangla ? 'অটো-অর্ডার কালেকশন' : 'Order Intake Form'}</span>
                    <span className="text-indigo-400 font-mono text-[11px]">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Meta API Trust & Privacy Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <Card className="flex items-start gap-3.5">
          <Shield className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              {isBangla ? 'অফিশিয়াল মেটা সুরক্ষা পদ্ধতি' : 'Official Meta Platform Security'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isBangla
                ? 'বংগোসেল এআই কখনো আপনার ফেসবুক অ্যাকাউন্টের পাসওয়ার্ড গ্রহণ করে না। মেটার অফিশিয়াল OAuth ও টোকেন মেকানিজমে পেইজ কানেক্ট করা হয়।'
                : 'BongoSell AI will never request your Facebook account password. It links strictly via official Meta OAuth tokens.'}
            </p>
          </div>
        </Card>

        <Card className="flex items-start gap-3.5">
          <Lock className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              {isBangla ? 'ব্যবসায়িক গোপনীয়তা নিশ্চিত' : 'Complete Business Data Privacy'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isBangla
                ? 'আপনার কাস্টমার তালিকা, ডেলিভারি ফোন নম্বর এবং বিক্রির তথ্য কেবল আপনার শপের জন্য সুরক্ষিত এনক্রিপ্ট অবস্থায় সংরক্ষিত থাকে।'
                : 'Your customer directories, phone numbers, and orders remain strictly encrypted and confidential to your shop.'}
            </p>
          </div>
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg"
        >
          <span>{isBangla ? 'আজই অ্যাকাউন্ট রেজিস্টার করুন' : 'Register Your Account Today'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
