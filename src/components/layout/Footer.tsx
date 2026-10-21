import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  const { isBangla } = useLanguage();

  return (
    <footer className="bg-[#0B0F16] border-t border-slate-800/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1: Brand Info & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo />
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {isBangla
                ? 'বাংলাদেশের ফেসবুক পেইজ ও অনলাইন শপগুলোর জন্য তৈরি স্পেশালাইজড বাংলা এআই সেলস অ্যাসিস্ট্যান্ট। ২৪/৭ কাস্টমার রিপ্লাই ও স্বয়ংক্রিয় অর্ডার ম্যানেজমেন্ট।'
                : 'AI-powered Facebook Messenger sales assistant built specifically for Bangladeshi F-commerce businesses and online retailers.'}
            </p>

            <div className="pt-2 flex flex-col space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{SITE_CONFIG.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{SITE_CONFIG.supportEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{SITE_CONFIG.supportPhone}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              {isBangla ? 'প্রোডাক্ট' : 'Product'}
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  {isBangla ? 'সকল ফিচার' : 'Features Overview'}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  {isBangla ? 'কীভাবে কাজ করে' : 'How It Works'}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  {isBangla ? 'সাবস্ক্রিপশন প্ল্যান' : 'Pricing Plans'}
                </Link>
              </li>
              <li>
                <Link to="/#demo" className="hover:text-white transition-colors">
                  {isBangla ? 'মেসেঞ্জার লাইভ ডেমো' : 'Messenger Demo'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              {isBangla ? 'রিসোর্স' : 'Resources'}
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  {isBangla ? 'F-Commerce ব্লগ' : 'F-Commerce Blog'}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  {isBangla ? 'প্রশ্নোত্তর (FAQ)' : 'Frequently Asked Questions'}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works#rules" className="hover:text-white transition-colors">
                  {isBangla ? 'সেলার প্রাইসিং গাইড' : 'Pricing Rules Guide'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Notice */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              {isBangla ? 'আইনি ও নীতিমালা' : 'Legal & Trust'}
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  {isBangla ? 'প্রাইভেসি পলিসি (খসড়া)' : 'Privacy Policy (Draft)'}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  {isBangla ? 'ব্যবহারের শর্তাবলী (খসড়া)' : 'Terms of Service (Draft)'}
                </Link>
              </li>
              <li>
                <span className="text-slate-500 text-xs block leading-relaxed mt-2">
                  {isBangla
                    ? 'মেটা/ফেসবুকের কোনো অফিশিয়াল পার্টনারশিপ দাবি করা হচ্ছে না।'
                    : 'Independent tool, not affiliated with Meta Platforms, Inc.'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Phase 1 Status Banner */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <p className="flex items-center gap-2">
              <span className="text-indigo-400 font-medium">Phase 1 Architecture Preview:</span>
              <span>Facebook Meta Graph integration and live payment gateway scheduled for Phase 2.</span>
            </p>
          </div>
          <div>
            <p>
              &copy; {new Date().getFullYear()} {SITE_CONFIG.brandName}. {isBangla ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
