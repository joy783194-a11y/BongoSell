import React from 'react';

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  kicker,
  title,
  subtitle,
  align = 'center',
  className = '',
}) => {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col mb-12 max-w-3xl ${alignClass} ${align === 'center' ? 'mx-auto' : ''} ${className}`}>
      {kicker && (
        <span className="text-xs font-semibold tracking-wider text-indigo-400 mb-2 uppercase select-none">
          {kicker}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3.5 text-base text-slate-400 leading-relaxed max-w-2xl [text-wrap:balance]">
          {subtitle}
        </p>
      )}
    </div>
  );
};
