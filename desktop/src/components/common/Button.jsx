import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold tracking-tight rounded-full select-none cursor-pointer transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#090D16]';

  const variants = {
    // Brand Primary (Signal Teal - WCAG AAA 8.5:1 contrast with dark text)
    primary:
      'bg-[#14B8A6] hover:bg-[#0D9488] active:bg-[#0F766E] text-[#090D16] shadow-sm shadow-[#14B8A6]/25 border border-[#14B8A6]/40 focus-visible:ring-[#14B8A6]',
    
    // Offline Mesh Accent (Beacon Amber)
    mesh:
      'bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-[#090D16] shadow-sm shadow-[#F59E0B]/25 border border-[#F59E0B]/40 focus-visible:ring-[#F59E0B]',

    // Academy / CodeHub Accent (Indigo)
    academy:
      'bg-[#6366F1] hover:bg-[#4F46E5] active:bg-[#4338CA] text-white shadow-sm shadow-[#6366F1]/25 border border-[#6366F1]/40 focus-visible:ring-[#6366F1]',

    // Secondary / Elevated Surface
    secondary:
      'bg-[#1E293B] hover:bg-[#334155] active:bg-[#0F172A] text-[#F8FAFC] border border-[#334155] shadow-sm focus-visible:ring-[#94A3B8]',

    // Outline / Border Divider
    outline:
      'bg-transparent hover:bg-[#1E293B]/70 active:bg-[#1E293B] text-[#F8FAFC] border border-[#334155] focus-visible:ring-[#14B8A6]',

    // Ghost
    ghost:
      'bg-transparent hover:bg-[#1E293B]/60 active:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] focus-visible:ring-[#14B8A6]',

    // Danger / Destructive
    danger:
      'bg-[#EF4444]/15 hover:bg-[#EF4444] active:bg-[#DC2626] text-[#EF4444] hover:text-white border border-[#EF4444]/30 focus-visible:ring-[#EF4444]',

    // Legacy accent alias -> maps to primary Signal Teal
    accent:
      'bg-gradient-to-r from-[#14B8A6] to-[#06B6D4] hover:from-[#0D9488] hover:to-[#0891B2] text-[#090D16] shadow-md shadow-[#14B8A6]/25 border border-[#14B8A6]/40',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1 gap-1',
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-4.5 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
