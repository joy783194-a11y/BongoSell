import React, { useState } from 'react';
import { ArrowRight, Clock, User, X, BookOpen, Sparkles } from 'lucide-react';
import { SITE_CONFIG, BlogPost } from '../config/site';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components/common/Card';

export const BlogPage: React.FC = () => {
  const { isBangla } = useLanguage();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div className="py-12 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isBangla ? 'এফ-কমার্স গাইড ও কৌশল' : 'F-Commerce Strategy & Insights'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight [text-wrap:balance]">
          {isBangla
            ? 'ফেসবুক পেইজ সেলস বৃদ্ধির কার্যকর নির্দেশিকা'
            : 'Actionable Playbooks for Bangladeshi Facebook Sellers'}
        </h1>
        <p className="text-base text-slate-300 leading-relaxed [text-wrap:balance]">
          {isBangla
            ? 'কাস্টমার ড্রপ-অফ কমানো, ক্যাশ অন ডেলিভারি রিটার্ন নিয়ন্ত্রণ এবং এআই অটোমেশনের সর্বোত্তম ব্যবহার সম্পর্কিত নির্দেশনামূলক ব্লগ।'
            : 'Educational guides and practical strategies for scaling customer conversion on Facebook Messenger.'}
        </p>

        <div className="pt-2 text-xs text-slate-400">
          <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-md">
            {isBangla
              ? 'ডেমো এডুকেশনাল কনটেন্ট প্রিভিউ · কোনো কাল্পনিক কাস্টমার কেস স্টাডি নেই'
              : 'Demonstration & Educational Content · No fabricated testimonials'}
          </span>
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SITE_CONFIG.blogPosts.map((post: BlogPost) => (
          <Card
            key={post.id}
            hoverEffect
            className="flex flex-col justify-between overflow-hidden p-0 group cursor-pointer"
            onClick={() => setSelectedPost(post)}
          >
            {/* Image Thumbnail with fallback */}
            <div className="relative aspect-[4/3] bg-slate-800 overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback container
                  const target = e.currentTarget;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute top-3 left-3 bg-[#0E131B]/80 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-medium text-indigo-300 border border-slate-700/60">
                {post.category}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Clean Unboxed Metadata */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{post.date}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {post.readTime}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-400 transition-colors leading-snug">
                  {isBangla ? post.titleBn : post.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {isBangla ? post.summaryBn : post.summary}
                </p>
              </div>

              {/* Author & Read Link */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 font-bold text-[10px]">
                    {post.author.slice(0, 1)}
                  </div>
                  <span>{post.author}</span>
                </div>

                <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>{isBangla ? 'পড়ুন' : 'Read'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Full Article Reader Modal (Active Handler, zero dead clicks) */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-[#131B26] border border-slate-700 max-w-2xl w-full rounded-2xl p-6 sm:p-8 space-y-6 relative my-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-3 pr-8">
              <div className="flex items-center gap-2 text-xs text-indigo-400">
                <span>{selectedPost.category}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedPost.readTime}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {isBangla ? selectedPost.titleBn : selectedPost.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                <span>By {selectedPost.author}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedPost.authorRole}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedPost.date}</span>
              </div>
            </div>

            {/* Modal Image */}
            <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-800">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Modal Body */}
            <div className="text-sm sm:text-base text-slate-200 leading-relaxed space-y-4 whitespace-pre-line font-sans border-t border-slate-800 pt-4">
              {isBangla ? selectedPost.contentBn : selectedPost.contentEn}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                {isBangla ? 'বন্ধ করুন' : 'Close Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
