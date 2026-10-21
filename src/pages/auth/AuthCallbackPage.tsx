import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, refreshSession } = useAuth();
  const { isBangla } = useLanguage();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function handleAuthCallback() {
      try {
        // Exchange code/tokens
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          if (active) setErrorMsg(error.message);
          return;
        }

        // Check if this was a password recovery callback
        const hash = window.location.hash || '';
        if (hash.includes('type=recovery')) {
          navigate('/reset-password', { replace: true });
          return;
        }

        if (data.session) {
          await refreshSession();
          // Determine next destination
          if (profile && !profile.onboarding_completed) {
            navigate('/onboarding', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          // If no session found in callback
          navigate('/login', { replace: true });
        }
      } catch (err: any) {
        if (active) setErrorMsg(err.message || 'Authentication callback failed');
      }
    }

    handleAuthCallback();

    return () => {
      active = false;
    };
  }, [navigate, profile, refreshSession]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4 text-center">
      {errorMsg ? (
        <div className="max-w-md p-6 rounded-2xl bg-[#131B26] border border-red-800/80 space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <h2 className="text-base font-bold text-white">
            {isBangla ? 'ভেরিফিকেশনে সমস্যা হয়েছে' : 'Authentication Callback Error'}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">{errorMsg}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
          >
            {isBangla ? 'লগইন পেইজে যান' : 'Go to Login'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-white">
            {isBangla ? 'অ্যাকাউন্ট ভেরিফাই করা হচ্ছে...' : 'Verifying your credentials...'}
          </p>
          <p className="text-xs text-slate-400">
            {isBangla ? 'দয়া করে অপেক্ষা করুন' : 'Please wait while we redirect you'}
          </p>
        </div>
      )}
    </div>
  );
};
