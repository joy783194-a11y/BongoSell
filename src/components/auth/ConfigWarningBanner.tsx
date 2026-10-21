import React, { useState } from 'react';
import { AlertTriangle, Terminal, X, ExternalLink, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const ConfigWarningBanner: React.FC = () => {
  const { isConfigured } = useAuth();
  const { isBangla } = useLanguage();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isConfigured) return null;

  return (
    <>
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-3.5 mb-6 text-xs text-amber-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">
                {isBangla ? 'Supabase কনফিগারেশন বাকি রয়েছে:' : 'Supabase Configuration Required:'}
              </span>{' '}
              <span className="text-amber-200/90">
                {isBangla
                  ? 'প্রোডাকশন অথেন্টিকেশন ও ডাটাবেস চালুর জন্য .env ফাইলে VITE_SUPABASE_URL ও VITE_SUPABASE_ANON_KEY সেট করুন।'
                  : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to connect live Supabase Auth and database.'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="px-3 py-1.5 bg-amber-900/60 hover:bg-amber-800/80 text-amber-100 rounded-lg text-[11px] font-semibold border border-amber-700/60 transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isBangla ? 'সেটআপ গাইড দেখুন' : 'View Setup Steps'}</span>
          </button>
        </div>
      </div>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="bg-[#131B26] border border-slate-700 max-w-xl w-full rounded-2xl p-6 sm:p-8 space-y-5 text-left relative my-8 shadow-2xl text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pr-6">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                Phase 2 Backend Integration
              </span>
              <h3 className="text-xl font-bold text-white">
                Supabase Auth & Database Setup
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <p>
                To enable live email/password sign-up, email verification, and multi-tenant PostgreSQL workspace storage:
              </p>

              <ol className="list-decimal pl-5 space-y-2 text-slate-300">
                <li>
                  Create a free project at{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 underline inline-flex items-center gap-1"
                  >
                    supabase.com <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  Run the SQL migration in Supabase SQL Editor from{' '}
                  <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded font-mono">
                    supabase/schema.sql
                  </code>
                </li>
                <li>
                  Add your credentials to your project's <code className="text-indigo-300 font-mono">.env</code>:
                  <div className="mt-2 p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 space-y-1">
                    <div>VITE_SUPABASE_URL="https://your-id.supabase.co"</div>
                    <div>VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."</div>
                  </div>
                </li>
                <li>
                  Restart the development server (<code className="font-mono text-indigo-300">npm run dev</code>).
                </li>
              </ol>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                Full documentation and redirect URL configuration are detailed in{' '}
                <strong className="text-slate-300">supabase/SETUP.md</strong>.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                {isBangla ? 'বুঝেছি' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
