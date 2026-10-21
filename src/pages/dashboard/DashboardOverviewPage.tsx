import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Bot,
  Package,
  Clock,
  Share2,
  AlertCircle,
  ArrowRight,
  Sliders,
  ShoppingBag,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import {
  getProducts,
  getOrders,
  getConversations,
  getAIAgentSettings,
  getSubscription,
} from '../../lib/database-service';

export const DashboardOverviewPage: React.FC = () => {
  const { profile, currentWorkspace } = useAuth();
  const { isBangla } = useLanguage();

  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [totalOrderGmv, setTotalOrderGmv] = useState(0);
  const [conversationCount, setConversationCount] = useState(0);
  const [isAgentActive, setIsAgentActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const displayName = profile?.full_name || 'Merchant';
  const shopName = currentWorkspace?.name || 'My Shop';
  const workspaceId = currentWorkspace?.id || 'default-ws';

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    const [prods, ords, convs, agent] = await Promise.all([
      getProducts(workspaceId),
      getOrders(workspaceId),
      getConversations(workspaceId),
      getAIAgentSettings(workspaceId),
    ]);

    setProductCount(prods.length);
    setOrderCount(ords.length);
    const gmv = ords.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    setTotalOrderGmv(gmv);
    setConversationCount(convs.length);
    setIsAgentActive(agent ? Boolean(agent.enabled) : true);
    setIsLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const stats = [
    {
      titleBn: 'স্বয়ংক্রিয় এআই স্থিতি',
      titleEn: 'AI Agent Status',
      value: isAgentActive ? (isBangla ? 'সক্রিয়' : 'Active') : (isBangla ? 'পজ' : 'Paused'),
      subBn: 'মার্জিন রুলস এনফোর্সড',
      subEn: 'Margin Rules Enforced',
      icon: Bot,
      color: isAgentActive ? 'text-emerald-400' : 'text-amber-400',
    },
    {
      titleBn: 'ক্যাটালগ পণ্য',
      titleEn: 'Catalog Products',
      value: `${productCount}`,
      subBn: 'ডেটাবেজে সংরক্ষিত পণ্য',
      subEn: 'Stored in Database',
      icon: ShoppingBag,
      color: 'text-indigo-400',
    },
    {
      titleBn: 'ক্যাপচারড COD অর্ডার',
      titleEn: 'Captured COD Orders',
      value: `${orderCount}`,
      subBn: `মোট: ৳${totalOrderGmv.toLocaleString()}`,
      subEn: `Total: ৳${totalOrderGmv.toLocaleString()}`,
      icon: Package,
      color: 'text-violet-400',
    },
    {
      titleBn: 'মেসেঞ্জার থ্রেড',
      titleEn: 'Active Conversations',
      value: `${conversationCount}`,
      subBn: '< ০.৫ সে. গড় রেসপন্স',
      subEn: '< 0.5s avg response',
      icon: MessageSquare,
      color: 'text-blue-400',
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {isBangla ? `স্বাগতম, ${displayName}!` : `Welcome back, ${displayName}!`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBangla
              ? `${shopName} এর মাল্টি-টেন্যান্ট সেলস অটোমেশন ড্যাশবোর্ড`
              : `Multi-tenant sales automation dashboard for ${shopName}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/ai-agent"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shadow-md"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isBangla ? 'এআই রুলস কনফিগ' : 'Configure AI Rules'}</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <Card key={i} className="p-5 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium block">
                  {isBangla ? st.titleBn : st.titleEn}
                </span>
                <span className="text-2xl font-extrabold text-white font-mono block">
                  {isLoading ? '...' : st.value}
                </span>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {st.subBn}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0">
                <Icon className={`w-5 h-5 ${st.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Honest Facebook Page Connection Status Card (Never show fake connected accounts) */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-[#131B26] to-[#101722] border-indigo-950/60 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <Share2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isBangla ? 'ফেসবুক পেইজ সংযোগ (ফেজ ৪ রোডম্যাপ)' : 'Facebook Page Connection (Phase 4 Roadmap)'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-medium">
                {isBangla ? 'কানেক্ট করা হয়নি' : 'Not Connected'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {isBangla
                ? 'বর্তমানে কোনো ফেসবুক পেইজ সংযুক্ত নেই। ফেজ ৪ এ মেটার অফিসিয়াল ফেসবুক লগইন ও মেসেঞ্জার এপিআই পারমিশন ডায়ালগের মাধ্যমে পেইজটি নিরাপদভাবে কানেক্ট করা হবে। কোনো ফেক বা ডামি সংযোগ প্রদর্শন করা হচ্ছে না।'
                : 'No Facebook Page is currently connected. Official Meta Graph API integration with secure permissions dialog is scheduled for Phase 4. We never display fake connected accounts.'}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isBangla ? 'জিরো পাসওয়ার্ড নীতি: মেটা অনুমোদিত টোকেন সুরক্ষা' : 'Zero-Password Security: Official Meta Tokens'}</span>
          </div>

          <Link
            to="/dashboard/pages"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            <span>{isBangla ? 'পেইজ সেটআপ বিবরণ দেখুন' : 'View Page Integration Details'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Card>

      {/* Quick Setup Checklist & Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              {isBangla ? 'শপ সেটআপ চেকলিস্ট' : 'Shop Setup Checklist'}
            </h3>
            <span className="text-xs text-indigo-400 font-mono">
              {productCount > 0 ? '3 / 4 Steps' : '2 / 4 Steps'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-200">{isBangla ? '১. শপ প্রোফাইল ও ভাষা নির্বাচন' : '1. Profile & Language'}</span>
              <span className="text-emerald-400 font-semibold">{isBangla ? 'সম্পন্ন' : 'Completed'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-200">{isBangla ? '২. প্রোডাক্ট ক্যাটালগ ও ফ্লোর প্রাইস' : '2. Products & Price Floor'}</span>
              {productCount > 0 ? (
                <span className="text-emerald-400 font-semibold">{isBangla ? 'সক্রিয়' : 'Active'}</span>
              ) : (
                <Link to="/dashboard/products" className="text-indigo-400 hover:underline font-medium">
                  {isBangla ? 'যোগ করুন' : 'Add Products'}
                </Link>
              )}
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-200">{isBangla ? '৩. এআই এজেন্ট ও ডেলিভারি রুলস' : '3. AI Rules & Knowledge Docs'}</span>
              <Link to="/dashboard/ai-agent" className="text-indigo-400 hover:underline font-medium">
                {isBangla ? 'কনফিগার' : 'Configure'}
              </Link>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-200">{isBangla ? '৪. ফেসবুক পেইজ কানেক্ট করুন' : '4. Connect Facebook Page'}</span>
              <span className="text-slate-500 font-medium">Phase 4</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">
            {isBangla ? 'দ্রুত শর্টকাট' : 'Quick Actions'}
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link
              to="/dashboard/products"
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between h-24"
            >
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <span className="font-semibold text-slate-200">{isBangla ? 'ক্যাটালগ পরিচালনা' : 'Catalog'}</span>
            </Link>

            <Link
              to="/dashboard/orders"
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between h-24"
            >
              <Package className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-slate-200">{isBangla ? 'অর্ডার তালিকা' : 'Orders'}</span>
            </Link>

            <Link
              to="/dashboard/inbox"
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between h-24"
            >
              <MessageSquare className="w-5 h-5 text-violet-400" />
              <span className="font-semibold text-slate-200">{isBangla ? 'লাইভ ইনবক্স' : 'Live Inbox'}</span>
            </Link>

            <Link
              to="/dashboard/settings"
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between h-24"
            >
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-slate-200">{isBangla ? 'অ্যাকাউন্ট সেটিংস' : 'Settings'}</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
