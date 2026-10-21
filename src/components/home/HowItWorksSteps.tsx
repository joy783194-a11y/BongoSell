import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Share2, Database, Rocket, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site';
import { useLanguage } from '../../context/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import { Card } from '../common/Card';

const stepIcons = [UserPlus, Share2, Database, Rocket];

export const HowItWorksSteps: React.FC = () => {
  const { isBangla } = useLanguage();

  return (
    <section className="py-16 lg:py-24 bg-[#0A0E15] border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker={isBangla ? 'অনবোর্ডিং প্রক্রিয়া' : 'Onboarding Workflow'}
          title={
            isBangla
              ? 'মাত্র ৪টি ধাপে আপনার পেইজের ইনবক্স অটোমেশন শুরু করুন'
              : 'Launch 24/7 Automated Selling in Four Simple Steps'
          }
          subtitle={
            isBangla
              ? 'কোনো জটিল কোডিং বা টেকনিক্যাল দক্ষতার প্রয়োজন নেই। সহজ ইন্টারফেসে আপনার শপ সাজান।'
              : 'No programming or complex setup required. Built for busy online shop owners.'
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SITE_CONFIG.howItWorksSteps.map((step, idx) => {
            const Icon = stepIcons[idx] || UserPlus;
            const isPhase2 = step.status === 'meta_integration_phase2';

            return (
              <Card key={step.step} className="relative flex flex-col justify-between">
                <div>
                  {/* Step Number & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold text-indigo-400 font-mono">
                      0{step.step}
                    </span>
                    <div
                      className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                        isPhase2
                          ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                          : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                      }`}
                    >
                      {isBangla ? step.badgeLabelBn : step.badgeLabel}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-200 mb-4 border border-slate-700/80">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">
                    {isBangla ? step.titleBn : step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                    {isBangla ? step.descriptionBn : step.description}
                  </p>
                </div>

                {/* Status info */}
                <div className="pt-3 border-t border-slate-800/80 text-[11px]">
                  {isPhase2 ? (
                    <span className="flex items-center gap-1.5 text-amber-300/90 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {isBangla
                        ? 'মেটা অফিশিয়াল এপিআই (ফেজ ২ এ চালু হবে)'
                        : 'Meta Graph API (Scheduled for Phase 2)'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {isBangla ? 'ফেজ ১ এ কনফিগারেশন রেডি' : 'Config Engine Available Now'}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/how-it-works"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>{isBangla ? 'বিস্তারিত অনবোর্ডিং গাইড ও আর্কিটেকচার দেখুন' : 'View Full Onboarding Walkthrough & Architecture'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
