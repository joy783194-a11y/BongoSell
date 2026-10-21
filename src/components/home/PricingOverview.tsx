import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Info, ArrowRight } from 'lucide-react';
import { SITE_CONFIG, PricingPlan } from '../../config/site';
import { useLanguage } from '../../context/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import { Card } from '../common/Card';

export const PricingOverview: React.FC = () => {
  const { isBangla } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        kicker={isBangla ? 'সাবস্ক্রিপশন প্ল্যান' : 'Pricing & Plans'}
        title={
          isBangla
            ? 'আপনার শপের সাইজ অনুযায়ী সহজ ও স্বচ্ছ মূল্যতালিকা'
            : 'Predictable Monthly Pricing in Bangladeshi Taka'
        }
        subtitle={
          isBangla
            ? 'কোনো গোপন চার্জ নেই। যেকোনো সময় প্ল্যান পরিবর্তন অথবা বাতিল করার সুবিধা।'
            : 'Transparent subscription tiers. No setup fees or hidden percentage deductions from your sales.'
        }
      />

      {/* Monthly / Annual Billing Selector UI */}
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="inline-flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isBangla ? 'মাসিক বিলিং' : 'Monthly Billing'}
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              billingCycle === 'annual'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isBangla ? 'বার্ষিক বিলিং (১৫% সেভ)' : 'Annual Billing (Save ~15%)'}
          </button>
        </div>

        {/* Clear disclaimer */}
        <p className="mt-2.5 text-xs text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>
            {isBangla
              ? 'লঞ্চের পূর্বে চূড়ান্ত প্ল্যান ও ফিচারের সীমা নিশ্চিত করা হবে। ফেজ ১ এ কোনো চার্জ কাটা হবে না।'
              : 'Final plan limits and features will be confirmed prior to public launch. No charges during Phase 1.'}
          </span>
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {SITE_CONFIG.pricingPlans.map((plan: PricingPlan) => {
          const currentPrice =
            billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual;

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col justify-between ${
                plan.popular
                  ? 'border-indigo-500 shadow-xl shadow-indigo-950/40 bg-[#162130]'
                  : 'bg-[#131B26]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm tracking-wide uppercase">
                  {isBangla ? 'সবচেয়ে জনপ্রিয়' : 'Most Popular'}
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="border-b border-slate-800 pb-5 mb-5">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {isBangla ? plan.nameBn : plan.name}
                  </h3>
                  <p className="text-xs text-slate-400 min-h-[32px]">
                    {isBangla ? plan.taglineBn : plan.tagline}
                  </p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                      {SITE_CONFIG.currencySymbol}
                      {currentPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">
                      /{isBangla ? 'প্রতি মাস' : 'month'}
                    </span>
                  </div>
                  {billingCycle === 'annual' && (
                    <span className="text-[11px] text-indigo-400 block mt-1">
                      {isBangla ? 'বার্ষিক হিসেবে বিল হবে' : 'Billed annually'}
                    </span>
                  )}
                </div>

                {/* Usage Limits */}
                <div className="mb-5 space-y-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isBangla ? 'মাসিক মেসেজ লিমিট:' : 'Chat Volume:'}</span>
                    <span className="font-semibold text-white">{plan.limits.conversationsPerMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isBangla ? 'ক্যাটালগ প্রোডাক্ট:' : 'Catalog:'}</span>
                    <span className="font-semibold text-white">{plan.limits.productsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isBangla ? 'ফেসবুক পেইজ:' : 'FB Pages:'}</span>
                    <span className="font-semibold text-white">{plan.limits.facebookPages} টি</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-6 text-xs sm:text-sm text-slate-300">
                  {(isBangla ? plan.featuresBn : plan.features).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-800">
                <Link
                  to={`/signup?plan=${plan.id}`}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                  }`}
                >
                  <span>{isBangla ? plan.ctaTextBn : plan.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Link
          to="/pricing"
          className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1.5"
        >
          <span>{isBangla ? 'পূর্ণাঙ্গ ফিচার তুলনা ও লিমিট ডিটেইলস দেখুন' : 'Compare Full Feature Matrix & Limits'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};
