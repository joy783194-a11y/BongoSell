import React from 'react';
import { Clock, MessageSquareCode, ShieldAlert, CheckSquare, Users } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site';
import { useLanguage } from '../../context/LanguageContext';

export const ValueStrip: React.FC = () => {
  const { isBangla } = useLanguage();

  const benefits = [
    {
      icon: Clock,
      title: isBangla ? '২৪/৭ ইনস্ট্যান্ট রিপ্লাই' : '24/7 Zero Latency',
      desc: isBangla
        ? 'রাত ২টায় কিংবা লাইভ চলাকালীন—কাস্টমার পাবেন সেকেন্ডের মধ্যে উত্তর।'
        : 'Respond instantly even at 2 AM or during viral Facebook Live drops.',
    },
    {
      icon: MessageSquareCode,
      title: isBangla ? 'বাংলা ও বাংলিশ বোঝে' : 'Colloquial Bangla NLP',
      desc: isBangla
        ? '"dam koto?", "size ache?" এর মতো সাধারণ মেসেজ সহজে বোঝে।'
        : 'Accurately parses Romanized Banglish & phonetic shopping queries.',
    },
    {
      icon: ShieldAlert,
      title: isBangla ? 'সেলার প্রাইস প্রটেকশন' : 'Seller Margin Guard',
      desc: isBangla
        ? 'আপনার সেট করা রেটের বাইরে অযাচিত দামাদামিতে এআই ডিসকাউন্ট দেবে না।'
        : 'Guarantees AI never undercuts minimum product prices or discount caps.',
    },
    {
      icon: CheckSquare,
      title: isBangla ? 'অর্ডার ডাটা কালেকশন' : 'Structured Order Intake',
      desc: isBangla
        ? 'নাম, ১১ ডিজিটের মোবাইল নম্বর ও সম্পূর্ণ ডেলিভারি ঠিকানা সংগ্রহ করে।'
        : 'Gathers clean 11-digit phone numbers and complete delivery addresses.',
    },
    {
      icon: Users,
      title: isBangla ? 'হিউম্যান কো-পাইলট' : 'Admin Intervene Switch',
      desc: isBangla
        ? 'প্রয়োজন হলে এক ক্লিকে পেইজ অ্যাডমিন নিজে চ্যাটের দায়িত্ব নিতে পারেন।'
        : 'Admins can pause AI and take over threads seamlessly at any time.',
    },
  ];

  return (
    <section className="py-12 bg-[#0B1017] border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="flex flex-col space-y-2 p-4 rounded-xl bg-[#131B26]/60 border border-slate-800/60"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-white">{b.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
