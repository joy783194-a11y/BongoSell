import React from 'react';
import { AlertTriangle, FileCheck, CheckCircle } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';
import { useLanguage } from '../context/LanguageContext';

export const TermsPage: React.FC = () => {
  const { isBangla } = useLanguage();

  return (
    <div className="py-12 lg:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
      {/* Legal Draft Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            {isBangla
              ? 'খসড়া সংস্করণ · বাণিজ্যিক লঞ্চের পূর্বে আইনজ্ঞদের দ্বারা পর্যালোচনার জন্য চিহ্নিত'
              : 'Draft Template · Subject to Legal Review Prior to Commercial Launch'}
          </p>
          <p className="text-xs text-amber-300/80 leading-relaxed">
            {isBangla
              ? 'এই ব্যবহারের শর্তাবলী একটি অপারেশনাল কাঠামোর প্রাথমিক রূপরেখা। এটি কোনো চূড়ান্ত আইনি পরামর্শ বা চূড়ান্ত চুক্তি হিসেবে গণ্য নয়।'
              : 'This document represents an operational draft template for architectural evaluation and must be vetted by licensed legal counsel prior to formal rollout.'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          {isBangla ? 'সেবা ব্যবহারের নীতিমালা' : 'Terms & Conditions'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {isBangla ? 'ব্যবহারের শর্তাবলী (খসড়া)' : 'Terms of Service (Draft)'}
        </h1>
        <p className="text-xs text-slate-400">
          Last revised: October 2026 · Phase 1 Architecture Reference
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#131B26] p-6 sm:p-10 rounded-2xl border border-slate-800">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">
            ১. সাধারণ শর্তাবলী (General Terms)
          </h2>
          <p>
            {SITE_CONFIG.brandName} প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি এই খসড়া শর্তাবলী মেনে চলার সম্মতি প্রকাশ করছেন। আমাদের সেবাটি বাংলাদেশি অনলাইন ব্যবসায়ী ও এফ-কমার্স উদ্যোক্তাদের ফেসবুক মেসেঞ্জারে স্বয়ংক্রিয় গ্রাহক সেবা ও বিক্রয় বৃদ্ধিতে সহায়তা করতে নির্মিত।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">
            ২. বিক্রেতার দায়িত্ব ও ক্যাটালগ রুলস (Merchant Obligations)
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              বিক্রেতা তার আপলোডকৃত সকল প্রোডাক্টের বর্ণনা, সত্যতা, মূল্য এবং ওয়ারেন্টির তথ্যের জন্য এককভাবে দায়বদ্ধ থাকবেন।
            </li>
            <li>
              এআই চ্যাটবট বিক্রেতা কর্তৃক নির্ধারিত সর্বনিম্ন মূল্য (Floor Price) ও ডেলিভারি চার্জের নিয়ম অক্ষরে অক্ষরে অনুসরণ করবে।
            </li>
            <li>
              বাংলাদেশে প্রচলিত আইন অনুযায়ী কোনো নিষিদ্ধ, জাল, চোরাই বা ক্ষতিকর পণ্য বিক্রয়ে এই প্ল্যাটফর্ম ব্যবহার করা সম্পূর্ণ নিষিদ্ধ।
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">
            ৩. সাবস্ক্রিপশন ও বিলিং (Subscription & Billing)
          </h2>
          <p>
            প্ল্যাটফর্মটি মাসিক ও বার্ষিক সাবস্ক্রিপশন মডেলে পরিচালিত হবে। প্রাথমিক প্ল্যানের মূল্যতালিকা (স্টার্টার ৳৯৯৯/মাস, গ্রোথ ৳২৪৯৯/মাস, বিজনেস প্রো ৳৪৯৯৯/মাস) কনফিগারযোগ্য এবং বাণিজ্যিক উদ্বোধনের পূর্বে চূড়ান্ত ঘোষণা করা হবে। ফেজ ১ প্রিভিউতে কোনো ব্যাংক একাউন্ট বা মোবাইল ওয়ালেট চার্জ করা হবে না।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">
            ৪. ফেজ ১ প্রযুক্তিগত পরিধি (Phase 1 Scope & Limitation)
          </h2>
          <p>
            বর্তমান প্রকাশনাটি প্রোডাক্টের ডিজাইন, ফ্রন্টএন্ড আর্কিটেকচার, বাংলা চ্যাট সিমুলেশন এবং ইন্টারঅ্যাকশন ভেরিফিকেশনের জন্য উন্মুক্ত। মেটা ফেসবুক মেসেঞ্জার সরাসরি ওয়েববুক কানেকশন এবং স্বয়ংক্রিয় পেমেন্ট সার্ভিস ফেজ ২ রিলিজের অন্তর্ভুক্ত থাকবে।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">
            ৫. যোগাযোগ ও অভিযোগ নিষ্পত্তি (Inquiries & Support)
          </h2>
          <p>
            সেবার যেকোনো শর্ত সংক্রান্ত প্রশ্ন বা সহযোগিতার জন্য যোগাযোগ করুন:{' '}
            <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-indigo-400 underline">
              {SITE_CONFIG.supportEmail}
            </a>
            ।
          </p>
        </section>
      </div>
    </div>
  );
};
