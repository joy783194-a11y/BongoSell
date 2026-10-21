import React from 'react';
import { MessageSquareText, Layers, ShieldCheck, ShoppingBag, UserCheck, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../../config/site';
import { useLanguage } from '../../context/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import { Card } from '../common/Card';

const iconMap: Record<string, React.ElementType> = {
  MessageSquareText,
  Layers,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
  BarChart3,
};

export const FeaturesOverview: React.FC = () => {
  const { isBangla } = useLanguage();

  return (
    <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        kicker={isBangla ? 'মূল ফিচারসমূহ' : 'Core Capabilities'}
        title={
          isBangla
            ? 'এফ-কমার্স বিক্রির প্রতিটি ধাপ অটোমেশনের শক্তিশালী টুলস'
            : 'Engineered Specifically for Bangladeshi Facebook Commerce'
        }
        subtitle={
          isBangla
            ? 'সাধারণ রোবট চ্যাটবট নয়, বরং প্রতিটি অনলাইন শপের নিজস্ব প্রোডাক্ট নিয়ম, মার্জিন ও ডেলিভারি পলিসি মেনে চলা এক দক্ষ বিক্রয় সহযোগী।'
            : 'Not a generic keyword bot, but a context-aware sales co-pilot trained on Bangladeshi buying patterns and your store rules.'
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SITE_CONFIG.featuresList.map((feat) => {
          const Icon = iconMap[feat.iconName] || MessageSquareText;

          return (
            <Card key={feat.id} hoverEffect className="flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mb-2.5">
                  {isBangla ? feat.titleBn : feat.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {isBangla ? feat.descriptionBn : feat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-xs text-indigo-300/90 font-medium">
                {isBangla ? feat.highlightBn : feat.highlight}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/features"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <span>{isBangla ? 'সকল ফিচার ও লাইভ রুল সিমুলেটর দেখুন' : 'Explore Detailed Feature Breakdown & Simulators'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};
