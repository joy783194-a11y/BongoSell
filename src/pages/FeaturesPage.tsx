import React, { useState } from 'react';
import {
  MessageSquareText,
  Layers,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
  BarChart3,
  Sliders,
  Check,
  AlertTriangle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../config/site';
import { useLanguage } from '../context/LanguageContext';
import { SectionHeading } from '../components/common/SectionHeading';
import { Card } from '../components/common/Card';

export const FeaturesPage: React.FC = () => {
  const { isBangla } = useLanguage();

  // Interactive Pricing Guardrail Simulator State
  const [productBasePrice, setProductBasePrice] = useState(2500);
  const [minSellingPrice, setMinSellingPrice] = useState(2200);
  const [allowBargaining, setAllowBargaining] = useState(true);
  const [bargainOffer, setBargainOffer] = useState(1900);

  // Compute simulator outcome
  const getSimulatedOutcome = () => {
    if (!allowBargaining) {
      return {
        accepted: false,
        message: `ফিক্সড প্রাইস পলিসি: "আন্তরিকভাবে দুঃখিত, আমাদের এই প্রোডাক্টটি ফিক্সড প্রাইস ৳${productBasePrice} টাকায় বিক্রি হয়।"`,
        status: 'fixed_refusal',
      };
    }
    if (bargainOffer >= minSellingPrice) {
      return {
        accepted: true,
        message: `অফার অনুমোদিত: "আমরা আপনাকে বিশেষ বিবেচনায় ৳${bargainOffer} টাকায় দিতে পারব! ঢাকার ভেতরে ডেলিভারি চার্জ মাত্র ৭০ টাকা।"`,
        status: 'approved',
      };
    }
    return {
      accepted: false,
      message: `সীমা রক্ষা: "দুঃখিত, ৳${bargainOffer} টাকায় দেয়া সম্ভব নয়। আমরা সর্বনিম্ন ৳${minSellingPrice} টাকা পর্যন্ত রাখতে পারব।"`,
      status: 'counter_offer',
    };
  };

  const outcome = getSimulatedOutcome();

  return (
    <div className="py-12 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isBangla ? 'ফিচার বিশ্লেষণ' : 'Deep Feature Breakdown'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight [text-wrap:balance]">
          {isBangla
            ? 'এফ-কমার্স ব্যবসার জটিলতা সহজ করার স্বয়ংক্রিয় সমাধান'
            : 'Every Tool Needed to Run a Facebook Sales Powerhouse'}
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed [text-wrap:balance]">
          {isBangla
            ? 'স্বাভাবিক বাংলা ও বাংলিশ চ্যাট, সেলার-নির্ধারিত মার্জিন সিকিউরিটি এবং ১০০% নির্ভুল ক্যাশ-অন-ডেলিভারি অর্ডার কালেকশন।'
            : 'Explore the full capabilities powering intelligent conversational commerce for Bangladeshi retailers.'}
        </p>
      </div>

      {/* Feature 1: Interactive Pricing Guardrail Simulator (Highlighted Marquee) */}
      <div className="bg-[#131B26] border border-indigo-500/40 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>{isBangla ? 'লাইভ ফিচার সিমুলেটর' : 'Interactive Feature Simulator'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
              {isBangla
                ? 'সেলার প্রাইস ও ডিসকাউন্ট গার্ডরেল'
                : 'Seller Pricing & Discount Guardrails'}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isBangla
                ? 'বাংলাদেশের কাস্টমাররা ইনবক্সে দামাদামি পছন্দ করেন। সাধারণ চ্যাটবট এখানে আটকে যায় বা অনির্দিষ্ট ডিসকাউন্ট দিয়ে সেলারের ক্ষতি করে। বংগোসেল এআই এ আপনি সর্বনিম্ন ফ্লোর প্রাইস লক করে রাখতে পারেন।'
                : 'Bengali shoppers love to negotiate prices in Messenger. Generic bots either get confused or discount too aggressively. BongoSell AI strictly enforces your minimum profit margins.'}
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isBangla ? 'কাস্টম ফ্লোর প্রাইস সীমার নিচে নামবে না' : 'Enforces strict floor price boundary'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isBangla ? 'ফিক্সড প্রাইস পণ্যে সরাসরি সম্মানজনক প্রত্যাখ্যান' : 'Polite refusal on strict fixed-price goods'}</span>
              </div>
            </div>
          </div>

          {/* Interactive Controls & Output Box */}
          <div className="lg:col-span-7 bg-[#0E1520] p-6 rounded-xl border border-slate-700/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-400" />
                {isBangla ? 'রুল কন্ট্রোল প্যানেল' : 'Seller Rule Simulation'}
              </span>
              <span className="text-[11px] text-indigo-400 font-mono">
                {isBangla ? 'টেস্ট ভ্যালু পরিবর্তন করুন' : 'Adjust sliders to test'}
              </span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Product Original Price */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{isBangla ? 'পণ্যের মূল দাম (MRP):' : 'Original Product Price:'}</span>
                  <span className="font-mono font-bold text-white">৳{productBasePrice}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="5000"
                  step="100"
                  value={productBasePrice}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setProductBasePrice(val);
                    if (minSellingPrice > val) setMinSellingPrice(val);
                  }}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Minimum Allowed Price */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{isBangla ? 'আপনার অনুমোদিত সর্বনিম্ন দাম (ফ্লোর প্রাইস):' : 'Seller Minimum Allowed Floor Price:'}</span>
                  <span className="font-mono font-bold text-emerald-400">৳{minSellingPrice}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max={productBasePrice}
                  step="50"
                  value={minSellingPrice}
                  onChange={(e) => setMinSellingPrice(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Customer Bargain Offer */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{isBangla ? 'কাস্টমারের প্রস্তাবিত দর (Customer Offer):' : 'Simulated Customer Offer:'}</span>
                  <span className="font-mono font-bold text-amber-300">৳{bargainOffer}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="4000"
                  step="50"
                  value={bargainOffer}
                  onChange={(e) => setBargainOffer(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Simulated AI Decision Box */}
            <div className="pt-4 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-2">
                {isBangla ? 'এআই স্বয়ংক্রিয় সিদ্ধান্ত ও মেসেঞ্জার রিপ্লাই:' : 'Simulated AI Response in Messenger:'}
              </span>
              <div
                className={`p-3.5 rounded-lg border text-xs sm:text-sm leading-relaxed ${
                  outcome.status === 'approved'
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                    : outcome.status === 'counter_offer'
                    ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                    : 'bg-indigo-950/30 border-indigo-800/60 text-indigo-200'
                }`}
              >
                <p className="font-sans">{outcome.message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of the 6 detailed features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SITE_CONFIG.featuresList.map((feat) => {
          return (
            <Card key={feat.id} className="flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {isBangla ? feat.titleBn : feat.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {isBangla ? feat.descriptionBn : feat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-indigo-300 font-medium">
                {isBangla ? feat.highlightBn : feat.highlight}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pre-launch / Phase 1 Notice Box */}
      <div className="p-6 rounded-2xl bg-[#0E1520] border border-slate-800 text-slate-300 space-y-3 max-w-4xl mx-auto text-left">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>{isBangla ? 'ফেজ ১ আর্কিটেকচার প্রিভিউ নোট' : 'Phase 1 Technical Architecture Note'}</span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-slate-400">
          {isBangla
            ? 'বর্তমান ফেজ ১ ইন্টারফেসে এআই রুল ইঞ্জিন, বাংলা/বাংলিশ টেক্সট প্রসেসিং সিমুলেশন এবং অর্ডার ফরম্যাটিং সম্পূর্ণ কার্যকর রয়েছে। মেটা গ্রাফ এপিআই (ফেসবুক পেইজ রিয়েল কানেকশন) এবং স্থানীয় কুরিয়ার এপিআই হুকসমূহ ফেজ ২ ডেভলপমেন্টে যুক্ত করা হবে।'
            : 'In this Phase 1 release, the pricing rule simulator, colloquial NLP tokenizer preview, and structured order generator are fully implemented in the frontend. Official Meta Graph webhooks and courier logistics webhooks will connect in Phase 2.'}
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8">
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg"
        >
          <span>{isBangla ? 'আপনার পেইজের জন্য শুরু করুন' : 'Get Started with BongoSell AI'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
