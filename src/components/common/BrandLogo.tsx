import React from 'react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../../config/site';

interface BrandLogoProps {
  className?: string;
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', showTagline = false }) => {
  return (
    <Link to="/" className={`flex items-center gap-2.5 group whitespace-nowrap shrink-0 ${className}`}>
      {/* Original Geometric AI + Chat Icon */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white"
        >
          {/* Chat bubble outline */}
          <path
            d="M7 17L3 20V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V15C21 16.1046 20.1046 17 19 17H7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Bengali letter shape inspired spark/dot accents */}
          <circle cx="8.5" cy="10" r="1.3" fill="currentColor" />
          <circle cx="12" cy="10" r="1.3" fill="currentColor" />
          <circle cx="15.5" cy="10" r="1.3" fill="currentColor" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
          {SITE_CONFIG.brandWordmark}
          <span className="text-indigo-400 font-extrabold">{SITE_CONFIG.brandAccent}</span>
        </span>
        {showTagline && (
          <span className="text-[11px] text-slate-400 font-normal">F-Commerce AI Sales Assistant</span>
        )}
      </div>
    </Link>
  );
};
