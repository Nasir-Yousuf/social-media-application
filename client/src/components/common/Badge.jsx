import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'sm', className = '' }) => {
  const variantStyles = {
    neutral:
      'bg-[#1E293B] text-[#94A3B8] border-[#334155]',
    accent:
      'bg-[#14B8A6]/15 text-[#14B8A6] border-[#14B8A6]/30 font-semibold',
    mesh:
      'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30 font-semibold',
    academy:
      'bg-[#6366F1]/15 text-[#818CF8] border-[#6366F1]/30 font-semibold',
    admin:
      'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30 font-bold',
    announcement:
      'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30 font-bold',
    success:
      'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30 font-semibold',
    danger:
      'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30 font-semibold',
    chronological:
      'bg-[#14B8A6]/15 text-[#14B8A6] border-[#14B8A6]/30 font-mono font-semibold',
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
