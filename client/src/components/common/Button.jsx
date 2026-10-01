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
    'relative inline-flex items-center justify-center font-bold cf-btn-transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-full cf-focus-ring';

  const variants = {
    primary:
      'bg-[var(--color-cf-accent)] hover:bg-[var(--color-cf-accent-hover)] text-white border-0 shadow-sm',
    secondary:
      'bg-white text-black hover:bg-neutral-200 border-0 shadow-sm dark:bg-white dark:text-black dark:hover:bg-neutral-200',
    outline:
      'bg-transparent hover:bg-white/10 text-[var(--color-cf-text)] border border-[var(--color-cf-border)]',
    ghost:
      'bg-transparent hover:bg-[var(--color-cf-elevated)] text-[var(--color-cf-text-secondary)] border-0',
    danger:
      'bg-[var(--color-cf-danger-soft)] hover:bg-[var(--color-cf-danger)] text-[var(--color-cf-danger)] hover:text-white border border-[var(--color-cf-danger)]/30',
  };

  const sizes = {
    xs: 'text-xs px-3 py-1 gap-1',
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
