import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  UserCheck,
  CheckCircle2,
  Search,
  Send,
  Clock,
  Radio,
  RefreshCw,
  Sparkles,
  Check,
  Truck,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import {
  getConversations,
  getMessages,
  sendMessage,
  toggleHumanTakeover,
} from '../../lib/database-service';
import { DatabaseConversation, DatabaseMessage } from '../../lib/supabase';

export const DashboardInboxPage: React.FC = () => {
  const { currentWorkspace } = useAuth();
  const { isBangla } = useLanguage();

  const [conversations, setConversations] = useState<DatabaseConversation[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>('');
  const [messages, setMessages] = useState<DatabaseMessage[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'pending' | 'resolved' | 'takeover'>('all');
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [search, setSearch] = useState('');
  const [sendStatusMsg, setSendStatusMsg] = useState<string | null>(null);

  const workspaceId = currentWorkspace?.id || 'default-ws';

  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    const data = await getConversations(workspaceId);
    setConversations(data);
    if (data.length > 0 && !selectedThreadId) {
      setSelectedThreadId(data[0].id);
    }
    if (!silent) setIsLoading(false);
  }, [workspaceId, selectedThreadId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when selected thread changes, and poll every 4 seconds for live webhooks
  useEffect(() => {
    if (!selectedThreadId) return;
    let isCurrent = true;

    async function loadThreadMessages() {
      const msgs = await getMessages(selectedThreadId);
      if (isCurrent) {
        setMessages(msgs);
      }
    }

    loadThreadMessages();

    // 4-second polling interval for live incoming Meta Messenger webhook messages
    const interval = setInterval(() => {
      loadThreadMessages();
      loadConversations(true);
    }, 4000);

    return () => {
      isCurrent = false;
      clearInterval(interval);
    };
  }, [selectedThreadId, loadConversations]);

  const activeThread = conversations.find((c) => c.id === selectedThreadId) || conversations[0];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    setIsSending(true);
    setSendStatusMsg(null);
    const textToSend = replyText.trim();
    setReplyText('');

    // 1. If conversation has Facebook customer_external_id (PSID), dispatch to server-side Meta Send API
    let metaMessageId: string | undefined;
    if (activeThread.customer_external_id) {
      try {
        const sendRes = await fetch('/api/meta/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspaceId,
            pageId: activeThread.connected_page_id || '102938475610293',
            recipientPSID: activeThread.customer_external_id,
            text: textToSend,
            conversationId: activeThread.id,
          }),
        });
        const sendData = await sendRes.json();
        if (sendData?.messageId) {
          metaMessageId = sendData.messageId;
          setSendStatusMsg(isBangla ? 'মেসেঞ্জারে সফলভাবে পাঠানো হয়েছে' : 'Sent via Messenger Send API');
        }
      } catch (metaErr) {
        console.warn('[Meta Send API Outbound Warning]:', metaErr);
      }
    }

    // 2. Persist in database
    const { data: newMsg, error } = await sendMessage(
      workspaceId,
      activeThread.id,
      textToSend,
      'human'
    );

    setIsSending(false);

    if (error) {
      alert(error);
      setReplyText(textToSend);
    } else if (newMsg) {
      setMessages((prev) => [...prev, newMsg]);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeThread.id ? { ...c, last_message_at: newMsg.created_at } : c))
      );
    }
  };

  const handleToggleTakeover = async () => {
    if (!activeThread) return;
    const newTakeoverState = !activeThread.human_takeover_enabled;
    const { error } = await toggleHumanTakeover(activeThread.id, newTakeoverState);

    if (error) {
      alert(error);
    } else {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeThread.id ? { ...c, human_takeover_enabled: newTakeoverState } : c))
      );
    }
  };

  const insertQuickTemplate = (template: string) => {
    setReplyText((prev) => (prev ? `${prev} ${template}` : template));
  };

  const filteredThreads = conversations.filter((t) => {
    const matchesSearch =
      t.customer_display_name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'takeover') return t.human_takeover_enabled;
    return t.status === activeFilter;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {isBangla ? 'লাইভ ইনবক্স ও মেসেঞ্জার মনিটর' : 'Live Inbox & Messenger Monitor'}
            </h1>
            <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isBangla ? 'লাইভ পুলিং' : 'Live Sync'}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBangla
              ? 'মেটা মেসেঞ্জার প্ল্যাটফর্ম থেকে আসা গ্রাহকদের রিয়েল-টাইম বার্তা, এআই অটো-রিপ্লাই এবং হিউম্যান টেকওভার'
              : 'Real-time customer messages from Meta Messenger Platform with AI auto-reply and human takeover'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadConversations()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isBangla ? 'রিফ্রেশ' : 'Refresh'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 min-h-[600px]">
        {/* Left Column: Conversation Thread Selector */}
        <div className="lg:col-span-4 bg-[#131B26] border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isBangla ? 'গ্রাহক বা বার্তা খুঁজুন...' : 'Search customer or message...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0E131B] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg text-xs overflow-x-auto">
              {[
                { id: 'all', labelBn: 'সকল', labelEn: 'All' },
                { id: 'open', labelBn: 'চলমান', labelEn: 'Active' },
                { id: 'pending', labelBn: 'অপেক্ষমাণ', labelEn: 'Pending' },
                { id: 'resolved', labelBn: 'অর্ডার সম্পন্ন', labelEn: 'Resolved' },
                { id: 'takeover', labelBn: 'টেকওভার', labelEn: 'Takeover' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                    activeFilter === f.id
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isBangla ? f.labelBn : f.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Threads list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 max-h-[520px]">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                {isBangla ? 'চ্যাট থ্রেড লোড হচ্ছে...' : 'Loading threads...'}
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                {isBangla ? 'কোনো কনভার্সন থ্রেড নেই' : 'No conversations found'}
              </div>
            ) : (
              filteredThreads.map((th) => {
                const isSelected = th.id === selectedThreadId;
                const formattedTime = new Date(th.last_message_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setSelectedThreadId(th.id)}
                    className={`w-full p-4 text-left transition-colors cursor-pointer flex flex-col space-y-1.5 ${
                      isSelected ? 'bg-slate-800/90 border-l-4 border-indigo-500' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs sm:text-sm">
                          {th.customer_display_name}
                        </span>
                        {th.customer_external_id && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/30">
                            Messenger
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{formattedTime}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 truncate max-w-[180px]">
                        ID: {th.customer_external_id ? `PSID...${th.customer_external_id.slice(-4)}` : th.id.slice(0, 8)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {th.human_takeover_enabled && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800">
                            Human
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                            th.status === 'resolved'
                              ? 'bg-emerald-950/60 text-emerald-300'
                              : th.status === 'pending'
                              ? 'bg-amber-950/60 text-amber-300'
                              : 'bg-indigo-950/60 text-indigo-300'
                          }`}
                        >
                          {th.status}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Stream */}
        <div className="lg:col-span-7 bg-[#131B26] border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          {activeThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#162130]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm sm:text-base">{activeThread.customer_display_name}</h3>
                    {activeThread.customer_external_id && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20 font-semibold">
                        PSID: {activeThread.customer_external_id}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span className="font-mono text-[11px]">
                      {activeThread.external_conversation_id || 'Meta Messenger Platform'}
                    </span>
                    <span>•</span>
                    <span
                      className={`text-[10px] font-semibold ${
                        activeThread.human_takeover_enabled ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {activeThread.human_takeover_enabled
                        ? isBangla
                          ? 'হিউম্যান মোড (এআই পজ)'
                          : 'Human Mode (AI Paused)'
                        : isBangla
                        ? 'এআই অটোপাইলট সক্রিয়'
                        : 'AI Autopilot Active'}
                    </span>
                  </div>
                </div>

                {/* Takeover Toggle Button */}
                <button
                  type="button"
                  onClick={handleToggleTakeover}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    activeThread.human_takeover_enabled
                      ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-800 text-emerald-200'
                      : 'bg-amber-950/80 hover:bg-amber-900 border-amber-800 text-amber-200'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>
                    {activeThread.human_takeover_enabled
                      ? isBangla
                        ? 'পুনরায় এআই চালু করুন'
                        : 'Resume AI'
                      : isBangla
                      ? 'হাতে নিয়ন্ত্রণ নিন'
                      : 'Take Over'}
                  </span>
                </button>
              </div>

              {/* Message Thread Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0E131B]/60 text-xs sm:text-sm max-h-[420px]">
                {messages.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    {isBangla ? 'এই কথোপকথনে কোনো মেসেজ রেকর্ড নেই।' : 'No messages in this thread.'}
                  </div>
                ) : (
                  messages.map((m) => {
                    const isInbound = m.direction === 'inbound';
                    const timeStr = new Date(m.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col space-y-1 ${
                          isInbound ? 'items-start' : 'items-end'
                        }`}
                      >
                        <div
                          className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                            isInbound
                              ? 'bg-[#1C2636] text-slate-100 rounded-bl-xs border border-slate-700/60'
                              : m.sender_type === 'human'
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-violet-700 text-white rounded-br-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                          <span>{timeStr}</span>
                          <span>•</span>
                          <span>
                            {isInbound
                              ? activeThread.customer_display_name
                              : m.sender_type === 'human'
                              ? isBangla
                                ? 'আপনি (মার্চেন্ট)'
                                : 'Admin (Human)'
                              : 'BongoSell AI'}
                          </span>
                          {!isInbound && (
                            <span className="text-emerald-400 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" />
                              <span>{m.delivery_status || 'delivered'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Response Action Chips */}
              <div className="px-4 py-2 bg-[#121924] border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="text-slate-400 whitespace-nowrap">{isBangla ? 'কুইক রিপ্লাই:' : 'Quick Templates:'}</span>
                <button
                  type="button"
                  onClick={() => insertQuickTemplate('ঢাকার ভিতরে ডেলিভারি চার্জ ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা।')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap cursor-pointer"
                >
                  🚚 {isBangla ? 'ডেলিভারি চার্জ' : 'Delivery Charge'}
                </button>
                <button
                  type="button"
                  onClick={() => insertQuickTemplate('আপনার নাম, মোবাইল নাম্বার এবং সম্পূর্ণ ঠিকানা পাঠালে অর্ডার কনফার্ম করে দিচ্ছি।')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap cursor-pointer"
                >
                  📝 {isBangla ? 'অর্ডার ডিটেইলস' : 'Order Info'}
                </button>
                <button
                  type="button"
                  onClick={() => insertQuickTemplate('প্রোডাক্টটি আমাদের স্টকে অ্যাভেইলএবল আছে। ক্যাশ অন ডেলিভারিতে নিতে পারবেন।')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap cursor-pointer"
                >
                  ✅ {isBangla ? 'স্টক কনফার্ম' : 'In Stock'}
                </button>
              </div>

              {/* Dispatch Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-800 bg-[#162130] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    isBangla
                      ? 'মেসেঞ্জারে সরাসরি রিপ্লাই পাঠান...'
                      : 'Type message to send directly to customer in Messenger...'
                  }
                  className="flex-1 bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? (isBangla ? 'পাঠানো হচ্ছে...' : 'Sending...') : (isBangla ? 'সেন্ড' : 'Send')}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 text-xs">
              {isBangla ? 'বামপাশের তালিকা থেকে একটি কথোপকথন নির্বাচন করুন।' : 'Select a thread to view.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
