import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG, FAQItem } from '../../config/site';
import { useLanguage } from '../../context/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';

interface FAQAccordionProps {
  limit?: number;
  showCategoryFilter?: boolean;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ limit, showCategoryFilter = false }) => {
  const { isBangla } = useLanguage();
  const [openId, setOpenId] = useState<string | null>(SITE_CONFIG.faqList[0]?.id || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFaqs = SITE_CONFIG.faqList
    .filter((f) => (selectedCategory === 'all' ? true : f.category === selectedCategory))
    .slice(0, limit || SITE_CONFIG.faqList.length);

  return (
    <section className="py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        kicker={isBangla ? 'সাধারণ জিজ্ঞাসা' : 'FAQ'}
        title={
          isBangla
            ? 'বংগোসেল এআই নিয়ে সাধারণ প্রশ্নোত্তর'
            : 'Frequently Asked Questions'
        }
        subtitle={
          isBangla
            ? 'আপনার শপের ফেসবুক পেইজে এআই সেটআপ এবং কার্যপদ্ধতি নিয়ে যা জানা জরুরি।'
            : 'Everything you need to know about setting up and automating your Facebook shop.'
        }
      />

      {showCategoryFilter && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'all', label: isBangla ? 'সকল প্রশ্ন' : 'All' },
            { id: 'ai', label: isBangla ? 'এআই ও ভাষা' : 'AI & Language' },
            { id: 'fcommerce', label: isBangla ? 'পেইজ ও অর্ডার' : 'Page & Orders' },
            { id: 'billing', label: isBangla ? 'বিলিং ও প্ল্যান' : 'Billing & Plans' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filteredFaqs.map((faq: FAQItem) => {
          const isOpen = openId === faq.id;

          return (
            <div
              key={faq.id}
              className="bg-[#131B26] border border-slate-800/80 rounded-xl overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                aria-expanded={isOpen}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span className="text-sm sm:text-base font-semibold text-white">
                  {isBangla ? faq.questionBn : faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-indigo-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/40">
                  <p>{isBangla ? faq.answerBn : faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-white">
              {isBangla ? 'আরো কোনো জিজ্ঞাসা আছে?' : 'Have more questions?'}
            </h4>
            <p className="text-xs text-slate-400">
              {isBangla
                ? 'আমাদের সাপোর্ট টিম সরাসরি আপনাকে সাহায্য করতে প্রস্তুত।'
                : 'Our local support team in Dhaka is happy to assist you.'}
            </p>
          </div>
        </div>

        <Link
          to="/signup"
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 whitespace-nowrap"
        >
          {isBangla ? 'সাপোর্টের সাথে যোগাযোগ' : 'Contact Support'}
        </Link>
      </div>
    </section>
  );
};
