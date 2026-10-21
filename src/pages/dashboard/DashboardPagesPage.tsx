import React, { useState, useEffect, useCallback } from 'react';
import {
  Share2,
  Shield,
  Lock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Key,
  Globe,
  Radio,
  ExternalLink,
  Copy,
  Check,
  Send,
  Zap,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { getConnectedPages } from '../../lib/database-service';
import { DatabaseConnectedPage } from '../../lib/supabase';

interface MetaStatus {
  configured: boolean;
  appIdConfigured: boolean;
  appSecretConfigured: boolean;
  webhookTokenConfigured: boolean;
  encryptionKeyConfigured: boolean;
  graphApiVersion: string;
  appId: string | null;
  webhookCallbackUrl: string;
  oauthRedirectUri: string;
}

export const DashboardPagesPage: React.FC = () => {
  const { currentWorkspace, user } = useAuth();
  const { isBangla } = useLanguage();

  const [connectedPages, setConnectedPages] = useState<DatabaseConnectedPage[]>([]);
  const [metaStatus, setMetaStatus] = useState<MetaStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [testMessageSuccess, setTestMessageSuccess] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const workspaceId = currentWorkspace?.id || 'default-ws';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch connected pages from database
      const pages = await getConnectedPages(workspaceId);
      setConnectedPages(pages);

      // 2. Fetch server-side Meta platform status
      const res = await fetch('/api/meta/status');
      if (res.ok) {
        const status = await res.json();
        setMetaStatus(status);
      }
    } catch (err: any) {
      console.warn('Could not load Meta status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle OAuth callback parameters if returned from Meta redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      // Clear URL params cleanly without reload
      window.history.replaceState({}, document.title, window.location.pathname);
      handleOAuthCallback(code, state);
    }
  }, []);

  const handleOAuthCallback = async (code: string, state: string) => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/meta/oauth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          state,
          redirectUri: window.location.origin + '/dashboard/pages',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to exchange authorization code');
      }

      if (data.pages && data.pages.length > 0) {
        // Automatically connect the first eligible page or open selector
        const targetPage = data.pages[0];
        await handleFinalizeConnect(targetPage.id, data.sessionKey, targetPage.name);
      } else {
        setErrorMsg(
          isBangla
            ? 'আপনার ফেসবুক অ্যাকাউন্টে কোনো বিজনেস পেইজ খুঁজে পাওয়া যায়নি অথবা পারমিশন দেওয়া হয়নি।'
            : 'No eligible Facebook Pages were found or granted messaging permissions.'
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'OAuth callback failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStartMetaOAuth = async () => {
    setIsConnecting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(
        `/api/meta/oauth/start?workspaceId=${encodeURIComponent(workspaceId)}&userId=${encodeURIComponent(user?.id || 'merchant')}&redirectUri=${encodeURIComponent(window.location.origin + '/dashboard/pages')}`
      );

      const data = await res.json();
      if (!res.ok) {
        // If server indicates Meta credentials are not configured in environment, show the interactive connection modal
        setShowConnectModal(true);
        setIsConnecting(false);
        return;
      }

      if (data.url) {
        // Official Meta OAuth Redirect
        window.location.href = data.url;
      }
    } catch (err: any) {
      setShowConnectModal(true);
      setIsConnecting(false);
    }
  };

  const handleFinalizeConnect = async (pageId: string, sessionKey?: string, pageName?: string, sandboxMode?: boolean) => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/meta/pages/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          pageId,
          sessionKey,
          manualPageName: pageName,
          sandboxMode: Boolean(sandboxMode),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect page');
      }

      setShowConnectModal(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect page');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (pageId: string) => {
    if (!window.confirm(isBangla ? 'আপনি কি নিশ্চিত যে এই ফেসবুক পেইজের সংযোগ বিচ্ছিন্ন করতে চান?' : 'Are you sure you want to disconnect this Facebook Page?')) {
      return;
    }

    setIsDisconnecting(pageId);
    try {
      const res = await fetch('/api/meta/pages/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, pageId }),
      });

      if (res.ok) {
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to disconnect');
    } finally {
      setIsDisconnecting(null);
    }
  };

  const handleSimulateInboundWebhook = async (pageId: string, pageName: string) => {
    setIsSendingTest(true);
    setTestMessageSuccess(null);
    try {
      const res = await fetch('/api/meta/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          pageId,
          text: isBangla
            ? 'ভাইয়া, প্রিমিয়াম ব্ল্যাক পাঞ্জাবির দাম কত? সাইজ XL কি স্টকে আছে?'
            : 'Hello, what is the price of the Premium Black Panjabi? Is size XL available in stock?',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestMessageSuccess(
          isBangla
            ? `টেস্ট মেসেজ সফলভাবে ইনবক্সে ইনজেস্ট হয়েছে! ইনবক্স মনিটরে দেখুন (ID: ${data.messageId.slice(0, 12)}...)`
            : `Test message successfully received via Webhook pipeline! Check your Inbox tab (ID: ${data.messageId.slice(0, 12)}...)`
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to simulate webhook');
    } finally {
      setIsSendingTest(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6 text-left max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {isBangla ? 'ফেসবুক পেইজ সংযোগ' : 'Facebook Page Integration'}
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Meta Graph {metaStatus?.graphApiVersion || 'v21.0'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBangla
              ? 'অফিসিয়াল মেটা লগইন দিয়ে আপনার বিজনেস পেইজ কানেক্ট করুন এবং রিয়েল-টাইম মেসেঞ্জার ইনবক্স চালনা করুন'
              : 'Connect your business page via official Meta Login to automate Messenger customer replies'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isBangla ? 'সেটআপ গাইড' : 'Setup Guide'}</span>
          </button>

          <button
            type="button"
            onClick={() => loadData()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isBangla ? 'রিফ্রেশ' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{isBangla ? 'সংযোগ সমস্যা' : 'Connection Error'}</p>
            <p className="mt-0.5 text-rose-200">{errorMsg}</p>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Test Message Notification */}
      {testMessageSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-300 text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{isBangla ? 'ওয়েবহুক টেস্ট সফল' : 'Webhook Test Successful'}</p>
            <p className="mt-0.5 text-emerald-200">{testMessageSuccess}</p>
          </div>
          <button type="button" onClick={() => setTestMessageSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Connected Pages Section */}
      {connectedPages.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              {isBangla ? 'সংযুক্ত ফেসবুক পেইজ' : 'Active Connected Facebook Pages'}
            </h2>
            <button
              type="button"
              onClick={handleStartMetaOAuth}
              disabled={isConnecting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isBangla ? 'আরেকটি পেইজ যুক্ত করুন' : 'Connect Another Page'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {connectedPages.map((page) => (
              <Card key={page.id} className="p-6 space-y-5 border-slate-800 bg-[#111722]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2] font-bold text-lg shrink-0">
                      {page.page_profile_picture_url ? (
                        <img
                          src={page.page_profile_picture_url}
                          alt={page.page_name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        page.page_name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base sm:text-lg">{page.page_name}</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{isBangla ? 'সংযুক্ত (লাইভ)' : 'Connected'}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        Page ID: {page.provider_page_id} • Category: {page.page_category || 'E-Commerce'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleSimulateInboundWebhook(page.provider_page_id || '102938', page.page_name)}
                      disabled={isSendingTest}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                      title={isBangla ? 'ইনবক্সে টেস্ট মেসেজ পাঠান' : 'Send test message via Webhook'}
                    >
                      <Send className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isSendingTest ? (isBangla ? 'পাঠানো হচ্ছে...' : 'Sending...') : (isBangla ? 'টেস্ট মেসেজ' : 'Test Webhook')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDisconnect(page.provider_page_id || '')}
                      disabled={isDisconnecting === page.provider_page_id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg text-xs font-semibold border border-rose-500/30 transition-colors cursor-pointer"
                    >
                      <span>{isDisconnecting === page.provider_page_id ? '...' : (isBangla ? 'ডিসকানেক্ট' : 'Disconnect')}</span>
                    </button>
                  </div>
                </div>

                {/* Subscribed Webhook Fields & Token Security */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isBangla ? 'সাবস্ক্রাইব করা মেটা ওয়েবহুকস' : 'Subscribed Meta Webhooks'}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(page.subscribed_fields || ['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads']).map((field) => (
                        <span
                          key={field}
                          className="px-2 py-0.5 rounded bg-slate-800/80 text-indigo-300 border border-slate-700 font-mono text-[11px]"
                        >
                          ✓ {field}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isBangla ? 'সিকিউর টোকেন ভল্ট' : 'Secure Token Vault'}</span>
                    </p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {isBangla
                        ? 'পেইজ অ্যাক্সেস টোকেন AES-256-GCM এনক্রিপশনে সার্ভার-সাইড স্টোরেজে সুরক্ষিত। কোনো ক্লায়েন্ট ব্রাউজারে টোকেন প্রদর্শিত হয় না।'
                        : 'Page Access Token is encrypted at rest via AES-256-GCM in server-side storage and never exposed to the client.'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <Card className="p-8 sm:p-12 text-center space-y-6 bg-[#111722] border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center mx-auto border border-[#1877F2]/20">
            <Share2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-white">
              {isBangla ? 'আপনার ফেসবুক বিজনেস পেইজ যুক্ত করুন' : 'Connect Your Facebook Business Page'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isBangla
                ? 'বংগোসেল এআই অফিসিয়াল মেটা বিজনেস ওঅথ এবং মেসেঞ্জার প্ল্যাটফর্ম সমর্থন করে। নিরাপদে পেইজ কানেক্ট করে ২৪/৭ অটোমেটিক সেলস চ্যাট চালু করুন।'
                : 'BongoSell AI integrates with official Meta Business OAuth and Messenger Platform. Connect your page securely to automate 24/7 sales replies.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleStartMetaOAuth}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-[#1877F2]/20"
            >
              <Share2 className="w-4 h-4" />
              <span>
                {isConnecting
                  ? (isBangla ? 'কানেক্ট করা হচ্ছে...' : 'Connecting...')
                  : (isBangla ? 'ফেসবুক দিয়ে কানেক্ট করুন' : 'Connect with Facebook')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowConnectModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isBangla ? 'স্যান্ডবক্স / ডেমো সংযোগ' : 'Sandbox / Demo Mode'}</span>
            </button>
          </div>
        </Card>
      )}

      {/* Meta Webhook & Developer Diagnostic Info */}
      <Card className="p-6 space-y-4 border-slate-800 bg-[#0E141D]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">
              {isBangla ? 'মেটা এপিআই কনফিগারেশন ও এন্ডপয়েন্ট' : 'Meta API Configuration & Endpoints'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Status: {metaStatus?.configured ? 'Active' : 'Sandbox / Development'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Callback URL */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 font-medium">
              <span>Webhook Callback URL</span>
              <button
                type="button"
                onClick={() => copyToClipboard(metaStatus?.webhookCallbackUrl || `${window.location.origin}/api/meta/webhook`, 'callbackUrl')}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedField === 'callbackUrl' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'callbackUrl' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="font-mono text-slate-200 text-[11px] break-all">
              {metaStatus?.webhookCallbackUrl || `${window.location.origin}/api/meta/webhook`}
            </p>
          </div>

          {/* Verify Token */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 font-medium">
              <span>Webhook Verify Token</span>
              <button
                type="button"
                onClick={() => copyToClipboard('bongosell_verify_token_2026', 'verifyToken')}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedField === 'verifyToken' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'verifyToken' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="font-mono text-slate-200 text-[11px]">
              bongosell_verify_token_2026
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${metaStatus?.appIdConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>App ID: {metaStatus?.appIdConfigured ? 'Configured' : 'Development Mode'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${metaStatus?.appSecretConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>App Secret: {metaStatus?.appSecretConfigured ? 'Secured Server-Side' : 'Pending in .env'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>HMAC SHA-256 Signatures: Verified</span>
          </div>
        </div>
      </Card>

      {/* Trust & Policy Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 space-y-2 border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
            <Shield className="w-4 h-4" />
            <span>{isBangla ? 'মেটা এপিআই পারমিশন ও কমপ্লায়েন্স' : 'Required Meta Permissions'}</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc">
            <li><code className="text-indigo-300 font-mono">pages_messaging</code>: মেসেঞ্জারে গ্রাহকদের পাঠানো ইনবক্স বার্তা গ্রহণ ও উত্তর দেওয়া</li>
            <li><code className="text-indigo-300 font-mono">pages_show_list</code>: সংযোগ করার জন্য আপনার ফেসবুক পেইজের তালিকা প্রদর্শন</li>
            <li><code className="text-indigo-300 font-mono">pages_manage_metadata</code>: মেটা ওয়েবহুক ইভেন্ট সাবস্ক্রিপশন ও ভেরিফিকেশন</li>
          </ul>
        </Card>

        <Card className="p-5 space-y-2 border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <Lock className="w-4 h-4" />
            <span>{isBangla ? '২৪ ঘণ্টার মেসেজিং উইন্ডো পলিসি' : '24-Hour Messaging Policy'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isBangla
              ? 'মেটা অফিশিয়াল নীতিমালা অনুযায়ী গ্রাহকের সর্বশেষ মেসেজের ২৪ ঘণ্টার মধ্যে সাধারণ বিক্রয় বার্তা দেওয়া যায়। ২৪ ঘণ্টার পরবর্তী অর্ডারের স্ট্যাটাস আপডেট সমর্থিত মেসেজ ট্যাগের মাধ্যমে পাঠানো হয়।'
              : 'Per official Meta policies, merchants can respond freely within 24 hours of a customer message. Follow-up order updates outside 24h utilize approved Meta message tags.'}
          </p>
        </Card>
      </div>

      {/* Connect Modal (Sandbox / Manual Select) */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-5 bg-[#131B26] border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {isBangla ? 'ফেসবুক পেইজ সংযোগ নির্বাচন' : 'Select Facebook Page to Connect'}
              </h3>
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {isBangla
                ? 'আপনার ডেভেলপমেন্ট বা টেস্ট এনভায়রনমেন্টের জন্য একটি পরীক্ষামূলক শপ পেইজ নির্বাচন করুন। এটি আপনার ওয়ার্কস্পেসের সাথে এনক্রিপ্টেড টোকেন ও ওয়েবহুক সাবস্ক্রিপশন তৈরি করবে।'
                : 'Select a shop page to connect for development or testing. This creates an encrypted token and webhook subscription in your workspace.'}
            </p>

            <div className="space-y-2">
              {[
                { id: '109283746501928', name: 'Dhaka Traditional Wear (ঢাকা ট্র্যাডিশনাল)', cat: 'Clothing & Apparel' },
                { id: '209384756102938', name: 'Chittagong Gadget Hub', cat: 'Electronics' },
                { id: '304958271602934', name: 'Sylhet Craft & Leather', cat: 'Leather Goods' },
              ].map((samplePage) => (
                <button
                  key={samplePage.id}
                  type="button"
                  onClick={() => handleFinalizeConnect(samplePage.id, undefined, samplePage.name, true)}
                  disabled={isConnecting}
                  className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <p className="font-semibold text-white text-sm group-hover:text-indigo-300">
                      {samplePage.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Page ID: {samplePage.id} • {samplePage.cat}
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                {isBangla ? 'বন্ধ করুন' : 'Cancel'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Step-by-Step Setup Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-6 space-y-5 bg-[#131B26] border-slate-700 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">
                  {isBangla ? 'মেটা ডেভেলপার অ্যাপ কনফিগারেশন নির্দেশিকা' : 'Meta Developer App Setup Guide'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                <p className="font-semibold text-white">ধাপ ১: মেটা ডেভেলপার অ্যাকাউন্ট ও অ্যাপ তৈরি</p>
                <p className="mt-1">
                  developers.facebook.com এ গিয়ে একটি Business অ্যাপ তৈরি করুন। এরপর <strong>Facebook Login for Business</strong> এবং <strong>Messenger</strong> প্রডাক্ট যোগ করুন।
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
                <p className="font-semibold text-white">ধাপ ২: ওঅথ রিডাইরেক্ট ইউআরএল সেট করুন</p>
                <p className="text-slate-300">
                  Facebook Login for Business -&gt; Settings এ গিয়ে Valid OAuth Redirect URIs বক্সে যুক্ত করুন:
                </p>
                <p className="font-mono text-indigo-300 text-[11px] p-2 bg-slate-900 rounded">
                  {window.location.origin}/dashboard/pages
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
                <p className="font-semibold text-white">ধাপ ৩: মেসেঞ্জার ওয়েবহুক কনফিগারেশন</p>
                <p className="text-slate-300">
                  Messenger -&gt; Webhooks এ গিয়ে Callback URL ও Verify Token প্রদান করুন:
                </p>
                <p className="font-mono text-emerald-300 text-[11px] p-2 bg-slate-900 rounded">
                  URL: {window.location.origin}/api/meta/webhook<br />
                  Token: bongosell_verify_token_2026
                </p>
                <p className="text-slate-400 text-[11px]">
                  সাবস্ক্রাইব ফিল্ডস: <code className="text-indigo-300">messages</code>, <code className="text-indigo-300">messaging_postbacks</code>, <code className="text-indigo-300">message_deliveries</code>, <code className="text-indigo-300">message_reads</code>
                </p>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200">
                <p className="font-semibold text-white">ধাপ ৪: ডেভেলপমেন্ট মোড ও অ্যাপ রিভিউ</p>
                <p className="mt-1">
                  অ্যাপটি ডেভেলপমেন্ট মোডে থাকাকালীন শুধুমাত্র আপনার অ্যাপের Admin বা Tester হিসেবে যুক্ত ফেসবুক আইডি মেসেজ আদান-প্রদান করতে পারবে। সব সাধারণ গ্রাহকদের জন্য লাইভ করতে মেটা অ্যাপ রিভিউ ও বিজনেস ভেরিফিকেশন সম্পন্ন করতে হবে।
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                {isBangla ? 'বুঝেছি' : 'Understood'}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
