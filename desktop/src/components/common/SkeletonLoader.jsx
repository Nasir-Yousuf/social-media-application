import React from 'react';

export const SkeletonLoader = ({
  variant = 'text', // 'text' | 'avatar' | 'rect' | 'card'
  width,
  height,
  className = '',
  count = 1,
}) => {
  const baseShimmer =
    'relative overflow-hidden bg-[#1E293B]/70 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[#334155]/30 before:to-transparent';

  const variantStyles = {
    text: 'h-4 w-full rounded-md',
    avatar: 'rounded-full shrink-0',
    rect: 'rounded-xl',
    card: 'p-4 rounded-2xl border border-[#334155] space-y-3 bg-[#111827]',
  };

  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className="space-y-4">
        {items.map((_, i) => (
          <div key={i} className={`${variantStyles.card} ${className}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${baseShimmer}`} />
              <div className="space-y-1.5 flex-1">
                <div className={`h-3.5 w-1/3 rounded ${baseShimmer}`} />
                <div className={`h-3 w-1/4 rounded ${baseShimmer}`} />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className={`h-3.5 w-full rounded ${baseShimmer}`} />
              <div className={`h-3.5 w-5/6 rounded ${baseShimmer}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((_, i) => (
        <div
          key={i}
          style={{ width, height }}
          className={`${baseShimmer} ${variantStyles[variant] || variantStyles.text} ${className}`}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
