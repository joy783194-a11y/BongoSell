import React from 'react';
import { Shield, AlertTriangle, FileText } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPage: React.FC = () => {
  const { isBangla } = useLanguage();

  return (
    <div className="py-12 lg:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
      {/* Legal Draft Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            {isBangla
              ? 'খসড়া সংস্করণ · আনুষ্ঠানিক লঞ্চের পূর্বে আইনি পর্যালোচনার জন্য নির্ধারিত'
              : 'Draft Template · Subject to Legal Review Prior to Commercial Launch'}
          </p>
          <p className="text-xs text-amber-300/80 leading-relaxed">
            {isBangla
              ? 'এই নথিটি একটি প্রাথমিক নীতি কাঠামোর ড্রাফট হিসেবে প্রণীত। এটি কোনো চূড়ান্ত বা আনুষ্ঠানিকভাবে অনুমোদিত আইনি চুক্তি নয়।'
              : 'This document represents an initial operational draft for Phase 1 architectural reference and must not be considered a final legally certified document.'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          {isBangla ? 'আইনি ও গোপনীয়তা নীতিমালা' : 'Legal & Compliance'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {isBangla ? 'প্রাইভেসি পলিসি (খসড়া)' : 'Privacy Policy (Draft)'}
        </h1>
        <p className="text-xs text-slate-400">
          Last revised: October 2026 · Phase 1 Architecture Reference
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#131B26] p-6 sm:p-10 rounded-2xl border border-slate-800">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">
            ১. ভূমিকা ও পরিচিতি (Introduction & Scope)
          </h2>
          <p>
            {SITE_CONFIG.brandName} ("আমরা", "আমাদের" বা "প্ল্যাটফর্ম") বাংলাদেশের ফেসবুক পেইজ ও অনলাইন ব্যবসায়ীদের ("সেলার" বা "মার্চেন্ট") গ্রাহক সেবা ও মেসেঞ্জার সেলস অটোমেশনে সহায়তা প্রদান করে। আমরা ব্যবহারকারীদের ব্যক্তিগত গোপনীয়তাকে সর্বোচ্চ গুরুত্ব প্রদান করি। এই খসড়া পলিসি বর্ণনা করে কীভাবে ফেসবুক মেসেঞ্জার ইনবক্স ও ওয়েব অ্যাপ্লিকেশনের মাধ্যমে প্রাপ্ত তথ্য সংগ্রহ, প্রক্রিয়াকরণ ও সংরক্ষণ করা হয়।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">
            ২. সংগৃহীত তথ্যাদি (Information We Collect)
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong>মার্চেন্ট একাউন্ট তথ্য:</strong> নাম, ব্যবসায়িক প্রতিষ্ঠানের নাম, বাংলাদেশি মোবাইল নম্বর, ইমেইল ঠিকানা ও ফেসবুক পেইজ ইউআরএল।
            </li>
            <li>
              <strong>মেসেঞ্জার অর্ডার তথ্য:</strong> পণ্য ক্রয় প্রক্রিয়ায় গ্রাহকের স্বেচ্ছায় প্রদত্ত পূর্ণ নাম, মোবাইল নম্বর, কুরিয়ার ডেলিভারি ঠিকানা (জেলা ও থানা সহ)।
            </li>
            <li>
              <strong>প্রোডাক্ট ও ক্যাটালগ ডাটা:</strong> বিক্রেতা কর্তৃক আপলোডকৃত পণ্যের বিবরণ, স্টক স্থিতি, ডেলিভারি চার্জ এবং মূল্যতালিকা।
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">
            ৩. তথ্যের ব্যবহার (How We Process Data)
          </h2>
          <p>
            সংগৃহীত তথ্য কেবলমাত্র নিম্নলিখিত উদ্দেশ্যে প্রক্রিয়াজাত করা হয়:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>ফেসবুক মেসেঞ্জারে স্বয়ংক্রিয় বাংলা ও বাংলিশ প্রশ্নোত্তর পরিচালনা।</li>
            <li>ক্যাশ অন ডেলিভারি (COD) পার্সেল প্রেরণের জন্য নির্ভুল অর্ডার রিসিট তৈরি।</li>
            <li>পেইজ অ্যাডমিনদের জন্য ইনবক্স অ্যানালিটিক্স ও সেলস রিপোর্ট প্রদর্শন।</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">
            ৪. মেটা প্ল্যাটফর্ম নীতিমালা ও থার্ড-পার্টি শেয়ারিং (Meta Platform Policies)
          </h2>
          <p>
            {SITE_CONFIG.brandName} মেটার (Meta Platforms, Inc.) অফিসিয়াল ডেভেলপার পলিসি এবং মেসেঞ্জার প্ল্যাটফর্ম গাইডলাইন সম্পূর্ণ অনুসরণ করে। আমরা কোনো তৃতীয় পক্ষের বিজ্ঞাপনী নেটওয়ার্ক বা ডেটা ব্রোকারের কাছে কাস্টমারের তথ্য বিক্রি বা হস্তান্তর করি না।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">
            ৫. যোগাযোগ (Contact Us)
          </h2>
          <p>
            গোপনীয়তা বিষয়ক যেকোনো জিজ্ঞাসা বা পরামর্শের জন্য যোগাযোগ করুন:{' '}
            <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-indigo-400 underline">
              {SITE_CONFIG.supportEmail}
            </a>
            , {SITE_CONFIG.location}।
          </p>
        </section>
      </div>
    </div>
  );
};
