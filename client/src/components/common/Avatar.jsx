import React from 'react';
import { FacultyBadge } from './ClearfeedIcons';

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

// Generate vibrant initials color from name (Twitter style)
const getInitialsColor = (name = '') => {
  const twitterColors = [
    '#1d9bf0', // twitter blue
    '#00ba7c', // twitter green
    '#f91880', // twitter pink
    '#ffd700', // gold
    '#7856ff', // purple
    '#ff7a00', // orange
    '#00bcd4', // cyan
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return twitterColors[Math.abs(hash) % twitterColors.length];
};

const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const Avatar = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  className = '',
  showRoleBadge = false,
  role = 'student',
}) => {
  const sizeClasses = sizeMap[size] || sizeMap.md;
  const initials = getInitials(name);
  const bgColor = getInitialsColor(name);

  // Use DiceBear as fallback URL avatar
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'user')}&backgroundColor=1d9bf0,00ba7c,7856ff,f91880&textColor=ffffff&fontSize=40`;

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses} rounded-full object-cover ring-1 ring-[var(--color-cf-border)] dark:ring-[var(--color-cfd-border)] transition-opacity duration-200 hover:opacity-90`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultAvatar;
          }}
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-full flex items-center justify-center font-sans font-bold text-white ring-1 ring-[var(--color-cf-border)] dark:ring-[var(--color-cfd-border)]`}
          style={{ backgroundColor: bgColor }}
          title={name}
        >
          {initials || '?'}
        </div>
      )}
      {showRoleBadge && role === 'admin' && (
        <span
          title="Faculty"
          className="absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-[var(--color-cf-bg)] dark:ring-[var(--color-cfd-bg)]"
        >
          <FacultyBadge className="w-4 h-4 text-[var(--color-cf-amber)] dark:text-[var(--color-cfd-amber)]" />
        </span>
      )}
    </div>
  );
};

export default Avatar;
