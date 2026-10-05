import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'sm', className = '' }) => {
  const variantStyles = {
    neutral:
      'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700/60',
    accent:
      'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200/80 dark:border-sky-800/60 font-semibold',
    admin:
      'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/60 font-bold',
    announcement:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 font-bold',
    success:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60 font-semibold',
    danger:
      'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/60 font-semibold',
    chronological:
      'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200/80 dark:border-sky-800/50 font-mono font-semibold',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 tracking-tight',
    sm: 'text-xs px-2.5 py-0.5 tracking-tight',
    md: 'text-sm px-3 py-1 tracking-tight',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border shadow-2xs ${variantStyles[variant] || variantStyles.neutral} ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
