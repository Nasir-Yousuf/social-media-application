import React from 'react';

export const Card = ({
  children,
  variant = 'surface', // 'surface' | 'elevated' | 'mesh' | 'outline'
  interactive = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200 overflow-hidden';

  const variants = {
    surface:
      'bg-[#111827] border border-[#334155] text-[#F8FAFC]',
    elevated:
      'bg-[#1E293B] border border-[#334155] shadow-md text-[#F8FAFC]',
    mesh:
      'bg-[#1E293B] border border-[#F59E0B]/40 shadow-sm shadow-[#F59E0B]/10 text-[#F8FAFC]',
    outline:
      'bg-transparent border border-[#334155] text-[#F8FAFC]',
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:border-[#14B8A6]/60 hover:shadow-md hover:shadow-[#14B8A6]/10 active:scale-[0.99]'
    : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.surface} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
