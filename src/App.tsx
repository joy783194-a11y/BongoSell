import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Marketing Pages
import { HomePage } from './pages/HomePage';
import { FeaturesPage } from './pages/FeaturesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { PricingPage } from './pages/PricingPage';
import { FAQPage } from './pages/FAQPage';
import { BlogPage } from './pages/BlogPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

// Authentication Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { AuthCallbackPage } from './pages/auth/AuthCallbackPage';

// Onboarding Wizard
import { OnboardingPage } from './pages/onboarding/OnboardingPage';

// Protected Dashboard Suite
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { DashboardOverviewPage } from './pages/dashboard/DashboardOverviewPage';
import { DashboardPagesPage } from './pages/dashboard/DashboardPagesPage';
import { DashboardInboxPage } from './pages/dashboard/DashboardInboxPage';
import { DashboardAgentPage } from './pages/dashboard/DashboardAgentPage';
import { DashboardProductsPage } from './pages/dashboard/DashboardProductsPage';
import { DashboardOrdersPage } from './pages/dashboard/DashboardOrdersPage';
import { DashboardAnalyticsPage } from './pages/dashboard/DashboardAnalyticsPage';
import { DashboardBillingPage } from './pages/dashboard/DashboardBillingPage';
import { DashboardSettingsPage } from './pages/dashboard/DashboardSettingsPage';

// Scroll to top helper on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Layout for Public & Marketing Pages (with Navbar and Footer)
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0E131B] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Marketing Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
            </Route>

            {/* Onboarding Wizard (Protected, requireOnboarding=false to prevent loop) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <div className="min-h-screen bg-[#0E131B] text-slate-100 flex flex-col">
                    <Outlet />
                  </div>
                </ProtectedRoute>
              }
            >
              <Route index element={<OnboardingPage />} />
            </Route>

            {/* Protected SaaS Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireOnboarding={true}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverviewPage />} />
              <Route path="pages" element={<DashboardPagesPage />} />
              <Route path="inbox" element={<DashboardInboxPage />} />
              <Route path="ai-agent" element={<DashboardAgentPage />} />
              <Route path="products" element={<DashboardProductsPage />} />
              <Route path="orders" element={<DashboardOrdersPage />} />
              <Route path="analytics" element={<DashboardAnalyticsPage />} />
              <Route path="billing" element={<DashboardBillingPage />} />
              <Route path="settings" element={<DashboardSettingsPage />} />
            </Route>

            {/* Fallback to Home */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
