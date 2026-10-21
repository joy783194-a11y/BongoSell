import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, LogIn } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage, isBangla } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0E131B]/95 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single clean line) */}
        <div className="flex items-center shrink-0">
          <BrandLogo />
        </div>

        {/* Zone 2: Navigation Links (Clean text links with hover styling) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          {SITE_CONFIG.navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                  isActive
                    ? 'text-white border-indigo-500 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 border-transparent hover:border-slate-700'
                }`
              }
            >
              {isBangla ? link.labelBn : link.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Primary Action & Controls (Language switcher + CTA button) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* Language Selector UI */}
          <button
            onClick={toggleLanguage}
            title={isBangla ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-md border border-slate-700/70 transition-colors whitespace-nowrap"
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isBangla ? 'বাং / EN' : 'EN / বাং'}</span>
          </button>

          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <span>{isBangla ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                {isBangla ? 'লগইন' : 'Log In'}
              </Link>

              <Link
                to="/signup"
                className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
              >
                {isBangla ? 'ফ্রি শুরু করুন' : 'Get Started'}
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-300 bg-slate-800 rounded border border-slate-700"
            aria-label="Toggle language"
          >
            <Globe className="w-3 h-3 text-indigo-400" />
            <span>{isBangla ? 'বাং' : 'EN'}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0E131B] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {SITE_CONFIG.navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-indigo-950/60 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                {isBangla ? link.labelBn : link.label}
              </NavLink>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={closeMobileMenu}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4 text-slate-400" />
              <span>{isBangla ? 'লগইন করুন' : 'Log In'}</span>
            </Link>

            <Link
              to="/signup"
              onClick={closeMobileMenu}
              className="w-full flex items-center justify-center py-2 px-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              <span>{isBangla ? 'ফ্রি শুরু করুন' : 'Get Started Free'}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
