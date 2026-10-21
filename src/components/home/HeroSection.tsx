import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site';
import { useLanguage } from '../../context/LanguageContext';
import { MessengerDemo } from './MessengerDemo';

export const HeroSection: React.FC = () => {
  const { isBangla } = useLanguage();

  const scrollToDemo = () => {
    const el = document.getElementById('demo-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
      {/* Subtle backdrop ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[130px] pointer-events-none rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Category / Context Lead-in (Zero-Pill, Clean Typography) */}
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <span>{isBangla ? 'বাংলাদেশী এফ-কমার্স অটোমেশন প্ল্যাটফর্ম' : 'F-Commerce AI Sales Platform'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400 font-normal">
                {isBangla ? 'ফেজ ১ প্রিভিউ' : 'Phase 1 Preview'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.18] [text-wrap:balance]">
              {isBangla ? (
                <>
                  আপনার <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-300">Facebook Inbox</span> সামলাবে AI, আপনি বাড়াবেন বিক্রি
                </>
              ) : (
                <>
                  AI Handles Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-300">Facebook Inbox</span> While You Scale Sales
                </>
              )}
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              {isBangla
                ? 'মেসেঞ্জারে ক্রেতাদের বাংলা ও বাংলিশ প্রশ্নের ইনস্ট্যান্ট উত্তর দিন, পণ্যের সাইজ ও দাম বুঝিয়ে বলুন এবং স্বয়ংক্রিয়ভাবে নির্ভুল ডেলিভারি ঠিকানা সংগ্রহ করুন—দিনরাত ২৪ ঘণ্টা।'
                : 'Instantly reply to customer inquiries in natural Bangla and Banglish, answer pricing and stock questions accurately, and collect complete cash-on-delivery order details 24/7.'}
            </p>

            {/* Concrete Value Highlights */}
            <div className="pt-1 flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isBangla ? 'ন্যাচারাল বাংলা ও বাংলিশ' : 'Colloquial Bangla/Banglish'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isBangla ? 'সেলার প্রাইসিং গার্ডরেল' : 'Strict Seller Pricing Rules'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isBangla ? 'হিউম্যান টেকওভার অপশন' : 'Instant Admin Takeover'}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition-all duration-150 whitespace-nowrap"
              >
                <span>{isBangla ? 'ফ্রি শুরু করুন' : 'Start Free Trial'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={scrollToDemo}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 transition-colors duration-150 whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                <span>{isBangla ? 'ডেমো দেখুন' : 'Explore Live Demo'}</span>
              </button>
            </div>

            {/* Disclaimer text */}
            <p className="text-[12px] text-slate-400">
              {isBangla
                ? 'কার্ডের প্রয়োজন নেই · সেটআপ করতে মাত্র ২ মিনিট · ফেজ ১ প্রিভিউ'
                : 'No credit card required · 2-minute quick setup · Phase 1 preview'}
            </p>
          </div>

          {/* Right Column: Messenger Conversation Mockup */}
          <div id="demo-section" className="lg:col-span-6 w-full flex justify-center">
            <MessengerDemo />
          </div>
        </div>
      </div>
    </section>
  );
};
