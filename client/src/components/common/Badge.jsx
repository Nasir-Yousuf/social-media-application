import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'sm', className = '' }) => {
  const variantStyles = {
    neutral: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
    admin: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    announcement: 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-semibold',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    course: 'bg-sky-500/15 text-sky-400 border-sky-500/30 font-medium',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${variantStyles[variant] || variantStyles.neutral} ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
