import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, ShieldCheck, UserCheck, Sparkles, MessageCircle, RefreshCw } from 'lucide-react';
import { SITE_CONFIG, ChatScenario } from '../../config/site';
import { useLanguage } from '../../context/LanguageContext';

export const MessengerDemo: React.FC = () => {
  const { isBangla } = useLanguage();
  const scenarios = SITE_CONFIG.demoScenarios;
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  interface DemoChatMessage {
    sender: 'customer' | 'ai' | 'system';
    text: string;
    time: string;
    orderCard?: {
      product: string;
      price: string;
      delivery: string;
      customerName: string;
      phone: string;
      address: string;
      payment: string;
    };
  }

  const [displayedMessagesCount, setDisplayedMessagesCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [userAddedMessages, setUserAddedMessages] = useState<DemoChatMessage[]>([]);

  const currentScenario = scenarios[selectedScenarioIndex];

  // Animate message revelation smoothly on scenario change
  useEffect(() => {
    setDisplayedMessagesCount(1);
    setUserAddedMessages([]);
    setIsTyping(true);

    const timer1 = setTimeout(() => {
      setDisplayedMessagesCount(2);
      setIsTyping(false);
    }, 600);

    const timer2 = setTimeout(() => {
      setIsTyping(true);
    }, 1200);

    const timer3 = setTimeout(() => {
      setDisplayedMessagesCount(4);
      setIsTyping(false);
    }, 1900);

    const timer4 = setTimeout(() => {
      setDisplayedMessagesCount(currentScenario.messages.length);
      setIsTyping(false);
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [selectedScenarioIndex, currentScenario.messages.length]);

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const newMsg = {
      sender: 'customer' as const,
      text: customInput,
      time: 'Just now',
    };

    setUserAddedMessages((prev) => [...prev, newMsg]);
    setCustomInput('');
    setIsTyping(true);

    // AI responsive simulation in colloquial Bangla
    setTimeout(() => {
      let aiReply = 'জি অবশ্যই! আপনার প্রশ্নটি পেয়েছি। আমাদের পেইজের নিয়ম অনুযায়ী সকল প্রোডাক্ট ১০০% অথেনটিক এবং দ্রুত ক্যাশ অন ডেলিভারি দেওয়া হয়। অর্ডার কনফার্ম করতে নাম ও মোবাইল নাম্বার দিন।';
      if (customInput.toLowerCase().includes('dam') || customInput.toLowerCase().includes('price') || customInput.includes('দাম')) {
        aiReply = 'আমাদের নির্ধারিত সেলার রেট অনুযায়ী পণ্যের ফিক্সড প্রাইস আপডেট রয়েছে। আপনি কি ঢাকার ভেতরে ডেলিভারি নিতে চান নাকি বাইরে?';
      } else if (customInput.toLowerCase().includes('dhaka') || customInput.includes('ঢাকা')) {
        aiReply = 'ঢাকার ভেতরে ডেলিভারি চার্জ মাত্র ৭০ টাকা এবং ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ক্যাশ অন ডেলিভারি পৌঁছে যাবে!';
      }
      setUserAddedMessages((prev) => [
        ...prev,
        {
          sender: 'ai' as const,
          text: aiReply,
          time: 'Just now',
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const allVisibleMessages = [
    ...currentScenario.messages.slice(0, displayedMessagesCount),
    ...userAddedMessages,
  ];

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl bg-[#131B26] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col text-slate-100 font-sans">
      {/* Top Demo Disclaimer Ribbon */}
      <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
        <span className="flex items-center gap-1.5 font-medium text-indigo-300">
          <Sparkles className="w-3.5 h-3.5" />
          {isBangla ? 'ইন্টারেক্টিভ মেসেঞ্জার প্রিভিউ' : 'Interactive Messenger Simulation'}
        </span>
        <span className="text-slate-400">
          {isBangla ? 'সিমুলেটেড ডেমো ডাটা' : 'Demo Mode (No Real Account)'}
        </span>
      </div>

      {/* Facebook Messenger Header */}
      <div className="bg-[#1A2332] px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-sm shadow-inner">
              {currentScenario.name.slice(0, 1)}
            </div>
            {/* Real status indicator representing bot active */}
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1A2332]"
              title="AI Assistant Active"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm text-white leading-tight">
                {isBangla ? currentScenario.businessTypeBn : currentScenario.businessType}
              </h3>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            </div>
            <p className="text-[11px] text-indigo-300 flex items-center gap-1">
              <span>{isBangla ? 'বংগোসেল এআই স্বয়ংক্রিয় অ্যাসিস্ট্যান্ট' : 'BongoSell AI Assistant Active'}</span>
            </p>
          </div>
        </div>

        {/* Demo Takeover button */}
        <button
          onClick={() => {
            alert(
              isBangla
                ? 'হিউম্যান টেকওভার মোড: বাস্তব সংস্করণে অ্যাডমিন মেসেজ টাইপ করলে এআই স্বয়ংক্রিয়ভাবে পজ হয়ে যায়।'
                : 'Human Takeover Mode: In production, once the page admin types a message, AI pauses automatically.'
            );
          }}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700/60 transition-colors"
          title="Simulate Admin Takeover"
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{isBangla ? 'টেকওভার' : 'Takeover'}</span>
        </button>
      </div>

      {/* Scenario Switcher Tabs */}
      <div className="bg-[#0E1520] px-3 py-2 flex items-center gap-1.5 border-b border-slate-800/80 overflow-x-auto text-xs">
        <span className="text-[11px] text-slate-400 whitespace-nowrap pl-1 pr-1 font-medium">
          {isBangla ? 'শপ টাইপ:' : 'Niche:'}
        </span>
        {scenarios.map((sc, idx) => (
          <button
            key={sc.id}
            onClick={() => setSelectedScenarioIndex(idx)}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors font-medium cursor-pointer ${
              selectedScenarioIndex === idx
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {isBangla ? sc.nameBn : sc.name}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="p-4 space-y-3.5 flex-1 min-h-[340px] max-h-[380px] overflow-y-auto bg-[#0E131B]/70">
        {allVisibleMessages.map((msg, idx) => {
          const isCustomer = msg.sender === 'customer';

          return (
            <div
              key={idx}
              className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} space-y-1 animate-fadeIn`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed ${
                  isCustomer
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-[#1C2636] text-slate-200 border border-slate-700/60 rounded-bl-xs'
                }`}
              >
                <p>{msg.text}</p>

                {/* Structured Order Summary Card */}
                {msg.orderCard && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-700/80 space-y-1.5 bg-[#141C28] p-2.5 rounded-lg text-left">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300">
                      <span>{isBangla ? 'অর্ডার সামারি' : 'Order Summary'}</span>
                      <span className="text-emerald-400 font-medium">
                        {isBangla ? 'ড্রাফট প্রস্তুত' : 'Ready for Dispatch'}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-300">
                      <p>
                        <strong className="text-slate-400">{isBangla ? 'পণ্য:' : 'Item:'}</strong>{' '}
                        {msg.orderCard.product}
                      </p>
                      <p>
                        <strong className="text-slate-400">{isBangla ? 'মূল্য:' : 'Total:'}</strong>{' '}
                        <span className="text-white font-semibold">{msg.orderCard.price}</span>
                      </p>
                      <p>
                        <strong className="text-slate-400">{isBangla ? 'গ্রাহক:' : 'Customer:'}</strong>{' '}
                        {msg.orderCard.customerName} ({msg.orderCard.phone})
                      </p>
                      <p>
                        <strong className="text-slate-400">{isBangla ? 'ঠিকানা:' : 'Address:'}</strong>{' '}
                        {msg.orderCard.address}
                      </p>
                      <p>
                        <strong className="text-slate-400">{isBangla ? 'পেমেন্ট:' : 'Payment:'}</strong>{' '}
                        {msg.orderCard.payment}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>{isBangla ? 'অটোমেটিক কুরিয়ার রেডি' : 'Courier Ready'}</span>
                      <span className="text-indigo-300 font-medium">{SITE_CONFIG.brandName}</span>
                    </div>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-400 px-1 font-mono">{msg.time}</span>
            </div>
          );
        })}

        {/* Live Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-1.5 bg-[#1C2636] border border-slate-700/60 rounded-2xl px-3 py-2 text-slate-400 w-fit">
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
            <span className="text-[11px] ml-1 text-slate-400">
              {isBangla ? 'এআই লিখছে...' : 'AI is typing...'}
            </span>
          </div>
        )}
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="bg-[#101722] px-3 py-2 border-t border-slate-800/70 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-400 whitespace-nowrap">{isBangla ? 'টেস্ট প্রশ্ন:' : 'Try:'}</span>
        <button
          onClick={() => setCustomInput('Dhakar baire delivery charge koto?')}
          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs whitespace-nowrap transition-colors"
        >
          ঢাকার বাইরে ডেলিভারি কত?
        </button>
        <button
          onClick={() => setCustomInput('Koto diner moddhe delivery pabo?')}
          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs whitespace-nowrap transition-colors"
        >
          কবে পাবো?
        </button>
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={handleSendCustom}
        className="bg-[#1A2332] p-2.5 flex items-center gap-2 border-t border-slate-800"
      >
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder={
            isBangla
              ? 'বাংলা বা বাংলিশে মেসেজ লিখে টেস্ট করুন...'
              : 'Type in Bangla or Banglish to test AI...'
          }
          className="flex-1 bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="p-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer shrink-0"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
