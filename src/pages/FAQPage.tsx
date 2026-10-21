import React, { useState } from 'react';
import { Search, HelpCircle, MessageSquare } from 'lucide-react';
import { SITE_CONFIG, FAQItem } from '../config/site';
import { useLanguage } from '../context/LanguageContext';
import { FAQAccordion } from '../components/home/FAQAccordion';

export const FAQPage: React.FC = () => {
  const { isBangla } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="py-12 lg:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          {isBangla ? 'সহায়তা কেন্দ্র' : 'Help & Knowledge Center'}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight [text-wrap:balance]">
          {isBangla
            ? 'সচরাচর জিজ্ঞাসিত প্রশ্ন ও উত্তর'
            : 'Frequently Asked Questions & Support'}
        </h1>
        <p className="text-base text-slate-300 leading-relaxed max-w-2xl mx-auto [text-wrap:balance]">
          {isBangla
            ? 'বংগোসেল এআই এর কার্যপ্রণালী, বাংলা ভাষা প্রসেসিং, সাবস্ক্রিপশন এবং ফেসবুক পেইজ কানেকশন সংক্রান্ত বিস্তারিত তথ্য।'
            : 'Clear answers on AI natural language processing, setup guidelines, pricing rules, and security.'}
        </p>

        {/* Search input */}
        <div className="max-w-md mx-auto pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isBangla
                  ? 'আপনার প্রশ্ন লিখে সার্চ করুন...'
                  : 'Search questions or keywords...'
              }
              className="w-full bg-[#131B26] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Accordion with Categories */}
      <FAQAccordion showCategoryFilter={true} />
    </div>
  );
};
