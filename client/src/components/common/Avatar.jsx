import React from 'react';

const sizeMap = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

export const Avatar = ({ src, alt = 'Avatar', name = '', size = 'md', className = '', showRoleBadge = false, role = 'student' }) => {
  const sizeClasses = sizeMap[size] || sizeMap.md;
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${name || 'student'}`;

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <img
        src={src || defaultAvatar}
        alt={alt}
        className={`${sizeClasses} rounded-full object-cover ring-2 ring-white/10 bg-zinc-800 transition-transform duration-200 hover:scale-105`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = defaultAvatar;
        }}
      />
      {showRoleBadge && role === 'admin' && (
        <span
          title="Course Instructor / Admin"
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-indigo-500 ring-2 ring-zinc-950 rounded-full flex items-center justify-center text-[8px] text-white font-bold"
        >
          ★
        </span>
      )}
    </div>
  );
};

export default Avatar;
