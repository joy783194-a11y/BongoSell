import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Check, Sparkles, ArrowRight, Download, Info, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { SITE_CONFIG } from '../../config/site';
import { getSubscription, getUsageEvents } from '../../lib/database-service';
import { DatabaseSubscription, DatabaseUsageEvent } from '../../lib/supabase';

export const DashboardBillingPage: React.FC = () => {
  const { currentWorkspace } = useAuth();
  const { isBangla } = useLanguage();

  const [subscription, setSubscription] = useState<DatabaseSubscription | null>(null);
  const [usageEvents, setUsageEvents] = useState<DatabaseUsageEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const workspaceId = currentWorkspace?.id || 'default-ws';

  const loadBillingData = useCallback(async () => {
    setIsLoading(true);
    const [sub, events] = await Promise.all([
      getSubscription(workspaceId),
      getUsageEvents(workspaceId),
    ]);
    setSubscription(sub);
    setUsageEvents(events);
    setIsLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  // Aggregate message usage from events
  const totalMessagesUsed = usageEvents
    .filter((e) => e.event_type === 'message_processed')
    .reduce((sum, e) => sum + e.quantity, 0);

  const planTier = subscription?.plan_code || 'starter';
  const planConfig =
    SITE_CONFIG.pricingPlans.find((p) => p.id === planTier) || SITE_CONFIG.pricingPlans[0];
  const messageLimit =
    parseInt(planConfig.limits.conversationsPerMonth.replace(/[^0-9]/g, ''), 10) || 1000;
  const usagePercent = Math.min(100, Math.round((totalMessagesUsed / messageLimit) * 100));

  const trialEndDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'In 14 Days';

  return (
    <div className="space-y-6 text-left max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {isBangla ? 'বিলিং ও সাবস্ক্রিপশন প্ল্যান' : 'Billing & Subscription'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {isBangla
            ? 'আপনার বর্তমান প্ল্যান, মাসিক চ্যাট ব্যবহারের হিসাব এবং ইনভয়েস হিস্ট্রি'
            : 'Multi-tenant subscription tier, quota tracking, and billing receipts'}
        </p>
      </div>

      {/* Active Plan Card */}
      <Card className="p-6 sm:p-8 bg-[#162130] border-indigo-500/50 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>{isBangla ? 'বর্তমান প্ল্যান' : 'Current Active Tier'}</span>
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-0.5">
              {isBangla ? planConfig.nameBn : planConfig.name}{' '}
              <span className="text-xs font-normal text-slate-400">
                ({subscription?.status === 'trial' ? (isBangla ? '১৪ দিনের ফ্রি ট্রায়াল' : '14-Day Free Trial') : 'Active'})
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isBangla
                ? `ট্রায়ালের মেয়াদ শেষ হবে: ${trialEndDate} তারিখে`
                : `Trial period expires on: ${trialEndDate}`}
            </p>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-3xl font-black text-white font-mono">
              ৳{planConfig.priceMonthly.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">/{isBangla ? 'মাসিক' : 'mo'}</span>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between font-medium">
            <span className="text-slate-300">
              {isBangla ? 'মাসিক এআই কথোপকথন ব্যবহার কোটা:' : 'Monthly AI Conversation Usage:'}
            </span>
            <span className="text-indigo-400 font-mono font-semibold">
              {totalMessagesUsed.toLocaleString()} / {messageLimit.toLocaleString()} ({usagePercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, usagePercent)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>
              {isBangla
                ? 'চ্যাট লিমিট শেষ হলেও সেবা বন্ধ হবে না; অটোমেটিক অ্যাড-অন টপআপ যুক্ত হবে।'
                : 'Service is never abruptly cut off. Add-on topups available when needed.'}
            </span>
            <span className="font-mono text-slate-500">PostgreSQL Quotas</span>
          </p>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            to="/pricing"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md inline-flex items-center gap-1.5"
          >
            <span>{isBangla ? 'প্ল্যান আপগ্রেড করুন' : 'Upgrade Plan'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Card>

      {/* Plan Features Included */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-white text-sm">
          {isBangla ? 'আপনার প্ল্যানে অন্তর্ভুক্ত সুবিধাসমূহ' : 'Included in Your Subscription'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {(isBangla ? planConfig.featuresBn : planConfig.features).map((featText: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{featText}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Invoice Receipts Table */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-white text-sm">
          {isBangla ? 'পেমেন্ট ও ইনভয়েস রেকর্ড' : 'Billing & Payment Receipts'}
        </h3>

        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            {isBangla
              ? 'বর্তমানে ১৪ দিনের ট্রায়াল সক্রিয় রয়েছে। বিকাশ ও নগদ পেমেন্ট সফলভাবে সম্পন্ন হওয়ার পর অফিসিয়াল ভ্যাট চালান ও ইনভয়েস ডাউনলোড করা যাবে।'
              : 'Trial mode active. Local payment gateways (bKash/Nagad) connect for automated VAT receipts.'}
          </span>
        </div>
      </Card>
    </div>
  );
};
