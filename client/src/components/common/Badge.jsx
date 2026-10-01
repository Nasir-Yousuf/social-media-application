import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'sm', className = '' }) => {
  const variantStyles = {
    neutral: 'bg-[var(--color-cf-surface)] text-[var(--color-cf-text-muted)] border-[var(--color-cf-border)]',
    accent: 'bg-[var(--color-cf-accent-soft)] text-[var(--color-cf-accent)] border-[var(--color-cf-accent)]/20 font-semibold',
    admin: 'bg-[var(--color-cf-amber-soft)] text-[var(--color-cf-amber)] border-[var(--color-cf-amber)]/25 font-bold',
    announcement: 'bg-[var(--color-cf-amber-soft)] text-[var(--color-cf-amber)] border-[var(--color-cf-amber)]/25 font-bold',
    success: 'bg-[var(--color-cf-success-soft)] text-[var(--color-cf-success)] border-[var(--color-cf-success)]/25 font-semibold',
    danger: 'bg-[var(--color-cf-danger-soft)] text-[var(--color-cf-danger)] border-[var(--color-cf-danger)]/25 font-semibold',
    chronological: 'bg-[var(--color-cf-accent-soft)] text-[var(--color-cf-accent)] border-[var(--color-cf-accent)]/15 font-mono font-semibold',
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
