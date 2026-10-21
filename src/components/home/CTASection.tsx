import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site';
import { useLanguage } from '../../context/LanguageContext';

export const CTASection: React.FC = () => {
  const { isBangla } = useLanguage();

  return (
    <section className="py-16 lg:py-24 bg-[#0A0E15] relative overflow-hidden border-t border-slate-800">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isBangla ? 'আপনার এফ-কমার্স ব্র্যান্ডের বিকাশ ঘটান' : 'Supercharge Your F-Commerce'}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight [text-wrap:balance]">
          {isBangla
            ? 'ইনবক্সের প্রতিটি ইনকোয়ারিকে সফল বিক্রিতে রূপান্তর করুন'
            : 'Convert Every Late-Night Facebook Message Into a Confirmed Order'}
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed [text-wrap:balance]">
          {isBangla
            ? 'কাস্টমার অপেক্ষায় থাকবে না। বংগোসেল এআই এর সাথে যুক্ত হয়ে আপনার মেসেঞ্জার ইনবক্সকে বানিয়ে তুলুন একটি স্বয়ংক্রিয় সেলস মেশিন।'
            : 'No more waiting customers or missed sales. Empower your Facebook page with intelligent 24/7 Bangla & Banglish automation.'}
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm sm:text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition-all whitespace-nowrap"
          >
            <span>{isBangla ? 'বিনামূল্যে ট্রায়াল শুরু করুন' : 'Start 14-Day Free Trial'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/features"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm sm:text-base font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>{isBangla ? 'ফিচার ডিটেইলস দেখুন' : 'Explore Feature Details'}</span>
          </Link>
        </div>

        <p className="text-xs text-slate-400 pt-2">
          {isBangla
            ? 'ফেজ ১ প্রিভিউ ইন্টারফেস · মেটা এপিআই ইন্টিগ্রেশন ফেজ ২ এ আসছে · কোনো অগ্রিম পেমেন্টের ঝামেলা নেই'
            : 'Phase 1 UI Architecture · Meta Graph API integration launching in Phase 2 · Zero risk'}
        </p>
      </div>
    </section>
  );
};
