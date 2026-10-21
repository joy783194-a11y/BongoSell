import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Share2,
  MessageSquare,
  Bot,
  ShoppingBag,
  Package,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Globe,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BrandLogo } from '../../components/common/BrandLogo';

export const DashboardLayout: React.FC = () => {
  const { user, profile, currentWorkspace, workspaces, signOut } = useAuth();
  const { isBangla, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', labelBn: 'ওভারভিউ', labelEn: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/pages', labelBn: 'ফেসবুক পেইজ', labelEn: 'Facebook Pages', icon: Share2 },
    { to: '/dashboard/inbox', labelBn: 'লাইভ ইনবক্স', labelEn: 'Live Inbox', icon: MessageSquare },
    { to: '/dashboard/ai-agent', labelBn: 'এআই এজেন্ট রুলস', labelEn: 'AI Agent Rules', icon: Bot },
    { to: '/dashboard/products', labelBn: 'প্রোডাক্ট ক্যাটালগ', labelEn: 'Products & Catalog', icon: ShoppingBag },
    { to: '/dashboard/orders', labelBn: 'অর্ডার কালেকশন', labelEn: 'Captured Orders', icon: Package },
    { to: '/dashboard/analytics', labelBn: 'ইনবক্স অ্যানালিটিক্স', labelEn: 'Analytics', icon: BarChart3 },
    { to: '/dashboard/billing', labelBn: 'বিলিং ও প্ল্যান', labelEn: 'Billing & Plan', icon: CreditCard },
    { to: '/dashboard/settings', labelBn: 'অ্যাকাউন্ট সেটিংস', labelEn: 'Account Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Merchant';
  const shopName = currentWorkspace?.name || profile?.business_name || 'My Shop';

  return (
    <div className="min-h-screen bg-[#0A0E15] text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0E131B]/95 backdrop-blur-md border-b border-slate-800/80 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <BrandLogo />

          {/* Active Workspace Tag */}
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
            <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-semibold text-slate-200 truncate max-w-[160px]">{shopName}</span>
          </div>
        </div>

        {/* Right Section: Language Toggle + Account Dropdown */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/70 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isBangla ? 'বাং / EN' : 'EN / বাং'}</span>
          </button>

          {/* Account Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white text-xs">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                  {displayName}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
                  {user?.email}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#131B26] border border-slate-700 shadow-2xl py-1.5 z-50 text-xs text-slate-200">
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="font-bold text-white truncate">{displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 font-medium">
                      {shopName}
                    </span>
                  </div>

                  <Link
                    to="/dashboard/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>{isBangla ? 'অ্যাকাউন্ট সেটিংস' : 'Account Settings'}</span>
                  </Link>

                  <Link
                    to="/dashboard/billing"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>{isBangla ? 'বিলিং ও প্ল্যান' : 'Billing & Subscription'}</span>
                  </Link>

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isBangla ? 'লগআউট' : 'Log Out'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <nav className="bg-[#131B26] border border-slate-800/80 rounded-2xl p-3 space-y-1 text-xs sm:text-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{isBangla ? item.labelBn : item.labelEn}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Support / Feedback box */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
            <span className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBangla ? 'সহায়তা ও ফিডব্যাক' : 'Merchant Support'}</span>
            </span>
            <p className="text-slate-400 leading-relaxed">
              {isBangla
                ? 'সরাসরি সহায়তার জন্য যোগাযোগ করুন: support@bongosell.ai'
                : 'Direct merchant support: support@bongosell.ai'}
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed top-0 bottom-0 left-0 w-72 bg-[#131B26] border-r border-slate-800 p-5 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <BrandLogo />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-400 py-1">
                <span>{isBangla ? 'শপ:' : 'Shop:'}</span>{' '}
                <strong className="text-white">{shopName}</strong>
              </div>

              <nav className="space-y-1 text-xs sm:text-sm">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                          isActive
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{isBangla ? item.labelBn : item.labelEn}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-red-400 hover:bg-red-950/30 text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isBangla ? 'লগআউট' : 'Log Out'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Main Viewport */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
