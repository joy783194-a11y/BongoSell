import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarding = true,
}) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">
          লোড হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন
        </p>
      </div>
    );
  }

  // Not authenticated -> redirect to login with safe return parameter
  if (!user) {
    const returnDestination = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${returnDestination}`} replace />;
  }

  // Authenticated but onboarding incomplete -> redirect to onboarding wizard
  if (requireOnboarding && profile && !profile.onboarding_completed && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
