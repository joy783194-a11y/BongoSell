import React, { useState } from 'react';
import { Check, X, Info, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG, PricingPlan } from '../config/site';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components/common/Card';

export const PricingPage: React.FC = () => {
  const { isBangla } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const comparisonFeatures = [
    {
      categoryBn: 'কোর ক্যাপাসিটি ও ভলিউম',
      categoryEn: 'Core Volume & Limits',
      items: [
        {
          nameBn: 'মাসিক চ্যাট ভলিউম',
          nameEn: 'Monthly Conversation Limit',
          starter: '১,০০০ চ্যাট',
          growth: '৫,০০০ চ্যাট',
          business: '১৫,০০০ চ্যাট',
        },
        {
          nameBn: 'প্রোডাক্ট ক্যাটালগ সাইজ',
          nameEn: 'Product Catalog Capacity',
          starter: '৫০ টি',
          growth: '২৫০ টি',
          business: 'আনলিমিটেড',
        },
        {
          nameBn: 'ফেসবুক পেইজ কানেকশন',
          nameEn: 'Connected Facebook Pages',
          starter: '১ টি',
          growth: '২ টি',
          business: '৫ টি',
        },
        {
          nameBn: 'টিম মেম্বার / অ্যাডমিন রোল',
          nameEn: 'Admin & Staff Seats',
          starter: '১ জন',
          growth: '৩ জন',
          business: '১০ জন',
        },
        {
          nameBn: 'রেসপন্স স্পিড',
          nameEn: 'Average Response Speed',
          starter: '< ১ সেকেন্ড',
          growth: '< ০.৫ সেকেন্ড',
          business: '< ০.৩ সেকেন্ড (হাই প্রায়োরিটি)',
        },
      ],
    },
    {
      categoryBn: 'এআই ও সেলস ফিচারস',
      categoryEn: 'AI & Sales Automation',
      items: [
        {
          nameBn: 'বাংলা ও বাংলিশ ন্যাচারাল এনএলপি',
          nameEn: 'Bangla & Banglish NLP Understanding',
          starter: true,
          growth: true,
          business: true,
        },
        {
          nameBn: 'প্রোডাক্ট স্টক ও ভ্যারিয়েন্ট প্রশ্নোত্তর',
          nameEn: 'Product & Variant QA',
          starter: true,
          growth: true,
          business: true,
        },
        {
          nameBn: 'সেলার ডিসকাউন্ট লিমিট ও প্রাইস রুল',
          nameEn: 'Seller Floor Pricing & Bargain Rules',
          starter: 'বেসিক ফিক্সড',
          growth: 'কাস্টম ফ্লোর রুল',
          business: 'ডায়নামিক এআই গার্ডরেল',
        },
        {
          nameBn: 'স্বয়ংক্রিয় ক্যাশ অন ডেলিভারি অর্ডার কালেকশন',
          nameEn: 'Automated COD Order Intake',
          starter: true,
          growth: true,
          business: true,
        },
        {
          nameBn: 'পাঠাও ও রেডএক্স ডেলিভারি চার্জ ক্যালকুলেটর',
          nameEn: 'Courier Delivery Charge Estimator',
          starter: false,
          growth: true,
          business: true,
        },
        {
          nameBn: 'ফেসবুক লাইভ সেলস হাই কনকারেন্সি মোড',
          nameEn: 'High-Concurrency Live Stream Mode',
          starter: false,
          growth: false,
          business: true,
        },
      ],
    },
    {
      categoryBn: 'সাপোর্ট ও ম্যানেজমেন্ট',
      categoryEn: 'Support & Management',
      items: [
        {
          nameBn: 'হিউম্যান অ্যাডমিন টেকওভার মোড',
          nameEn: 'Live Human Admin Takeover Switch',
          starter: true,
          growth: true,
          business: true,
        },
        {
          nameBn: 'জরুরি অর্ডারের জন্য হোয়াটসঅ্যাপ অ্যালার্ট',
          nameEn: 'Urgent Inquiries WhatsApp Alerts',
          starter: false,
          growth: true,
          business: true,
        },
        {
          nameBn: 'গ্রাহক সেবা সাপোর্ট চ্যানেল',
          nameEn: 'Dedicated Support Channel',
          starter: 'ইমেইল সাপোর্ট',
          growth: 'প্রায়োরিটি চ্যাট ও কল',
          business: 'ডেডিকেটেড অ্যাকাউন্ট ম্যানেজার',
        },
      ],
    },
  ];

  return (
    <div className="py-12 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isBangla ? 'স্বচ্ছ মূল্যতালিকা' : 'Transparent Pricing'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight [text-wrap:balance]">
          {isBangla
            ? 'আপনার শপের ভলিউম অনুযায়ী সঠিক প্ল্যান বেছে নিন'
            : 'Plans Tailored for Emerging to Enterprise F-Commerce'}
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed [text-wrap:balance]">
          {isBangla
            ? 'কোনো জটিলতা বা হিডেন ফি নেই। বাংলাদেশি টাকায় নির্দিষ্ট মাসিক পেমেন্ট।'
            : 'Configurable monthly tiers in Bangladeshi Taka with zero hidden transaction commissions.'}
        </p>

        {/* Monthly / Annual toggle */}
        <div className="pt-4 flex flex-col items-center justify-center">
          <div className="inline-flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isBangla ? 'মাসিক বিলিং' : 'Monthly Billing'}
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isBangla ? 'বার্ষিক বিলিং (১৫% সাশ্রয়)' : 'Annual Billing (Save ~15%)'}
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>
              {isBangla
                ? 'লঞ্চের আগে প্ল্যান সীমা ও ফিচারসমূহ কনফিগারযোগ্য। ফেজ ১ এ কোনো পেমেন্ট কাটা হবে না।'
                : 'Final plan limits and features will be confirmed before launch. Configurable demo data.'}
            </span>
          </p>
        </div>
      </div>

      {/* Top 3 Plan Cards */}
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
                <h3 className="text-xl font-bold text-white mb-1">
                  {isBangla ? plan.nameBn : plan.name}
                </h3>
                <p className="text-xs text-slate-400 min-h-[32px]">
                  {isBangla ? plan.taglineBn : plan.tagline}
                </p>

                <div className="mt-4 flex items-baseline gap-1 border-b border-slate-800 pb-5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                    {SITE_CONFIG.currencySymbol}
                    {currentPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">
                    /{isBangla ? 'প্রতি মাস' : 'month'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 mb-5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isBangla ? 'চ্যাট সীমা:' : 'Chat Volume:'}</span>
                    <span className="font-semibold text-white">{plan.limits.conversationsPerMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isBangla ? 'ক্যাটালগ:' : 'Catalog:'}</span>
                    <span className="font-semibold text-white">{plan.limits.productsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isBangla ? 'ফেসবুক পেইজ:' : 'FB Pages:'}</span>
                    <span className="font-semibold text-white">{plan.limits.facebookPages} টি</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 mb-6">
                  {(isBangla ? plan.featuresBn : plan.features).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <Link
                  to={`/signup?plan=${plan.id}`}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
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

      {/* Full Feature Comparison Matrix */}
      <div className="mt-16 bg-[#131B26] border border-slate-800 rounded-2xl p-6 sm:p-8">
        <h3 className="text-xl font-bold text-white mb-6 text-left">
          {isBangla ? 'বিস্তারিত ফিচার তুলনা ম্যাট্রিক্স' : 'Full Feature Comparison Matrix'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-3 px-4 w-2/5">{isBangla ? 'ফিচার' : 'Feature'}</th>
                <th className="py-3 px-4 text-center">{isBangla ? 'স্টার্টার' : 'Starter'}</th>
                <th className="py-3 px-4 text-center text-indigo-400 font-bold">{isBangla ? 'গ্রোথ (জনপ্রিয়)' : 'Growth (Popular)'}</th>
                <th className="py-3 px-4 text-center">{isBangla ? 'বিজনেস প্রো' : 'Business Pro'}</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((sec, sIdx) => (
                <React.Fragment key={sIdx}>
                  <tr className="bg-slate-900/80">
                    <td colSpan={4} className="py-2.5 px-4 font-bold text-indigo-300 text-xs uppercase tracking-wider">
                      {isBangla ? sec.categoryBn : sec.categoryEn}
                    </td>
                  </tr>

                  {sec.items.map((item, iIdx) => (
                    <tr key={iIdx} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {isBangla ? item.nameBn : item.nameEn}
                      </td>

                      <td className="py-3.5 px-4 text-center text-slate-300">
                        {typeof item.starter === 'boolean' ? (
                          item.starter ? (
                            <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-500 mx-auto" />
                          )
                        ) : (
                          item.starter
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center font-medium text-slate-200 bg-indigo-950/20">
                        {typeof item.growth === 'boolean' ? (
                          item.growth ? (
                            <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-500 mx-auto" />
                          )
                        ) : (
                          item.growth
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center text-slate-300">
                        {typeof item.business === 'boolean' ? (
                          item.business ? (
                            <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-500 mx-auto" />
                          )
                        ) : (
                          item.business
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
