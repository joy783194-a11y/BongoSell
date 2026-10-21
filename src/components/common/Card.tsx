import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-[#131B26] border border-slate-800/80 rounded-xl p-6 transition-all duration-200 ${
        hoverEffect ? 'hover:border-slate-700 hover:bg-[#162130]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
